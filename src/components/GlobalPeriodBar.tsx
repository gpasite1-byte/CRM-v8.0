/**
 * GlobalPeriodBar - Unified Period & Filter Selector
 * Synchronized across ALL 13 Views of GPA ANGOLA CRM v8.0 PRO
 */

import React from 'react';
import { Calendar, Filter, Building2, UserCheck, MapPin, RefreshCw, Clock, Layers, Sparkles } from 'lucide-react';
import { Usuario } from '../types';
import { PeriodType } from '../utils/periodEngine';
import { getCurrentDateFormatted } from '../utils/temporalEngine';

interface GlobalPeriodBarProps {
  refDate: Date;
  onRefDateChange: (newDate: Date) => void;
  periodType: PeriodType;
  onPeriodTypeChange: (newPeriod: PeriodType) => void;
  comerciais: Usuario[];
  selectedComercial: string;
  onComercialChange: (comercialId: string) => void;
  selectedEmpresa: string;
  onEmpresaChange: (empresa: string) => void;
  selectedProvincia: string;
  onProvinciaChange: (provincia: string) => void;
  currentViewName?: string;
}

export const GlobalPeriodBar: React.FC<GlobalPeriodBarProps> = ({
  refDate,
  onRefDateChange,
  periodType,
  onPeriodTypeChange,
  comerciais,
  selectedComercial,
  onComercialChange,
  selectedEmpresa,
  onEmpresaChange,
  selectedProvincia,
  onProvinciaChange,
  currentViewName
}) => {
  const safeDate = (refDate instanceof Date && !isNaN(refDate.getTime())) ? refDate : new Date();
  const formattedRefDate = safeDate.toISOString().split('T')[0];

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const parts = val.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          onRefDateChange(d);
        }
      }
    }
  };

  const handleResetFilters = () => {
    onRefDateChange(new Date());
    onPeriodTypeChange('esta_semana');
    onComercialChange('todos');
    onEmpresaChange('todas');
    onProvinciaChange('todas');
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-lg border border-cyan-500/20 mb-6 space-y-3 transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 rounded-lg border border-cyan-400/30 text-cyan-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Motor de Períodos Globais & Filtros</span>
              <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Ativo nas 13 Views
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {currentViewName ? `${currentViewName} — ` : ''}
              <span className="text-cyan-200">{getCurrentDateFormatted(refDate)}</span>
            </h3>
          </div>
        </div>

        <button
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm"
          title="Repor filtros e voltar ao dia actual"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Repor Referência
        </button>
      </div>

      {/* FILTROS INTEGRADOS — PERÍODO EM ANÁLISE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* DATA DE REFERÊNCIA */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" /> Data Referência
          </label>
          <input
            type="date"
            value={formattedRefDate}
            onChange={handleDateInputChange}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* PERÍODO EM ANÁLISE */}
        <div>
          <label className="block text-[11px] font-semibold text-cyan-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400 animate-spin-slow" /> Período em Análise
          </label>
          <select
            value={periodType}
            onChange={(e) => onPeriodTypeChange(e.target.value as PeriodType)}
            className="w-full bg-cyan-950/40 border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-bold text-cyan-200 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="esta_semana">Esta Semana (Seg–Sexta)</option>
            <option value="semana_anterior">Semana Anterior</option>
            <option value="ultimas_2_semanas">Últimas 2 Semanas</option>
            <option value="este_mes">Este Mês</option>
            <option value="mes_anterior">Mês Anterior</option>
            <option value="ultimos_30_dias">Últimos 30 Dias</option>
            <option value="este_trimestre">Este Trimestre</option>
            <option value="este_ano">Este Ano (2026–2036)</option>
          </select>
        </div>

        {/* EMPRESA DO GRUPO */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-blue-400" /> Empresa do Grupo
          </label>
          <select
            value={selectedEmpresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            <option value="todas">Todas as Empresas</option>
            <option value="GPA Angola">GPA Angola</option>
            <option value="GPA Soluções">GPA Soluções</option>
            <option value="Carangola">Carangola</option>
          </select>
        </div>

        {/* GESTOR COMERCIAL */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-purple-400" /> Gestor Comercial
          </label>
          <select
            value={selectedComercial}
            onChange={(e) => onComercialChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            <option value="todos">Todos os Comerciais</option>
            {comerciais.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* PROVÍNCIA */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" /> Província
          </label>
          <select
            value={selectedProvincia}
            onChange={(e) => onProvinciaChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            <option value="todas">Todas as Províncias</option>
            <option value="Luanda">Luanda</option>
            <option value="Benguela">Benguela</option>
            <option value="Huíla">Huíla</option>
            <option value="Cabinda">Cabinda</option>
            <option value="Huambo">Huambo</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default GlobalPeriodBar;
