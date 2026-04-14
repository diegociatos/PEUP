import React from 'react';
import { Planejamento } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HistoryGrowthProps {
  activePlanejamento: Planejamento;
}

export default function HistoryGrowthModule({ activePlanejamento }: HistoryGrowthProps) {
  const currentYear = 2026;
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    resultado: activePlanejamento.historico_mensal.find(h => h.mes === i + 1)?.resultado_real || 0,
    metaPrata: activePlanejamento.historico_trimestral[0]?.faixas.find(f => f.nome === 'Prata')?.valor || 0
  }));

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-serif font-bold text-gray-900">Histórico e Crescimento</h2>

      {/* Card de Tendência */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700">Tendência</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">Você está 12% acima do mesmo período do ano passado.</p>
      </div>

      {/* Gráfico Anual */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">Resultado Mensal vs Meta Prata</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <ReferenceLine y={monthlyData[0].metaPrata} stroke="red" strokeDasharray="3 3" label="Meta Prata" />
              <Bar dataKey="resultado" fill="#7B1C1C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativo de Anos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo de Anos</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="pb-2">Ano</th>
              <th className="pb-2">Meta</th>
              <th className="pb-2">Resultado</th>
              <th className="pb-2">Nível</th>
              <th className="pb-2">Crescimento</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">2025</td>
              <td>1.000.000</td>
              <td>950.000</td>
              <td>Prata</td>
              <td>-</td>
            </tr>
            <tr>
              <td className="py-3">2026</td>
              <td>1.200.000</td>
              <td>800.000 (atual)</td>
              <td>-</td>
              <td className="text-red-500">-15%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparativo de Trimestres */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo de Trimestres (2025 vs 2026)</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
            <div key={q} className="border p-4 rounded-lg">
              <h4 className="font-semibold">{q}</h4>
              <div className="flex justify-between mt-2">
                <span>2025: 200k</span>
                <span className="text-green-600 flex items-center"><ArrowUp size={16} /> 5%</span>
              </div>
              <div className="flex justify-between">
                <span>2026: 210k</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
