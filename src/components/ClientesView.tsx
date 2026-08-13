import React, { useState, useMemo } from 'react';
import { Cliente, Usuario } from '../types';
import { Search, Plus, Download, Edit3, Phone, Trash2, Users2, Building2, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface ClientesViewProps {
  clients: Cliente[];
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
  onOpenAddClient: () => void;
  onOpenEditClient: (client: Cliente) => void;
  onExportCSV: () => void;
  onDeleteClient?: (id: string) => void;
}

export default function ClientesView({
  clients,
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
  onOpenAddClient,
  onOpenEditClient,
  onExportCSV,
  onDeleteClient
}: ClientesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentoFilter, setSegmentoFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const uniqueSegmentos = useMemo(() => {
    const list = Array.from(new Set(clients.map(c => c.segmento).filter(Boolean)));
    return ['Todos', ...list];
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = c.nome.toLowerCase().includes(q) || c.empresa.toLowerCase().includes(q) || c.nif.includes(q) || c.provincia.toLowerCase().includes(q);
      const matchesSegmento = segmentoFilter === 'Todos' || c.segmento === segmentoFilter;
      const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
      return matchesSearch && matchesSegmento && matchesStatus;
    });
  }, [clients, searchQuery, segmentoFilter, statusFilter]);

  // Metric stats
  const totalClients = filteredClients.length;
  const totalAtivos = filteredClients.filter(c => c.status === 'ativo').length;
  const totalProspeccao = filteredClients.filter(c => c.status === 'prospeccao' || c.status === 'potencial').length;

  return (
    <div className="w-full space-y-4 font-serif text-gray-900 my-2">
      
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
          currentViewName="Clientes & Contas"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif">
              BASE DE CLIENTES E CONTAS CORPORATIVAS
            </h2>
            <p className="text-xs font-sans text-blue-200">
              Gestão Integrada de Contas, NIFs, Segmentos e Histórico de Interações
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-sm text-xs font-sans flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>

          <button
            onClick={onOpenAddClient}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-1.5 rounded-sm text-xs font-sans flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans text-xs">
        <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-lg text-slate-100">
          <div className="text-cyan-400 text-[10px] uppercase font-bold flex items-center gap-1">
            <Users2 className="w-3.5 h-3.5 text-cyan-400" /> Total Registados
          </div>
          <div className="text-lg font-black text-white mt-1">{totalClients} <span className="text-xs font-normal text-slate-400">empresas</span></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 p-3 rounded-xl shadow-lg text-slate-100">
          <div className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Clientes Activos
          </div>
          <div className="text-lg font-black text-emerald-300 mt-1">{totalAtivos} <span className="text-xs font-normal text-emerald-400/70">contas</span></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 p-3 rounded-xl shadow-lg text-slate-100">
          <div className="text-amber-400 text-[10px] uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Em Prospecção
          </div>
          <div className="text-lg font-black text-amber-300 mt-1">{totalProspeccao} <span className="text-xs font-normal text-amber-400/70">oportunidades</span></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl shadow-lg text-slate-100">
          <div className="text-blue-400 text-[10px] uppercase font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" /> Segmentos Activos
          </div>
          <div className="text-lg font-black text-blue-300 mt-1">{uniqueSegmentos.length - 1} <span className="text-xs font-normal text-blue-400/70">sectores</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/20 p-3.5 rounded-xl shadow-lg font-sans space-y-2 text-xs text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-cyan-400 uppercase text-[11px]">Segmento:</span>
              <select
                value={segmentoFilter}
                onChange={(e) => setSegmentoFilter(e.target.value)}
                className="border border-slate-700 rounded-lg py-1.5 px-2.5 bg-slate-950 text-xs text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
              >
                {uniqueSegmentos.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-cyan-400 uppercase text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-700 rounded-lg py-1.5 px-2.5 bg-slate-950 text-xs text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="ativo">Activo</option>
                <option value="potencial">Potencial</option>
                <option value="inativo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por empresa, contacto, NIF, província..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-700 bg-slate-950 rounded-lg text-xs text-white focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

        </div>
      </div>

      {/* Excel-style High Contrast Table */}
      <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl overflow-x-auto max-h-[70vh]">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900 text-cyan-300 border-b border-cyan-500/30">
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 min-w-[180px]">Empresa / Conta</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 min-w-[140px]">Pessoa de Contacto</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 text-center min-w-[110px]">NIF</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 min-w-[120px]">Telefone</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 min-w-[110px]">Província</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 min-w-[130px]">Segmento / Sector</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 text-center min-w-[90px]">Status</th>
              <th className="px-3 py-2.5 font-bold border-r border-slate-800 text-center min-w-[110px]">Última Visita</th>
              <th className="px-3 py-2.5 font-bold text-center w-20">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans text-slate-200">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400 font-sans italic">
                  Nenhum cliente encontrado com os critérios selecionados.
                </td>
              </tr>
            ) : (
              filteredClients.map(c => (
                <tr key={c.id} className="hover:bg-cyan-500/10 transition-colors">
                  <td className="px-3 py-2 border-r border-slate-800 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 font-mono shadow-xs">
                        {c.empresa.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{c.empresa}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 font-medium text-slate-200">
                    {c.nome || '-'}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 text-center font-mono font-bold text-cyan-300 text-[10px]">
                    {c.nif || '-'}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 font-mono text-slate-300 text-[10px]">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      {c.telefone || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 text-slate-300">
                    {c.provincia || 'Luanda'}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 text-slate-300 font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30 text-[10px]">
                      {c.segmento || 'Geral'}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      c.status === 'ativo' 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-800 text-center font-mono text-[10px] text-slate-400">
                    {c.ultimaVisita || '-'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenEditClient(c)}
                        className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/30 transition cursor-pointer"
                        title="Editar Cliente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteClient && (
                        <button
                          onClick={() => onDeleteClient(c.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/30 transition cursor-pointer"
                          title="Remover Cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

