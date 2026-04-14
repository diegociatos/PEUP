import React, { useState } from 'react';
import { User } from '../types';

interface ChangePasswordProps {
  user: User;
  onPasswordChanged: (user: User) => void;
}

export default function ChangePassword({ user, onPasswordChanged }: ChangePasswordProps) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('peup_users') || '[]');
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, senha: novaSenha, primeiro_acesso: false } : u);
    
    localStorage.setItem('peup_users', JSON.stringify(updatedUsers));
    console.log("PASSWORD_CHANGED", { userId: user.id });
    
    onPasswordChanged({ ...user, senha: novaSenha, primeiro_acesso: false });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
        <p className="text-sm text-gray-600 mb-4">Como é seu primeiro acesso, defina uma nova senha.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <input type="password" placeholder="Nova Senha" className="w-full p-2 border rounded" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
          <input type="password" placeholder="Confirmar Senha" className="w-full p-2 border rounded" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} />
          <button onClick={handleSave} className="w-full bg-[#630d16] text-white py-2 rounded">Salvar Senha</button>
        </div>
      </div>
    </div>
  );
}
