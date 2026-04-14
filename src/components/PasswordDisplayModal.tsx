import React from 'react';

interface PasswordDisplayModalProps {
  socioNome: string;
  senha: string;
  onClose: () => void;
}

export default function PasswordDisplayModal({ socioNome, senha, onClose }: PasswordDisplayModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Empresa criada com sucesso!</h2>
        <p className="text-sm text-gray-600 mb-4">
          Senha provisória do sócio {socioNome}: <strong className="text-lg">{senha}</strong>
        </p>
        <p className="text-xs text-gray-500 mb-6">Copie agora; será exibida apenas uma vez.</p>
        <button onClick={onClose} className="w-full bg-[#630d16] text-white py-2 rounded">Fechar</button>
      </div>
    </div>
  );
}
