import React from 'react';
import { Planejamento, User } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface HistoricoConquistasProps {
  activePlanejamento: Planejamento;
  users: User[];
}

export default function HistoricoConquistasModule({ activePlanejamento, users }: HistoricoConquistasProps) {
  const [filtroColaborador, setFiltroColaborador] = React.useState('');
  const [filtroPrioridade, setFiltroPrioridade] = React.useState('');

  const acoesConcluidas = activePlanejamento.historico_mensal.flatMap(h => 
    h.acoes.filter(a => a.status === 'Concluído')
  );

  const filteredAcoes = acoesConcluidas.filter(a => 
    (filtroColaborador === '' || a.responsavelId === filtroColaborador) &&
    (filtroPrioridade === '' || a.prioridadeVinculadaId === filtroPrioridade)
  );

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">Histórico de Conquistas</h2>
      
      <div className="flex gap-4 mb-6">
        <select className="p-2 rounded border border-gray-200 text-sm" onChange={e => setFiltroColaborador(e.target.value)}>
          <option value="">Todos os Colaboradores</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
        <select className="p-2 rounded border border-gray-200 text-sm" onChange={e => setFiltroPrioridade(e.target.value)}>
          <option value="">Todas as Prioridades</option>
          {activePlanejamento.historico_trimestral.flatMap(h => h.prioridades).map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredAcoes.map(acao => (
          <div key={acao.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-900">{acao.titulo}</div>
              <div className="text-sm text-gray-600">👤 {acao.responsavel} | 🎯 {acao.kpi?.nome}</div>
              <div className="text-sm text-gray-500 mt-1 italic">"{acao.comentarioVerificacao}"</div>
            </div>
            <CheckCircle2 className="text-green-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
