import React, { useState, useEffect } from 'react';
import { Deal, Usuario } from '../types';
import { Search, Filter, Plus, CheckCircle2, Clock, AlertCircle, Sparkles, UserCheck, X, MessageSquare, ShieldAlert, Edit, Trash2 } from 'lucide-react';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface RecomendacoesViewProps {
  deals?: Deal[];
  comerciais?: Usuario[];
  loggedUser?: Usuario | null;
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
}

export interface RecomendacaoRow {
  id?: string;
  cliente: string;
  comercial: string;
  estado: string;
  valor: string;
  prioridade: 'Alta' | 'Média' | 'Normal' | 'Baixa';
  diasAberto: number;
  recomendacao: string;
  prazo: string;
  resultado: string;
  acompanhamento: 'Pendente' | 'Em curso' | 'Concluído';
  obs?: string;
  origem?: 'Oficial' | 'CRM Pipeline' | 'Directiva de Gestão';
}

export default function RecomendacoesView({
  deals = [],
  comerciais = [],
  loggedUser,
  refDate,
  onRefDateChange,
  selectedPeriod,
  onPeriodTypeChange,
  selectedComercial: propSelectedComercial,
  onComercialChange,
  selectedEmpresa,
  onEmpresaChange,
  selectedProvincia,
  onProvinciaChange
}: RecomendacoesViewProps) {
  const isAdmin = loggedUser?.perfil === 'admin' || loggedUser?.perfil === 'supervisor' || loggedUser?.email === 'david.neto@gpaangola.co.ao';

  // Base dataset from Excel document
  const staticRecommendations: RecomendacaoRow[] = [
    {
      id: 'rec-1',
      cliente: 'UNITEL',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta enviada',
      valor: '96 124 800,00 AOA',
      prioridade: 'Alta',
      diasAberto: 6,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-2',
      cliente: 'FINSTAR/ZAP',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta aprovada',
      valor: '1 687 200,00 AOA',
      prioridade: 'Média',
      diasAberto: 4,
      recomendacao: 'Executar próxima acção e actualizar CRM',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-3',
      cliente: 'FINSTAR/ZAP',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta em negociação',
      valor: '21 161 250,00 AOA',
      prioridade: 'Alta',
      diasAberto: 5,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter PO, adjudicação ou data formal de decisão',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-4',
      cliente: 'CARPINANGOLA/CASAIS',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta aprovada',
      valor: '2 017 800,00 AOA',
      prioridade: 'Alta',
      diasAberto: 4,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-5',
      cliente: 'CEGID/PRIMAVERA',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta aprovada',
      valor: '445 700,00 AOA',
      prioridade: 'Alta',
      diasAberto: 2,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-6',
      cliente: 'FINSTAR/ZAP',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta enviada',
      valor: '1 966 500,00 AOA',
      prioridade: 'Normal',
      diasAberto: 2,
      recomendacao: 'Executar próxima acção e actualizar CRM',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-7',
      cliente: 'SIAC',
      comercial: 'Luísa Baltazar',
      estado: 'Proposta enviada',
      valor: '29 641 900,00 AOA',
      prioridade: 'Normal',
      diasAberto: 3,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-8',
      cliente: 'SBM OFFSHORE',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta aprovada',
      valor: '339 150,00 AOA',
      prioridade: 'Normal',
      diasAberto: 40,
      recomendacao: 'Reactivar processo e solicitar decisão formal',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-9',
      cliente: 'BCGA',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta aprovada',
      valor: '3 135 000,00 AOA',
      prioridade: 'Alta',
      diasAberto: 6,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-10',
      cliente: 'TREVOTECH',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta aprovada',
      valor: '889 200,00 AOA',
      prioridade: 'Normal',
      diasAberto: 6,
      recomendacao: 'Executar próxima acção e actualizar CRM',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-11',
      cliente: 'ANGOLACA',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta enviada',
      valor: '14 248 432,50 AOA',
      prioridade: 'Média',
      diasAberto: 2,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-12',
      cliente: 'DUBAI INVESTIMETS',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta enviada',
      valor: '29 724 360,00 AOA',
      prioridade: 'Média',
      diasAberto: 5,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-13',
      cliente: 'FADA',
      comercial: 'Amélia Cassinda',
      estado: 'Proposta enviada',
      valor: '3 583 000,00 AOA',
      prioridade: 'Média',
      diasAberto: 2,
      recomendacao: 'Executar próxima acção e actualizar CRM',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-14',
      cliente: 'NOSSA SEGUROS',
      comercial: 'Marta de Oliveira',
      estado: 'Proposta aprovada',
      valor: '2 530 550,00 AOA',
      prioridade: 'Alta',
      diasAberto: 3,
      recomendacao: 'Contacto directo ao decisor e reunião de fecho',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    },
    {
      id: 'rec-15',
      cliente: 'PROGRAMA ALIMENTAR',
      comercial: 'Marta de Oliveira',
      estado: 'Proposta em negociação',
      valor: '7 060 875,00 AOA',
      prioridade: 'Normal',
      diasAberto: 2,
      recomendacao: 'Executar próxima acção e actualizar CRM',
      prazo: 'Até 5 dias úteis',
      resultado: 'Obter feedback e evolução do estado',
      acompanhamento: 'Pendente',
      obs: '',
      origem: 'Oficial'
    }
  ];

  // Custom Admin Recommendations loaded from LocalStorage
  const [customRecs, setCustomRecs] = useState<RecomendacaoRow[]>(() => {
    try {
      const saved = localStorage.getItem('gpa_custom_recommendations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track modified acompanhamento statuses
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'Pendente' | 'Em curso' | 'Concluído'>>(() => {
    try {
      const saved = localStorage.getItem('gpa_rec_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track deleted recommendation keys by Admin
  const [deletedRecKeys, setDeletedRecKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gpa_rec_deleted_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track full field edits by Admin
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<RecomendacaoRow>>>(() => {
    try {
      const saved = localStorage.getItem('gpa_rec_row_edits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gpa_custom_recommendations', JSON.stringify(customRecs));
    } catch (e) {
      console.error(e);
    }
  }, [customRecs]);

  useEffect(() => {
    try {
      localStorage.setItem('gpa_rec_statuses', JSON.stringify(statusOverrides));
    } catch (e) {
      console.error(e);
    }
  }, [statusOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem('gpa_rec_deleted_keys', JSON.stringify(deletedRecKeys));
    } catch (e) {
      console.error(e);
    }
  }, [deletedRecKeys]);

  useEffect(() => {
    try {
      localStorage.setItem('gpa_rec_row_edits', JSON.stringify(rowEdits));
    } catch (e) {
      console.error(e);
    }
  }, [rowEdits]);

  // Filters
  const [selectedComercial, setSelectedComercial] = useState<string>('Todos');
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('Todas');
  const [selectedAcompanhamento, setSelectedAcompanhamento] = useState<string>('Todos');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modal State for Admin adding custom recommendations
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRec, setNewRec] = useState({
    cliente: '',
    comercial: comerciais.find(u => u.perfil === 'comercial')?.nome || 'Luísa Baltazar',
    estado: 'Proposta enviada',
    valor: '',
    prioridade: 'Alta' as 'Alta' | 'Média' | 'Normal' | 'Baixa',
    diasAberto: 1,
    recomendacao: '',
    prazo: '48 horas',
    resultado: 'Obter feedback e evolução do estado',
    obs: ''
  });

  // Edit Modal State for Admin
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<RecomendacaoRow | null>(null);

  // Automatically derive recommendations from CRM Deals in pipeline
  const pipelineRecommendations: RecomendacaoRow[] = deals
    .filter(d => d.etapa !== 'fechado' && d.etapa !== 'perdido')
    .map(d => {
      let smartRec = d.proximaAcao || 'Acompanhar proposta com o cliente';
      let smartPrazo = '48 horas';
      let smartPrioridade: 'Alta' | 'Média' | 'Normal' | 'Baixa' = d.prioridade || 'Normal';

      if (d.valor > 20000000) {
        smartPrioridade = 'Alta';
        smartRec = d.proximaAcao || 'Contacto directo ao decisor e agendar reunião de fecho urgente';
      } else if (d.etapa === 'negociacao') {
        smartPrioridade = 'Alta';
        smartRec = d.proximaAcao || 'Finalizar negociação e obter adjudicação/PO';
        smartPrazo = '24 horas';
      }

      return {
        id: `deal-${d.id}`,
        cliente: d.clienteNome || d.titulo,
        comercial: d.comercialNome || 'Comercial',
        estado: d.etapa === 'proposta' ? 'Proposta enviada' : d.etapa === 'negociacao' ? 'Proposta em negociação' : `Etapa: ${d.etapa}`,
        valor: `${new Intl.NumberFormat('pt-AO').format(d.valor || 0)} AOA`,
        prioridade: smartPrioridade,
        diasAberto: d.diasAberto || 1,
        recomendacao: smartRec,
        prazo: smartPrazo,
        resultado: 'Avançar negociação para fecho',
        acompanhamento: 'Pendente',
        obs: d.observacoes || '',
        origem: 'CRM Pipeline'
      };
    });

  // Combined Dataset (avoid duplicates by client+comercial if deal already in static)
  const allRecommendations = [...customRecs, ...staticRecommendations];
  pipelineRecommendations.forEach(pRec => {
    const exists = allRecommendations.some(r => r.cliente.toLowerCase() === pRec.cliente.toLowerCase() && r.comercial.toLowerCase() === pRec.comercial.toLowerCase());
    if (!exists) {
      allRecommendations.push(pRec);
    }
  });

  // Apply Overrides and Filter Out Deleted Keys
  const processedRecommendations = allRecommendations
    .map((r, index) => {
      const key = r.id || `${r.cliente}-${r.comercial}-${index}`;
      const edit = rowEdits[key] || {};
      return {
        ...r,
        ...edit,
        idKey: key,
        acompanhamento: statusOverrides[key] || edit.acompanhamento || r.acompanhamento
      };
    })
    .filter(row => !deletedRecKeys.includes(row.idKey));

  // Filtered List
  const filteredList = processedRecommendations.filter(r => {
    if (selectedComercial !== 'Todos' && r.comercial.toLowerCase() !== selectedComercial.toLowerCase()) return false;
    if (selectedPrioridade !== 'Todas' && r.prioridade !== selectedPrioridade) return false;
    if (selectedAcompanhamento !== 'Todos' && r.acompanhamento !== selectedAcompanhamento) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchClient = r.cliente.toLowerCase().includes(q);
      const matchCom = r.comercial.toLowerCase().includes(q);
      const matchRec = r.recomendacao.toLowerCase().includes(q);
      if (!matchClient && !matchCom && !matchRec) return false;
    }
    return true;
  });

  const handleToggleStatus = (key: string, current: 'Pendente' | 'Em curso' | 'Concluído') => {
    const next: 'Pendente' | 'Em curso' | 'Concluído' = 
      current === 'Pendente' ? 'Em curso' : current === 'Em curso' ? 'Concluído' : 'Pendente';
    setStatusOverrides(prev => ({
      ...prev,
      [key]: next
    }));
  };

  const handleDeleteRow = (key: string, cliente: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a recomendação de "${cliente}"?`)) {
      setDeletedRecKeys(prev => [...prev, key]);
      // Also remove from customRecs if present
      setCustomRecs(prev => prev.filter(item => item.id !== key));
    }
  };

  const handleOpenEditModal = (row: any) => {
    setEditingRowKey(row.idKey);
    setEditFormData({
      cliente: row.cliente,
      comercial: row.comercial,
      estado: row.estado,
      valor: row.valor,
      prioridade: row.prioridade,
      diasAberto: row.diasAberto,
      recomendacao: row.recomendacao,
      prazo: row.prazo,
      resultado: row.resultado,
      acompanhamento: row.acompanhamento,
      obs: row.obs || '',
      origem: row.origem || 'Directiva de Gestão'
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRowKey || !editFormData) return;

    setRowEdits(prev => ({
      ...prev,
      [editingRowKey]: editFormData
    }));

    setEditingRowKey(null);
    setEditFormData(null);
  };

  const handleAddCustomRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRec.cliente || !newRec.recomendacao) return;

    const formattedVal = newRec.valor ? `${new Intl.NumberFormat('pt-AO').format(parseFloat(newRec.valor) || 0)} AOA` : '0,00 AOA';

    const item: RecomendacaoRow = {
      id: `custom-${Date.now()}`,
      cliente: newRec.cliente.toUpperCase(),
      comercial: newRec.comercial,
      estado: newRec.estado,
      valor: formattedVal,
      prioridade: newRec.prioridade,
      diasAberto: newRec.diasAberto || 1,
      recomendacao: newRec.recomendacao,
      prazo: newRec.prazo,
      resultado: newRec.resultado,
      acompanhamento: 'Pendente',
      obs: newRec.obs,
      origem: 'Directiva de Gestão'
    };

    setCustomRecs(prev => [item, ...prev]);
    setIsAddModalOpen(false);
    setNewRec({
      cliente: '',
      comercial: comerciais.find(u => u.perfil === 'comercial')?.nome || 'Luísa Baltazar',
      estado: 'Proposta enviada',
      valor: '',
      prioridade: 'Alta',
      diasAberto: 1,
      recomendacao: '',
      prazo: '48 horas',
      resultado: 'Obter feedback e evolução do estado',
      obs: ''
    });
  };

  const getRowBgColor = (estado: string) => {
    if (estado.toLowerCase().includes('aprovad')) return 'bg-[#E6F4EA] hover:bg-[#D4EDDA]';
    if (estado.toLowerCase().includes('negocia')) return 'bg-[#FEF7E0] hover:bg-[#FFF3CD]';
    return 'bg-white hover:bg-gray-50';
  };

  const getAcompanhamentoBadge = (status: 'Pendente' | 'Em curso' | 'Concluído') => {
    switch (status) {
      case 'Concluído':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 size={12} /> Concluído</span>;
      case 'Em curso':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300"><Clock size={12} /> Em Curso</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300"><AlertCircle size={12} /> Pendente</span>;
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-slate-900 dark:text-slate-100 my-2">
      
      {/* GLOBAL PERIOD BAR SYNCHRONIZED ACROSS ALL 13 VIEWS */}
      {refDate && onRefDateChange && selectedPeriod && onPeriodTypeChange && (
        <GlobalPeriodBar
          refDate={refDate}
          onRefDateChange={onRefDateChange}
          periodType={selectedPeriod}
          onPeriodTypeChange={onPeriodTypeChange}
          comerciais={comerciais}
          selectedComercial={selectedComercial || propSelectedComercial || 'todos'}
          onComercialChange={onComercialChange || (() => {})}
          selectedEmpresa={selectedEmpresa || 'todas'}
          onEmpresaChange={onEmpresaChange || (() => {})}
          selectedProvincia={selectedProvincia || 'todas'}
          onProvinciaChange={onProvinciaChange || (() => {})}
          currentViewName="Recomendações CRM"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white text-center py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase">
            RECOMENDAÇÕES DE CRM & DIRECTIVAS DE GESTÃO
          </h2>
          <p className="text-xs font-sans text-blue-200 mt-0.5">
            Orientação comercial personalizada e acompanhamento directo de propostas
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-blue-950 font-sans font-black text-xs px-4 py-2 rounded shadow-sm transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus size={16} /> Define Recomendação p/ Comercial
          </button>
        )}
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white border border-gray-300 p-3 rounded-sm shadow-xs font-sans">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Pesquisar cliente ou comercial..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Filter Comercial */}
          <div>
            <select
              value={selectedComercial}
              onChange={e => setSelectedComercial(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded font-semibold text-gray-800 focus:outline-none focus:border-blue-700"
            >
              <option value="Todos">👥 Todos os Comerciais</option>
              <option value="Luísa Baltazar">Luísa Baltazar</option>
              <option value="Amélia Cassinda">Amélia Cassinda</option>
              <option value="Marta de Oliveira">Marta de Oliveira</option>
              <option value="Ilídio Pedro">Ilídio Pedro</option>
              {comerciais.filter(u => !['Luísa Baltazar', 'Amélia Cassinda', 'Marta de Oliveira', 'Ilídio Pedro'].includes(u.nome)).map(u => (
                <option key={u.id} value={u.nome}>{u.nome}</option>
              ))}
            </select>
          </div>

          {/* Filter Priority */}
          <div>
            <select
              value={selectedPrioridade}
              onChange={e => setSelectedPrioridade(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded font-semibold text-gray-800 focus:outline-none focus:border-blue-700"
            >
              <option value="Todas">⚡ Todas as Prioridades</option>
              <option value="Alta">🔴 Alta Prioridade</option>
              <option value="Média">🟡 Média Prioridade</option>
              <option value="Normal">🟢 Prioridade Normal</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedAcompanhamento}
              onChange={e => setSelectedAcompanhamento(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded font-semibold text-gray-800 focus:outline-none focus:border-blue-700"
            >
              <option value="Todos">📌 Todos os Estados</option>
              <option value="Pendente">⏳ Pendentes</option>
              <option value="Em curso">🔄 Em Curso</option>
              <option value="Concluído">✅ Concluídos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Excel Grid Table */}
      <div className="bg-white border border-gray-400 shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-[#1B365D] text-white border-b border-[#122442]">
              <th className="px-3 py-2.5 font-bold border-r border-[#2C4D75] whitespace-nowrap">Cliente</th>
              <th className="px-3 py-2.5 font-bold border-r border-[#2C4D75] whitespace-nowrap">Comercial</th>
              <th className="px-3 py-2.5 font-bold border-r border-[#2C4D75] whitespace-nowrap">Estado</th>
              <th className="px-3 py-2.5 font-bold text-right border-r border-[#2C4D75] whitespace-nowrap">Valor</th>
              <th className="px-3 py-2.5 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Prioridade</th>
              <th className="px-3 py-2.5 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Dias</th>
              <th className="px-4 py-2.5 font-bold border-r border-[#2C4D75]">Recomendação Directa / Próximo Passo</th>
              <th className="px-3 py-2.5 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Prazo</th>
              <th className="px-3 py-2.5 font-bold border-r border-[#2C4D75]">Resultado Esperado</th>
              <th className="px-3 py-2.5 font-bold text-center border-r border-[#2C4D75] whitespace-nowrap">Acompanhamento</th>
              <th className="px-3 py-2.5 font-bold border-r border-[#2C4D75] whitespace-nowrap">Origem / Obs</th>
              {isAdmin && <th className="px-3 py-2.5 font-bold text-center whitespace-nowrap">Gestão (Admin)</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="py-8 text-center text-gray-500 italic">
                  Nenhuma recomendação encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredList.map((row) => (
                <tr key={row.idKey} className={`${getRowBgColor(row.estado)} transition-colors`}>
                  <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {row.cliente}
                  </td>
                  <td className="px-3 py-2 text-gray-900 font-semibold border-r border-gray-300 whitespace-nowrap">
                    {row.comercial}
                  </td>
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {row.estado}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {row.valor}
                  </td>
                  <td className="px-3 py-2 text-center border-r border-gray-300 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.prioridade === 'Alta' ? 'bg-red-100 text-red-800 border border-red-300' :
                      row.prioridade === 'Média' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {row.prioridade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-800 border-r border-gray-300 whitespace-nowrap font-mono font-bold">
                    {row.diasAberto}d
                  </td>
                  <td className="px-4 py-2 text-gray-900 font-medium border-r border-gray-300">
                    {row.recomendacao}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-800 border-r border-gray-300 whitespace-nowrap font-semibold">
                    {row.prazo}
                  </td>
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                    {row.resultado}
                  </td>
                  <td className="px-3 py-2 text-center border-r border-gray-300 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(row.idKey, row.acompanhamento)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      title="Clique para alternar o estado de acompanhamento"
                    >
                      {getAcompanhamentoBadge(row.acompanhamento)}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-gray-700 border-r border-gray-300 whitespace-nowrap text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      row.origem === 'Directiva de Gestão' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      row.origem === 'CRM Pipeline' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {row.origem || 'Oficial'}
                    </span>
                    {row.obs && <span className="ml-1 text-gray-500 italic">({row.obs})</span>}
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(row)}
                          className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition cursor-pointer"
                          title="Editar todos os campos e prioridade"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.idKey, row.cliente)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition cursor-pointer"
                          title="Eliminar recomendação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Modal for Adding Custom Direct Recommendations */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#1B365D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Definir Recomendação Directa p/ Comercial
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCustomRecommendation} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                  Comercial de Destino *
                </label>
                <select
                  value={newRec.comercial}
                  onChange={e => setNewRec({ ...newRec, comercial: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded font-semibold bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-700"
                  required
                >
                  <option value="Luísa Baltazar">Luísa Baltazar</option>
                  <option value="Amélia Cassinda">Amélia Cassinda</option>
                  <option value="Marta de Oliveira">Marta de Oliveira</option>
                  <option value="Ilídio Pedro">Ilídio Pedro</option>
                  {comerciais.filter(u => !['Luísa Baltazar', 'Amélia Cassinda', 'Marta de Oliveira', 'Ilídio Pedro'].includes(u.nome)).map(u => (
                    <option key={u.id} value={u.nome}>{u.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Cliente / Entidade *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SONANGOL, ENDE, BNA..."
                    value={newRec.cliente}
                    onChange={e => setNewRec({ ...newRec, cliente: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Valor Proposto (AOA)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 15000000"
                    value={newRec.valor}
                    onChange={e => setNewRec({ ...newRec, valor: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Estado Proposta
                  </label>
                  <select
                    value={newRec.estado}
                    onChange={e => setNewRec({ ...newRec, estado: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Proposta em negociação">Proposta em negociação</option>
                    <option value="Proposta aprovada">Proposta aprovada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Prioridade *
                  </label>
                  <select
                    value={newRec.prioridade}
                    onChange={e => setNewRec({ ...newRec, prioridade: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700 font-bold"
                  >
                    <option value="Alta">🔴 Alta</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Normal">🟢 Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Dias Aberto *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRec.diasAberto}
                    onChange={e => setNewRec({ ...newRec, diasAberto: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                  Recomendação Directa / Instrução Comercial *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Agendar reunião presencial com o Director Financeiro para fecho do contrato..."
                  value={newRec.recomendacao}
                  onChange={e => setNewRec({ ...newRec, recomendacao: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Prazo Limite
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 24 horas, 48 horas..."
                    value={newRec.prazo}
                    onChange={e => setNewRec({ ...newRec, prazo: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Resultado Esperado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Obter PO / Adjudicação"
                    value={newRec.resultado}
                    onChange={e => setNewRec({ ...newRec, resultado: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#1B365D] hover:bg-[#122442] text-white font-black shadow-sm cursor-pointer"
                >
                  Gravar Recomendação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal for EDITING existing recommendations */}
      {editingRowKey && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1B365D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="text-amber-400" size={20} />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Editar Recomendação & Directiva (Admin)
                </h3>
              </div>
              <button
                onClick={() => { setEditingRowKey(null); setEditFormData(null); }}
                className="text-gray-300 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Cliente / Entidade *
                  </label>
                  <input
                    type="text"
                    value={editFormData.cliente}
                    onChange={e => setEditFormData({ ...editFormData, cliente: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Comercial *
                  </label>
                  <select
                    value={editFormData.comercial}
                    onChange={e => setEditFormData({ ...editFormData, comercial: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-semibold focus:outline-none focus:border-blue-700"
                    required
                  >
                    <option value="Luísa Baltazar">Luísa Baltazar</option>
                    <option value="Amélia Cassinda">Amélia Cassinda</option>
                    <option value="Marta de Oliveira">Marta de Oliveira</option>
                    <option value="Ilídio Pedro">Ilídio Pedro</option>
                    {comerciais.filter(u => !['Luísa Baltazar', 'Amélia Cassinda', 'Marta de Oliveira', 'Ilídio Pedro'].includes(u.nome)).map(u => (
                      <option key={u.id} value={u.nome}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Prioridade *
                  </label>
                  <select
                    value={editFormData.prioridade}
                    onChange={e => setEditFormData({ ...editFormData, prioridade: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-700"
                  >
                    <option value="Alta">🔴 Alta</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Normal">🟢 Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Dias Aberto *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editFormData.diasAberto}
                    onChange={e => setEditFormData({ ...editFormData, diasAberto: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-mono font-bold focus:outline-none focus:border-blue-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={editFormData.estado}
                    onChange={e => setEditFormData({ ...editFormData, estado: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Valor Proposto
                  </label>
                  <input
                    type="text"
                    value={editFormData.valor}
                    onChange={e => setEditFormData({ ...editFormData, valor: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Acompanhamento
                  </label>
                  <select
                    value={editFormData.acompanhamento}
                    onChange={e => setEditFormData({ ...editFormData, acompanhamento: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 font-semibold focus:outline-none focus:border-blue-700"
                  >
                    <option value="Pendente">⏳ Pendente</option>
                    <option value="Em curso">🔄 Em curso</option>
                    <option value="Concluído">✅ Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                  Recomendação Directa / Instrução Comercial *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.recomendacao}
                  onChange={e => setEditFormData({ ...editFormData, recomendacao: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Prazo Limite
                  </label>
                  <input
                    type="text"
                    value={editFormData.prazo}
                    onChange={e => setEditFormData({ ...editFormData, prazo: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase text-[10px]">
                    Resultado Esperado
                  </label>
                  <input
                    type="text"
                    value={editFormData.resultado}
                    onChange={e => setEditFormData({ ...editFormData, resultado: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setEditingRowKey(null); setEditFormData(null); }}
                  className="px-4 py-2 rounded border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#1B365D] hover:bg-[#122442] text-white font-black shadow-sm cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

