import React, { useState, useMemo, useEffect } from 'react';
import { Deal, Usuario, isUserManager } from '../types';
import { 
  Search, Plus, Filter, Database, FileSpreadsheet, TrendingUp, CheckCircle, 
  XCircle, Clock, Sparkles, Edit3, Trash2, Save, X, Lock, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { baseDuasSemanasData, BasePropostaRow } from '../data/baseDuasSemanasData';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface BaseDuasSemanasViewProps {
  deals?: Deal[];
  onAddDeal?: (deal: Partial<Deal>) => void;
  loggedUser?: Usuario | null;
  comerciais?: Usuario[];
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
  onLogOperation?: (
    tipoAcao: 'criacao' | 'edicao' | 'exclusao' | 'status' | 'configuracao' | 'reversao' | 'importacao',
    entidade: 'deal' | 'cliente' | 'visita' | 'utilizador' | 'arquivo' | 'relatorio' | 'meta' | 'configuracao',
    entidadeId: string,
    descricao: string,
    dadosAnteriores?: any,
    dadosNovos?: any
  ) => void;
}

export default function BaseDuasSemanasView({
  deals = [],
  onAddDeal,
  loggedUser,
  comerciais = [],
  refDate,
  onRefDateChange,
  selectedPeriod,
  onPeriodTypeChange,
  selectedComercial,
  onComercialChange,
  selectedEmpresa,
  onEmpresaChange,
  selectedProvincia,
  onProvinciaChange,
  onLogOperation
}: BaseDuasSemanasViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [semanaFilter, setSemanaFilter] = useState<string>('Todas');
  const [comercialFilter, setComercialFilter] = useState<string>('Todos');
  const [estadoFilter, setEstadoFilter] = useState<string>('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check if current user is Admin (Admin, Admin1, Admin2)
  const isAdmin = isUserManager(loggedUser);

  // Helper to check if current loggedUser can edit or delete a proposal row
  const canModifyRow = (row: BasePropostaRow) => {
    if (isAdmin) return true;
    if (!loggedUser || !loggedUser.nome) return false;

    const userNome = String(loggedUser.nome || '').toLowerCase().trim();
    const gestor = String(row?.gestorComercial || '').toLowerCase().trim();

    return gestor === userNome || gestor.includes(userNome) || userNome.includes(gestor);
  };

  // Edit Row state
  const [editingRow, setEditingRow] = useState<BasePropostaRow | null>(null);

  // Base state initialized safely from localStorage merged with static baseDuasSemanasData
  const [localPropostas, setLocalPropostas] = useState<BasePropostaRow[]>(() => {
    let merged = Array.isArray(baseDuasSemanasData) ? [...baseDuasSemanasData] : [];
    try {
      const saved = localStorage.getItem('gpa_base_duas_semanas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(p => {
            if (!p || typeof p !== 'object') return;
            const exists = merged.some(sb => 
              sb && String(sb.cliente || '') === String(p.cliente || '') &&
              String(sb.servico || '') === String(p.servico || '') &&
              String(sb.semana || '') === String(p.semana || '')
            );
            if (!exists) merged.push(p);
          });
        }
      }
    } catch (err) {
      console.error('Erro ao carregar gpa_base_duas_semanas:', err);
    }
    return merged;
  });

  // Save to localStorage whenever localPropostas changes & listen for external import updates
  useEffect(() => {
    try {
      if (Array.isArray(localPropostas)) {
        localStorage.setItem('gpa_base_duas_semanas', JSON.stringify(localPropostas));
      }
    } catch (err) {
      console.error('Erro ao gravar gpa_base_duas_semanas:', err);
    }
  }, [localPropostas]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('gpa_base_duas_semanas');
        let merged = Array.isArray(baseDuasSemanasData) ? [...baseDuasSemanasData] : [];
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach(p => {
              if (!p || typeof p !== 'object') return;
              const exists = merged.some(sb => 
                sb && String(sb.cliente || '') === String(p.cliente || '') &&
                String(sb.servico || '') === String(p.servico || '') &&
                String(sb.semana || '') === String(p.semana || '')
              );
              if (!exists) merged.push(p);
            });
            setLocalPropostas(merged);
          }
        }
      } catch (err) {
        console.error('Erro ao sincronizar gpa_base_duas_semanas:', err);
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Modal form state
  const [newSemana, setNewSemana] = useState('27–31 Jul');
  const [newCliente, setNewCliente] = useState('');
  const [newServico, setNewServico] = useState('');
  const [newValor, setNewValor] = useState('');
  const [newComercial, setNewComercial] = useState('Luísa Baltazar');
  const [newEstado, setNewEstado] = useState('Proposta enviada');
  const [newPrioridade, setNewPrioridade] = useState('Alta');
  const [newProximaAccao, setNewProximaAccao] = useState('');
  const [newObservacoes, setNewObservacoes] = useState('');

  // Helper to normalize week names
  const normalizeSemana = (sem?: string | number, dataStr?: string | number): string => {
    const semStr = String(sem || '');
    if (semStr.includes('06') || semStr.includes('Anterior') || semStr === 'Semana 1') return '06–10 Jul';
    if (semStr.includes('13') || semStr.includes('Finda') || semStr === 'Semana 2') return '13–17 Jul';
    if (semStr.includes('20') || semStr.includes('21') || semStr === 'Semana 3') return '20–25 Jul';
    if (semStr.includes('27') || semStr.includes('30') || semStr.includes('31') || semStr === 'Semana 4' || semStr === 'Semana Atual') return '27–31 Jul';

    if (dataStr) {
      const dStr = String(dataStr);
      if (dStr.includes('/07/') || dStr.includes('-07-')) {
        const dayMatch = dStr.match(/(\d{1,2})[\/\-]/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1], 10);
          if (day <= 11) return '06–10 Jul';
          if (day <= 18) return '13–17 Jul';
          if (day <= 26) return '20–25 Jul';
          return '27–31 Jul';
        }
      }
    }
    return '27–31 Jul';
  };

  // Combine static proposals with dynamic deals from CRM Pipeline with FULL NULL SAFETY
  const combinedPropostas = useMemo(() => {
    const rawList = Array.isArray(localPropostas) && localPropostas.length > 0
      ? localPropostas
      : (Array.isArray(baseDuasSemanasData) ? baseDuasSemanasData : []);

    const list: BasePropostaRow[] = rawList
      .filter((p): p is BasePropostaRow => !!p && typeof p === 'object')
      .map((p, idx) => ({
        ...p,
        id: typeof p.id === 'number' ? p.id : idx + 1,
        semana: String(p.semana || '27–31 Jul'),
        cliente: String(p.cliente || 'Sem Nome'),
        servico: String(p.servico || 'Serviços Diversos'),
        estadoProposta: String(p.estadoProposta || 'Proposta enviada'),
        valorProposta: String(p.valorProposta || '0,00 AOA'),
        valorAprovado: String(p.valorAprovado || '0,00 AOA'),
        valorPerdido: String(p.valorPerdido || '0,00 AOA'),
        probabilidade: String(p.probabilidade || '50%'),
        gestorComercial: String(p.gestorComercial || 'Comercial'),
        proximaAccao: String(p.proximaAccao || 'Acompanhar evolução'),
        proximoContacto: String(p.proximoContacto || '28/07/2026'),
        observacoes: String(p.observacoes || ''),
        diasEmAberto: typeof p.diasEmAberto === 'number' ? p.diasEmAberto : 1,
        valorPonderado: String(p.valorPonderado || '0,00 AOA'),
        classeCliente: String(p.classeCliente || 'A'),
        prioridade: String(p.prioridade || 'Normal'),
        estadoCRM: String(p.estadoCRM || 'Aberto'),
        metaSemanal: String(p.metaSemanal || '6 250 000,00 AOA'),
        pctMeta: String(p.pctMeta || '0%'),
        semanaDisplay: normalizeSemana(p.semana || '', p.dataEnvio)
      }));

    // Convert active deals into proposal rows if not duplicate
    if (Array.isArray(deals)) {
      deals.forEach((d, dIdx) => {
        if (!d || typeof d !== 'object') return;
        const dCliente = String(d.clienteNome || d.titulo || '').trim();
        const dComercial = String(d.comercialNome || '').trim();
        if (!dCliente) return;

        const exists = list.some(p => 
          String(p.cliente || '').toLowerCase().trim() === dCliente.toLowerCase() && 
          String(p.gestorComercial || '').toLowerCase().trim() === dComercial.toLowerCase()
        );

        if (!exists) {
          const valNum = typeof d.valor === 'number' ? d.valor : 0;
          const valStr = `${valNum.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA`;
          const sem = normalizeSemana(d.semana || '', d.dataEnvio);

          list.push({
            semana: sem,
            semanaDisplay: sem,
            id: list.length + 100 + dIdx,
            dataEnvio: String(d.dataEnvio || '27/07/2026'),
            cliente: dCliente,
            servico: String(d.titulo || 'Fornecimento de Serviços Diversos'),
            estadoProposta: (d.etapa === 'fechado' || d.etapa === 'producao') ? 'Proposta aprovada' : d.etapa === 'perdido' ? 'Perdida' : d.etapa === 'negociacao' ? 'Proposta em negociação' : 'Proposta enviada',
            valorProposta: valStr,
            valorAprovado: (d.etapa === 'fechado' || d.etapa === 'producao') ? valStr : '0,00 AOA',
            valorPerdido: d.etapa === 'perdido' ? valStr : '0,00 AOA',
            probabilidade: (d.etapa === 'fechado' || d.etapa === 'producao') ? '100%' : '60%',
            gestorComercial: dComercial || 'Comercial',
            proximaAccao: String(d.proximaAcao || 'Acompanhar evolução no CRM'),
            proximoContacto: String(d.proximoContacto || '28/07/2026'),
            observacoes: String(d.observacoes || 'Sincronizado do CRM Pipeline'),
            diasEmAberto: typeof d.diasAberto === 'number' ? d.diasAberto : 1,
            valorPonderado: `${(valNum * 0.6).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA`,
            classeCliente: 'A',
            prioridade: String(d.prioridade || 'Normal'),
            estadoCRM: (d.etapa === 'fechado' || d.etapa === 'producao') ? 'Fechado ganho' : d.etapa === 'perdido' ? 'Fechado perdido' : 'Aberto',
            metaSemanal: '6 250 000,00 AOA',
            pctMeta: '0%'
          });
        }
      });
    }

    return list;
  }, [localPropostas, deals]);

  const handleCreateProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliente.trim() || !newServico.trim()) return;

    const todayStr = new Date().toLocaleDateString('pt-PT');
    const numericVal = parseFloat(newValor.replace(/\s+/g, '').replace(',', '.')) || 0;
    const formattedVal = numericVal.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' AOA';

    const newItem: BasePropostaRow = {
      semana: newSemana,
      id: localPropostas.length + 1,
      dataEnvio: todayStr,
      cliente: newCliente.toUpperCase(),
      servico: newServico,
      estadoProposta: newEstado,
      valorProposta: formattedVal,
      valorAprovado: newEstado === 'Proposta aprovada' ? formattedVal : '0,00 AOA',
      valorPerdido: newEstado === 'Perdida' ? formattedVal : '0,00 AOA',
      probabilidade: newEstado === 'Proposta aprovada' ? '100%' : '50%',
      gestorComercial: newComercial,
      proximaAccao: newProximaAccao || 'Acompanhar proposta com o cliente',
      proximoContacto: '28/07/2026',
      observacoes: newObservacoes || 'Proposta registada na base semanal',
      diasEmAberto: 1,
      valorPonderado: (numericVal * 0.5).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' AOA',
      classeCliente: 'A',
      prioridade: newPrioridade,
      estadoCRM: newEstado === 'Proposta aprovada' ? 'Fechado ganho' : newEstado === 'Perdida' ? 'Fechado perdido' : 'Aberto',
      metaSemanal: '6 250 000,00 AOA',
      pctMeta: '0%'
    };

    setLocalPropostas([newItem, ...localPropostas]);

    if (onLogOperation) {
      onLogOperation(
        'criacao',
        'deal',
        `base_${newItem.id}`,
        `Criação da proposta "${newServico}" para ${newCliente.toUpperCase()} (${formattedVal}) por ${newComercial}`,
        null,
        newItem
      );
    }

    // Also push to CRM Pipeline via onAddDeal if callback supplied
    if (onAddDeal) {
      onAddDeal({
        clienteNome: newCliente.toUpperCase(),
        titulo: newServico,
        valor: numericVal,
        etapa: newEstado === 'Proposta aprovada' ? 'fechado' : newEstado === 'Perdida' ? 'perdido' : newEstado === 'Proposta em negociação' ? 'negociacao' : 'proposta',
        comercialNome: newComercial,
        prioridade: newPrioridade as any,
        proximaAcao: newProximaAccao || 'Acompanhar proposta com o cliente',
        observacoes: newObservacoes || 'Registado através da Base Semanal de Propostas',
        semana: newSemana,
        dataEnvio: todayStr
      });
    }

    setIsAddModalOpen(false);

    // Reset Form
    setNewCliente('');
    setNewServico('');
    setNewValor('');
    setNewProximaAccao('');
    setNewObservacoes('');
  };

  const handleDeleteProposta = (id: number) => {
    const target = localPropostas.find(p => p.id === id);
    if (target && !canModifyRow(target)) {
      alert(`Atenção: Apenas o gestor comercial responsável (${target.gestorComercial}) ou um Administrador pode eliminar esta proposta.`);
      return;
    }
    if (window.confirm('Tem a certeza que deseja eliminar esta proposta da Base de Dados?')) {
      setLocalPropostas(prev => prev.filter(p => p.id !== id));
      if (onLogOperation && target) {
        onLogOperation(
          'exclusao',
          'deal',
          `base_${target.id}`,
          `Eliminação da proposta #${target.id} (${target.cliente} - ${target.servico}) da Base de Duas Semanas por ${loggedUser?.nome || target.gestorComercial}`,
          target,
          null
        );
      }
    }
  };

  const handleUpdateProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    if (!canModifyRow(editingRow)) {
      alert(`Atenção: Apenas o gestor comercial responsável (${editingRow.gestorComercial}) ou um Administrador pode editar esta proposta.`);
      return;
    }

    const numericVal = parseFloat((editingRow.valorProposta || '').replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    const formattedVal = numericVal.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' AOA';

    const updatedRow: BasePropostaRow = {
      ...editingRow,
      valorProposta: formattedVal,
      valorAprovado: editingRow.estadoProposta === 'Proposta aprovada' ? formattedVal : '0,00 AOA',
      valorPerdido: editingRow.estadoProposta === 'Perdida' ? formattedVal : '0,00 AOA',
      probabilidade: editingRow.estadoProposta === 'Proposta aprovada' ? '100%' : editingRow.estadoProposta === 'Perdida' ? '0%' : '50%',
      valorPonderado: (numericVal * (editingRow.estadoProposta === 'Proposta aprovada' ? 1 : 0.5)).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' AOA',
      estadoCRM: editingRow.estadoProposta === 'Proposta aprovada' ? 'Fechado ganho' : editingRow.estadoProposta === 'Perdida' ? 'Fechado perdido' : 'Aberto'
    };

    setLocalPropostas(prev => prev.map(p => p.id === editingRow.id ? updatedRow : p));

    if (onLogOperation) {
      onLogOperation(
        'edicao',
        'deal',
        `base_${editingRow.id}`,
        `Atualização da proposta #${editingRow.id} (${editingRow.cliente} - ${editingRow.servico}) na Base de Duas Semanas por ${loggedUser?.nome || editingRow.gestorComercial}`,
        editingRow,
        updatedRow
      );
    }

    setEditingRow(null);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar a Base de Duas Semanas para os dados originais completos?')) {
      setLocalPropostas(baseDuasSemanasData);
      try {
        localStorage.setItem('gpa_base_duas_semanas', JSON.stringify(baseDuasSemanasData));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Safe filter list
  const filteredPropostas = useMemo(() => {
    return combinedPropostas.filter(p => {
      if (!p) return false;
      const pSemana = p.semanaDisplay || normalizeSemana(p.semana || '', p.dataEnvio);
      const matchesSemana = semanaFilter === 'Todas' || pSemana === semanaFilter;
      const matchesComercial = comercialFilter === 'Todos' || (p.gestorComercial || '') === comercialFilter;
      const matchesEstado = estadoFilter === 'Todos' || (p.estadoProposta || '') === estadoFilter;
      
      const term = (searchTerm || '').toLowerCase().trim();
      if (!term) return matchesSemana && matchesComercial && matchesEstado;

      const matchesSearch =
        String(p.cliente || '').toLowerCase().includes(term) ||
        String(p.gestorComercial || '').toLowerCase().includes(term) ||
        String(p.servico || '').toLowerCase().includes(term) ||
        String(p.estadoProposta || '').toLowerCase().includes(term) ||
        String(p.observacoes || '').toLowerCase().includes(term);

      return matchesSemana && matchesComercial && matchesEstado && matchesSearch;
    });
  }, [combinedPropostas, semanaFilter, comercialFilter, estadoFilter, searchTerm]);

  // Unique lists for dropdowns with safe defaults
  const gestoresUnicos = useMemo(() => {
    const set = new Set<string>();
    combinedPropostas.forEach(p => {
      if (p && p.gestorComercial) set.add(String(p.gestorComercial).trim());
    });
    return ['Todos', ...Array.from(set)];
  }, [combinedPropostas]);

  const estadosUnicos = useMemo(() => {
    const set = new Set<string>();
    combinedPropostas.forEach(p => {
      if (p && p.estadoProposta) set.add(String(p.estadoProposta).trim());
    });
    return ['Todos', ...Array.from(set)];
  }, [combinedPropostas]);

  const handleOpenAddModal = () => {
    if (loggedUser?.nome && !isAdmin) {
      setNewComercial(loggedUser.nome);
    }
    setIsAddModalOpen(true);
  };

  // Calculations
  const parseVal = (str?: string) => {
    if (!str) return 0;
    const clean = String(str).replace(/[^\d,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const totalPropostasCount = filteredPropostas.length;
  const totalValorProposto = filteredPropostas.reduce((sum, p) => sum + parseVal(p.valorProposta), 0);
  const totalValorAprovado = filteredPropostas.reduce((sum, p) => sum + parseVal(p.valorAprovado), 0);
  const totalValorPerdido = filteredPropostas.reduce((sum, p) => sum + parseVal(p.valorPerdido), 0);
  const totalValorPonderado = filteredPropostas.reduce((sum, p) => sum + parseVal(p.valorPonderado), 0);

  const fmtAOA = (num: number) => {
    return num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' AOA';
  };

  return (
    <div className="w-full space-y-4 font-sans text-gray-900 dark:text-slate-100 my-2">
      
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
          currentViewName="Base de Duas Semanas"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-wider uppercase">
              BASE HISTÓRICA E SEMANAL DE PROPOSTAS — JULHO DE 2026
            </h2>
            <p className="text-xs text-blue-200">
              Mapeamento de Propostas por Semana: 06–10 Jul | 13–17 Jul | 20–25 Jul | 27–31 Jul (Semana Atual)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            title="Restaurar dados originais da base em caso de emergência"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-2.5 py-1.5 rounded-sm text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Repor Dados
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Proposta na Base
          </button>
        </div>
      </div>

      {/* Access Permission Info Banner */}
      <div className={`p-2.5 rounded-sm text-xs font-semibold flex items-center gap-2 border ${
        isAdmin 
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60' 
          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800/60'
      }`}>
        <ShieldCheck size={16} className={isAdmin ? 'text-amber-600 dark:text-amber-400 shrink-0' : 'text-blue-600 dark:text-blue-400 shrink-0'} />
        <span>
          {isAdmin ? (
            <>👑 <strong>Modo Administrador ({loggedUser?.nome || 'Admin'}):</strong> Acesso total para criar, editar e eliminar qualquer registo na Base de Dados.</>
          ) : (
            <>🔒 <strong>Permissão Comercial ({loggedUser?.nome || 'Comercial'}):</strong> Pode adicionar propostas e gerir (editar/eliminar) <u>apenas os seus próprios dados</u>. Outros registos são apenas para consulta.</>
          )}
        </span>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-2.5 rounded-sm shadow-2xs">
          <div className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Registos
          </div>
          <div className="text-base font-black text-gray-900 dark:text-slate-100 mt-1">{totalPropostasCount} <span className="text-xs font-normal text-gray-500 dark:text-slate-400">propostas</span></div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-2.5 rounded-sm shadow-2xs">
          <div className="text-blue-800 dark:text-blue-300 text-[10px] uppercase font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Valor Total Proposto
          </div>
          <div className="text-sm font-black text-blue-900 dark:text-blue-200 mt-1 font-mono truncate">{fmtAOA(totalValorProposto)}</div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-2.5 rounded-sm shadow-2xs">
          <div className="text-emerald-800 dark:text-emerald-300 text-[10px] uppercase font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Total Aprovado
          </div>
          <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-1 font-mono truncate">{fmtAOA(totalValorAprovado)}</div>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-sm shadow-2xs">
          <div className="text-rose-800 dark:text-rose-300 text-[10px] uppercase font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Total Perdido
          </div>
          <div className="text-sm font-black text-rose-900 dark:text-rose-200 mt-1 font-mono truncate">{fmtAOA(totalValorPerdido)}</div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-sm shadow-2xs col-span-2 md:col-span-1">
          <div className="text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Valor Ponderado
          </div>
          <div className="text-sm font-black text-amber-900 dark:text-amber-200 mt-1 font-mono truncate">{fmtAOA(totalValorPonderado)}</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-3 rounded-sm shadow-xs space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Semana Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1B365D] dark:text-blue-400 shrink-0" />
            <span className="font-bold text-gray-700 dark:text-slate-300 uppercase">Semana de Julho:</span>
            <div className="inline-flex flex-wrap rounded-sm border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-0.5 gap-0.5">
              {[
                { id: 'Todas', label: 'Todas as Semanas' },
                { id: '06–10 Jul', label: '06–10 Jul (Sem. 1)' },
                { id: '13–17 Jul', label: '13–17 Jul (Sem. 2)' },
                { id: '20–25 Jul', label: '20–25 Jul (Sem. 3)' },
                { id: '27–31 Jul', label: '27–31 Jul (Sem. 4 - Atual)' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSemanaFilter(s.id)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-xs transition cursor-pointer ${
                    semanaFilter === s.id
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comercial Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 dark:text-slate-300 uppercase">Comercial:</span>
            <select
              value={comercialFilter}
              onChange={(e) => setComercialFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-sm py-1 px-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs focus:outline-hidden focus:border-[#1B365D]"
            >
              {gestoresUnicos.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Estado Proposta Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 dark:text-slate-300 uppercase">Estado:</span>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-sm py-1 px-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs focus:outline-hidden focus:border-[#1B365D]"
            >
              {estadosUnicos.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar cliente, serviço, observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
            />
          </div>

        </div>
      </div>

      {/* Main Excel-like Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-xs overflow-x-auto max-h-[70vh]">
        <table className="w-full text-[11px] text-left border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#1B365D] text-white border-b border-[#122442]">
              <th className="px-2.5 py-2 font-bold border-r border-[#2C4D75] whitespace-nowrap">Semana</th>
              <th className="px-2 py-2 font-bold border-r border-[#2C4D75] text-center w-8">ID</th>
              <th className="px-2.5 py-2 font-bold border-r border-[#2C4D75] text-center whitespace-nowrap">Data envio</th>
              <th className="px-3 py-2 font-bold border-r border-[#2C4D75] whitespace-nowrap min-w-[140px]">Cliente</th>
              <th className="px-3 py-2 font-bold border-r border-[#2C4D75] min-w-[200px]">Serviço / Descrição</th>
              <th className="px-2.5 py-2 font-bold border-r border-[#2C4D75] whitespace-nowrap">Estado Proposta</th>
              <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap">Valor Proposto</th>
              <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap text-emerald-300">Valor Aprovado</th>
              <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap text-rose-300">Valor Perdido</th>
              <th className="px-2 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Prob.</th>
              <th className="px-2.5 py-2 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap text-amber-300">Val. Ponderado</th>
              <th className="px-2.5 py-2 font-bold border-r border-[#2C4D75] whitespace-nowrap">Comercial</th>
              <th className="px-3 py-2 font-bold border-r border-[#2C4D75] min-w-[180px]">Próxima Acção</th>
              <th className="px-2.5 py-2 font-bold border-r border-[#2C4D75] text-center whitespace-nowrap">Próx. Contacto</th>
              <th className="px-3 py-2 font-bold border-r border-[#2C4D75] min-w-[200px]">Observações</th>
              <th className="px-2 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Dias</th>
              <th className="px-2 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Classe</th>
              <th className="px-2.5 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Prioridade</th>
              <th className="px-2.5 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Estado CRM</th>
              <th className="px-2.5 py-2 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap">Meta Semanal</th>
              <th className="px-2 py-2 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">% Meta</th>
              <th className="px-3 py-2 font-bold text-center whitespace-nowrap bg-amber-600 text-white min-w-[80px]">Ações (CRUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 font-sans text-gray-900 dark:text-slate-100">
            {filteredPropostas.length === 0 ? (
              <tr>
                <td colSpan={22} className="text-center py-10 text-gray-500 dark:text-slate-400 italic">
                  Nenhuma proposta encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredPropostas.map((row, idx) => {
                const semDisplay = row.semanaDisplay || normalizeSemana(row.semana, row.dataEnvio);
                return (
                  <tr key={`${semDisplay}-${row.id}-${idx}`} className="hover:bg-blue-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-2.5 py-1.5 font-medium border-r border-gray-200 dark:border-slate-800 whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                        semDisplay === '27–31 Jul' 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-800' 
                          : semDisplay === '20–25 Jul'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                          : semDisplay === '13–17 Jul'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border border-gray-300 dark:border-slate-700'
                      }`}>
                        {semDisplay}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center font-mono font-bold border-r border-gray-200 dark:border-slate-800">
                      {row.id}
                    </td>
                    <td className="px-2.5 py-1.5 text-center border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono text-[10px]">
                      {row.dataEnvio}
                    </td>
                    <td className="px-3 py-1.5 font-bold border-r border-gray-200 dark:border-slate-800 whitespace-nowrap">
                      {row.cliente}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-slate-800 font-medium">
                      {row.servico}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-gray-200 dark:border-slate-800 whitespace-nowrap">
                      <span className={`font-semibold ${
                        row.estadoProposta === 'Proposta aprovada' ? 'text-emerald-700 dark:text-emerald-400' :
                        row.estadoProposta === 'Perdida' ? 'text-rose-700 dark:text-rose-400' :
                        row.estadoProposta === 'Proposta em negociação' ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
                      }`}>
                        {row.estadoProposta}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono">
                      {row.valorProposta}
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-emerald-800 dark:text-emerald-300 border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono bg-emerald-50/30 dark:bg-emerald-950/20">
                      {row.valorAprovado}
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-rose-800 dark:text-rose-300 border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono bg-rose-50/30 dark:bg-rose-950/20">
                      {row.valorPerdido}
                    </td>
                    <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-slate-800 font-mono font-bold">
                      {row.probabilidade}
                    </td>
                    <td className="px-2.5 py-1.5 text-right border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono bg-amber-50/30 dark:bg-amber-950/20 font-semibold">
                      {row.valorPonderado}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-medium">
                      {row.gestorComercial}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-slate-800 text-[10px]">
                      {row.proximaAccao}
                    </td>
                    <td className="px-2.5 py-1.5 text-center border-r border-gray-200 dark:border-slate-800 whitespace-nowrap font-mono text-[10px]">
                      {row.proximoContacto}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-slate-800 text-[10px]">
                      {row.observacoes}
                    </td>
                    <td className="px-2 py-1.5 text-center font-mono border-r border-gray-200 dark:border-slate-800">
                      {row.diasEmAberto}
                    </td>
                    <td className="px-2 py-1.5 text-center font-bold border-r border-gray-200 dark:border-slate-800">
                      {row.classeCliente}
                    </td>
                    <td className="px-2.5 py-1.5 text-center border-r border-gray-200 dark:border-slate-800 whitespace-nowrap">
                      <span className={`font-bold ${
                        row.prioridade === 'Alta' ? 'text-rose-600 dark:text-rose-400' :
                        row.prioridade === 'Média' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-slate-400'
                      }`}>
                        {row.prioridade}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-medium border-r border-gray-200 dark:border-slate-800 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                        row.estadoCRM === 'Fechado ganho' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800' :
                        row.estadoCRM === 'Fechado perdido' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800' :
                        'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {row.estadoCRM}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5 text-right border-r border-gray-200 dark:border-slate-800 font-mono text-[10px]">
                      {row.metaSemanal}
                    </td>
                    <td className="px-2 py-1.5 text-center font-bold font-mono text-[10px] border-r border-gray-200 dark:border-slate-800">
                      {row.pctMeta}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canModifyRow(row) ? (
                          <>
                            <button
                              onClick={() => setEditingRow(row)}
                              className="p-1 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xs border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                              title="Editar Proposta na Base"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProposta(row.id)}
                              className="p-1 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xs border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                              title="Eliminar Proposta da Base"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span 
                            className="p-1 text-gray-400 cursor-not-allowed flex items-center justify-center"
                            title={`Apenas o autor (${row.gestorComercial}) ou Administrador pode editar/eliminar esta proposta`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Editar Proposta */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-md shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1B365D] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                <Edit3 className="text-amber-400" size={16} /> Editar Proposta #{editingRow.id}
              </h3>
              <button 
                onClick={() => setEditingRow(null)}
                className="text-gray-300 hover:text-white font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateProposta} className="p-4 space-y-3 text-xs text-gray-900 dark:text-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Semana *</label>
                  <select 
                    value={editingRow.semana}
                    onChange={e => setEditingRow({ ...editingRow, semana: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="27–31 Jul">27–31 Jul (Semana 4 - Atual)</option>
                    <option value="20–25 Jul">20–25 Jul (Semana 3 - Finda)</option>
                    <option value="13–17 Jul">13–17 Jul (Semana 2)</option>
                    <option value="06–10 Jul">06–10 Jul (Semana 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Comercial Responsável *</label>
                  <input 
                    type="text"
                    required
                    value={editingRow.gestorComercial}
                    onChange={e => setEditingRow({ ...editingRow, gestorComercial: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Nome do Cliente *</label>
                <input 
                  type="text"
                  required
                  value={editingRow.cliente}
                  onChange={e => setEditingRow({ ...editingRow, cliente: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Serviço / Descrição *</label>
                <input 
                  type="text"
                  required
                  value={editingRow.servico}
                  onChange={e => setEditingRow({ ...editingRow, servico: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Valor Proposto (AOA) *</label>
                  <input 
                    type="text"
                    required
                    value={editingRow.valorProposta}
                    onChange={e => setEditingRow({ ...editingRow, valorProposta: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Estado da Proposta</label>
                  <select 
                    value={editingRow.estadoProposta}
                    onChange={e => setEditingRow({ ...editingRow, estadoProposta: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Proposta em negociação">Proposta em negociação</option>
                    <option value="Proposta aprovada">Proposta aprovada</option>
                    <option value="Perdida">Perdida</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nível de Prioridade</label>
                  <select 
                    value={editingRow.prioridade || 'Normal'}
                    onChange={e => setEditingRow({ ...editingRow, prioridade: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="Alta">🔴 Alta</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Normal">🟢 Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Próxima Acção</label>
                  <input 
                    type="text"
                    value={editingRow.proximaAccao || ''}
                    onChange={e => setEditingRow({ ...editingRow, proximaAccao: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Observações</label>
                <textarea 
                  rows={2}
                  value={editingRow.observacoes || ''}
                  onChange={e => setEditingRow({ ...editingRow, observacoes: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#1B365D] hover:bg-[#122442] text-white rounded-sm font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} /> Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Proposta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-md shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1B365D] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                <Sparkles className="text-amber-400" size={16} /> Adicionar Proposta na Base & CRM
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProposta} className="p-4 space-y-3 text-xs text-gray-900 dark:text-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Semana de Registo *</label>
                  <select 
                    value={newSemana}
                    onChange={e => setNewSemana(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="27–31 Jul">27–31 Jul (Semana 4 - Atual)</option>
                    <option value="20–25 Jul">20–25 Jul (Semana 3 - Finda)</option>
                    <option value="13–17 Jul">13–17 Jul (Semana 2)</option>
                    <option value="06–10 Jul">06–10 Jul (Semana 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Comercial Responsável *</label>
                  <select 
                    value={newComercial}
                    onChange={e => setNewComercial(e.target.value)}
                    disabled={!isAdmin && !!loggedUser?.nome}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D] disabled:opacity-80 disabled:cursor-not-allowed font-medium"
                  >
                    {comerciais && comerciais.length > 0 ? (
                      comerciais.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))
                    ) : (
                      <>
                        <option value="Luísa Baltazar">Luísa Baltazar</option>
                        <option value="Amélia Cassinda">Amélia Cassinda</option>
                        <option value="Marta de Oliveira">Marta de Oliveira</option>
                        <option value="Ilídio Pedro">Ilídio Pedro</option>
                        <option value="Suzete Francisco">Suzete Francisco</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Nome do Cliente *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: SONANGOL, UNITEL, ZAP..."
                  value={newCliente}
                  onChange={e => setNewCliente(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Serviço / Descrição *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Fornecimento de Brindes e Merchandising"
                  value={newServico}
                  onChange={e => setNewServico(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Valor Proposto (AOA) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: 15 000 000,00"
                    value={newValor}
                    onChange={e => setNewValor(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Estado da Proposta</label>
                  <select 
                    value={newEstado}
                    onChange={e => setNewEstado(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Proposta em negociação">Proposta em negociação</option>
                    <option value="Proposta aprovada">Proposta aprovada</option>
                    <option value="Perdida">Perdida</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nível de Prioridade</label>
                  <select 
                    value={newPrioridade}
                    onChange={e => setNewPrioridade(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  >
                    <option value="Alta">🔴 Alta</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Normal">🟢 Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Próxima Acção</label>
                  <input 
                    type="text"
                    placeholder="Ex: Agendar reunião de fecho com o cliente"
                    value={newProximaAccao}
                    onChange={e => setNewProximaAccao(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Observações</label>
                <textarea 
                  rows={2}
                  placeholder="Informações adicionais sobre o negócio..."
                  value={newObservacoes}
                  onChange={e => setNewObservacoes(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-hidden focus:border-[#1B365D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#1B365D] hover:bg-[#122442] text-white rounded-sm font-bold shadow-xs cursor-pointer"
                >
                  Registar Proposta e Sincronizar CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
