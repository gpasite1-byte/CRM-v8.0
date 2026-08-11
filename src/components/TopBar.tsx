import React, { useState, useRef, useEffect } from 'react';
import { Usuario, Deal, Cliente, NotificationItem, isUserCommercial, isUserManager } from '../types';
import UserAvatar from './UserAvatar';
import { Search, Bell, LogOut, MapPin, CheckCircle, AlertTriangle, Info, CalendarDays, X, Menu, FileSpreadsheet, Sparkles, FileText, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  currentView: string;
  loggedUser: Usuario | null;
  onLogout: () => void;
  onViewChange: (viewId: string) => void;
  deals: Deal[];
  clients: Cliente[];
  comerciais: Usuario[];
  notifications: NotificationItem[];
  onRemoveNotification: (id: number) => void;
  onClearNotifications: () => void;
  onToggleMobileMenu?: () => void;
  onOpenExcelImport?: () => void;
  onOpenPdfExtractor?: () => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function TopBar({
  currentView,
  loggedUser,
  onLogout,
  onViewChange,
  deals,
  clients,
  comerciais,
  notifications,
  onRemoveNotification,
  onClearNotifications,
  onToggleMobileMenu,
  onOpenExcelImport,
  onOpenPdfExtractor,
  themeMode = 'dark',
  onToggleTheme
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (
        notifRef.current && 
        bellRef.current && 
        !notifRef.current.contains(event.target as Node) && 
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard Analítico';
      case 'chat': return 'Chat da Equipa & Chamadas HD';
      case 'base_duas_semanas': return 'Base de Duas Semanas';
      case 'historico_dia': return 'Histórico do Dia (Auditoria Geral)';
      case 'agenda': return 'Agenda & Visitas';
      case 'clientes': return 'Clientes';
      case 'visitas': return 'Histórico de Visitas';
      case 'crm': return 'Pipeline Comercial (Kanban)';
      case 'recomendacoes': return 'Recomendações CRM';
      case 'metas': return 'Metas & Performance';
      case 'comparativo': return 'Comparativo Semanal';
      case 'relatorios': return 'Relatórios de Vendas';
      case 'utilizadores': return 'Gestão de Utilizadores';
      case 'configuracoes': return 'Configurações do Sistema';
      case 'helena': return 'GPA AUXILIO';
      default: return 'GPA CRM';
    }
  };

  const getSearchResults = () => {
    if (searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    const results: { type: string; label: string; action: () => void }[] = [];

    clients.filter(c => c.nome.toLowerCase().includes(query) || c.empresa.toLowerCase().includes(query))
      .slice(0, 3).forEach(c => {
        results.push({
          type: 'Cliente',
          label: `${c.empresa} — ${c.nome}`,
          action: () => onViewChange('clientes')
        });
      });

    deals.filter(d => d.titulo.toLowerCase().includes(query) || d.clienteNome.toLowerCase().includes(query))
      .slice(0, 3).forEach(d => {
        results.push({
          type: 'Negócio',
          label: `${d.titulo} (${new Intl.NumberFormat('pt-AO').format(d.valor)} Kz)`,
          action: () => onViewChange('crm')
        });
      });

    comerciais.filter(u => u.nome.toLowerCase().includes(query))
      .slice(0, 2).forEach(u => {
        results.push({
          type: 'Comercial',
          label: `${u.nome} — ${u.funcao}`,
          action: () => onViewChange('utilizadores')
        });
      });

    return results;
  };

  const searchResults = getSearchResults();

  const visibleNotifications = notifications.filter(n => {
    if (isUserCommercial(loggedUser)) {
      if (n.forGestoresOnly) return false;
      if (n.targetRoles && !n.targetRoles.includes('comercial')) return false;
    }
    if (isUserManager(loggedUser)) {
      if (n.forComerciaisOnly) return false;
      if (n.targetRoles && !n.targetRoles.includes('admin') && !n.targetRoles.includes('supervisor')) return false;
    }
    return true;
  });

  return (
    <header className="w-full h-[70px] border-b flex items-center justify-between px-4 md:px-8 relative z-50 shrink-0 shadow-lg bg-white/90 dark:bg-[#001f3f] border-sky-200 dark:border-cyan-500/30 text-slate-900 dark:text-white">
      
      {/* Title */}
      <div className="flex items-center gap-2 md:gap-3 max-w-[45%]">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl transition mr-1 cursor-pointer flex-shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Abrir menu"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="hidden xl:flex flex-col rounded-2xl border px-3 py-1.5 shadow-sm border-sky-200 dark:border-cyan-400/20 bg-sky-50 dark:bg-cyan-950/40">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-cyan-200">Hoje</span>
          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-100">{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <h2 className="text-xs md:text-base font-black uppercase tracking-wider truncate drop-shadow-sm text-slate-900 dark:text-white">{getTitle()}</h2>
        <span className="hidden sm:inline-flex text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md bg-emerald-100 text-emerald-800 dark:bg-gradient-to-r from-amber-400 to-emerald-400 dark:text-slate-950">v8.0 PRO</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* PDF Data Extractor IA Button */}
        {onOpenPdfExtractor && (
          <button
            onClick={onOpenPdfExtractor}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 text-xs font-black py-1.5 px-3.5 rounded-full shadow-md transition cursor-pointer"
            title="Extrair dados de PDF e adicionar ao CRM"
          >
            <Sparkles size={14} className="text-slate-950" />
            <span>Extrair PDF (IA)</span>
          </button>
        )}

        {/* Global Search */}
        <div ref={searchRef} className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyan-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Procurar..."
            className="w-[140px] sm:w-[220px] pl-9 pr-4 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-xs font-medium transition-all shadow-sm"
          />
          
          {/* Dropdown Results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-[42px] right-0 sm:left-0 w-[300px] sm:w-[320px] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl z-[9999] overflow-hidden max-h-[300px] overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    res.action();
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800 flex items-center gap-2 transition"
                >
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider">
                    {res.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate">{res.label}</span>
                </button>
              ))}
            </div>
          )}
          {showDropdown && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-[42px] right-0 sm:left-0 w-[300px] sm:w-[320px] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl z-[9999] p-4 text-center text-xs font-semibold text-slate-400">
              Sem resultados encontrados para "{searchQuery}"
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative flex items-center gap-1.5">
          
          {/* Live Realtime Connection Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/40 rounded-full text-[10px] font-bold text-emerald-300" title="Firestore e Notificações v8.0 Sincronizados em Tempo Real">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firestore v8.0 PRO</span>
          </div>

          <button
            ref={bellRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-full transition cursor-pointer shadow-sm"
            title="Notificações em Tempo Real"
          >
            <Bell size={18} />
            {visibleNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-slate-950 rounded-full animate-ping"></span>
            )}
            {visibleNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-slate-950 rounded-full"></span>
            )}
          </button>

          {/* Notifications Card */}
          {showNotifications && (
            <div ref={notifRef} className="fixed sm:absolute right-2 sm:right-0 top-[60px] sm:top-[45px] w-[calc(100vw-24px)] sm:w-[350px] max-w-[350px] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl z-[9999] overflow-hidden font-sans">
              <div className="px-4 py-3 bg-slate-950 text-white font-bold text-xs flex justify-between items-center uppercase tracking-wide border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span>🔔 Notificações ({visibleNotifications.length})</span>
                  <button
                    onClick={() => {
                      try {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContext) {
                          const ctx = new AudioContext();
                          if (ctx.state === 'suspended') ctx.resume();
                          const osc = ctx.createOscillator();
                          const gain = ctx.createGain();
                          osc.frequency.setValueAtTime(880, ctx.currentTime);
                          gain.gain.setValueAtTime(0.2, ctx.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                          osc.connect(gain);
                          gain.connect(ctx.destination);
                          osc.start();
                          osc.stop(ctx.currentTime + 0.3);
                        }
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                    className="text-[10px] bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-xs transition cursor-pointer"
                    title="Testar Alerta Sonoro"
                  >
                    🔊 Testar Som
                  </button>
                </div>
                {visibleNotifications.length > 0 && (
                  <button onClick={onClearNotifications} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
                    Limpar tudo
                  </button>
                )}
              </div>
              <div className="max-h-[60vh] sm:max-h-[360px] overflow-y-auto custom-scrollbar">
                {visibleNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs font-semibold text-slate-400">
                    Sem novas notificações. O sistema está a monitorizar alterações em tempo real.
                  </div>
                ) : (
                  visibleNotifications.map((notif) => {
                    return (
                      <div key={notif.id} className="p-3.5 border-b border-slate-800/80 hover:bg-slate-800/50 flex gap-2.5 items-start relative group transition">
                        <div className="mt-0.5">
                          {notif.type === 'warn' && <AlertTriangle size={15} className="text-amber-400" />}
                          {notif.type === 'info' && <Info size={15} className="text-cyan-400" />}
                          {notif.type === 'success' && <CheckCircle size={15} className="text-emerald-400" />}
                        </div>
                        <div className="flex-grow text-left">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">{notif.title}</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.text}</p>
                          {loggedUser && (loggedUser.whatsappNumero || loggedUser.telefone) && (
                            <a
                              href={`https://wa.me/244${(loggedUser.whatsappNumero || loggedUser.telefone).replace(/[^0-9]/g, '').slice(-9)}?text=${encodeURIComponent(`🚨 *GPA Angola CRM*\n📌 *${notif.title}*\n${notif.text}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-500/30 transition"
                            >
                              📲 Enviar p/ WhatsApp
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveNotification(notif.id)}
                          className="absolute right-2 top-2 p-1 text-slate-500 hover:text-rose-400 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Province / User Avatar / Logout */}
        {loggedUser && (
          <div 
            onClick={() => onViewChange('configuracoes')}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-700 cursor-pointer transition shadow-xs"
            title="Aceder às Configurações e Perfil"
          >
            <UserAvatar name={loggedUser.nome} foto={loggedUser.foto} size="sm" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[11px] font-black text-white max-w-[100px] md:max-w-[140px] truncate">{loggedUser.nome}</span>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{loggedUser.provincia || 'Luanda'}</span>
            </div>
          </div>
        )}

{onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border transition cursor-pointer bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title={themeMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}

          <button
            onClick={onLogout}
            className="border font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 transition cursor-pointer bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 hover:border-rose-300 dark:hover:border-rose-400"
          title="Sair"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sair</span>
        </button>

      </div>
    </header>
  );
}
