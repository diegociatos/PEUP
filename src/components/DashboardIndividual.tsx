import React, { useMemo, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Target, Award, Calendar, Bell, Users, FileText, ChevronRight } from 'lucide-react';
import { User, Reuniao, Acao } from '../types';

interface DashboardIndividualProps {
  user: User;
}

export default function DashboardIndividual({ user }: DashboardIndividualProps) {
  const [acoes, setAcoes] = useState(() => JSON.parse(localStorage.getItem('peup_acoes') || '[]'));
  const metasIndividuais = useMemo(() => JSON.parse(localStorage.getItem('peup_metas_individuais') || '[]'), []);
  const reunioes = useMemo(() => JSON.parse(localStorage.getItem('peup_reunioes') || '[]'), []);
  
  const myActions = useMemo(() => acoes.filter((a: Acao) => a.responsavel === user.nome), [acoes, user.nome]);
  const myMetas = useMemo(() => metasIndividuais.filter((m: any) => m.colaboradorId === user.nome), [metasIndividuais, user.nome]);
  const myReunioes = useMemo(() => reunioes.filter((r: Reuniao) => r.participantes.includes(user.nome)), [reunioes, user.nome]);

  const toggleAcaoConcluida = (id: string) => {
    const updatedAcoes = acoes.map((a: Acao) => a.id === id ? { ...a, status: a.status === 'Concluído' ? 'A Fazer' : 'Concluído' } : a);
    setAcoes(updatedAcoes);
    localStorage.setItem('peup_acoes', JSON.stringify(updatedAcoes));
  };

  const hoje = new Date();
  const pendentes = myActions.filter((a: Acao) => a.status !== 'Concluído').sort((a: Acao, b: Acao) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());
  const atrasadas = pendentes.filter((a: Acao) => new Date(a.prazo) < hoje);

  const getCorPilar = (p: number) => {
    if (p < 60) return 'bg-red-500';
    if (p < 80) return 'bg-orange-500';
    if (p < 95) return 'bg-gray-400';
    return 'bg-yellow-400';
  };

  const ranking = useMemo(() => {
    const todosColaboradores = JSON.parse(localStorage.getItem('peup_users') || '[]')
      .filter((u: User) => u.role === 'COLABORADOR' && (u.empresa_id === user.empresa_id || u.empresaId === user.empresa_id));
    
    const porColaborador = new Map<string, { total: number, count: number, nome: string }>();
    
    metasIndividuais.forEach((m: any) => {
      const usuario = todosColaboradores.find((u: User) => u.id === m.colaboradorId);
      if (usuario) {
        const stats = porColaborador.get(usuario.id) || { total: 0, count: 0, nome: usuario.nome };
        stats.total += (m.ouro > 0 ? (Number(m.realizado) / Number(m.ouro)) * 100 : 0);
        stats.count += 1;
        porColaborador.set(usuario.id, stats);
      }
    });

    const rankingData = Array.from(porColaborador.entries())
      .map(([id, data]) => ({ id, nome: data.nome, media: data.total / data.count }))
      .sort((a, b) => b.media - a.media);
      
    const pos = rankingData.findIndex((c: any) => c.id === user.id) + 1;
    return { posicao: pos > 0 ? pos : '-', total: rankingData.length };
  }, [metasIndividuais, user.id, user.empresa_id]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Olá, {user.nome}! Vamos transformar o dia de hoje.</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Minha Jornada Hoje */}
        <section className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16] flex items-center gap-2"><Calendar /> Minha Jornada Hoje</h2>
          <div className="space-y-4">
            {pendentes.length > 0 ? (
              pendentes.map((acao: Acao) => (
                <div key={acao.id} className={`flex items-center justify-between p-4 rounded-xl border ${new Date(acao.prazo) < hoje ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`font-semibold ${new Date(acao.prazo) < hoje ? 'text-red-700' : 'text-slate-800'}`}>{acao.titulo}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> Prazo: {acao.prazo}</p>
                  </div>
                  <button onClick={() => toggleAcaoConcluida(acao.id)} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100">
                    <CheckCircle size={20} className={acao.status === 'Concluído' ? 'text-green-600' : 'text-slate-300'} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">✅ Tudo em dia! Aproveite para planejar o próximo passo.</p>
            )}
          </div>
        </section>

        {/* 4. Classificação e 7. Alertas */}
        <section className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16] flex items-center gap-2"><Award /> Ranking</h2>
                <p className="text-lg font-bold text-slate-800">Você está na {ranking.posicao}ª posição de {ranking.total} colaboradores.</p>
                <p className="text-sm text-slate-600 mt-2">Falta pouco para o Ouro! Continue focado nas suas ações.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16] flex items-center gap-2"><Bell /> Alertas</h2>
                {atrasadas.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 mb-4">
                    <p className="font-bold flex items-center gap-2"><AlertTriangle size={16}/> {atrasadas.length} ações atrasadas!</p>
                    </div>
                )}
            </div>
        </section>

        {/* 2. Visão de Metas */}
        <section className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16]">Visão de Metas Individuais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Financeiro', 'Clientes', 'Pessoas', 'Eficiência'].map(pilar => {
              const meta = myMetas.find((m: any) => m.pilar === pilar);
              if (!meta) return <div key={pilar} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">Aguardando meta individual de {pilar}</div>;
              const percentual = (Number(meta.realizado) / Number(meta.ouro)) * 100;
              return (
                <div key={pilar} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-2">{pilar}</h3>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className={`${getCorPilar(percentual)} h-2 rounded-full`} style={{ width: `${Math.min(percentual, 100)}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{meta.realizado} / {meta.ouro} ({percentual.toFixed(0)}%)</p>
                  <p className="text-xs text-slate-500 italic">"Você está no caminho para Ouro!"</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Reuniões */}
        <section className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16] flex items-center gap-2"><FileText /> Minhas Reuniões Recentes</h2>
            <div className="space-y-4">
                {myReunioes.slice(0, 3).map((r: Reuniao) => (
                    <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-semibold text-slate-800">{r.tipo}</p>
                            <p className="text-xs text-slate-500">{r.data}</p>
                        </div>
                        <a href="#" className="text-sm text-[#630d16] font-bold flex items-center gap-1">Ver Ata <ChevronRight size={16}/></a>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
