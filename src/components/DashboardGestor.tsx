import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, User as UserIcon, Clock } from 'lucide-react';
import { User } from '../types';

interface DashboardGestorProps {
  currentUser: User;
  users: User[];
}

export default function DashboardGestor({ currentUser, users }: DashboardGestorProps) {
  const liderancas = useMemo(() => users.filter(u => u.responsavelDiretoId === currentUser.id), [users, currentUser]);
  const activePlanejamento = useMemo(() => JSON.parse(localStorage.getItem('peup_planejamento') || '{}'), []);
  const acoes = useMemo(() => JSON.parse(localStorage.getItem('peup_acoes') || '[]'), []);
  const metasIndividuais = useMemo(() => JSON.parse(localStorage.getItem('peup_metas_individuais') || '[]'), []);

  const acoesTime = useMemo(() => acoes.filter((a: any) => liderancas.some(l => l.nome === a.responsavelId)), [acoes, liderancas]);
  
  const totalAcoes = acoesTime.length;
  const concluidas = acoesTime.filter((a: any) => a.status === 'Concluído');
  const acoesPendentes = acoesTime.filter((a: any) => a.status !== 'Concluído');
  const hoje = new Date().toISOString().split('T')[0];
  const atrasadas = acoesTime.filter((a: any) => a.status !== 'Concluído' && a.prazo < hoje);
  
  const percentualExecucao = totalAcoes > 0 ? (concluidas.length / totalAcoes) * 100 : 0;

  const desempenhoLiderados = useMemo(() => {
    const data = liderancas.map(l => {
      const meta = metasIndividuais.find((m: any) => m.colaboradorId === l.nome);
      const percentual = meta ? (Number(meta.realizado || 0) / Number(meta.gold || 1)) * 100 : null;
      
      let cor = 'text-slate-400';
      if (percentual !== null) {
          if (percentual < 50) cor = 'text-red-600';
          else if (percentual < 80) cor = 'text-yellow-600';
          else cor = 'text-green-600';
      }
      return { ...l, percentual, cor, meta: meta || null };
    });
    
    const ids = data.map(d => d.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        console.error("Duplicate IDs in desempenhoLiderados:", ids);
    }
    return data;
  }, [liderancas, metasIndividuais]);

  const problemas = useMemo(() => {
    const p: string[] = [];
    if (concluidas.length === 0 && totalAcoes > 0) p.push("⚠️ Nenhuma execução registrada");
    desempenhoLiderados.forEach(l => {
        if (l.percentual !== null && l.percentual < 60) p.push(`${l.nome} com meta baixa (${l.percentual.toFixed(0)}%)`);
    });
    if (atrasadas.length > 0) p.push("Existem ações atrasadas");
    return p;
  }, [desempenhoLiderados, atrasadas, concluidas, totalAcoes]);

  const prioridade = useMemo(() => {
      if (concluidas.length === 0 && totalAcoes > 0) return "Prioridade: iniciar execução com a equipe";
      const critico = desempenhoLiderados.find(l => l.percentual !== null && l.percentual < 50);
      if (critico) return `Prioridade: acompanhar ${critico.nome}`;
      return "Equipe em dia!";
  }, [concluidas, totalAcoes, desempenhoLiderados]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Gestão de Equipe</h1>
      
      {/* 1. Regra de Execução */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-slate-500 text-sm font-medium mb-2">Execução do Time</h3>
        {totalAcoes > 0 && concluidas.length === 0 ? (
            <p className="text-lg font-semibold text-red-600">⚠️ Execução não iniciada — necessário ativar o horário</p>
        ) : totalAcoes === 0 ? (
            <p className="text-lg font-semibold text-slate-600">Nenhuma ação definida para a equipe</p>
        ) : (
            <p className="text-2xl font-bold font-sans">{concluidas.length}/{totalAcoes} ações concluídas ({percentualExecucao.toFixed(0)}%)</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Radar de Desempenho */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16]">Desempenho dos Liderados</h2>
          <div className="space-y-4">
            {desempenhoLiderados.map((l, index) => (
              <div key={`${l.id}-${index}`} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold flex items-center gap-2"><UserIcon size={16}/> {l.nome}</span>
                <span className={`font-bold ${l.cor}`}>
                    {l.percentual === null ? 'Sem meta' : `${l.percentual.toFixed(0)}%`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3 & 4. Problemas e Prioridade */}
        <section className="space-y-8 lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16]">Problemas do Momento</h2>
                <div className="space-y-2">
            {problemas.map((p, i) => <p key={`${p}-${i}`} className="text-red-600 font-semibold">👉 {p}</p>)}
                    {problemas.length === 0 && <p className="text-green-600 font-semibold">✅ Equipe saudável</p>}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-[#630d16] shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16]">Prioridade do Gestor</h2>
                <p className="text-lg font-bold text-[#630d16]">👉 {prioridade}</p>
            </div>
        </section>

        {/* 5. Ações do Time */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-xl font-serif font-bold mb-6 text-[#630d16]">Ações Pendentes</h2>
          <div className="space-y-3">
            {acoesPendentes.map((a, index) => (
                <div key={`${a.id}-${index}`} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <p className="font-semibold text-sm">{a.titulo}</p>
                        <p className="text-xs text-slate-500">👤 {a.responsavel}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><Clock size={12}/> {a.prazo}</p>
                </div>
            ))}
            {acoesPendentes.length === 0 && <p className="text-sm text-slate-500">Nenhuma ação pendente.</p>}
          </div>
        </section>
      </div>
      <div className="mt-8">
      </div>
    </div>
  );
}
