import React, { useState } from 'react';
import { Empresa } from '../types';

interface OnboardingModuleProps {
  onComplete: () => void;
}

const steps = [
  { title: 'Cadastrar Empresa', desc: 'Defina a base da sua operação.' },
  { title: 'Propósito e Valores', desc: 'O coração da sua cultura.' },
  { title: 'IA: Estrutura PEUP', desc: 'Gerando o alicerce estratégico.' },
  { title: 'Revisão do Líder', desc: 'Ajuste fino da estratégia.' },
  { title: 'Aprovação Admin', desc: 'Alinhamento com o grupo.' },
  { title: 'Metas Anuais', desc: 'Bronze, Prata e Ouro.' },
  { title: 'Prioridades Trimestrais', desc: 'Foco no curto prazo.' },
  { title: 'Primeiras Ações', desc: 'Mão na massa.' },
];

export default function OnboardingModule({ onComplete }: OnboardingModuleProps) {
  const [step, setStep] = useState(0);

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-10">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-10">
        <div className="bg-red-900 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{steps[step].title}</h1>
      <p className="text-xl text-gray-600 mb-10">{steps[step].desc}</p>
      
      <div className="flex-grow bg-gray-50 p-10 rounded-3xl border border-gray-100 mb-10 overflow-y-auto">
        {step === 0 && <div className="space-y-4"><input className="w-full p-4 rounded-xl border" placeholder="Nome da Empresa" /><input className="w-full p-4 rounded-xl border" placeholder="Segmento" /></div>}
        {step === 1 && <div className="space-y-4"><textarea className="w-full p-4 rounded-xl border" placeholder="Propósito..." /><textarea className="w-full p-4 rounded-xl border" placeholder="Valores..." /></div>}
        {step === 2 && <div className="p-8 bg-white rounded-2xl border text-center">IA gerando estrutura...</div>}
        {step === 3 && <div className="p-8 bg-white rounded-2xl border">Revisão do PEUP...</div>}
        {step === 4 && <div className="p-8 bg-white rounded-2xl border">Aguardando aprovação do Admin...</div>}
        {step === 5 && <div className="space-y-4"><input className="w-full p-4 rounded-xl border" placeholder="Meta Bronze" /><input className="w-full p-4 rounded-xl border" placeholder="Meta Prata" /><input className="w-full p-4 rounded-xl border" placeholder="Meta Ouro" /></div>}
        {step === 6 && <div className="space-y-4"><input className="w-full p-4 rounded-xl border" placeholder="Prioridade 1" /><input className="w-full p-4 rounded-xl border" placeholder="Prioridade 2" /></div>}
        {step === 7 && <div className="space-y-4"><input className="w-full p-4 rounded-xl border" placeholder="Ação 1" /><input className="w-full p-4 rounded-xl border" placeholder="Ação 2" /></div>}
      </div>

      <div className="flex justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-8 py-4 rounded-full border border-gray-300">Voltar</button>
        <button onClick={() => step === steps.length - 1 ? onComplete() : setStep(step + 1)} className="px-8 py-4 rounded-full bg-red-900 text-white font-semibold">
          {step === steps.length - 1 ? 'Finalizar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
