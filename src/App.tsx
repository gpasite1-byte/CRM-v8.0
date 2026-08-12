import React, { useState, useEffect, useRef } from 'react';
import {
  Usuario, Cliente, Visita, Deal, Guideline, NotificationItem, ActivityFeed, Arquivo, isUserCommercial, isUserManager,
  RelatorioDiario, HistoricoSemanal, HistoricoMensal, RecycleItem, PropostaComercial, OperacaoLog
} from './types';
import {
  initialComerciais, initialClients, initialVisits, initialDeals,
  initialGuidelines, initialNotifications, initialActivityFeed,
  initialRelatoriosDiarios, initialHistoricoSemanas, initialHistoricoMeses,
  loadFromLocalStorage, saveToLocalStorage
} from './data';
import { Camera } from 'lucide-react';
import { processInvoiceAutomation } from './lib/invoiceAutomation';
import bgVideo from '../videos/Prompt_Direto_e_Suave_Reco.mp4';

function getCurrentMonthLabel(): string {
  const now = new Date();
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}


// Views
import DashboardView from './components/DashboardView';
import AgendaView from './components/AgendaView';
import ClientesView from './components/ClientesView';
import VisitasView from './components/VisitasView';
import CrmKanbanView from './components/CrmKanbanView';
import RecomendacoesView from './components/RecomendacoesView';
import MetasPerformanceView from './components/MetasPerformanceView';
import MetasComissoesView from './components/MetasComissoesView';
import FollowUpAutomationPanel from './components/FollowUpAutomationPanel';
import ProposalModal from './components/ProposalModal';
import ProposalClientPortalModal from './components/ProposalClientPortalModal';
import ComparativoSemanalView from './components/ComparativoSemanalView';

import ListasView from './components/ListasView';
import AnaliseCriticaView from './components/AnaliseCriticaView';
import BaseDuasSemanasView from './components/BaseDuasSemanasView';
import HistoricoDiaView from './components/HistoricoDiaView';
import ManualRapidoView from './components/ManualRapidoView';
import DocumentosView from './components/DocumentosView';
import RelatoriosView from './components/RelatoriosView';
import UtilizadoresView from './components/UtilizadoresView';
import ConfiguracoesView from './components/ConfiguracoesView';
import HelenaView from './components/HelenaView';
import ChatView, { ChatMessage } from './components/ChatView';
import CpaasAutomationView from './components/CpaasAutomationView';

// Nav/Structural Components
import LoginOverlay from './components/LoginOverlay';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ExcelImportModal } from './components/ExcelImportModal';
import { distributeImportedRows } from './lib/excelDistributor';
import { PdfExtractorModal } from './components/PdfExtractorModal';
import { applyGlobalFont, getSavedFont } from './data/fontsCatalog';
import { saveCrmDataToFirestore, loadCrmDataFromFirestore, subscribeCrmDataFromFirestore } from './lib/firebase';
import { saveFileToFirestore, deleteFileFromFirestore, isSupabaseConfigured, configureSupabaseRuntime } from './lib/supabase';
import { dispatchRoleNotification } from './lib/notifications';
import { sanitizeAndDeduplicateUsers, mergeWithInitialComerciais } from './lib/userUtils';
import { getCurrentWeeks } from './utils/weekUtils';

export default function App() {
  // Initialize stored typography font on startup
  useEffect(() => {
    applyGlobalFont(getSavedFont());
  }, []);
  const lastMutatedTimeRef = useRef<number>(0);
  const lastSavedPayloadRef = useRef<string>('');

  // Authentication State
  const [loggedUser, setLoggedUser] = useState<Usuario | null>(() => {
    return loadFromLocalStorage<Usuario | null>('gpa_logged_user', null);
  });
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = loadFromLocalStorage<'dark' | 'light'>('gpa_theme_mode', 'dark');
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    saveToLocalStorage('gpa_theme_mode', themeMode);
  }, [themeMode]);

  // Main CRM Data States
  const [comerciais, setComerciais] = useState<Usuario[]>(() => {
    const saved = loadFromLocalStorage<Usuario[]>('gpa_comerciais', initialComerciais);
    const sanitized = sanitizeAndDeduplicateUsers(saved);
    saveToLocalStorage('gpa_comerciais', sanitized);
    return sanitized;
  });
  const [clients, setClients] = useState<Cliente[]>(() => {
    return loadFromLocalStorage<Cliente[]>('gpa_clients', initialClients);
  });
  const [visits, setVisits] = useState<Visita[]>(() => {
    return loadFromLocalStorage<Visita[]>('gpa_visits', initialVisits);
  });
  const [deals, setDeals] = useState<Deal[]>(() => {
    return loadFromLocalStorage<Deal[]>('gpa_deals', initialDeals);
  });
  const [guidelines, setGuidelines] = useState<Guideline[]>(() => {
    return loadFromLocalStorage<Guideline[]>('gpa_guidelines', initialGuidelines);
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return loadFromLocalStorage<NotificationItem[]>('gpa_notifications', initialNotifications);
  });
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>(() => {
    return loadFromLocalStorage<ActivityFeed[]>('gpa_activity_feed', initialActivityFeed);
  });
  const [relatoriosDiarios, setRelatoriosDiarios] = useState<RelatorioDiario[]>(() => {
    return loadFromLocalStorage<RelatorioDiario[]>('gpa_relatorios_diarios', initialRelatoriosDiarios);
  });
  const [historicoSemanas, setHistoricoSemanas] = useState<HistoricoSemanal[]>(() => {
    return loadFromLocalStorage<HistoricoSemanal[]>('gpa_historico_semanas', initialHistoricoSemanas);
  });
  const [historicoMeses, setHistoricoMeses] = useState<HistoricoMensal[]>(() => {
    return loadFromLocalStorage<HistoricoMensal[]>('gpa_historico_meses', initialHistoricoMeses);
  });

  // Unified Global Period State across all 13 views (Dashboard, Base 2 Semanas, Histórico do Dia, Análise Crítica, Clientes, Visitas, CRM, Recomendações, Metas, Comissões, Comparativo, Listas, Documentos)
  const [globalRefDate, setGlobalRefDate] = useState<Date>(new Date());
  const [globalPeriodType, setGlobalPeriodType] = useState<PeriodType>('esta_semana');
  const [globalSelectedComercial, setGlobalSelectedComercial] = useState<string>('todos');
  const [globalSelectedEmpresa, setGlobalSelectedEmpresa] = useState<string>('todas');
  const [globalSelectedProvincia, setGlobalSelectedProvincia] = useState<string>('todas');

  const [operacoesLog, setOperacoesLog] = useState<OperacaoLog[]>(() => {
    return loadFromLocalStorage<OperacaoLog[]>('gpa_operacoes_log', [
      {
        id: 'op_init_1',
        dataHora: new Date(Date.now() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 16),
        usuarioNome: 'David Neto',
        usuarioPerfil: 'admin',
        tipoAcao: 'criacao',
        entidade: 'deal',
        entidadeId: 'd1',
        descricao: 'Criação de Proposta de Auditoria para Mocasas (500.000 Kz)',
        podeReverter: true
      },
      {
        id: 'op_init_2',
        dataHora: new Date(Date.now() - 3600000 * 5).toISOString().replace('T', ' ').substring(0, 16),
        usuarioNome: 'David Neto',
        usuarioPerfil: 'admin',
        tipoAcao: 'configuracao',
        entidade: 'configuracao',
        entidadeId: 'cfg_1',
        descricao: 'Atualização do Nome e Logótipo Oficial do CRM GPA Angola',
        podeReverter: false
      }
    ]);
  });

  const logOperation = (
    tipoAcao: OperacaoLog['tipoAcao'],
    entidade: OperacaoLog['entidade'],
    entidadeId: string,
    descricao: string,
    dadosAnteriores?: any,
    dadosNovos?: any,
    podeReverter: boolean = true
  ) => {
    lastMutatedTimeRef.current = Date.now();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOp: OperacaoLog = {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dataHora: nowStr,
      usuarioNome: loggedUser?.nome || 'Utilizador',
      usuarioPerfil: loggedUser?.perfil || 'comercial',
      tipoAcao,
      entidade,
      entidadeId,
      descricao,
      dadosAnteriores,
      dadosNovos,
      podeReverter
    };
    setOperacoesLog(prev => {
      const updated = [newOp, ...prev].slice(0, 300);
      saveToLocalStorage('gpa_operacoes_log', updated);
      return updated;
    });
  };

  const handleRevertOperation = (op: OperacaoLog) => {
    lastMutatedTimeRef.current = Date.now();

    if (op.tipoAcao === 'criacao') {
      if (op.entidade === 'deal') {
        setDeals(prev => prev.filter(d => d.id !== op.entidadeId));
      } else if (op.entidade === 'cliente') {
        setClients(prev => prev.filter(c => c.id !== op.entidadeId));
      } else if (op.entidade === 'visita') {
        setVisits(prev => prev.filter(v => v.id !== op.entidadeId));
      } else if (op.entidade === 'utilizador') {
        setComerciais(prev => prev.filter(u => u.id !== op.entidadeId));
      } else if (op.entidade === 'arquivo') {
        setArquivos(prev => prev.filter(a => a.id !== op.entidadeId));
      }
    } else if ((op.tipoAcao === 'edicao' || op.tipoAcao === 'status') && op.dadosAnteriores) {
      if (op.entidade === 'deal') {
        setDeals(prev => prev.map(d => d.id === op.entidadeId ? op.dadosAnteriores : d));
      } else if (op.entidade === 'cliente') {
        setClients(prev => prev.map(c => c.id === op.entidadeId ? op.dadosAnteriores : c));
      } else if (op.entidade === 'visita') {
        setVisits(prev => prev.map(v => v.id === op.entidadeId ? op.dadosAnteriores : v));
      } else if (op.entidade === 'utilizador') {
        setComerciais(prev => prev.map(u => u.id === op.entidadeId ? op.dadosAnteriores : u));
      }
    } else if (op.tipoAcao === 'exclusao' && op.dadosAnteriores) {
      if (op.entidade === 'deal') {
        setDeals(prev => [op.dadosAnteriores, ...prev.filter(d => d.id !== op.entidadeId)]);
      } else if (op.entidade === 'cliente') {
        setClients(prev => [op.dadosAnteriores, ...prev.filter(c => c.id !== op.entidadeId)]);
      } else if (op.entidade === 'visita') {
        setVisits(prev => [op.dadosAnteriores, ...prev.filter(v => v.id !== op.entidadeId)]);
      } else if (op.entidade === 'utilizador') {
        setComerciais(prev => [op.dadosAnteriores, ...prev.filter(u => u.id !== op.entidadeId)]);
      } else if (op.entidade === 'arquivo') {
        setArquivos(prev => [op.dadosAnteriores, ...prev.filter(a => a.id !== op.entidadeId)]);
      }
      setRecycleItems(prev => prev.filter(i => i.originalId !== op.entidadeId));
    }

    const nowIso = new Date().toISOString();
    setOperacoesLog(prev => {
      const updated = prev.map(item => {
        if (item.id === op.id) {
          return {
            ...item,
            revertidoEm: nowIso,
            revertidoPor: loggedUser?.nome || 'Utilizador'
          };
        }
        return item;
      });
      saveToLocalStorage('gpa_operacoes_log', updated);
      return updated;
    });

    addNotification(
      'Operação Revertida ↩️',
      `A operação "${op.descricao}" foi anulada com sucesso por ${loggedUser?.nome || 'Utilizador'}.`,
      'success'
    );
  };

  const handleClearOperacoesLog = () => {
    setOperacoesLog([]);
    saveToLocalStorage('gpa_operacoes_log', []);
    addNotification('Histórico Limpo 🧹', 'O registo de operações de auditoria foi limpo.', 'info');
  };

  const handleSaveRelatorioDiario = async (novoRelatorio: RelatorioDiario) => {
    lastMutatedTimeRef.current = Date.now();
    const updated = [novoRelatorio, ...relatoriosDiarios];
    setRelatoriosDiarios(updated);
    saveToLocalStorage('gpa_relatorios_diarios', updated);

    const payload = {
      comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede,
      relatoriosDiarios: updated, historicoSemanas, historicoMeses
    };
    await saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving daily report:', err));
  };

  const handleSaveNovaSemana = async (novaSemana: HistoricoSemanal) => {
    lastMutatedTimeRef.current = Date.now();
    const updated = [novaSemana, ...historicoSemanas];
    setHistoricoSemanas(updated);
    saveToLocalStorage('gpa_historico_semanas', updated);

    const payload = {
      comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede,
      relatoriosDiarios, historicoSemanas: updated, historicoMeses
    };
    await saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving custom week:', err));
  };

  const handleSaveNovoMes = async (novoMes: HistoricoMensal) => {
    lastMutatedTimeRef.current = Date.now();
    const updated = [novoMes, ...historicoMeses];
    setHistoricoMeses(updated);
    saveToLocalStorage('gpa_historico_meses', updated);

    const payload = {
      comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede,
      relatoriosDiarios, historicoSemanas, historicoMeses: updated
    };
    await saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving custom month:', err));
  };

  const handleCompilarSemanal = async () => {
    lastMutatedTimeRef.current = Date.now();
    const totalDealsValue = deals.reduce((acc, d) => acc + (d.valor || 0), 0);
    const totalAprovadoValue = deals.reduce((acc, d) => acc + (d.valorAprovado || 0), 0);

    const novaSemana: HistoricoSemanal = {
      id: `SEM-2026-AUTO-${Date.now()}`,
      rotuloSemana: `Semana ${new Date().toLocaleDateString('pt-AO')} (Compilada)`,
      mes: getCurrentMonthLabel(),
      propostas: deals.length,
      valorTotal: totalDealsValue,
      valorAprovado: totalAprovadoValue,
      valorPerdido: 0,
      forecast: totalDealsValue * 0.45,
      conversao: totalDealsValue > 0 ? `${((totalAprovadoValue / totalDealsValue) * 100).toFixed(1)}%` : '10.0%',
      ticketMedio: deals.length > 0 ? Math.round(totalDealsValue / deals.length) : 0,
      visitasTotal: visits.length,
      dataCompilacao: new Date().toISOString(),
      autoCompiladoSexta: true
    };

    const updated = [novaSemana, ...historicoSemanas];
    setHistoricoSemanas(updated);
    saveToLocalStorage('gpa_historico_semanas', updated);

    const payload = {
      comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede,
      relatoriosDiarios, historicoSemanas: updated, historicoMeses
    };
    await saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving weekly compilation:', err));
  };

  const handleGerarMensal = async () => {
    lastMutatedTimeRef.current = Date.now();
    const totalDealsValue = deals.reduce((acc, d) => acc + (d.valor || 0), 0);
    const totalAprovadoValue = deals.reduce((acc, d) => acc + (d.valorAprovado || 0), 0);

    const currentWeeksList = getCurrentWeeks().map(w => w.label);

    const novoMes: HistoricoMensal = {
      id: `MES-AUTO-${Date.now()}`,
      mes: `${getCurrentMonthLabel()} (Consolidado)`,
      totalPropostas: deals.length,
      valorPropostoTotal: totalDealsValue,
      valorAprovadoTotal: totalAprovadoValue,
      valorPerdidoTotal: 0,
      pipelineAberto: totalDealsValue - totalAprovadoValue,
      forecast: totalDealsValue * 0.45,
      conversaoMedia: totalDealsValue > 0 ? `${((totalAprovadoValue / totalDealsValue) * 100).toFixed(1)}%` : '15%',
      semanasIncluidas: currentWeeksList,
      geradoPorAdmin: loggedUser?.nome || 'Administrador',
      dataGeracao: new Date().toISOString()
    };

    const updated = [novoMes, ...historicoMeses];
    setHistoricoMeses(updated);
    saveToLocalStorage('gpa_historico_meses', updated);

    const payload = {
      comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede,
      relatoriosDiarios, historicoSemanas, historicoMeses: updated
    };
    await saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving monthly compilation:', err));
  };


  // Active View switching
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Search filter
  const [globalSearch, setGlobalSearch] = useState('');

  // Config settings
  const [crmName, setCrmName] = useState(() => {
    return loadFromLocalStorage<string>('gpa_crm_name', 'GPA Angola CRM');
  });
  const [apiKey, setApiKey] = useState(() => {
    return loadFromLocalStorage<string>('gpa_api_key', 'GEMINI_DEFAULT');
  });
  const [telSede, setTelSede] = useState(() => {
    return loadFromLocalStorage<string>('gpa_tel_sede', '+244 922 000 000');
  });
  const [syncTime, setSyncTime] = useState('Há 2 minutos');
  const [appLogo, setAppLogo] = useState(() => {
    return loadFromLocalStorage<string>('gpa_app_logo', '/gpa_logo.svg');
  });

  // Modals state
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<Cliente | null>(null);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Cliente | null>(null);

  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
  const [selectedVisitForEdit, setSelectedVisitForEdit] = useState<Visita | null>(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<Usuario | null>(null);
  const [userModalPhoto, setUserModalPhoto] = useState<string>('');

  // Proposals & Client Portal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedDealForProposal, setSelectedDealForProposal] = useState<Deal | undefined>(undefined);

  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [selectedProposalForPortal, setSelectedProposalForPortal] = useState<PropostaComercial | undefined>(undefined);

  const [propostasComerciais, setPropostasComerciais] = useState<PropostaComercial[]>(() => {
    return loadFromLocalStorage<PropostaComercial[]>('gpa_propostas_comerciais', []);
  });

  useEffect(() => {
    saveToLocalStorage('gpa_propostas_comerciais', propostasComerciais);
  }, [propostasComerciais]);

  const handleSaveProposal = (proposal: PropostaComercial) => {
    lastMutatedTimeRef.current = Date.now();
    setPropostasComerciais(prev => [proposal, ...prev.filter(p => p.id !== proposal.id)]);
    
    // Auto update deal stage to 'proposta' if associated deal
    if (proposal.dealId) {
      setDeals(prev => prev.map(d => {
        if (d.id === proposal.dealId) {
          return { ...d, etapa: 'proposta', valor: proposal.totalGeral, dataEnvio: proposal.dataEmissao };
        }
        return d;
      }));
    }

    addNotification(
      'Proposta Emitida 📄',
      `Proposta ${proposal.numero} para ${proposal.clienteEmpresa} guardada no CRM (${new Intl.NumberFormat('pt-AO').format(proposal.totalGeral)} Kz).`,
      'success'
    );
    setIsProposalModalOpen(false);
  };

  const handleApproveProposalFromPortal = (proposalId: string, clientName: string, clientNif: string, comments: string) => {
    lastMutatedTimeRef.current = Date.now();
    const prop = propostasComerciais.find(p => p.id === proposalId);
    
    setPropostasComerciais(prev => prev.map(p => {
      if (p.id === proposalId) {
        return { ...p, estado: 'aprovada' };
      }
      return p;
    }));

    if (prop?.dealId) {
      setDeals(prev => prev.map(d => {
        if (d.id === prop.dealId) {
          return { ...d, etapa: 'fechado', valorAprovado: prop.totalGeral };
        }
        return d;
      }));
    }

    addNotification(
      '🎉 Proposta Aprovada pelo Cliente!',
      `O cliente ${clientName} (${prop?.clienteEmpresa || 'Cliente'}) aprovou digitalmente a proposta ${prop?.numero || ''}. Negócio atualizado para 'Fechado Ganho'!`,
      'success'
    );
  };

  const handleRequestRevisionFromPortal = (proposalId: string, comments: string) => {
    lastMutatedTimeRef.current = Date.now();
    const prop = propostasComerciais.find(p => p.id === proposalId);

    setPropostasComerciais(prev => prev.map(p => {
      if (p.id === proposalId) {
        return { ...p, estado: 'revisao', observacoes: comments };
      }
      return p;
    }));

    if (prop?.dealId) {
      setDeals(prev => prev.map(d => {
        if (d.id === prop.dealId) {
          return { ...d, etapa: 'negociacao', observacoes: `Revisão solicitada pelo cliente: ${comments}` };
        }
        return d;
      }));
    }

    addNotification(
      '💬 Solicitação de Ajuste na Proposta',
      `O cliente ${prop?.clienteEmpresa} solicitou alterações na proposta ${prop?.numero}. Motivo: "${comments}".`,
      'warn'
    );
  };

  const handleUpdateMetaUser = (userId: string, newMetaKz: number, newComissaoPct: number) => {
    lastMutatedTimeRef.current = Date.now();
    setComerciais(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, metaMensal: newMetaKz, comissao: newComissaoPct };
      }
      return u;
    }));
    addNotification(
      'Meta Atualizada 🎯',
      `Nova meta mensal e taxa de comissão atualizadas para o comercial.`,
      'info'
    );
  };


  const handleUserModalPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 250;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setUserModalPhoto(compressed);
        } else {
          setUserModalPhoto(base64);
        }
      };
      img.onerror = () => setUserModalPhoto(base64);
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };
  const [isEditGuidelinesOpen, setIsEditGuidelinesOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isPdfExtractorOpen, setIsPdfExtractorOpen] = useState(false);

  const [dbLoaded, setDbLoaded] = useState(false);
  const isTestDocument = (fileName: string) => {
    if (!fileName) return false;
    const lower = fileName.toLowerCase();
    return lower.includes('analise_critica') ||
           lower.includes('menongue') ||
           lower.includes('dm cosmos') ||
           lower.includes('sinalização') ||
           lower.includes('sinalizacao') ||
           lower.includes('termo de referência') ||
           lower.includes('termo de referencia') ||
           lower.includes('tr-024vf');
  };

  const [arquivos, setArquivos] = useState<Arquivo[]>(() => {
    const stored = loadFromLocalStorage<Arquivo[]>('gpa_arquivos_v2', []);
    return stored.filter(f => f && !isTestDocument(f.nome));
  });

  const [recycleItems, setRecycleItems] = useState<RecycleItem[]>(() => {
    return loadFromLocalStorage<RecycleItem[]>('gpa_recycle_bin', []);
  });

  useEffect(() => {
    saveToLocalStorage('gpa_recycle_bin', recycleItems);
  }, [recycleItems]);

  // Helper to safely merge files across Firestore, local storage, and server API without losing URLs
  const mergeArquivos = (prev: Arquivo[], incoming: Arquivo[]): Arquivo[] => {
    if (!Array.isArray(incoming)) return prev || [];
    if (!Array.isArray(prev)) return incoming || [];

    const map = new Map<string, Arquivo>();
    prev.forEach(f => {
      if (f && f.id) map.set(f.id, f);
    });

    incoming.forEach(inc => {
      if (!inc || !inc.id) return;
      const existing = map.get(inc.id);
      if (!existing) {
        map.set(inc.id, inc);
      } else {
        map.set(inc.id, {
          ...existing,
          ...inc,
          url: (inc.url && inc.url !== '') ? inc.url : existing.url,
          categoria: inc.categoria || existing.categoria || 'documento',
          observacoes: inc.observacoes || existing.observacoes || ''
        });
      }
    });

    return Array.from(map.values());
  };

  // Cache loggedUser & arquivos locally
  useEffect(() => {
    saveToLocalStorage('gpa_logged_user', loggedUser);
  }, [loggedUser]);

  // Helper to sync lastSavedPayloadRef with incoming data payload
  const updateLastSavedPayloadRef = (data: any) => {
    if (!data) return;
    const p = {
      comerciais: data.comerciais || comerciais,
      clients: data.clients || clients,
      visits: data.visits || visits,
      deals: data.deals || deals,
      guidelines: data.guidelines || guidelines,
      notifications: data.notifications || notifications,
      activityFeed: data.activityFeed || activityFeed,
      arquivos: Array.isArray(data.arquivos) ? data.arquivos : arquivos,
      crmName: data.crmName || crmName,
      telSede: data.telSede || telSede
    };
    lastSavedPayloadRef.current = JSON.stringify(p);
  };

  // 1. Initial Load & Real-time Firestore Cloud Database Listener
  useEffect(() => {
    // 1. First fetch from Firestore Cloud Database as absolute source of truth
    Promise.allSettled([
      loadCrmDataFromFirestore(),
      fetch('/api/crm-data').then(res => res.json())
    ]).then(([fbRes, fetchRes]) => {
      let dataToUse = null;

      if (fetchRes.status === 'fulfilled' && fetchRes.value && fetchRes.value.deals && fetchRes.value.deals.length > 0) {
        dataToUse = fetchRes.value;
      } else if (fbRes.status === 'fulfilled' && fbRes.value) {
        dataToUse = fbRes.value;
        setSyncTime('Sincronizado (Firebase Cloud)');
      }

      if (dataToUse) {
        updateLastSavedPayloadRef(dataToUse);
        if (dataToUse.comerciais && dataToUse.comerciais.length > 0) {
          const mergedComerciais = mergeWithInitialComerciais(dataToUse.comerciais);
          setComerciais(mergedComerciais);
          setLoggedUser(prev => {
            if (!prev) return prev;
            const self = mergedComerciais.find((u: Usuario) => u.id === prev.id || u.email === prev.email);
            return self ? { ...prev, ...self } : prev;
          });
        }
        if (dataToUse.clients && dataToUse.clients.length > 0) setClients(dataToUse.clients);
        if (dataToUse.visits && dataToUse.visits.length > 0) setVisits(dataToUse.visits);
        if (dataToUse.deals && dataToUse.deals.length > 0) setDeals(dataToUse.deals);
        if (dataToUse.guidelines && dataToUse.guidelines.length > 0) setGuidelines(dataToUse.guidelines);
        if (dataToUse.notifications && dataToUse.notifications.length > 0) setNotifications(dataToUse.notifications);
        if (dataToUse.activityFeed && dataToUse.activityFeed.length > 0) setActivityFeed(dataToUse.activityFeed);
        if (Array.isArray(dataToUse.arquivos)) {
          const clean = dataToUse.arquivos.filter((f: Arquivo) => f && !isTestDocument(f.nome));
          setArquivos(clean);
          saveToLocalStorage('gpa_arquivos_v2', clean);
        }
        if (dataToUse.crmName) setCrmName(dataToUse.crmName);
        if (dataToUse.telSede) setTelSede(dataToUse.telSede);
      }
      
      // Delay enabling saves by 1 second to ensure state is fully applied 
      // and prevent immediate save of empty/old local storage data over the cloud state
      setTimeout(() => {
        setDbLoaded(true);
      }, 1000);
    });

    // Real-Time Firestore Cloud Database Synchronization
    const unsubscribeFirestore = subscribeCrmDataFromFirestore((firestoreData) => {
      if (firestoreData) {
        // Always merge files in real-time so administrators & team members see uploaded documents instantly (<100ms)
        if (Array.isArray(firestoreData.arquivos)) {
          const clean = firestoreData.arquivos.filter((f: Arquivo) => f && !isTestDocument(f.nome));
          setArquivos(clean);
          saveToLocalStorage('gpa_arquivos_v2', clean);
        }

        if (Date.now() - lastMutatedTimeRef.current > 4000) {
          updateLastSavedPayloadRef(firestoreData);
          if (firestoreData.comerciais && firestoreData.comerciais.length > 0) {
            const mergedComerciais = mergeWithInitialComerciais(firestoreData.comerciais);
            setComerciais(mergedComerciais);
            setLoggedUser(prev => {
              if (!prev) return prev;
              const self = mergedComerciais.find((u: Usuario) => u.id === prev.id || u.email === prev.email);
              return self ? { ...prev, ...self } : prev;
            });
          }
          if (firestoreData.clients) setClients(firestoreData.clients);
          if (firestoreData.visits) setVisits(firestoreData.visits);
          if (firestoreData.deals) setDeals(firestoreData.deals);
          if (firestoreData.guidelines) setGuidelines(firestoreData.guidelines);
          if (firestoreData.notifications) setNotifications(firestoreData.notifications);
          if (firestoreData.activityFeed) setActivityFeed(firestoreData.activityFeed);
          if (firestoreData.crmName) setCrmName(firestoreData.crmName);
          if (firestoreData.telSede) setTelSede(firestoreData.telSede);
          if (firestoreData.baseDuasSemanas && Array.isArray(firestoreData.baseDuasSemanas)) {
            localStorage.setItem('gpa_base_duas_semanas', JSON.stringify(firestoreData.baseDuasSemanas));
            window.dispatchEvent(new Event('storage'));
          }
          
          const now = new Date();
          setSyncTime(`Firebase Cloud: ${now.toLocaleTimeString('pt-AO')}`);
        }
      }
    });

    // Load server logo
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => {
        if (data && data.logo) {
          setAppLogo(data.logo);
        }
      })
      .catch(() => {});

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // 2. Real-Time Periodic Polling for Live External Synchronization (15s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMutatedTimeRef.current < 5000) {
        return;
      }

      fetch('/api/crm-data')
        .then(res => {
          if (!res.ok) throw new Error('API not available');
          return res.json();
        })
        .then(data => {
          if (data) {
            if (Date.now() - lastMutatedTimeRef.current < 5000) {
              return;
            }
            updateLastSavedPayloadRef(data);
            if (data.comerciais && data.comerciais.length > 0) setComerciais(mergeWithInitialComerciais(data.comerciais));
            if (data.clients) setClients(data.clients);
            if (data.visits) setVisits(data.visits);
            if (data.deals) setDeals(data.deals);
            if (data.guidelines) setGuidelines(data.guidelines);
            if (data.notifications) setNotifications(data.notifications);
            if (data.activityFeed) setActivityFeed(data.activityFeed);
            if (Array.isArray(data.arquivos)) {
              const clean = data.arquivos.filter((f: Arquivo) => f && !isTestDocument(f.nome));
              setArquivos(clean);
              saveToLocalStorage('gpa_arquivos_v2', clean);
            }
            if (data.crmName) setCrmName(data.crmName);
            if (data.telSede) setTelSede(data.telSede);
            
            const now = new Date();
            setSyncTime(`Sincronizado às ${now.toLocaleTimeString('pt-AO')}`);
          }
        })
        .catch(() => {
          // Silently handle when api/crm-data is not running (e.g. static hosting on Vercel relying purely on Supabase)
        });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 3. Automatic Weekly Rollover & Auto-Archive (Checks hourly & transitions weeks automatically)
  useEffect(() => {
    const checkWeeklyRollover = () => {
      try {
        const lastCompiledWeek = localStorage.getItem('gpa_last_compiled_week_label');
        const weeks = getCurrentWeeks();
        const currentBucket = weeks.find(b => b.isCurrent);
        
        if (currentBucket && lastCompiledWeek && lastCompiledWeek !== currentBucket.label) {
          // A new week has started dynamically on calendar system date
          handleCompilarSemanal().catch(() => {});
        }
        if (currentBucket) {
          localStorage.setItem('gpa_last_compiled_week_label', currentBucket.label);
        }
      } catch (e) {
        console.error('Error checking weekly rollover:', e);
      }
    };

    checkWeeklyRollover();
    const rolloverInterval = setInterval(checkWeeklyRollover, 3600000);
    return () => clearInterval(rolloverInterval);
  }, []);

  // 3. Centralized Save State POST to Server & LocalStorage (with 1000ms Debounce)
  useEffect(() => {
    if (!dbLoaded) return;

    let baseDuasSemanas: any[] = [];
    try {
      const saved = localStorage.getItem('gpa_base_duas_semanas');
      if (saved) baseDuasSemanas = JSON.parse(saved);
    } catch (e) {}

    const payload = {
      comerciais,
      clients,
      visits,
      deals,
      guidelines,
      notifications,
      activityFeed,
      arquivos,
      crmName,
      telSede,
      baseDuasSemanas
    };

    const payloadStr = JSON.stringify(payload);
    if (payloadStr === lastSavedPayloadRef.current) {
      return; // No actual data changes
    }

    lastMutatedTimeRef.current = Date.now();
    lastSavedPayloadRef.current = payloadStr;

    // Local storage immediate sync
    saveToLocalStorage('gpa_comerciais', comerciais);
    saveToLocalStorage('gpa_clients', clients);
    saveToLocalStorage('gpa_visits', visits);
    saveToLocalStorage('gpa_deals', deals);
    saveToLocalStorage('gpa_guidelines', guidelines);
    saveToLocalStorage('gpa_notifications', notifications);
    saveToLocalStorage('gpa_activity_feed', activityFeed);
    saveToLocalStorage('gpa_arquivos_v2', arquivos);
    saveToLocalStorage('gpa_crm_name', crmName);
    saveToLocalStorage('gpa_tel_sede', telSede);

    const timer = setTimeout(() => {
      // 1. Save to local Express server database
      fetch('/api/crm-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr
      })
      .then(res => res.json())
      .catch(err => console.warn('Note: transient local save network info:', err?.message || err));

      // 2. Save to Firebase Firestore cloud database
      saveCrmDataToFirestore(payload).catch(err => console.error('Error saving to Firestore:', err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [dbLoaded, comerciais, clients, visits, deals, guidelines, notifications, activityFeed, arquivos, crmName, telSede]);

  // Synchronize correct corporate emails, deduplicate excess admin accounts and seed missing default accounts on mount
  useEffect(() => {
    setComerciais(prev => {
      const sanitized = sanitizeAndDeduplicateUsers(prev);
      let changed = sanitized.length !== prev.length;
      let currentList = [...sanitized];

      // Update existing entries if needed
      const updated = currentList.map(u => {
        let newU = { ...u };
        
        // Ensure David Neto is Admin & Gestor with full permissions
        if (newU.email.toLowerCase() === 'david.neto@gpaangola.co.ao' || newU.nome === 'David Neto') {
          if (newU.perfil !== 'admin') {
            changed = true;
            newU = {
              ...newU,
              perfil: 'admin',
              funcao: 'Administrador, Gestor & Comercial',
              senha: newU.senha || 'gpa2026'
            };
          }
        }

        // Ensure Admin, Admin1 and Admin2 are Admins/Gestores
        if (newU.email.toLowerCase() === 'admin@gpaangola.co.ao' || newU.nome === 'Admin') {
          if (newU.perfil !== 'admin') {
            changed = true;
            newU = { ...newU, perfil: 'admin', funcao: 'Administrador Principal', senha: newU.senha || 'admin' };
          }
        }
        if (newU.email.toLowerCase() === 'admin1@gpaangola.co.ao' || newU.nome === 'Admin1') {
          if (newU.perfil !== 'admin') {
            changed = true;
            newU = { ...newU, perfil: 'admin', funcao: 'Gestor & Administrador', senha: newU.senha || 'admin' };
          }
        }
        if (newU.email.toLowerCase() === 'admin2@gpaangola.co.ao' || newU.nome === 'Admin2') {
          if (newU.perfil !== 'admin') {
            changed = true;
            newU = { ...newU, perfil: 'admin', funcao: 'Gestor & Administrador', senha: newU.senha || 'admin' };
          }
        }

        // Ensure Carlos Francisco is Comercial
        if (newU.email.toLowerCase() === 'carlos.francisco@gpaangola.co.ao' || newU.nome === 'Carlos Francisco') {
          if (newU.perfil !== 'comercial') {
            changed = true;
            newU = { ...newU, perfil: 'comercial', funcao: 'Comercial', senha: newU.senha || 'gpa2026' };
          }
        }

        // Ensure Ilídio Pedro uses ilidio.pedro@gpaangola.co.ao without accents
        if (newU.nome === 'Ilídio Pedro' || newU.email.toLowerCase().includes('ilidio')) {
          if (newU.email !== 'ilidio.pedro@gpaangola.co.ao') {
            changed = true;
            newU = { ...newU, email: 'ilidio.pedro@gpaangola.co.ao' };
          }
        }

        return newU;
      });

      saveToLocalStorage('gpa_comerciais', updated);
      return updated;
    });

    setLoggedUser(current => {
      if (!current) return null;
      let newCurrent = { ...current };

      const cName = newCurrent.nome.toLowerCase().trim();
      const cEmail = newCurrent.email.toLowerCase().trim();

      // If current user is a duplicate admin account that was removed, redirect to main Admin
      if ((cName === 'admin' || cName === 'administrador') && cEmail !== 'admin@gpaangola.co.ao') {
        newCurrent = {
          id: 'u10',
          nome: 'Admin',
          email: 'admin@gpaangola.co.ao',
          perfil: 'admin',
          funcao: 'Administrador Principal',
          metaMensal: 0,
          metaSemanal: 0,
          comissao: 0,
          pesoConversao: 0,
          telefone: '922000000',
          status: 'ativo'
        };
      }

      if (newCurrent.email.toLowerCase() === 'david.neto@gpaangola.co.ao' || newCurrent.nome === 'David Neto') {
        newCurrent = { ...newCurrent, perfil: 'admin', funcao: 'Administrador, Gestor & Comercial' };
      }
      return newCurrent;
    });
  }, []);

  // Load logo from server on mount
  useEffect(() => {
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.logo === 'string' && data.logo !== '') {
          setAppLogo(data.logo);
        }
      })
      .catch(err => console.error('Error fetching logo from server:', err));
  }, []);

  const handleSaveAppLogo = (logo: string) => {
    setAppLogo(logo);
    fetch('/api/logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo })
    })
    .then(res => res.json())
    .catch(err => console.error('Failed to save logo to server:', err));
  };

  // Auth Actions
  const handleLogin = (user: Usuario) => {
    setLoggedUser(user);
    // Push entry to logs
    const newLog: ActivityFeed = {
      type: 'client',
      text: `${user.nome} iniciou sessão no sistema.`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setLoggedUser(null);
  };

  // Global Realtime Chat Sync & Floating Notification Toast Engine
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gpa_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chatToast, setChatToast] = useState<{ senderName: string; text: string; channelId: string } | null>(null);

  // Background audio chime
  const playAppPing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      setTimeout(() => { try { ctx.close(); } catch {} }, 300);
    } catch (e) {}
  };

  // Poll chat messages in background globally across all views
  useEffect(() => {
    if (!loggedUser) return;

    const fetchGlobalMessages = async () => {
      try {
        const res = await fetch('/api/realtime/messages');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setGlobalChatMessages(prev => {
              if (prev.length < data.messages.length) {
                // New message arrived!
                const newMsgs = data.messages.slice(prev.length);
                const latestFromOther = newMsgs.filter((m: any) => m.senderId !== loggedUser.id && !m.isSystem).pop();
                if (latestFromOther) {
                  // If user is not in chat view, show floating toast and play chime
                  if (activeTab !== 'chat') {
                    setChatToast({
                      senderName: latestFromOther.senderName,
                      text: latestFromOther.text || (latestFromOther.attachment ? 'Anexo recebido' : 'Nova mensagem'),
                      channelId: latestFromOther.channelId
                    });
                    playAppPing();
                  }
                }
              }
              return data.messages;
            });
            try {
              localStorage.setItem('gpa_chat_messages', JSON.stringify(data.messages));
            } catch (e) {}
          }
        }
      } catch (e) {}
    };

    fetchGlobalMessages();
    const interval = setInterval(fetchGlobalMessages, 2000);
    return () => clearInterval(interval);
  }, [loggedUser, activeTab]);

  // Compute total unread chat messages count for Sidebar badge
  const unreadChatCount = React.useMemo(() => {
    if (!loggedUser || !globalChatMessages.length) return 0;
    try {
      const savedLastRead = localStorage.getItem('gpa_chat_last_read');
      const lastReadMap: Record<string, number> = savedLastRead ? JSON.parse(savedLastRead) : {};

      return globalChatMessages.filter(m => {
        if (m.senderId === loggedUser.id || m.isSystem) return false;
        if (m.channelId.startsWith('dm_')) {
          if (!m.channelId.toLowerCase().includes(loggedUser.id.toLowerCase())) return false;
        }
        const lastRead = lastReadMap[m.channelId] || 0;
        const msgTime = m.createdAt || (m.timestamp ? Date.parse(`1970-01-01T${m.timestamp}:00Z`) || 0 : 0);
        return msgTime > lastRead;
      }).length;
    } catch {
      return 0;
    }
  }, [loggedUser, globalChatMessages]);

  // Add notification helper with Role-based multi-channel dispatch
  const addNotification = (title: string, text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    dispatchRoleNotification(
      title,
      text,
      type,
      loggedUser,
      comerciais,
      (newItem) => setNotifications(prev => [newItem, ...prev.slice(0, 15)])
    );
  };

  // Move deal inside Kanban
  const handleMoveDeal = (dealId: string, dir: number) => {
    const stages = ['lead', 'contato', 'visita', 'proposta', 'negociacao', 'fechado'];
    setDeals(prev => {
      return prev.map(d => {
        if (d.id === dealId) {
          const curIdx = stages.indexOf(d.etapa);
          const nextIdx = curIdx + dir;
          if (nextIdx >= 0 && nextIdx < stages.length) {
            const nextStage = stages[nextIdx];
            
            // Add activity log
            const newLog: ActivityFeed = {
              type: 'deal',
              text: `${loggedUser?.nome || 'Comercial'} moveu "${d.titulo}" para ${nextStage.toUpperCase()}`,
              time: 'Agora'
            };
            setActivityFeed(feed => [newLog, ...feed]);

            // Notify if stage is closed/won
            if (nextStage === 'fechado') {
              addNotification(
                'Negócio Fechado! 🎉',
                `A proposta de ${d.clienteNome} no valor de ${new Intl.NumberFormat('pt-AO').format(d.valor)} Kz foi ganha!`,
                'success'
              );
            }

            return { ...d, etapa: nextStage };
          }
        }
        return d;
      });
    });
  };

  // Dynamic invoice simulation trigger
  const handleSimulateSync = () => {
    const validClients = clients.filter(c => c.status === 'ativo');
    if (validClients.length === 0) return;

    const randomClient = validClients[Math.floor(Math.random() * validClients.length)];
    const randomComercial = comerciais.find(u => u.id === randomClient.responsavel) || comerciais[0];
    const simulatedVal = Math.floor(Math.random() * (15000000 - 1500000) + 1500000);

    const newDealId = 'd_' + Date.now();
    const newDeal: Deal = {
      id: newDealId,
      clienteNome: randomClient.empresa,
      titulo: `Fatura Externa ERP ${randomClient.empresa}`,
      valor: simulatedVal,
      etapa: 'fechado',
      comercialId: randomComercial.id,
      comercialNome: randomComercial.nome,
      prioridade: 'Alta',
      diasAberto: 0
    };

    setDeals(prev => [newDeal, ...prev]);

    const date = new Date();
    const timeStr = date.toLocaleTimeString('pt-AO');
    setSyncTime(`Sincronizado às ${timeStr}`);

    // Push log and notification
    const newLog: ActivityFeed = {
      type: 'deal',
      text: `Recebida fatura externa de ${new Intl.NumberFormat('pt-AO').format(simulatedVal)} Kz do ERP Primavera (Cliente: ${randomClient.empresa})`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);

    addNotification(
      'ERP Primavera Sync 🔄',
      `Fatura integrada para ${randomClient.empresa} no valor de ${new Intl.NumberFormat('pt-AO').format(simulatedVal)} Kz.`,
      'success'
    );

    alert(`Fatura importada com sucesso do Primavera ERP!\n\nCliente: ${randomClient.empresa}\nValor: ${new Intl.NumberFormat('pt-AO').format(simulatedVal)} Kz\nVendedor: ${randomComercial.nome}`);
  };

  // Export CSV Helper
  const handleExportCSV = (excelMode = false) => {
    let headers = ['Negócio', 'Cliente', 'Valor (Kz)', 'Etapa', 'Vendedor', 'Prioridade'];
    let csvRows = [headers.join(excelMode ? '\t' : ',')];

    deals.forEach(d => {
      let row = [
        `"${d.titulo}"`,
        `"${d.clienteNome}"`,
        d.valor,
        `"${d.etapa.toUpperCase()}"`,
        `"${d.comercialNome}"`,
        `"${d.prioridade}"`
      ];
      csvRows.push(row.join(excelMode ? '\t' : ','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', excelMode ? 'relatorio_deals.xls' : 'relatorio_deals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions inside modals
  const handleScheduleVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const clientId = fd.get('clientId') as string;
    const data = fd.get('data') as string;
    const hora = fd.get('hora') as string;
    const local = fd.get('localizacao') as string;

    const chosenClient = clients.find(c => c.id === clientId);
    if (!chosenClient) return;

    // Update clients schedule
    setClients(prev => {
      return prev.map(c => {
        if (c.id === clientId) {
          return { ...c, proximaVisita: data };
        }
        return c;
      });
    });

    // Create a mock visit event or append notification
    addNotification(
      'Visita Agendada 📅',
      `Visita com ${chosenClient.empresa} agendada para ${data} às ${hora}`,
      'info'
    );

    setIsScheduleVisitOpen(false);
  };

  const handleAddClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const empresa = fd.get('empresa') as string;
    const nome = fd.get('nome') as string;
    const nif = fd.get('nif') as string;
    const telefone = fd.get('telefone') as string;
    const provincia = fd.get('provincia') as string;
    const segmento = fd.get('segmento') as string;
    const endereco = (fd.get('endereco') as string) || '';

    const newClient: Cliente = {
      id: 'c_' + Date.now(),
      nome,
      empresa,
      nif,
      telefone,
      provincia,
      segmento,
      status: 'ativo',
      responsavel: loggedUser?.id || 'u1',
      ultimaVisita: '-',
      proximaVisita: '-',
      endereco: endereco || 'Luanda, Angola'
    };

    setClients(prev => [newClient, ...prev]);

    // Push log
    const newLog: ActivityFeed = {
      type: 'client',
      text: `Cadastrou o cliente "${empresa}" no sistema.`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);

    addNotification(
      '👤 Novo Cliente (Notificação p/ Gestor)',
      `O comercial ${loggedUser?.nome || 'Comercial'} cadastrou o cliente "${empresa}" (${provincia}).`,
      'success'
    );

    setIsAddClientOpen(false);
  };

  const handleEditClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientForEdit) return;

    const fd = new FormData(e.currentTarget);
    const empresa = fd.get('empresa') as string;
    const nome = fd.get('nome') as string;
    const nif = fd.get('nif') as string;
    const telefone = fd.get('telefone') as string;
    const provincia = fd.get('provincia') as string;
    const segmento = fd.get('segmento') as string;
    const endereco = (fd.get('endereco') as string) || '';

    setClients(prev => {
      return prev.map(c => {
        if (c.id === selectedClientForEdit.id) {
          return {
            ...c,
            empresa,
            nome,
            nif,
            telefone,
            provincia,
            segmento,
            endereco: endereco || ''
          };
        }
        return c;
      });
    });

    setIsEditClientOpen(false);
    setSelectedClientForEdit(null);
  };

  const handleAddVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const clientId = fd.get('clientId') as string;
    const contato = fd.get('contato') as string;
    const produtos = fd.get('produtos') as string;
    const nec = fd.get('necessidade') as string;
    const res = fd.get('resultado') as string;
    const targetComercialId = fd.get('comercialId') as string;

    const chosenClient = clients.find(c => c.id === clientId);
    if (!chosenClient) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('pt-AO').substring(0, 5);

    let finalComercialNome = loggedUser?.nome || 'Amélia Cassinda';
    if (isUserManager(loggedUser) && targetComercialId && comerciais) {
      const foundCom = comerciais.find(u => u.id === targetComercialId);
      if (foundCom) {
        finalComercialNome = foundCom.nome;
      }
    }

    const newVisit: Visita = {
      id: 'v_' + Date.now(),
      clienteNome: contato,
      empresa: chosenClient.empresa,
      comercialNome: finalComercialNome,
      data: todayStr,
      hora: timeStr,
      localizacao: chosenClient.endereco || 'Instalações Cliente',
      resultado: res,
      produtos,
      necessidade: nec
    };

    setVisits(prev => [newVisit, ...prev]);

    // Update clients last visit date
    setClients(prev => {
      return prev.map(c => {
        if (c.id === clientId) {
          return { ...c, ultimaVisita: todayStr };
        }
        return c;
      });
    });

    // Log
    const newLog: ActivityFeed = {
      type: 'visit',
      text: `${loggedUser?.nome || 'Comercial'} registou visita técnica de ${finalComercialNome} com ${chosenClient.empresa}`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);

    addNotification(
      '📅 Nova Visita (Notificação p/ Gestor)',
      `O comercial ${finalComercialNome} registou uma nova visita técnica para ${chosenClient.empresa}.`,
      'info'
    );

    setIsAddVisitOpen(false);
  };

  const handleEditVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVisitForEdit) return;
    const fd = new FormData(e.currentTarget);
    const empresa = fd.get('empresa') as string;
    const clienteNome = fd.get('clienteNome') as string;
    const comercialNome = fd.get('comercialNome') as string;
    const produtos = fd.get('produtos') as string;
    const necessidade = fd.get('necessidade') as string;
    const resultado = fd.get('resultado') as string;
    const data = fd.get('data') as string;
    const hora = fd.get('hora') as string;
    const localizacao = fd.get('localizacao') as string;

    const updatedVisits = visits.map(v => {
      if (v.id === selectedVisitForEdit.id) {
        return {
          ...v,
          empresa,
          clienteNome,
          comercialNome,
          produtos,
          necessidade,
          resultado,
          data,
          hora,
          localizacao
        };
      }
      return v;
    });

    setVisits(updatedVisits);
    saveToLocalStorage('gpa_visits', updatedVisits);
    setIsEditVisitOpen(false);
    setSelectedVisitForEdit(null);
    addNotification('Visita Atualizada ✏️', `Relatório de visita de ${empresa} atualizado.`, 'info');
  };

  // Helper to move deleted items to Recycle Bin
  const moveToRecycleBin = (
    tipo: RecycleItem['tipo'],
    originalId: string | number,
    titulo: string,
    detalhes: string,
    originalData: any
  ) => {
    lastMutatedTimeRef.current = Date.now();
    const newItem: RecycleItem = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalId,
      tipo,
      titulo,
      detalhes,
      deletedAt: new Date().toISOString(),
      deletedBy: loggedUser?.nome || 'Utilizador',
      data: originalData
    };
    setRecycleItems(prev => [newItem, ...prev]);

    logOperation(
      'exclusao',
      tipo === 'deal' ? 'deal' : tipo === 'cliente' ? 'cliente' : tipo === 'visita' ? 'visita' : tipo === 'utilizador' ? 'utilizador' : 'arquivo',
      String(originalId),
      `Exclusão de ${titulo} (${detalhes})`,
      originalData,
      null,
      true
    );

    addNotification(
      'Movido para a Lixeira 🗑️',
      `"${titulo}" foi enviado para a Lixeira (Configurações). Pode restaurá-lo a qualquer momento.`,
      'info'
    );
  };

  const handleRestoreItem = (item: RecycleItem) => {
    lastMutatedTimeRef.current = Date.now();
    setRecycleItems(prev => prev.filter(i => i.id !== item.id));

    logOperation(
      'reversao',
      item.tipo === 'deal' ? 'deal' : item.tipo === 'cliente' ? 'cliente' : item.tipo === 'visita' ? 'visita' : item.tipo === 'utilizador' ? 'utilizador' : 'arquivo',
      String(item.originalId),
      `Restauração de "${item.titulo}" da lixeira`,
      null,
      item.data,
      false
    );

    switch (item.tipo) {
      case 'deal': {
        setDeals(prev => {
          const exists = prev.some(d => d.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_deals', updated);
          return updated;
        });
        break;
      }
      case 'cliente': {
        setClients(prev => {
          const exists = prev.some(c => c.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_clients', updated);
          return updated;
        });
        break;
      }
      case 'visita': {
        setVisits(prev => {
          const exists = prev.some(v => v.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_visits', updated);
          return updated;
        });
        break;
      }
      case 'utilizador': {
        setComerciais(prev => {
          const exists = prev.some(u => u.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_comerciais', updated);
          return updated;
        });
        break;
      }
      case 'arquivo': {
        setArquivos(prev => {
          const exists = prev.some(f => f.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_arquivos_v2', updated);
          return updated;
        });
        break;
      }
      case 'relatorio': {
        setRelatoriosDiarios(prev => {
          const exists = prev.some(r => r.id === item.data.id);
          const updated = exists ? prev : [item.data, ...prev];
          saveToLocalStorage('gpa_relatorios_diarios', updated);
          return updated;
        });
        break;
      }
      default:
        break;
    }

    addNotification(
      'Registo Restaurado 🔄',
      `"${item.titulo}" foi restaurado com sucesso e voltou ao CRM.`,
      'success'
    );
  };

  const handlePermanentDelete = (recycleId: string) => {
    lastMutatedTimeRef.current = Date.now();
    setRecycleItems(prev => prev.filter(i => i.id !== recycleId));
    addNotification(
      'Eliminado Permanentemente ❌',
      'O registo foi removido definitivamente da lixeira.',
      'warn'
    );
  };

  const handleClearRecycleBin = () => {
    lastMutatedTimeRef.current = Date.now();
    setRecycleItems([]);
    addNotification(
      'Lixeira Esvaziada 🗑️',
      'Todos os registos da lixeira foram permanentemente eliminados.',
      'warn'
    );
  };

  const handleDeleteVisit = (visitId: string) => {
    const target = visits.find(v => v.id === visitId);
    if (target) {
      moveToRecycleBin('visita', visitId, `Visita: ${target.empresa}`, `Data: ${target.data} | Contacto: ${target.clienteNome} | Comercial: ${target.comercialNome}`, target);
    }
    const updatedVisits = visits.filter(v => v.id !== visitId);
    setVisits(updatedVisits);
    saveToLocalStorage('gpa_visits', updatedVisits);
  };

  const handleDeleteClient = (clientId: string) => {
    const target = clients.find(c => c.id === clientId);
    if (target) {
      moveToRecycleBin('cliente', clientId, target.empresa, `Contacto: ${target.nome} | NIF: ${target.nif} | Província: ${target.provincia}`, target);
    }
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    saveToLocalStorage('gpa_clients', updatedClients);
  };

  const handleDeleteUser = (userId: string) => {
    const target = comerciais.find(u => u.id === userId);
    if (target) {
      moveToRecycleBin('utilizador', userId, target.nome, `Email: ${target.email} | Função: ${target.funcao || 'Comercial'}`, target);
    }
    const updatedComerciais = comerciais.filter(u => u.id !== userId);
    setComerciais(updatedComerciais);
    saveToLocalStorage('gpa_comerciais', updatedComerciais);
  };

  const handleDeleteDeal = (dealId: string) => {
    const target = deals.find(d => d.id === dealId);
    if (target) {
      moveToRecycleBin('deal', dealId, target.titulo, `Cliente: ${target.clienteNome} | Valor: ${new Intl.NumberFormat('pt-AO').format(target.valor)} Kz | Vendedor: ${target.comercialNome}`, target);
    }
    const updatedDeals = deals.filter(d => d.id !== dealId);
    setDeals(updatedDeals);
    saveToLocalStorage('gpa_deals', updatedDeals);
  };

  const handleEditScheduleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedScheduleForEdit) return;
    const fd = new FormData(e.currentTarget);
    const proximaVisita = fd.get('proximaVisita') as string;

    const updatedClients = clients.map(c => {
      if (c.id === selectedScheduleForEdit.id) {
        return { ...c, proximaVisita };
      }
      return c;
    });

    setClients(updatedClients);
    saveToLocalStorage('gpa_clients', updatedClients);
    setIsEditScheduleOpen(false);
    setSelectedScheduleForEdit(null);
    addNotification('Agendamento Atualizado 📅', `Nova data de visita definida para ${selectedScheduleForEdit.empresa}.`, 'info');
  };

  const handleDeleteSchedule = (clientId: string) => {
    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        return { ...c, proximaVisita: '-' };
      }
      return c;
    });

    setClients(updatedClients);
    saveToLocalStorage('gpa_clients', updatedClients);
    addNotification('Agendamento Removido 🗑️', 'A data de visita agendada foi removida.', 'info');
  };

  const handleAddDealSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const titulo = fd.get('titulo') as string;
    const clientId = fd.get('clientId') as string;
    const valor = parseFloat(fd.get('valor') as string || '0');
    const prio = fd.get('prioridade') as string;
    const etapa = fd.get('etapa') as string;

    const chosenClient = clients.find(c => c.id === clientId);
    if (!chosenClient) return;

    const newDeal: Deal = {
      id: 'd_' + Date.now(),
      clienteNome: chosenClient.empresa,
      titulo,
      valor,
      etapa: etapa as Deal['etapa'],
      comercialId: loggedUser?.id || 'u1',
      comercialNome: loggedUser?.nome || 'Amélia Cassinda',
      prioridade: prio as Deal['prioridade'],
      diasAberto: 0
    };

    setDeals(prev => [newDeal, ...prev]);

    logOperation(
      'criacao',
      'deal',
      newDeal.id,
      `Criação da proposta "${titulo}" (${new Intl.NumberFormat('pt-AO').format(valor)} Kz) para ${chosenClient.empresa}`,
      null,
      newDeal
    );

    // Log
    const newLog: ActivityFeed = {
      type: 'deal',
      text: `Criada proposta "${titulo}" para ${chosenClient.empresa} no valor de ${new Intl.NumberFormat('pt-AO').format(valor)} Kz`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);

    addNotification(
      '💼 Novo Negócio (Notificação p/ Gestor)',
      `O comercial ${loggedUser?.nome || 'Comercial'} registou a proposta "${titulo}" (${new Intl.NumberFormat('pt-AO').format(valor)} Kz) para ${chosenClient.empresa}.`,
      'success'
    );

    setIsAddDealOpen(false);
  };

  const handleAddDeal = (dealData: Partial<Deal>) => {
    const newDeal: Deal = {
      id: 'd_' + Date.now(),
      clienteNome: dealData.clienteNome || 'Cliente',
      titulo: dealData.titulo || 'Nova Proposta',
      valor: dealData.valor || 0,
      etapa: (dealData.etapa as Deal['etapa']) || 'proposta',
      comercialId: loggedUser?.id || 'u1',
      comercialNome: dealData.comercialNome || loggedUser?.nome || 'Luísa Baltazar',
      prioridade: (dealData.prioridade as Deal['prioridade']) || 'Normal',
      diasAberto: 1,
      proximaAcao: dealData.proximaAcao,
      observacoes: dealData.observacoes,
      semana: dealData.semana,
      dataEnvio: dealData.dataEnvio
    };

    setDeals(prev => [newDeal, ...prev]);

    const newLog: ActivityFeed = {
      type: 'deal',
      text: `Criada proposta "${newDeal.titulo}" para ${newDeal.clienteNome} no valor de ${new Intl.NumberFormat('pt-AO').format(newDeal.valor)} Kz`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);

    addNotification(
      '💼 Nova Proposta na Base Semanal',
      `Registada proposta "${newDeal.titulo}" (${new Intl.NumberFormat('pt-AO').format(newDeal.valor)} Kz) para ${newDeal.clienteNome}.`,
      'success'
    );
  };

  // Excel Bulk Data Import Handlers with Global Distribution across 13 Views
  const handleImportDeals = (newDeals: Deal[], rawRows?: any[]) => {
    const res = distributeImportedRows(rawRows && rawRows.length > 0 ? rawRows : newDeals, {
      deals,
      clients,
      visits,
      relatoriosDiarios,
      historicoSemanas,
      comerciais
    });

    setDeals(res.deals);
    setClients(res.clients);
    setVisits(res.visits);
    setRelatoriosDiarios(res.relatoriosDiarios);
    setHistoricoSemanas(res.historicoSemanas);
    if (res.comerciais.length > comerciais.length) {
      setComerciais(res.comerciais);
    }

    const totalVal = newDeals.reduce((acc, d) => acc + (d.valor || 0), 0);
    const newLog: ActivityFeed = {
      type: 'deal',
      text: `Importados ${newDeals.length} negócios via Excel no valor total de ${new Intl.NumberFormat('pt-AO').format(totalVal)} Kz`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);
    addNotification(
      'Importação Excel Concluída 📊',
      `${newDeals.length} propostas foram distribuídas automaticamente por todas as 13 telas do CRM.`,
      'success'
    );
  };

  const handleImportClients = (newClients: Cliente[]) => {
    setClients(prev => [...newClients, ...prev]);
    const newLog: ActivityFeed = {
      type: 'client',
      text: `Importados ${newClients.length} novos clientes via Excel`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);
    addNotification(
      'Clientes Importados 👥',
      `${newClients.length} clientes foram adicionados à base de dados do CRM.`,
      'success'
    );
  };

  const handleImportVisits = (newVisits: Visita[]) => {
    setVisits(prev => [...newVisits, ...prev]);
    const newLog: ActivityFeed = {
      type: 'visit',
      text: `Importadas ${newVisits.length} visitas via Excel`,
      time: 'Agora'
    };
    setActivityFeed(prev => [newLog, ...prev]);
    addNotification(
      'Visitas Importadas 📅',
      `${newVisits.length} registos de visitas foram carregados no sistema.`,
      'success'
    );
  };

  const handleAddUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nome = fd.get('nome') as string;
    const email = fd.get('email') as string;
    const senha = fd.get('senha') as string;
    const perfil = fd.get('perfil') as string;
    const funcao = fd.get('funcao') as string;
    const meta = parseFloat(fd.get('metaSemanal') as string || '0');
    const prov = fd.get('provincia') as string;

    const newUser: Usuario = {
      id: 'u_' + Date.now(),
      nome,
      email,
      senha: senha || 'gpa2026',
      perfil: perfil as Usuario['perfil'],
      funcao,
      metaMensal: meta * 4,
      metaSemanal: meta,
      comissao: 0.03,
      pesoConversao: 0.4,
      telefone: '922000000',
      foto: userModalPhoto || '',
      status: 'ativo',
      silencioso: false,
      provincia: prov
    };

    setComerciais(prev => [...prev, newUser]);
    setIsAddUserOpen(false);
    setUserModalPhoto('');
  };

  const handleEditUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const fd = new FormData(e.currentTarget);
    const nome = fd.get('nome') as string;
    const email = fd.get('email') as string;
    const senha = fd.get('senha') as string;
    const perfil = fd.get('perfil') as string;
    const funcao = fd.get('funcao') as string;
    const meta = parseFloat(fd.get('metaSemanal') as string || '0');
    const prov = fd.get('provincia') as string;
    const newPhoto = userModalPhoto !== '' ? userModalPhoto : selectedUserForEdit.foto;

    setComerciais(prev => {
      return prev.map(u => {
        if (u.id === selectedUserForEdit.id) {
          return {
            ...u,
            nome: nome || u.nome,
            email: email || u.email,
            senha: senha || u.senha,
            perfil: (perfil as Usuario['perfil']) || u.perfil,
            funcao: funcao || u.funcao,
            metaSemanal: meta,
            metaMensal: meta * 4,
            provincia: prov || u.provincia,
            foto: newPhoto
          };
        }
        return u;
      });
    });

    setLoggedUser(current => {
      if (!current || current.id !== selectedUserForEdit.id) return current;
      return {
        ...current,
        nome: nome || current.nome,
        email: email || current.email,
        senha: senha || current.senha,
        perfil: (perfil as Usuario['perfil']) || current.perfil,
        funcao: funcao || current.funcao,
        metaSemanal: meta,
        metaMensal: meta * 4,
        provincia: prov || current.provincia,
        foto: newPhoto
      };
    });

    setIsEditUserOpen(false);
    setSelectedUserForEdit(null);
    setUserModalPhoto('');
  };

  const handleEditGuidelinesSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updated = guidelines.map(g => {
      const acao = fd.get(`g${g.id}_acao`) as string;
      const criterio = fd.get(`g${g.id}_criterio`) as string;
      const proximo = fd.get(`g${g.id}_proximo`) as string;
      return {
        ...g,
        acao: acao || g.acao,
        criterio: criterio || g.criterio,
        proximoPasso: proximo || g.proximoPasso
      };
    });
    setGuidelines(updated);
    setIsEditGuidelinesOpen(false);
  };

  // Profile Photo Upload callback
  const handlePhotoUpload = (base64: string) => {
    if (!loggedUser) return;
    lastMutatedTimeRef.current = Date.now();
    const updatedUser = { ...loggedUser, foto: base64 };
    setLoggedUser(updatedUser);
    saveToLocalStorage('gpa_logged_user', updatedUser);

    const updatedComerciais = comerciais.map(u => {
      if (u.id === loggedUser.id) {
        return { ...u, foto: base64 };
      }
      return u;
    });

    setComerciais(updatedComerciais);
    saveToLocalStorage('gpa_comerciais', updatedComerciais);

    // Immediately persist to Firestore Cloud & Server API so Vercel and AI Studio stay 100% in sync
    const payload = {
      comerciais: updatedComerciais,
      clients,
      visits,
      deals,
      guidelines,
      notifications,
      activityFeed,
      arquivos,
      crmName,
      telSede
    };

    saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving profile photo to Firestore:', err));
    fetch('/api/crm-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Error saving profile photo to server API:', err));
  };

  // User profile settings updates (name, password, photo & multi-channel notification settings)
  const handleUpdateProfile = (
    nome: string,
    senha: string,
    foto?: string,
    preferenciaNotificacao?: 'whatsapp' | 'email' | 'telegram' | 'todos' | 'nenhum',
    whatsappNumero?: string,
    telegramChatId?: string,
    emailNotificacao?: string
  ) => {
    if (!loggedUser) return;
    lastMutatedTimeRef.current = Date.now();
    const updatedUser: Usuario = {
      ...loggedUser,
      nome: nome || loggedUser.nome,
      senha: senha || loggedUser.senha,
      ...(foto ? { foto } : {}),
      preferenciaNotificacao: preferenciaNotificacao || loggedUser.preferenciaNotificacao || 'todos',
      whatsappNumero: whatsappNumero !== undefined ? whatsappNumero : loggedUser.whatsappNumero,
      telegramChatId: telegramChatId !== undefined ? telegramChatId : loggedUser.telegramChatId,
      emailNotificacao: emailNotificacao !== undefined ? emailNotificacao : loggedUser.emailNotificacao
    };

    setLoggedUser(updatedUser);
    saveToLocalStorage('gpa_logged_user', updatedUser);

    const updatedList = comerciais.map(u => {
      if (u.id === loggedUser.id) {
        return updatedUser;
      }
      return u;
    });

    setComerciais(updatedList);
    saveToLocalStorage('gpa_comerciais', updatedList);

    // Save state to server / Firestore
    const payload = {
      comerciais: updatedList,
      clients,
      visits,
      deals,
      guidelines,
      notifications,
      activityFeed,
      arquivos,
      crmName,
      telSede
    };

    saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving updated profile to Firestore:', err));
    fetch('/api/crm-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Error saving updated profile to server API:', err));
  };

  const handleUpdateUserPhoto = (userId: string, photoBase64: string) => {
    lastMutatedTimeRef.current = Date.now();
    if (loggedUser && loggedUser.id === userId) {
      const updatedLogged = { ...loggedUser, foto: photoBase64 };
      setLoggedUser(updatedLogged);
      saveToLocalStorage('gpa_logged_user', updatedLogged);
    }

    const updatedComerciais = comerciais.map(u => {
      if (u.id === userId) {
        return { ...u, foto: photoBase64 };
      }
      return u;
    });

    setComerciais(updatedComerciais);
    saveToLocalStorage('gpa_comerciais', updatedComerciais);

    const payload = {
      comerciais: updatedComerciais,
      clients,
      visits,
      deals,
      guidelines,
      notifications,
      activityFeed,
      arquivos,
      crmName,
      telSede
    };

    saveCrmDataToFirestore(payload).catch(err => console.warn('Error saving user photo:', err));
    fetch('/api/crm-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});

    fetch('/api/supabase/migrate', { method: 'POST' }).catch(() => {});

    addNotification(
      '📷 Fotografia de Perfil Atualizada',
      `A fotografia do utilizador foi atualizada e guardada no sistema e no Supabase.`,
      'success'
    );
  };

  // Upload a document / PDF / media / comprobante with Vercel and Cloud storage fallback
  const handleUploadFile = async (
    name: string,
    type: string,
    size: number,
    base64Data: string,
    clientAssoc?: string,
    dealAssoc?: string,
    categoria?: 'documento' | 'comprovativo' | 'fatura' | 'contrato' | 'relatorio' | 'outro',
    observacoes?: string,
    customDate?: string
  ) => {
    lastMutatedTimeRef.current = Date.now();
    let finalUrl = base64Data;
    let finalName = name;
    let finalTipo = type || 'application/octet-stream';
    let finalTamanho = size || 0;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, size, data: base64Data })
      });
      
      if (res.ok) {
        const responseData = await res.json();
        if (responseData && responseData.url) {
          finalUrl = responseData.url;
          finalName = responseData.name || name;
          finalTipo = responseData.tipo || type;
          finalTamanho = responseData.tamanho || size;
        }
      }
    } catch (apiErr) {
      console.warn('Endpoint de upload físico indisponível ou ambiente Vercel serverless. A guardar ficheiro via Base64/Firestore:', apiErr);
    }

    const autoCategory = categoria || (
      name.toLowerCase().includes('comprov') || name.toLowerCase().includes('recibo') || name.toLowerCase().includes('paga')
        ? 'comprovativo' 
        : name.toLowerCase().includes('fatura') || name.toLowerCase().includes('proposta')
        ? 'fatura'
        : name.toLowerCase().includes('contrato')
        ? 'contrato'
        : 'documento'
    );

    const fileDate = (customDate && customDate.trim() !== '') 
      ? new Date(customDate + 'T12:00:00').toISOString() 
      : new Date().toISOString();

    const newArquivo: Arquivo = {
      id: 'arq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: finalName,
      tipo: finalTipo,
      tamanho: finalTamanho,
      url: finalUrl,
      criadoEm: fileDate,
      enviadoPor: loggedUser?.nome || 'Admin',
      clienteAssociado: clientAssoc || '',
      negocioAssociado: dealAssoc || '',
      categoria: autoCategory,
      observacoes: observacoes || '',
      syncedSupabase: true,
      syncedGoogleDrive: true
    };

    const updated = [newArquivo, ...arquivos];
    setArquivos(updated);
    saveToLocalStorage('gpa_arquivos_v2', updated);

    // Run invoice & client automation check
    const autoRes = processInvoiceAutomation({
      docName: finalName,
      docType: finalTipo,
      clienteNomeInput: clientAssoc,
      clients,
      deals,
      loggedUser
    });

    let currentClients = clients;
    let currentDeals = deals;

    if (autoRes.autoClientRegistered || autoRes.detectedStage) {
      currentClients = autoRes.updatedClients;
      currentDeals = autoRes.updatedDeals;
      setClients(currentClients);
      setDeals(currentDeals);
      saveToLocalStorage('gpa_clients', currentClients);
      saveToLocalStorage('gpa_deals', currentDeals);

      if (autoRes.message) {
        addNotification(
          'Automação de Fatura / Cliente 🚀',
          autoRes.message,
          'info'
        );
      }
    }

    // Save state immediately & trigger parallel real-time Firestore persistence
    const payload = {
      comerciais,
      clients: currentClients,
      visits,
      deals: currentDeals,
      guidelines,
      notifications,
      activityFeed,
      arquivos: updated,
      crmName,
      telSede,
      relatoriosDiarios,
      historicoSemanas,
      historicoMeses
    };

    // Parallelize file doc creation, main CRM store update, and local server POST
    Promise.allSettled([
      saveFileToFirestore(newArquivo),
      saveCrmDataToFirestore(payload),
      fetch('/api/crm-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      fetch('/api/cloud-sync/sync-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: newArquivo.id,
          fileName: finalName,
          fileData: finalUrl,
          mimeType: finalTipo
        })
      })
    ]).catch(err => console.warn('Sync error during upload:', err));

    // Add to logs
    const newLog: ActivityFeed = {
      type: 'client',
      text: `${loggedUser?.nome || 'Utilizador'} carregou ficheiro: "${name}"`,
      time: 'Agora'
    };
    setActivityFeed(feed => [newLog, ...feed]);

    // Send notification
    addNotification(
      'Ficheiro Carregado 📁',
      `"${name}" foi guardado e sincronizado com sucesso na GPA Angola.`,
      'success'
    );
  };

  // Update file metadata (Rename, Change Category, Associations, Notes)
  const handleUpdateFile = async (id: string, updatedFields: Partial<Arquivo>) => {
    try {
      lastMutatedTimeRef.current = Date.now();

      const updated = arquivos.map(a => a.id === id ? { ...a, ...updatedFields } : a);
      setArquivos(updated);
      saveToLocalStorage('gpa_arquivos_v2', updated);

      const payload = {
        comerciais,
        clients,
        visits,
        deals,
        guidelines,
        notifications,
        activityFeed,
        arquivos: updated,
        crmName,
        telSede
      };
      saveCrmDataToFirestore(payload).catch(err => console.warn('Error updating file in Firestore:', err));

      addNotification(
        'Ficheiro Atualizado ✏️',
        'Os metadados do documento foram alterados e sincronizados.',
        'info'
      );
    } catch (err: any) {
      console.error('Error updating file:', err);
    }
  };

  // Delete a physical file and its reference from database and cloud storage
  const handleDeleteFile = async (id: string, url: string) => {
    try {
      // 1. Lock mutation time to prevent stale real-time Firestore sync overwrites
      lastMutatedTimeRef.current = Date.now() + 15000;

      // 2. Instant optimistic update in React state & LocalStorage
      const fileToDelete = arquivos.find(a => a.id === id);
      if (fileToDelete) {
        moveToRecycleBin('arquivo', id, fileToDelete.nome, `Enviado por: ${fileToDelete.enviadoPor} | Categoria: ${fileToDelete.categoria || 'documento'}`, fileToDelete);
      }
      const updated = arquivos.filter(a => a.id !== id);
      setArquivos(updated);
      saveToLocalStorage('gpa_arquivos_v2', updated);

      // 3. Immediate feedback notification
      const newLog: ActivityFeed = {
        type: 'client',
        text: `${loggedUser?.nome || 'Utilizador'} eliminou o ficheiro "${fileToDelete?.nome || 'documento'}"`,
        time: 'Agora'
      };
      setActivityFeed(feed => [newLog, ...feed]);

      addNotification(
        'Ficheiro Eliminado 🗑️',
        `O documento "${fileToDelete?.nome || ''}" foi removido com sucesso.`,
        'info'
      );

      const deletePayload = {
        comerciais,
        clients,
        visits,
        deals,
        guidelines,
        notifications,
        activityFeed: [newLog, ...activityFeed],
        arquivos: updated,
        crmName,
        telSede,
        relatoriosDiarios,
        historicoSemanas,
        historicoMeses
      };

      // 4. Fire background server & Firestore cleanup non-blockingly
      Promise.allSettled([
        (async () => {
          if (url && url.startsWith('/uploads/')) {
            const filename = url.replace('/uploads/', '');
            await fetch(`/api/files/${filename}`, { method: 'DELETE' }).catch(() => {});
          }
        })(),
        deleteFileFromFirestore(id).catch(() => {}),
        saveCrmDataToFirestore(deletePayload).catch(err => console.warn('Error saving deletion to Firestore:', err)),
        fetch('/api/crm-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deletePayload)
        }).catch(err => console.warn('Error saving deletion to /api/crm-data:', err))
      ]);
    } catch (err: any) {
      console.error('Error in handleDeleteFile:', err);
    }
  };

  // User Administration callbacks
  const handleToggleBlockUser = (id: string) => {
    setComerciais(prev => {
      return prev.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
          return { ...u, status: nextStatus };
        }
        return u;
      });
    });
  };

  const handleToggleMuteUser = (id: string) => {
    setComerciais(prev => {
      return prev.map(u => {
        if (u.id === id) {
          return { ...u, silencioso: !u.silencioso };
        }
        return u;
      });
    });
  };

  if (!loggedUser) {
    return (
      <LoginOverlay
        comerciais={comerciais}
        onLoginSuccess={handleLogin}
        addNotification={(type, title, text) => addNotification(title, text, type)}
        appLogo={appLogo}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative ${themeMode === 'dark' ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Structural Tech Grid Background */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none z-0"></div>
      
      {/* Global Animated Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
          className="w-full h-full object-cover opacity-15 mix-blend-screen"
        >
          <source src={bgVideo} type="video/mp4" />
          <source src="/videos/Prompt_Direto_e_Suave_Reco.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Floating Chat Message Toast Banner */}
      {chatToast && (
        <div className="fixed top-4 right-4 z-[9999] bg-[#001f3f] text-white p-3.5 rounded-2xl shadow-2xl border border-blue-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
            💬
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h6 className="text-xs font-black text-white truncate">{chatToast.senderName}</h6>
            <p className="text-[11px] text-blue-200 truncate mt-0.5">{chatToast.text}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                handleViewChange('chat');
                setChatToast(null);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition cursor-pointer shadow-xs"
            >
              Ver Chat
            </button>
            <button
              onClick={() => setChatToast(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg text-xs"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Structural Sidebar */}
      <Sidebar
        loggedUser={loggedUser}
        currentView={activeTab}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        crmName={crmName}
        appLogo={appLogo}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        unreadChatCount={unreadChatCount}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
      />

      {/* Main viewport area */}
      <div className={`flex-grow flex flex-col overflow-hidden relative z-10 ${themeMode === 'dark' ? 'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(10,16,35,0.92))]' : 'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_25%),linear-gradient(135deg,#f8fafc_0%,#eef4ff_60%,#f8fafc_100%)]'}`}>
        
        {/* Structural Topbar */}
        <TopBar
          loggedUser={loggedUser}
          currentView={activeTab}
          onLogout={handleLogout}
          onViewChange={handleViewChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          deals={deals}
          clients={clients}
          comerciais={comerciais}
          notifications={notifications}
          onRemoveNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          onClearNotifications={() => setNotifications([])}
          onOpenExcelImport={() => setIsExcelImportOpen(true)}
          onOpenPdfExtractor={() => setIsPdfExtractorOpen(true)}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
        />

        {/* Dynamic Inner Dashboard View Scrollable content */}
        <div className="flex-grow overflow-y-auto p-3 sm:p-5 md:p-6 w-full space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              comerciais={comerciais}
              deals={deals}
              clients={clients}
              guidelines={guidelines}
              onOpenEditGuidelines={() => setIsEditGuidelinesOpen(true)}
              loggedUser={loggedUser}
              appLogo={appLogo}
              onViewChange={handleViewChange}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          <ChatView
            loggedUser={loggedUser}
            comerciais={comerciais}
            onLogOperation={logOperation}
            onAddNotification={addNotification}
            onNavigateTab={setActiveTab}
            activeTab={activeTab}
          />

          {activeTab === 'cpaas' && (
            <CpaasAutomationView
              clients={clients}
              deals={deals}
              loggedUser={loggedUser}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              clients={clients}
              comerciais={comerciais}
              visits={visits}
              onOpenScheduleVisit={() => setIsScheduleVisitOpen(true)}
              onEditSchedule={(c) => {
                setSelectedScheduleForEdit(c);
                setIsEditScheduleOpen(true);
              }}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesView
              clients={clients}
              comerciais={comerciais}
              onOpenAddClient={() => setIsAddClientOpen(true)}
              onOpenEditClient={(c) => {
                setSelectedClientForEdit(c);
                setIsEditClientOpen(true);
              }}
              onExportCSV={() => handleExportCSV(false)}
              onDeleteClient={handleDeleteClient}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'visitas' && (
            <VisitasView
              visits={visits}
              comerciais={comerciais}
              onOpenAddVisit={() => setIsAddVisitOpen(true)}
              onEditVisit={(v) => {
                setSelectedVisitForEdit(v);
                setIsEditVisitOpen(true);
              }}
              onDeleteVisit={handleDeleteVisit}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'crm' && (
            <div className="space-y-4">
              <FollowUpAutomationPanel
                deals={deals}
                onUpdateDealStage={handleMoveDeal}
                onLogContactDone={(dealId) => {
                  setDeals(prev => prev.map(d => {
                    if (d.id === dealId) {
                      return { ...d, diasAberto: 0 };
                    }
                    return d;
                  }));
                  addNotification('Contacto Registado 📞', 'O contador de estagnação do negócio foi reiniciado.', 'success');
                }}
              />
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => {
                    setSelectedDealForProposal(undefined);
                    setIsProposalModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  📄 Gerar Nova Proposta em PDF
                </button>
              </div>
              <CrmKanbanView
                deals={deals}
                comerciais={comerciais}
                onOpenAddDeal={() => setIsAddDealOpen(true)}
                onMoveDeal={handleMoveDeal}
                onDeleteDeal={handleDeleteDeal}
                refDate={globalRefDate}
                onRefDateChange={setGlobalRefDate}
                selectedPeriod={globalPeriodType}
                onPeriodTypeChange={setGlobalPeriodType}
                selectedComercial={globalSelectedComercial}
                onComercialChange={setGlobalSelectedComercial}
                selectedEmpresa={globalSelectedEmpresa}
                onEmpresaChange={setGlobalSelectedEmpresa}
                selectedProvincia={globalSelectedProvincia}
                onProvinciaChange={setGlobalSelectedProvincia}
              />
            </div>
          )}

          {activeTab === 'recomendacoes' && (
            <RecomendacoesView
              deals={deals}
              comerciais={comerciais}
              loggedUser={loggedUser}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'metas' && (
            <MetasPerformanceView
              comerciais={comerciais}
              deals={deals}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'metas_comissoes' && (
            <MetasComissoesView
              comerciais={comerciais}
              deals={deals}
              loggedUser={loggedUser}
              onUpdateMetaUser={handleUpdateMetaUser}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}


          {activeTab === 'comparativo' && (
            <ComparativoSemanalView
              deals={deals}
              comerciais={comerciais}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
              onAddDeal={(newDeal) => {
                setDeals(prev => [newDeal, ...prev]);
                addNotification(
                  'Novo Registo Adicionado 📊',
                  `Proposta "${newDeal.titulo}" (${newDeal.clienteNome}) adicionada ao Comparativo Semanal e ao CRM.`,
                  'success'
                );
              }}
              onOpenExcelImport={() => setIsExcelImportOpen(true)}
            />
          )}

          {activeTab === 'listas' && (
            <ListasView
              comerciais={comerciais}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'base_duas_semanas' && (
            <BaseDuasSemanasView
              deals={deals}
              onAddDeal={handleAddDeal}
              loggedUser={loggedUser}
              comerciais={comerciais}
              onLogOperation={logOperation}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'historico_dia' && (
            <HistoricoDiaView
              operacoesLog={operacoesLog}
              loggedUser={loggedUser}
              comerciais={comerciais}
              onRevertOperation={handleRevertOperation}
              onClearOperacoesLog={handleClearOperacoesLog}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'analise_critica' && (
            <AnaliseCriticaView
              deals={deals}
              comerciais={comerciais}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'documentos' && (
            <DocumentosView
              arquivos={arquivos}
              clients={clients}
              deals={deals}
              comerciais={comerciais}
              loggedUser={loggedUser}
              onUploadFile={handleUploadFile}
              onUpdateFile={handleUpdateFile}
              onDeleteFile={handleDeleteFile}
              onOpenPdfExtractor={() => setIsPdfExtractorOpen(true)}
              refDate={globalRefDate}
              onRefDateChange={setGlobalRefDate}
              selectedPeriod={globalPeriodType}
              onPeriodTypeChange={setGlobalPeriodType}
              selectedComercial={globalSelectedComercial}
              onComercialChange={setGlobalSelectedComercial}
              selectedEmpresa={globalSelectedEmpresa}
              onEmpresaChange={setGlobalSelectedEmpresa}
              selectedProvincia={globalSelectedProvincia}
              onProvinciaChange={setGlobalSelectedProvincia}
            />
          )}

          {activeTab === 'relatorios' && (
            <RelatoriosView
              deals={deals}
              comerciais={comerciais}
              relatoriosDiarios={relatoriosDiarios}
              historicoSemanas={historicoSemanas}
              historicoMeses={historicoMeses}
              loggedUser={loggedUser}
              onSaveRelatorioDiario={handleSaveRelatorioDiario}
              onSaveNovaSemana={handleSaveNovaSemana}
              onSaveNovoMes={handleSaveNovoMes}
              onCompilarSemanal={handleCompilarSemanal}
              onGerarMensal={handleGerarMensal}
              onExportCSV={handleExportCSV}
            />
          )}


          {activeTab === 'utilizadores' && (
            <UtilizadoresView
              comerciais={comerciais}
              deals={deals}
              clients={clients}
              visits={visits}
              loggedUser={loggedUser}
              onOpenAddUser={() => {
                setUserModalPhoto('');
                setIsAddUserOpen(true);
              }}
              onOpenEditUser={(u) => {
                setSelectedUserForEdit(u);
                setUserModalPhoto(u.foto || '');
                setIsEditUserOpen(true);
              }}
              onToggleBlockUser={handleToggleBlockUser}
              onToggleMuteUser={handleToggleMuteUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUserPhoto={handleUpdateUserPhoto}
            />
          )}

          {activeTab === 'configuracoes' && (
            <ConfiguracoesView
              loggedUser={loggedUser}
              comerciais={comerciais}
              crmName={crmName}
              onSaveCrmName={setCrmName}
              apiKey={apiKey}
              onSaveApiKey={setApiKey}
              telSede={telSede}
              onSaveTelSede={setTelSede}
              syncTime={syncTime}
              onSimulateSync={handleSimulateSync}
              onPhotoUpload={handlePhotoUpload}
              appLogo={appLogo}
              onSaveAppLogo={handleSaveAppLogo}
              onUpdateProfile={handleUpdateProfile}
              recycleItems={recycleItems}
              onRestoreItem={handleRestoreItem}
              onPermanentDelete={handlePermanentDelete}
              onClearRecycleBin={handleClearRecycleBin}
              operacoesLog={operacoesLog}
              onRevertOperation={handleRevertOperation}
              onClearOperacoesLog={handleClearOperacoesLog}
              onImportPropostas={(newPropostas) => {
                try {
                  const saved = localStorage.getItem('gpa_base_duas_semanas');
                  let current: any[] = saved ? JSON.parse(saved) : [];
                  const updated = [...current];

                  newPropostas.forEach(np => {
                    const existingIdx = updated.findIndex(p =>
                      p.semana && np.semana &&
                      String(p.semana).toLowerCase().trim() === String(np.semana).toLowerCase().trim() &&
                      p.cliente && np.cliente &&
                      String(p.cliente).toLowerCase().trim() === String(np.cliente).toLowerCase().trim() &&
                      p.servico && np.servico &&
                      String(p.servico).toLowerCase().trim() === String(np.servico).toLowerCase().trim()
                    );
                    if (existingIdx >= 0) {
                      // Substitui com os dados reais atualizados do Excel
                      updated[existingIdx] = { ...updated[existingIdx], ...np };
                    } else {
                      // Adiciona a nova linha do Excel
                      updated.unshift(np);
                    }
                  });

                  localStorage.setItem('gpa_base_duas_semanas', JSON.stringify(updated));
                  window.dispatchEvent(new Event('storage'));
                } catch (e) { console.error(e); }
              }}
              onImportClientes={(newClientes) => {
                setClients(prev => {
                  const updated = [...prev];
                  newClientes.forEach(nc => {
                    const existingIdx = updated.findIndex(c =>
                      (c.nif && nc.nif && String(c.nif) === String(nc.nif)) ||
                      (c.empresa && nc.empresa && String(c.empresa).toLowerCase().trim() === String(nc.empresa).toLowerCase().trim())
                    );
                    if (existingIdx >= 0) {
                      updated[existingIdx] = { ...updated[existingIdx], ...nc };
                    } else {
                      updated.unshift(nc as any);
                    }
                  });
                  saveToLocalStorage('gpa_clients', updated);
                  // Sync to server
                  fetch('/api/crm-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clients: updated })
                  }).catch(console.error);
                  return updated;
                });
              }}
              onImportVisitas={(newVisitas) => {
                setVisits(prev => {
                  const updated = [...prev];
                  newVisitas.forEach(nv => {
                    const existingIdx = updated.findIndex(v =>
                      v.clienteNome && nv.clienteNome &&
                      String(v.clienteNome).toLowerCase().trim() === String(nv.clienteNome).toLowerCase().trim() &&
                      v.data && nv.data && String(v.data) === String(nv.data)
                    );
                    if (existingIdx >= 0) {
                      updated[existingIdx] = { ...updated[existingIdx], ...nv };
                    } else {
                      updated.unshift(nv as any);
                    }
                  });
                  saveToLocalStorage('gpa_visits', updated);
                  // Sync to server
                  fetch('/api/crm-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visits: updated })
                  }).catch(console.error);
                  return updated;
                });
              }}
              onImportDeals={(newDeals) => {
                setDeals(prev => {
                  const updated = [...prev];
                  newDeals.forEach(nd => {
                    const existingIdx = updated.findIndex(d =>
                      d.clienteNome && nd.clienteNome &&
                      String(d.clienteNome).toLowerCase().trim() === String(nd.clienteNome).toLowerCase().trim() &&
                      d.titulo && nd.titulo &&
                      String(d.titulo).toLowerCase().trim() === String(nd.titulo).toLowerCase().trim()
                    );
                    if (existingIdx >= 0) {
                      updated[existingIdx] = { ...updated[existingIdx], ...nd };
                    } else {
                      updated.unshift(nd as any);
                    }
                  });
                  saveToLocalStorage('gpa_deals', updated);
                  // Sync to server — critical so all tabs and server see same data
                  fetch('/api/crm-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deals: updated })
                  }).catch(console.error);
                  return updated;
                });
              }}
              onLogOperation={logOperation}
            />
          )}

          {activeTab === 'helena' && (
            <HelenaView
              loggedUser={loggedUser}
              deals={deals}
              clients={clients}
              comerciais={comerciais}
            />
          )}

          {activeTab === 'manual_rapido' && (
            <ManualRapidoView />
          )}
        </div>

      </div>

      {/* MODALS RENDER SECTION */}
      
      {/* Schedule Visit Modal */}
      {isScheduleVisitOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Agendar Nova Visita Técnica</h5>
              <button
                type="button"
                onClick={() => setIsAddClientOpen(true)}
                className="text-[10px] bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                title="Cadastrar cliente se não estiver na lista"
              >
                + Novo Cliente
              </button>
            </div>
            <form onSubmit={handleScheduleVisitSubmit} className="space-y-4">
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cliente / Empresa</label>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold" onClick={() => setIsAddClientOpen(true)}>
                    Não está na lista? + Registar
                  </span>
                </div>
                <select name="clientId" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 w-full font-semibold">
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.empresa}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Data</label>
                  <input type="date" name="data" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Hora</label>
                  <input type="time" name="hora" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Localização / Ponto de Encontro</label>
                <input type="text" name="localizacao" placeholder="Ex: Sede Mocasas" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsScheduleVisitOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {isEditScheduleOpen && selectedScheduleForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Editar Agendamento — {selectedScheduleForEdit.empresa}</h5>
            <form onSubmit={handleEditScheduleSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Próxima Visita (Data YYYY-MM-DD)</label>
                <input
                  type="date"
                  name="proximaVisita"
                  defaultValue={selectedScheduleForEdit.proximaVisita !== '-' ? selectedScheduleForEdit.proximaVisita : ''}
                  required
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => { setIsEditScheduleOpen(false); setSelectedScheduleForEdit(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Cadastrar Novo Cliente</h5>
            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nome da Empresa</label>
                <input type="text" name="empresa" placeholder="Ex: TAAG Linhas Aéreas" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Contacto Responsável (Decisor)</label>
                <input type="text" name="nome" placeholder="Ex: Dr. António Neto" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">NIF</label>
                  <input type="text" name="nif" placeholder="5412345678" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label>
                  <input type="text" name="telefone" placeholder="922000000" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Província</label>
                  <input type="text" name="provincia" placeholder="Luanda" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Segmento</label>
                  <input type="text" name="segmento" placeholder="Tecnologia" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Endereço (Opcional)</label>
                <input type="text" name="endereco" placeholder="Ex: Rua Major Kanhangulo, Luanda" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsAddClientOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditClientOpen && selectedClientForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Editar Cliente</h5>
            <form onSubmit={handleEditClientSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nome da Empresa</label>
                <input type="text" name="empresa" defaultValue={selectedClientForEdit.empresa} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Contacto Responsável (Decisor)</label>
                <input type="text" name="nome" defaultValue={selectedClientForEdit.nome} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">NIF</label>
                  <input type="text" name="nif" defaultValue={selectedClientForEdit.nif} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label>
                  <input type="text" name="telefone" defaultValue={selectedClientForEdit.telefone} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Província</label>
                  <input type="text" name="provincia" defaultValue={selectedClientForEdit.provincia} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Segmento</label>
                  <input type="text" name="segmento" defaultValue={selectedClientForEdit.segmento} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Endereço (Opcional)</label>
                <input type="text" name="endereco" defaultValue={selectedClientForEdit.endereco || ''} placeholder="Ex: Rua Major Kanhangulo, Luanda" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => {
                  setIsEditClientOpen(false);
                  setSelectedClientForEdit(null);
                }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Visit Modal */}
      {isAddVisitOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Registar Relatório de Visita</h5>
            <form onSubmit={handleAddVisitSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Cliente / Empresa</label>
                <select name="clientId" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full font-semibold">
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.empresa}</option>
                  ))}
                </select>
              </div>

              {(loggedUser?.perfil === 'admin' || loggedUser?.perfil === 'supervisor') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Comercial Responsável</label>
                  <select name="comercialId" required defaultValue={loggedUser.id} className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full font-semibold">
                    {comerciais.filter(u => u.perfil === 'comercial').map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Contacto Reunião (Nome Decisor)</label>
                <input type="text" name="contato" placeholder="Ex: Dr. António Neto" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Produtos Apresentados / Demonstração</label>
                <input type="text" name="produtos" placeholder="Ex: ERP Primavera, Licenças SQL" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Necessidades Identificadas</label>
                <textarea name="necessidade" rows={2} placeholder="Descreva os requisitos técnicos recolhidos..." required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none resize-none"></textarea>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Resultado da Reunião</label>
                <select name="resultado" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full font-semibold">
                  <option value="Positivo">Positivo — Demonstraram alto interesse</option>
                  <option value="Neutro">Neutro — Aguarda mais informações</option>
                  <option value="Negativo">Negativo — Pouco interesse</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsAddVisitOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Salvar Relatório</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Visit Modal */}
      {isEditVisitOpen && selectedVisitForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Editar Relatório de Visita</h5>
            <form onSubmit={handleEditVisitSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Empresa / Cliente</label>
                <input type="text" name="empresa" defaultValue={selectedVisitForEdit.empresa} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Contacto (Decisor)</label>
                  <input type="text" name="clienteNome" defaultValue={selectedVisitForEdit.clienteNome} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Gestor Comercial</label>
                  <input type="text" name="comercialNome" defaultValue={selectedVisitForEdit.comercialNome} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Produtos Apresentados</label>
                <input type="text" name="produtos" defaultValue={selectedVisitForEdit.produtos} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Necessidades / Observações</label>
                <textarea name="necessidade" rows={2} defaultValue={selectedVisitForEdit.necessidade} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Data</label>
                  <input type="date" name="data" defaultValue={selectedVisitForEdit.data} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Hora</label>
                  <input type="text" name="hora" defaultValue={selectedVisitForEdit.hora} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Resultado</label>
                  <select name="resultado" defaultValue={selectedVisitForEdit.resultado} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-semibold">
                    <option value="Positivo">Positivo</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Negativo">Negativo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Localização</label>
                <input type="text" name="localizacao" defaultValue={selectedVisitForEdit.localizacao} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => { setIsEditVisitOpen(false); setSelectedVisitForEdit(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Novo Negócio / Proposta</h5>
            <form onSubmit={handleAddDealSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Título da Proposta</label>
                <input type="text" name="titulo" placeholder="Ex: Proposta de Auditoria Técnica" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Cliente / Empresa</label>
                <select name="clientId" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none w-full font-semibold">
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.empresa}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Valor do Negócio (Kz)</label>
                <input type="number" name="valor" placeholder="Ex: 500000" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Prioridade</label>
                  <select name="prioridade" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none font-semibold">
                    <option value="Normal">Normal</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Etapa Kanban</label>
                  <select name="etapa" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none font-semibold">
                    <option value="lead">Lead</option>
                    <option value="contato">Contato</option>
                    <option value="visita">Visita</option>
                    <option value="proposta">Proposta</option>
                    <option value="negociacao">Negociação</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsAddDealOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Criar Oportunidade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Novo Funcionário / Utilizador</h5>
            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-left">
              
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {userModalPhoto ? (
                    <img src={userModalPhoto} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Fotografia do Perfil (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUserModalPhotoChange}
                    className="text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#003366] file:text-white hover:file:bg-[#001f3f] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
                <input type="text" name="nome" placeholder="Ex: Francisco de Castro" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Email Corporativo</label>
                <input type="email" name="email" placeholder="francisco@gpa.ao" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Palavra-passe Inicial</label>
                <input type="password" name="senha" placeholder="Palavra-passe (Padrão: gpa2026)" defaultValue="gpa2026" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Perfil</label>
                  <select name="perfil" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none font-semibold">
                    <option value="comercial">Comercial</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Função / Cargo</label>
                  <input type="text" name="funcao" placeholder="Comercial" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Semanal (Kz)</label>
                  <input type="number" name="metaSemanal" placeholder="3750000" className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Província Principal</label>
                  <input type="text" name="provincia" placeholder="Luanda" required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Criar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Metas Modal */}
      {isEditUserOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h5 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Editar Utilizador / Funcionário</h5>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 text-xs text-left">
              <span className="text-gray-400 font-bold block uppercase text-[9px]">ID do Utilizador</span>
              <strong className="text-gray-800 font-bold block">{selectedUserForEdit.id}</strong>
            </div>
            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-left">
              
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {userModalPhoto ? (
                    <img src={userModalPhoto} alt={selectedUserForEdit.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Fotografia do Perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUserModalPhotoChange}
                    className="text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#003366] file:text-white hover:file:bg-[#001f3f] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo</label>
                <input type="text" name="nome" defaultValue={selectedUserForEdit.nome} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Email Corporativo</label>
                <input type="email" name="email" defaultValue={selectedUserForEdit.email} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Palavra-passe / Senha</label>
                <input type="text" name="senha" placeholder="Palavra-passe da conta" defaultValue={selectedUserForEdit.senha || 'gpa2026'} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Perfil</label>
                  <select name="perfil" defaultValue={selectedUserForEdit.perfil} className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none font-semibold">
                    <option value="comercial">Comercial</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Função / Cargo</label>
                  <input type="text" name="funcao" defaultValue={selectedUserForEdit.funcao} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Semanal (Kz)</label>
                  <input type="number" name="metaSemanal" defaultValue={selectedUserForEdit.metaSemanal} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Província Principal</label>
                  <input type="text" name="provincia" defaultValue={selectedUserForEdit.provincia || 'Luanda'} required className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => {
                  setIsEditUserOpen(false);
                  setSelectedUserForEdit(null);
                }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Gravar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guidelines Modal */}
      {isEditGuidelinesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h5 className="text-sm font-black text-[#003366] uppercase tracking-wide">Editar Diretrizes CRM Semanais</h5>
                <p className="text-[10px] text-gray-400 font-medium">Actualize as acções, focos e recomendações apresentadas no Dashboard.</p>
              </div>
              <button onClick={() => setIsEditGuidelinesOpen(false)} className="text-gray-400 hover:text-gray-600 font-extrabold text-sm p-1.5 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            
            <form onSubmit={handleEditGuidelinesSubmit} className="space-y-4 overflow-y-auto flex-grow pr-1 text-left">
              <div className="space-y-3">
                {guidelines.map((g) => (
                  <div key={g.id} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#003366] text-white flex items-center justify-center font-black text-[9px]">{g.id}</span>
                      <strong className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Diretriz de {g.id === 1 ? 'Fecho' : g.id === 2 ? 'Recuperação' : g.id === 3 ? 'Produção' : g.id === 4 ? 'Gestão' : 'Controlo'}</strong>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Acção</label>
                        <input type="text" name={`g${g.id}_acao`} defaultValue={g.acao} required className="text-xs bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Foco / Critério</label>
                        <input type="text" name={`g${g.id}_criterio`} defaultValue={g.criterio} required className="text-xs bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Próximo Passo Recomendado</label>
                      <input type="text" name={`g${g.id}_proximo`} defaultValue={g.proximoPasso} required className="text-xs bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditGuidelinesOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Data Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        clients={clients}
        comerciais={comerciais}
        onImportDeals={handleImportDeals}
        onImportClients={handleImportClients}
        onImportVisits={handleImportVisits}
        deals={deals}
        visits={visits}
      />

      {/* PDF Intelligence Data Extractor Modal */}
      <PdfExtractorModal
        isOpen={isPdfExtractorOpen}
        onClose={() => setIsPdfExtractorOpen(false)}
        loggedUser={loggedUser}
        comerciais={comerciais}
        onAddClient={async (empresa, nome, email, telefone, provincia, nif) => {
          const newCli: Cliente = {
            id: 'cli_' + Date.now(),
            empresa,
            nome: nome || empresa,
            nif: nif || '',
            telefone: telefone || '923 000 000',
            provincia: provincia || 'Luanda',
            segmento: 'Geral',
            status: 'ativo',
            responsavel: loggedUser?.id || comerciais[0].id,
            ultimaVisita: 'Hoje',
            proximaVisita: 'Em agendamento'
          };
          setClients(prev => [newCli, ...prev]);
        }}
        onAddDeal={async (clienteId, clienteNome, titulo, valor, comercialId, comercialNome, prioridade, etapa) => {
          const newDeal: Deal = {
            id: 'd_' + Date.now(),
            clienteNome,
            titulo,
            valor,
            comercialId,
            comercialNome,
            prioridade,
            etapa,
            diasAberto: 1,
            probabilidade: etapa === 'fechado' ? '100%' : '70%'
          };
          setDeals(prev => [newDeal, ...prev]);
        }}
        onUploadFile={handleUploadFile}
        addNotification={addNotification}
      />

      {/* Proposal PDF Generator Modal */}
      {isProposalModalOpen && (
        <ProposalModal
          deal={selectedDealForProposal}
          clients={clients}
          comerciais={comerciais}
          loggedUser={loggedUser}
          appLogo={appLogo}
          onClose={() => setIsProposalModalOpen(false)}
          onSaveProposal={handleSaveProposal}
          onOpenPortal={(p) => {
            setSelectedProposalForPortal(p);
            setIsPortalModalOpen(true);
          }}
        />
      )}

      {/* Proposal Client Validation Portal Modal */}
      {isPortalModalOpen && selectedProposalForPortal && (
        <ProposalClientPortalModal
          proposal={selectedProposalForPortal}
          appLogo={appLogo}
          onClose={() => setIsPortalModalOpen(false)}
          onApproveProposal={handleApproveProposalFromPortal}
          onRequestRevision={handleRequestRevisionFromPortal}
        />
      )}

    </div>
  );
}
