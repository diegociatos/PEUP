import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    console.log("LOGIN_ATTEMPT", { email, passwordLength: password.length });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      console.error("LOGIN_ERROR", err);
      setError('Credenciais inválidas. Por favor, verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col md:flex-row text-white w-full">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#0A0A0F] p-12 flex-col justify-between border-r border-white/5">
        <h1 className="text-3xl font-bold text-white">PEUP Gestão</h1>
        <div>
          <h2 className="text-5xl font-bold mb-6 leading-tight text-white">Transformando estratégia em execução.</h2>
          <p className="text-gray-400 text-lg">O copiloto estratégico para líderes que buscam resultados Ouro.</p>
        </div>
        <div className="text-gray-600 text-sm">© 2026 PEUP Gestão. Todos os direitos reservados.</div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-grow flex items-center justify-center p-8 bg-[#0A0A0F]">
        <div className="w-full max-w-sm">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400 mb-8">Entre com suas credenciais para continuar.</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-500" size={20} />
              <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0D0D14] border border-white/10 text-white" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
              <input type="password" placeholder="Senha" className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0D0D14] border border-white/10 text-white" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={handleLogin} className="w-full bg-[#7B1C1C] text-white py-4 rounded-xl font-semibold hover:bg-[#5e1515] transition-all">Entrar</button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            Não tem uma conta? <a href="#" className="text-[#7B1C1C] font-semibold hover:underline">Solicite acesso</a>
          </div>
        </div>
      </div>
    </div>
  );
}
