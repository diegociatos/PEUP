import React, { useState } from 'react';
import { Reuniao, Acao, Planejamento, TipoReuniao, User } from '../types';
import { Plus, Clock, Users, FileText, CheckCircle, AlertCircle, Save, FileDown } from 'lucide-react';

interface ReuniaoModuleProps {
  reunioes: Reuniao[];
  setReunioes: React.Dispatch<React.SetStateAction<Reuniao[]>>;
  currentUser: User;
  users: User[];
  empresas: { id: string; nome: string }[];
  setPlanejamentos: React.Dispatch<React.SetStateAction<Record<string, Planejamento>>>;
  metas: any[];
  setMetas: React.Dispatch<React.SetStateAction<any[]>>;
  tiposReuniao: TipoReuniao[];
  readOnly?: boolean;
}

export default function ReuniaoModule({ reunioes, setReunioes, currentUser, users, empresas, setPlanejamentos, metas, setMetas, tiposReuniao, readOnly }: ReuniaoModuleProps) {
  const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // New state for meeting creation/editing
  const [tipo, setTipo] = useState<'Sala de Guerra' | 'Planejamento Interno' | 'Reunião de Sócios' | 'Outros'>('Sala de Guerra');
  const [empresaIds, setEmpresaIds] = useState<string[]>([]);
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [ata, setAta] = useState('');
  const [acoesGeradas, setAcoesGeradas] = useState<Acao[]>([]);
  const [novaAcao, setNovaAcao] = useState({ titulo: '', responsavel: '', prazo: '', metaIndividualId: '' });
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleSaveReuniao = () => {
    if (currentUser.role === 'COLABORADOR') { console.warn('Ação não permitida para Colaborador'); return; }
    const novaReuniao: Reuniao = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      tipo,
      participantes,
      ata,
      decisoes: [],
      acoes_geradas: acoesGeradas,
      status: 'Editando',
      gestor_id: currentUser.id,
      empresa_ids: empresaIds,
      timer_duration: timer
    };

    // Inject actions
    acoesGeradas.forEach(acao => {
        // Push to Planejamento Mensal
        setPlanejamentos(prev => {
          const newPlanejamentos = { ...prev };
          const companyId = empresaIds[0] || '1';
          if (newPlanejamentos[companyId]) {
            const mesAtual = new Date().getMonth() + 1;
            const historicoMensal = newPlanejamentos[companyId].historico_mensal.find(h => h.mes === mesAtual);
            if (historicoMensal) {
              historicoMensal.acoes.push(acao);
            }
          }
          return newPlanejamentos;
        });
        
        // Update Meta Individual
        if (acao.metaIndividualId) {
            setMetas(prev => prev.map(m => m.id === acao.metaIndividualId ? { ...m, realizado: (m.realizado || 0) + 1 } : m));
        }
    });

    setReunioes([...reunioes, novaReuniao]);
    setIsEditing(false);
    setAcoesGeradas([]);
    setAta('');
    setTimer(0);
    setIsTimerRunning(false);
  };


  const handleFinalizeReuniao = () => {
    if (currentUser.role === 'COLABORADOR') { console.warn('Ação não permitida para Colaborador'); return; }
    if (selectedReuniao) {
      setReunioes(prev => prev.map(r => r.id === selectedReuniao.id ? { ...r, status: 'Finalizada' } : r));
      setSelectedReuniao(prev => prev ? { ...prev, status: 'Finalizada' } : null);
    }
  };

  return (
    <section className="grid grid-cols-3 gap-8">
      {/* Sidebar: Histórico de Reuniões */}
      <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 font-serif text-red-900">Histórico de Reuniões</h2>
        {currentUser.role !== 'COLABORADOR' && (
          <button 
            onClick={() => { setSelectedReuniao(null); setIsEditing(true); }}
            className="w-full mb-4 bg-red-900 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-950"
          >
            <Plus size={18} /> Nova Reunião
          </button>
        )}
        <div className="space-y-4">
          {(reunioes || []).map(r => (
            <button 
              key={r.id} 
              onClick={() => { setSelectedReuniao(r); setIsEditing(false); }}
              className={`w-full text-left p-4 rounded-xl border ${selectedReuniao?.id === r.id ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50 border-gray-100'}`}
            >
              <p className="font-semibold">{r.tipo}</p>
              <p className="text-xs text-gray-500">Facilitador: {users.find(u => u.id === r.gestor_id)?.nome || 'N/A'}</p>
              <p className="text-sm text-gray-500">{new Date(r.data).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Detalhes da Reunião */}
      <div className="col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {isEditing ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif text-red-900">Nova Reunião</h2>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-mono">{Math.floor(timer/60)}:{String(timer%60).padStart(2, '0')}</div>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-gray-200 p-2 rounded-full">
                  {isTimerRunning ? '⏸️' : '▶️'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Col 1: Ata */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Ata</label>
                <textarea value={ata} onChange={(e) => setAta(e.target.value)} className="w-full mt-1 p-4 border rounded-xl h-96 font-serif" placeholder="Anotações da reunião..." />
              </div>

              {/* Col 2: Plano de Ação */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Plano de Ação Imediato</label>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <input type="text" placeholder="Título da Ação" value={novaAcao.titulo} onChange={(e) => setNovaAcao({...novaAcao, titulo: e.target.value})} className="w-full p-2 border rounded-lg" />
                    <select value={novaAcao.responsavel} onChange={(e) => setNovaAcao({...novaAcao, responsavel: e.target.value})} className="w-full p-2 border rounded-lg">
                        <option value="">Responsável</option>
                        {(users || []).filter(u => currentUser.role === 'SOCIO' || u.responsavelDiretoId === currentUser.id).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                    </select>
                    <select value={novaAcao.metaIndividualId} onChange={(e) => setNovaAcao({...novaAcao, metaIndividualId: e.target.value})} className="w-full p-2 border rounded-lg">
                        <option value="">Meta Individual (Opcional)</option>
                        {(metas || []).map(m => <option key={m.id} value={m.id}>{m.indicador}</option>)}
                    </select>
                    <button onClick={() => {
                        if(novaAcao.titulo && novaAcao.responsavel) {
                            setAcoesGeradas([...acoesGeradas, {
                                id: Date.now().toString(),
                                titulo: novaAcao.titulo,
                                responsavel: novaAcao.responsavel,
                                prazo: novaAcao.prazo,
                                status: 'A Fazer',
                                verificado: false,
                                metaIndividualId: novaAcao.metaIndividualId
                            } as Acao]);
                            setNovaAcao({ titulo: '', responsavel: '', prazo: '', metaIndividualId: '' });
                        }
                    }} className="w-full bg-red-900 text-white py-2 rounded-lg">+ Adicionar Ação à Ata</button>
                </div>
                
                {/* List of added actions */}
                <div className="space-y-2">
                    {(acoesGeradas || []).map(a => (
                        <div key={a.id} className="p-3 bg-white border rounded-lg flex justify-between">
                            <span>{a.titulo} - {a.responsavel}</span>
                            <span className="text-xs text-gray-500">{a.status}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Reunião</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="w-full mt-1 p-2 border rounded-lg">
                  {(tiposReuniao || []).filter(t => t.ativo && t.empresa_id === currentUser.empresa_id).map(t => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresas Vinculadas</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(empresas || []).map(e => (
                        <button key={e.id} onClick={() => setEmpresaIds(prev => prev.includes(e.id) ? prev.filter(id => id !== e.id) : [...prev, e.id])} className={`px-3 py-1 rounded-full text-sm ${empresaIds.includes(e.id) ? 'bg-red-900 text-white' : 'bg-gray-200'}`}>
                            {e.nome}
                        </button>
                    ))}
                </div>
              </div>
            </div>

            <button onClick={!readOnly && currentUser.role !== 'COLABORADOR' ? handleSaveReuniao : undefined} className={`w-full py-3 rounded-xl font-semibold ${readOnly || currentUser.role === 'COLABORADOR' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-900 text-white hover:bg-red-950'}`}>
              Salvar Reunião
            </button>
          </div>
        ) : selectedReuniao ? (
          <div className="space-y-6 p-8 border-2 border-gray-200 rounded-xl font-serif">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-3xl font-bold text-red-900">{selectedReuniao.tipo}</h2>
                <p className="text-gray-500">{new Date(selectedReuniao.data).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl">PEUP</div>
                <div className="text-sm">Centro de Comando Estratégico</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Ata da Reunião</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{selectedReuniao.ata}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Ações Decididas</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ação</th>
                    <th className="text-left py-2">Responsável</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedReuniao.acoes_geradas || []).map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2">{a.titulo}</td>
                      <td className="py-2">{a.responsavel}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-4 pt-8">
              <button onClick={() => window.print()} className="flex items-center gap-2 text-red-900 font-semibold">
                <FileDown size={18} /> Exportar PDF
              </button>
              {selectedReuniao.status === 'Editando' && !readOnly && currentUser.role !== 'COLABORADOR' && (
                <button onClick={handleFinalizeReuniao} className="bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700">
                  Finalizar Reunião
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Selecione uma reunião ou crie uma nova.</p>
        )}
      </div>
    </section>
  );
}
