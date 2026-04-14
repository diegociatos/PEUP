import React, { useState, useEffect } from 'react';
import { User, Planejamento, Acao, MetaIndividual } from '../types';
import { Plus, Save, X, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { canEdit, getAccessibleData } from '../lib/permissions';

const PILARES = ['Financeiro', 'Clientes', 'Pessoas', 'Eficiência'];

interface MetaIndividualModuleProps {
  activePlanejamento: Planejamento;
  users: User[];
  currentUser: User;
  acoes: Acao[];
}

export default function MetaIndividualModule({ activePlanejamento, users, currentUser, acoes }: MetaIndividualModuleProps) {
  const [metas, setMetas] = useState<MetaIndividual[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Partial<MetaIndividual>>({});
  const [error, setError] = useState('');
  const [filtroColaborador, setFiltroColaborador] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPilar, setFiltroPilar] = useState('');

  const handlePostarComentario = (metaId: string, texto: string) => {
    const novasMetas = metas.map(m => m.id === metaId ? {
        ...m,
        comentarios: [...(m.comentarios || []), `${currentUser.nome}: ${texto}`]
    } : m);
    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas as MetaIndividual[]);
  };

  const canManage = currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR';
  const liderados = users.filter(u => u.responsavelDiretoId === currentUser.id);
  
  const visibleMetas = metas.filter(meta => {
    if (currentUser.role === 'SOCIO') return true;
    if (currentUser.role === 'GESTOR') {
      return liderados.some(l => l.nome === meta.colaboradorId);
    }
    if (currentUser.role === 'COLABORADOR') {
      return meta.colaboradorId === currentUser.nome;
    }
    return false;
  }) || [];

  useEffect(() => {
    const metasSalvas = localStorage.getItem('peup_metas_individuais');
    setMetas(metasSalvas ? JSON.parse(metasSalvas) : []);
  }, []);

  const handleSave = () => {
    if (!canManage) {
      alert('Você não tem permissão para editar esta informação.');
      return;
    }
    if (!editingMeta.colaboradorId || !editingMeta.pilar || !editingMeta.indicador || 
        editingMeta.bronze === undefined || editingMeta.prata === undefined || editingMeta.ouro === undefined) {
      setError('Preencha todos os campos.');
      return;
    }
    if (editingMeta.ouro < editingMeta.prata || editingMeta.prata < editingMeta.bronze) {
      setError('Coerência de metas: Ouro ≥ Prata ≥ Bronze.');
      return;
    }

    const novaMeta: MetaIndividual = {
      ...editingMeta as MetaIndividual,
      id: editingMeta.id || Date.now().toString(),
      realizado: editingMeta.realizado || 0,
      mes: new Date().getMonth() + 1,
      ano: 2026,
      status: 'pendente',
      validado: false,
      thread: [],
      comentarios: []
    };

    const novasMetas = editingMeta.id 
      ? metas.map(m => m.id === editingMeta.id ? novaMeta : m)
      : [...metas, novaMeta];

    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas);
    setIsEditing(false);
    setEditingMeta({});
    setError('');
    alert('Meta salva com sucesso!');
  };

  const handleConcluir = (metaId: string) => {
    const novasMetas = metas.map(m => m.id === metaId ? {
        ...m, 
        status: 'concluida_pendente_validacao',
        data_conclusao_proposta: new Date().toISOString()
    } : m);
    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas as MetaIndividual[]);
    alert('Meta enviada para validação do gestor!');
  };

  const handleValidar = (metaId: string, status: 'validada' | 'rejeitada', comentario: string) => {
    if (status === 'rejeitada' && !comentario.trim()) {
        alert('Comentário é obrigatório para rejeição.');
        return;
    }
    const novasMetas = metas.map(m => m.id === metaId ? {
        ...m, 
        status, 
        validado: status === 'validada',
        data_validacao: new Date().toISOString(),
        validadoPor: currentUser.nome,
        comentario_validacao: comentario,
        historico: [...(m.historico || []), {
            id: Date.now().toString(),
            metaId,
            status,
            comentario,
            data: new Date().toISOString(),
            autorId: currentUser.id
        }]
    } : m);
    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas as MetaIndividual[]);
    alert(`Meta ${status === 'validada' ? 'aprovada' : 'rejeitada'} com sucesso!`);
  };

  const handlePostarMensagem = (metaId: string, texto: string) => {
    const novasMetas = metas.map(m => m.id === metaId ? {
        ...m,
        thread: [...(m.thread || []), {
            id: Date.now().toString(),
            autorId: currentUser.id,
            autorNome: currentUser.nome,
            texto,
            data: new Date().toISOString()
        }]
    } : m);
    localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
    setMetas(novasMetas as MetaIndividual[]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Gestão de Metas Individuais</h1>
        
        {canManage && (
          <button onClick={() => { setIsEditing(true); setEditingMeta({}); }} className="mb-6 flex items-center gap-2 bg-[#630d16] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4a0a11]">
            <Plus size={20} /> Nova Meta
          </button>
        )}

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">{editingMeta.id ? 'Editar Meta' : 'Nova Meta'}</h2>
              {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded-lg flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>}
              
              <label className="block text-sm font-semibold text-gray-700 mb-1">Colaborador</label>
              <select className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#630d16] focus:border-transparent" value={editingMeta.colaboradorId || ''} onChange={e => setEditingMeta({...editingMeta, colaboradorId: e.target.value})}>
                <option key="default-colab" value="">Selecione Colaborador</option>
                {liderados.map(l => <option key={`colab-${l.id}`} value={l.nome}>{l.nome}</option>)}
              </select>
              
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilar</label>
              <select className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#630d16] focus:border-transparent" value={editingMeta.pilar || ''} onChange={e => setEditingMeta({...editingMeta, pilar: e.target.value})}>
                <option key="default-pilar" value="">Selecione Pilar</option>
                {PILARES.map(p => <option key={`pilar-${p}`} value={p}>{p}</option>)}
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-1">Indicador</label>
              <input className="w-full mb-6 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#630d16] focus:border-transparent" placeholder="Indicador" value={editingMeta.indicador || ''} onChange={e => setEditingMeta({...editingMeta, indicador: e.target.value})} />
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bronze</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={editingMeta.bronze || ''} onChange={e => setEditingMeta({...editingMeta, bronze: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Prata</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={editingMeta.prata || ''} onChange={e => setEditingMeta({...editingMeta, prata: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ouro</label>
                  <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={editingMeta.ouro || ''} onChange={e => setEditingMeta({...editingMeta, ouro: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"><Save size={18}/> Salvar ✔</button>
              </div>
            </div>
          </div>
        )}
        {canManage && (
            <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">Pendências de Validação</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {metas.filter(m => m.status === 'concluida_pendente_validacao').map(meta => (
                        <div key={meta.id} className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-200">
                            <h3 className="text-lg font-bold text-[#630d16]">{meta.indicador}</h3>
                            <p className="text-sm text-gray-500">{meta.colaboradorId}</p>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => {
                                    const comentario = prompt('Comentário (opcional):') || '';
                                    handleValidar(meta.id, 'validada', comentario);
                                }} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Aprovar</button>
                                <button onClick={() => {
                                    const comentario = prompt('Motivo da rejeição (obrigatório):') || '';
                                    if (comentario.trim()) handleValidar(meta.id, 'rejeitada', comentario);
                                    else alert('Comentário é obrigatório!');
                                }} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Rejeitar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Controle de Metas Lançadas */}
        <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">Controle de Metas Lançadas</h2>
            <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200">
                <select className="p-2 border rounded" value={filtroColaborador} onChange={e => setFiltroColaborador(e.target.value)}>
                    <option value="">Todos Colaboradores</option>
                    {users.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                </select>
                <select className="p-2 border rounded" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                    <option value="">Todos Status</option>
                    <option value="validada">Validada</option>
                    <option value="rejeitada">Rejeitada</option>
                </select>
                <select className="p-2 border rounded" value={filtroPilar} onChange={e => setFiltroPilar(e.target.value)}>
                    <option value="">Todos Pilares</option>
                    {PILARES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metas.filter(m => (m.status === 'validada' || m.status === 'rejeitada') &&
                    (filtroColaborador ? m.colaboradorId === filtroColaborador : true) &&
                    (filtroStatus ? m.status === filtroStatus : true) &&
                    (filtroPilar ? m.pilar === filtroPilar : true)
                ).map(meta => (
                    <div key={meta.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#630d16]">{meta.indicador}</h3>
                        <p className="text-sm text-gray-500">{meta.colaboradorId} | Status: {meta.status}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Metas Ativas */}
        <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-6">Metas Ativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleMetas.filter(m => m.status === 'pendente' || m.status === 'rejeitada').length > 0 ? (
            visibleMetas.filter(m => m.status === 'pendente' || m.status === 'rejeitada').map((meta, index) => (
              <div key={`${meta.id}-${index}`} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#630d16]">{meta.pilar}</h3>
                    <p className="text-sm text-gray-500 font-medium">{meta.colaboradorId}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingMeta(meta); setIsEditing(true); }} className="text-sm text-[#630d16] font-semibold hover:underline">Editar</button>
                      <button onClick={() => { if(confirm('Excluir meta?')) { const novasMetas = metas.filter(m => m.id !== meta.id); localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas)); setMetas(novasMetas); } }} className="text-sm text-red-600 font-semibold hover:underline">Excluir</button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6 font-medium">{meta.indicador}</p>

                <div className="flex justify-between items-center mt-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${meta.status === 'validada' ? 'bg-green-100 text-green-800' : meta.status === 'concluida_pendente_validacao' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {meta.status === 'validada' ? 'Validada' : meta.status === 'concluida_pendente_validacao' ? 'Pendente Validação' : meta.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                    </span>
                    {currentUser.role === 'COLABORADOR' && meta.status !== 'validada' && (
                        <button onClick={() => handleConcluir(meta.id)} className="bg-[#630d16] text-white px-3 py-1 rounded text-xs font-bold">Concluir Meta</button>
                    )}
                    {canManage && meta.status === 'concluida_pendente_validacao' && (
                        <div className="flex gap-2">
                            <button onClick={() => {
                                const comentario = prompt('Comentário (opcional):') || '';
                                handleValidar(meta.id, 'validada', comentario);
                            }} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Aprovar</button>
                            <button onClick={() => {
                                const comentario = prompt('Motivo da rejeição (obrigatório):') || '';
                                if (comentario.trim()) handleValidar(meta.id, 'rejeitada', comentario);
                                else alert('Comentário é obrigatório!');
                            }} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Rejeitar</button>
                        </div>
                    )}
                    {canManage && meta.status === 'validada' && (
                        <button onClick={() => {
                            const novasMetas = metas.map(m => m.id === meta.id ? {...m, status: 'pendente'} : m);
                            localStorage.setItem('peup_metas_individuais', JSON.stringify(novasMetas));
                            setMetas(novasMetas as MetaIndividual[]);
                            alert('Meta reaberta para colaborador!');
                        }} className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold">Reabrir Validação</button>
                    )}
                </div>

                <div className="mt-4 text-xs text-gray-600">
                    <p className="font-bold">Thread (últimas 3):</p>
                    {(meta.thread || []).slice(-3).map(m => <p key={m.id}>{m.autorNome}: {m.texto}</p>)}
                    <input type="text" placeholder="Nova mensagem..." className="w-full p-1 mt-1 border rounded" onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handlePostarMensagem(meta.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }} />
                    <p className="font-bold mt-2">Comentários:</p>
                    {(meta.comentarios || []).map((c, i) => <p key={i}>{c}</p>)}
                    <input type="text" placeholder="Novo comentário..." className="w-full p-1 mt-1 border rounded" onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handlePostarComentario(meta.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }} />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center">
                    <p className="text-[10px] uppercase font-bold text-orange-800 mb-1">Bronze</p>
                    <p className="text-lg font-bold text-orange-900">{meta.bronze}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-800 mb-1">Prata</p>
                    <p className="text-lg font-bold text-blue-900">{meta.prata}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-center">
                    <p className="text-[10px] uppercase font-bold text-yellow-800 mb-1">Ouro</p>
                    <p className="text-lg font-bold text-yellow-900">{meta.ouro}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Nenhuma meta ativa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
