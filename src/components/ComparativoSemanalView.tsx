import React, { useMemo, useState } from 'react';
import { Deal, Usuario } from '../types';
import { BarChart3, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { generateDynamicWeeklyTimeline } from '../utils/periodEngine';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface ComparativoSemanalViewProps {
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
  onAddDeal?: (deal: Deal) => void;
  onOpenExcelImport?: () => void;
}

export default function ComparativoSemanalView({
  deals,
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
  onAddDeal,
  onOpenExcelImport
}: ComparativoSemanalViewProps) {
  const [metricTab, setMetricTab] = useState<'proposto' | 'aprovado' | 'propostas'>('proposto');

  // Modal para adicionar proposta / registo manual diretamente no Comparativo Semanal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newValor, setNewValor] = useState('');
  const [newValorAprovado, setNewValorAprovado] = useState('');
  const [newEtapa, setNewEtapa] = useState<'proposta_enviada' | 'negociacao' | 'aprovado' | 'fechado' | 'perdido'>('proposta_enviada');
  const [newComercialId, setNewComercialId] = useState(comerciais[0]?.id || 'u9');
  const [newSemana, setNewSemana] = useState('Esta Semana');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comm = comerciais.find(c => c.id === newComercialId) || comerciais[0] || { id: 'u9', nome: 'David Neto' };
    const valNum = parseFloat(newValor.replace(/\s+/g, '').replace(',', '.')) || 0;
    const valAprovNum = parseFloat(newValorAprovado.replace(/\s+/g, '').replace(',', '.')) || 0;

    const deal: Deal = {
      id: `d_man_${Date.now()}`,
      clienteNome: newClientName || newCompany || 'Cliente Manual',
      empresa: newCompany || newClientName || 'Empresa',
      titulo: newTitle || 'Proposta Comercial Semanal',
      valor: valNum,
      valorAprovado: newEtapa === 'fechado' || newEtapa === 'aprovado' ? (valAprovNum || valNum) : valAprovNum,
      valorPerdido: newEtapa === 'perdido' ? valNum : 0,
      etapa: newEtapa,
      comercialId: comm.id,
      comercialNome: comm.nome,
      prioridade: 'Alta',
      diasAberto: 1,
      semana: newSemana,
      probabilidade: newEtapa === 'fechado' || newEtapa === 'aprovado' ? 100 : 60,
      dataEnvio: new Date().toISOString().split('T')[0]
    };

    if (onAddDeal) {
      onAddDeal(deal);
    }
    setIsAddModalOpen(false);
    setNewClientName('');
    setNewCompany('');
    setNewTitle('');
    setNewValor('');
    setNewValorAprovado('');
  };

  // Dynamic Weekly Timeline generated from real deals data
  const weeklyBuckets = useMemo(() => {
    return generateDynamicWeeklyTimeline(deals, comerciais, new Date());
  }, [deals, comerciais]);

  // Filter buckets that actually have data or are near current date
  const displayBuckets = useMemo(() => {
    const withData = weeklyBuckets.filter(b => b.propostasCount > 0 || b.valorProposto > 0 || b.isCurrentWeek);
    if (withData.length >= 3) return withData;
    return weeklyBuckets.slice(-8);
  }, [weeklyBuckets]);

  // Latest 2 weeks for direct comparison
  const latestTwoWeeks = useMemo(() => {
    if (weeklyBuckets.length >= 2) {
      return {
        penultimate: weeklyBuckets[weeklyBuckets.length - 2],
        ultimate: weeklyBuckets[weeklyBuckets.length - 1]
      };
    }
    return null;
  }, [weeklyBuckets]);

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

  // Recharts dataset
  const chartData = useMemo(() => {
    return displayBuckets.map(b => ({
      week: b.label.split(' (')[0],
      fullLabel: b.label,
      propostas: b.propostasCount,
      valorPropostoM: parseFloat((b.valorProposto / 1000000).toFixed(2)),
      valorAprovadoM: parseFloat((b.valorAprovado / 1000000).toFixed(2)),
      forecastM: parseFloat((b.forecast / 1000000).toFixed(2)),
      status: b.isCurrentWeek ? 'Actual' : b.isFutureWeek ? 'Futura' : 'Passada'
    }));
  }, [displayBuckets]);

  return (
    <div className="w-full space-y-6 font-sans text-gray-900 p-2 sm:p-4">
      
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
          currentViewName="Comparativo Semanal"
        />
      )}

      {/* EXCEL TITLE BANNER */}
      <div className="bg-gradient-to-r from-[#1B365D] via-[#0F2942] to-[#1E3A8A] text-white p-5 rounded-xl shadow-lg border border-[#122442] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-gray-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              DINÂMICO & AUTOMÁTICO
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif text-white">
              EVOLUÇÃO E COMPARATIVO HISTÓRICO SEMANAL
            </h1>
          </div>
          <p className="text-xs text-blue-200 mt-1 flex items-center gap-2 font-medium">
            <Calendar size={14} className="text-amber-400" />
            <span>Atualizado automaticamente com todas as semanas e ficheiros de Excel, Word e PDF</span>
            <span className="text-blue-400">•</span>
            <span className="font-mono text-emerald-300 font-bold">{weeklyBuckets.length} Semanas Mapeadas</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenExcelImport && (
            <button
              onClick={onOpenExcelImport}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              <span>Importar Ficheiro Excel</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-black transition shadow-md cursor-pointer"
          >
            <Layers size={15} />
            <span>+ Adicionar Registo / Oportunidade</span>
          </button>

          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/20 ml-1">
            <button
              onClick={() => setMetricTab('proposto')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${metricTab === 'proposto' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-blue-200 hover:text-white'}`}
            >
              Proposto
            </button>
            <button
              onClick={() => setMetricTab('aprovado')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${metricTab === 'aprovado' ? 'bg-emerald-500 text-white shadow-sm' : 'text-blue-200 hover:text-white'}`}
            >
              Aprovado
            </button>
            <button
              onClick={() => setMetricTab('propostas')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${metricTab === 'propostas' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-200 hover:text-white'}`}
            >
              Nº Propostas
            </button>
          </div>
        </div>
      </div>

      {/* MODAL MANUAL ADICIONAR REGISTO SEMANAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-blue-900/40 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-base font-black text-[#1B365D] uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-500" />
                Adicionar Registo Comercial / Oportunidade Semanal
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Cliente / Nome</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="Ex: Sonangol EP"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Empresa / Razão Social</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    placeholder="Ex: Sonangol Logística"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Título da Proposta / Serviço</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Fornecimento de Equipamentos Tecnológicos"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Valor Proposto (AOA)</label>
                  <input
                    type="text"
                    required
                    value={newValor}
                    onChange={e => setNewValor(e.target.value)}
                    placeholder="Ex: 15.000.000"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Valor Aprovado (AOA)</label>
                  <input
                    type="text"
                    value={newValorAprovado}
                    onChange={e => setNewValorAprovado(e.target.value)}
                    placeholder="Ex: 15.000.000"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Etapa / Estado</label>
                  <select
                    value={newEtapa}
                    onChange={e => setNewEtapa(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="negociacao">Em Negociação</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="fechado">Fechado / Ganho</option>
                    <option value="perdido">Perdido / Recusado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Comercial Responsável</label>
                  <select
                    value={newComercialId}
                    onChange={e => setNewComercialId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {comerciais.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Semana de Atribuição</label>
                <input
                  type="text"
                  value={newSemana}
                  onChange={e => setNewSemana(e.target.value)}
                  placeholder="Ex: Esta Semana ou Semana 33"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#1B365D] to-indigo-900 text-white rounded-lg text-xs font-black shadow-md hover:from-blue-900 hover:to-indigo-950 cursor-pointer"
                >
                  Salvar e Atualizar Semanal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRÁFICO RECHARTS DE TENDÊNCIA HISTÓRICA SEMANAL */}
      <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-900" />
            <h2 className="text-sm font-black uppercase text-[#1B365D] tracking-wide">
              Tendência Evolutiva das Semanas ({displayBuckets.length} Semanas Exibidas)
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-mono font-semibold">Valores em Milhões de AOA / Kz</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 10, fontWeight: 'bold' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F2942', borderRadius: '8px', border: '1px solid #1E3A8A', color: '#FFF', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  name === 'propostas' ? `${val} propostas` : `${val}M AOA`,
                  name === 'valorPropostoM' ? 'Valor Proposto' : name === 'valorAprovadoM' ? 'Receita Aprovada' : name === 'forecastM' ? 'Forecast' : 'Propostas'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {metricTab === 'proposto' && <Bar dataKey="valorPropostoM" name="Valor Proposto (M AOA)" fill="#2563EB" radius={[4, 4, 0, 0]} />}
              {metricTab === 'aprovado' && <Bar dataKey="valorAprovadoM" name="Receita Aprovada (M AOA)" fill="#10B981" radius={[4, 4, 0, 0]} />}
              {metricTab === 'propostas' && <Bar dataKey="propostas" name="Quantidade de Propostas" fill="#F59E0B" radius={[4, 4, 0, 0]} />}
              <Bar dataKey="forecastM" name="Forecast Ponderado (M AOA)" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELA DINÂMICA DE COMPARATIVO SEMANAL COMPLETO */}
      <div className="bg-white border border-gray-300 shadow-md rounded-xl overflow-hidden">
        <div className="bg-[#1B365D] text-white p-3.5 flex items-center justify-between">
          <span className="text-xs md:text-sm font-black font-serif uppercase tracking-wider">
            📋 Tabela Consolidada de Comparativo Histórico Semanal (Dinâmica)
          </span>
          <span className="text-[11px] text-blue-200 font-mono font-semibold">
            Todas as Semanas Registadas no Sistema
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-white uppercase text-[10px] tracking-wider border-b border-slate-700">
                <th className="p-3 font-bold border-r border-slate-700">Indicador CRM</th>
                {displayBuckets.map((b) => (
                  <th
                    key={b.weekKey}
                    className={`p-2.5 text-center font-bold border-r border-slate-700 ${
                      b.isCurrentWeek ? 'bg-emerald-700 text-white font-black' : b.isFutureWeek ? 'bg-purple-900 text-purple-100' : ''
                    }`}
                  >
                    <div>{b.label.split(' (')[0]}</div>
                    <span className="text-[9px] text-slate-300 font-normal font-mono block">
                      {b.isCurrentWeek ? 'ESTA SEMANA' : b.isFutureWeek ? 'FUTURA' : 'PASSADA'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-900">
              
              {/* Linha 1: N.º de Propostas */}
              <tr className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">N.º de propostas</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-center font-mono font-bold border-r border-gray-200">
                    {b.propostasCount}
                  </td>
                ))}
              </tr>

              {/* Linha 2: Valor Total Proposto */}
              <tr className="hover:bg-blue-50/50 transition-colors bg-blue-50/20">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">Valor total proposto</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-right font-mono font-bold text-blue-900 border-r border-gray-200">
                    {formatShortKz(b.valorProposto)}
                  </td>
                ))}
              </tr>

              {/* Linha 3: Valor Aprovado */}
              <tr className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">Valor aprovado / ganho</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-right font-mono font-bold text-emerald-700 border-r border-gray-200">
                    {formatShortKz(b.valorAprovado)}
                  </td>
                ))}
              </tr>

              {/* Linha 4: Valor Perdido */}
              <tr className="hover:bg-blue-50/50 transition-colors bg-slate-50/50">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">Valor perdido / recusado</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-right font-mono text-rose-600 border-r border-gray-200">
                    {formatShortKz(b.valorPerdido)}
                  </td>
                ))}
              </tr>

              {/* Linha 5: Forecast Ponderado */}
              <tr className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">Forecast ponderado</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-right font-mono font-bold text-amber-700 border-r border-gray-200">
                    {formatShortKz(b.forecast)}
                  </td>
                ))}
              </tr>

              {/* Linha 6: Taxa de Conversão */}
              <tr className="hover:bg-blue-50/50 transition-colors bg-blue-50/20">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-50">Taxa de conversão (%)</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-center font-mono font-bold text-blue-950 border-r border-gray-200">
                    {b.conversaoPct.toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* Linha 7: Variação % vs Semana Anterior */}
              <tr className="hover:bg-blue-50/50 transition-colors bg-slate-100">
                <td className="p-3 font-bold text-gray-900 border-r border-gray-200 bg-slate-200">Variação % Aprovado</td>
                {displayBuckets.map((b) => (
                  <td key={b.weekKey} className="p-2.5 text-center font-mono font-bold border-r border-gray-200">
                    <span className={b.variacaoAprovadoPct >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {b.variacaoAprovadoPct >= 0 ? `+${b.variacaoAprovadoPct.toFixed(1)}%` : `${b.variacaoAprovadoPct.toFixed(1)}%`}
                    </span>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* CAMPO EXCLUSIVO DE COMPARATIVO DAS DUAS ÚLTIMAS SEMANAS */}
      {latestTwoWeeks && (
        <div className="bg-gradient-to-r from-[#1B365D] to-[#0F2342] text-white p-5 rounded-xl border border-[#122442] shadow-lg font-sans space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-blue-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-gray-950 font-black px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                CAMPO EXCLUSIVO
              </span>
              <h3 className="text-base md:text-lg font-black tracking-wide uppercase font-serif text-amber-300">
                COMPARATIVO DIRETO DAS DUAS ÚLTIMAS SEMANAS
              </h3>
            </div>
            <span className="text-xs text-blue-200 font-mono">
              {latestTwoWeeks.penultimate.label} vs {latestTwoWeeks.ultimate.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-950/60 p-3.5 rounded-lg border border-blue-700/50 shadow-inner">
              <span className="text-[10px] font-bold text-blue-300 uppercase block mb-1">
                Volume de Propostas
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-gray-300">Penúltima: {latestTwoWeeks.penultimate.propostasCount}</span>
                <span className="text-base font-black text-amber-300">Última: {latestTwoWeeks.ultimate.propostasCount}</span>
              </div>
            </div>

            <div className="bg-blue-950/60 p-3.5 rounded-lg border border-blue-700/50 shadow-inner">
              <span className="text-[10px] font-bold text-blue-300 uppercase block mb-1">
                Valor Total Proposto
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-gray-300">Penúltima: {formatShortKz(latestTwoWeeks.penultimate.valorProposto)}</span>
                <span className="text-base font-black text-blue-200">Última: {formatShortKz(latestTwoWeeks.ultimate.valorProposto)}</span>
              </div>
            </div>

            <div className="bg-blue-950/60 p-3.5 rounded-lg border border-blue-700/50 shadow-inner">
              <span className="text-[10px] font-bold text-blue-300 uppercase block mb-1">
                Receita Aprovada
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-gray-300">Penúltima: {formatShortKz(latestTwoWeeks.penultimate.valorAprovado)}</span>
                <span className="text-base font-black text-emerald-400">Última: {formatShortKz(latestTwoWeeks.ultimate.valorAprovado)}</span>
              </div>
            </div>

            <div className="bg-blue-950/60 p-3.5 rounded-lg border border-blue-700/50 shadow-inner">
              <span className="text-[10px] font-bold text-blue-300 uppercase block mb-1">
                Forecast Ponderado
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-gray-300">Penúltima: {formatShortKz(latestTwoWeeks.penultimate.forecast)}</span>
                <span className="text-base font-black text-purple-300">Última: {formatShortKz(latestTwoWeeks.ultimate.forecast)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
