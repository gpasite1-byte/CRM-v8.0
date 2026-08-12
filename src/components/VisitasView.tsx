import React from 'react';
import { Visita, Usuario } from '../types';
import { Plus, MapPin, HelpCircle, Package, Clock, MapPinCheck, UserCheck, Pencil, Trash2, Calendar, Download, ExternalLink } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';

import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface VisitasViewProps {
  visits: Visita[];
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
  onOpenAddVisit: () => void;
  onEditVisit?: (visit: Visita) => void;
  onDeleteVisit?: (visitId: string) => void;
}

export default function VisitasView({
  visits,
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
  onOpenAddVisit,
  onEditVisit,
  onDeleteVisit
}: VisitasViewProps) {

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
          selectedComercial={selectedComercial || 'todos'}
          onComercialChange={onComercialChange || (() => {})}
          selectedEmpresa={selectedEmpresa || 'todas'}
          onEmpresaChange={onEmpresaChange || (() => {})}
          selectedProvincia={selectedProvincia || 'todas'}
          onProvinciaChange={onProvinciaChange || (() => {})}
          currentViewName="Histórico de Visitas"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MapPinCheck className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif">
              HISTÓRICO E AUDITORIA DE VISITAS TÉCNICAS
            </h2>
            <p className="text-xs font-sans text-blue-200">
              Registo Pormenorizado de Reuniões, Diagnósticos do Cliente e Necessidades Identificadas
            </p>
          </div>
        </div>
        
        <button
          onClick={onOpenAddVisit}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-1.5 rounded-sm text-xs font-sans flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registar Nova Visita
        </button>
      </div>

      {/* Grid of visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {visits.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-300 rounded-xs p-8 text-center text-xs font-medium text-gray-500 italic">
            Nenhuma visita comercial registada até ao momento.
          </div>
        ) : (
          visits.map(v => {
            const isPos = v.resultado?.toLowerCase().includes('pos') || v.resultado?.toLowerCase().includes('realiz') || v.resultado?.toLowerCase().includes('aprov');
            return (
              <div key={v.id} className="bg-white rounded-xs border border-gray-300 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-xs transition">
                <div>
                  {/* Card Header */}
                  <div className="bg-[#122442] text-white p-3 border-b border-[#0a1424] flex justify-between items-start gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white tracking-wide uppercase font-serif">{v.empresa}</h5>
                      <div className="flex items-center gap-1.5 mt-1">
                        <UserAvatar name={v.comercialNome} comerciais={comerciais} size="xs" />
                        <span className="text-[10px] text-blue-200 font-sans">
                          Gestor: <span className="font-semibold text-amber-300">{v.comercialNome}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold border uppercase tracking-wider ${
                        isPos ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}>
                        {v.resultado || 'Realizada'}
                      </span>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {onEditVisit && (
                          <button
                            onClick={() => onEditVisit(v)}
                            className="bg-blue-600/80 hover:bg-blue-600 text-white p-1 rounded hover:scale-105 transition cursor-pointer"
                            title="Editar Relatório de Visita"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteVisit && (
                          <button
                            onClick={() => {
                              if (confirm(`Tem a certeza de que deseja eliminar o relatório de visita de "${v.empresa}"?`)) {
                                onDeleteVisit(v.id);
                              }
                            }}
                            className="bg-rose-600/80 hover:bg-rose-600 text-white p-1 rounded hover:scale-105 transition cursor-pointer"
                            title="Eliminar Visita"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 space-y-2.5 text-xs text-gray-800">
                    <div className="flex items-start gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#1B365D] mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-gray-900 font-bold block text-[11px]">Contacto / Decisor:</strong>
                        <span className="text-gray-700">{v.clienteNome}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 text-[#1B365D] mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-gray-900 font-bold block text-[11px]">Produtos / Interesse:</strong>
                        <span className="text-gray-700">{v.produtos}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-xs border border-gray-200">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-gray-900 font-bold block text-[11px]">Necessidade / Ponto de Situação:</strong>
                        <p className="text-gray-700 mt-0.5 leading-relaxed text-[11px] italic font-serif">{v.necessidade}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Calendar Sync */}
                <div className="border-t border-gray-300 bg-gray-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-700 font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-blue-900">
                      <Clock className="w-3 h-3 text-blue-700" /> {v.data} {v.hora}
                    </span>
                    <span className="flex items-center gap-1 text-gray-800 truncate max-w-[120px]">
                      <MapPin className="w-3 h-3 text-amber-600" /> {v.localizacao}
                    </span>
                  </div>

                  {/* Calendar Sync Buttons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={generateGoogleCalendarUrl({
                        title: `Visita Técnica GPA: ${v.empresa}`,
                        description: `Reunião com Decisor ${v.clienteNome}. Interesse em: ${v.produtos}. Necessidade: ${v.necessidade}`,
                        location: v.localizacao || 'Luanda, Angola',
                        startDate: v.data,
                        time: v.hora,
                        contactName: v.clienteNome
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[9px] flex items-center gap-1 transition cursor-pointer font-sans"
                      title="Sincronizar com Google Calendar"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Google Calendar
                    </a>

                    <button
                      onClick={() => downloadIcsFile({
                        title: `Visita Técnica GPA: ${v.empresa}`,
                        description: `Reunião com Decisor ${v.clienteNome}. Interesse em: ${v.produtos}. Necessidade: ${v.necessidade}`,
                        location: v.localizacao || 'Luanda, Angola',
                        startDate: v.data,
                        time: v.hora,
                        contactName: v.clienteNome
                      })}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-2 py-1 rounded text-[9px] flex items-center gap-1 transition cursor-pointer font-sans"
                      title="Descarregar ficheiro .ICS para Outlook/Apple/Telemóvel"
                    >
                      <Download className="w-2.5 h-2.5" />
                      .ICS
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

