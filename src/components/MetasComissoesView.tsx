import React, { useState } from 'react';
import { Usuario, Deal, MetaComercialDef } from '../types';
import { Target, Award, TrendingUp, DollarSign, Users, ChevronUp, ChevronDown, Percent, Sparkles, CheckCircle2, ShieldCheck, PieChart, BarChart3, Trophy, Calendar } from 'lucide-react';
import UserAvatar from './UserAvatar';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface MetasComissoesViewProps {
  comerciais: Usuario[];
  deals: Deal[];
  loggedUser: Usuario;
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
  onUpdateMetaUser?: (userId: string, metaMensal: number, comissao: number) => void;
}

export default function MetasComissoesView({
  comerciais,
  deals,
  loggedUser,
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
  onUpdateMetaUser
}: MetasComissoesViewProps) {
  const currentMonthStr = new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState('Julho 2026');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempMetaKz, setTempMetaKz] = useState<number>(15000000);
  const [tempComissaoPct, setTempComissaoPct] = useState<number>(5);

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val).replace('AOA', 'Kz');
  };

  // Filter out administrators and secret managers (Admin, Admin1A, Admin2v, etc.)
  const salesComerciais = comerciais.filter(u => {
    const n = u.nome.trim().toLowerCase();
    return u.perfil !== 'admin' && !n.includes('admin') && n !== 'admin1a' && n !== 'admin2v';
  });

  // Calculate actual sales per commercial (won deals)
  const statsPerCommercial = salesComerciais.map(u => {
    const userDeals = deals.filter(d =>
      d.comercialNome.toLowerCase() === u.nome.toLowerCase() ||
      d.comercialId === u.id
    );

    const fechadosGanhos = userDeals.filter(d => d.etapa === 'fechado' || d.etapa === 'producao');
    const valorGanhoTotal = fechadosGanhos.reduce((sum, d) => sum + (d.valorAprovado || d.valor || 0), 0);

    const pipelineAtivo = userDeals.filter(d => d.etapa !== 'fechado' && d.etapa !== 'producao' && d.etapa !== 'perdido');
    const valorPipelineAtivo = pipelineAtivo.reduce((sum, d) => sum + (d.valor || 0), 0);

    const metaKz = u.metaMensal || 15000000;
    const comissaoPct = u.comissao || 5;

    const pctCumprimento = Math.min(Math.round((valorGanhoTotal / metaKz) * 100), 200);
    const comissaoGanhaKz = (valorGanhoTotal * comissaoPct) / 100;
    const comissaoProjetadaKz = ((valorGanhoTotal + (valorPipelineAtivo * 0.5)) * comissaoPct) / 100;

    return {
      usuario: u,
      metaKz,
      comissaoPct,
      valorGanhoTotal,
      valorPipelineAtivo,
      pctCumprimento,
      comissaoGanhaKz,
      comissaoProjetadaKz,
      qtdFechados: fechadosGanhos.length
    };
  }).sort((a, b) => b.valorGanhoTotal - a.valorGanhoTotal);

  const totalMetaEquipa = statsPerCommercial.reduce((sum, s) => sum + s.metaKz, 0);
  const totalFaturadoEquipa = statsPerCommercial.reduce((sum, s) => sum + s.valorGanhoTotal, 0);
  const totalComissoesGanha = statsPerCommercial.reduce((sum, s) => sum + s.comissaoGanhaKz, 0);
  const pctGlobalEquipa = totalMetaEquipa > 0 ? Math.round((totalFaturadoEquipa / totalMetaEquipa) * 100) : 0;

  const handleStartEdit = (item: typeof statsPerCommercial[0]) => {
    setEditingUserId(item.usuario.id);
    setTempMetaKz(item.metaKz);
    setTempComissaoPct(item.comissaoPct);
  };

  const handleSaveEdit = (userId: string) => {
    if (onUpdateMetaUser) {
      onUpdateMetaUser(userId, tempMetaKz, tempComissaoPct);
    }
    setEditingUserId(null);
  };

  return (
    <div className="space-y-6 font-sans text-gray-900">
      
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
          currentViewName="Metas & Comissões (AOA)"
        />
      )}

      {/* Header Banner */}
      <div className="bg-[#1B365D] text-white rounded-xl p-5 shadow-sm border border-blue-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-400/30 text-amber-400">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-serif uppercase tracking-wider">
                Gestão de Objetivos, Metas Mensais & Comissões
              </h2>
              <span className="bg-amber-400 text-gray-950 font-mono text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {currentMonthStr}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Acompanhamento do desempenho de vendas individual e da equipa comercial GPA Angola em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Team Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Meta Global da Equipa</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-black font-mono text-[#1B365D]">{formatKz(totalMetaEquipa)}</p>
          <p className="text-[11px] text-gray-500">Objetivo total para {salesComerciais.length} comerciais</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Faturação Atual Realizada</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black font-mono text-emerald-700">{formatKz(totalFaturadoEquipa)}</p>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-emerald-600 font-mono">{pctGlobalEquipa}%</span>
            <span className="text-gray-400">da meta global atingida</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total de Comissões Ganhas</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black font-mono text-amber-600">{formatKz(totalComissoesGanha)}</p>
          <p className="text-[11px] text-gray-500">Valor acumulado para pagamento aos comerciais</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Líder do Ranking</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-extrabold text-gray-900 truncate">
            {statsPerCommercial[0]?.usuario.nome || 'N/A'}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold font-mono">
            {statsPerCommercial[0] ? `${formatKz(statsPerCommercial[0].valorGanhoTotal)} (${statsPerCommercial[0].pctCumprimento}%)` : 'Sem vendas'}
          </p>
        </div>

      </div>

      {/* Individual Commercial Performance Cards & Targets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1B365D]" />
            <h3 className="text-sm font-extrabold text-[#1B365D] uppercase tracking-wider font-serif">
              Desempenho Individual de Metas & Comissões
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Valores atualizados automaticamente com base em negócios 'Fechado Ganho'
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {statsPerCommercial.map((item, index) => {
            const isTop3 = index < 3;
            const rankBadge = index === 0 ? '🥇 1º Lugar' : index === 1 ? '🥈 2º Lugar' : index === 2 ? '🥉 3º Lugar' : `#${index + 1}`;
            const isEditing = editingUserId === item.usuario.id;

            let barColor = 'bg-red-500';
            if (item.pctCumprimento >= 100) barColor = 'bg-emerald-500';
            else if (item.pctCumprimento >= 70) barColor = 'bg-blue-500';
            else if (item.pctCumprimento >= 40) barColor = 'bg-amber-500';

            return (
              <div key={item.usuario.id} className="p-4 hover:bg-gray-50/80 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  
                  {/* User Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-md font-mono ${
                      index === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rankBadge}
                    </span>

                    <div className="ring-2 ring-blue-500/30 rounded-full p-0.5 bg-white shadow-xs">
                      <UserAvatar name={item.usuario.nome} foto={item.usuario.foto} size="lg" />
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                        {item.usuario.nome}
                        {item.pctCumprimento >= 100 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Meta Atingida!
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.usuario.funcao || 'Consultor Comercial'} | Taxa Comissão: <strong>{item.comissaoPct}%</strong>
                      </p>
                    </div>
                  </div>

                  {/* Numbers Breakdown */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase">Meta Mensal</span>
                      <span className="font-mono font-bold text-gray-900">{formatKz(item.metaKz)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase">Faturação Ganha</span>
                      <span className="font-mono font-bold text-emerald-600">{formatKz(item.valorGanhoTotal)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase">Comissão Ganha</span>
                      <span className="font-mono font-black text-amber-600">{formatKz(item.comissaoGanhaKz)}</span>
                    </div>

                    {loggedUser.perfil === 'admin' && (
                      <button
                        onClick={() => isEditing ? handleSaveEdit(item.usuario.id) : handleStartEdit(item)}
                        className={`text-xs font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                          isEditing
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isEditing ? 'Guardar Meta' : 'Ajustar Meta'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Editing for Admin */}
                {isEditing && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Nova Meta Mensal (Kz):</label>
                      <input
                        type="number"
                        step="1000000"
                        value={tempMetaKz}
                        onChange={(e) => setTempMetaKz(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Percentual de Comissão (%):</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="30"
                        value={tempComissaoPct}
                        onChange={(e) => setTempComissaoPct(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-600 font-medium">Progresso em relação ao objetivo:</span>
                    <span className="font-bold font-mono text-gray-900">{item.pctCumprimento}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(item.pctCumprimento, 100)}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
