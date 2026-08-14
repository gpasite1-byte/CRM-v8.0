import React, { useState, useRef } from 'react';
import { Deal, Cliente, Usuario, PropostaComercial, PropostaItem } from '../types';
import { FileText, Download, Printer, Send, ExternalLink, Plus, Trash2, CheckCircle2, Building2, User, Phone, Mail, FileCheck, Shield, AlertCircle, Copy, Share2, PenTool, Check, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { openWhatsAppDirect } from '../lib/notifications';

interface ProposalModalProps {
  deal?: Deal;
  clients: Cliente[];
  comerciais: Usuario[];
  loggedUser: Usuario;
  appLogo?: string;
  onClose: () => void;
  onSaveProposal: (proposal: PropostaComercial) => void;
  onOpenPortal: (proposal: PropostaComercial) => void;
}

export default function ProposalModal({
  deal,
  clients,
  comerciais,
  loggedUser,
  appLogo,
  onClose,
  onSaveProposal,
  onOpenPortal
}: ProposalModalProps) {
  const proposalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [proposalEstado, setProposalEstado] = useState<'rascunho' | 'enviada' | 'aceite' | 'recusada'>(deal?.etapa === 'ganho' ? 'aceite' : 'enviada');

  // Match client if deal provided
  const matchedClient = clients.find(c =>
    deal ? c.empresa.toLowerCase() === deal.clienteNome.toLowerCase() || c.nome.toLowerCase() === deal.clienteNome.toLowerCase() : false
  );

  const [clienteNome, setClienteNome] = useState(deal?.clienteNome || matchedClient?.nome || 'Empresa Cliente Lda');
  const [clienteEmpresa, setClienteEmpresa] = useState(matchedClient?.empresa || deal?.clienteNome || 'Cliente Exemplo S.A.');
  const [clienteNif, setClienteNif] = useState(matchedClient?.nif || '500123456');
  const [clienteEmail, setClienteEmail] = useState('compras@cliente.co.ao');
  const [clienteTelefone, setClienteTelefone] = useState(matchedClient?.telefone || '+244 923 000 000');
  const [clienteEndereco, setClienteEndereco] = useState(matchedClient?.provincia ? `Província de ${matchedClient.provincia}, Luanda` : 'Rua Major Kanhangulo, Luanda');

  const [comercialNome, setComercialNome] = useState(deal?.comercialNome || loggedUser.nome);
  const [comercialEmail, setComercialEmail] = useState(loggedUser.email || 'comercial@gpaangola.co.ao');

  const [numeroProposta, setNumeroProposta] = useState(`GPA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [condicoesPagamento, setCondicoesPagamento] = useState('50% com a adjudicação da proposta e 50% após a conclusão dos serviços.');
  const [prazoExecucao, setPrazoExecucao] = useState('15 dias úteis a contar do recebimento do sinal.');
  const [ibanPagamento, setIbanPagamento] = useState('AO06.0040.0000.1234.5678.1018.9 (Banco BAI)');
  const [observacoes, setObservacoes] = useState('A presente proposta comercial inclui garantia técnica e suporte especializado da GPA Angola.');

  const initialValor = deal?.valor || 1500000;
  const [itens, setItens] = useState<PropostaItem[]>([
    {
      id: '1',
      descricao: deal?.titulo ? `Prestação de Serviços: ${deal.titulo}` : 'Fornecimento e Instalação de Equipamentos Industriais',
      quantidade: 1,
      precoUnitario: initialValor,
      impostoPct: 14,
      total: initialValor * 1.14
    }
  ]);

  const handleAddItem = () => {
    const newItem: PropostaItem = {
      id: Date.now().toString(),
      descricao: 'Novo Serviço / Material Adicional',
      quantidade: 1,
      precoUnitario: 100000,
      impostoPct: 14,
      total: 114000
    };
    setItens(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof PropostaItem, val: any) => {
    setItens(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantidade' || field === 'precoUnitario' || field === 'impostoPct') {
        const qty = field === 'quantidade' ? Number(val) || 0 : item.quantidade;
        const price = field === 'precoUnitario' ? Number(val) || 0 : item.precoUnitario;
        const tax = field === 'impostoPct' ? Number(val) || 0 : item.impostoPct;
        const sub = qty * price;
        updated.total = sub + (sub * tax / 100);
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (itens.length === 1) return;
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
  const impostoTotal = itens.reduce((sum, item) => sum + ((item.quantidade * item.precoUnitario) * (item.impostoPct / 100)), 0);
  const totalGeral = subtotal + impostoTotal;

  const publicPortalUrl = `${window.location.origin}/proposta/${numeroProposta}`;

  const formatAOA = (val: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val).replace('AOA', 'Kz');
  };

  const handleGeneratePdf = async () => {
    if (!proposalRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = proposalRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Proposta_${numeroProposta}_GPA_Angola.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF automaticamente. Utilize a opção de Impressão para Salvar em PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Canvas signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDigitalSignature(null);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setDigitalSignature(dataUrl);
    setShowSignaturePad(false);
  };

  const handleWhatsAppShare = () => {
    const msg = `*PROPOSTA COMERCIAL GPA ANGOLA*\n\n` +
      `📄 *Número:* ${numeroProposta}\n` +
      `🏢 *Cliente:* ${clienteEmpresa}\n` +
      `👤 *A/C:* ${clienteNome}\n` +
      `💰 *Valor Total:* ${formatAOA(totalGeral)} (c/ IVA 14%)\n` +
      `⏱️ *Prazo de Execução:* ${prazoExecucao}\n` +
      `💳 *IBAN:* ${ibanPagamento}\n\n` +
      `🔗 *Consulte a proposta online e valide os termos:*\n${publicPortalUrl}\n\n` +
      `_Enviado pelo comercial ${comercialNome} - GPA Angola, Lda._`;
    openWhatsAppDirect(clienteTelefone, msg);
  };

  const handleApproveProposal = () => {
    setProposalEstado('aceite');
    const proposalObj: PropostaComercial = {
      id: `prop_${Date.now()}`,
      numero: numeroProposta,
      dealId: deal?.id,
      clienteNome,
      clienteNif,
      clienteEmpresa,
      clienteEmail,
      clienteTelefone,
      clienteEndereco,
      comercialNome,
      comercialEmail,
      dataEmissao,
      dataValidade,
      itens,
      subtotal,
      impostoTotal,
      totalGeral,
      condicoesPagamento,
      prazoExecucao,
      ibanPagamento,
      estado: 'aceite',
      linkPublico: publicPortalUrl,
      observacoes
    };
    onSaveProposal(proposalObj);
    alert(`🎉 Proposta ${numeroProposta} APROVADA com sucesso! O negócio foi marcado como Ganho no CRM.`);
  };

  const handleSave = () => {
    const proposalObj: PropostaComercial = {
      id: `prop_${Date.now()}`,
      numero: numeroProposta,
      dealId: deal?.id,
      clienteNome,
      clienteNif,
      clienteEmpresa,
      clienteEmail,
      clienteTelefone,
      clienteEndereco,
      comercialNome,
      comercialEmail,
      dataEmissao,
      dataValidade,
      itens,
      subtotal,
      impostoTotal,
      totalGeral,
      condicoesPagamento,
      prazoExecucao,
      ibanPagamento,
      estado: proposalEstado,
      linkPublico: publicPortalUrl,
      observacoes
    };
    onSaveProposal(proposalObj);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Controls */}
        <div className="bg-[#1B365D] text-white p-4 border-b border-blue-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-lg text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif uppercase tracking-wider">
                Gerador Automático de Proposta Comercial PDF
              </h3>
              <p className="text-xs text-blue-200">
                Documento oficial GPA Angola com logótipo, NIF, discriminação em Kz e termos legais.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'A Gerar PDF...' : 'Descarregar PDF'}
            </button>

            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>

            <button
              onClick={() => {
                const proposalObj: PropostaComercial = {
                  id: `prop_${Date.now()}`,
                  numero: numeroProposta,
                  dealId: deal?.id,
                  clienteNome,
                  clienteNif,
                  clienteEmpresa,
                  clienteEmail,
                  clienteTelefone,
                  clienteEndereco,
                  comercialNome,
                  comercialEmail,
                  dataEmissao,
                  dataValidade,
                  itens,
                  subtotal,
                  impostoTotal,
                  totalGeral,
                  condicoesPagamento,
                  prazoExecucao,
                  ibanPagamento,
                  estado: 'enviada',
                  linkPublico: publicPortalUrl,
                  observacoes
                };
                onOpenPortal(proposalObj);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Simular Portal do Cliente
            </button>

            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white text-xs font-bold px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Main Content (Split view: Editor Controls + Live Printable Canvas) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100 space-y-6">
          
          {/* Quick Share Link & WhatsApp Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <Share2 className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Portal do Cliente:</strong> {publicPortalUrl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Enviar por WhatsApp
              </button>
            </div>
          </div>

          {/* Form Editor Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              📝 Configuração dos Dados da Proposta
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Nº Proposta</label>
                <input
                  type="text"
                  value={numeroProposta}
                  onChange={(e) => setNumeroProposta(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Empresa Cliente</label>
                <input
                  type="text"
                  value={clienteEmpresa}
                  onChange={(e) => setClienteEmpresa(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">NIF do Cliente</label>
                <input
                  type="text"
                  value={clienteNif}
                  onChange={(e) => setClienteNif(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Contacto Responsável</label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Telefone Cliente</label>
                <input
                  type="text"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Email Cliente</label>
                <input
                  type="text"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-900"
                />
              </div>
            </div>

            {/* Editable Items Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Tabela de Serviços & Valores (Kz)</span>
                <button
                  onClick={handleAddItem}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Item
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-2">Descrição do Serviço / Artigo</th>
                      <th className="p-2 w-20">Qtd</th>
                      <th className="p-2 w-32">Preço Unit (Kz)</th>
                      <th className="p-2 w-24">IVA (%)</th>
                      <th className="p-2 w-32 text-right">Total (Kz)</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itens.map((item) => (
                      <tr key={item.id}>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.descricao}
                            onChange={(e) => handleUpdateItem(item.id, 'descricao', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleUpdateItem(item.id, 'quantidade', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={item.precoUnitario}
                            onChange={(e) => handleUpdateItem(item.id, 'precoUnitario', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={item.impostoPct}
                            onChange={(e) => handleUpdateItem(item.id, 'impostoPct', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center"
                          />
                        </td>
                        <td className="p-1.5 text-right font-bold font-mono">
                          {formatAOA(item.total)}
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Document Canvas for PDF Generation (Targeted by html2canvas) */}
          <div className="flex justify-center">
            <div
              ref={proposalRef}
              className="bg-white w-full max-w-[800px] p-8 sm:p-10 rounded shadow-md border border-gray-300 text-gray-900 font-sans space-y-6"
              style={{ minHeight: '1050px' }}
            >
              {/* Header Banner GPA Angola */}
              <div className="border-b-2 border-[#1B365D] pb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {appLogo ? (
                    <img src={appLogo} alt="GPA Angola" className="h-16 object-contain" />
                  ) : (
                    <div className="w-14 h-14 bg-[#1B365D] text-white rounded-lg flex items-center justify-center font-bold text-xl font-serif">
                      GPA
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-black font-serif text-[#1B365D] tracking-tight">
                      GPA ANGOLA, LDA.
                    </h1>
                    <p className="text-[11px] text-gray-600 font-semibold">
                      Gestão, Projetos & Assistência Técnica Comercial
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      NIF: 5417000000 | Luanda, Angola
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block bg-[#1B365D] text-white text-xs font-bold font-mono px-3 py-1 rounded">
                    PROPOSTA COMERCIAL
                  </div>
                  <p className="text-sm font-bold font-mono text-gray-900">{numeroProposta}</p>
                  <p className="text-[11px] text-gray-500">Data: {dataEmissao}</p>
                  <p className="text-[11px] text-amber-700 font-semibold">Válido até: {dataValidade}</p>
                </div>
              </div>

              {/* Client & Sales Rep Cards */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#1B365D] tracking-wider block">
                    DESTINATÁRIO / CLIENTE
                  </span>
                  <p className="font-bold text-sm text-gray-900">{clienteEmpresa}</p>
                  <p className="text-gray-700">Att: {clienteNome}</p>
                  <p className="text-gray-600 font-mono">NIF: {clienteNif}</p>
                  <p className="text-gray-600">{clienteEndereco}</p>
                  <p className="text-gray-600">{clienteTelefone} | {clienteEmail}</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#1B365D] tracking-wider block">
                    RESPONSÁVEL COMERCIAL GPA
                  </span>
                  <p className="font-bold text-sm text-gray-900">{comercialNome}</p>
                  <p className="text-gray-700">Gabinete Técnico Comercial</p>
                  <p className="text-gray-600">{comercialEmail}</p>
                  <p className="text-gray-600">GPA Luanda Central</p>
                </div>
              </div>

              {/* Services Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B365D] border-b border-gray-200 pb-1">
                  1. Descrição dos Serviços & Especificações
                </h3>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1B365D] text-white">
                      <th className="p-2.5 font-bold">Item</th>
                      <th className="p-2.5 font-bold">Descrição do Serviço / Equipamento</th>
                      <th className="p-2.5 font-bold text-center">Qtd</th>
                      <th className="p-2.5 font-bold text-right">Preço Unit. (Kz)</th>
                      <th className="p-2.5 font-bold text-right">Total (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itens.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="p-2.5 font-mono text-gray-500 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-medium text-gray-900">{item.descricao}</td>
                        <td className="p-2.5 text-center font-mono">{item.quantidade}</td>
                        <td className="p-2.5 text-right font-mono">{formatAOA(item.precoUnitario)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-gray-900">{formatAOA(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Ilíquido:</span>
                    <span className="font-mono">{formatAOA(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Imposto IVA (14%):</span>
                    <span className="font-mono">{formatAOA(impostoTotal)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-1.5 flex justify-between font-bold text-sm text-[#1B365D]">
                    <span>TOTAL PROPOSTA:</span>
                    <span className="font-mono text-amber-600">{formatAOA(totalGeral)}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Conditions */}
              <div className="space-y-2 pt-2 border-t border-gray-200 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                  2. Condições Comerciais & Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                  <div>
                    <span className="font-bold block text-gray-900">Condições de Pagamento:</span>
                    <p>{condicoesPagamento}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-gray-900">Prazo de Execução:</span>
                    <p>{prazoExecucao}</p>
                  </div>
                  <div className="md:col-span-2 border-t border-gray-200 pt-2">
                    <span className="font-bold block text-gray-900">Dados Bancários para Transferência:</span>
                    <p className="font-mono text-blue-900 font-semibold">{ibanPagamento}</p>
                  </div>
                </div>
              </div>

              {/* Notes & Signatures */}
              <div className="space-y-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                <p>
                  <strong>Observações:</strong> {observacoes}
                </p>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center">
                  <div className="border-t border-gray-400 pt-2 flex flex-col items-center">
                    <p className="font-bold text-gray-900">{comercialNome}</p>
                    <p className="text-[10px] text-gray-500">Pela GPA Angola, Lda.</p>
                  </div>
                  <div className="border-t border-gray-400 pt-2 flex flex-col items-center">
                    {digitalSignature ? (
                      <div className="mb-2">
                        <img src={digitalSignature} alt="Assinatura Digital" className="h-12 object-contain" />
                        <span className="text-[9px] text-emerald-600 font-bold block">✓ Assinado Digitalmente</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSignaturePad(true)}
                        className="mb-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded border border-dashed border-slate-400 flex items-center gap-1 cursor-pointer"
                      >
                        <PenTool size={11} /> Desenhar Assinatura Digital
                      </button>
                    )}
                    <p className="font-bold text-gray-900">{clienteEmpresa}</p>
                    <p className="text-[10px] text-gray-500">Adjudicação / Carimbo do Cliente</p>
                  </div>
                </div>

                {/* Digital Signature Pad Modal */}
                {showSignaturePad && (
                  <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-blue-600" /> Assinatura Digital
                        </h4>
                        <button onClick={() => setShowSignaturePad(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
                      </div>
                      <p className="text-xs text-slate-500">Desenhe a sua assinatura no quadro abaixo com o mouse ou dedo:</p>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                        <canvas
                          ref={canvasRef}
                          width={320}
                          height={140}
                          className="w-full h-[140px] touch-none cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          onClick={clearSignature}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg"
                        >
                          Limpar
                        </button>
                        <button
                          onClick={confirmSignature}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <Check size={14} /> Confirmar Assinatura
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Documento eletrónico processado por GPA Angola CRM v2.5.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApproveProposal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar & Fechar Negócio (Ganho)
            </button>
            <button
              onClick={handleSave}
              className="bg-[#1B365D] hover:bg-blue-950 text-white font-bold text-xs px-4 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Guardar Proposta no CRM
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-3 py-2 rounded cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
