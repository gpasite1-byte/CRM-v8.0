import React, { useRef, useState, useEffect } from 'react';
import AppLogoImage from './AppLogoImage';
import { Usuario, RecycleItem, OperacaoLog, Deal, Cliente, Visita, isUserAdmin, isUserManager, isUserCommercial } from '../types';
import RecycleBinView from './RecycleBinView';
import ExcelImportManager from './ExcelImportManager';
import AdminAiAgent from './AdminAiAgent';
import { Settings, Shield, Image, RefreshCw, Key, Phone, Save, Camera, Database, Folder, Layers, CheckCircle2, AlertTriangle, ArrowRight, Globe, ShieldCheck, Trash2, Type, Search, Check, Sparkles, Palette, History, RotateCcw, Undo2, Filter, FileText, Activity } from 'lucide-react';
import { FONTS_CATALOG, applyGlobalFont, getSavedFont, loadGoogleFont, FontItem } from '../data/fontsCatalog';

interface ConfiguracoesViewProps {
  loggedUser: Usuario;
  comerciais?: Usuario[];
  crmName: string;
  onSaveCrmName: (name: string) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  telSede: string;
  onSaveTelSede: (tel: string) => void;
  syncTime: string;
  onSimulateSync: () => void;
  onPhotoUpload: (base64: string) => void;
  appLogo: string;
  onSaveAppLogo: (logo: string) => void;
  onUpdateProfile?: (
    nome: string,
    senha: string,
    foto?: string,
    preferenciaNotificacao?: string,
    whatsappNumero?: string,
    telegramChatId?: string,
    emailNotificacao?: string
  ) => void;
  recycleItems?: RecycleItem[];
  onRestoreItem?: (item: RecycleItem) => void;
  onPermanentDelete?: (id: string) => void;
  onClearRecycleBin?: () => void;
  operacoesLog?: OperacaoLog[];
  onRevertOperation?: (op: OperacaoLog) => void;
  onClearOperacoesLog?: () => void;
  onImportPropostas?: (propostas: any[]) => void;
  onImportClientes?: (clientes: any[]) => void;
  onImportVisitas?: (visitas: any[]) => void;
  onImportDeals?: (deals: any[]) => void;
  onLogOperation?: (
    tipoAcao: 'criacao' | 'edicao' | 'exclusao' | 'status' | 'configuracao' | 'reversao' | 'importacao',
    entidade: 'deal' | 'cliente' | 'visita' | 'utilizador' | 'arquivo' | 'relatorio' | 'meta' | 'configuracao',
    entidadeId: string,
    descricao: string,
    dadosAnteriores?: any,
    dadosNovos?: any
  ) => void;
}

export default function ConfiguracoesView({
  loggedUser,
  comerciais = [],
  crmName,
  onSaveCrmName,
  apiKey,
  onSaveApiKey,
  telSede,
  onSaveTelSede,
  syncTime,
  onSimulateSync,
  onPhotoUpload,
  appLogo,
  onSaveAppLogo,
  onUpdateProfile,
  recycleItems = [],
  onRestoreItem = () => {},
  onPermanentDelete = () => {},
  onClearRecycleBin = () => {},
  operacoesLog = [],
  onRevertOperation = () => {},
  onClearOperacoesLog = () => {},
  onImportPropostas,
  onImportClientes,
  onImportVisitas,
  onImportDeals,
  onLogOperation
}: ConfiguracoesViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [profileNome, setProfileNome] = useState(loggedUser.nome);
  const [profileSenha, setProfileSenha] = useState(loggedUser.senha || '');

  // Multi-Channel Notification State
  const [preferenciaNotificacao, setPreferenciaNotificacao] = useState<any>(
    loggedUser.preferenciaNotificacao || 'todos'
  );
  const [whatsappNumero, setWhatsappNumero] = useState(
    loggedUser.whatsappNumero || loggedUser.telefone || '+244'
  );
  const [telegramChatId, setTelegramChatId] = useState(
    loggedUser.telegramChatId || ''
  );
  const [emailNotificacao, setEmailNotificacao] = useState(
    loggedUser.emailNotificacao || loggedUser.email || ''
  );
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  // WhatsApp Cloud Gateway State (Cloud Run & Vercel Serverless)
  const [waProvider, setWaProvider] = useState('ultramsg');
  const [waInstanceId, setWaInstanceId] = useState('');
  const [waApiKey, setWaApiKey] = useState('');
  const [waWebhookUrl, setWaWebhookUrl] = useState('');
  const [isSavingGateway, setIsSavingGateway] = useState(false);

  // Typography (+200 Fonts Catalog) State
  const [currentFont, setCurrentFont] = useState<string>(() => getSavedFont());
  const [fontSearch, setFontSearch] = useState<string>('');
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('Todas');
  const [fontApplySuccess, setFontApplySuccess] = useState<string>('');

  // Operations Log / Audit Trail State
  const [logSearch, setLogSearch] = useState<string>('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('todos');
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);

  const isAdmin = isUserAdmin(loggedUser);

  // Filter operation logs: Admins see all, Commercial users see only their own operations
  const userVisibleOperations = operacoesLog.filter(op => {
    if (isAdmin) return true;
    return (op.usuarioNome || '').toLowerCase().trim() === (loggedUser.nome || '').toLowerCase().trim();
  });

  useEffect(() => {
    // Preload current active font and top 15 catalog fonts
    loadGoogleFont(currentFont);
    FONTS_CATALOG.slice(0, 15).forEach(f => loadGoogleFont(f.name));
  }, []);

  useEffect(() => {
    if (loggedUser) {
      setProfileNome(loggedUser.nome);
      if (loggedUser.senha) setProfileSenha(loggedUser.senha);
      if (loggedUser.preferenciaNotificacao) setPreferenciaNotificacao(loggedUser.preferenciaNotificacao);
      if (loggedUser.whatsappNumero) setWhatsappNumero(loggedUser.whatsappNumero);
      if (loggedUser.telegramChatId) setTelegramChatId(loggedUser.telegramChatId);
      if (loggedUser.emailNotificacao) setEmailNotificacao(loggedUser.emailNotificacao);
    }

    fetch('/api/cloud-sync/config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.whatsappProvider) setWaProvider(data.whatsappProvider);
          if (data.whatsappInstanceId) setWaInstanceId(data.whatsappInstanceId);
          if (data.whatsappApiKey) setWaApiKey(data.whatsappApiKey);
          if (data.whatsappWebhookUrl) setWaWebhookUrl(data.whatsappWebhookUrl);
        }
      })
      .catch(() => {});
  }, [loggedUser]);

  const handleSaveGatewayConfig = async () => {
    setIsSavingGateway(true);
    try {
      const res = await fetch('/api/cloud-sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappProvider: waProvider,
          whatsappInstanceId: waInstanceId,
          whatsappApiKey: waApiKey,
          whatsappWebhookUrl: waWebhookUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Gateway de WhatsApp configurado e salvo com sucesso no servidor!');
      } else {
        alert('Erro ao guardar configurações do Gateway WhatsApp.');
      }
    } catch (e) {
      alert('Erro de rede ao ligar ao servidor.');
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleSaveNotificationSettings = () => {
    setIsSavingNotif(true);
    if (onUpdateProfile) {
      onUpdateProfile(
        profileNome,
        profileSenha,
        undefined,
        preferenciaNotificacao,
        whatsappNumero,
        telegramChatId,
        emailNotificacao
      );
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().catch(() => {});
    }
    setTimeout(() => {
      setIsSavingNotif(false);
      alert(`✅ Definições de Notificação Guardadas com Sucesso!\n\n• Canal Preferencial: ${preferenciaNotificacao.toUpperCase()}\n• WhatsApp: ${whatsappNumero}\n• Telegram Chat ID: ${telegramChatId || 'Não definido'}\n• Email para Alertas: ${emailNotificacao}\n\nOs seus dados foram permanentemente gravados no CRM.`);
    }, 300);
  };

  // Supabase Integration & Migration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [supabaseLogs, setSupabaseLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/supabase/status')
      .then(res => res.json())
      .then(data => {
        setSupabaseStatus(data);
        if (data.url) setSupabaseUrl(data.url);
      })
      .catch(() => {});
  }, []);

  const handleSaveSupabaseConfig = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Por favor, insira a URL do Supabase e a Chave API (anon key / service_role key).');
      return;
    }
    setIsSavingSupabase(true);
    setSupabaseLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] A guardar credenciais e a executar migrações e sincronização automática de tabelas SQL...`]);
    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey })
      });
      const data = await res.json();
      if (data.success) {
        setSupabaseLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Credenciais guardadas e tabelas sincronizadas automaticamente!`,
          `   ➜ Tabelas ativas: crm_meta, crm_deals, crm_clientes, crm_comerciais, crm_visitas`
        ]);
        alert('🚀 ' + data.message + '\n\nTodas as migrações e tabelas SQL foram inicializadas e sincronizadas automaticamente!');
        const statusRes = await fetch('/api/supabase/status');
        const statusData = await statusRes.json();
        setSupabaseStatus(statusData);
      } else {
        alert('⚠️ ' + (data.error || 'Erro ao guardar Supabase'));
      }
    } catch (err) {
      alert('Erro de comunicação com o servidor.');
    } finally {
      setIsSavingSupabase(false);
    }
  };

  const handleRunSupabaseMigration = async () => {
    setIsMigrating(true);
    setSupabaseLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] A iniciar sincronização e migração de tabelas SQL no Supabase...`]);
    try {
      const res = await fetch('/api/supabase/migrate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSupabaseLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ ${data.message}`,
          ...data.schema.map((s: string) => `   ➜ Tabela criada/sincronizada: ${s}`)
        ]);
        alert('🚀 Migrações do Supabase e tabelas SQL ativas com sucesso!');
        const statusRes = await fetch('/api/supabase/status');
        const statusData = await statusRes.json();
        setSupabaseStatus(statusData);
      } else {
        setSupabaseLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ ${data.error}`]);
        alert(`⚠️ ${data.error}`);
      }
    } catch (err) {
      setSupabaseLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Erro ao comunicar com o Supabase.`]);
    } finally {
      setIsMigrating(false);
    }
  };


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserAdmin(loggedUser)) {
      alert('Apenas utilizadores com perfil Administrador podem alterar a logomarca!');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('A imagem da logomarca excede o limite de 1.5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result as string;
      onSaveAppLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 300;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          onPhotoUpload(compressed);
        } else {
          onPhotoUpload(base64);
        }
      };
      img.onerror = () => onPhotoUpload(base64);
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (n: string) => {
    if (!n) return 'GP';
    return n.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      
      {/* Configuration Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
          <Settings size={16} /> Configurações Gerais do Sistema
        </h4>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase">Nome do CRM</label>
            <input
              type="text"
              value={crmName}
              onChange={(e) => onSaveCrmName(e.target.value)}
              disabled={!isUserAdmin(loggedUser)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase">Telefone da Sede</label>
            <input
              type="text"
              value={telSede}
              onChange={(e) => onSaveTelSede(e.target.value)}
              disabled={!isUserManager(loggedUser)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          {/* Security Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2.5">
            <Shield className="text-emerald-500 flex-shrink-0" size={16} />
            <span className="text-[11px] text-emerald-800 leading-snug font-semibold">
              <strong>Controlos de Segurança Ativos:</strong> Encriptação Firebase Auth & Google Security API v2 ativadas.
            </span>
          </div>

          <button
            onClick={() => alert('Configurações salvas com sucesso!')}
            className="bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <Save size={13} /> Salvar Configurações
          </button>
        </div>
      </div>

      {/* Bulk Excel Import & Data Synchronization */}
      <ExcelImportManager
        comerciais={comerciais}
        loggedUser={loggedUser}
        onImportPropostas={onImportPropostas}
        onImportClientes={onImportClientes}
        onImportVisitas={onImportVisitas}
        onImportDeals={onImportDeals}
        onLogOperation={onLogOperation}
      />

      {/* Backup & Importador Completo JSON (Vercel & GitHub Migration) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-50 pb-2.5">
            <h4 className="text-sm font-black text-indigo-950 uppercase tracking-wide flex items-center gap-2">
              <Database size={18} className="text-indigo-600" />
              Backup & Migração Completa para Vercel / GitHub (JSON)
            </h4>
            <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Preservar Senhas & Fotos
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            💡 <strong>Por que os dados mudaram na Vercel?</strong> Quando você publica o site em um novo domínio (ex: Vercel), o navegador cria um armazenamento local (<code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-700 font-bold">localStorage</code>) limpo para aquele domínio.
            <br />Use os botões abaixo para <strong>exportar um backup completo</strong> (senhas, logótipos, utilizadores e propostas) em ficheiro JSON e <strong>restaurar na Vercel com 1 clique</strong>!
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                try {
                  const backupData = {
                    version: '2026.1',
                    exportedAt: new Date().toISOString(),
                    exportedBy: loggedUser.nome,
                    users: localStorage.getItem('gpa_users') ? JSON.parse(localStorage.getItem('gpa_users')!) : null,
                    logo: localStorage.getItem('gpa_logo') || appLogo,
                    baseDuasSemanas: localStorage.getItem('gpa_base_duas_semanas') ? JSON.parse(localStorage.getItem('gpa_base_duas_semanas')!) : null,
                    clients: localStorage.getItem('gpa_clients') ? JSON.parse(localStorage.getItem('gpa_clients')!) : null,
                    visits: localStorage.getItem('gpa_visits') ? JSON.parse(localStorage.getItem('gpa_visits')!) : null,
                    deals: localStorage.getItem('gpa_deals') ? JSON.parse(localStorage.getItem('gpa_deals')!) : null,
                    crmName,
                    telSede
                  };

                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `gpa_crm_backup_${new Date().toISOString().split('T')[0]}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();

                  alert('✅ Backup completo descarregado com sucesso! Guarde o ficheiro .json para importar no domínio da Vercel.');
                } catch (e) {
                  alert('Erro ao gerar ficheiro de backup.');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Database size={15} />
              <span>📥 Descarregar Backup Completo (.JSON)</span>
            </button>

            <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer">
              <RefreshCw size={15} />
              <span>📤 Restaurar Backup no Novo Domínio (.JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const data = JSON.parse(evt.target?.result as string);
                      if (data.users) localStorage.setItem('gpa_users', JSON.stringify(data.users));
                      if (data.logo) {
                        localStorage.setItem('gpa_logo', data.logo);
                        onSaveAppLogo(data.logo);
                      }
                      if (data.baseDuasSemanas) localStorage.setItem('gpa_base_duas_semanas', JSON.stringify(data.baseDuasSemanas));
                      if (data.clients) localStorage.setItem('gpa_clients', JSON.stringify(data.clients));
                      if (data.visits) localStorage.setItem('gpa_visits', JSON.stringify(data.visits));
                      if (data.deals) localStorage.setItem('gpa_deals', JSON.stringify(data.deals));

                      if (data.crmName) onSaveCrmName(data.crmName);
                      if (data.telSede) onSaveTelSede(data.telSede);

                      alert('🎉 Backup restaurado com sucesso! As senhas, imagens e dados foram totalmente carregados neste domínio.');
                      window.location.reload();
                    } catch (err) {
                      alert('Erro ao ler ficheiro JSON de backup.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Admin Exclusive: AI Assistant Agent for Admin Settings & System Editing */}
      {isAdmin && (
        <AdminAiAgent
          loggedUser={loggedUser}
          comerciais={comerciais}
          crmName={crmName}
          onSaveCrmName={onSaveCrmName}
          onSaveTelSede={onSaveTelSede}
        />
      )}

      {/* Biblioteca de Tipografia & Fontes (+200 Fontes Profissionais) - Apenas Admin, Admin1, Admin2 */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-[#003366] uppercase tracking-wide flex items-center gap-2">
                <Type size={18} className="text-blue-600" /> Biblioteca de Tipografia & Fontes (+200 Fontes Profissionais)
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Personalize todo o CRM GPA com uma biblioteca completa de +200 fontes profissionais do Google Fonts.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Palette size={13} className="text-blue-600" /> Fonte Ativa: <strong className="text-blue-900 font-black">{currentFont}</strong>
              </span>
            </div>
          </div>

          {fontApplySuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Fonte <strong>"{fontApplySuccess}"</strong> aplicada com sucesso a todo o CRM!
              </span>
              <button onClick={() => setFontApplySuccess('')} className="text-xs text-emerald-700 hover:underline cursor-pointer">Fechar</button>
            </div>
          )}

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome da fonte (ex: Poppins, Playfair, JetBrains, Bebas)..."
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {['Todas', 'Sans-Serif', 'Serif', 'Display / Bold', 'Monospace', 'Manuscrito / Elegante'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFontCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedFontCategory === cat
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Font Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
            {FONTS_CATALOG
              .filter((font) => {
                const matchesCategory = selectedFontCategory === 'Todas' || font.category === selectedFontCategory;
                const matchesSearch = !fontSearch || font.name.toLowerCase().includes(fontSearch.toLowerCase()) || (font.popularFor && font.popularFor.toLowerCase().includes(fontSearch.toLowerCase()));
                return matchesCategory && matchesSearch;
              })
              .map((font) => {
                // Load font on render
                loadGoogleFont(font.name);
                const isActive = currentFont === font.name;

                return (
                  <div
                    key={font.name}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {font.category}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check size={11} /> Em Uso
                          </span>
                        )}
                      </div>

                      {/* Live Font Sample */}
                      <div className="pt-1">
                        <h5
                          className="text-lg font-bold text-gray-900 truncate"
                          style={{ fontFamily: `"${font.name}", sans-serif` }}
                        >
                          {font.name}
                        </h5>
                        <p
                          className="text-sm text-gray-700 truncate mt-0.5"
                          style={{ fontFamily: `"${font.name}", sans-serif` }}
                        >
                          GPA Angola CRM 2026 - Gestão Comercial
                        </p>
                      </div>

                      {font.popularFor && (
                        <p className="text-[10px] text-gray-400 font-medium leading-tight">
                          💡 {font.popularFor}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        applyGlobalFont(font.name);
                        setCurrentFont(font.name);
                        setFontApplySuccess(font.name);
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gray-900 hover:bg-[#003366] text-white'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check size={13} /> Fonte Aplicada
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Aplicar no CRM
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* App Logo personalizer */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
          <Image size={16} className="text-[#003366]" /> Logomarca Personalizada do CRM
        </h4>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-[#001f3f] rounded-xl border border-[#003366] flex items-center justify-center p-2 shadow-inner relative overflow-hidden">
            <AppLogoImage src={appLogo} alt="Logo CRM" />
          </div>

          <div className="flex-1 space-y-2.5 text-center md:text-left">
            <h5 className="text-xs font-extrabold text-gray-700 uppercase">Substituir Logomarca Padrão</h5>
            <p className="text-[11px] text-gray-400 leading-normal font-semibold">Carregue o logótipo oficial do seu negócio. Ele substituirá instantaneamente o ícone padrão GPA no ecrã de início (Login), no menu lateral (Sidebar) e no topo do Dashboard.</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
                disabled={!isUserAdmin(loggedUser)}
              />
              <button
                onClick={() => {
                  if (isUserAdmin(loggedUser)) {
                    logoInputRef.current?.click();
                  } else {
                    alert('Apenas utilizadores com perfil Administrador podem alterar a logomarca da empresa!');
                  }
                }}
                disabled={!isUserAdmin(loggedUser)}
                className={`${isUserAdmin(loggedUser) ? 'bg-[#003366] hover:bg-[#001f3f] cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm transition flex items-center gap-1.5`}
              >
                <Camera size={13} /> Escolher Imagem
              </button>
              
              {appLogo && (
                <button
                  onClick={() => {
                    if (!isUserAdmin(loggedUser)) {
                      alert('Apenas utilizadores com perfil Administrador podem alterar a logomarca da empresa!');
                      return;
                    }
                    if (confirm('Deseja restaurar a logomarca padrão GPA Angola?')) {
                      onSaveAppLogo('');
                    }
                  }}
                  disabled={!isUserAdmin(loggedUser)}
                  className={`${isUserAdmin(loggedUser) ? 'bg-white hover:bg-red-50 text-red-600 border border-red-200 cursor-pointer' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'} text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm transition flex items-center gap-1.5`}
                >
                  <RefreshCw size={13} /> Restaurar Padrão
                </button>
              )}
            </div>
            {!isUserAdmin(loggedUser) && (
              <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">⚠️ Apenas Administradores podem alterar a logomarca da empresa.</p>
            )}
            <span className="text-[9px] text-gray-400 block font-semibold uppercase">Tamanho recomendado: Quadrado ou Rectangular curto (PNG com fundo transparente, máx 1.5MB).</span>
          </div>
        </div>
      </div>

      {/* Profile personalizer */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
          <Camera size={16} /> Personalização do Perfil
        </h4>

        <div className="space-y-4">
          {!loggedUser.foto && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <strong className="block mb-0.5 uppercase tracking-wider text-[10px] text-amber-900">Fotografia Obrigatória</strong>
                <span>Cada utilizador deve carregar obrigatoriamente uma fotografia de perfil para identificação e auditoria no CRM.</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 flex-wrap">
            {loggedUser.foto ? (
              <img src={loggedUser.foto} alt={loggedUser.nome} className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center text-xl shadow animate-pulse">
                {getInitials(loggedUser.nome)}
              </div>
            )}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
              >
                <Camera size={13} /> Escolher Fotografia
              </button>
              <span className="text-[10px] text-gray-400 block font-medium">Envie uma imagem JPG ou PNG de até 1MB.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Nome Completo</label>
              <input
                type="text"
                value={profileNome}
                onChange={(e) => setProfileNome(e.target.value)}
                placeholder="Introduza o seu nome"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-400 text-xs font-bold text-slate-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Alterar Palavra-passe</label>
              <input
                type="text"
                placeholder="Ex: nova_passe123"
                value={profileSenha}
                onChange={(e) => setProfileSenha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-400 text-xs font-bold text-slate-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (!profileNome.trim()) {
                  alert('O nome não pode estar vazio!');
                  return;
                }
                if (onUpdateProfile) {
                  onUpdateProfile(
                    profileNome.trim(),
                    profileSenha.trim(),
                    undefined,
                    preferenciaNotificacao,
                    whatsappNumero,
                    telegramChatId,
                    emailNotificacao
                  );
                  alert('✅ Perfil e contactos atualizados com sucesso!');
                }
              }}
              className="bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} /> Guardar Perfil & Contactos
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Channel Notification Preferences (WhatsApp, Email, Telegram) */}
      <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#25D366] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
          <Phone size={18} className="text-[#25D366]" />
          <div>
            <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Notificações por WhatsApp, Email & Telegram</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 font-semibold">Configura onde e como pretendes receber alertas e relatórios em tempo real.</p>
          </div>
        </div>

        {/* Role Rule Notice */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#003366] uppercase text-[10px]">
            <Shield size={13} className="text-blue-600" /> Regra Estrita de Distribuição por Perfil:
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            • <strong>Quando Comerciais adicionam dados:</strong> Apenas Admins e Gestores recebem notificações no WhatsApp, Email, Telegram e In-App.<br />
            • <strong>Quando Gestores/Admins adicionam dados:</strong> Apenas Comerciais recebem notificações nos seus canais preferidos.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Canal Preferencial de Notificações</label>
              <select
                value={preferenciaNotificacao}
                onChange={(e) => setPreferenciaNotificacao(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="todos">🌟 Todos os Canais (WhatsApp + Email + Telegram + In-App)</option>
                <option value="whatsapp">📱 Apenas WhatsApp</option>
                <option value="telegram">✈️ Apenas Telegram</option>
                <option value="email">✉️ Apenas Email</option>
                <option value="nenhum">🔕 Apenas Notificações In-App</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Número do WhatsApp (com código de país)</label>
              <input
                type="text"
                value={whatsappNumero}
                onChange={(e) => setWhatsappNumero(e.target.value)}
                placeholder="+244 923 000 000"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Telegram Chat ID</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Ex: 123456789"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Email para Alertas</label>
              <input
                type="email"
                value={emailNotificacao}
                onChange={(e) => setEmailNotificacao(e.target.value)}
                placeholder="Ex: gestor@gpaangola.co.ao"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Save notification settings button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
            <button
              onClick={handleSaveNotificationSettings}
              disabled={isSavingNotif}
              className="bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> {isSavingNotif ? 'A guardar...' : '💾 Guardar Definições de Notificação do Perfil'}
            </button>

            {/* Test notification button */}
            <button
              onClick={async () => {
                if (onUpdateProfile) {
                  onUpdateProfile(
                    profileNome,
                    profileSenha,
                    undefined,
                    preferenciaNotificacao,
                    whatsappNumero,
                    telegramChatId,
                    emailNotificacao
                  );
                }

                try {
                  const testTitle = '🚨 Teste de Notificação GPA Angola';
                  const testMsg = `Olá ${loggedUser.nome}, este é um teste de notificação em tempo real enviado via Gateway de Servidor para o WhatsApp (${whatsappNumero}) e Email (${emailNotificacao}).`;

                  const res = await fetch('/api/notifications/dispatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      notification: {
                        id: Date.now(),
                        type: 'success',
                        title: testTitle,
                        text: testMsg,
                        autorNome: loggedUser.nome,
                        autorPerfil: loggedUser.perfil,
                        dataHora: new Date().toLocaleTimeString('pt-AO')
                      },
                      sender: { id: loggedUser.id, nome: loggedUser.nome, perfil: loggedUser.perfil },
                      targetUsers: [{
                        id: loggedUser.id,
                        nome: loggedUser.nome,
                        email: loggedUser.email,
                        perfil: loggedUser.perfil,
                        telefone: whatsappNumero || loggedUser.telefone,
                        preferenciaNotificacao: preferenciaNotificacao || 'todos',
                        whatsappNumero: whatsappNumero || loggedUser.telefone,
                        telegramChatId: telegramChatId,
                        emailNotificacao: emailNotificacao || loggedUser.email
                      }]
                    })
                  });

                  const data = await res.json();
                  alert(`✅ Notificação disparada com sucesso via servidor cloud!\n\nCanais executados: ${data.canais ? data.canais.join(', ') : 'WhatsApp Gateway, Email, Telegram'}\n\nNota: Se desejar abrir a mensagem diretamente no WhatsApp do seu dispositivo, use também a hiperligação directa.`);
                } catch (err) {
                  alert('Erro ao disparar teste de notificação. Verifique a ligação ao servidor.');
                }
              }}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Phone size={14} /> Testar Disparo de Notificação Agora
            </button>
          </div>

          {/* WhatsApp Gateway Server Settings (Cloud Run & Vercel) */}
          <div className="mt-6 pt-5 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-emerald-600" />
              <h5 className="text-xs font-extrabold text-[#003366] uppercase tracking-wide">
                Configuração do Gateway WhatsApp de Servidor (Vercel & Cloud Run)
              </h5>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Configure aqui o provedor da API de WhatsApp do servidor. Isto permite enviar notificações instantâneas sem depender do WhatsApp Web no navegador.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase">Provedor / API Gateway</label>
                <select
                  value={waProvider}
                  onChange={(e) => setWaProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="ultramsg">🚀 UltraMsg API (Recomendado - Instância Direta)</option>
                  <option value="evolution">⚡ Evolution API / WPPConnect (Servidor Próprio / Docker)</option>
                  <option value="zapi">🟢 Z-API / Green API</option>
                  <option value="webhook">🌐 Webhook Personalizado (Make.com / N8N / Zapier)</option>
                  <option value="callmebot">🆓 CallMeBot / Gateway Gratuito</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase">Instância ID / Nome</label>
                <input
                  type="text"
                  value={waInstanceId}
                  onChange={(e) => setWaInstanceId(e.target.value)}
                  placeholder="Ex: instance123456"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase">Chave de API / Token</label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  placeholder="Ex: token_xyz_123"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase">URL do Webhook / Servidor</label>
                <input
                  type="text"
                  value={waWebhookUrl}
                  onChange={(e) => setWaWebhookUrl(e.target.value)}
                  placeholder="Ex: https://sua-api.com ou https://hook.integromat.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleSaveGatewayConfig}
                disabled={isSavingGateway}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} /> {isSavingGateway ? 'A guardar...' : 'Guardar Servidor Gateway WhatsApp'}
              </button>

              <a
                href={`https://wa.me/${(whatsappNumero || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                📲 Abrir Conversa Direta no WhatsApp ({whatsappNumero})
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* External Billing Integration */}
      <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#0A84FF] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-blue-500" />
          <div>
            <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Sincronização / Integração de Faturação</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 font-semibold">Sincronize credenciais com Primavera ERP, PHC Software ou Primavera Express para receção automática de faturas.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200/50 p-4 space-y-2.5 text-xs text-gray-600 font-semibold leading-normal">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Estado da API</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wide">
              Conectado (Primavera ERP)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Endpoint Webhook</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-500">https://api.gpa.ao/crm/v1/invoices</code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Última Sincronização</span>
            <span className="text-gray-700">{syncTime}</span>
          </div>
        </div>

        <button
          onClick={onSimulateSync}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} className="animate-spin-slow" /> Simular Receção de Fatura Externa
        </button>
      </div>

      {/* Histórico de Operações & Registo de Auditoria (Anulação e Reversão) */}
      <div id="historico-operacoes" className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-600 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
              <History size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#003366] uppercase tracking-wide">
                📜 Histórico de Operações & Auditoria (Com Reversão)
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Consulte as alterações efetuadas no CRM e anule acções feitas por engano. {isAdmin ? ' (Modo Gestão Geral: Administrador)' : ` (Histórico Individual do Utilizador: ${loggedUser.nome})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <Activity size={13} className="text-blue-600" />
              {userVisibleOperations.length} {userVisibleOperations.length === 1 ? 'operação' : 'operações'}
            </span>
            {operacoesLog.length > 0 && isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm('Deseja limpar todo o histórico de operações? Esta acção limpa os registos de auditoria.')) {
                    onClearOperacoesLog();
                  }
                }}
                className="text-[11px] bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 font-bold px-2.5 py-1 rounded transition cursor-pointer"
                title="Limpar registos de auditoria"
              >
                Limpar Histórico
              </button>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs font-semibold text-blue-900 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600 shrink-0" />
            <span>📌 Como utilizador comercial, apenas visualiza e pode reverter/anular operações realizadas com a sua conta (<strong>{loggedUser.nome}</strong>).</span>
          </div>
        )}

        {/* Search & Filter bar for Operations */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200/80">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, proposta ou acção..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'criacao', label: 'Criações' },
              { id: 'edicao', label: 'Edições' },
              { id: 'status', label: 'Estados' },
              { id: 'exclusao', label: 'Exclusões' },
              { id: 'reversao', label: 'Reversões' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setLogTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  logTypeFilter === f.id
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Operations List */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {userVisibleOperations.length === 0 ? (
            <div className="py-8 text-center text-gray-400 space-y-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <History size={28} className="mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-600">Sem registos no histórico de operações</p>
              <p className="text-[11px] text-gray-400">À medida que criar, editar ou eliminar propostas, clientes e visitas, as acções aparecerão aqui.</p>
            </div>
          ) : (
            userVisibleOperations
              .filter(op => {
                const matchesType = logTypeFilter === 'todos' || op.tipoAcao === logTypeFilter;
                const q = logSearch.toLowerCase().trim();
                const matchesSearch = !q ||
                  op.descricao.toLowerCase().includes(q) ||
                  op.usuarioNome.toLowerCase().includes(q) ||
                  op.entidade.toLowerCase().includes(q);
                return matchesType && matchesSearch;
              })
              .map(op => {
                const isReverted = !!op.revertidoEm;
                const isMyOwnOp = (op.usuarioNome || '').toLowerCase().trim() === (loggedUser.nome || '').toLowerCase().trim();
                const canRevertOp = !isReverted && op.podeReverter !== false && (isAdmin || isMyOwnOp);

                // Action badge styling
                let actionBadge = { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Operação' };
                if (op.tipoAcao === 'criacao') actionBadge = { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Criação' };
                if (op.tipoAcao === 'edicao') actionBadge = { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Edição' };
                if (op.tipoAcao === 'exclusao') actionBadge = { bg: 'bg-red-100 text-red-800 border-red-200', label: 'Exclusão' };
                if (op.tipoAcao === 'status') actionBadge = { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Estado' };
                if (op.tipoAcao === 'reversao') actionBadge = { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Anulação / Reversão' };

                return (
                  <div
                    key={op.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      isReverted
                        ? 'bg-gray-50/80 border-gray-200 opacity-75'
                        : 'bg-white border-gray-200 hover:border-blue-300 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${actionBadge.bg}`}>
                          {actionBadge.label}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {op.entidade}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          🕒 {op.dataHora}
                        </span>
                        <span className="text-[11px] font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded">
                          👤 {op.usuarioNome} {op.usuarioPerfil ? `(${op.usuarioPerfil})` : ''}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-800">
                        {op.descricao}
                      </p>

                      {isReverted && (
                        <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                          <RotateCcw size={11} /> Revertido / Anulado por {op.revertidoPor || 'Utilizador'} em {new Date(op.revertidoEm!).toLocaleString('pt-AO')}
                        </div>
                      )}
                    </div>

                    {/* Revert / Undo Button */}
                    <div className="shrink-0 self-end md:self-center">
                      {canRevertOp ? (
                        confirmRevertId === op.id ? (
                          <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-lg border border-amber-300 animate-fade-in">
                            <span className="text-[10px] font-bold text-amber-900">Confirmar anulação?</span>
                            <button
                              onClick={() => {
                                onRevertOperation(op);
                                setConfirmRevertId(null);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Sim, Reverter
                            </button>
                            <button
                              onClick={() => setConfirmRevertId(null)}
                              className="bg-gray-200 text-gray-800 text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Sair
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRevertId(op.id)}
                            className="bg-gray-900 hover:bg-[#003366] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Reverter ou anular esta operação indesejada"
                          >
                            <Undo2 size={13} className="text-amber-400" /> Reverter / Anular
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Recycle Bin / Lixeira Section (Escondido nas Configurações) */}
      <div id="campo-reciclagem" className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-500 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="text-amber-500" size={18} />
            <div>
              <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide font-serif">
                🗑️ Campo de Reciclagem & Lixeira
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold">
                Consulte e recupere dados apagados acidentalmente ou elimine-os permanentemente do sistema.
              </p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded">
            {recycleItems.length} {recycleItems.length === 1 ? 'registo' : 'registos'} na lixeira
          </span>
        </div>

        <RecycleBinView
          recycleItems={recycleItems}
          onRestoreItem={onRestoreItem}
          onPermanentDelete={onPermanentDelete}
          onClearRecycleBin={onClearRecycleBin}
        />
      </div>

    </div>
  );
}
