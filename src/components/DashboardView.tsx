import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppLogoImage from './AppLogoImage';
import { Usuario, Deal, Cliente, Guideline } from '../types';
const bgVideo = '/videos/Prompt_Direto_e_Suave_Reco.mp4';
import { baseDuasSemanasData } from '../data/baseDuasSemanasData';
import { 
  PeriodType, 
  calculatePeriodRange, 
  calculatePreviousPeriodRange, 
  computeCommercialMetrics,
  generateDynamicWeeklyTimeline,
  generateDynamicMonthlyTimeline,
  formatDateRangeLabel,
  computePipelineGlobalDia,
  getThreeWeekComparison
} from '../utils/periodEngine';
import { 
  Filter, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Sparkles, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Calendar, 
  Briefcase, 
  Users, 
  Clock, 
  Target, 
  CheckCircle,
  Building2,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

import GlobalPeriodBar from './GlobalPeriodBar';

interface DashboardViewProps {
  comerciais: Usuario[];
  deals: Deal[];
  clients: Cliente[];
  guidelines?: Guideline[];
  onOpenEditGuidelines?: () => void;
  loggedUser?: Usuario;
  appLogo?: string;
  onViewChange?: (viewId: string) => void;
  refDate: Date;
  onRefDateChange: (d: Date) => void;
  selectedPeriod: PeriodType;
  onPeriodTypeChange: (p: PeriodType) => void;
  selectedComercial: string;
  onComercialChange: (c: string) => void;
  selectedEmpresa: string;
  onEmpresaChange: (e: string) => void;
  selectedProvincia: string;
  onProvinciaChange: (p: string) => void;
}

export default function DashboardView({
  comerciais,
  deals,
  clients,
  appLogo,
  onViewChange,
  refDate,
  onRefDateChange,
  selectedPeriod,
  onPeriodTypeChange,
  selectedComercial,
  onComercialChange,
  selectedEmpresa,
  onEmpresaChange,
  selectedProvincia,
  onProvinciaChange
}: DashboardViewProps) {
  const [timelineTab, setTimelineTab] = useState<'semanal' | 'mensal'>('semanal');
  const refDateStr = refDate ? refDate.toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO');

  // Estado de sincronização com os ficheiros de ./Ducumentos
  const [isSyncingExcel, setIsSyncingExcel] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Compute period ranges
  const currentRange = useMemo(() => {
    return calculatePeriodRange(refDate, selectedPeriod);
  }, [refDate, selectedPeriod]);

  const prevRange = useMemo(() => {
    return calculatePreviousPeriodRange(currentRange);
  }, [currentRange]);

  // Combined Deal Source (baseDuasSemanasData + CRM deals)
  const allDeals = useMemo(() => {
    let savedBase: any[] = [];
    try {
      const saved = localStorage.getItem('gpa_base_duas_semanas');
      const parsed = saved ? JSON.parse(saved) : null;
      savedBase = Array.isArray(parsed) && parsed.length > 0 ? parsed : baseDuasSemanasData;
    } catch {
      savedBase = baseDuasSemanasData;
    }

    const convertedBaseDeals: Deal[] = savedBase.map((p, idx) => {
      let etapa: Deal['etapa'] = 'proposta';
      const est = (p.estadoProposta || p.estadoCRM || '').toLowerCase();
      if (est.includes('aprov') || est.includes('fechad') || est.includes('ganha')) etapa = 'fechado';
      else if (est.includes('perdid') || est.includes('rejeit')) etapa = 'perdido';
      else if (est.includes('negoc')) etapa = 'negociacao';
      else if (est.includes('reuni') || est.includes('visit')) etapa = 'visita';

      const parseVal = (str?: string): number => {
        if (!str) return 0;
        const clean = str.replace(/[^\d,-]/g, '').replace(',', '.');
        return parseFloat(clean) || 0;
      };

      return {
        id: `base_${idx}`,
        clienteNome: p.cliente || 'Cliente',
        titulo: p.servico || `Proposta ${p.cliente}`,
        valor: parseVal(p.valorProposta),
        valorAprovado: parseVal(p.valorAprovado),
        valorPerdido: parseVal(p.valorPerdido),
        etapa,
        comercialId: 'u9',
        comercialNome: p.gestorComercial || 'Comercial',
        prioridade: p.prioridade || 'Média',
        diasAberto: p.diasEmAberto || 0,
        dataEnvio: p.dataEnvio || '2026-07-27',
        semana: p.semana,
        empresa: p.empresaGroup || 'GPA Angola',
        proximaAcao: p.proximaAcao,
        proximoContacto: p.proximoContacto,
        observacoes: p.observacoes
      };
    });

    const filterUserDeals = deals.filter(d => !d.id.startsWith('d_sa_') && !d.id.startsWith('d_sf_'));
    return [...convertedBaseDeals, ...filterUserDeals];
  }, [deals]);

  // Dynamic Weekly Timeline (Past, Current & Future weeks)
  const weeklyTimeline = useMemo(() => {
    return generateDynamicWeeklyTimeline(allDeals, comerciais, refDate);
  }, [allDeals, comerciais, refDate]);

  // Dynamic Monthly Timeline
  const monthlyTimeline = useMemo(() => {
    return generateDynamicMonthlyTimeline(allDeals, comerciais, refDate);
  }, [allDeals, comerciais, refDate]);

  // Pipeline Global (Somatório Geral do Dia)
  const pipelineGlobalDia = useMemo(() => {
    return computePipelineGlobalDia(allDeals, refDate);
  }, [allDeals, refDate]);

  // Comparativo das 3 Semanas dos Ficheiros Excel (Julho, Semana Passada e Esta Semana)
  const threeWeekComparison = useMemo(() => {
    return getThreeWeekComparison(allDeals, refDate);
  }, [allDeals, refDate]);

  // Compute Metrics using the period engine
  const metrics = useMemo(() => {
    return computeCommercialMetrics(
      allDeals,
      comerciais,
      refDate,
      currentRange,
      prevRange,
      {
        comercialId: selectedComercial,
        empresaGroup: selectedEmpresa,
        provincia: selectedProvincia
      }
    );
  }, [allDeals, comerciais, refDate, currentRange, prevRange, selectedComercial, selectedEmpresa, selectedProvincia]);

  // Format currency helpers
  const formatKz = (v: number) => {
    if (v === 0) return '0,00 AOA';
    return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' AOA';
  };

  const formatShortKz = (v: number) => {
    if (v >= 1000000000) return (v / 1000000000).toFixed(1).replace('.', ',') + 'B Kz';
    if (v >= 1000000) return (v / 1000000).toFixed(1).replace('.', ',') + 'M Kz';
    if (v >= 1000) return (v / 1000).toFixed(0) + 'k Kz';
    return String(v) + ' Kz';
  };

  // Sync Excel files from ./Ducumentos
  const handleSyncExcel = async () => {
    setIsSyncingExcel(true);
    setSyncStatusMsg(null);
    try {
      const res = await fetch('/api/import-excel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg(data.message || 'Dados das novas semanas atualizados com sucesso!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncStatusMsg(`Erro: ${data.error || data.message}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`Erro de ligação: ${err.message}`);
    } finally {
      setIsSyncingExcel(false);
    }
  };

  const crmRecommendations = [
    {
      num: 1,
      categoria: 'FECHO PRIORITÁRIO',
      descricao: 'Fecho prioritário para propostas de valor igual ou superior a 10.000.000,00 Kz.',
      acao: 'Contacto directo ao decisor e agendamento de reunião de fecho.'
    },
    {
      num: 2,
      categoria: 'PROPOSTAS ANTIGAS',
      descricao: 'Reativação de propostas em aberto há mais de 15 dias.',
      acao: 'Solicitar decisão formal ou apresentar revisão comercial.'
    },
    {
      num: 3,
      categoria: 'OPORTUNIDADES APONTADAS',
      descricao: 'Seguimento imediato de propostas com probabilidade superior a 60%.',
      acao: 'Confirmar condições de adjudicação e prazo de entrega.'
    },
    {
      num: 4,
      categoria: 'APOIO COMERCIAL',
      descricao: 'Intervenção técnica nos comerciais com cumprimento de meta abaixo de 60%.',
      acao: 'Definir plano diário de contactos e acompanhamento pelo Diretor Comercial.'
    },
    {
      num: 5,
      categoria: 'ATUALIZAÇÃO CRM',
      descricao: 'Registo e atualização de estado de todas as propostas.',
      acao: 'Manter pipeline atualizado diariamente com próximas ações.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100 min-h-screen font-sans text-gray-900">
      
      {/* HERO BANNER DINÂMICO COM VÍDEO ANIMADO PROMINENTE (Prompt_Direto_e_Suave_Reco.mp4) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#0B172A] to-[#0F2942] text-white p-6 shadow-2xl border-2 border-cyan-400/50 group">
        {/* Background Animated Video Layer with High Visibility */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-100 group-hover:scale-105 transition-transform duration-1000"
        >
          <source src={bgVideo} type="video/mp4" />
          <source src="/videos/Prompt_Direto_e_Suave_Reco.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-blue-950/50 backdrop-blur-[1px]" />

        {/* Floating Animated Video Indicator */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-400/50 backdrop-blur-md shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">Animação Ativa • Prompt Direto & Suave Reco</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AppLogoImage logoUrl={appLogo} altText="GPA Angola Logo" className="h-14 w-auto bg-white/10 p-2 rounded-xl border border-white/20 shadow-lg backdrop-blur-md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-md">
                  GPA Sales Intelligence / CRM V8.0 PRO
                </h1>
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 2026–2036
                </span>
              </div>
              <p className="text-xs text-cyan-200/90 mt-1 flex items-center gap-2">
                <Calendar size={14} className="text-amber-400 animate-bounce-slow" />
                <span>Plataforma Inteligente de Gestão Comercial & Inteligência de Vendas</span>
                <span className="text-cyan-400">•</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {allDeals.length} Oportunidades Registadas
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncExcel}
              disabled={isSyncingExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/40 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet size={16} className={isSyncingExcel ? 'animate-spin' : ''} />
              <span>{isSyncingExcel ? 'A Sincronizar Ficheiros...' : 'Sincronizar Ficheiros Excel (Ducumentos)'}</span>
            </button>
          </div>
        </div>
      </div>

      {syncStatusMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-950/90 text-emerald-100 rounded-xl text-xs font-bold flex items-center justify-between shadow-xl border border-emerald-500/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{syncStatusMsg}</span>
          </div>
          <button onClick={() => setSyncStatusMsg(null)} className="text-emerald-300 hover:text-white font-bold text-sm">✕</button>
        </motion.div>
      )}

      {/* GLOBAL PERIOD BAR SYNCHRONIZED ACROSS ALL 13 VIEWS */}
      <GlobalPeriodBar
        refDate={refDate}
        onRefDateChange={onRefDateChange}
        periodType={selectedPeriod}
        onPeriodTypeChange={onPeriodTypeChange}
        comerciais={comerciais}
        selectedComercial={selectedComercial}
        onComercialChange={onComercialChange}
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={onEmpresaChange}
        selectedProvincia={selectedProvincia}
        onProvinciaChange={onProvinciaChange}
        currentViewName="Dashboard Analítico"
      />

      {/* GRID DE CARDS KPI EXECUTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 rounded-xl border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">Receita Aprovada</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><CheckCircle size={18} /></span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-gray-900 font-mono tracking-tight">
              {formatShortKz(metrics.current.valorAprovadoTotal)}
            </h3>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">{formatKz(metrics.current.valorAprovadoTotal)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 text-[11px]">vs Período Anterior</span>
            <span className={`font-black flex items-center gap-0.5 text-[11px] ${metrics.comparative.valorAprovado.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.comparative.valorAprovado.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {metrics.comparative.valorAprovado.label}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider">Volume Proposto</span>
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><TrendingUp size={18} /></span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-gray-900 font-mono tracking-tight">
              {formatShortKz(metrics.current.valorPropostoTotal)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{metrics.current.propostasCount} propostas no período</p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 text-[11px]">vs Período Anterior</span>
            <span className={`font-black flex items-center gap-0.5 text-[11px] ${metrics.comparative.valorProposto.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.comparative.valorProposto.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {metrics.comparative.valorProposto.label}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-indigo-800 tracking-wider">Pipeline Aberto</span>
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg"><Briefcase size={18} /></span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-gray-900 font-mono tracking-tight">
              {formatShortKz(metrics.current.pipelineAbertoTotal)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Posição na Data de Ref.</p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 text-[11px]">Propostas Paradas ({'>'}15d)</span>
            <span className="font-bold text-amber-600 text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {metrics.current.propostasParadasCount} propostas
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">Forecast Ponderado</span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg"><Target size={18} /></span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-gray-900 font-mono tracking-tight">
              {formatShortKz(metrics.current.forecastTotal)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Receita Prevista Esperada</p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 text-[11px]">Próximos 30 dias</span>
            <span className="font-bold text-gray-900 font-mono text-[11px]">
              {formatShortKz(metrics.current.forecast30Dias)}
            </span>
          </div>
        </div>

      </div>

      {/* CARD DESTACADO: PIPELINE GLOBAL (SOMATÓRIO GERAL DO DIA) */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1B365D] to-indigo-950 text-white p-5 rounded-xl border border-blue-700 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-gray-950 rounded-lg font-black"><Layers size={18} /></span>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              Pipeline Global — Somatório Geral do Dia ({refDateStr})
            </h3>
          </div>
          <p className="text-xs text-blue-200">
            Total geral acumulado de propostas/oportunidades criadas e recebidas no dia da Data de Referência.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 p-3 rounded-lg border border-white/15 backdrop-blur-xs">
          <div className="border-r border-white/10 pr-3">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">Total do Dia</span>
            <span className="text-base font-black font-mono text-white">{formatShortKz(pipelineGlobalDia.totalDiaProposto)}</span>
            <span className="text-[10px] block text-blue-200 font-mono">{formatKz(pipelineGlobalDia.totalDiaProposto)}</span>
          </div>
          <div className="border-r border-white/10 pr-3">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">Qtd Propostas</span>
            <span className="text-base font-black font-mono text-amber-300">{pipelineGlobalDia.qtdPropostasDia} propostas</span>
            <span className="text-[10px] block text-amber-200 font-mono">Entradas no Dia</span>
          </div>
          <div className="border-r border-white/10 pr-3">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">Receita Aprovada</span>
            <span className="text-base font-black font-mono text-emerald-400">{formatShortKz(pipelineGlobalDia.totalDiaAprovado)}</span>
            <span className="text-[10px] block text-emerald-200 font-mono">{formatKz(pipelineGlobalDia.totalDiaAprovado)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-300 block">Pipeline em Aberto</span>
            <span className="text-base font-black font-mono text-indigo-300">{formatShortKz(pipelineGlobalDia.pipelineAbertoDia)}</span>
            <span className="text-[10px] block text-indigo-200 font-mono">{formatKz(pipelineGlobalDia.pipelineAbertoDia)}</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO DESTACADA: COMPARATIVO INTEGRADO DE 3 SEMANAS DE EXCEL */}
      <div className="bg-white border border-blue-200 shadow-md rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-2">
          <div>
            <h2 className="text-sm font-black uppercase text-[#1B365D] tracking-wide flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Comparativo Semanal Integrado (Última Semana Mês Passado vs Semana Passada vs Esta Semana)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparação detalhada acumulada das 3 semanas principais registadas nos ficheiros em Ducumentos.
            </p>
          </div>
          <span className="bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold px-3 py-1 rounded-full">
            3 Semanas Principais
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1B365D] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-2.5 rounded-l">Período / Semana</th>
                <th className="p-2.5 text-center">Estado</th>
                <th className="p-2.5 text-center">Nº Propostas</th>
                <th className="p-2.5 text-right">Valor Proposto (Kz)</th>
                <th className="p-2.5 text-right">Receita Aprovada (Kz)</th>
                <th className="p-2.5 text-right">Valor Perdido (Kz)</th>
                <th className="p-2.5 text-right">Forecast Ponderado (Kz)</th>
                <th className="p-2.5 text-center rounded-r">Conversão %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              {threeWeekComparison.map((w) => {
                const isCurrent = w.statusTag === 'SEMANA_ACTUAL';
                const isPrev = w.statusTag === 'SEMANA_ANTERIOR';
                
                return (
                  <tr key={w.key} className={`hover:bg-blue-50/50 transition-colors ${isCurrent ? 'bg-emerald-50/80 font-bold border-l-4 border-emerald-500' : ''}`}>
                    <td className="p-2.5 font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={14} className={isCurrent ? 'text-emerald-600' : 'text-blue-600'} />
                      <span>{w.label}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      {isCurrent ? (
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9.5px] font-black uppercase shadow-xs">
                          ESTA SEMANA
                        </span>
                      ) : isPrev ? (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9.5px] font-black uppercase shadow-xs">
                          SEMANA PASSADA
                        </span>
                      ) : (
                        <span className="bg-slate-500 text-white px-2 py-0.5 rounded text-[9.5px] font-black uppercase shadow-xs">
                          MÊS PASSADO
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold font-mono">{w.propostasCount}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">{formatKz(w.valorProposto)}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">{formatKz(w.valorAprovado)}</td>
                    <td className="p-2.5 text-right font-mono text-rose-600">{formatKz(w.valorPerdido)}</td>
                    <td className="p-2.5 text-right font-mono text-amber-700">{formatKz(w.forecastPonderado)}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-blue-900">{w.conversaoPct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOVO PAINEL EVOLUTIVO — EVOLUÇÃO TEMPORAL MULTI-SEMANAL E PROJEÇÕES */}
      <div className="bg-white border border-gray-300 shadow-md rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-3">
          <div>
            <h2 className="text-sm font-black uppercase text-[#1B365D] tracking-wide flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-500" />
              Evolução Temporal Dinâmica (Semanas Passadas, Actual e Futuras)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Visualização sequencial das propostas à medida que novas semanas e dias são adicionados diariamente.
            </p>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-300">
            <button
              onClick={() => setTimelineTab('semanal')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timelineTab === 'semanal' ? 'bg-blue-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Semanal ({weeklyTimeline.length} Semanas)
            </button>
            <button
              onClick={() => setTimelineTab('mensal')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timelineTab === 'mensal' ? 'bg-blue-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Mensal ({monthlyTimeline.length} Meses)
            </button>
          </div>
        </div>

        {/* GRÁFICO VISUAL DE BARRAS DA LINHA DO TEMPO */}
        {timelineTab === 'semanal' ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2 bg-slate-50 rounded-xl border border-gray-200 overflow-x-auto">
              {weeklyTimeline.map((w, idx) => {
                const maxVal = Math.max(...weeklyTimeline.map(item => item.valorProposto), 1000000);
                const heightPct = Math.max(12, Math.min(100, (w.valorProposto / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 min-w-[75px] flex flex-col items-center h-full justify-end group">
                    
                    {/* Tooltip Hover */}
                    <div className="text-[9.5px] font-mono font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-center whitespace-nowrap bg-gray-900 text-white p-1 rounded shadow-md">
                      {formatShortKz(w.valorProposto)}
                      <br/>
                      <span className="text-emerald-400">Apr: {formatShortKz(w.valorAprovado)}</span>
                    </div>

                    {/* Barra Visual */}
                    <div 
                      className={`w-full max-w-[38px] rounded-t-lg transition-all shadow-xs relative flex items-center justify-center ${
                        w.isCurrentWeek ? 'bg-gradient-to-t from-emerald-600 to-teal-400 border-2 border-emerald-300' :
                        w.isFutureWeek ? 'bg-gradient-to-t from-indigo-500 to-violet-400 opacity-80 border border-indigo-300 border-dashed' :
                        'bg-gradient-to-t from-blue-700 to-sky-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {w.isCurrentWeek && (
                        <span className="absolute -top-3 bg-emerald-600 text-white text-[8px] font-black px-1 rounded uppercase tracking-tighter shadow-xs">
                          Actual
                        </span>
                      )}
                      {w.isFutureWeek && (
                        <span className="absolute -top-3 bg-indigo-600 text-white text-[8px] font-black px-1 rounded uppercase tracking-tighter shadow-xs">
                          Futura
                        </span>
                      )}
                    </div>

                    {/* Label da Semana */}
                    <div className="mt-2 text-center">
                      <span className={`text-[10px] font-bold block truncate max-w-[70px] ${w.isCurrentWeek ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}`}>
                        {w.label.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono block">
                        {w.label.split(' ')[1] || ''}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* LEGENDA DO GRÁFICO */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600 font-bold pt-1">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-600 rounded"></span> Semanas Passadas</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded border border-emerald-300"></span> Semana Actual (Ref)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded border border-dashed border-indigo-300"></span> Futuras Semanas / Projeção</span>
            </div>

            {/* TABELA COMPLETA MULTI-SEMANAL (PASSADO, PRESENTE E FUTURO) */}
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#1B365D] text-white font-bold uppercase text-[10px]">
                    <th className="px-3.5 py-2.5">Semana / Período</th>
                    <th className="px-3 py-2.5 text-center">Estado</th>
                    <th className="px-3 py-2.5 text-center font-mono">Nº Propostas</th>
                    <th className="px-3 py-2.5 text-right font-mono">Valor Proposto</th>
                    <th className="px-3 py-2.5 text-right font-mono">Receita Aprovada</th>
                    <th className="px-3 py-2.5 text-right font-mono">Forecast Ponderado</th>
                    <th className="px-3 py-2.5 text-center font-mono">Conversão %</th>
                    <th className="px-3 py-2.5 text-right font-mono">Meta %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {weeklyTimeline.map((w, idx) => (
                    <tr key={idx} className={`hover:bg-blue-50/50 transition-colors ${w.isCurrentWeek ? 'bg-emerald-50/60 font-bold border-l-4 border-l-emerald-600' : ''}`}>
                      <td className="px-3.5 py-2 font-bold text-gray-900">
                        {w.label}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {w.isCurrentWeek && <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">ACTUAL</span>}
                        {w.isFutureWeek && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold border border-indigo-300">FUTURA</span>}
                        {w.isPastWeek && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">PASSADA</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-gray-800">{w.propostasCount}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-800">{formatKz(w.valorProposto)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">{formatKz(w.valorAprovado)}</td>
                      <td className="px-3 py-2 text-right font-mono text-amber-700 font-bold">{formatKz(w.forecast)}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-blue-700">{w.conversaoPct.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${w.pctMeta >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {w.pctMeta.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TABELA MENSAL */
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1B365D] text-white font-bold uppercase text-[10px]">
                  <th className="px-3.5 py-2.5">Mês / Ano</th>
                  <th className="px-3 py-2.5 text-center font-mono">Nº Propostas</th>
                  <th className="px-3 py-2.5 text-right font-mono">Valor Proposto</th>
                  <th className="px-3 py-2.5 text-right font-mono">Receita Aprovada</th>
                  <th className="px-3 py-2.5 text-right font-mono">Forecast Ponderado</th>
                  <th className="px-3 py-2.5 text-center font-mono">Conversão %</th>
                  <th className="px-3 py-2.5 text-right font-mono">Meta %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {monthlyTimeline.map((m, idx) => (
                  <tr key={idx} className={`hover:bg-blue-50/50 ${m.isCurrentMonth ? 'bg-emerald-50/60 font-bold border-l-4 border-l-emerald-600' : ''}`}>
                    <td className="px-3.5 py-2.5 font-bold text-gray-900">{m.label}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-gray-800">{m.propostasCount}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-gray-800">{formatKz(m.valorProposto)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{formatKz(m.valorAprovado)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-amber-700 font-bold">{formatKz(m.forecast)}</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-700">{m.conversaoPct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold">{m.pctMeta.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* PROJEÇÕES DE LONGO PRAZO: DAQUI A 2 SEMANAS / 1 MÊS / 1 ANO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-indigo-900 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400 animate-pulse" size={18} />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Projeções de Vendas Futuras — "Daqui a 2 Semanas, 1 Mês e 1 Ano"
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-800 text-indigo-200 px-2.5 py-0.5 rounded font-mono border border-indigo-700">
            Helena IA Predictive Sales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15 backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase text-indigo-300">Daqui a 2 Semanas (Até 25/08/2026)</span>
            <h4 className="text-lg font-black text-emerald-300 font-mono mt-1">
              {formatShortKz(metrics.current.forecast30Dias * 0.65)}
            </h4>
            <p className="text-[10.5px] text-gray-300 mt-1 leading-snug">
              Expectativa de fecho para propostas em fase de negociação direta.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15 backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase text-blue-300">Daqui a 1 Mês (Setembro 2026)</span>
            <h4 className="text-lg font-black text-blue-300 font-mono mt-1">
              {formatShortKz(metrics.current.forecast30Dias)}
            </h4>
            <p className="text-[10.5px] text-gray-300 mt-1 leading-snug">
              Volume esperado ponderado das oportunidades abertas no pipeline.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15 backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase text-amber-300">Daqui a 1 Trimestre (Q4 2026)</span>
            <h4 className="text-lg font-black text-amber-300 font-mono mt-1">
              {formatShortKz(metrics.current.forecast90Dias)}
            </h4>
            <p className="text-[10.5px] text-gray-300 mt-1 leading-snug">
              Projeção acumulada para o final do ano comercial 2026.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/15 backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase text-teal-300">Projeção Anual 2026 / 2027</span>
            <h4 className="text-lg font-black text-teal-300 font-mono mt-1">
              {formatShortKz(metrics.current.metaPeriodoTotal * 12 * 1.15)}
            </h4>
            <p className="text-[10.5px] text-gray-300 mt-1 leading-snug">
              Meta anual combinada com taxa de crescimento projetada.
            </p>
          </div>

        </div>
      </div>

      {/* LINHA DE RANKING E PERFORMANCE DA EQUIPA */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B365D] to-[#0F2942] text-white px-4 py-3 text-xs font-black uppercase tracking-wide flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span>Ranking & Performance da Equipa Comercial (Cumprimento da Meta)</span>
          </div>
          <span className="text-[10px] bg-amber-500 text-gray-950 font-black px-2.5 py-0.5 rounded">
            Meta Equipa: {formatShortKz(metrics.current.metaPeriodoTotal)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-gray-700 border-b border-gray-300 font-bold uppercase text-[10px]">
                <th className="px-3.5 py-2.5 text-center w-12">Pos.</th>
                <th className="px-3.5 py-2.5">Comercial</th>
                <th className="px-3 py-2.5 text-right font-mono">Meta do Período</th>
                <th className="px-3 py-2.5 text-right font-mono">Proposto</th>
                <th className="px-3 py-2.5 text-right font-mono">Aprovado</th>
                <th className="px-3.5 py-2.5 text-center">% Cumprimento</th>
                <th className="px-3.5 py-2.5 text-center">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              {metrics.commercialRanking.map((item, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
                
                return (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 text-center font-bold text-sm font-mono">{medal}</td>
                    <td className="px-3.5 py-2.5 font-bold text-gray-900">
                      <div>{item.nome}</div>
                      <div className="text-[10px] font-normal text-gray-500">{item.funcao}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-gray-600">{formatKz(item.meta)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-gray-800">{formatKz(item.proposto)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{formatKz(item.aprovado)}</td>
                    <td className="px-3.5 py-2.5 text-center font-mono font-black text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${
                        item.pctMeta >= 100 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        item.pctMeta >= 60 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        item.propostasCount > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.pctMeta.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {item.status === 'meta_atingida' && <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">🟢 Meta Atingida</span>}
                      {item.status === 'acelerar_fecho' && <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">🟠 Acelerar Fecho</span>}
                      {item.status === 'intervencao' && <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">🔴 Intervenção</span>}
                      {item.status === 'sem_actividade' && <span className="px-2 py-0.5 bg-gray-300 text-gray-700 rounded text-[10px] font-bold">⚪ Sem Actividade</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECOMENDAÇÕES DE CRM */}
      <div className="bg-white border border-gray-300 shadow-md rounded-xl overflow-hidden font-sans">
        <div className="bg-gradient-to-r from-[#1B365D] via-[#0F2942] to-[#1E3A8A] text-white py-3 px-4 text-xs font-black uppercase tracking-wider border-b border-[#122442] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> 
            <span>RECOMENDAÇÕES AUTOMÁTICAS & INTELIGÊNCIA COMERCIAL</span>
          </div>
          <span className="bg-amber-500 text-gray-950 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
            Plano Estratégico CRM V5.1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50">
          {crmRecommendations.map((item) => (
            <div key={item.num} className="p-3.5 bg-white rounded-lg border border-gray-300 shadow-2xs flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#1B365D] text-white font-black font-mono text-[11px] flex items-center justify-center">
                    {item.num}
                  </span>
                  <span className="font-black text-[10px] uppercase tracking-wide text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.categoria}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-snug">
                  {item.descricao}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 font-bold text-[11px] text-emerald-800 flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item.acao}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
