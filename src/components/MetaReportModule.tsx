import React, { useState } from 'react';
import { MetaIndividual } from '../types';

interface MetaReportModuleProps {
  metas: MetaIndividual[];
}

export default function MetaReportModule({ metas }: MetaReportModuleProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const validadas = metas.filter(m => m.status === 'validada');
  const rejeitadas = metas.filter(m => m.status === 'rejeitada');
  const exibidas = filtroStatus === 'todos' ? [...validadas, ...rejeitadas] : (filtroStatus === 'validada' ? validadas : rejeitadas);

  const exportCSV = () => {
    const csv = ['Colaborador,Indicador,Status,Data Validação'].concat(
      exibidas.map(m => `${m.colaboradorId},${m.indicador},${m.status},${m.data_validacao || ''}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metas.csv';
    a.click();
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Metas Validadas/Rejeitadas</h2>
      <div className="flex gap-4 mb-6">
        <select onChange={e => setFiltroStatus(e.target.value)} className="p-2 border rounded">
            <option value="todos">Todos</option>
            <option value="validada">Validadas</option>
            <option value="rejeitada">Rejeitadas</option>
        </select>
        <button onClick={exportCSV} className="bg-gray-800 text-white px-4 py-2 rounded">Exportar CSV</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">Total Validadas: {validadas.length}</div>
        <div className="p-4 bg-red-50 rounded-lg">Total Rejeitadas: {rejeitadas.length}</div>
        <div className="p-4 bg-blue-50 rounded-lg">Taxa Aprovação: {validadas.length + rejeitadas.length > 0 ? Math.round(validadas.length / (validadas.length + rejeitadas.length) * 100) : 0}%</div>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b"><th>Colaborador</th><th>Indicador</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>{exibidas.map(m => <tr key={m.id} className="border-b"><td>{m.colaboradorId}</td><td>{m.indicador}</td><td>{m.status}</td><td>{m.data_validacao?.split('T')[0]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
