import React from 'react';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ManualRapidoView() {
  const passos = [
    {
      passo: 1,
      titulo: 'Pipeline CRM Kanban 8.0',
      texto: 'Arraste ou avance as propostas pelas 7 etapas do pipeline (Lead ➔ Contato ➔ Visita ➔ Proposta ➔ Negociação ➔ Fechado ➔ Produção). Cada etapa calcula automaticamente a probabilidade de fechamento e previsão em AOA.'
    },
    {
      passo: 2,
      titulo: 'Extrator de Propostas por IA (PDF)',
      texto: 'Utilize o botão "Extrair PDF (IA)" na barra superior para enviar faturas, contratos e propostas. A Helena IA v8.0 extrai automaticamente a empresa, o NIF, os montantes em Kz e cadastra a oportunidade no CRM.'
    },
    {
      passo: 3,
      titulo: 'Secretária Virtual Helena IA 8.0',
      texto: 'Na aba "Helena IA 8.0", solicite minutas de email, scripts de chamadas comerciais, simulação de IVA (14%) e relatórios executivos usando texto ou ditado por voz.'
    },
    {
      passo: 4,
      titulo: 'Comissões & Metas Semanais',
      texto: 'Acompanhe a taxa de comissão de 3% sobre vendas aprovadas e o ranking de performance dos comerciais atualizado automaticamente em AOA.'
    },
    {
      passo: 5,
      titulo: 'Sincronização em Tempo Real (Firestore 8.0)',
      texto: 'Todas as alterações de clientes, propostas e visitas são sincronizadas instantaneamente com o banco de dados seguro da GPA Angola no Firestore.'
    },
    {
      passo: 6,
      titulo: 'Auditoria & Histórico de Operações',
      texto: 'Na aba "Histórico & Auditoria", os gestores podem verificar todas as ações do dia e efetuar a reversão/desfazer de operações inadvertidas.'
    }
  ];

  return (
    <div className="w-full space-y-6 font-sans my-2 text-gray-900">
      
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#0A84FF] text-white py-5 px-6 rounded-2xl shadow-md border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase font-serif flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-400" />
            MANUAL RÁPIDO – GPA ANGOLA CRM v8.0 PRO
          </h2>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Guia prático de utilização das funcionalidades avançadas da Versão 8.0 ELITE.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold">
          <Sparkles size={15} className="text-amber-400 animate-pulse" />
          <span>Versão 8.0 ELITE</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#003366] text-white border-b border-[#001f3f]">
              <th className="px-4 py-3 font-extrabold border-r border-blue-900/50 w-20 text-center uppercase tracking-wider">
                Passo
              </th>
              <th className="px-6 py-3 font-extrabold uppercase tracking-wider">
                Funcionalidades Avançadas v8.0
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans text-gray-900">
            {passos.map((item) => (
              <tr key={item.passo} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-4 font-black text-center text-[#003366] border-r border-gray-100 bg-slate-50/50 text-base">
                  {item.passo}
                </td>
                <td className="px-6 py-4 text-gray-800 leading-relaxed font-medium">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <h4 className="text-sm font-extrabold text-[#003366] uppercase">{item.titulo}</h4>
                  </div>
                  <p className="text-xs text-gray-600 font-normal pl-6">{item.texto}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
