import React, { useState } from 'react';

interface PlanningWizardProps {
  onClose: () => void;
}

export default function PlanningWizard({ onClose }: PlanningWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    proposito: '', promessas: '', valorComplementar: '',
    bhag5: '', bhag10: '', bhag25: '',
    metaBronze: '', metaPrata: '', metaOuro: '',
    prioridades: [{ nome: '', peso: 1 }, { nome: '', peso: 1 }, { nome: '', peso: 1 }]
  });

  const steps = [
    { title: 'Identidade', desc: 'Qual o Propósito e Promessas da sua marca?' },
    { title: 'Alvo BHAG', desc: 'Onde vocês querem chegar em 5, 10 e 25 anos?' },
    { title: 'Metas do Ano', desc: 'Defina suas metas Bronze, Prata e Ouro.' },
    { title: 'Prioridades do Trimestre', desc: 'Escolha exatamente 3 prioridades.' },
  ];

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-4">
          <textarea placeholder="Propósito da marca" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, proposito: e.target.value})} />
          <textarea placeholder="Promessas da marca" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, promessas: e.target.value})} />
          <div className="bg-red-50 p-4 rounded-xl text-red-900">Valores do Grupo Ciatos: Integridade, Inovação, Foco no Cliente</div>
          <input placeholder="Valor Complementar da Unidade" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, valorComplementar: e.target.value})} />
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <input placeholder="Meta 5 anos" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, bhag5: e.target.value})} />
          <input placeholder="Meta 10 anos" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, bhag10: e.target.value})} />
          <input placeholder="Meta 25 anos" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, bhag25: e.target.value})} />
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <input type="number" placeholder="Meta Bronze" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, metaBronze: e.target.value})} />
          <input type="number" placeholder="Meta Prata" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, metaPrata: e.target.value})} />
          <input type="number" placeholder="Meta Ouro" className="w-full p-4 border rounded-xl" onChange={e => setData({...data, metaOuro: e.target.value})} />
          <div className="text-sm text-gray-500 italic">IA: "Sua meta Ouro parece bastante ambiciosa para o cenário atual!"</div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          {data.prioridades.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Prioridade ${i+1}`} className="flex-grow p-4 border rounded-xl" onChange={e => {
                const newPrioridades = [...data.prioridades];
                newPrioridades[i].nome = e.target.value;
                setData({...data, prioridades: newPrioridades});
              }} />
              <input type="number" placeholder="Peso" className="w-20 p-4 border rounded-xl" onChange={e => {
                const newPrioridades = [...data.prioridades];
                newPrioridades[i].peso = parseInt(e.target.value);
                setData({...data, prioridades: newPrioridades});
              }} />
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-10">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-10 shadow-2xl">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Configuração PEUP</h2>
        <p className="text-gray-500 mb-8">Etapa {step} de {steps.length}: {steps[step - 1].title} - {steps[step - 1].desc}</p>
        
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mb-8 min-h-[300px]">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <button onClick={onClose} className="px-8 py-4 rounded-full border border-gray-300 text-gray-700">Cancelar</button>
          <div className="flex gap-4">
            <button disabled={step === 1} onClick={() => setStep(step - 1)} className="px-8 py-4 rounded-full border border-gray-300">Voltar</button>
            <button onClick={() => step === steps.length ? onClose() : setStep(step + 1)} className="px-8 py-4 rounded-full bg-red-900 text-white font-semibold">
              {step === steps.length ? 'Finalizar e Gerar PDF' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
