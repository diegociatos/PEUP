import React, { useState } from 'react';
import { Acao, Planejamento } from '../types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface VerificacoesModuleProps {
  activePlanejamento: Planejamento;
  setPlanejamentos: React.Dispatch<React.SetStateAction<Record<string, Planejamento>>>;
  empresaId: string;
}

export default function VerificacoesModule({ activePlanejamento, setPlanejamentos, empresaId }: VerificacoesModuleProps) {
  const [justificativa, setJustificativa] = useState<Record<string, string>>({});

  const acoesParaVerificar = activePlanejamento.historico_mensal.flatMap(h => h.acoes).filter(a => a.status === 'Aguardando Verificação');

  const handleAprovar = (acaoId: string) => {
    setPlanejamentos(prev => ({
        ...prev,
        [empresaId]: {
            ...prev[empresaId],
            historico_mensal: prev[empresaId].historico_mensal.map(h => ({
                ...h,
                acoes: h.acoes.map(a => a.id === acaoId ? { ...a, status: 'Concluído', verificado: true, valorEntregue: a.valorEntregue || a.kpi.realizado } : a)
            }))
        }
    }));
  };

  const handleRejeitar = (acaoId: string) => {
    if (!justificativa[acaoId]) {
        alert('Justificativa é obrigatória para rejeição.');
        return;
    }
    setPlanejamentos(prev => ({
        ...prev,
        [empresaId]: {
            ...prev[empresaId],
            historico_mensal: prev[empresaId].historico_mensal.map(h => ({
                ...h,
                acoes: h.acoes.map(a => a.id === acaoId ? { ...a, status: 'Em Andamento', comentarioVerificacao: justificativa[acaoId] } : a)
            }))
        }
    }));
  };

  return (
    <section className="space-y-6 font-sans">
      <h2 className="text-3xl font-serif font-bold text-[#630d16]">Verificações de Ações</h2>
      {acoesParaVerificar.length === 0 && <p className="text-gray-500">Nenhuma ação aguardando verificação.</p>}
      <div className="grid grid-cols-1 gap-4">
        {acoesParaVerificar.map(acao => (
          <div key={acao.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">{acao.titulo}</h3>
                <p className="text-sm text-gray-500">Responsável: {acao.responsavel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridade</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">{activePlanejamento.historico_trimestral[0]?.prioridades.find(p => String(p.id) === acao.prioridadeVinculadaId)?.nome || 'N/A'}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Indicador</p>
                <p className="text-sm text-gray-900">{acao.kpi.nome}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                <p className="text-sm text-gray-700 mb-1"><strong>Comentário:</strong> {acao.comentarioVerificacao || 'Sem comentário'}</p>
                <p className="text-sm text-gray-700"><strong>Valor Entregue:</strong> {acao.valorEntregue} {acao.kpi.unidade}</p>
            </div>
            <div className="flex gap-4 items-center">
                <textarea 
                    placeholder="Justificativa para rejeição" 
                    className="flex-grow p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#630d16] focus:border-transparent"
                    onChange={e => setJustificativa({...justificativa, [acao.id]: e.target.value})}
                />
                <button onClick={() => handleRejeitar(acao.id)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">
                    <XCircle size={18} /> Rejeitar
                </button>
                <button onClick={() => handleAprovar(acao.id)} className="flex items-center gap-2 px-4 py-2 bg-[#630d16] text-white rounded-lg hover:bg-[#4a0a10] font-semibold">
                    <CheckCircle2 size={18} /> ✅ Validar Resultado
                </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
