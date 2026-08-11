import React, { useState } from 'react';
import { PropostaComercial, Deal } from '../types';
import { CheckCircle2, AlertCircle, FileText, Send, Share2, Copy, ShieldCheck, Clock, Building2, User, Phone, Mail, FileCheck, ThumbsUp, MessageSquare, Download } from 'lucide-react';

interface ProposalClientPortalModalProps {
  proposal: PropostaComercial;
  appLogo?: string;
  onClose: () => void;
  onApproveProposal: (proposalId: string, clientName: string, clientNif: string, comments: string) => void;
  onRequestRevision: (proposalId: string, comments: string) => void;
}

export default function ProposalClientPortalModal({
  proposal,
  appLogo,
  onClose,
  onApproveProposal,
  onRequestRevision
}: ProposalClientPortalModalProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'aprovar' | 'revisar'>('visualizar');
  const [clientSignName, setClientSignName] = useState(proposal.clienteNome || '');
  const [clientSignNif, setClientSignNif] = useState(proposal.clienteNif || '');
  const [approveComments, setApproveComments] = useState('');
  const [revisionComments, setRevisionComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState<string | null>(null);

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val).replace('AOA', 'Kz');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSignName.trim()) {
      alert('Por favor, informe o seu nome completo para assinar digitalmente.');
      return;
    }
    onApproveProposal(proposal.id, clientSignName, clientSignNif, approveComments);
    setIsSubmitted('aprovada');
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionComments.trim()) {
      alert('Por favor, insira os detalhes das alterações solicitadas.');
      return;
    }
    onRequestRevision(proposal.id, revisionComments);
    setIsSubmitted('revisao');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Portal Banner */}
        <div className="bg-[#1B365D] text-white p-4 border-b border-blue-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {appLogo ? (
              <img src={appLogo} alt="GPA Angola" className="h-10 object-contain bg-white/10 p-1 rounded" />
            ) : (
              <div className="w-10 h-10 bg-amber-500 text-gray-950 font-black flex items-center justify-center rounded font-serif text-lg">
                GPA
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif uppercase tracking-wider">
                  Portal de Validação do Cliente — GPA Angola
                </h3>
                <span className="bg-amber-400 text-gray-950 font-mono text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Nº {proposal.numero}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Página segura para o cliente analisar, aprovar ou solicitar revisões da proposta em tempo real.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xs font-bold px-2 py-1 rounded"
          >
            ✕ Fechar Portal
          </button>
        </div>

        {/* Submitted Confirmation State */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#1B365D]">
              {isSubmitted === 'aprovada' ? 'Proposta Aprovada com Sucesso!' : 'Solicitação de Revisão Enviada!'}
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {isSubmitted === 'aprovada'
                ? 'Agradecemos a sua confiança na GPA Angola. A nossa equipa comercial já foi notificada e dará início imediato ao processo de adjudicação e prestação do serviço.'
                : 'A sua mensagem foi transmitida diretamente ao gestor comercial da sua conta. Entraremos em contacto brevemente com a versão ajustada.'}
            </p>
            <button
              onClick={onClose}
              className="bg-[#1B365D] text-white font-bold text-xs px-5 py-2.5 rounded shadow-md hover:bg-blue-900 transition cursor-pointer"
            >
              Concluir & Fechar
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 space-y-6">
            
            {/* Status & Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-gray-700">
                  Documento Autêntico GPA Angola • Válido até: <strong>{proposal.dataValidade}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('visualizar')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    activeTab === 'visualizar' ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Proposta Comercial
                </button>
                <button
                  onClick={() => setActiveTab('aprovar')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    activeTab === 'aprovar' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  ✅ Aprovar Proposta
                </button>
                <button
                  onClick={() => setActiveTab('revisar')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    activeTab === 'revisar' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  💬 Solicitar Ajuste
                </button>
              </div>
            </div>

            {/* TAB 1: Proposal Full Details */}
            {activeTab === 'visualizar' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6 text-gray-900">
                
                {/* Header Info */}
                <div className="border-b border-gray-200 pb-4 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-black font-serif text-[#1B365D]">
                      PROPOSTA COMERCIAL {proposal.numero}
                    </h2>
                    <p className="text-xs text-gray-600 font-semibold">
                      GPA Angola, Lda. | Prestação de Serviços & Equipamentos Industriais
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-mono">VALOR TOTAL DA PROPOSTA</span>
                    <span className="text-xl font-black font-mono text-amber-600">
                      {formatKz(proposal.totalGeral)}
                    </span>
                  </div>
                </div>

                {/* Parties info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-[#1B365D] uppercase tracking-wider block">CLIENTE ADJUDICANTE</span>
                    <p className="font-bold text-gray-900">{proposal.clienteEmpresa}</p>
                    <p className="text-gray-700">Att: {proposal.clienteNome}</p>
                    <p className="text-gray-600 font-mono">NIF: {proposal.clienteNif}</p>
                  </div>

                  <div className="bg-blue-50/60 p-3 rounded border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-[#1B365D] uppercase tracking-wider block">EMISSOR / GABINETE TÉCNICO</span>
                    <p className="font-bold text-gray-900">GPA Angola, Lda.</p>
                    <p className="text-gray-700">Comercial: {proposal.comercialNome}</p>
                    <p className="text-gray-600 font-mono">NIF: 5417000000 | Luanda</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wider border-b border-gray-200 pb-1">
                    Especificação dos Serviços & Materiais
                  </h4>

                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1B365D] text-white">
                        <th className="p-2 font-bold">Descrição</th>
                        <th className="p-2 font-bold text-center">Qtd</th>
                        <th className="p-2 font-bold text-right">Preço Unit. (Kz)</th>
                        <th className="p-2 font-bold text-right">Total (Kz)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {proposal.itens.map((i, idx) => (
                        <tr key={i.id || idx}>
                          <td className="p-2 font-medium text-gray-900">{i.descricao}</td>
                          <td className="p-2 text-center font-mono">{i.quantidade}</td>
                          <td className="p-2 text-right font-mono">{formatAOA(i.precoUnitario)}</td>
                          <td className="p-2 text-right font-mono font-bold text-gray-900">{formatAOA(i.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Terms */}
                <div className="bg-gray-50 p-3.5 rounded border border-gray-200 text-xs space-y-1.5">
                  <span className="font-bold text-gray-900 block">Condições Comerciais & Pagamento:</span>
                  <p className="text-gray-700">{proposal.condicoesPagamento}</p>
                  <p className="text-gray-700"><strong>Prazo de Execução:</strong> {proposal.prazoExecucao}</p>
                  <p className="text-blue-900 font-mono font-semibold">
                    <strong>NIB/IBAN para Adjudicação:</strong> {proposal.ibanPagamento || 'AO06.0040.0000.1234.5678.1018.9 (BAI)'}
                  </p>
                </div>

                {/* Fast action call to approve */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-emerald-900">Deseja aprovar esta proposta comercial?</h5>
                    <p className="text-[11px] text-emerald-700">Aprovação imediata e geração do termo de adjudicação.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('aprovar')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar Proposta Agora
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: Approve Form */}
            {activeTab === 'aprovar' && (
              <form onSubmit={handleConfirmApproval} className="bg-white p-6 rounded-xl border border-emerald-200 shadow-xs space-y-4">
                <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase font-serif">
                      Aprovação Digital de Proposta Commercial
                    </h3>
                    <p className="text-xs text-gray-500">
                      Confirmação formal de aceitação das condições apresentadas na proposta {proposal.numero}.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Nome do Responsável / Assinante *</label>
                    <input
                      type="text"
                      required
                      value={clientSignName}
                      onChange={(e) => setClientSignName(e.target.value)}
                      placeholder="Ex: Eng. Manuel Santos"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">NIF da Empresa *</label>
                    <input
                      type="text"
                      required
                      value={clientSignNif}
                      onChange={(e) => setClientSignNif(e.target.value)}
                      placeholder="Ex: 500123456"
                      className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-bold mb-1">Observações / Instruções de Faturação (Opcional)</label>
                  <textarea
                    rows={3}
                    value={approveComments}
                    onChange={(e) => setApproveComments(e.target.value)}
                    placeholder="Indique aqui qualquer nota suplementar sobre o local de entrega, horário ou contacto financeiro..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                <div className="bg-emerald-50 p-3 rounded text-xs text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Ao clicar em <strong>"Confirmar & Aprovar Proposta"</strong>, declara aceitar as condições comerciais e autoriza a GPA Angola a dar início aos trabalhos acordados.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visualizar')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-4 py-2 rounded cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar & Aprovar Proposta
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Revision Form */}
            {activeTab === 'revisar' && (
              <form onSubmit={handleConfirmRevision} className="bg-white p-6 rounded-xl border border-amber-200 shadow-xs space-y-4">
                <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase font-serif">
                      Solicitar Ajustes ou Revisão de Proposta
                    </h3>
                    <p className="text-xs text-gray-500">
                      Envie as suas notas ou alterações pretendidas ao consultor comercial da GPA Angola.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-bold mb-1">
                    Descrição do Ajuste Pretendido (Valores, Prazos ou Escopo) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={revisionComments}
                    onChange={(e) => setRevisionComments(e.target.value)}
                    placeholder="Ex: Solicitamos a revisão do prazo de execução para 10 dias e inclusão do transporte no orçamento..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visualizar')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-4 py-2 rounded cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2 rounded shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Solicitação de Revisão
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

function formatAOA(val: number) {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val).replace('AOA', 'Kz');
}
