import React, { useState } from 'react';
import { Deal } from '../types';
import { AlertTriangle, Clock, MessageSquare, Mail, Phone, CheckCircle2, Send, ExternalLink, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface FollowUpAutomationPanelProps {
  deals: Deal[];
  onUpdateDealStage?: (dealId: string, dir: number) => void;
  onLogContactDone?: (dealId: string) => void;
}


export default function FollowUpAutomationPanel({
  deals,
  onUpdateDealStage,
  onLogContactDone
}: FollowUpAutomationPanelProps) {
  const [filterThreshold, setFilterThreshold] = useState<number>(3); // 3 or 5 days

  // Stagnant deals are active deals in proposal/qualification/negotiation open for > threshold days
  const stagnantDeals = deals.filter(d => {
    const isPending = d.etapa === 'proposta' || d.etapa === 'negociacao' || d.etapa === 'contato' || d.etapa === 'visita' || d.etapa === 'lead';
    return isPending && (d.diasAberto || 0) >= filterThreshold;
  }).sort((a, b) => (b.diasAberto || 0) - (a.diasAberto || 0));

  const buildWhatsappMessage = (d: Deal) => {
    const text = `Olá, bom dia! Em nome da GPA Angola, vimos acompanhar a proposta comercial para "${d.titulo}" enviada para a ${d.clienteNome}.\n\nReiteramos a nossa total disponibilidade para analisar qualquer dúvida técnica ou ajuste de valores. Podemos agendar uma breve chamada hoje?\n\nCom os melhores cumprimentos,\nGPA Angola - Gestão e Assistência Técnica`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const buildEmailSubject = (d: Deal) => {
    return encodeURIComponent(`Acompanhamento de Proposta Comercial - ${d.titulo} | GPA Angola`);
  };

  const buildEmailBody = (d: Deal) => {
    const body = `Exmo(a). Sr(a).\n\nEsperamos que se encontre bem.\n\nServimo-nos deste meio para acompanhar a proposta referente a "${d.titulo}" referente à ${d.clienteNome}.\n\nGostaríamos de saber se teve oportunidade de analisar o documento e se necessita de algum esclarecimento adicional ou ajuste nas condições apresentadas.\n\nFicamos a aguardar as suas estimadas notícias.\n\nAtentamente,\nEquipa Comercial GPA Angola\nLuanda, Angola`;
    return encodeURIComponent(body);
  };

  return (
    <div className="bg-white rounded-xl border border-amber-200 border-l-4 border-l-amber-500 p-4 shadow-xs space-y-4 font-sans text-gray-900">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#1B365D] uppercase tracking-wide font-serif">
                🤖 Automações de Follow-up & Alertas de Estagnação
              </h3>
              <span className="bg-amber-500 text-gray-950 font-mono text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {stagnantDeals.length} {stagnantDeals.length === 1 ? 'proposta parada' : 'propostas paradas'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Identificação automática de negócios sem contacto recente e envio direto de mensagens por WhatsApp/Email.
            </p>
          </div>
        </div>

        {/* Filter buttons for days */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
          <span className="text-[11px] font-bold text-gray-500 px-1.5">Estagnadas há:</span>
          <button
            onClick={() => setFilterThreshold(3)}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              filterThreshold === 3 ? 'bg-[#1B365D] text-white shadow-2xs' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            &gt; 3 Dias
          </button>
          <button
            onClick={() => setFilterThreshold(5)}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              filterThreshold === 5 ? 'bg-[#1B365D] text-white shadow-2xs' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            &gt; 5 Dias
          </button>
        </div>
      </div>

      {/* List of stagnant deals requiring immediate follow-up */}
      {stagnantDeals.length === 0 ? (
        <div className="py-6 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Excelente! Nenhuma proposta encontra-se estagnada há mais de {filterThreshold} dias sem acompanhamento.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stagnantDeals.map((d) => {
            const isHighWarning = (d.diasAberto || 0) >= 5;

            return (
              <div
                key={d.id}
                className={`p-3 rounded-lg border text-xs space-y-2.5 transition ${
                  isHighWarning
                    ? 'bg-red-50/60 border-red-200 hover:border-red-300'
                    : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 line-clamp-1">{d.titulo}</span>
                    <p className="text-gray-600 font-medium">{d.clienteNome} • {d.comercialNome}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${
                    isHighWarning ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {d.diasAberto} dias parados
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-gray-200/60 pt-1.5">
                  <span>Etapa: <strong className="uppercase text-blue-900">{d.etapa}</strong></span>
                  <span>Valor: <strong className="text-gray-900">{new Intl.NumberFormat('pt-AO').format(d.valor)} Kz</strong></span>
                </div>

                {/* Direct Follow-up Actions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  
                  {/* WhatsApp Action */}
                  <a
                    href={buildWhatsappMessage(d)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Enviar WhatsApp
                  </a>

                  {/* Email Action */}
                  <a
                    href={`mailto:?subject=${buildEmailSubject(d)}&body=${buildEmailBody(d)}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition"
                  >
                    <Mail className="w-3 h-3" />
                    Email Follow-up
                  </a>

                  {/* Log Contact */}
                  {onLogContactDone && (
                    <button
                      onClick={() => onLogContactDone(d.id)}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-[11px] px-2 py-1 rounded flex items-center gap-1 transition cursor-pointer ml-auto"
                      title="Marcar contacto como realizado hoje"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Marcar Feito
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Customizable Follow-Up Drip Rules Configurator */}
      <div className="border-t border-amber-200/80 pt-3">
        <details className="group">
          <summary className="text-xs font-extrabold text-[#1B365D] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 hover:text-blue-700 transition">
            <Sparkles size={14} className="text-amber-600" />
            <span>⚙️ Configurar Regras Automáticas de Follow-Up (WhatsApp & Email Drip)</span>
            <ChevronRight size={14} className="group-open:rotate-90 transition-transform ml-auto" />
          </summary>
          
          <div className="mt-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">1. Alerta de Proposta Enviada</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-500">Dispara WhatsApp após 3 dias sem resposta na etapa Proposta.</p>
                <div className="text-[10px] font-mono text-emerald-700 font-bold">Canal: WhatsApp + Email</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">2. Reavaliação de Negociação</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-500">Notifica o Gestor Comercial se o negócio exceder 5 dias em Negociação.</p>
                <div className="text-[10px] font-mono text-blue-700 font-bold">Canal: Notificação no Sistema + Email</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">3. Recuperação de Lead Frio</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-500">Mensagem automática de re-engajamento em Kz após 15 dias sem contacto.</p>
                <div className="text-[10px] font-mono text-purple-700 font-bold">Canal: WhatsApp Gateway</div>
              </div>
            </div>
          </div>
        </details>
      </div>

    </div>
  );
}
