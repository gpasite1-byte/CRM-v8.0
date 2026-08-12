import React, { useState } from 'react';
import { Usuario, Deal, Cliente, Visita, isUserCommercial } from '../types';
import { ShieldCheck, Plus, Shield, Mail, Phone, Lock, Edit3, Trash2, MapPin, Eye, CheckCircle2, History, VolumeX, Volume2, UserCheck, Users, Camera, MessageCircle } from 'lucide-react';

interface UtilizadoresViewProps {
  comerciais: Usuario[];
  deals: Deal[];
  clients: Cliente[];
  visits: Visita[];
  loggedUser: Usuario;
  onOpenAddUser: () => void;
  onOpenEditUser: (user: Usuario) => void;
  onToggleBlockUser: (id: string) => void;
  onToggleMuteUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUserPhoto?: (userId: string, photo: string) => void;
}

export default function UtilizadoresView({
  comerciais,
  deals,
  clients,
  visits,
  loggedUser,
  onOpenAddUser,
  onOpenEditUser,
  onToggleBlockUser,
  onToggleMuteUser,
  onDeleteUser,
  onUpdateUserPhoto
}: UtilizadoresViewProps) {
  const [selectedHistoryComId, setSelectedHistoryComId] = useState(() => {
    const firstCom = comerciais.find(isUserCommercial);
    return firstCom ? firstCom.id : '';
  });

  const role = loggedUser.perfil;

  const getInitials = (n: string) => {
    if (!n) return 'GP';
    return n.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get dynamic stats for selected history commercial
  const getHistoryStats = () => {
    const u = comerciais.find(x => x.id === selectedHistoryComId);
    if (!u) return null;

    const uDeals = deals.filter(d => d.comercialId === u.id);
    const uClients = clients.filter(c => c.responsavel === u.id);
    const uVisits = visits.filter(v => v.comercialNome === u.nome);

    const aprovado = uDeals.filter(d => d.etapa === 'fechado').reduce((sum, d) => sum + d.valor, 0);
    const metaPct = u.metaSemanal ? Math.round((aprovado / u.metaSemanal) * 100) : 0;

    return {
      user: u,
      dealsCount: uDeals.length,
      clientsCount: uClients.length,
      visitsCount: uVisits.length,
      aprovadoVal: aprovado,
      metaPct,
      closedWonCount: uDeals.filter(d => d.etapa === 'fechado').length
    };
  };

  const historyStats = getHistoryStats();

  // Get dynamic logs for selected commercial
  const getHistoryLogs = () => {
    const u = comerciais.find(x => x.id === selectedHistoryComId);
    if (!u) return [];

    const uDeals = deals.filter(d => d.comercialId === u.id);
    const uClients = clients.filter(c => c.responsavel === u.id);
    const uVisits = visits.filter(v => v.comercialNome === u.nome);

    const logs: { type: 'deal' | 'visit' | 'client'; text: string; date: string }[] = [];

    uDeals.forEach(d => {
      logs.push({
        type: 'deal',
        text: `Proposta "${d.titulo}" - ${new Intl.NumberFormat('pt-AO').format(d.valor)} Kz (${d.etapa.toUpperCase()})`,
        date: 'Recente'
      });
    });

    uClients.forEach(c => {
      logs.push({
        type: 'client',
        text: `Registo de Cliente "${c.empresa}" (${c.provincia})`,
        date: 'Recente'
      });
    });

    uVisits.forEach(v => {
      logs.push({
        type: 'visit',
        text: `Visita técnica com ${v.clienteNome} (${v.localizacao})`,
        date: v.data
      });
    });

    return logs.slice(0, 10);
  };

  const historyLogs = getHistoryLogs();

  return (
    <div className="w-full space-y-4 font-sans text-slate-900 dark:text-slate-100 my-2">
      
      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Users className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif">
              GESTAO DE UTILIZADORES & EQUIPA COMERCIAL
            </h2>
            <p className="text-xs font-sans text-blue-200">
              Controlo de Credenciais, Níveis de Acesso, Metas Individuais e Auditoria de Operações
            </p>
          </div>
        </div>
        
        {role === 'admin' && (
          <button
            onClick={onOpenAddUser}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-1.5 rounded-sm text-xs font-sans flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Criar Novo Utilizador
          </button>
        )}
      </div>

      {/* Users Table Card - High Contrast Excel-style */}
      <div className="bg-white border border-gray-400 shadow-xs overflow-x-auto font-sans">
        <div className="bg-[#122442] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#0b162a]">
          LISTAGEM DE UTILIZADORES REGISTADOS NO SISTEMA
        </div>
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
              <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Fotografia / Nome do Gestor</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Correio Eletrónico</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center">Perfil de Acesso</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Província</th>
              <th className="px-3 py-2 font-bold border-r border-[#1B7099] text-center min-w-[100px]">Status</th>
              <th className="px-3 py-2 font-bold text-center min-w-[180px]">Ações do Administrador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 text-gray-900">
            {comerciais.map(u => {
              const initials = getInitials(u.nome);
              const isBlocked = u.status === 'bloqueado';
              return (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-3.5 py-2.5 border-r border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="relative group flex-shrink-0">
                        {u.foto ? (
                          <img src={u.foto} alt={u.nome} className="w-14 h-14 rounded-full object-cover border-2 border-white ring-2 ring-blue-500/40 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#1B365D] text-white font-black flex items-center justify-center text-base border-2 border-white ring-2 ring-blue-500/40 shadow-sm">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div>
                        <strong className="text-gray-900 font-bold block text-sm">{u.nome}</strong>
                        <span className="text-[11px] text-gray-500 uppercase block font-semibold">{u.funcao}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-800 font-medium">{u.email}</td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-xs font-bold text-[9px] uppercase tracking-wider font-mono">
                      {u.perfil}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-300 text-gray-800 font-medium">{u.provincia || 'Luanda'}</td>
                  <td className="px-3 py-2 border-r border-gray-300 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase border ${
                        isBlocked ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {u.status}
                      </span>
                      {u.silencioso && (
                        <span className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded-xs border border-amber-300 font-bold text-[8px] uppercase font-mono">
                          Silenciado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      
                      {/* WhatsApp Direct Notification */}
                      {(u.whatsappNumero || u.telefone) && (
                        <a
                          href={`https://wa.me/244${(u.whatsappNumero || u.telefone).replace(/[^0-9]/g, '').slice(-9)}?text=${encodeURIComponent(`👋 Olá ${u.nome},\n\n📌 *GPA Angola CRM - Notificação*\nExiste uma nova atualização no sistema. Por favor aceda à sua conta para consultar os detalhes.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold border border-emerald-300 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 px-2 py-0.5 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Enviar Mensagem/Notificação no WhatsApp"
                        >
                          <MessageCircle size={11} /> WhatsApp
                        </a>
                      )}

                      {/* Metas / Edit */}
                      {(role === 'admin' || role === 'supervisor') && (
                        <button
                          onClick={() => onOpenEditUser(u)}
                          className="text-[10px] font-bold border border-gray-300 bg-gray-100 hover:bg-amber-500 hover:text-gray-950 text-gray-900 px-2 py-0.5 rounded-xs transition-colors cursor-pointer"
                        >
                          Metas / Editar
                        </button>
                      )}

                      {/* Block Toggle */}
                      {(role === 'admin' || role === 'supervisor') && u.id !== loggedUser.id && (
                        <button
                          onClick={() => onToggleBlockUser(u.id)}
                          className={`text-[10px] font-bold border px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                            isBlocked
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200'
                              : 'border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200'
                          }`}
                        >
                          {isBlocked ? 'Ativar' : 'Bloquear'}
                        </button>
                      )}

                      {/* Mute Toggle */}
                      {role === 'admin' && (
                        <button
                          onClick={() => onToggleMuteUser(u.id)}
                          className="p-1 rounded-xs border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                          title={u.silencioso ? 'Ativar som' : 'Silenciar som'}
                        >
                          {u.silencioso ? <Volume2 size={12} /> : <VolumeX size={12} />}
                        </button>
                      )}

                      {/* Delete User */}
                      {role === 'admin' && u.id !== loggedUser.id && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 rounded-xs border border-rose-300 bg-rose-50 hover:bg-rose-700 hover:text-white text-rose-800 transition-colors cursor-pointer"
                          title="Remover Utilizador"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Historical Audit section */}
      <div className="bg-white border border-gray-300 p-4 rounded-xs shadow-2xs space-y-3 font-sans">
        <div className="bg-[#122442] text-white px-3 py-1.5 -mx-4 -mt-4 mb-2 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border-b border-[#0b162a]">
          <History size={15} className="text-amber-400" /> HISTÓRICO E AUDITORIA DE OPERAÇÕES POR FUNCIONÁRIO
        </div>
        
        <div className="flex items-center gap-3 max-w-md pt-1">
          <label className="text-xs font-bold text-gray-800 uppercase shrink-0 font-serif">Selecionar Gestor Comercial:</label>
          <select
            value={selectedHistoryComId}
            onChange={(e) => setSelectedHistoryComId(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 w-full"
          >
            {comerciais.filter(isUserCommercial).map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        {historyStats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
            
            {/* Left side Stats */}
            <div className="lg:col-span-4 bg-gray-50 border border-gray-300 rounded-xs p-4 space-y-3 text-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#1B365D] text-white font-black flex items-center justify-center text-lg border-2 border-white overflow-hidden shadow-xs">
                  {historyStats.user.foto ? (
                    <img src={historyStats.user.foto} alt={historyStats.user.nome} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(historyStats.user.nome)
                  )}
                </div>
                <h5 className="text-xs font-bold text-gray-900 mt-2 font-serif uppercase">{historyStats.user.nome}</h5>
                <span className="text-[10px] text-gray-600 font-bold uppercase mt-0.5">{historyStats.user.funcao}</span>
              </div>

              <div className="divide-y divide-gray-300 text-xs text-gray-800 font-semibold space-y-1.5 pt-1">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Clientes Carteira</span>
                  <strong className="text-gray-900 font-bold font-mono">{historyStats.clientsCount}</strong>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Visitas Técnicas</span>
                  <strong className="text-gray-900 font-bold font-mono">{historyStats.visitsCount}</strong>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Propostas Ganhas</span>
                  <strong className="text-gray-900 font-bold font-mono">{historyStats.closedWonCount}</strong>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Faturamento W2</span>
                  <strong className="text-emerald-800 font-bold font-mono">{new Intl.NumberFormat('pt-AO').format(historyStats.aprovadoVal)} Kz</strong>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">Atingimento Meta</span>
                  <strong className={`font-bold font-mono ${historyStats.metaPct >= 100 ? 'text-emerald-800' : 'text-gray-900'}`}>
                    {historyStats.metaPct}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Right side Log of actions */}
            <div className="lg:col-span-8 border border-gray-300 bg-white rounded-xs p-3 flex flex-col justify-between max-h-[320px]">
              <div>
                <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2 font-serif">
                  REGISTO AUDITÁVEL DE OPERAÇÕES RECENTES
                </h5>
                <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                  {historyLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center italic">Sem atividades registadas no período.</p>
                  ) : (
                    historyLogs.map((log, i) => {
                      return (
                        <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 border border-gray-200 rounded-xs text-xs">
                          <span className="text-[9px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded-xs shrink-0 uppercase font-mono">
                            {log.type}
                          </span>
                          <div className="text-[11px] font-medium text-gray-900 shrink-1">
                            {log.text}
                          </div>
                          <span className="text-[10px] text-gray-500 shrink-0 font-mono font-bold ml-auto">{log.date}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

