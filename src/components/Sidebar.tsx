import React from 'react';
import AppLogoImage from './AppLogoImage';
import { Usuario, isUserAdmin, isUserManager } from '../types';
import UserAvatar from './UserAvatar';
import {
  LayoutDashboard,
  CalendarDays,
  Users2,
  MapPin,
  Columns,
  Lightbulb,
  Flag,
  Target,
  ArrowUpDown,
  FileBarChart,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
  Files,
  X,
  ListFilter,
  FileText,
  BookOpen,
  Database,
  History,
  MessageSquare,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (viewId: string) => void;
  loggedUser: Usuario | null;
  onLogout: () => void;
  crmName: string;
  appLogo?: string;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  unreadChatCount?: number;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  loggedUser,
  onLogout,
  crmName,
  appLogo,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
  unreadChatCount = 0,
  themeMode = 'dark',
  onToggleTheme
}: SidebarProps) {
  if (!loggedUser) return null;

  const isAdminOrManager = isUserManager(loggedUser);

  const getInitials = (n: string) => {
    if (!n) return 'GP';
    return n.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'chat', label: 'Chat & Chamadas', icon: MessageSquare, visible: true },
    { id: 'cpaas', label: 'Automação CPaaS & AI', icon: Zap, visible: true },
    { id: 'base_duas_semanas', label: 'Base de Duas Semanas', icon: Database, visible: true },
    { id: 'historico_dia', label: 'Histórico do Dia (Admins)', icon: History, visible: isUserAdmin(loggedUser) },
    { id: 'analise_critica', label: 'Análise Crítica Comercial', icon: FileText, visible: true },
    { id: 'agenda', label: 'Agenda & Visitas', icon: CalendarDays, visible: true },
    { id: 'clientes', label: 'Clientes', icon: Users2, visible: true },
    { id: 'visitas', label: 'Histór. de Visitas', icon: MapPin, visible: true },
    { id: 'crm', label: 'CRM Pipeline', icon: Columns, visible: true },
    { id: 'recomendacoes', label: 'Recomendações CRM', icon: Lightbulb, visible: true },
    { id: 'metas', label: 'Metas & Performance', icon: Flag, visible: true },
    { id: 'metas_comissoes', label: 'Metas & Comissões (AOA)', icon: Target, visible: true },
    { id: 'comparativo', label: 'Comparativo Semanal', icon: ArrowUpDown, visible: true },
    { id: 'listas', label: 'Listas e Parâmetros', icon: ListFilter, visible: true },
    { id: 'documentos', label: 'Documentos & Comprov.', icon: Files, visible: true },
    { id: 'relatorios', label: 'Relatórios', icon: FileBarChart, visible: true },
    { id: 'utilizadores', label: 'Utilizadores', icon: ShieldCheck, visible: isAdminOrManager },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, visible: true },
    { id: 'manual_rapido', label: 'Manual Rápido', icon: BookOpen, visible: true },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] md:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={onCloseMobileMenu}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-[1000] md:z-20 w-[260px] flex flex-col flex-shrink-0 shadow-2xl border-r transition-transform duration-200 ease-in-out transform ${
          themeMode === 'dark'
            ? 'bg-[linear-gradient(180deg,rgba(6,10,18,0.98),rgba(9,16,31,0.96),rgba(16,24,41,0.95))] text-white border-cyan-500/20'
            : 'bg-[linear-gradient(180deg,#ffffff_0%,#f4f7ff_55%,#eff6ff_100%)] text-slate-900 border-sky-200'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        
        {/* Brand logo */}
        <div className={`p-5 flex items-center justify-between gap-2 border-b ${themeMode === 'dark' ? 'border-cyan-500/20 bg-slate-900/60' : 'border-sky-200 bg-white/70'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border p-1 ${themeMode === 'dark' ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-sky-200'}`}>
              <AppLogoImage src={appLogo} alt="GPA Logo" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className={`text-sm font-black tracking-wide uppercase leading-none ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{crmName || "GPA ANGOLA"}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-xs ${themeMode === 'dark' ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-400/40' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>v8.0 PRO</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </div>
          {onCloseMobileMenu && (
            <button
              onClick={onCloseMobileMenu}
              className={`p-1.5 rounded-lg transition md:hidden cursor-pointer ${themeMode === 'dark' ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              title="Fechar menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

      {/* Nav List */}
      <nav className="flex-grow overflow-y-auto p-3.5 space-y-1 custom-scrollbar">
        <ul className="space-y-1">
          {menuItems.filter(item => item.visible).map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition duration-150 text-left cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black shadow-lg shadow-emerald-500/20 border-emerald-300/60'
                      : themeMode === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-transparent hover:border-slate-700/60'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-transparent hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon size={16} className={isActive ? 'text-emerald-200' : 'text-slate-400'} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.id === 'chat' && unreadChatCount > 0 && (
                    <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Separator for HELENA IA 8.0 assistant */}
        <div className={`border-t my-3 pt-3 ${themeMode === 'dark' ? 'border-cyan-500/20' : 'border-sky-200'}`}>
          <button
            onClick={() => onViewChange('helena')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition duration-150 text-left cursor-pointer ${
              currentView === 'helena'
                ? 'bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                : themeMode === 'dark'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-400/20 hover:bg-amber-400/20'
                  : 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Sparkles size={16} className={currentView === 'helena' ? 'text-slate-950' : 'text-amber-400 animate-spin'} />
            HELENA IA 8.0 PRO
          </button>
        </div>
      </nav>

      {/* Logged User Card */}
      <div className={`p-4 border-t flex items-center justify-between gap-2.5 ${themeMode === 'dark' ? 'border-cyan-500/20 bg-slate-950/60' : 'border-sky-200 bg-white/80'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <UserAvatar name={loggedUser.nome} foto={loggedUser.foto} size="md" />
          <div className="flex flex-col overflow-hidden text-left">
            <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{loggedUser.nome}</h4>
            <span className="text-[10px] text-cyan-300 uppercase font-semibold mt-0.5 tracking-wider">
              {loggedUser.perfil === 'admin' ? 'Administrador' : loggedUser.perfil === 'supervisor' ? 'Supervisor' : 'Comercial'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition cursor-pointer ${themeMode === 'dark' ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
              title={themeMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            onClick={onLogout}
            className={`p-2 rounded-lg transition cursor-pointer ${themeMode === 'dark' ? 'hover:bg-rose-500/20 text-white/60 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-600 hover:text-rose-500'}`}
            title="Terminar Sessão"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
