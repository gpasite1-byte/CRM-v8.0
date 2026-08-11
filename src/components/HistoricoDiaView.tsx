import React, { useState, useMemo } from 'react';
import { OperacaoLog, Usuario, isUserAdmin } from '../types';
import {
  History,
  Search,
  Calendar,
  Filter,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  AlertOctagon,
  Clock,
  Layers,
  PlusCircle,
  Edit3,
  XCircle,
  Activity,
  CheckCircle2,
  Eye,
  Lock,
  Download
} from 'lucide-react';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface HistoricoDiaViewProps {
  operacoesLog: OperacaoLog[];
  loggedUser: Usuario | null;
  comerciais: Usuario[];
  refDate?: Date;
  onRefDateChange?: (d: Date) => void;
  selectedPeriod?: PeriodType;
  onPeriodTypeChange?: (p: PeriodType) => void;
  selectedComercial?: string;
  onComercialChange?: (c: string) => void;
  selectedEmpresa?: string;
  onEmpresaChange?: (e: string) => void;
  selectedProvincia?: string;
  onProvinciaChange?: (p: string) => void;
  onRevertOperation: (op: OperacaoLog) => void;
  onClearOperacoesLog: () => void;
}

export default function HistoricoDiaView({
  operacoesLog = [],
  loggedUser,
  comerciais = [],
  selectedComercial: propSelectedComercial,
  onRevertOperation,
  onClearOperacoesLog
}: HistoricoDiaViewProps) {
  // Check if current user is Admin
  const isAdmin = isUserAdmin(loggedUser);

  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().substring(0, 10);

  // Filters state
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'hoje' | 'ontem' | '7dias' | 'todas' | 'custom'>('hoje');
  const [selectedComercial, setSelectedComercial] = useState<string>('todos');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedEntidade, setSelectedEntidade] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals state
  const [selectedOpDetails, setSelectedOpDetails] = useState<OperacaoLog | null>(null);
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);

  // Format Helper for dates
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split(' ');
      const dParts = parts[0].split('-');
      if (dParts.length === 3) {
        return `${dParts[2]}/${dParts[1]}/${dParts[0]} ${parts[1] || ''}`.trim();
      }
    } catch {
      // fallback
    }
    return dateString;
  };

  // Quick Date Filter setter
  const handleDateModeChange = (mode: 'hoje' | 'ontem' | '7dias' | 'todas') => {
    setDateMode(mode);
    if (mode === 'hoje') {
      setSelectedDate(todayStr);
    } else if (mode === 'ontem') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(yesterday.toISOString().substring(0, 10));
    } else {
      setSelectedDate('');
    }
  };

  // Extract unique commercial names from logs + user list
  const listComerciaisOptions = useMemo(() => {
    const namesSet = new Set<string>();
    comerciais.forEach(u => {
      if (u.nome) namesSet.add(u.nome.trim());
    });
    operacoesLog.forEach(op => {
      if (op.usuarioNome) namesSet.add(op.usuarioNome.trim());
    });
    return Array.from(namesSet).sort();
  }, [comerciais, operacoesLog]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return operacoesLog.filter(op => {
      // Date filter
      if (dateMode === 'hoje') {
        if (!op.dataHora.startsWith(todayStr)) return false;
      } else if (dateMode === 'ontem') {
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
        if (!op.dataHora.startsWith(yesterdayStr)) return false;
      } else if (dateMode === '7dias') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().substring(0, 10);
        const logDateStr = op.dataHora.substring(0, 10);
        if (logDateStr < sevenDaysAgo) return false;
      } else if (dateMode === 'custom' && selectedDate) {
        if (!op.dataHora.startsWith(selectedDate)) return false;
      }

      // Comercial filter
      if (selectedComercial !== 'todos') {
        if ((op.usuarioNome || '').toLowerCase().trim() !== selectedComercial.toLowerCase().trim()) {
          return false;
        }
      }

      // Tipo de Acao filter
      if (selectedTipo !== 'todos') {
        if (op.tipoAcao !== selectedTipo) return false;
      }

      // Entidade filter
      if (selectedEntidade !== 'todos') {
        if (op.entidade !== selectedEntidade) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchUser = (op.usuarioNome || '').toLowerCase().includes(q);
        const matchDesc = (op.descricao || '').toLowerCase().includes(q);
        const matchEnt = (op.entidade || '').toLowerCase().includes(q);
        const matchId = (op.entidadeId || '').toLowerCase().includes(q);
        if (!matchUser && !matchDesc && !matchEnt && !matchId) return false;
      }

      return true;
    });
  }, [operacoesLog, dateMode, selectedDate, todayStr, selectedComercial, selectedTipo, selectedEntidade, searchTerm]);

  // Daily Metrics Calculations
  const metrics = useMemo(() => {
    const total = filteredLogs.length;
    const activeComerciais = new Set(filteredLogs.map(op => op.usuarioNome)).size;
    const criacoes = filteredLogs.filter(op => op.tipoAcao === 'criacao').length;
    const edicoes = filteredLogs.filter(op => op.tipoAcao === 'edicao' || op.tipoAcao === 'status').length;
    const exclusoes = filteredLogs.filter(op => op.tipoAcao === 'exclusao').length;
    const revertidos = filteredLogs.filter(op => !!op.revertidoEm).length;

    return { total, activeComerciais, criacoes, edicoes, exclusoes, revertidos };
  }, [filteredLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('Não existem registos no histórico do dia para exportar.');
      return;
    }

    const headers = ['Data e Hora', 'Comercial', 'Perfil', 'Tipo de Ação', 'Entidade', 'ID Entidade', 'Descrição', 'Revertido em', 'Revertido por'];
    const rows = filteredLogs.map(op => [
      `"${op.dataHora}"`,
      `"${op.usuarioNome || ''}"`,
      `"${op.usuarioPerfil || ''}"`,
      `"${op.tipoAcao}"`,
      `"${op.entidade}"`,
      `"${op.entidadeId || ''}"`,
      `"${(op.descricao || '').replace(/"/g, '""')}"`,
      `"${op.revertidoEm || 'Não'}"`,
      `"${op.revertidoPor || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Historico_do_Dia_GPA_${selectedDate || 'geral'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user is not Admin, show explicit restricted access card
  if (!isAdmin) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center space-y-5 animate-fade-in">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock size={40} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Acesso Restrito: Histórico do Dia
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              O módulo <strong>Histórico do Dia (Auditoria Geral)</strong> é de acesso exclusivo para os <strong>Administradores do CRM GPA Angola</strong>.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 font-medium space-y-1.5 max-w-md mx-auto">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck size={16} className="text-amber-600" />
              Política de Segurança & Privacidade:
            </p>
            <p>
              Os utilizadores comerciais apenas têm permissão para consultar o histórico individual dos seus próprios dados na aba <em>Configurações → Auditoria</em>.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              Utilizador Atual: <strong>{loggedUser?.nome || 'Comercial'}</strong> ({loggedUser?.perfil || 'Comercial'})
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      
      {/* GLOBAL PERIOD BAR SYNCHRONIZED ACROSS ALL 13 VIEWS */}
      {refDate && onRefDateChange && selectedPeriod && onPeriodTypeChange && (
        <GlobalPeriodBar
          refDate={refDate}
          onRefDateChange={onRefDateChange}
          periodType={selectedPeriod}
          onPeriodTypeChange={onPeriodTypeChange}
          comerciais={comerciais}
          selectedComercial={selectedComercial || 'todos'}
          onComercialChange={onComercialChange || (() => {})}
          selectedEmpresa={selectedEmpresa || 'todas'}
          onEmpresaChange={onEmpresaChange || (() => {})}
          selectedProvincia={selectedProvincia || 'todas'}
          onProvinciaChange={onProvinciaChange || (() => {})}
          currentViewName="Histórico do Dia (Admins)"
        />
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#004080] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-gray-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Apenas Administradores
            </span>
            <span className="bg-white/10 text-white/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Modo Auditoria Geral
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
            <History className="text-amber-400" size={26} /> Histórico do Dia (Operações Comerciais)
          </h1>
          <p className="text-xs text-blue-100 max-w-2xl font-medium leading-relaxed">
            Acompanhe em tempo real todas as acções executadas por todos os comerciais durante o dia (criação de propostas, edições, mudanças de estado, eliminação e visitas).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Exportar registos do dia em CSV"
          >
            <Download size={14} /> Exportar CSV
          </button>
          
          {operacoesLog.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Tem a certeza que deseja limpar TODO o histórico de auditoria do CRM? Esta acção é irreversível.')) {
                  onClearOperacoesLog();
                }
              }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-400/30 text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Limpar Histórico de Auditoria"
            >
              <Trash2 size={14} /> Limpar Histórico
            </button>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards for the Selected Day */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Operações</span>
            <Activity size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.total}</div>
          <span className="text-[10px] font-medium text-gray-400">Registo global do dia</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comerciais Ativos</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.activeComerciais}</div>
          <span className="text-[10px] font-medium text-gray-400">Usuários que operaram</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Novos Registos</span>
            <PlusCircle size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{metrics.criacoes}</div>
          <span className="text-[10px] font-medium text-gray-400">Propostas & Clientes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Edições / Alterações</span>
            <Edit3 size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{metrics.edicoes}</div>
          <span className="text-[10px] font-medium text-gray-400">Atualizações efetuadas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Exclusões</span>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{metrics.exclusoes}</div>
          <span className="text-[10px] font-medium text-gray-400">Itens apagados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reversões</span>
            <RotateCcw size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.revertidos}</div>
          <span className="text-[10px] font-medium text-gray-400">Acções anuladas</span>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        {/* Date Presets Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mr-1">
              <Calendar size={14} className="text-blue-600" /> Data:
            </span>
            
            <button
              onClick={() => handleDateModeChange('hoje')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'hoje'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hoje ({todayStr.split('-').reverse().join('/')})
            </button>

            <button
              onClick={() => handleDateModeChange('ontem')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'ontem'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ontem
            </button>

            <button
              onClick={() => handleDateModeChange('7dias')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === '7dias'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Últimos 7 Dias
            </button>

            <button
              onClick={() => handleDateModeChange('todas')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'todas'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas as Datas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Data Específica:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDateMode('custom');
              }}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Dropdowns and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, proposta, utilizador ou acção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Comercial Filter */}
          <div>
            <select
              value={selectedComercial}
              onChange={(e) => setSelectedComercial(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">👤 Todos os Comerciais ({listComerciaisOptions.length})</option>
              {listComerciaisOptions.map(nome => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Acçao Filter */}
          <div>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">⚡ Todos os Tipos de Acção</option>
              <option value="criacao">➕ Criação (Adicionar)</option>
              <option value="edicao">✏️ Edição / Atualização</option>
              <option value="status">🔄 Mudança de Estado</option>
              <option value="exclusao">🗑️ Exclusão (Eliminar)</option>
              <option value="configuracao">⚙️ Configuração</option>
              <option value="reversao">↩️ Reversão</option>
            </select>
          </div>

          {/* Entidade Filter */}
          <div>
            <select
              value={selectedEntidade}
              onChange={(e) => setSelectedEntidade(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">📦 Todos os Módulos / Entidades</option>
              <option value="deal">📄 Propostas / Deals</option>
              <option value="cliente">👥 Clientes</option>
              <option value="visita">📍 Visitas</option>
              <option value="utilizador">🛡️ Utilizadores</option>
              <option value="arquivo">📎 Ficheiros / Documentos</option>
              <option value="relatorio">📊 Relatórios</option>
              <option value="configuracao">⚙️ Configurações</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wide text-[#003366]">
              Registos de Auditoria em Tempo Real ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500">
            Apenas acessível a Administradores
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700">Nenhum registo de operação encontrado</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tente alterar os filtros de data, comercial ou palavra-chave de pesquisa para visualizar mais auditorias.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Horário / Data</th>
                  <th className="py-3 px-4">Comercial / Utilizador</th>
                  <th className="py-3 px-4">Acção</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Descrição Detalhada da Operação</th>
                  <th className="py-3 px-4 text-center">Estado & Reversão</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(op => {
                  const isReverted = !!op.revertidoEm;

                  // Badge for type
                  let badgeType = { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Operação' };
                  if (op.tipoAcao === 'criacao') badgeType = { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Adição / Criação' };
                  else if (op.tipoAcao === 'edicao') badgeType = { bg: 'bg-sky-100 text-sky-800 border-sky-200', label: 'Edição' };
                  else if (op.tipoAcao === 'status') badgeType = { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Estado CRM' };
                  else if (op.tipoAcao === 'exclusao') badgeType = { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Eliminação' };
                  else if (op.tipoAcao === 'configuracao') badgeType = { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Configuração' };

                  // Entity badge
                  let entityLabel = op.entidade.toUpperCase();
                  if (op.entidade === 'deal') entityLabel = '📄 Proposta';
                  else if (op.entidade === 'cliente') entityLabel = '👥 Cliente';
                  else if (op.entidade === 'visita') entityLabel = '📍 Visita';
                  else if (op.entidade === 'utilizador') entityLabel = '🛡️ Utilizador';
                  else if (op.entidade === 'arquivo') entityLabel = '📎 Documento';

                  return (
                    <tr
                      key={op.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isReverted ? 'bg-gray-50/80 opacity-75' : ''
                      }`}
                    >
                      {/* Horario */}
                      <td className="py-3 px-4 font-mono font-semibold text-gray-600 whitespace-nowrap">
                        {formatDateDisplay(op.dataHora)}
                      </td>

                      {/* Comercial */}
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          <span>{op.usuarioNome}</span>
                          <span className="text-[9px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {op.usuarioPerfil || 'comercial'}
                          </span>
                        </div>
                      </td>

                      {/* Acçao */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${badgeType.bg}`}>
                          {badgeType.label}
                        </span>
                      </td>

                      {/* Entidade */}
                      <td className="py-3 px-4 font-bold text-gray-700 whitespace-nowrap">
                        {entityLabel}
                      </td>

                      {/* Descricao */}
                      <td className="py-3 px-4 font-medium text-gray-800 max-w-md">
                        <div className="line-clamp-2" title={op.descricao}>
                          {op.descricao}
                        </div>
                      </td>

                      {/* Estado / Revertido */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isReverted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <RotateCcw size={11} /> Anulado por {op.revertidoPor || 'Admin'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Concluído
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(op.dadosAnteriores || op.dadosNovos) && (
                            <button
                              onClick={() => setSelectedOpDetails(op)}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition border border-blue-200 cursor-pointer"
                              title="Ver detalhes de dados (Antes / Depois)"
                            >
                              <Eye size={13} />
                            </button>
                          )}

                          {!isReverted && op.podeReverter !== false && (
                            confirmRevertId === op.id ? (
                              <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-300">
                                <span className="text-[10px] font-bold text-amber-900">Anular?</span>
                                <button
                                  onClick={() => {
                                    onRevertOperation(op);
                                    setConfirmRevertId(null);
                                  }}
                                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setConfirmRevertId(null)}
                                  className="px-1.5 py-0.5 text-gray-600 text-[10px] hover:underline cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRevertId(op.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                title="Anular/Reverter esta operação no CRM"
                              >
                                <RotateCcw size={12} /> Anular
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Detalhes de Dados (Diff Before/After) */}
      {selectedOpDetails && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-[#003366] uppercase tracking-wide flex items-center gap-2">
                <Eye size={18} className="text-blue-600" /> Detalhes de Auditoria da Operação
              </h3>
              <button
                onClick={() => setSelectedOpDetails(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p><strong>Descrição:</strong> {selectedOpDetails.descricao}</p>
                <p><strong>Comercial:</strong> {selectedOpDetails.usuarioNome} ({selectedOpDetails.usuarioPerfil})</p>
                <p><strong>Data & Hora:</strong> {selectedOpDetails.dataHora}</p>
              </div>

              {selectedOpDetails.dadosAnteriores && (
                <div className="space-y-1">
                  <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px]">Dados Anteriores:</span>
                  <pre className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-[11px] font-mono overflow-x-auto text-rose-950">
                    {JSON.stringify(selectedOpDetails.dadosAnteriores, null, 2)}
                  </pre>
                </div>
              )}

              {selectedOpDetails.dadosNovos && (
                <div className="space-y-1">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">Dados Novos / Atualizados:</span>
                  <pre className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-950">
                    {JSON.stringify(selectedOpDetails.dadosNovos, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOpDetails(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
