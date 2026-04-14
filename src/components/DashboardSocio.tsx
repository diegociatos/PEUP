import React, { useMemo } from 'react';
import { Target, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { User } from '../types';

interface DashboardSocioProps {
  currentUser: User;
}

export default function DashboardSocio({ currentUser }: DashboardSocioProps) {
  const metasIndividuais = useMemo(() => {
    const data = JSON.parse(localStorage.getItem('peup_metas_individuais') || '[]');
    return Array.isArray(data) ? data : Object.values(data);
  }, []);

  const acoes = useMemo(() => {
    const data = JSON.parse(localStorage.getItem('peup_acoes') || '[]');
    return Array.isArray(data) ? data : [];
  }, []);

  // 1. Resumo Metas Individuais
  const totalMetas = metasIndividuais.length;
  const mediaAtingimento = totalMetas > 0 
    ? (metasIndividuais.reduce((acc: number, m: any) => acc + (m.ouro > 0 ? (Number(m.realizado) / Number(m.ouro)) * 100 : 0), 0) / totalMetas)
    : 0;

  // 2. Resumo Ações
  const contadoresAcoes = useMemo(() => ({
    aFazer: acoes.filter((a: any) => a.status === 'pendente' || a.status === 'A Fazer').length,
    emAndamento: acoes.filter((a: any) => a.status === 'Em Andamento').length,
    concluidas: acoes.filter((a: any) => a.status === 'Concluído').length
  }), [acoes]);

  // 3. Resumo Pilares (Média de progresso)
  const pilaresResumo = useMemo(() => {
    const agrupado: Record<string, { total: number, count: number }> = {};
    metasIndividuais.forEach((m: any) => {
      if (!agrupado[m.pilar]) agrupado[m.pilar] = { total: 0, count: 0 };
      agrupado[m.pilar].total += (m.ouro > 0 ? (Number(m.realizado) / Number(m.ouro)) * 100 : 0);
      agrupado[m.pilar].count += 1;
    });
    return Object.entries(agrupado).map(([nome, data]) => ({ nome, media: data.total / data.count }));
  }, [metasIndividuais]);

  // 4. Ranking
  const ranking = useMemo(() => {
    // 1. Buscar todos os usuários da empresa do sócio
    const usuariosEmpresa = JSON.parse(localStorage.getItem('peup_users') || '[]')
      .filter((u: User) => (u.empresa_id === currentUser.empresa_id || u.empresaId === currentUser.empresa_id));

    // 2. Agrupar metas por colaboradorId usando Map para garantir unicidade
    const porColaborador = new Map<string, { total: number, count: number, nome: string }>();
    
    metasIndividuais.forEach((m: any) => {
      // Verifica se o colaborador desta meta pertence à empresa do sócio
      const usuario = usuariosEmpresa.find((u: User) => u.id === m.colaboradorId);
      if (usuario) {
        const stats = porColaborador.get(usuario.id) || { total: 0, count: 0, nome: usuario.nome };
        stats.total += (m.ouro > 0 ? (Number(m.realizado) / Number(m.ouro)) * 100 : 0);
        stats.count += 1;
        porColaborador.set(usuario.id, stats);
      }
    });

    return Array.from(porColaborador.entries())
      .map(([id, data]) => ({ id, nome: data.nome, media: data.total / data.count }))
      .sort((a, b) => b.media - a.media);
  }, [metasIndividuais, currentUser.empresa_id]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Painel de Gestão</h1>
      
      {/* Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><Target size={16}/>Total de Metas</h3>
          <p className="text-2xl font-bold font-sans">{totalMetas}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><TrendingUp size={16}/>Média de Atingimento</h3>
          <p className="text-2xl font-bold font-sans">{mediaAtingimento.toFixed(1)}%</p>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-slate-500 text-sm font-medium mb-4">Resumo de Ações (Kanban)</h3>
        <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-100 rounded-xl"><p className="text-xs text-slate-500">A Fazer</p><p className="text-xl font-bold">{contadoresAcoes.aFazer}</p></div>
            <div className="text-center p-4 bg-blue-50 rounded-xl"><p className="text-xs text-slate-500">Em Andamento</p><p className="text-xl font-bold">{contadoresAcoes.emAndamento}</p></div>
            <div className="text-center p-4 bg-green-50 rounded-xl"><p className="text-xs text-slate-500">Concluídas</p><p className="text-xl font-bold">{contadoresAcoes.concluidas}</p></div>
        </div>
      </div>

      {/* Pilares */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-slate-500 text-sm font-medium mb-4">Progresso por Pilar</h3>
        {pilaresResumo.length > 0 ? (
            <div className="space-y-4">
                {pilaresResumo.map(p => (
                    <div key={p.nome}>
                        <div className="flex justify-between text-sm mb-1"><span>{p.nome}</span><span className="font-bold">{p.media.toFixed(1)}%</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-[#630d16] h-2 rounded-full" style={{ width: `${Math.min(p.media, 100)}%` }}></div></div>
                    </div>
                ))}
            </div>
        ) : <p className="text-slate-500 italic">Aguardando lançamento</p>}
      </div>

      {/* Ranking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-500 text-sm font-medium mb-4">Ranking de Performance</h3>
        {ranking.length > 0 ? (
            <ul className="space-y-2">
                {ranking.map((r, i) => (
                    <li key={r.id} className="flex justify-between items-center p-2 border-b">
                        <span className="flex items-center gap-2"><Award size={16} className={i===0?'text-yellow-500':i===1?'text-gray-400':'text-orange-700'}/> {r.nome}</span>
                        <span className="font-bold">{r.media.toFixed(1)}%</span>
                    </li>
                ))}
            </ul>
        ) : <p className="text-slate-500 italic">Nenhum dado para o ranking ainda</p>}
      </div>
    </div>
  );
}
