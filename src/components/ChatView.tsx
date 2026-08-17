import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import Peer, { MediaConnection } from 'peerjs';
import Pusher from 'pusher-js';
import * as Ably from 'ably';
import { db, checkIsQuotaExhausted } from '../lib/firebase';
import { Usuario } from '../types';
import UserAvatar from './UserAvatar';
import {
  MessageSquare,
  Hash,
  Send,
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Paperclip,
  Smile,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  X,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Radio,
  Globe,
  Zap,
  Settings,
  Info,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  UserCheck,
  ArrowLeft
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. "c_general" or "dm_u1_u2"
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  createdAt?: number;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyToId?: string;
  isSystem?: boolean;
}

// Global Pusher & Ably Clients for Failover (Environment configurable with seamless failover)
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || "a550429481c13c39f9a6";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "sa1";
const ABLY_KEY = import.meta.env.VITE_ABLY_API_KEY || "m2MFEg.B7JOLQ:u_MtYkbldvUScXPtRmsnN7MglKkVGlxJquINjmlVsOo";

let pusherClient: Pusher | null = null;
try {
  if (PUSHER_KEY) {
    pusherClient = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
  }
} catch (e) {
  console.warn('Pusher client setup notice:', e);
}

let ablyClient: Ably.Realtime | null = null;
try {
  if (ABLY_KEY) {
    ablyClient = new Ably.Realtime({ key: ABLY_KEY });
  }
} catch (e) {
  console.warn('Ably client setup notice:', e);
}

export function getDMChannelId(userAId: string, userBId: string): string {
  const cleanA = (userAId || '').toString().trim().toLowerCase();
  const cleanB = (userBId || '').toString().trim().toLowerCase();
  const ids = [cleanA, cleanB].sort();
  return `dm_${ids[0]}_${ids[1]}`;
}

export function sortMessages(msgs: ChatMessage[]): ChatMessage[] {
  return [...msgs].sort((a, b) => {
    const timeA = a.createdAt || (a.timestamp ? Date.parse(`1970-01-01T${a.timestamp}:00Z`) || 0 : 0);
    const timeB = b.createdAt || (b.timestamp ? Date.parse(`1970-01-01T${b.timestamp}:00Z`) || 0 : 0);
    return timeA - timeB;
  });
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  isGroup: boolean;
  members?: string[]; // user IDs
  unreadCount?: number;
}

export interface ChatViewProps {
  loggedUser: Usuario;
  comerciais: Usuario[];
  onLogOperation?: (tipo: string, modulo: string, item: string, descricao: string) => void;
  onAddNotification?: (title: string, text: string, type?: 'success' | 'info' | 'warn') => void;
  onNavigateTab?: (tabId: string) => void;
  activeTab?: string;
}

// Web Audio API Ringtone Synthesizer
function playRingTone(): () => void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    let isRinging = true;

    const playChime = () => {
      if (!isRinging || ctx.state === 'closed') return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.setValueAtTime(480, ctx.currentTime); // tone pair

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    };

    playChime();
    const interval = setInterval(() => {
      if (isRinging) playChime();
    }, 2200);

    return () => {
      isRinging = false;
      clearInterval(interval);
      try { ctx.close(); } catch (e) {}
    };
  } catch (e) {
    return () => {};
  }
}

// Web Audio API Incoming Message Chime
function playNotificationPing(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    setTimeout(() => { try { ctx.close(); } catch {} }, 300);
  } catch (e) {}
}

export default function ChatView({ loggedUser, comerciais, onLogOperation, onAddNotification, onNavigateTab, activeTab }: ChatViewProps) {
  // Presence status
  const [userStatus, setUserStatus] = useState<'online' | 'ausente' | 'ocupado'>('online');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial channels
  const defaultChannels: ChatChannel[] = [
    { id: 'c_geral', name: 'equipa-geral-gpa', description: 'Canal geral da equipa comercial GPA Angola', isGroup: true, unreadCount: 0 },
    { id: 'c_propostas', name: 'vendas-e-propostas', description: 'Acompanhamento de grandes propostas e metas', isGroup: true, unreadCount: 1 },
    { id: 'c_direcao', name: 'direcao-comercial', description: 'Alinhamento estratégico com a administração', isGroup: true, unreadCount: 0 },
  ];

  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    try {
      const saved = localStorage.getItem('gpa_chat_channels');
      return saved ? JSON.parse(saved) : defaultChannels;
    } catch {
      return defaultChannels;
    }
  });

  const [activeChannelId, setActiveChannelId] = useState<string>('c_geral');
  const [activeDMUser, setActiveDMUser] = useState<Usuario | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);

  // Initial seed messages
  const seedMessages: ChatMessage[] = [
    {
      id: 'm_1',
      channelId: 'c_geral',
      senderId: 'u_admin',
      senderName: 'Administração GPA',
      text: 'Bem-vindos ao Chat Interno GPA Angola! Aqui podemos alinhar visitas, metas e efetuar chamadas de áudio e vídeo HD.',
      timestamp: '08:30',
      reactions: { '🚀': ['u_admin'] }
    },
    {
      id: 'm_2',
      channelId: 'c_geral',
      senderId: comerciais[0]?.id || 'u_1',
      senderName: comerciais[0]?.nome || 'Comercial GPA',
      text: 'Excelente iniciativa! Já atualizei o relatório e os mapas de visitas de hoje no CRM.',
      timestamp: '09:15'
    },
    {
      id: 'm_3',
      channelId: 'c_propostas',
      senderId: 'u_admin',
      senderName: 'Helena IA / GPA',
      text: 'Lembrete: A meta quinzenal de Julho/Agosto requer validação do relatório de propostas aprovadas.',
      timestamp: '10:00'
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gpa_chat_messages');
      return saved ? JSON.parse(saved) : seedMessages;
    } catch {
      return seedMessages;
    }
  });

  // Message input
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{ type: 'image' | 'file'; url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calls & Real-time Signaling
  const [activeCall, setActiveCall] = useState<{
    callId?: string;
    isOpen: boolean;
    type: 'audio' | 'video';
    callerName: string;
    status: 'calling' | 'connected';
    duration: number;
    isMuted: boolean;
    isCameraOff: boolean;
    isFullscreen: boolean;
  } | null>(null);

  // Incoming Call signal for receiver
  const [incomingCallSignal, setIncomingCallSignal] = useState<{
    callId: string;
    callerId: string;
    callerName: string;
    callerFoto?: string;
    type: 'audio' | 'video';
    channelId: string;
  } | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const activeMediaCallRef = useRef<MediaConnection | null>(null);

  const handledCallIdsRef = useRef<Set<string>>(new Set());
  const activeCallRef = useRef(activeCall);
  activeCallRef.current = activeCall;

  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);

  const [myPeerId, setMyPeerId] = useState<string>('');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);
  const [showCPaaSModal, setShowCPaaSModal] = useState<boolean>(false);

  // Audio Note / Voice Message Recorder State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setAttachmentPreview({
            type: 'file',
            url: base64Url,
            name: `Mensagem_de_Audio_${new Date().toLocaleTimeString('pt-PT').replace(/:/g, '-')}.webm`
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setIsRecordingAudio(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) {
      alert('Não foi possível aceder ao microfone. Verifique se o microfone está conectado e permitido no seu navegador.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Unified Call Signal Processors to prevent duplicated rings/modal pops
  const processIncomingCallSignal = (sig: any) => {
    if (!sig || !sig.callId) return;
    if (handledCallIdsRef.current.has(sig.callId)) return;
    if (activeCallRef.current) return;

    const isForMe = sig.targetUserId === loggedUser.id || (!sig.targetUserId && sig.senderId !== loggedUser.id);
    if (isForMe && sig.senderId !== loggedUser.id) {
      setIncomingCallSignal(sig);
      if (ringStopRef.current) ringStopRef.current();
      ringStopRef.current = playRingTone();
      if (onAddNotification) {
        onAddNotification(
          '📞 Chamada de Entrada!',
          `${sig.callerName || 'Um colega'} está a ligar-lhe (${sig.type === 'video' ? 'Vídeo' : 'Voz'}).`,
          'warn'
        );
      }
    }
  };

  const processAcceptCallSignal = (sig: any) => {
    if (ringStopRef.current) ringStopRef.current();
    setIncomingCallSignal(null);
    setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
    }, 1000);
  };

  const processEndOrRejectCallSignal = (sig: any) => {
    if (sig?.callId) handledCallIdsRef.current.add(sig.callId);
    if (ringStopRef.current) ringStopRef.current();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (mediaStreamRef.current) {
      try { mediaStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      mediaStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      try { remoteStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      remoteStreamRef.current = null;
    }
    setLocalStreamState(null);
    setRemoteStreamState(null);
    setActiveCall(null);
    setIncomingCallSignal(null);
  };

  // Initialize WebRTC CPaaS Media Engine with Global STUN/TURN Servers via PeerJS
  useEffect(() => {
    let peerInstance: Peer | null = null;
    const cleanUserId = loggedUser.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const customPeerId = `gpa_crm_${cleanUserId}`;

    try {
      peerInstance = new Peer(customPeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            },
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelayproject',
              credential: 'openrelayproject'
            }
          ]
        },
        debug: 1
      });

      peerRef.current = peerInstance;

      peerInstance.on('open', (id) => {
        setMyPeerId(id);
        setPeerConnected(true);
      });

      peerInstance.on('connection', (conn) => {
        conn.on('data', (data: any) => {
          if (!data) return;
          if (data.type === 'P2P_NEW_MESSAGE') {
            const sm = data.payload;
            setMessages(prev => {
              if (!prev.some(m => m.id === sm.id)) {
                if (sm.senderId !== loggedUser.id) playNotificationPing();
                return sortMessages([...prev, sm]);
              }
              return prev;
            });
          } else if (data.type === 'P2P_CALL_SIGNAL') {
            const sig = data.payload;
            if (sig.type === 'INCOMING_CALL') processIncomingCallSignal(sig);
            else if (sig.type === 'ACCEPT_CALL') processAcceptCallSignal(sig);
            else if (sig.type === 'REJECT_CALL' || sig.type === 'END_CALL') processEndOrRejectCallSignal(sig);
          }
        });
      });

      peerInstance.on('call', (incomingCall) => {
        activeMediaCallRef.current = incomingCall;

        incomingCall.on('stream', (remoteStream) => {
          remoteStreamRef.current = remoteStream;
          setRemoteStreamState(remoteStream);
        });

        // FIX: Se o utilizador já tiver o microfone/câmara ligado (ex: é o Caller mas o Receiver fez uma contra-chamada por delay no sinal), atendemos automaticamente!
        if (mediaStreamRef.current) {
          incomingCall.answer(mediaStreamRef.current);
        }
      });

      peerInstance.on('error', (err) => {
        console.warn('WebRTC PeerJS connection status:', err);
        setPeerConnected(false);
      });
    } catch (err) {
      console.error('Failed to initialize PeerJS:', err);
    }

    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
    };
  }, [loggedUser.id]);

  // Ensure Media Streams (audio/video) stay attached to HTML elements on mobile and desktop
  useEffect(() => {
    if (activeCall) {
      const rStream = remoteStreamState || remoteStreamRef.current;
      const lStream = localStreamState || mediaStreamRef.current;

      if (rStream) {
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== rStream) {
          remoteVideoRef.current.srcObject = rStream;
          remoteVideoRef.current.play().catch(() => {});
        }
        if (remoteAudioRef.current && remoteAudioRef.current.srcObject !== rStream) {
          remoteAudioRef.current.srcObject = rStream;
          remoteAudioRef.current.play().catch(() => {});
        }
      }

      if (lStream && localVideoRef.current && localVideoRef.current.srcObject !== lStream) {
        localVideoRef.current.srcObject = lStream;
        localVideoRef.current.play().catch(() => {});
      }
    }
  }, [activeCall, remoteStreamState, localStreamState]);
  const callTimerRef = useRef<any>(null);
  const ringStopRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Firebase Firestore Realtime Engine (Cloud-based instant multi-user messaging & calling)
  useEffect(() => {
    let unsubMessages: (() => void) | null = null;
    let unsubCalls: (() => void) | null = null;

    if (checkIsQuotaExhausted()) return;

    try {
      // 1. Listen for real-time messages in Firestore collection 'chat_messages'
      const messagesRef = query(collection(db, 'chat_messages'), orderBy('createdAt', 'desc'), limit(50));
      unsubMessages = onSnapshot(messagesRef, (snapshot) => {
        const firestoreMsgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          firestoreMsgs.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });

        if (firestoreMsgs.length > 0) {
          setMessages(prev => {
            const prevMap = new Map<string, ChatMessage>(prev.map(m => [m.id, m]));
            let hasNewRemoteMsg = false;

            firestoreMsgs.forEach(sm => {
              if (!prevMap.has(sm.id)) {
                prevMap.set(sm.id, sm);
                if (sm.senderId !== loggedUser.id) {
                  hasNewRemoteMsg = true;
                }
              } else {
                const existing = prevMap.get(sm.id)!;
                if (JSON.stringify(existing.reactions) !== JSON.stringify(sm.reactions)) {
                  prevMap.set(sm.id, { ...existing, reactions: sm.reactions });
                }
              }
            });

            if (hasNewRemoteMsg) {
              playNotificationPing();
            }

            return Array.from(prevMap.values());
          });
        }
      }, (err) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          if (unsubMessages) { try { unsubMessages(); } catch {} }
        }
        console.warn('Firestore messages listener info:', err?.message || err);
      });

      // 2. Listen for real-time calling signals in Firestore collection 'chat_call_signals'
      const callsRef = query(collection(db, 'chat_call_signals'), orderBy('timestamp', 'desc'), limit(15));
      unsubCalls = onSnapshot(callsRef, (snapshot) => {
        const now = Date.now();
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const sig = change.doc.data();
            if (sig.timestamp && (now - sig.timestamp) > 45000) return;

            if (sig.type === 'INCOMING_CALL') {
              processIncomingCallSignal(sig);
            } else if (sig.type === 'ACCEPT_CALL') {
              processAcceptCallSignal(sig);
            } else if (sig.type === 'REJECT_CALL' || sig.type === 'END_CALL') {
              processEndOrRejectCallSignal(sig);
            }
          }
        });
      }, (err) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          if (unsubCalls) { try { unsubCalls(); } catch {} }
        }
        console.warn('Firestore calls listener info:', err?.message || err);
      });
    } catch (e) {
      console.error('Firebase snapshot setup failed:', e);
    }

    return () => {
      if (unsubMessages) unsubMessages();
      if (unsubCalls) unsubCalls();
    };
  }, [loggedUser.id]);

  // Real-time WebSocket connection to /ws
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isCancelled = false;

    const connectWS = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Real-time WebSocket connected to server');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, payload } = data || {};
            if (!type) return;

            if (type === 'INIT_MESSAGES' && Array.isArray(payload)) {
              setMessages(prev => {
                const prevMap = new Map<string, ChatMessage>(prev.map(m => [m.id, m]));
                payload.forEach((sm: ChatMessage) => {
                  if (!prevMap.has(sm.id)) {
                    prevMap.set(sm.id, sm);
                  } else {
                    const existing = prevMap.get(sm.id)!;
                    if (JSON.stringify(existing.reactions) !== JSON.stringify(sm.reactions)) {
                      prevMap.set(sm.id, { ...existing, reactions: sm.reactions });
                    }
                  }
                });
                return Array.from(prevMap.values());
              });
            }

            if (type === 'NEW_MESSAGE' && payload) {
              setMessages(prev => {
                if (prev.some(m => m.id === payload.id)) return prev;
                if (payload.senderId !== loggedUser.id) {
                  playNotificationPing();
                }
                return [...prev, payload];
              });

              if (payload.channelId !== activeChannelId && payload.senderId !== loggedUser.id) {
                setChannels(prev => prev.map(c => c.id === payload.channelId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c));
              }
            }

            if (type === 'INCOMING_CALL' && payload) {
              processIncomingCallSignal(payload);
            }

            if (type === 'ACCEPT_CALL' && payload) {
              processAcceptCallSignal(payload);
            }

            if ((type === 'REJECT_CALL' || type === 'END_CALL') && payload) {
              processEndOrRejectCallSignal(payload);
            }

            if (type === 'REACTION_UPDATE' && payload) {
              setMessages(prev => prev.map(m => m.id === payload.msgId ? { ...m, reactions: payload.reactions } : m));
            }
          } catch (err) {
            console.error('WS message parse error:', err);
          }
        };

        ws.onclose = () => {
          if (!isCancelled) {
            reconnectTimer = setTimeout(connectWS, 2500);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        console.error('WebSocket error:', err);
      }
    };

    connectWS();

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [loggedUser.id, activeChannelId]);

  // Setup BroadcastChannel for Real-time messaging & calling across tabs/users
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('gpa_realtime_chat_channel_v3');
        bcRef.current = channel;

        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (!type) return;

          if (type === 'NEW_MESSAGE' && payload) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.id)) return prev;
              if (payload.senderId !== loggedUser.id) {
                playNotificationPing();
              }
              return [...prev, payload];
            });

            if (payload.channelId !== activeChannelId && payload.senderId !== loggedUser.id) {
              setChannels(prev => prev.map(c => c.id === payload.channelId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c));
            }
          }

          if (type === 'INCOMING_CALL' && payload) {
            processIncomingCallSignal(payload);
          }

          if (type === 'ACCEPT_CALL' && payload) {
            processAcceptCallSignal(payload);
          }

          if ((type === 'REJECT_CALL' || type === 'END_CALL') && payload) {
            processEndOrRejectCallSignal(payload);
          }

          if (type === 'REACTION_UPDATE' && payload) {
            setMessages(prev => prev.map(m => m.id === payload.msgId ? { ...m, reactions: payload.reactions } : m));
          }
        };
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (bcRef.current) {
        bcRef.current.close();
      }
    };
  }, [loggedUser.id, activeChannelId]);

  // Save messages and channels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gpa_chat_messages', JSON.stringify(messages));
      localStorage.setItem('gpa_chat_channels', JSON.stringify(channels));
    } catch (e) {
      console.error(e);
    }
  }, [messages, channels]);

  // Pusher + Ably Realtime Failover Client
  useEffect(() => {
    const handleEvent = (data: any) => {
      const { type, payload } = data;
      if (!type || !payload) return;
      
      if (type === 'NEW_MESSAGE') {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.id)) return prev;
          if (payload.senderId !== loggedUser.id) playNotificationPing();
          return [...prev, payload];
        });
        if (payload.channelId !== activeChannelId && payload.senderId !== loggedUser.id) {
          setChannels(prev => prev.map(c => c.id === payload.channelId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c));
        }
      } else if (type === 'INCOMING_CALL') {
        processIncomingCallSignal(payload);
      } else if (type === 'ACCEPT_CALL') {
        processAcceptCallSignal(payload);
      } else if (type === 'REJECT_CALL' || type === 'END_CALL') {
        processEndOrRejectCallSignal(payload);
      } else if (type === 'REACTION_UPDATE') {
        setMessages(prev => prev.map(m => m.id === payload.msgId ? { ...m, reactions: payload.reactions } : m));
      }
    };

    // Pusher Subscribe
    let pusherChannel: any = null;
    if (pusherClient) {
      try {
        pusherChannel = pusherClient.subscribe("gpa-crm-channel");
        pusherChannel.bind_global((eventName: string, data: any) => {
          if (eventName.startsWith("pusher:")) return;
          handleEvent({ type: eventName, payload: data });
        });
      } catch (e) {
        console.warn('Pusher subscribe notice:', e);
      }
    }

    // Ably Subscribe
    let ablyChannel: any = null;
    if (ablyClient) {
      try {
        ablyChannel = ablyClient.channels.get("gpa-crm-channel");
        ablyChannel.subscribe((msg: any) => {
          handleEvent({ type: msg.name, payload: msg.data });
        });
      } catch (e) {
        console.warn('Ably subscribe notice:', e);
      }
    }

    return () => {
      if (pusherClient && pusherChannel) {
        try { pusherClient.unsubscribe("gpa-crm-channel"); } catch (e) {}
      }
      if (ablyClient && ablyChannel) {
        try { ablyChannel.unsubscribe(); } catch (e) {}
      }
    };
  }, [loggedUser.id, activeChannelId]);

  // Fast Real-time Server Polling for Cross-Device Messages & Calling Engine (1.5s)
  useEffect(() => {
    let isSubscribed = true;

    const pollRealtimeServer = async () => {
      try {
        // 1. Fetch messages
        const msgRes = await fetch('/api/realtime/messages');
        if (msgRes.ok) {
          const { messages: serverMsgs } = await msgRes.json();
          if (Array.isArray(serverMsgs) && isSubscribed) {
            setMessages(prev => {
              let hasNew = false;
              const prevMap = new Map<string, ChatMessage>(prev.map(m => [m.id, m]));

              serverMsgs.forEach((sm: ChatMessage) => {
                if (!prevMap.has(sm.id)) {
                  prevMap.set(sm.id, sm);
                  hasNew = true;
                  if (sm.senderId !== loggedUser.id) {
                    playNotificationPing();
                  }
                } else {
                  const existing = prevMap.get(sm.id)!;
                  if (JSON.stringify(existing.reactions) !== JSON.stringify(sm.reactions)) {
                    prevMap.set(sm.id, { ...existing, reactions: sm.reactions });
                  }
                }
              });

              return sortMessages(Array.from(prevMap.values()));
            });
          }
        }

        // 2. Fetch call signals
        const callRes = await fetch(`/api/realtime/calls?userId=${loggedUser.id}`);
        if (callRes.ok) {
          const { signals } = await callRes.json();
          if (Array.isArray(signals) && isSubscribed) {
            signals.forEach((sig: any) => {
              if (sig.type === 'INCOMING_CALL') {
                processIncomingCallSignal(sig);
              } else if (sig.type === 'ACCEPT_CALL') {
                processAcceptCallSignal(sig);
              } else if (sig.type === 'REJECT_CALL' || sig.type === 'END_CALL') {
                processEndOrRejectCallSignal(sig);
              }
            });
          }
        }
      } catch (e) {}
    };

    pollRealtimeServer();
    const interval = setInterval(pollRealtimeServer, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [loggedUser.id]);

  // Real-time WebRTC PeerJS Data Channel Broadcast (Serverless Fallback)
  const broadcastP2P = (type: string, payload: any) => {
    if (!peerRef.current || !comerciais) return;
    comerciais.forEach(u => {
      if (u.id === loggedUser.id) return;
      try {
        const targetId = `gpa_crm_${u.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const conn = peerRef.current.connect(targetId, { reliable: true });
        conn.on('open', () => {
          conn.send({ type, payload });
          setTimeout(() => conn.close(), 1000);
        });
        conn.on('error', () => {});
      } catch (e) {}
    });
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // Handle media stream cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (ringStopRef.current) ringStopRef.current();
    };
  }, []);



  // Last read timestamp per channel / DM to track unread messages
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('gpa_chat_last_read');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gpa_chat_last_read', JSON.stringify(lastReadTimes));
    } catch (e) {}
  }, [lastReadTimes]);

  // Mark current channel as read automatically when selected
  useEffect(() => {
    if (activeChannelId) {
      setLastReadTimes(prev => ({ ...prev, [activeChannelId]: Date.now() }));
    }
  }, [activeChannelId]);

  // Helper to compute DM channel info (last message, unread count)
  const getDMInfo = (targetUser: Usuario) => {
    const dmId = getDMChannelId(loggedUser.id, targetUser.id);
    const dmMessages = messages.filter(m => m.channelId === dmId);
    const lastMsg = dmMessages.length > 0 ? dmMessages[dmMessages.length - 1] : null;
    const lastRead = lastReadTimes[dmId] || 0;

    const isCurrentActive = activeDMUser?.id === targetUser.id || activeChannelId === dmId;
    const unreadCount = isCurrentActive ? 0 : dmMessages.filter(m => {
      if (m.senderId === loggedUser.id) return false;
      const msgTime = m.createdAt || (m.timestamp ? Date.parse(`1970-01-01T${m.timestamp}:00Z`) || 0 : 0);
      return msgTime > lastRead;
    }).length;

    return { dmId, dmMessages, lastMsg, unreadCount };
  };

  // Switch DM
  const handleSelectDM = (user: Usuario) => {
    setActiveDMUser(user);
    const dmId = getDMChannelId(loggedUser.id, user.id);
    setActiveChannelId(dmId);
    setLastReadTimes(prev => ({ ...prev, [dmId]: Date.now() }));
    setMobileShowChat(true);
  };

  // Switch Group Channel
  const handleSelectGroupChannel = (ch: ChatChannel) => {
    setActiveDMUser(null);
    setActiveChannelId(ch.id);
    setLastReadTimes(prev => ({ ...prev, [ch.id]: Date.now() }));
    setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, unreadCount: 0 } : c));
    setMobileShowChat(true);
  };

  // Filter messages for current active channel
  const currentMessages = messages.filter(m => m.channelId === activeChannelId);

  const sendRealtimeWSEvent = (type: string, payload: any) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type, payload }));
      }
    } catch (e) {}
  };

  const sendFirestoreMsg = async (msg: ChatMessage) => {
    if (checkIsQuotaExhausted()) return;
    try {
      await setDoc(doc(db, 'chat_messages', msg.id), msg);
    } catch (e: any) {
      console.warn('Firestore write skipped:', e?.message || e);
    }
  };

  const sendFirestoreCallSignal = async (signal: any) => {
    if (checkIsQuotaExhausted()) return;
    try {
      const docId = `sig_${signal.callId || 'c'}_${Date.now()}`;
      await setDoc(doc(db, 'chat_call_signals', docId), { ...signal, timestamp: Date.now() });
    } catch (e: any) {
      console.warn('Firestore call signal skipped:', e?.message || e);
    }
  };

  const updateFirestoreReactions = async (msgId: string, rx: Record<string, string[]>) => {
    if (checkIsQuotaExhausted()) return;
    try {
      await updateDoc(doc(db, 'chat_messages', msgId), { reactions: rx });
    } catch (e: any) {
      console.warn('Firestore reactions update skipped:', e?.message || e);
    }
  };

  // Universal Multi-Network Realtime Broadcaster (Ably Cloud + WebSocket + Vercel Serverless + PeerJS P2P + Firestore)
  const broadcastRealtimeToAll = (type: string, payload: any) => {
    // 1. Direct Ably Cloud Broadcast (Instant across all Vercel domains, browsers, and mobile devices)
    if (ablyClient) {
      try {
        const channel = ablyClient.channels.get("gpa-crm-channel");
        channel.publish(type, payload);
      } catch (e) {
        console.warn('Ably direct publish notice:', e);
      }
    }

    // 2. HTTP Server API Sync (Pusher + DB storage)
    if (type === 'NEW_MESSAGE') {
      fetch('/api/realtime/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } else if (type === 'REACTION_UPDATE') {
      fetch('/api/realtime/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } else {
      fetch('/api/realtime/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, type })
      }).catch(() => {});
    }

    // 3. Local WebSocket Server
    sendRealtimeWSEvent(type, payload);

    // 4. WebRTC Direct P2P (PeerJS)
    broadcastP2P(type === 'NEW_MESSAGE' ? 'P2P_NEW_MESSAGE' : 'P2P_CALL_SIGNAL', { ...payload, type });

    // 5. BroadcastChannel (for multiple tabs on same machine)
    if (bcRef.current) {
      try {
        bcRef.current.postMessage({ type, payload });
      } catch {}
    }

    // 6. Firestore Fallback (asynchronous)
    if (type === 'NEW_MESSAGE') {
      sendFirestoreMsg(payload).catch(() => {});
    } else if (type === 'REACTION_UPDATE') {
      updateFirestoreReactions(payload.msgId, payload.reactions).catch(() => {});
    } else {
      sendFirestoreCallSignal({ ...payload, type }).catch(() => {});
    }
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachmentPreview) return;

    const now = Date.now();
    const newMsg: ChatMessage = {
      id: `m_${now}_${Math.random().toString(36).substring(2, 6)}`,
      channelId: activeChannelId,
      senderId: loggedUser.id,
      senderName: loggedUser.nome,
      senderAvatar: loggedUser.foto,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      attachment: attachmentPreview || undefined
    };

    setMessages(prev => sortMessages([...prev, newMsg]));
    setInputText('');
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
    setLastReadTimes(prev => ({ ...prev, [activeChannelId]: now }));

    // Universal broadcast to all devices
    broadcastRealtimeToAll('NEW_MESSAGE', newMsg);
  };

  // Attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      const isImg = file.type.startsWith('image/');
      setAttachmentPreview({
        type: isImg ? 'image' : 'file',
        url,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Start Voice or Video Call
  const handleStartCall = async (type: 'audio' | 'video') => {
    const targetName = activeDMUser
      ? activeDMUser.nome
      : (channels.find(c => c.id === activeChannelId)?.name || 'Equipa GPA');

    const callId = `call_${Date.now()}`;

    setActiveCall({
      callId,
      isOpen: true,
      type,
      callerName: targetName,
      status: 'calling',
      duration: 0,
      isMuted: false,
      isCameraOff: false,
      isFullscreen: false
    });

    if (ringStopRef.current) ringStopRef.current();
    ringStopRef.current = playRingTone();

    const callSignal = {
      callId,
      senderId: loggedUser.id,
      callerId: loggedUser.id,
      callerName: loggedUser.nome,
      callerFoto: loggedUser.foto,
      type,
      channelId: activeChannelId,
      targetUserId: activeDMUser?.id
    };

    // Broadcast instant call signal across Ably, WebSocket, Server, P2P, BroadcastChannel & Firestore
    broadcastRealtimeToAll('INCOMING_CALL', callSignal);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video' ? { facingMode: 'user' } : false,
          audio: true
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      mediaStreamRef.current = stream;
      setLocalStreamState(stream);

      // WebRTC CPaaS Media Traversal Connection
      if (peerRef.current && activeDMUser && stream) {
        const targetPeerId = `gpa_crm_${activeDMUser.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const call = peerRef.current.call(targetPeerId, stream);
        if (call) {
          activeMediaCallRef.current = call;
          call.on('stream', (remoteStream) => {
            remoteStreamRef.current = remoteStream;
            setRemoteStreamState(remoteStream);
          });
        }
      }
    } catch (err) {
      console.warn('Permissão de câmara/microfone não concedida ou dispositivo indisponível:', err);
    }

    if (onLogOperation) {
      onLogOperation('chamada', 'chat', type, `Chamada de ${type} iniciada com ${targetName}`);
    }

    if (onAddNotification) {
      onAddNotification(
        '📞 Chamada Iniciada',
        `A efetuar chamada de ${type === 'video' ? 'Vídeo' : 'Voz'} para ${targetName}...`,
        'info'
      );
    }
  };

  // Answer Incoming Call
  const handleAnswerIncomingCall = async () => {
    if (!incomingCallSignal) return;
    if (ringStopRef.current) ringStopRef.current();

    const signal = incomingCallSignal;
    handledCallIdsRef.current.add(signal.callId);
    setIncomingCallSignal(null);

    setActiveCall({
      callId: signal.callId,
      isOpen: true,
      type: signal.type,
      callerName: signal.callerName,
      status: 'connected',
      duration: 0,
      isMuted: false,
      isCameraOff: false,
      isFullscreen: false
    });

    broadcastRealtimeToAll('ACCEPT_CALL', { callId: signal.callId, responderId: loggedUser.id });

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: signal.type === 'video' ? { facingMode: 'user' } : false,
          audio: true
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      mediaStreamRef.current = stream;
      setLocalStreamState(stream);

      // WebRTC CPaaS Answer call or trigger call back to caller
      if (activeMediaCallRef.current) {
        activeMediaCallRef.current.answer(stream);
        activeMediaCallRef.current.on('stream', (remoteStream) => {
          remoteStreamRef.current = remoteStream;
          setRemoteStreamState(remoteStream);
        });
      } else if (peerRef.current && signal.callerId) {
        const callerPeerId = `gpa_crm_${signal.callerId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const call = peerRef.current.call(callerPeerId, stream);
        if (call) {
          activeMediaCallRef.current = call;
          call.on('stream', (remoteStream) => {
            remoteStreamRef.current = remoteStream;
            setRemoteStreamState(remoteStream);
          });
        }
      }
    } catch (err) {
      console.warn('Permissão de câmara/microfone não concedida:', err);
    }

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
    }, 1000);

    if (onAddNotification) {
      onAddNotification(
        '📞 Chamada Atendida',
        `Em chamada de ${signal.type === 'video' ? 'Vídeo' : 'Voz'} com ${signal.callerName}.`,
        'success'
      );
    }
  };

  // Reject Incoming Call
  const handleRejectIncomingCall = () => {
    if (!incomingCallSignal) return;
    if (ringStopRef.current) ringStopRef.current();

    const signal = incomingCallSignal;
    handledCallIdsRef.current.add(signal.callId);
    setIncomingCallSignal(null);

    broadcastRealtimeToAll('REJECT_CALL', { callId: signal.callId });
  };

  // End Call
  const handleEndCall = () => {
    if (ringStopRef.current) ringStopRef.current();
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    if (activeCall?.callId) {
      handledCallIdsRef.current.add(activeCall.callId);
    }

    if (activeMediaCallRef.current) {
      try { activeMediaCallRef.current.close(); } catch (e) {}
      activeMediaCallRef.current = null;
    }
    if (remoteStreamRef.current) {
      try { remoteStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      remoteStreamRef.current = null;
    }
    if (mediaStreamRef.current) {
      try { mediaStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      mediaStreamRef.current = null;
    }
    setLocalStreamState(null);
    setRemoteStreamState(null);

    const callIdToEnd = activeCall?.callId;
    broadcastRealtimeToAll('END_CALL', { endedBy: loggedUser.id, callId: callIdToEnd });

    if (activeCall) {
      const durSec = activeCall.duration;
      const mins = Math.floor(durSec / 60);
      const secs = durSec % 60;
      const formattedDur = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      const sysMsg: ChatMessage = {
        id: `m_sys_${Date.now()}`,
        channelId: activeChannelId,
        senderId: 'system',
        senderName: 'Sistema',
        text: `📞 Chamada de ${activeCall.type === 'video' ? 'vídeo' : 'voz'} terminada (${formattedDur})`,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      setMessages(prev => [...prev, sysMsg]);

      broadcastRealtimeToAll('NEW_MESSAGE', sysMsg);
    }

    setActiveCall(null);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!activeCall) return;
    const nextMuted = !activeCall.isMuted;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => t.enabled = !nextMuted);
    }
    setActiveCall({ ...activeCall, isMuted: nextMuted });
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    if (!activeCall) return;
    const nextCam = !activeCall.isCameraOff;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => t.enabled = !nextCam);
    }
    setActiveCall({ ...activeCall, isCameraOff: nextCam });
  };

  // Switch to Video during active call
  const handleSwitchToVideo = async () => {
    if (!activeCall) return;
    try {
      const vStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      mediaStreamRef.current = vStream;
      setLocalStreamState(vStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = vStream;
      }
      setActiveCall({ ...activeCall, type: 'video', isCameraOff: false });
      broadcastRealtimeToAll('P2P_CALL_SIGNAL', {
        type: 'SWITCH_TO_VIDEO',
        callId: activeCall.callId,
        fromUserId: loggedUser.id
      });
    } catch (err) {
      console.warn('Erro ao aceder à câmara:', err);
      alert('Não foi possível ativar a câmara. Verifique as permissões do navegador.');
    }
  };

  // Switch to Audio during active call
  const handleSwitchToAudio = () => {
    if (!activeCall) return;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
    }
    setActiveCall({ ...activeCall, type: 'audio' });
    broadcastRealtimeToAll('P2P_CALL_SIGNAL', {
      type: 'SWITCH_TO_AUDIO',
      callId: activeCall.callId,
      fromUserId: loggedUser.id
    });
  };

  // Add Emoji reaction
  const handleAddReaction = (msgId: string, emoji: string) => {
    let updatedRx: Record<string, string[]> = {};
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const rx = { ...(m.reactions || {}) };
      const list = rx[emoji] || [];
      if (list.includes(loggedUser.id)) {
        rx[emoji] = list.filter(id => id !== loggedUser.id);
        if (rx[emoji].length === 0) delete rx[emoji];
      } else {
        rx[emoji] = [...list, loggedUser.id];
      }
      updatedRx = rx;
      return { ...m, reactions: rx };
    }));

    broadcastRealtimeToAll('REACTION_UPDATE', { msgId, reactions: updatedRx });
  };

  // Format call timer
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Create new Group Channel
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const cleanName = newGroupName.toLowerCase().replace(/\s+/g, '-');
    const newCh: ChatChannel = {
      id: `c_group_${Date.now()}`,
      name: cleanName,
      description: newGroupDesc || 'Grupo da equipa GPA',
      isGroup: true,
      unreadCount: 0
    };

    setChannels(prev => [...prev, newCh]);
    setActiveChannelId(newCh.id);
    setActiveDMUser(null);
    setShowNewGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  // Active channel title
  const activeTitle = activeDMUser
    ? activeDMUser.nome
    : (channels.find(c => c.id === activeChannelId)?.name || 'Chat Interno');

  // Filtered users for search
  const filteredUsers = comerciais.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.funcao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className={`h-[calc(100vh-95px)] min-h-[520px] bg-slate-950 rounded-3xl border border-cyan-500/20 shadow-2xl overflow-hidden text-left font-sans relative backdrop-blur-xl ${!activeTab || activeTab === 'chat' ? 'flex' : 'hidden'}`}>
      
      {/* LEFT SIDEBAR: Channels & Users */}
      <div className={`w-full md:w-80 bg-slate-900/95 text-slate-100 flex-col border-r border-slate-800/80 shrink-0 backdrop-blur-md ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* User Status Bar */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar name={loggedUser.nome} foto={loggedUser.foto} size="md" />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                userStatus === 'online' ? 'bg-emerald-500' :
                userStatus === 'ausente' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">{loggedUser.nome}</h3>
              <p className="text-[10px] text-slate-400 font-medium capitalize">{loggedUser.perfil}</p>
            </div>
          </div>

          <div className="relative group">
            <select
              value={userStatus}
              onChange={(e) => setUserStatus(e.target.value as any)}
              className="bg-slate-800 text-slate-200 text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="online">🟢 Online</option>
              <option value="ausente">🟡 Ausente</option>
              <option value="ocupado">🔴 Ocupado</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar equipa ou canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          
          {/* Group Channels */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span className="flex items-center gap-1.5"><Hash size={13} /> Canais da Equipa</span>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
                title="Criar Novo Canal"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {channels.map(ch => {
                const isActive = !activeDMUser && activeChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectGroupChannel(ch)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.unreadCount ? (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {ch.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span className="flex items-center gap-1.5"><Users size={13} /> Mensagens Diretas ({filteredUsers.filter(u => u.id !== loggedUser.id).length})</span>
            </div>

            <div className="space-y-1">
              {filteredUsers
                .filter(user => user.id !== loggedUser.id)
                .sort((a, b) => {
                  const infoA = getDMInfo(a);
                  const infoB = getDMInfo(b);
                  if (infoA.unreadCount > 0 && infoB.unreadCount === 0) return -1;
                  if (infoB.unreadCount > 0 && infoA.unreadCount === 0) return 1;
                  const timeA = infoA.lastMsg?.createdAt || 0;
                  const timeB = infoB.lastMsg?.createdAt || 0;
                  return timeB - timeA;
                })
                .map(user => {
                  const { lastMsg, unreadCount } = getDMInfo(user);
                  const isActive = activeDMUser?.id === user.id;

                  let snippet = user.funcao || 'Comercial';
                  if (lastMsg) {
                    const prefix = lastMsg.senderId === loggedUser.id ? 'Você: ' : '';
                    if (lastMsg.text) {
                      snippet = prefix + lastMsg.text;
                    } else if (lastMsg.attachment) {
                      snippet = prefix + (lastMsg.attachment.type === 'image' ? '📷 Foto' : '📄 Ficheiro');
                    }
                  }

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectDM(user)}
                      className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-1.5">
                        <div className="relative shrink-0">
                          <UserAvatar name={user.nome} foto={user.foto} size="sm" />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            user.status === 'ativo' ? 'bg-emerald-500' : 'bg-slate-500'
                          }`} />
                        </div>
                        <div className="text-left truncate flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`font-bold leading-tight truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{user.nome}</p>
                            {lastMsg && (
                              <span className={`text-[9px] shrink-0 font-mono ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                {lastMsg.timestamp}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : unreadCount > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                            {snippet}
                          </p>
                        </div>
                      </div>

                      {unreadCount > 0 && !isActive && (
                        <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-sm animate-pulse">
                          {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT MAIN CHAT WINDOW */}
      <div className={`flex-1 flex-col bg-slate-50 relative overflow-hidden ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 px-3 sm:px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              title="Voltar aos canais e conversas"
            >
              <ArrowLeft size={20} />
            </button>

            {activeDMUser ? (
              <div className="relative shrink-0">
                <UserAvatar name={activeDMUser.nome} foto={activeDMUser.foto} size="md" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  activeDMUser.status === 'ativo' ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">
                <Hash size={20} />
              </div>
            )}

            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 capitalize truncate">
                  {activeDMUser ? activeDMUser.nome : `#${activeTitle}`}
                </h2>
                <button
                  onClick={() => setShowCPaaSModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition cursor-pointer shrink-0"
                  title="Ver Estado CPaaS WebRTC e Servidores STUN/TURN"
                >
                  <Radio size={12} className={peerConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
                  <span>CPaaS WebRTC: {peerConnected ? 'Ativo' : 'Ligar...'}</span>
                  <Info size={12} className="text-blue-500 ml-0.5" />
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                {activeDMUser
                  ? (activeDMUser.funcao ? `${activeDMUser.funcao} • ${activeDMUser.email}` : 'Comercial GPA')
                  : (channels.find(c => c.id === activeChannelId)?.description || 'Canal de comunicação da equipa')}
              </p>
            </div>
          </div>

          {/* Action Buttons: Voice Call & Video Call */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartCall('audio')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition shadow-2xs cursor-pointer"
              title="Iniciar Chamada de Voz"
            >
              <Phone size={15} className="text-emerald-600" />
              <span className="hidden sm:inline">Voz</span>
            </button>

            <button
              onClick={() => handleStartCall('video')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Iniciar Vídeo Chamada HD"
            >
              <Video size={15} />
              <span className="hidden sm:inline">Vídeo Chamada</span>
            </button>
          </div>
        </div>

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <MessageSquare size={36} className="text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Nenhuma mensagem neste canal ainda.</p>
              <p className="text-[11px] text-slate-400">Escreva uma mensagem ou inicie uma videochamada abaixo.</p>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isMine = msg.senderId === loggedUser.id;

              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMine && <UserAvatar name={msg.senderName} foto={msg.senderAvatar} size="sm" />}

                  <div className={`max-w-[75%] sm:max-w-[60%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-extrabold text-slate-700">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        {msg.timestamp}
                        {isMine && <span className="text-blue-500 font-black text-[10px]" title="Entregue em tempo real">✓✓</span>}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs font-medium space-y-2 shadow-2xs ${
                      isMine
                        ? 'bg-[#003366] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}>
                      {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                      {msg.attachment && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-black/10 max-w-sm bg-black/5 p-1">
                          {msg.attachment.type === 'image' ? (
                            <img src={msg.attachment.url} alt="anexo" className="max-h-60 w-full object-cover rounded-xl" />
                          ) : (msg.attachment.name?.toLowerCase().includes('audio') || msg.attachment.url?.startsWith('data:audio') || msg.attachment.name?.endsWith('.webm') || msg.attachment.name?.endsWith('.mp3')) ? (
                            <div className="p-2 space-y-1 bg-white rounded-lg border border-slate-200">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                <Mic size={15} className="text-emerald-600 animate-pulse" />
                                <span>Mensagem de Áudio</span>
                              </div>
                              <audio controls src={msg.attachment.url} className="w-full h-9 rounded" />
                            </div>
                          ) : (
                            <div className="p-3 flex items-center gap-2 text-xs font-bold text-slate-700 bg-white">
                              <FileText size={18} className="text-blue-600" />
                              <span className="truncate">{msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reactions list */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Object.entries(msg.reactions).map(([emoji, uids]) => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                                isMine ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{(uids as string[]).length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Reaction Bar on Hover */}
                    <div className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                      {['👍', '❤️', '🚀', '👏', '💼'].map(e => (
                        <button
                          key={e}
                          onClick={() => handleAddReaction(msg.id, e)}
                          className="hover:scale-125 transition text-xs p-0.5"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview Bar */}
        {attachmentPreview && (
          <div className="px-6 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              {attachmentPreview.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
              <span>Ficheiro pronto a enviar: {attachmentPreview.name}</span>
            </div>
            <button onClick={() => setAttachmentPreview(null)} className="text-blue-800 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Message Footer */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          {isRecordingAudio ? (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-bold text-red-900 font-mono">
                  A gravar áudio: {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelAudioRecording}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Concluir Áudio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Anexar Imagem ou Ficheiro"
              >
                <Paperclip size={18} />
              </button>

              <button
                type="button"
                onClick={startAudioRecording}
                className="p-2.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                title="Gravar Mensagem de Áudio / Nota de Voz"
              >
                <Mic size={18} />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Mensagem para #${activeTitle}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-100 text-slate-800 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />

                {/* Emoji quick popover */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <Smile size={18} />
                </button>

              {showEmojiPicker && (
                <div className="absolute right-0 bottom-12 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 grid grid-cols-6 gap-2 z-50">
                  {['👍', '❤️', '🚀', '👏', '💼', '✅', '🔥', '📊', '🤝', '🎯', '📍', '💡'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setInputText(prev => prev + e);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() && !attachmentPreview}
              className="px-5 py-3 bg-[#003366] hover:bg-blue-900 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <span>Enviar</span>
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

      {/* CREATE NEW GROUP MODAL */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left border border-slate-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Hash size={18} className="text-blue-600" />
                Criar Novo Canal de Grupo
              </h3>
              <button onClick={() => setShowNewGroupModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nome do Canal:
                </label>
                <input
                  type="text"
                  placeholder="ex: vendas-julho-agosto"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-blue-600 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Descrição do Canal:
                </label>
                <input
                  type="text"
                  placeholder="Objetivo e tópicos do canal"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition"
                >
                  Criar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* INCOMING CALL MODAL POPUP (RINGING DIALOG FOR RECEIVER) */}
      {incomingCallSignal && (
        <div className="fixed inset-0 bg-slate-950/85 z-[4000] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 text-center space-y-6 border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center relative">
              <UserAvatar name={incomingCallSignal.callerName} foto={incomingCallSignal.callerFoto} size="lg" />
              <span className="absolute -inset-2 rounded-full border-2 border-emerald-500/50 animate-ping" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">{incomingCallSignal.callerName}</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {incomingCallSignal.type === 'video' ? 'Chamada de Vídeo HD Entrante...' : 'Chamada de Voz Entrante...'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={handleRejectIncomingCall}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow-lg cursor-pointer transition transform hover:scale-105"
                  title="Recusar Chamada"
                >
                  <PhoneOff size={22} />
                </button>

                <button
                  onClick={handleAnswerIncomingCall}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg cursor-pointer transition transform hover:scale-105 animate-pulse"
                  title="Atender Chamada"
                >
                  {incomingCallSignal.type === 'video' ? <Video size={22} /> : <Phone size={22} />}
                </button>
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="text-xs text-slate-400 hover:text-white font-semibold underline mt-1 cursor-pointer transition"
                >
                  💬 Abrir Chat no Fundo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALL OVERLAY MODAL (AUDIO & VIDEO CALL ENGINE) */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950/95 z-[3000] flex items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-none sm:rounded-3xl max-w-2xl w-full h-full sm:h-[520px] p-4 sm:p-6 flex flex-col justify-between border-0 sm:border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Top Call Status Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {activeCall.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{activeCall.callerName}</h3>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {activeCall.status === 'calling' ? 'A chamar...' : `Em Chamada HD (${formatDuration(activeCall.duration)})`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleEndCall}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video / Avatar Container */}
            <div className="flex-1 my-4 bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
              
              {/* Remote Audio Output Element */}
              <audio ref={remoteAudioRef} autoPlay playsInline />

              {/* Active Video Call Streams */}
              {activeCall.type === 'video' ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  
                  {/* Primary View: Remote Video Feed */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Fallback Avatar if remote camera/stream not connected yet */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 -z-10">
                    <UserAvatar name={activeCall.callerName} size="lg" />
                    <p className="text-xs font-bold text-slate-400">A aguardar sinal de vídeo do participante...</p>
                  </div>

                  {/* Picture-in-Picture PIP: Local Camera Feed */}
                  <div className="absolute bottom-4 right-4 w-36 h-28 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden bg-slate-900 z-20">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${activeCall.isCameraOff ? 'hidden' : 'block'}`}
                    />
                    {activeCall.isCameraOff && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                        <CameraOff size={18} />
                        <span className="text-[9px] font-bold mt-1">Câmara Desligada</span>
                      </div>
                    )}
                  </div>

                  {/* Call participant label tag */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-lg z-20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-white">{activeCall.callerName}</span>
                  </div>

                </div>
              ) : (
                /* Audio Call Avatar & Visualizer */
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <UserAvatar name={activeCall.callerName} size="lg" />
                    <span className="absolute -inset-2 rounded-full border-2 border-emerald-500/40 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{activeCall.callerName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Chamada de Voz WebRTC Traversal Ativa</p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-2 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                      <ShieldCheck size={12} /> Encaminhamento P2P / STUN Ativo
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Call Control Bar */}
            <div className="flex items-center justify-center gap-3 pt-2 z-10">
              
              {/* Mute Mic */}
              <button
                onClick={handleToggleMute}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition shadow-md cursor-pointer ${
                  activeCall.isMuted ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title={activeCall.isMuted ? 'Ativar Microfone' : 'Desativar Microfone'}
              >
                {activeCall.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Turn Camera On / Off (Video Call) */}
              {activeCall.type === 'video' && (
                <button
                  onClick={handleToggleCamera}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition shadow-md cursor-pointer ${
                    activeCall.isCameraOff ? 'bg-amber-500/20 text-amber-400 border border-amber-500' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                  title={activeCall.isCameraOff ? 'Ligar Câmara' : 'Desligar Câmara'}
                >
                  {activeCall.isCameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
              )}

              {/* Switch to Video (when in Audio call) */}
              {activeCall.type === 'audio' && (
                <button
                  onClick={handleSwitchToVideo}
                  className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center font-bold transition shadow-md cursor-pointer"
                  title="Mudar para Chamada de Vídeo"
                >
                  <Video size={20} />
                </button>
              )}

              {/* Switch to Audio (when in Video call) */}
              {activeCall.type === 'video' && (
                <button
                  onClick={handleSwitchToAudio}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold transition shadow-md cursor-pointer"
                  title="Mudar para Chamada de Áudio"
                >
                  <Phone size={20} />
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold transition shadow-lg cursor-pointer"
                title="Desligar Chamada"
              >
                <PhoneOff size={22} />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* CPAAS & WEBRTC DIAGNOSTICS & CONFIGURATION MODAL */}
      {showCPaaSModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-[5000] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-left space-y-5 border border-slate-200 shadow-2xl relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">CPaaS (Communications Platform as a Service)</h3>
                  <p className="text-xs text-slate-500 font-medium">Plataforma de Comunicação em Tempo Real GPA CRM</p>
                </div>
              </div>

              <button
                onClick={() => setShowCPaaSModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content & Explanation */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              
              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Estado do Motor WebRTC
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    peerConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {peerConnected ? 'Conectado a Servidores STUN/TURN' : 'A Conectar...'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <p className="text-slate-400 font-medium">Seu Peer ID Registado:</p>
                    <p className="font-mono text-blue-400 font-bold truncate">{myPeerId || 'A gerar ID...'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Servidores de Travessia NAT:</p>
                    <p className="font-semibold text-emerald-400">Google STUN + Twilio STUN</p>
                  </div>
                </div>
              </div>

              {/* What is CPaaS Explanatory Section */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2">
                <h4 className="font-black text-blue-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck size={16} className="text-blue-600" /> Como funciona o CPaaS no GPA CRM?
                </h4>
                <p className="text-slate-600">
                  O <strong>CPaaS</strong> (Communications Platform as a Service) é a infraestrutura em nuvem que permite efetuar chamadas de áudio/vídeo e mensagens diretamente no navegador, atravessando firewalls e routers de redes móveis ou de escritório sem interrupções.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pt-1">
                  <li><strong>Travessia NAT/STUN:</strong> Estabelece ligação áudio e vídeo direta P2P entre computadores e telemóveis de colegas.</li>
                  <li><strong>Sinalização Cloud Realtime:</strong> Notifica o recetor instantaneamente mesmo com o separador em segundo plano.</li>
                  <li><strong>Encriptação de Ponta a Ponta:</strong> Os fluxos multimédia viajam de forma segura via WebRTC DTLS/SRTP.</li>
                </ul>
              </div>

              {/* External Commercial CPaaS Providers Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                  <Settings size={15} className="text-slate-600" /> Suporte a Provedores CPaaS Comerciais (Opcional)
                </h4>
                <p className="text-slate-500">
                  Caso pretenda integração com chamadas para telemóveis normais (PSTN), envio de SMS ou salas de reunião empresariais até 1.000 participantes, a aplicação suporta as seguintes chaves de API:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-slate-700">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Twilio Voice & Video
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Agora.io RTC
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> ZEGOCLOUD Express
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Daily.co WebRTC
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowCPaaSModal(false)}
                className="px-5 py-2.5 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition cursor-pointer"
              >
                Compreendido
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
