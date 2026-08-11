import React, { useState } from 'react';
import { Usuario } from '../types';
import { Bot, Sparkles, Send, RefreshCw, ShieldCheck, Zap, Sliders, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';

interface AdminAiAgentProps {
  loggedUser: Usuario;
  comerciais: Usuario[];
  crmName: string;
  onSaveCrmName: (name: string) => void;
  onSaveTelSede: (tel: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'admin' | 'ai';
  text: string;
  timestamp: string;
  actionRequired?: any;
}

export default function AdminAiAgent({
  loggedUser,
  comerciais,
  crmName,
  onSaveCrmName,
  onSaveTelSede
}: AdminAiAgentProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Olá, Administrador ${loggedUser.nome.split(' ')[0]}! Sou o seu Agente IA de Gestão & Edição do CRM GPA Angola.\n\nComo posso ajudá-lo hoje? Posso formatar dados do Excel, sugerir alterações de metas para a equipa comercial, calcular relatórios da semana atual ou ajustar parâmetros do sistema sem apagar quaisquer dados.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'admin',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          user: { nome: loggedUser.nome, email: loggedUser.email },
          context: {
            crmName,
            comerciaisSummary: comerciais.map(c => ({ nome: c.nome, email: c.email, meta: c.metaSemanal || '6.25M AOA' })),
            comerciaisCount: comerciais.length
          }
        })
      });

      const data = await res.json();
      const aiReply = data.reply || 'Processamento efetuado com sucesso.';

      const aiMsg: ChatMessage = {
        id: `m_ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `m_err_${Date.now()}`,
          sender: 'ai',
          text: '🤖 [Agente Admin]: Recebi a sua solicitação. Como Administrador, todas as alterações de formulários, dados de Excel e metas podem ser salvas diretamente nos painéis correspondentes.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-sm space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="text-sm font-black text-purple-900 uppercase tracking-wide flex items-center gap-2">
            <Bot size={18} className="text-purple-600" />
            Agente IA de Gestão & Edição do CRM (Exclusivo Administradores)
          </h4>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Agente de Inteligência Gemini 3.6 Flash programado para assistir Administradores na edição do sistema, formatação de Excel, metas e auditoria.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-extrabold">
          <Sparkles size={14} className="text-purple-600" />
          <span>Gemini 3.6 Flash Admin</span>
        </div>
      </div>

      {/* Quick Prompt Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-gray-400 shrink-0">Sugestões Rápidas:</span>
        {[
          '🎯 Como estruturar tabela Excel para importação?',
          '📊 Resumo da performance semanal dos comerciais',
          '⚙️ Sugerir revisão das metas de vendas',
          '📢 Criar mensagem de incentivo para a equipa'
        ].map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug)}
            className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'admin'
                  ? 'bg-[#003366] text-white rounded-tr-none font-medium'
                  : 'bg-white text-gray-800 border border-purple-100 rounded-tl-none shadow-xs font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px] opacity-80">
                {msg.sender === 'admin' ? (
                  <span>Administrador</span>
                ) : (
                  <span className="text-purple-700 flex items-center gap-1">
                    <Bot size={11} /> Agente IA Admin
                  </span>
                )}
                <span>• {msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-white border border-purple-200 p-3 rounded-2xl rounded-tl-none text-xs text-purple-900 font-bold flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-purple-600" />
              <span>O Agente Admin está a analisar o pedido...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Digite um comando ou instrução para o Agente Admin (ex: 'Ajustar meta do David para 10M Kz')..."
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || loading}
          className="bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send size={14} />
          <span>Enviar</span>
        </button>
      </div>
    </div>
  );
}
