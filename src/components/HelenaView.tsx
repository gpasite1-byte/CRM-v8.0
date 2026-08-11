import React, { useState, useEffect, useRef } from 'react';
import { Usuario, Deal, Cliente } from '../types';
import { Sparkles, Volume2, VolumeX, Mic, Send, PlayCircle, FileText, Mail, PhoneCall, Calculator, ShieldAlert, Copy, Check } from 'lucide-react';

interface HelenaViewProps {
  loggedUser: Usuario;
  deals: Deal[];
  clients: Cliente[];
  comerciais: Usuario[];
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export default function HelenaView({
  loggedUser,
  deals,
  clients,
  comerciais
}: HelenaViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInput] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Olá! Sou a **HELENA IA v8.0 PRO**, a sua Secretária Virtual & Inteligência Analítica da **GPA Angola**.
        
Estou equipada com os mais avançados algoritmos de previsão de faturamento, gerador de propostas, minutas de email de alta conversão e análise preditiva do pipeline comercial em tempo real!
        
🎙️ **Dica v8.0:** Utilize o **Microfone** para ditar em voz alta ou selecione um dos **Recursos Expandidos 8.0** ao lado para ações instantâneas!`
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    // Clean up markdown text for synthesis
    let cleanText = text.replace(/[*#`📈👥💰📊🏆⚠️💡🏢📞🤝✉️🎯📋]/g, '');
    cleanText = cleanText.replace(/AOA/g, 'kwanza');
    cleanText = cleanText.replace(/Kz/g, 'kwanza');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT'; // Use Portuguese pronunciation
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (STT) Microphone Dictation
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('A gravação de voz não é suportada neste navegador. Por favor use o Google Chrome.');
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang = 'pt-AO';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    setIsListening(true);

    recognizer.onstart = () => {
      setInput('GPA AUXILIO está a escutar... Fale agora.');
    };

    recognizer.onerror = () => {
      setIsListening(false);
      setInput('');
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    recognizer.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };

    recognizer.start();
  };

  // Get current state context for backend GPA AUXILIO intelligence
  const getContextPayload = () => {
    const propostasCount = deals.length;
    const aprovado = deals.filter(d => d.etapa === 'fechado').reduce((sum, d) => sum + d.valor, 0);
    const pipelineAberto = deals.filter(d => ['proposta', 'negociacao', 'producao', 'lead', 'contato', 'visita'].includes(d.etapa)).reduce((sum, d) => sum + d.valor, 0);
    const forecast = aprovado + 
                     (deals.filter(d => d.etapa === 'negociacao').reduce((sum, d) => sum + d.valor, 0) * 0.603472856) + 
                     (deals.filter(d => ['proposta', 'lead', 'contato', 'visita'].includes(d.etapa)).reduce((sum, d) => sum + d.valor, 0) * 0.40) + 
                     (deals.filter(d => d.etapa === 'producao').reduce((sum, d) => sum + d.valor, 0) * 1.0);
    const conversao = propostasCount ? Math.round((deals.filter(d => d.etapa === 'fechado').length / propostasCount) * 100) : 0;

    const performanceList = comerciais.filter(u => u.perfil === 'comercial').map(u => {
      const uDeals = deals.filter(d => d.comercialId === u.id);
      const uAprovado = uDeals.filter(d => d.etapa === 'fechado').reduce((sum, d) => sum + d.valor, 0);
      const percentMeta = u.metaSemanal ? Math.round((uAprovado / u.metaSemanal) * 100) : 0;
      return { nome: u.nome, percentMeta };
    }).sort((a, b) => b.percentMeta - a.percentMeta);

    return {
      dealsCount: propostasCount,
      aprovadoVal: new Intl.NumberFormat('pt-AO').format(aprovado) + ' AOA',
      pipelineAbertoVal: new Intl.NumberFormat('pt-AO').format(pipelineAberto) + ' AOA',
      forecastVal: new Intl.NumberFormat('pt-AO').format(forecast) + ' AOA',
      conversaoPct: conversao + '%',
      clientsCount: clients.length,
      userRole: loggedUser.perfil,
      performanceList,
      closedCount: deals.filter(d => d.etapa === 'fechado').length
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || text === 'GPA AUXILIO está a escutar... Fale agora.') return;

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: getContextPayload()
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        if (isVoiceEnabled) {
          speakText(data.reply);
        }
      } else {
        throw new Error('Fallback response needed');
      }
    } catch (e) {
      setIsTyping(false);
      setTimeout(() => {
        const fallback = generateLocalResponse(text);
        setMessages(prev => [...prev, { sender: 'ai', text: fallback }]);
        if (isVoiceEnabled) {
          speakText(fallback);
        }
      }, 500);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateLocalResponse = (message: string): string => {
    const q = message.toLowerCase();
    const userSalute = loggedUser.nome.split(' ')[0];
    const hour = new Date().getHours();
    const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    if (q.includes('email') || q.includes('minuta') || q.includes('follow-up') || q.includes('followup')) {
      return `✉️ <strong>MINUTA DE EMAIL DE FOLLOW-UP COMERCIAL (GPA ANGOLA)</strong><br><br>
<strong>Assunto:</strong> GPA Angola — Ponto de Situação e Acompanhamento de Proposta Comercial<br><br>
Prezado(a) [Nome do Cliente / Decisor],<br><br>
Espero que este email o(a) encontre bem.<br><br>
Escrevo-lhe na sequência da nossa recente reunião e envio da proposta comercial para o fornecimento de serviços e soluções corporativas.<br><br>
Gostaria de agendar uma breve chamada de 5 minutos esta semana para esclarecer eventuais dúvidas técnicas, ajustar detalhes operacionais e validar os próximos passos para a adjudicação.<br><br>
Fico no aguardo da sua disponibilidade.<br><br>
Com os melhores cumprimentos,<br>
<strong>${loggedUser.nome}</strong><br>
<em>GPA Angola — Departamento Comercial</em>`;
    }

    if (q.includes('guião') || q.includes('guiao') || q.includes('chamada') || q.includes('prospecção') || q.includes('prospeccao')) {
      return `📞 <strong>GUIÃO DE PROSPECÇÃO TELEFÓNICA (CALL SCRIPT CORPORATIVO)</strong><br><br>
<strong>1. Abertura & Impacto:</strong><br>
"Bom dia, [Nome do Cliente]. O meu nome é ${loggedUser.nome} da GPA Angola. Falo com o responsável pela área de compras e TI?"<br><br>
<strong>2. Apresentação de Valor:</strong><br>
"A GPA Angola tem ajudado grandes empresas no país a otimizar processos de gestão, licenciamento e automação de serviços, reduzindo custos operacionais até 25%."<br><br>
<strong>3. Qualificação:</strong><br>
"Gostaria de saber se a sua empresa tem planeado rever a infraestrutura de software ou renovar licenças para o presente trimestre?"<br><br>
<strong>4. Fecho de Reunião:</strong><br>
"Perfeito! Podemos agendar uma visita técnica presencial de 20 minutos na próxima Terça-feira às 10h00 para apresentar um diagnóstico sem compromisso?"`;
    }

    if (q.includes('iva') || q.includes('imposto') || q.includes('cálculo') || q.includes('calculo') || q.includes('simulador')) {
      return `🎯 <strong>CÁLCULO E SIMULADOR DE IVA ANGOLANO (14%)</strong><br><br>
Em Angola, a taxa geral de IVA aplicável a prestação de serviços e vendas de equipamentos é de <strong>14%</strong>.<br><br>
• <strong>Exemplo de Proposta:</strong> 10.000.000,00 AOA (Líquido)<br>
• <strong>IVA (14%):</strong> 1.400.000,00 AOA<br>
• <strong>Valor Total Bruto:</strong> 11.400.000,00 AOA<br><br>
💡 <em>Nota Importante GPA:</em> Para efeitos de comissão comercial, o bónus de superação de meta é calculado sobre a margem de vendas líquida de IVA.`;
    }

    if (q.includes('inativo') || q.includes('risco') || q.includes('diagnostico') || q.includes('atenção')) {
      const inativos = clients.filter(c => c.status === 'inativo' || c.ultimaVisita === '-');
      return `⚠️ <strong>DIAGNÓSTICO DE CLIENTES EM RISCO / SEM CONTATOS RECENTES</strong><br><br>
Foram identificados <strong>${inativos.length} clientes</strong> sem registo de visita recente no sistema.<br><br>
Recomenda-se realizar uma ação de reativação imediata junto dos seguintes decisores:<br>
${inativos.slice(0, 5).map(c => `• 🏢 <strong>${c.empresa}</strong> (${c.nome}) — Tel: ${c.telefone}`).join('<br>')}<br><br>
💡 <em>Ação Recomendada pelo GPA AUXILIO:</em> Agende uma visita de cortesia técnica diretamente no separador <strong>Agenda & Visitas</strong>!`;
    }

    if (q.includes('relatorio') || q.includes('resumo') || q.includes('semana') || q.includes('balanço') || q.includes('balanco')) {
      const total = deals.reduce((sum, d) => sum + d.valor, 0);
      const aprov = deals.filter(d => d.etapa === 'fechado').reduce((sum, d) => sum + d.valor, 0);
      return `📈 <strong>Resumo Comercial — GPA Angola</strong><br><br>
${saudacao}, <strong>${userSalute}</strong>! Aqui está o balanço consolidado do pipeline:<br><br>
• Carteira total de clientes: <strong>${clients.length} empresas</strong>.<br>
• Oportunidades em carteira: <strong>${deals.length} propostas</strong> no valor de <strong>${new Intl.NumberFormat('pt-AO').format(total)} Kz</strong>.<br>
• Faturamento aprovado fechado: <strong>${new Intl.NumberFormat('pt-AO').format(aprov)} Kz</strong>.<br><br>
💡 <em>Conselho GPA AUXILIO:</em> Priorize a negociação direta com as propostas acima de 10M AOA!`;
    }

    if (q.includes('vendedor') || q.includes('gestor') || q.includes('melhor') || q.includes('destaque') || q.includes('ranking')) {
      return `🏆 <strong>Ranking de Gestores Comerciais (GPA Angola)</strong><br><br>
Liderança de atingimento da meta semanal:<br><br>
🥇 <strong>Luiza Baltazar</strong> — 🏆 Destaque Sênior<br>
🥈 <strong>Marta de Oliveira</strong> — Meta semanal próxima do fecho<br>
🥉 <strong>Amélia Cassinda</strong> — Foco em propostas abertas<br><br>
Parabéns aos líderes! Consulte os detalhes no separador <strong>Metas & Performance</strong>.`;
    }

    return `👋 Olá, <strong>${userSalute}</strong>! Sou o <strong>GPA AUXILIO</strong>, a inteligência comercial da GPA Angola.<br><br>
Estou preparado para ajudá-lo a elaborar emails, guiões de chamadas, simulação de propostas, análise do pipeline e gestão de metas.<br><br>
Utilize os botões de <strong>Recursos Expandidos</strong> ao lado para ações instantâneas!`;
  };

  const expandedResources = [
    { label: '📈 Resumo Geral de Vendas', icon: FileText, query: 'GPA AUXILIO, faz-me o resumo de vendas desta semana' },
    { label: '✉️ Minuta de Email de Follow-up', icon: Mail, query: 'Gera uma minuta de email comercial de acompanhamento' },
    { label: '📞 Guião de Chamada de Prospecção', icon: PhoneCall, query: 'Gera um guião de chamada fria para prospecção' },
    { label: '🎯 Simulador e Cálculo de IVA (14%)', icon: Calculator, query: 'Como funciona o cálculo do IVA nas propostas?' },
    { label: '⚠️ Clientes em Risco / Inativos', icon: ShieldAlert, query: 'Quais clientes estão inativos ou precisam de atenção?' },
    { label: '🏆 Ranking de Gestores Comerciais', icon: Sparkles, query: 'Qual gestor comercial teve o melhor desempenho?' }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      
      {/* GPA AUXILIO Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[calc(100vh-170px)]">
        
        {/* Chat window */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col h-full overflow-hidden">
          
          {/* GPA HELENA IA 8.0 Header */}
          <div className="p-4 bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#0A84FF] text-white flex items-center justify-between flex-shrink-0 border-b border-cyan-500/20 shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center border border-amber-300 shadow-md relative tracking-wider">
                H8.0
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black tracking-wider uppercase font-serif text-white">HELENA IA 8.0</h4>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded font-extrabold uppercase">PRO ELITE</span>
                </div>
                <span className="text-[10px] text-blue-100/80 block font-bold mt-0.5">Secretária Virtual & Inteligência Analítica GPA Angola</span>
              </div>
            </div>

            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`text-xs font-bold py-1.5 px-3 rounded-md border flex items-center gap-1.5 transition ${
                isVoiceEnabled 
                  ? 'border-amber-400/50 bg-amber-500/20 text-amber-300' 
                  : 'border-white/10 bg-transparent text-white/50'
              }`}
            >
              {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              Voz: {isVoiceEnabled ? 'Ativada' : 'Desativada'}
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-grow p-5 bg-gray-50/70 overflow-y-auto space-y-4">
            {messages.map((msg, i) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] ${
                    isAi ? 'self-start text-left' : 'self-end text-right ml-auto'
                  }`}
                >
                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed shadow-xs relative group ${
                      isAi
                        ? 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                        : 'bg-[#1B365D] text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {/* Render basic HTML layout inside message */}
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br>') }}></div>
                    
                    {/* Action Tools for AI message */}
                    {isAi && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 text-[10px]">
                        <button
                          onClick={() => speakText(msg.text)}
                          className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
                          title="Ouvir Resposta"
                        >
                          <PlayCircle size={12} /> Ouvir Voz
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.text, i)}
                          className="text-gray-700 hover:text-gray-900 font-bold flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300 transition"
                          title="Copiar Texto"
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check size={12} className="text-emerald-600" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copiar Minuta
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="self-start text-left max-w-[80%]">
                <div className="p-4 bg-white text-gray-500 font-semibold rounded-xl rounded-tl-none border border-gray-200 shadow-2xs flex items-center gap-2 animate-pulse text-xs">
                  <Sparkles size={14} className="text-amber-500 animate-spin" /> GPA AUXILIO está a processar a inteligência de vendas...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-gray-200 bg-white flex gap-2.5 items-center flex-shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escreva uma pergunta ou solicite uma minuta comercial ao GPA AUXILIO..."
              className="flex-grow px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] text-xs font-semibold bg-gray-50"
            />
            
            {/* STT Mic */}
            <button
              onClick={startSpeechRecognition}
              className={`p-2.5 rounded-lg border transition cursor-pointer ${
                isListening 
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              title="Falar por voz (Ditado)"
            >
              <Mic size={16} />
            </button>

            <button
              onClick={() => handleSendMessage()}
              className="bg-[#1B365D] hover:bg-[#122442] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Send size={15} />
              <span>Enviar</span>
            </button>
          </div>

        </div>

        {/* Preset suggestions & Expanded Resources right side */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-xs text-left">
            <div className="bg-[#1B365D] text-white p-2.5 rounded-lg mb-3 flex items-center justify-between">
              <h5 className="text-xs font-black uppercase tracking-wider font-serif">
                RECURSOS EXPANDIDOS & GERADORES (IA)
              </h5>
              <Sparkles size={14} className="text-amber-400" />
            </div>

            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
              Clique em qualquer recurso abaixo para gerar relatórios, guiões de prospecção ou minutas de email instantaneamente:
            </p>

            <div className="flex flex-col gap-2">
              {expandedResources.map((res, i) => {
                const Icon = res.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(res.query)}
                    className="w-full text-left bg-gray-50 hover:bg-blue-50/70 text-gray-900 border border-gray-200 hover:border-blue-300 p-2.5 rounded-lg text-xs font-bold leading-snug transition flex items-center justify-between cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon size={14} className="text-[#1B365D] shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{res.label}</span>
                    </span>
                    <Sparkles size={12} className="text-amber-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
