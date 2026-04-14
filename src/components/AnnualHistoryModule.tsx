import React from 'react';
import { Planejamento } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnnualHistoryProps {
  activePlanejamento: Planejamento;
}

export default function AnnualHistoryModule({ activePlanejamento }: AnnualHistoryProps) {
  const data = activePlanejamento.historico_anual.map(h => ({
    ano: h.ano,
    faturamento: h.faturamento_total,
    margem: h.margem_liquida,
    ticket: h.ticket_medio
  }));

  return (
    <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Histórico Anual</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="faturamento" fill="#7B1C1C" name="Faturamento" />
            <Bar dataKey="margem" fill="#059669" name="Margem Líquida" />
            <Bar dataKey="ticket" fill="#D4AF37" name="Ticket Médio" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
