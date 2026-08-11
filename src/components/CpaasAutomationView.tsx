import React, { useState } from 'react';
import { Cliente, Deal, Usuario } from '../types';
import {
  MessageSquare,
  Smartphone,
  Mail,
  PhoneCall,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Zap,
  Filter,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Bot,
  Activity,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface CpaasAutomationViewProps {
  clients: Cliente[];
  deals: Deal[];
  loggedUser: Usuario;
}

interface CpaasLog {
  id: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'voice';
  recipient: string;
  recipientPhoneOrEmail: string;
  message: string;
  status: 'enviado' | 'entregue' | 'lido' | 'falha';
  timestamp: string;
  automationRule?: string;
}

export default function CpaasAutomationView({
  clients,
  deals,
  loggedUser
}: CpaasAutomationViewProps) {
  // State for tabs
  const [activeTab, setActiveTab] = useState<'campaigns' | 'rules' | 'logs' | 'ai_copilot'>('campaigns');

  // Campaign State
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [recipientType, setRecipientType] = useState<'all' | 'stagnant' | 'single'>('all');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [sendSuccessNotice, setSendSuccessNotice] = useState<string | null>(null);

  // Copilot State
  const [clientQuery, setClientQuery] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isCopilotGenerating, setIsCopilotGenerating] = useState<boolean>(false);

  // Automation Rules Toggles
  const [rules, setRules] = useState([
    {
      id: 'rule_1',
      title: 'Aviso de Nova Proposta por WhatsApp',
      channel: 'whatsapp',
      description: 'Envia um resumo da proposta por WhatsApp assim que uma nova oportunidade for criada no CRM.',
      active: true,
      triggers: 142
    },
    {
      id: 'rule_2',
      title: 'Lembrete de Visita Agendada por SMS',
      channel: 'sms',
      description: 'Dispara SMS de confirmação ao cliente 2 horas antes do horário marcado da visita comercial.',
      active: true,
      triggers: 89
    },
    {
      id: 'rule_3',
      title: 'Follow-up Automático após 3 dias sem resposta',
      channel: 'whatsapp',
      description: 'Caso uma proposta esteja parada no pipeline há mais de 3 dias, envia mensagem de acompanhamento.',
      active: true,
      triggers: 56
    },
    {
      id: 'rule_4',
      title: 'Envio de Comprovativo & Agradecimento por E-mail',
      channel: 'email',
      description: 'Após conclusão da negociação, envia email automático com agradecimento e nota de encerramento.',
      active: false,
      triggers: 24
    }
  ]);

  // Initial Logs
  const [logs, setLogs] = useState<CpaasLog[]>([
    {
      id: 'log-1',
      channel: 'whatsapp',
      recipient: 'Sonangol EP',
      recipientPhoneOrEmail: '+244 923 111 222',
      message: 'Acompanhamento da proposta #2026-081 referente a suprimentos de manutenção preventiva.',
      status: 'lido',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      automationRule: 'Follow-up Automático'
    },
    {
      id: 'log-2',
      channel: 'sms',
      recipient: 'Refinaria de Luanda',
      recipientPhoneOrEmail: '+244 912 333 444',
      message: 'GPA Angola: Lembrete da visita agendada para hoje às 14:30. Engenheiro responsável: Carlos Silva.',
      status: 'entregue',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      automationRule: 'Lembrete de Visita'
    },
    {
      id: 'log-3',
      channel: 'email',
      recipient: 'Banco BAI',
      recipientPhoneOrEmail: 'compras@bai.co.ao',
      message: 'Proposta Comercial Atualizada - Sistema de Climatização e Assistência Técnica GPA Angola.',
      status: 'enviado',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      automationRule: 'Envio de Proposta'
    },
    {
      id: 'log-4',
      channel: 'whatsapp',
      recipient: 'Catoca Sociedade Mineira',
      recipientPhoneOrEmail: '+244 924 555 666',
      message: 'Bom dia! Confirmamos a recepção da sua solicitação de cotação para peças sobressalentes.',
      status: 'lido',
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      automationRule: 'Atendimento Rápido'
    }
  ]);

  // Log filter
  const [logChannelFilter, setLogChannelFilter] = useState<string>('all');

  // Toggle Rule
  const handleToggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Generate AI Campaign Text
  const handleGenerateAiMessage = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      let aiText = '';
      if (selectedChannel === 'whatsapp') {
        aiText = `Estimado(a) parceiro(a),\n\nEsperamos que esteja a ter uma excelente semana na sua empresa.\n\nA equipa comercial da GPA Angola tem o prazer de apresentar soluções atualizadas de gestão, manutenção e consultoria técnica especializadas para o mercado angolano.\n\nFicamos à total disposição para agendarmos uma breve chamada de alinhamento estratégico.\n\nAtentamente,\nGPA Angola - Gestão e Assistência Técnica\nLuanda, Angola`;
      } else if (selectedChannel === 'sms') {
        aiText = `GPA ANGOLA: Olá! Temos novidades em soluções técnicas e comerciais para a sua empresa. Contacte o seu gestor ou responda a este SMS.`;
      } else {
        aiText = `Assunto: Soluções Comerciais e Técnicas de Alto Desempenho - GPA Angola\n\nExmo(a). Senhor(a),\n\nEm nome da GPA Angola, vimos por este meio reforçar a nossa disponibilidade para prestar assistência e soluções personalizadas à vossa organização.\n\nContamos com uma equipa altamente qualificada em Luanda, com capacidade técnica para atender às exigências operacionais do seu setor.\n\nAguardamos o seu contacto para apresentar a nossa minuta técnica.\n\nCom os melhores cumprimentos,\nEquipa Comercial GPA Angola`;
      }

      setMessageText(aiText);
      setIsGeneratingAi(false);
    }, 800);
  };

  // Handle Send Campaign
  const handleSendCampaign = () => {
    if (!messageText.trim()) return;

    setIsSending(true);

    setTimeout(() => {
      let targetName = 'Todos os Clientes (Geral)';
      let targetContact = 'Base Completa CRM';

      if (recipientType === 'single') {
        const found = clients.find(c => c.id === selectedClient);
        if (found) {
          targetName = found.empresa || found.nome;
          targetContact = found.telefone || '+244 920 000 000';
        }
      } else if (recipientType === 'stagnant') {
        targetName = 'Clientes com Proposta Parada (>3 dias)';
        targetContact = 'Filtro Automático CRM';
      }

      const newLog: CpaasLog = {
        id: 'log-' + Date.now(),
        channel: selectedChannel,
        recipient: targetName,
        recipientPhoneOrEmail: targetContact,
        message: messageText,
        status: 'enviado',
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        automationRule: 'Disparo Manual / Campanha'
      };

      setLogs(prev => [newLog, ...prev]);
      setIsSending(false);
      setSendSuccessNotice(`Campanha enviada com sucesso via canal ${selectedChannel.toUpperCase()}!`);

      setTimeout(() => {
        setSendSuccessNotice(null);
      }, 4000);
    }, 1000);
  };

  // Open WhatsApp directly
  const handleOpenWhatsappDirect = () => {
    let phone = '244923000000';
    if (recipientType === 'single' && selectedClient) {
      const c = clients.find(cl => cl.id === selectedClient);
      if (c && c.telefone) {
        phone = c.telefone.replace(/\D/g, '');
      }
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  // Copilot Suggestion Generator
  const handleGenerateCopilotResponse = () => {
    if (!clientQuery.trim()) return;
    setIsCopilotGenerating(true);

    setTimeout(() => {
      const response = `Olá! Agradecemos o contacto para a **GPA Angola**.\n\nRelativamente à sua questão ("*${clientQuery.trim()}*"), informamos que a nossa equipa técnica em Luanda dispõe de capacidade imediata para atendimento.\n\nPodemos formalizar uma cotação detalhada com prazos de entrega e condições de pagamento em Kwanzas (AOA). Qual o melhor e-mail ou número de telefone para o envio?`;
      setAiSuggestion(response);
      setIsCopilotGenerating(false);
    }, 700);
  };

  const filteredLogs = logs.filter(l => logChannelFilter === 'all' || l.channel === logChannelFilter);

  return (
    <div className="space-y-6 font-sans text-gray-900 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#002b55] to-[#003366] rounded-2xl p-6 text-white shadow-lg border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                CPaaS & AI Suite
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Serviços de Comunicação Ativos
              </span>
            </div>

            <h1 className="text-2xl font-black font-serif tracking-wide text-white">
              Plataforma CPaaS & Automação Multicanal
            </h1>
            <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
              Integração completa de WhatsApp Business API, SMS Gateway Angola (Unitel/Movicel/Africell), E-mail Corporativo e Assistência Virtual IA com disparo automático baseado nas etapas do CRM.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              Disparo de Campanhas
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Regras Automáticas
            </button>
            <button
              onClick={() => setActiveTab('ai_copilot')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai_copilot'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              Copiloto IA de Atendimento
            </button>
          </div>
        </div>

        {/* Live Channel Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/60 font-semibold uppercase">WhatsApp API</div>
              <div className="font-extrabold text-white flex items-center gap-1.5">
                Conectado
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/60 font-semibold uppercase">Gateway SMS Angola</div>
              <div className="font-extrabold text-white">12.450 Créditos</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/60 font-semibold uppercase">SMTP E-mail Server</div>
              <div className="font-extrabold text-white">Operacional (DKIM OK)</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/60 font-semibold uppercase">Voz / SIP Gateway</div>
              <div className="font-extrabold text-white">Pronto / Transcrição IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Campaign Composer */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-[#001f3f] flex items-center gap-2 font-serif">
                <Send className="w-5 h-5 text-amber-500" />
                Criar Nova Transmissão CPaaS
              </h2>
              <span className="text-xs text-gray-400 font-mono">ID do Canal: GPA-CPAAS-AO-920</span>
            </div>

            {sendSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {sendSuccessNotice}
              </div>
            )}

            {/* Select Channel */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-gray-600 tracking-wider">
                1. Selecione o Canal de Comunicação:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedChannel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('sms')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedChannel === 'sms'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  SMS Angola
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedChannel === 'email'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  E-mail
                </button>
              </div>
            </div>

            {/* Select Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-gray-600 tracking-wider">
                2. Público-Alvo / Destinatários:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  recipientType === 'all' ? 'bg-[#001f3f]/5 border-[#001f3f] font-bold text-[#001f3f]' : 'border-gray-200 text-gray-700'
                }`}>
                  <input
                    type="radio"
                    name="recipient"
                    checked={recipientType === 'all'}
                    onChange={() => setRecipientType('all')}
                  />
                  <span>Todos os Clientes ({clients.length})</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  recipientType === 'stagnant' ? 'bg-[#001f3f]/5 border-[#001f3f] font-bold text-[#001f3f]' : 'border-gray-200 text-gray-700'
                }`}>
                  <input
                    type="radio"
                    name="recipient"
                    checked={recipientType === 'stagnant'}
                    onChange={() => setRecipientType('stagnant')}
                  />
                  <span>Propostas Paradas (&gt;3 dias)</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  recipientType === 'single' ? 'bg-[#001f3f]/5 border-[#001f3f] font-bold text-[#001f3f]' : 'border-gray-200 text-gray-700'
                }`}>
                  <input
                    type="radio"
                    name="recipient"
                    checked={recipientType === 'single'}
                    onChange={() => setRecipientType('single')}
                  />
                  <span>Cliente Específico</span>
                </label>
              </div>

              {recipientType === 'single' && (
                <div className="pt-2">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#001f3f] bg-white font-medium"
                  >
                    <option value="">-- Escolher Cliente da Lista --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.empresa || c.nome} ({c.telefone || 'Sem contacto registrado'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Message Body with AI Generation Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase text-gray-600 tracking-wider">
                  3. Conteúdo da Mensagem:
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiMessage}
                  disabled={isGeneratingAi}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  {isGeneratingAi ? 'Gerando com IA...' : 'Gerar com IA Gemini'}
                </button>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escreva a mensagem ou clique em 'Gerar com IA Gemini' para criar um texto profissional personalizado para Angola..."
                rows={6}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#001f3f] font-sans leading-relaxed text-gray-900 bg-gray-50/50"
              />

              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span>Caracteres: {messageText.length}</span>
                {selectedChannel === 'sms' && (
                  <span className="font-mono text-amber-700 font-bold">
                    Segmentos de SMS estimadas: {Math.ceil(messageText.length / 160) || 1}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleOpenWhatsappDirect}
                disabled={!messageText.trim()}
                className="px-4 py-2.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no WhatsApp Web/App
              </button>

              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={!messageText.trim() || isSending}
                className="px-6 py-2.5 bg-[#001f3f] hover:bg-[#002b55] text-white rounded-xl text-xs font-black tracking-wide uppercase shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-400" />
                {isSending ? 'A Disparar...' : 'Disparar via CPaaS Gateway'}
              </button>
            </div>
          </div>

          {/* Quick Metrics & Live Channel Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#001f3f] uppercase font-serif tracking-wider border-b border-gray-100 pb-2">
                📊 Estatísticas do Mês (CPaaS)
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">WhatsApp Mensagens Enviadas:</span>
                  <span className="font-extrabold text-[#001f3f]">1.284</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Taxa de Leitura WhatsApp:</span>
                  <span className="font-extrabold text-emerald-600">94.2%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">SMS Entregues em Luanda:</span>
                  <span className="font-extrabold text-[#001f3f]">840</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Taxa de Resposta do Cliente:</span>
                  <span className="font-extrabold text-amber-600">38.5%</span>
                </div>
              </div>
            </div>

            {/* Template Hints */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-amber-950 font-serif">
                <Zap className="w-4 h-4 text-amber-600" />
                Boas Práticas de CPaaS para Angola
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800">
                O envio de mensagens via WhatsApp tem uma taxa de abertura 4x maior em relação ao e-mail. Utilize sempre a formatação de Kwanzas (AOA) e mencione o número da proposta do CRM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#001f3f] font-serif">
                ⚡ Automações & Regras Trigger-Based
              </h2>
              <p className="text-xs text-gray-500">
                Disparos automáticos executados pelo servidor CPaaS com base nas alterações no CRM.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
              {rules.filter(r => r.active).length} Regras Ativas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                  rule.active ? 'bg-white border-gray-300 shadow-xs' : 'bg-gray-50/70 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {rule.channel === 'whatsapp' && (
                      <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                    )}
                    {rule.channel === 'sms' && (
                      <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <Smartphone className="w-4 h-4" />
                      </span>
                    )}
                    {rule.channel === 'email' && (
                      <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                        <Mail className="w-4 h-4" />
                      </span>
                    )}

                    <h3 className="font-extrabold text-gray-900 text-xs">
                      {rule.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                      rule.active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {rule.active ? 'ATIVADO' : 'DESATIVADO'}
                  </button>
                </div>

                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {rule.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 font-mono">
                  <span>Execuções totais: {rule.triggers}</span>
                  <span className="text-emerald-700 font-bold">Status: OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Copilot */}
      {activeTab === 'ai_copilot' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#001f3f] flex items-center gap-2 font-serif">
                <Bot className="w-5 h-5 text-amber-500" />
                Assistente IA de Resposta Rápida (WhatsApp Copilot)
              </h2>
              <p className="text-xs text-gray-500">
                Cole a mensagem do cliente para gerar uma resposta comercial formal, com termos técnicos e preços em Kwanzas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Pergunta ou Dúvida do Cliente:
              </label>
              <textarea
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Exemplo: Qual é o prazo de entrega das peças em Luanda e se aceitam pagamento a 30 dias com IVA incluído?"
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#001f3f]"
              />
              <button
                type="button"
                onClick={handleGenerateCopilotResponse}
                disabled={!clientQuery.trim() || isCopilotGenerating}
                className="w-full py-2.5 bg-[#001f3f] hover:bg-[#002b55] text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                {isCopilotGenerating ? 'Gerando resposta com IA...' : 'Gerar Resposta Comercial Recomendada'}
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Sugestão da IA (GPA Angola):</span>
                {aiSuggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestion);
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                )}
              </label>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl min-h-[140px] text-xs font-sans leading-relaxed text-gray-800 whitespace-pre-wrap">
                {aiSuggestion || 'A resposta sugerida pela inteligência artificial aparecerá aqui pronta para ser enviada por WhatsApp ou E-mail.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#001f3f]" />
            <h3 className="text-sm font-extrabold text-[#001f3f] uppercase font-serif tracking-wide">
              Histórico de Disparos & Status CPaaS
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Filtrar por Canal:</span>
            <select
              value={logChannelFilter}
              onChange={(e) => setLogChannelFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-gray-300 font-medium text-xs bg-white"
            >
              <option value="all">Todos os Canais</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">E-mail</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">Horário</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Destinatário</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Mensagem / Regra</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {log.channel === 'whatsapp' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                        WhatsApp
                      </span>
                    )}
                    {log.channel === 'sms' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                        SMS
                      </span>
                    )}
                    {log.channel === 'email' && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                        E-mail
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                    {log.recipient}
                  </td>

                  <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                    {log.recipientPhoneOrEmail}
                  </td>

                  <td className="p-3 max-w-xs truncate text-gray-600">
                    <span className="text-[10px] font-bold text-gray-400 block">{log.automationRule}</span>
                    {log.message}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {log.status === 'lido' && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Lido
                      </span>
                    )}
                    {log.status === 'entregue' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Entregue
                      </span>
                    )}
                    {log.status === 'enviado' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Enviado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
