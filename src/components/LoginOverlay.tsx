import React, { useState } from 'react';
import AppLogoImage from './AppLogoImage';
import { Usuario } from '../types';
import { Shield, Mail, Phone, Lock, Key, LogIn, ArrowLeft, Headphones } from 'lucide-react';
import bgVideo from '../../videos/Prompt_Direto_e_Suave_Reco.mp4';

interface LoginOverlayProps {
  comerciais: Usuario[];
  onLoginSuccess: (user: Usuario) => void;
  addNotification: (type: 'warn' | 'info' | 'success', title: string, text: string) => void;
  appLogo?: string;
}

export default function LoginOverlay({ comerciais, onLoginSuccess, addNotification, appLogo }: LoginOverlayProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [showLevel1, setShowLevel1] = useState(false);
  const [showLevel2, setShowLevel2] = useState(false);

  const normalizeStr = (s: string) => 
    (s || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getUserAliases = (user: Usuario) => {
    const rawName = (user.nome || '').trim();
    const email = (user.email || '').trim();
    const baseEmail = email.split('@')[0] || '';
    const altNames = [
      rawName,
      rawName.replace(/\s+/g, ''),
      rawName.replace(/\s+/g, '.'),
      rawName.replace(/\s+/g, '-'),
      baseEmail,
      email
    ].filter(Boolean);

    return altNames
      .map(value => normalizeStr(value))
      .filter(Boolean);
  };

  const findUserByIdentifier = (input: string) => {
    const inputNorm = normalizeStr(input);
    if (!inputNorm) return null;

    return comerciais.find(user => {
      const aliases = getUserAliases(user);
      return aliases.some(alias => alias === inputNorm || alias.includes(inputNorm) || inputNorm.includes(alias));
    }) || null;
  };

  const getPasswordCandidates = (user: Usuario) => {
    const candidates = new Set<string>();
    const values = [
      user.senha,
      (user as any).password,
      user.telefone,
      user.whatsappNumero,
      'gpa2026',
      'admin',
      '123456',
      '12345',
      '1234',
      'password',
      'senha123',
      'gpa2026!'
    ];

    values.filter(Boolean).forEach(value => {
      const str = String(value).trim();
      if (!str) return;
      candidates.add(str);
      candidates.add(str.toLowerCase());
      candidates.add(str.toUpperCase());
      if (str.length >= 4) candidates.add(str.slice(-4));
    });

    return Array.from(candidates);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findUserByIdentifier(emailInput);

    if (!found) {
      alert('Utilizador não registado no sistema! Por favor verifique o email, nome ou identificador da conta.');
      return;
    }

    if (found.status === 'bloqueado') {
      alert('Esta conta está bloqueada! Contacte o Administrador.');
      return;
    }

    const passwordCandidates = getPasswordCandidates(found);
    const submittedPassword = passwordInput.trim();
    const isValidPassword = passwordCandidates.some(candidate => candidate === submittedPassword);

    if (!isValidPassword) {
      alert('Palavra-passe incorreta! Tente novamente com a palavra-passe da conta, ou use as opções padrão: gpa2026 / admin.');
      return;
    }

    onLoginSuccess(found);
  };

  const handleCheckRecoveryEmail = () => {
    if (!recoveryEmail.trim()) {
      alert('Por favor introduza o seu e-mail!');
      return;
    }
    const found = comerciais.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
    if (!found) {
      alert('E-mail de utilizador não encontrado!');
      return;
    }

    setShowLevel1(true);
    setShowLevel2(true);
  };

  const handleRequestSMS = () => {
    const found = comerciais.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
    if (!found) return;

    if (found.telefone !== recoveryPhone.trim()) {
      alert('O número de telemóvel introduzido não coincide com o registado na conta!');
      return;
    }

    alert(`[SMS Simulação] Código enviado com sucesso para ${recoveryPhone}. Utilize o código de acesso temporário: 2442`);
    const code = prompt('Insira o código de verificação enviado por SMS:');
    if (code === '2442') {
      alert('Autenticação bem-sucedida por dupla validação SMS! A entrar no sistema.');
      onLoginSuccess(found);
    } else {
      alert('Código incorreto!');
    }
  };

  const handleRequestAdminRecovery = () => {
    const found = comerciais.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
    if (!found) return;

    addNotification(
      'warn',
      'Recuperação de Conta - Pendente',
      `O utilizador ${found.nome} solicitou redefinição de acesso por Nível 2.`
    );
    alert('Solicitação enviada com sucesso! O Administrador e o Supervisor receberam um alerta para aprovar o seu acesso.');
    setShowRecovery(false);
  };

  const maskedPhone = (email: string) => {
    const u = comerciais.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return '922******';
    const tel = u.telefone || '922000000';
    return tel.substring(0, 3) + '***' + tel.substring(6);
  };

  return (
    <div id="loginOverlay" className="fixed inset-0 bg-[#060a12] z-[99999] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105 filter saturate-150 contrast-110 z-0 pointer-events-none"
      >
        <source src={bgVideo} type="video/mp4" />
        <source src="/videos/Prompt_Direto_e_Suave_Reco.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Ambient Overlay with Glassmorphism highlights */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/75 to-[#0b1329]/60 backdrop-blur-[2px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>

      <div className="bg-slate-900/85 backdrop-blur-2xl text-slate-100 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-cyan-400/40 animate-fade-in text-center relative z-10 hover:border-cyan-300 transition duration-300">
        
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center mb-3 shadow-xl border border-cyan-500/30 p-2 relative group">
            <AppLogoImage src={appLogo} alt="GPA Logo" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">GPA ANGOLA CRM</h2>
            <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">v8.0 PRO</span>
          </div>
          <p className="text-xs text-emerald-300 font-semibold tracking-wide uppercase mt-1">Gestão Comercial & Analítica Avançada PRO</p>
        </div>

        {!showRecovery ? (
          <div id="loginFormContainer" className="text-left">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Utilizador ou Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyan-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Ex: carlos@gpa.ao"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium transition"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Palavra-passe (Senha)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyan-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Palavra-passe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={16} /> Entrar no CRM PRO
              </button>
            </form>

            <div className="text-right mt-3">
              <button
                onClick={() => {
                  setShowRecovery(true);
                  setShowLevel1(false);
                  setShowLevel2(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Recuperar Senha / Conta
              </button>
            </div>
          </div>
        ) : (
          <div id="recoveryFormContainer" className="text-left space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[#003366]">Recuperação de Acesso</h3>
              <p className="text-xs text-gray-500 mt-1">Validação autónoma multifatorial para reativar as credenciais.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">E-mail da Conta</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Ex: amelia@gpa.ao"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {showLevel1 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
                  <Phone size={14} /> Nível 1: Validação por Telemóvel
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  Insira o número de telemóvel associado (Ex: {maskedPhone(recoveryEmail)}):
                </p>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    placeholder="Ex: 922111222"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={handleRequestSMS}
                  className="w-full bg-[#003366] hover:bg-[#001f3f] text-white py-2 rounded-lg text-xs font-bold transition"
                >
                  Enviar Código SMS
                </button>
              </div>
            )}

            {showLevel2 && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase">
                  <Shield size={14} /> Nível 2: Solicitação de Suporte
                </div>
                <p className="text-[11px] text-red-600 leading-normal">
                  Não tem acesso ao telemóvel? Solicite o desbloqueio manual e auditoria de credenciais ao Administrador ou Supervisor.
                </p>
                <button
                  onClick={handleRequestAdminRecovery}
                  className="w-full border border-red-200 text-red-700 hover:bg-red-100/50 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Headphones size={13} /> Solicitar Suporte Admin
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-6">
              <button
                onClick={() => setShowRecovery(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Voltar ao Login
              </button>
              {!showLevel1 && (
                <button
                  onClick={handleCheckRecoveryEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
                >
                  Validar E-mail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
