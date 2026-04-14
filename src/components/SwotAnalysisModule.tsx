import React, { useState } from 'react';
import { Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { SWOTAnalysis, User } from '../types';

interface SwotAnalysisModuleProps {
  swot: SWOTAnalysis;
  onSave: (swot: SWOTAnalysis) => void;
  currentUser: User;
}

export default function SwotAnalysisModule({ swot, onSave, currentUser }: SwotAnalysisModuleProps) {
  const [localSwot, setLocalSwot] = useState<SWOTAnalysis>(swot || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof SWOTAnalysis>('strengths');
  const [error, setError] = useState('');

  const canEdit = currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR';

  const addItem = () => {
    if (!newItem.trim()) return;
    setLocalSwot(prev => ({ ...prev, [activeCategory]: [...prev[activeCategory], newItem] }));
    setNewItem('');
  };

  const removeItem = (category: keyof SWOTAnalysis, index: number) => {
    setLocalSwot(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (localSwot.strengths.length === 0 || localSwot.weaknesses.length === 0 || 
        localSwot.opportunities.length === 0 || localSwot.threats.length === 0) {
      setError('Preencha pelo menos um item em cada bloco.');
      return;
    }
    onSave({
      ...localSwot,
      autor: currentUser.nome,
      data: new Date().toISOString()
    });
    alert('SWOT salva com sucesso!');
  };

  const categories: { key: keyof SWOTAnalysis, label: string }[] = [
    { key: 'strengths', label: 'Forças' },
    { key: 'weaknesses', label: 'Fraquezas' },
    { key: 'opportunities', label: 'Oportunidades' },
    { key: 'threats', label: 'Ameaças' }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">Análise SWOT</h2>
      {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded-lg flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat.key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">{cat.label}</h3>
            {canEdit && (
              <div className="flex gap-2 mb-2">
                <input 
                  value={activeCategory === cat.key ? newItem : ''}
                  onChange={(e) => { setActiveCategory(cat.key); setNewItem(e.target.value); }}
                  placeholder={`Adicionar ${cat.label.toLowerCase()}...`}
                  className="flex-1 p-2 rounded-lg border border-gray-200"
                />
                <button onClick={addItem} className="bg-[#630d16] text-white p-2 rounded-lg"><Plus size={18}/></button>
              </div>
            )}
            <ul className="space-y-1">
              {localSwot[cat.key].map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-sm">
                  {item}
                  {canEdit && <button onClick={() => removeItem(cat.key, index)} className="text-red-500"><Trash2 size={16}/></button>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {canEdit && (
        <button onClick={handleSave} className="mt-6 w-full bg-[#630d16] text-white py-3 rounded-xl font-semibold hover:bg-[#4a0a11] flex items-center justify-center gap-2">
          <Save size={18}/> Salvar SWOT
        </button>
      )}
      {localSwot.autor && (
        <p className="text-xs text-gray-500 mt-4">Última edição por {localSwot.autor} em {new Date(localSwot.data!).toLocaleString()}</p>
      )}
    </div>
  );
}
