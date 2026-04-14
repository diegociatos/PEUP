import React from 'react';
import { MetaIndividual } from '../types';

interface MetaValidationModuleProps {
  metas: MetaIndividual[];
  setMetas: React.Dispatch<React.SetStateAction<MetaIndividual[]>>;
  currentUser: any;
}

export default function MetaValidationModule({ metas, setMetas, currentUser }: MetaValidationModuleProps) {
  const canManage = currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR';

  const handleValidar = (metaId: string, status: 'validada' | 'rejeitada') => {
    const novasMetas = metas.map(m => m.id === metaId ? {...m, status} : m);
    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas as MetaIndividual[]);
    alert(`Meta ${status} com sucesso!`);
  };

  const pendentes = metas.filter(m => m.status === 'pendente');
  const validadas = metas.filter(m => m.status === 'validada');

  if (!canManage) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Validação de Metas</h1>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Pendentes de Validação</h2>
        {pendentes.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-2 flex justify-between items-center">
                <span>{m.colaboradorId} - {m.indicador} (Realizado: {m.realizado})</span>
                <div className="flex gap-2">
                    <button onClick={() => handleValidar(m.id, 'validada')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Aprovar</button>
                    <button onClick={() => handleValidar(m.id, 'rejeitada')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Rejeitar</button>
                </div>
            </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Metas Validadas</h2>
        {validadas.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-2">
                <span>{m.colaboradorId} - {m.indicador} (Realizado: {m.realizado}) - Validada</span>
            </div>
        ))}
      </div>
    </div>
  );
}
