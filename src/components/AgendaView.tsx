import React from 'react';
import { Cliente, Usuario, Visita } from '../types';
import { Calendar, Plus, Clock, Users, MapPin, AlertTriangle, CalendarDays, Building2, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

interface AgendaViewProps {
  clients: Cliente[];
  comerciais: Usuario[];
  visits: Visita[];
  onOpenScheduleVisit: () => void;
  onEditSchedule?: (client: Cliente) => void;
  onDeleteSchedule?: (clientId: string) => void;
}

export default function AgendaView({
  clients,
  comerciais,
  visits,
  onOpenScheduleVisit,
  onEditSchedule,
  onDeleteSchedule
}: AgendaViewProps) {
  const today = new Date();

  // Parse upcoming visits from clients
  const upcomingVisits = clients
    .filter(c => c.proximaVisita && c.proximaVisita !== '-')
    .map(c => {
      const parts = c.proximaVisita.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const timeDiff = d.getTime() - today.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return { ...c, visitDate: d, diff: diffDays };
    })
    .sort((a, b) => a.diff - b.diff);

  const urgentVisits = upcomingVisits.filter(c => c.diff <= 7);
  const laterVisits = upcomingVisits.filter(c => c.diff > 7);

  const formatDateBlock = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const day = d.getDate().toString().padStart(2, '0');
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const month = months[d.getMonth()];
      return { day, month };
    } catch {
      return { day: '00', month: '---' };
    }
  };

  return (
    <div className="w-full space-y-4 font-serif text-gray-900 my-2">
      
      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif">
              AGENDA & REUNIÕES PRESENCIAIS
            </h2>
            <p className="text-xs font-sans text-blue-200">
              Planeamento de Visitas Comerciais, Prazos de Follow-up e Alinhamento com Decisores
            </p>
          </div>
        </div>
        
        <button
          onClick={onOpenScheduleVisit}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-1.5 rounded-sm text-xs font-sans flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agendar Nova Visita
        </button>
      </div>

      {/* Split grid: Urgent vs Later */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        
        {/* Urgent (This Week) */}
        <div className="bg-white border border-gray-300 rounded-sm shadow-2xs overflow-hidden">
          <div className="bg-[#122442] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border-b border-[#0b162a]">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> ESTA SEMANA (URGENTE / PRÓXIMOS 7 DIAS)
          </div>
          <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
            {urgentVisits.length === 0 ? (
              <p className="text-xs font-medium text-gray-500 py-6 text-center italic">Sem visitas agendadas para esta semana.</p>
            ) : (
              urgentVisits.map(c => {
                const block = formatDateBlock(c.proximaVisita);
                const resp = comerciais.find(u => u.id === c.responsavel);
                return (
                  <div key={c.id} className="flex items-center gap-3 p-2 bg-rose-50/40 hover:bg-rose-50/80 rounded-xs border border-rose-200 transition justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xs bg-rose-900 text-white flex flex-col items-center justify-center font-black shrink-0 font-mono">
                        <span className="text-base leading-none">{block.day}</span>
                        <span className="text-[9px] uppercase tracking-wider">{block.month}</span>
                      </div>
                      <div className="text-left">
                        <strong className="text-xs font-bold text-gray-900 block">{c.empresa}</strong>
                        <p className="text-[11px] text-gray-600 font-sans">{c.nome} • {c.provincia}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-rose-800 font-bold bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-xs font-mono">
                            {c.diff < 0 ? 'EM ATRASO' : c.diff === 0 ? 'HOJE' : `EM ${c.diff} DIAS`}
                          </span>
                          {resp && (
                            <span className="text-[10px] text-gray-600 font-medium uppercase flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-400" /> {resp.nome.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditSchedule && (
                        <button
                          onClick={() => onEditSchedule(c)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition cursor-pointer"
                          title="Editar Agendamento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteSchedule && (
                        <button
                          onClick={() => {
                            if (confirm(`Remover agendamento de visita para "${c.empresa}"?`)) {
                              onDeleteSchedule(c.id);
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded transition cursor-pointer"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Later Visits */}
        <div className="bg-white border border-gray-300 rounded-sm shadow-2xs overflow-hidden">
          <div className="bg-[#122442] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border-b border-[#0b162a]">
            <Clock className="w-4 h-4 text-blue-300" /> PRÓXIMAS VISITAS AGENDADAS
          </div>
          <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
            {laterVisits.length === 0 ? (
              <p className="text-xs font-medium text-gray-500 py-6 text-center italic">Sem visitas posteriores agendadas.</p>
            ) : (
              laterVisits.slice(0, 6).map(c => {
                const block = formatDateBlock(c.proximaVisita);
                const respUser = comerciais.find(x => x.id === c.responsavel);
                return (
                  <div key={c.id} className="flex items-center gap-3 p-2 bg-blue-50/30 hover:bg-blue-50/70 rounded-xs border border-blue-200 transition justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xs bg-[#1B365D] text-white flex flex-col items-center justify-center font-black shrink-0 font-mono">
                        <span className="text-base leading-none">{block.day}</span>
                        <span className="text-[9px] uppercase tracking-wider">{block.month}</span>
                      </div>
                      <div className="text-left">
                        <strong className="text-xs font-bold text-gray-900 block">{c.empresa}</strong>
                        <p className="text-[11px] text-gray-600 font-sans">{c.nome} • {c.provincia}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-blue-800 font-bold bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded-xs font-mono">
                            EM {c.diff} DIAS
                          </span>
                          {respUser && (
                            <span className="text-[10px] text-gray-600 font-medium uppercase flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-400" /> {respUser.nome.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditSchedule && (
                        <button
                          onClick={() => onEditSchedule(c)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition cursor-pointer"
                          title="Editar Agendamento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteSchedule && (
                        <button
                          onClick={() => {
                            if (confirm(`Remover agendamento de visita para "${c.empresa}"?`)) {
                              onDeleteSchedule(c.id);
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded transition cursor-pointer"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Full list of schedules - High Contrast Table */}
      <div className="bg-white border border-gray-400 shadow-xs overflow-x-auto">
        <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
          LISTAGEM INTEGRADA DE COMPROMISSOS COMERCIAIS
        </div>
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[180px]">Cliente / Empresa</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[140px]">Comercial Responsável</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center min-w-[110px]">Última Visita</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center min-w-[110px]">Próxima Visita</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center min-w-[110px]">Prazo Restante</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center min-w-[90px]">Status</th>
              <th className="px-3 py-2 font-bold text-center min-w-[100px]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
            {upcomingVisits.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500 italic font-sans">
                  Nenhuma visita agendada.
                </td>
              </tr>
            ) : (
              upcomingVisits.map(c => {
                const resp = comerciais.find(u => u.id === c.responsavel);
                const statusClass = c.diff < 0 
                  ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold' 
                  : c.diff <= 7 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300';
                const statusLabel = c.diff < 0 ? 'EM ATRASO' : c.diff === 0 ? 'HOJE' : `${c.diff} DIAS`;
                return (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-3 py-1.5 border-r border-gray-300 font-bold text-gray-900">
                      <div>
                        <span>{c.empresa}</span>
                        <span className="text-[10px] text-gray-500 font-normal block">{c.nome}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-medium text-gray-800">
                      {resp?.nome || 'Não atribuído'}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-center font-mono text-[10px] text-gray-700">
                      {c.ultimaVisita || '-'}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-center font-mono font-bold text-blue-900 text-[10px]">
                      {c.proximaVisita}
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-center">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] border font-mono ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-center">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase border ${
                        c.status === 'ativo' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEditSchedule && (
                          <button
                            onClick={() => onEditSchedule(c)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition cursor-pointer"
                            title="Editar Agendamento"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteSchedule && (
                          <button
                            onClick={() => {
                              if (confirm(`Remover agendamento de visita para "${c.empresa}"?`)) {
                                onDeleteSchedule(c.id);
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded transition cursor-pointer"
                            title="Cancelar Agendamento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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

    </div>
  );
}

