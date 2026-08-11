import { Usuario, NotificationItem, isUserCommercial } from '../types';

/**
 * Plays a pleasant audio chime using Web Audio API for instant sound feedback
 */
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio Context blocked or unsupported
  }
}

/**
 * Requests browser HTML5 Desktop/Mobile System Notification
 */
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
}

/**
 * Opens WhatsApp Web or App directly with a formatted message
 */
export function openWhatsAppDirect(phone: string, text: string) {
  if (!phone) return;
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.substring(2);
  const cleanPhone = digits.length === 9 ? '244' + digits : digits;
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

/**
 * Dispatches a role-based notification:
 * 1. Commercial adds/updates data -> NOTIFIES ADMINS & GESTORES ONLY (WhatsApp, Email, Telegram & In-App)
 * 2. Admin/Gestor adds/updates data -> NOTIFIES COMERCIAIS ONLY (WhatsApp, Email, Telegram & In-App)
 * 3. Commercials NEVER receive notifications when another Commercial adds data.
 */
export async function dispatchRoleNotification(
  title: string,
  text: string,
  type: 'info' | 'success' | 'warn' = 'info',
  sender: Usuario | null,
  allUsers: Usuario[],
  onInAppNotification: (item: NotificationItem) => void
) {
  const isCommercial = sender ? isUserCommercial(sender) : false;
  const isManagerOrAdmin = sender ? (sender.perfil === 'admin' || sender.perfil === 'supervisor') : false;

  let targetRoles: ('admin' | 'supervisor' | 'comercial')[] = ['admin', 'supervisor', 'comercial'];
  let forGestoresOnly = false;
  let forComerciaisOnly = false;

  // Rule: Admins and Supervisors MUST ALWAYS receive notifications on WhatsApp/SMS for ANY movement or addition in the app/CRM!
  // Commercials receive notifications when an admin or supervisor adds or changes something important or assigns data to them.
  const adminsAndSupervisors = allUsers.filter(u => u.perfil === 'admin' || u.perfil === 'supervisor');
  
  let targetUsers: Usuario[] = [];

  if (isCommercial) {
    // Commercial created/updated -> Notify ALL Admins & Supervisors
    targetUsers = adminsAndSupervisors;
    forGestoresOnly = true;
    forComerciaisOnly = false;
  } else {
    // Admin/Manager created/updated -> Notify ALL Admins & Supervisors AND All Commercials
    targetUsers = allUsers;
    forGestoresOnly = false;
    forComerciaisOnly = false;
  }

  const item: NotificationItem = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    title,
    text,
    forGestoresOnly,
    forComerciaisOnly,
    targetRoles,
    autorNome: sender ? sender.nome : 'Sistema',
    autorPerfil: sender ? sender.perfil : 'admin',
    dataHora: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
    canaisEnviados: []
  };

  // 1. Play Audio Alert
  playNotificationChime();

  // 2. HTML5 System Desktop / Mobile Toast Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`🚨 GPA Angola CRM: ${title}`, {
        body: text,
        icon: '/gpa_logo.svg'
      });
    } catch (nErr) {}
  }

  // 3. In-App Notification Center Push
  onInAppNotification(item);

  // 4. External Multi-Channel Dispatch (WhatsApp, Email, Telegram)
  try {
    const usersToDispatch = targetUsers.length > 0 ? targetUsers : allUsers.filter(u => {
      if (forGestoresOnly) return u.perfil === 'admin' || u.perfil === 'supervisor';
      if (forComerciaisOnly) return isUserCommercial(u);
      return true;
    });

    fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification: item,
        sender: sender ? { id: sender.id, nome: sender.nome, perfil: sender.perfil } : null,
        targetUsers: usersToDispatch.map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          perfil: u.perfil,
          telefone: u.telefone,
          preferenciaNotificacao: u.preferenciaNotificacao || 'todos',
          whatsappNumero: u.whatsappNumero || u.telefone,
          telegramChatId: u.telegramChatId,
          emailNotificacao: u.emailNotificacao || u.email
        }))
      })
    }).then(res => res.json())
      .then(resData => {
        if (resData && resData.canais) {
          console.log('✅ External Notifications Dispatched:', resData.canais);
        }
      })
      .catch(err => console.warn('External notification dispatch warning:', err));
  } catch (err) {
    console.warn('Error initiating notification dispatch:', err);
  }
}

