import { useState } from 'react';
import { Planejamento } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface KpiModuleProps {
  activePlanejamento: Planejamento;
}

export default function KpiModule({ activePlanejamento }: KpiModuleProps) {
  const allPilares = activePlanejamento.historico_anual.find(h => h.ano === 2026)?.pilares || [];
  const allAcoes = activePlanejamento.historico_mensal.flatMap(h => h.acoes);
  
  const totalAcoes = allAcoes.length;
  const acoesConcluidas = allAcoes.filter(a => a.status === 'Concluído').length;
  const acoesAprovadas = allAcoes.filter(a => a.verificado).length;
  const acoesAtrasadas = allAcoes.filter(a => a.status === 'Atrasado').length;
  const acoesRejeitadas = allAcoes.filter(a => a.comentarioVerificacao && a.status !== 'Concluído').length;
  
  const taxaConclusao = totalAcoes > 0 ? (acoesConcluidas / totalAcoes) * 100 : 0;
  const taxaAprovacao = totalAcoes > 0 ? (acoesAprovadas / totalAcoes) * 100 : 0;
  const taxaRejeicao = totalAcoes > 0 ? (acoesRejeitadas / totalAcoes) * 100 : 0;
  const taxaEntrega = totalAcoes > 0 ? (acoesAprovadas / totalAcoes) * 100 : 0;

  const chartData = [
    { name: 'Total', value: totalAcoes },
    { name: 'Concluídas', value: acoesConcluidas },
  ];

  const responsaveisRanking = allAcoes
    .filter(a => a.status === 'Concluído')
    .reduce((acc, a) => {
        acc[a.responsavel] = (acc[a.responsavel] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

  const sortedResponsaveis = Object.entries(responsaveisRanking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getStatus = (realizado: number, bronze: number, prata: number, ouro: number) => {
    if (realizado >= ouro) return 'verde';
    if (realizado >= prata) return 'amarelo';
    return 'vermelho';
  };

  return (
    <section className="space-y-8 font-sans">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Central de KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Taxa de Entrega</p>
                <p className="text-4xl font-bold text-gray-900 font-serif">{taxaEntrega.toFixed(0)}%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Ações Aprovadas</p>
                <p className="text-4xl font-bold text-gray-900 font-serif">{taxaAprovacao.toFixed(0)}%</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Ações Atrasadas</p>
                <p className="text-4xl font-bold text-gray-900 font-serif">{acoesAtrasadas}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Taxa de Rejeição</p>
                <p className="text-4xl font-bold text-gray-900 font-serif">{taxaRejeicao.toFixed(0)}%</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 font-serif">Total vs. Concluídas</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#630d16">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#9CA3AF' : '#630d16'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 font-serif">Ranking de Responsáveis</h3>
                <div className="space-y-4">
                    {sortedResponsaveis.map(([nome, total], index) => (
                        <div key={nome} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                                <span className="text-sm font-semibold text-gray-900">{nome}</span>
                            </div>
                            <span className="text-sm font-bold text-[#630d16]">{total} ações</span>
                        </div>
                    ))}
                    {sortedResponsaveis.length === 0 && <p className="text-gray-500 text-sm">Nenhuma ação concluída.</p>}
                </div>
            </div>
        </div>
      </div>

      {allPilares.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 text-gray-400">
            Nenhum indicador encontrado. Crie indicadores no Planejamento Anual.
        </div>
      ) : (
        allPilares.map(pilar => (
            <div key={pilar.id} className="space-y-6">
                <h3 className="text-gray-500 uppercase tracking-widest text-xs font-bold font-serif">{pilar.nome}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pilar.indicadores.map(k => {
                        const realizado = k.realizado_mensal[4] || 0;
                        const status = getStatus(realizado, k.bronze, k.prata, k.ouro);
                        return (
                            <div key={k.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-xs mb-2 font-semibold">{k.nome}</p>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-gray-900 font-bold text-3xl font-serif">{realizado.toLocaleString()}</p>
                                        <p className="text-gray-400 text-xs">Meta: {k.ouro.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${status === 'verde' ? 'bg-green-500' : status === 'amarelo' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (realizado / k.ouro) * 100)}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))
      )}
    </section>
  );
}
