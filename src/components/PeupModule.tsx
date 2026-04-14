import { useState } from 'react';
import { PEUP, Empresa } from '../types';
import { Target, Mountain, Sparkles, Users, MapPin, ShoppingBag } from 'lucide-react';

interface PeupModuleProps {
  activePeup: PEUP;
  activeCompany: Empresa;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  peups: Record<string, PEUP>;
  setPeups: (peups: Record<string, PEUP>) => void;
  readOnly?: boolean;
}

export default function PeupModule({ activePeup, activeCompany, isEditing, setIsEditing, peups, setPeups, readOnly }: PeupModuleProps) {
  const emptyMessage = <span className="text-gray-400 italic text-sm">Clique para definir sua base estratégica</span>;

  const toggleEditing = () => {
    if (readOnly) return;
    setIsEditing(!isEditing);
  };

  return (
    <section className="space-y-8 font-sans">
      <div className="flex justify-between items-center pb-4">
        <h2 className="text-3xl font-bold text-[#630d16] font-serif tracking-tight">Identidade Estratégica</h2>
        {!readOnly && (
          <button 
            onClick={toggleEditing} 
            className="bg-[#630d16] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-[#4a0a10] transition-all shadow-md"
          >
            {isEditing ? 'Salvar Estratégia' : 'Editar Estratégia'}
          </button>
        )}
      </div>

      {/* 1. Propósito */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h3 className="text-lg text-[#630d16] font-bold mb-4 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">Nosso Porquê</h3>
          <textarea 
            value={activePeup.proposito} 
            onChange={e => setPeups({...peups, [activeCompany.id]: {...activePeup, proposito: e.target.value}})} 
            disabled={!isEditing}
            className="w-full text-3xl font-serif italic text-[#630d16] outline-none resize-none bg-transparent font-bold" 
            rows={2}
            placeholder="Defina o propósito da empresa..."
          />
          {!activePeup.proposito && emptyMessage}
        </div>
        <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 italic space-y-2 border border-gray-100">
            <p className="font-semibold text-gray-800 not-italic">Reflexões:</p>
            <p>• Por que fazemos o que fazemos?</p>
            <p>• Por que me apaixono em fazer isto?</p>
            <p>• Se eu não existisse, para quem faria falta?</p>
        </div>
      </div>

      {/* 2. Valores */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h3 className="text-lg text-[#630d16] font-bold mb-8 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">Valores</h3>
        <div className="space-y-8">
          <div>
            <p className="text-sm text-gray-600 uppercase mb-4 font-bold tracking-wider">Grupo Ciatos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['Proatividade', 'Melhoria Contínua', 'Encantamento de Pessoas', 'Liberdade com Responsabilidade', 'Integridade'].map(v => (
                <div key={v} className="bg-white p-5 rounded-2xl border-2 border-[#630d16]/10 shadow-sm hover:shadow-md hover:border-[#630d16]/30 transition-all text-center">
                  <span className="text-sm font-bold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase mb-4 font-bold tracking-wider">Valor Complementar da Unidade</p>
            {activePeup.valores_complementares.length > 0 ? (
              <div className="bg-[#630d16] text-white p-5 rounded-2xl shadow-md inline-block">
                <span className="text-sm font-bold">{activePeup.valores_complementares[0].nome}</span>
              </div>
            ) : emptyMessage}
          </div>
        </div>
      </div>

      {/* 3. CAIXA DE AREIA (CLIENTE E OFERTA) */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h3 className="text-lg text-[#630d16] font-bold mb-8 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">CAIXA DE AREIA (CLIENTE E OFERTA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Quem é o cliente?', icon: Users },
                { label: 'Onde ele está?', icon: MapPin },
                { label: 'Quais produtos vou vender?', icon: ShoppingBag }
            ].map(({label, icon: Icon}) => (
                <div key={label} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#630d16]">
                        <Icon size={20} />
                        <label className="text-xs font-bold uppercase tracking-wider">{label}</label>
                    </div>
                    <textarea 
                        disabled={!isEditing}
                        className="w-full bg-transparent text-gray-900 outline-none resize-none font-medium" 
                        rows={3}
                        placeholder="Clique para definir..."
                    />
                </div>
            ))}
        </div>
      </div>

      {/* 4. Impulsionadores/Capacidades */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h3 className="text-lg text-[#630d16] font-bold mb-8 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">IMPULSIONADORES/CAPACIDADES</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
                <div key={num} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#630d16]">
                        <Target size={20} />
                        <label className="text-xs font-bold uppercase tracking-wider">Capacidade {num}</label>
                    </div>
                    <textarea 
                        disabled={!isEditing}
                        className="w-full bg-transparent text-gray-900 outline-none resize-none font-medium" 
                        rows={3}
                        placeholder="Clique para definir..."
                    />
                </div>
            ))}
        </div>
      </div>

      {/* 5. Promessas */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h3 className="text-lg text-[#630d16] font-bold mb-8 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">Promessas da Marca</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePeup.promessas.map((p, i) => (
            <div key={p.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#630d16]/20 transition-colors">
              <div className="text-[#630d16] font-bold text-3xl mb-3">0{i + 1}</div>
              <p className="font-serif text-xl font-bold text-gray-900 mb-2">{p.descricao || emptyMessage}</p>
              <p className="text-gray-600 text-sm font-medium">{p.aplicacaoPratica}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BHAG */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h3 className="text-lg text-[#630d16] font-bold mb-8 uppercase tracking-widest border-b-2 border-[#630d16]/20 pb-2">BHAG - O Alvo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: '3-5 Anos', key: 'meta_3_5', icon: Target },
            { label: '10 Anos', key: 'meta_10', icon: Mountain },
            { label: '25 Anos', key: 'meta_25', icon: Sparkles }
          ].map(item => (
            <div key={item.key} className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-[#630d16] mb-2">
                <item.icon size={24} />
                <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <textarea 
                value={activePeup.bhag[item.key as keyof typeof activePeup.bhag]} 
                onChange={e => setPeups({...peups, [activeCompany.id]: {...activePeup, bhag: {...activePeup.bhag, [item.key]: e.target.value}}})} 
                disabled={!isEditing}
                className="w-full bg-transparent p-2 text-gray-900 outline-none resize-none font-medium text-lg" 
                rows={4}
                placeholder="Clique para definir..."
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
