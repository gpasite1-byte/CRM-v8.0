import React, { useState, useEffect, useMemo } from 'react';
import { Usuario, Deal } from '../types';
import { Target, Flag, TrendingUp, Award, Trophy, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Calculator, HelpCircle, Layers, PieChart } from 'lucide-react';
import UserAvatar from './UserAvatar';
import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface MetasPerformanceViewProps {
  comerciais: Usuario[];
  deals: Deal[];
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

export default function MetasPerformanceView({
  comerciais,
  deals = [],
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
}: MetasPerformanceViewProps) {
  const [selectedComId, setSelectedComId] = useState('');
  const [simulValue, setSimulValue] = useState(6250000);

  useEffect(() => {
    const defaultCom = comerciais.find(u => u.perfil === 'comercial');
    if (defaultCom && !selectedComId) {
      setSelectedComId(defaultCom.id);
    }
  }, [comerciais]);

  // Official Metas e Performance data matching the Excel file screenshot exactly
  const officialRows = [
    {
      comercial: 'Amélia Cassinda',
      funcao: 'Sénior',
      metaSemanal: '6 250 000,00 AOA',
      propostas: '6,00 AOA',
      valorTotal: '51 919 142,50 AOA',
      aprovado: '4 363 350,00 AOA',
      percentMeta: '70%',
      pipelineAberto: '47 555 792,50 AOA',
      forecast: '24 810 510,25 AOA',
      leitura: 'Acelerar fecho'
    },
    {
      comercial: 'David Guedes',
      funcao: 'Comercial',
      metaSemanal: '3 750 000,00 AOA',
      propostas: '5,00 AOA',
      valorTotal: '8 261 979,00 AOA',
      aprovado: '0,00 AOA',
      percentMeta: '0%',
      pipelineAberto: '8 261 979,00 AOA',
      forecast: '3 814 018,20 AOA',
      leitura: 'Intervenção comercial necessária'
    },
    {
      comercial: 'Fernando Leite',
      funcao: 'Comercial',
      metaSemanal: '2 500 000,00 AOA',
      propostas: '3,00 AOA',
      valorTotal: '14 915 475,00 AOA',
      aprovado: '444 600,00 AOA',
      percentMeta: '18%',
      pipelineAberto: '6 002 100,00 AOA',
      forecast: '2 845 440,00 AOA',
      leitura: 'Intervenção comercial necessária'
    },
    {
      comercial: 'Ilídio Pedro',
      funcao: 'Comercial',
      metaSemanal: '2 500 000,00 AOA',
      propostas: '3,00 AOA',
      valorTotal: '11 220 450,00 AOA',
      aprovado: '7 977 150,00 AOA',
      percentMeta: '319%',
      pipelineAberto: '0,00 AOA',
      forecast: '7 977 150,00 AOA',
      leitura: 'Meta atingida'
    },
    {
      comercial: 'José Neto',
      funcao: 'Sénior',
      metaSemanal: '5 000 000,00 AOA',
      propostas: '3,00 AOA',
      valorTotal: '4 794 498,00 AOA',
      aprovado: '0,00 AOA',
      percentMeta: '0%',
      pipelineAberto: '4 794 498,00 AOA',
      forecast: '1 917 799,20 AOA',
      leitura: 'Intervenção comercial necessária'
    },
    {
      comercial: 'Luísa Baltazar',
      funcao: 'Sénior EDGE',
      metaSemanal: '7 500 000,00 AOA',
      propostas: '7,00 AOA',
      valorTotal: '153 045 150,00 AOA',
      aprovado: '4 150 700,00 AOA',
      percentMeta: '55%',
      pipelineAberto: '148 894 450,00 AOA',
      forecast: '68 137 380,00 AOA',
      leitura: 'Intervenção comercial necessária'
    },
    {
      comercial: 'Marta de Oliveira',
      funcao: 'Sénior',
      metaSemanal: '6 250 000,00 AOA',
      propostas: '5,00 AOA',
      valorTotal: '19 293 737,00 AOA',
      aprovado: '9 826 550,00 AOA',
      percentMeta: '157%',
      pipelineAberto: '9 467 187,00 AOA',
      forecast: '13 613 424,80 AOA',
      leitura: 'Meta atingida'
    }
  ];

  // Dynamic calculations incorporating ALL commercials from the system and their active deals
  const dynamicRows = useMemo(() => {
    // Include all sales team members
    const salesUsers = comerciais.filter(u => 
      u.perfil === 'comercial' || (u.perfil === 'admin' && (u.metaSemanal > 0 || u.nome.includes('David Neto')))
    );

    return salesUsers.map(comUser => {
      const official = officialRows.find(r => 
        r.comercial.toLowerCase().includes(comUser.nome.toLowerCase()) || 
        comUser.nome.toLowerCase().includes(r.comercial.toLowerCase())
      );

      // Deals associated with this commercial
      const userDeals = deals.filter(d => 
        d.comercialId === comUser.id || 
        (d.comercialNome && d.comercialNome.toLowerCase().includes(comUser.nome.toLowerCase())) ||
        (comUser.nome && comUser.nome.toLowerCase().includes((d.comercialNome || '').toLowerCase()))
      );

      const userWonDeals = userDeals.filter(d => d.etapa === 'fechado' || d.etapa === 'producao' || d.etapa === 'ganho');
      const userOpenDeals = userDeals.filter(d => d.etapa !== 'fechado' && d.etapa !== 'producao' && d.etapa !== 'perdido' && d.etapa !== 'ganho');

      const dealsTotalVal = userDeals.reduce((sum, d) => sum + (d.valor || 0), 0);
      const dealsAprovadoVal = userWonDeals.reduce((sum, d) => sum + (d.valor || 0), 0);

      const baseMetaNum = comUser.metaSemanal || (official ? parseFloat(official.metaSemanal.replace(/[^0-9,]/g, '').replace(',', '.')) : 5000000);
      const baseTotalVal = official ? parseFloat(official.valorTotal.replace(/[^0-9,]/g, '').replace(',', '.')) : 0;
      const baseAprovadoVal = official ? parseFloat(official.aprovado.replace(/[^0-9,]/g, '').replace(',', '.')) : 0;
      const basePropostasCount = official ? parseInt(official.propostas.replace(/[^0-9]/g, '')) : 0;

      const finalTotalVal = Math.max(baseTotalVal, dealsTotalVal);
      const finalAprovadoVal = Math.max(baseAprovadoVal, dealsAprovadoVal);
      const finalPropostasCount = Math.max(basePropostasCount, userDeals.length);
      const finalOpenVal = Math.max(0, finalTotalVal - finalAprovadoVal);
      const finalForecastVal = finalAprovadoVal + (finalOpenVal * (comUser.pesoConversao || 0.4));

      const pctMetaNum = baseMetaNum > 0 ? Math.round((finalAprovadoVal / baseMetaNum) * 100) : 0;
      
      let leitura = 'Intervenção comercial necessária';
      if (pctMetaNum >= 100) {
        leitura = 'Meta atingida';
      } else if (pctMetaNum >= 50) {
        leitura = 'Acelerar fecho';
      }

      return {
        comercial: comUser.nome,
        funcao: comUser.funcao || 'Comercial',
        metaSemanal: `${new Intl.NumberFormat('pt-AO').format(baseMetaNum)} AOA`,
        propostas: `${finalPropostasCount}`,
        valorTotal: `${new Intl.NumberFormat('pt-AO').format(finalTotalVal)} AOA`,
        aprovado: `${new Intl.NumberFormat('pt-AO').format(finalAprovadoVal)} AOA`,
        percentMeta: `${pctMetaNum}%`,
        pipelineAberto: `${new Intl.NumberFormat('pt-AO').format(finalOpenVal)} AOA`,
        forecast: `${new Intl.NumberFormat('pt-AO').format(Math.round(finalForecastVal))} AOA`,
        leitura,
        aprovadoDisplay: `${new Intl.NumberFormat('pt-AO').format(finalAprovadoVal)} AOA`,
        percentMetaDisplay: `${pctMetaNum}%`,
        numericPct: pctMetaNum,
        comUser
      };
    });
  }, [comerciais, deals]);

  // Dynamic ranking for the Top 3 Podium
  const sortedLeaders = [...dynamicRows].sort((a, b) => b.numericPct - a.numericPct);
  const leader1 = sortedLeaders[0] || dynamicRows[3]; // Ilídio
  const leader2 = sortedLeaders[1] || dynamicRows[6]; // Marta
  const leader3 = sortedLeaders[2] || dynamicRows[0]; // Amélia

  // Commission Simulator Logic
  const selectedCom = comerciais.find(u => u.id === selectedComId);
  const metaSemanal = selectedCom?.metaSemanal || 0;
  
  const baseComissao = simulValue * 0.03;
  const isTargetHit = simulValue >= metaSemanal;
  const valorSemIva = simulValue / 1.14; // excludes 14% VAT
  const bonusAtingimento = isTargetHit ? (valorSemIva * 0.03) : 0;
  const totalReceber = baseComissao + bonusAtingimento;

  const formatKz = (v: number) => {
    return new Intl.NumberFormat('pt-AO').format(Math.round(v)) + ' AOA';
  };

  return (
    <div className="space-y-6 w-full my-2 font-serif">
      
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
          currentViewName="Metas & Performance"
        />
      )}

      {/* Excel Title Banner */}
      <div className="bg-[#1B365D] text-white text-center py-3 px-4 rounded-t-sm shadow-sm border border-[#122442]">
        <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase">
          METAS E PERFORMANCE POR COMERCIAL – SEMANA FINDA
        </h2>
      </div>

      {/* Metas and Performance table - Glassmorphic Theme */}
      <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-b-xl shadow-2xl overflow-x-auto -mt-8">
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-900 text-cyan-300 border-b border-cyan-500/30">
              <th className="px-3.5 py-3 font-bold border-r border-slate-800">Comercial</th>
              <th className="px-3.5 py-3 font-bold text-center border-r border-slate-800">Função</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Meta semanal</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Propostas</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Valor total</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Aprovado</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">% Meta</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Pipeline aberto</th>
              <th className="px-3.5 py-3 font-bold text-right border-r border-slate-800">Forecast</th>
              <th className="px-3.5 py-3 font-bold border-slate-800">Leitura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans text-slate-200">
            {dynamicRows.map((row, idx) => {
              const numericPct = row.numericPct;
              const barWidth = Math.min(100, numericPct);

              return (
                <tr key={idx} className="hover:bg-cyan-500/10 transition-colors">
                  <td className="px-3.5 py-3 font-semibold text-white border-r border-slate-800">
                    <UserAvatar name={row.comercial} comerciais={comerciais} size="sm" showName={true} nameClassName="font-bold text-white text-xs ml-1" />
                  </td>
                  <td className="px-3.5 py-3 text-slate-300 border-r border-slate-800 text-center">
                    {row.funcao}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-300 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.metaSemanal}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-300 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.propostas}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-300 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.valorTotal}
                  </td>
                  <td className="px-3.5 py-3 text-right font-bold text-emerald-400 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.aprovadoDisplay}
                  </td>
                  <td className="px-3.5 py-3 text-right font-black text-cyan-300 border-r border-slate-800 relative overflow-hidden font-mono">
                    {barWidth > 0 && (
                      <div 
                        className="absolute inset-y-1 left-1 bg-gradient-to-r from-teal-500/40 via-emerald-500/50 to-cyan-500/60 rounded-xs"
                        style={{ width: `calc(${barWidth}% - 8px)` }}
                      />
                    )}
                    <span className="relative z-10">{row.percentMetaDisplay}</span>
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-300 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.pipelineAberto}
                  </td>
                  <td className="px-3.5 py-3 text-right font-bold text-cyan-200 border-r border-slate-800 whitespace-nowrap font-mono">
                    {row.forecast}
                  </td>
                  <td className="px-3.5 py-3 font-semibold text-amber-300 whitespace-nowrap">
                    {row.numericPct >= 100 ? 'Meta atingida 🏆' : row.leitura}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top Ranking Podium (Bento styled cards with large visible user photos) */}
      <div className="space-y-4 pt-4 font-sans">
        <h4 className="text-base font-black text-[#003366] uppercase tracking-wider flex items-center gap-2">
          <Trophy size={22} className="text-amber-500" /> Líderes de Vendas (Podium)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1st Place */}
          <div className="rounded-2xl border-2 p-6 shadow-md text-center flex flex-col items-center justify-between bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50/40 border-yellow-300 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-amber-500 text-white font-black text-sm shadow-md flex items-center justify-center border-2 border-white uppercase tracking-widest z-10">
              1º
            </div>
            <div className="mt-2 flex flex-col items-center gap-2.5 w-full">
              <div className="ring-4 ring-amber-400 ring-offset-2 rounded-full p-1 shadow-md bg-white">
                <UserAvatar name={leader1.comercial} comerciais={comerciais} size="xl" />
              </div>
              <h5 className="text-base font-black text-gray-900 mt-1">{leader1.comercial}</h5>
              <span className="text-xs text-amber-900 bg-amber-200/80 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">{leader1.funcao}</span>
            </div>
            <div className="w-full mt-5 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] text-gray-500 font-extrabold block uppercase tracking-wider">Meta Semanal Atingida</span>
              <h3 className="text-2xl font-black mt-0.5 text-emerald-600">
                {leader1.percentMetaDisplay}
              </h3>
            </div>
          </div>

          {/* 2nd Place */}
          <div className="rounded-2xl border-2 p-6 shadow-md text-center flex flex-col items-center justify-between bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100/60 border-slate-300 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-500 text-white font-black text-sm shadow-md flex items-center justify-center border-2 border-white uppercase tracking-widest z-10">
              2º
            </div>
            <div className="mt-2 flex flex-col items-center gap-2.5 w-full">
              <div className="ring-4 ring-slate-300 ring-offset-2 rounded-full p-1 shadow-md bg-white">
                <UserAvatar name={leader2.comercial} comerciais={comerciais} size="xl" />
              </div>
              <h5 className="text-base font-black text-gray-900 mt-1">{leader2.comercial}</h5>
              <span className="text-xs text-slate-800 bg-slate-200/80 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">{leader2.funcao}</span>
            </div>
            <div className="w-full mt-5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] text-gray-500 font-extrabold block uppercase tracking-wider">Meta Semanal Atingida</span>
              <h3 className="text-2xl font-black mt-0.5 text-emerald-600">
                {leader2.percentMetaDisplay}
              </h3>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="rounded-2xl border-2 p-6 shadow-md text-center flex flex-col items-center justify-between bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-amber-100/20 border-amber-200/60 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-amber-700 text-white font-black text-sm shadow-md flex items-center justify-center border-2 border-white uppercase tracking-widest z-10">
              3º
            </div>
            <div className="mt-2 flex flex-col items-center gap-2.5 w-full">
              <div className="ring-4 ring-amber-600/50 ring-offset-2 rounded-full p-1 shadow-md bg-white">
                <UserAvatar name={leader3.comercial} comerciais={comerciais} size="xl" />
              </div>
              <h5 className="text-base font-black text-gray-900 mt-1">{leader3.comercial}</h5>
              <span className="text-xs text-amber-950 bg-amber-100 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">{leader3.funcao}</span>
            </div>
            <div className="w-full mt-5 bg-white/90 backdrop-blur-sm border border-amber-200/60 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] text-gray-500 font-extrabold block uppercase tracking-wider">Meta Semanal Atingida</span>
              <h3 className="text-2xl font-black mt-0.5 text-[#003366]">
                {leader3.percentMetaDisplay}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Simulator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 font-sans">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Calculator size={18} className="text-[#0A84FF]" />
          <div>
            <h4 className="text-sm font-extrabold text-[#003366] uppercase tracking-wide">Simulador de Comissões GPA</h4>
            <p className="text-[11px] text-gray-400 mt-0.5 font-semibold">Simule faturamentos aprovados para prever os ganhos reais e bónus corporativos da sua carteira comercial.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Simulator Inputs */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-gray-600 uppercase">Gestor Comercial para Simulação</label>
              <select
                value={selectedComId}
                onChange={(e) => setSelectedComId(e.target.value)}
                className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 w-full"
              >
                {comerciais.filter(u => u.perfil === 'comercial').map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Meta Semanal do Gestor Comercial</span>
              <h3 className="text-lg font-black text-[#003366] mt-1">{formatKz(metaSemanal)}</h3>
            </div>
          </div>

          {/* Slider and Outputs */}
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-600 uppercase">Volume de Vendas Aprovado</span>
                <span className="text-[#0A84FF] font-extrabold">{formatKz(simulValue)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30000000"
                step="250000"
                value={simulValue}
                onChange={(e) => setSimulValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                <span>0 AOA</span>
                <span>15M AOA</span>
                <span>30M AOA</span>
              </div>
            </div>

            {/* Calculations Blocks */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Comissão Base (3%)</span>
                <h4 className="text-sm font-extrabold text-[#003366] mt-1">{formatKz(baseComissao)}</h4>
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-xl p-3.5 text-center relative">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Bónus Atingimento (3%)</span>
                <h4 className="text-sm font-extrabold text-emerald-600 mt-1">{formatKz(bonusAtingimento)}</h4>
                {isTargetHit ? (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Meta atingida! Bónus ativo."></span>
                ) : (
                  <span className="text-[8px] text-red-500 font-extrabold block mt-0.5 uppercase">Abaixo da Meta</span>
                )}
              </div>

              <div className="bg-[#003366] rounded-xl p-3.5 text-center text-white">
                <span className="text-[10px] text-white/50 font-bold block uppercase">Total Estimado</span>
                <h4 className="text-sm font-black mt-1">{formatKz(totalReceber)}</h4>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium italic mt-2">
              * Nota: O Bónus de Atingimento de 3% é calculado deduzindo-se a taxa padrão de IVA Angolano de 14% ({formatKz(valorSemIva)} base tributável) e apenas é creditado se o faturamento aprovado for igual ou superior à meta semanal do gestor comercial.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
