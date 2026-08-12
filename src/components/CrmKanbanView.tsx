import React, { useState } from 'react';
import { Deal, Usuario } from '../types';
import { Plus, ArrowLeft, ArrowRight, TrendingUp, Filter, Search, BarChart3, PieChart, Layers, Phone, CheckCircle2, AlertCircle, Award, Sparkles, Building2, ChevronDown, ChevronUp, Trash2, BrainCircuit, GitFork, Info } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { calculateDealScore } from '../lib/predictiveScoring';
import { loadPipelines } from '../lib/multiPipeline';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface CrmKanbanViewProps {
  deals: Deal[];
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
  onOpenAddDeal: () => void;
  onMoveDeal: (dealId: string, dir: number) => void;
  onDeleteDeal?: (dealId: string) => void;
}

export default function CrmKanbanView({
  deals,
  comerciais = [],
  selectedComercial: propSelectedComercial,
  onOpenAddDeal,
  onMoveDeal,
  onDeleteDeal
}: CrmKanbanViewProps) {
  const [pipelines] = useState(() => loadPipelines());
  const [activePipelineId, setActivePipelineId] = useState<string>('funil_vendas_corp');

  const [selectedComercial, setSelectedComercial] = useState<string>('Todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [chartMode, setChartMode] = useState<'funnel' | 'commercials' | 'kpis'>('funnel');
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // Intuitive 7-Step Pipeline Stages
  const stages: { id: string; step: number; label: string; desc: string; color: string; prob: number }[] = [
    { id: 'lead', step: 1, label: '1. Lead', desc: 'Contacto Inicial', color: '#6366F1', prob: 0.10 },
    { id: 'contato', step: 2, label: '2. Contato', desc: 'Qualificação', color: '#3B82F6', prob: 0.25 },
    { id: 'visita', step: 3, label: '3. Visita', desc: 'Reunião Realizada', color: '#F59E0B', prob: 0.40 },
    { id: 'proposta', step: 4, label: '4. Proposta', desc: 'Cotação Enviada', color: '#F97316', prob: 0.65 },
    { id: 'negociacao', step: 5, label: '5. Negociação', desc: 'Ajustes de Contrato', color: '#8B5CF6', prob: 0.85 },
    { id: 'fechado', step: 6, label: '6. Fechado', desc: 'Venda Ganha', color: '#10B981', prob: 1.00 },
    { id: 'producao', step: 7, label: '7. Produção', desc: 'Serviço em Execução', color: '#059669', prob: 1.00 }
  ];

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat('pt-AO').format(v) + ' Kz';
  };

  // Filter deals
  const filteredDeals = deals.filter(d => {
    if (selectedComercial !== 'Todos' && d.comercialNome !== selectedComercial) return false;
    if (selectedPriority !== 'Todas' && d.prioridade !== selectedPriority) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchTitle = (d.titulo || '').toLowerCase().includes(term);
      const matchClient = (d.clienteNome || '').toLowerCase().includes(term);
      const matchComercial = (d.comercialNome || '').toLowerCase().includes(term);
      if (!matchTitle && !matchClient && !matchComercial) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalPipelineVal = filteredDeals.reduce((sum, d) => sum + (d.valor || 0), 0);
  const totalCount = filteredDeals.length;
  const avgTicket = totalCount > 0 ? totalPipelineVal / totalCount : 0;

  // Calculate Weighted Value (Ponderado)
  const weightedVal = filteredDeals.reduce((sum, d) => {
    const stageObj = stages.find(s => s.id === d.etapa);
    const prob = stageObj ? stageObj.prob : 0.5;
    return sum + (d.valor || 0) * prob;
  }, 0);

  // Grouping by commercial for the Commercial Performance chart
  const commercialMap: Record<string, { total: number; count: number; fechados: number }> = {};
  filteredDeals.forEach(d => {
    const cName = d.comercialNome || 'Sem Atribuição';
    if (!commercialMap[cName]) {
      commercialMap[cName] = { total: 0, count: 0, fechados: 0 };
    }
    commercialMap[cName].total += d.valor || 0;
    commercialMap[cName].count += 1;
    if (d.etapa === 'fechado' || d.etapa === 'producao') {
      commercialMap[cName].fechados += d.valor || 0;
    }
  });

  const maxCommercialVal = Math.max(...Object.values(commercialMap).map(c => c.total), 1);

  // Stage aggregates for funnel chart
  const stageData = stages.map(st => {
    const stageDeals = filteredDeals.filter(d => d.etapa === st.id);
    const sumVal = stageDeals.reduce((s, d) => s + (d.valor || 0), 0);
    return {
      ...st,
      count: stageDeals.length,
      val: sumVal,
      pctVal: totalPipelineVal > 0 ? (sumVal / totalPipelineVal) * 100 : 0
    };
  });

  const maxStageVal = Math.max(...stageData.map(s => s.val), 1);

  return (
    <div className="space-y-6 h-full flex flex-col font-sans text-slate-900 dark:text-slate-100">
      
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
          currentViewName="CRM Pipeline (Kanban)"
        />
      )}

      {/* Top Main Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#003366]" />
            <h4 className="text-base font-black text-[#003366] uppercase tracking-wide">
              Pipeline Comercial de Vendas (CRM)
            </h4>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Acompanhamento simples de propostas por etapas, responsáveis e estado de negociação em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`text-xs font-bold py-2.5 px-4 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
              showCharts 
                ? 'bg-blue-50 text-[#003366] border-blue-200 shadow-2xs' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={15} /> 
            <span>{showCharts ? 'Ocultar Análise do Funil' : '📊 Ver Gráfico do Funil e Estatísticas'}</span>
            {showCharts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={onOpenAddDeal}
            className="bg-[#003366] hover:bg-[#001f3f] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Novo Negócio
          </button>
        </div>
      </div>

      {/* Multi-Pipeline Funnel Switcher Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <GitFork size={16} className="text-[#003366] shrink-0 ml-1" />
          <span className="text-xs font-extrabold text-[#003366] uppercase tracking-wider shrink-0">Funil Ativo:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {pipelines.map(pipe => {
              const isActive = activePipelineId === pipe.id;
              return (
                <button
                  key={pipe.id}
                  onClick={() => setActivePipelineId(pipe.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{pipe.nome}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 shrink-0">
          <BrainCircuit size={13} className="text-purple-600 animate-spin-slow" />
          <span className="text-[10px] font-extrabold text-purple-900 uppercase">Helena IA Score Ativo</span>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50/90 to-blue-100/50 p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
          <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">Total em Carteira</span>
          <span className="text-base md:text-lg font-black text-[#003366] block mt-1">{formatCurrency(totalPipelineVal)}</span>
          <span className="text-[10px] text-blue-700 font-bold block mt-0.5">{totalCount} propostas ativas</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 p-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">Receita Estimada (Prob.)</span>
          <span className="text-base md:text-lg font-black text-emerald-700 block mt-1">{formatCurrency(weightedVal)}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Probabilidade ponderada</span>
        </div>

        <div className="bg-gradient-to-br from-purple-50/90 to-purple-100/50 p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider block">Valor Médio (Ticket)</span>
          <span className="text-base md:text-lg font-black text-purple-800 block mt-1">{formatCurrency(avgTicket)}</span>
          <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Por cada negócio</span>
        </div>

        <div className="bg-gradient-to-br from-amber-50/90 to-amber-100/50 p-3.5 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">Concluídos / Ganho</span>
          <span className="text-base md:text-lg font-black text-amber-800 block mt-1">
            {formatCurrency(stageData.filter(s => s.id === 'fechado' || s.id === 'producao').reduce((a, b) => a + b.val, 0))}
          </span>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Negócios fechados com sucesso</span>
        </div>
      </div>

      {/* Search & Commercial Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap flex-grow">
          <div className="relative flex-grow max-w-xs">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, título ou comercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#003366]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={selectedComercial}
              onChange={(e) => setSelectedComercial(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="Todos">👤 Todos Comerciais</option>
              {comerciais.map(u => (
                <option key={u.id} value={u.nome}>{u.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="Todas">⚡ Todas Prioridades</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Média">🟡 Média</option>
              <option value="Baixa">⚪ Baixa</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-xl">
          {filteredDeals.length} {filteredDeals.length === 1 ? 'negócio em exibição' : 'negócios em exibição'}
        </span>
      </div>

      {/* PRIMARY CRM KANBAN BOARD (At the Top) */}
      <div className="flex-grow flex gap-3.5 overflow-x-auto pb-4 items-start select-none min-h-[480px]">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter(d => d.etapa === stage.id);
          const stageSum = stageDeals.reduce((sum, d) => sum + (d.valor || 0), 0);

          return (
            <div
              key={stage.id}
              className="min-w-[285px] w-[285px] bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3 flex flex-col gap-3 flex-shrink-0 h-full max-h-[calc(100vh-220px)] overflow-y-auto shadow-2xs"
            >
              
              {/* Column Header with Step Indicator */}
              <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 sticky top-0 z-10 shadow-2xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.step}
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-gray-900 leading-tight">
                        {stage.label.replace(/^\d+\.\s*/, '')}
                      </h5>
                      <span className="text-[9px] text-gray-400 font-semibold block">{stage.desc}</span>
                    </div>
                  </div>

                  <span className="bg-gray-100 text-gray-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-gray-200">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 text-[10px] font-bold">
                  <span className="text-gray-400 uppercase">Subtotal:</span>
                  <span className="text-[#003366] font-black">{formatCurrency(stageSum)}</span>
                </div>
              </div>

              {/* Deal Cards List */}
              <div className="space-y-3 flex-grow overflow-y-auto pr-0.5">
                {stageDeals.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center text-[10px] font-bold text-gray-400 bg-white/60">
                    Nenhum negócio nesta fase
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const isHigh = deal.prioridade === 'Alta';
                    const priCls = isHigh 
                      ? 'bg-red-50 text-red-700 border-red-200 font-black' 
                      : deal.prioridade === 'Média' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 font-medium';

                    // Find assigned commercial user object
                    const commUser = comerciais.find(u => 
                      u.nome.toLowerCase() === (deal.comercialNome || '').toLowerCase()
                    );
                    const phone = commUser?.whatsappNumero || commUser?.telefone || '244900000000';

                    return (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl p-3 border border-gray-200/90 shadow-xs hover:shadow-md transition space-y-2.5 text-left relative group border-l-4"
                        style={{ borderLeftColor: stage.color }}
                      >
                        {/* Title & Priority & Delete */}
                        <div className="flex justify-between items-start gap-1">
                          <h6 className="text-xs font-extrabold text-gray-900 leading-snug line-clamp-2" title={deal.titulo}>
                            {deal.titulo}
                          </h6>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider border ${priCls}`}>
                              {deal.prioridade || 'Normal'}
                            </span>
                            {onDeleteDeal && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Mover proposta "${deal.titulo}" para a Lixeira?`)) {
                                    onDeleteDeal(deal.id);
                                  }
                                }}
                                className="p-1 text-gray-300 hover:text-red-600 transition cursor-pointer"
                                title="Mover para a Lixeira"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Client Name & Value */}
                        <div className="space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 uppercase truncate">
                            <Building2 size={11} className="text-blue-600 shrink-0" />
                            <span className="truncate">{deal.clienteNome}</span>
                          </div>
                          <span className="text-sm font-black text-[#003366] block leading-tight">
                            {formatCurrency(deal.valor)}
                          </span>
                        </div>

                        {/* Helena IA Predictive Win Score Badge */}
                        {(() => {
                          const iaScore = calculateDealScore(deal, commUser);
                          const scoreBg = iaScore.nivel === 'alta' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                            : iaScore.nivel === 'media' 
                            ? 'bg-amber-50 border-amber-200 text-amber-900' 
                            : 'bg-rose-50 border-rose-200 text-rose-900';
                          const iconClr = iaScore.nivel === 'alta' ? 'text-emerald-600' : iaScore.nivel === 'media' ? 'text-amber-600' : 'text-rose-600';
                          return (
                            <div className={`p-1.5 rounded-lg border text-[10px] flex items-center justify-between transition-colors ${scoreBg}`} title={iaScore.recomendacaoIA}>
                              <div className="flex items-center gap-1 font-bold">
                                <BrainCircuit size={12} className={`${iconClr} shrink-0`} />
                                <span>Helena IA Win Score:</span>
                              </div>
                              <span className="font-extrabold px-1.5 py-0.2 rounded bg-white shadow-2xs text-[10px]">
                                {iaScore.score}%
                              </span>
                            </div>
                          );
                        })()}

                        {/* Clear Negotiation Progress Bar */}
                        <div className="space-y-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                            <span>Estado: <strong className="text-gray-800">Passo {stage.step}/7</strong></span>
                            <span className="text-emerald-700">{Math.round(stage.prob * 100)}% Prob.</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(stage.step / 7) * 100}%`,
                                backgroundColor: stage.color
                              }}
                            />
                          </div>
                        </div>

                        {/* Commercial User Avatar Badge */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <UserAvatar
                            name={deal.comercialNome}
                            foto={commUser?.foto}
                            comerciais={comerciais}
                            size="sm"
                            showName={true}
                            nameClassName="text-[11px] font-bold text-gray-700 truncate max-w-[110px]"
                          />

                          {/* Quick WhatsApp Link Button */}
                          <a
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Olá ${deal.comercialNome.split(' ')[0]}, ponto de situação sobre a proposta "${deal.titulo}" para o cliente ${deal.clienteNome} (${formatCurrency(deal.valor)}).`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Contactar comercial no WhatsApp"
                          >
                            <Phone size={12} />
                          </a>
                        </div>

                        {/* Action Buttons: Move Back / Advance Stage */}
                        <div className="flex justify-between items-center border-t border-gray-100 pt-2 text-[10px] font-bold">
                          <button
                            onClick={() => onMoveDeal(deal.id, -1)}
                            disabled={stage.id === 'lead'}
                            className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
                            title="Recuar Etapa"
                          >
                            <ArrowLeft size={11} /> <span>Voltar</span>
                          </button>

                          <button
                            onClick={() => onMoveDeal(deal.id, 1)}
                            disabled={stage.id === 'fechado' || stage.id === 'producao'}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 font-extrabold"
                            title="Avançar Etapa"
                          >
                            <span>Avançar</span> <ArrowRight size={11} />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* GRAPHICS & FUNNEL ANALYSIS SECTION (Placed at the bottom / Por Baixo) */}
      {showCharts && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5 mt-4">
          
          {/* Section Title Header */}
          <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#003366]" />
                <h5 className="text-sm font-black text-[#003366] uppercase tracking-wider">
                  FLUXO E CONVERSÃO DO FUNIL DE VENDAS
                </h5>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Visão gráfica clara da evolução das oportunidades e distribuição por gestores comerciais.
              </p>
            </div>

            {/* Graphics View Mode Selector */}
            <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl">
              <button
                onClick={() => setChartMode('funnel')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'funnel' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 size={13} /> Funil Sequencial (Etapas 1 a 7)
              </button>

              <button
                onClick={() => setChartMode('commercials')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'commercials' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award size={13} /> Desempenho por Gestor
              </button>

              <button
                onClick={() => setChartMode('kpis')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  chartMode === 'kpis' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PieChart size={13} /> KPIs Executive & Metas
              </button>
            </div>
          </div>

          {/* Chart View 1: Extremely Clear Step-by-step Funnel Progress */}
          {chartMode === 'funnel' && (
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span className="uppercase tracking-wider">FLUXO SEQUENCIAL DE NEGOCIAÇÃO DA CARTEIRA</span>
                <span className="text-[10px] text-gray-400">Total em Jogo: <strong className="text-[#003366]">{formatCurrency(totalPipelineVal)}</strong></span>
              </div>

              {/* Intuitive Step Cards in Sequence */}
              <div className="grid grid-cols-1 gap-3">
                {stageData.map((s) => {
                  const barWidthPct = Math.max((s.val / maxStageVal) * 100, 4);
                  // Find commercials in this stage
                  const stageDeals = filteredDeals.filter(d => d.etapa === s.id);
                  const commNames = Array.from(new Set(stageDeals.map(d => d.comercialNome)));

                  return (
                    <div key={s.id} className="bg-gray-50/90 p-3.5 rounded-2xl border border-gray-200/80 hover:border-blue-300 transition space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        
                        {/* Step Circle & Label */}
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-2xs shrink-0"
                            style={{ backgroundColor: s.color }}
                          >
                            {s.step}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h6 className="text-xs font-black text-gray-900">{s.label}</h6>
                              <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                {s.desc}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Counts & Value */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[10px] font-bold text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                            {s.count} {s.count === 1 ? 'proposta' : 'propostas'}
                          </span>
                          <span className="font-black text-[#003366] text-sm">{formatCurrency(s.val)}</span>
                          <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg">
                            {s.pctVal.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full bg-gray-200/80 h-3.5 rounded-full overflow-hidden p-0.5 flex relative">
                        <div
                          className="h-full rounded-full transition-all duration-700 shadow-2xs flex items-center justify-end pr-2 text-[8px] font-black text-white"
                          style={{
                            width: `${barWidthPct}%`,
                            backgroundColor: s.color,
                          }}
                        >
                          {barWidthPct > 12 && `${s.pctVal.toFixed(0)}%`}
                        </div>
                      </div>

                      {/* Gestores / Commercials with photos */}
                      {commNames.length > 0 && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/60 text-[10px]">
                          <span className="text-gray-500 font-bold">Comerciais nesta fase:</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {commNames.map(cName => {
                              const uObj = comerciais.find(u => u.nome.toLowerCase() === cName.toLowerCase());
                              return (
                                <div key={cName} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                                  <UserAvatar name={cName} foto={uObj?.foto} comerciais={comerciais} size="xs" />
                                  <span className="font-bold text-gray-800 text-[10px]">{cName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart View 2: Commercial Performance Bars with User Photos */}
          {chartMode === 'commercials' && (
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span className="uppercase tracking-wider">DESEMPENHO E VOLUME POR GESTOR COMERCIAL</span>
                <span className="text-[10px] text-gray-400">Total de {Object.keys(commercialMap).length} gestores ativos</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(commercialMap).map(([cName, data]) => {
                  const pct = Math.max((data.total / maxCommercialVal) * 100, 4);
                  const userComm = comerciais.find(u => u.nome.toLowerCase() === cName.toLowerCase());
                  const cPhoto = userComm?.foto;

                  // Get count per stage for this commercial
                  const commDeals = filteredDeals.filter(d => (d.comercialNome || '').toLowerCase() === cName.toLowerCase());

                  return (
                    <div key={cName} className="bg-gray-50 p-4 rounded-2xl border border-gray-100/90 hover:border-blue-200 transition space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Commercial User Photo & Info */}
                        <div className="flex items-center gap-3">
                          <UserAvatar name={cName} foto={cPhoto} comerciais={comerciais} size="lg" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-black text-gray-900 leading-tight">{cName}</h5>
                              <span className="bg-blue-100 text-[#003366] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                {userComm?.funcao || 'Gestor Comercial'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                              {data.count} {data.count === 1 ? 'negócio em carteira' : 'negócios em carteira'}
                            </p>
                          </div>
                        </div>

                        {/* Money Totals */}
                        <div className="text-right">
                          <span className="text-sm font-black text-[#003366] block">{formatCurrency(data.total)}</span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                            Fechados / Concluídos: {formatCurrency(data.fechados)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                          <span>Participação no Pipeline</span>
                          <span className="text-[#003366]">{((data.total / totalPipelineVal) * 100 || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200/80 h-3 rounded-full overflow-hidden p-0.5 flex">
                          <div
                            className="bg-gradient-to-r from-[#003366] via-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Mini Stage Pill Badges for this commercial */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-200/60 text-[10px]">
                        <span className="text-gray-400 font-bold mr-1">Etapas:</span>
                        {stages.map(st => {
                          const count = commDeals.filter(d => d.etapa === st.id).length;
                          if (count === 0) return null;
                          return (
                            <span
                              key={st.id}
                              className="px-2 py-0.5 rounded-full font-extrabold text-white shadow-2xs"
                              style={{ backgroundColor: st.color }}
                            >
                              {st.label}: {count}
                            </span>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart View 3: Distribution Breakdown & Executive KPIs */}
          {chartMode === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <h6 className="text-xs font-extrabold text-[#003366] uppercase">Composição das Etapas do Funil</h6>
                <div className="space-y-2">
                  {stageData.map(st => (
                    <div key={st.id} className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }}></span>
                        <span className="font-bold text-gray-800">{st.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-[#003366]">{formatCurrency(st.val)}</span>
                        <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">{st.pctVal.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <h6 className="text-xs font-extrabold text-[#003366] uppercase">Indicadores de Desempenho e Metas</h6>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-gray-200/60">
                    <span className="text-gray-600 font-semibold">Total de Oportunidades Em Curso</span>
                    <span className="font-black text-[#003366]">{totalCount} propostas</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-gray-200/60">
                    <span className="text-gray-600 font-semibold">Probabilidade Média do Pipeline</span>
                    <span className="font-black text-emerald-600">
                      {totalPipelineVal > 0 ? ((weightedVal / totalPipelineVal) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-gray-200/60">
                    <span className="text-gray-600 font-semibold">Valor em Fase Final (Negociação + Fechado)</span>
                    <span className="font-black text-indigo-700">
                      {formatCurrency(
                        stageData.filter(s => s.id === 'negociacao' || s.id === 'fechado' || s.id === 'producao').reduce((a, b) => a + b.val, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
