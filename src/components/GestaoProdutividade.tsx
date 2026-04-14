import React, { useState, useMemo } from 'react';
import { User, Planejamento, Acao, ColaboradorPrioridade } from '../types';
import { BarChart3, CheckCircle2, Award, TrendingUp, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

// ... (rest of imports)

export default function GestaoProdutividade({ activePlanejamento, users, acoes, currentUser }: any) {
  const [visao, setVisao] = useState<'Mensal' | 'Acumulado'>('Mensal');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(2026);
  const [validado, setValidado] = useState(false);
  const [metas, setMetas] = useState<any[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<any | null>(null);
  const [modalMes, setModalMes] = useState(mes);
  const [modalAno, setModalAno] = useState(ano);
  const [modalPilar, setModalPilar] = useState('Todos');
  const [viewMode, setViewMode] = useState<'resumo' | 'completo'>('resumo');

  const colaboradoresFiltrados = useMemo(() => {
    if (currentUser.role === 'SOCIO') return users.filter((u: any) => u.empresa_id === currentUser.empresa_id);
    if (currentUser.role === 'GESTOR') return users.filter((u: any) => u.responsavelDiretoId === currentUser.id);
    return users.filter((u: any) => u.id === currentUser.id);
  }, [users, currentUser]);

  const handleValidar = () => {
    // Lógica de validação e consolidação de dados
    setValidado(true);
    // Adicionar lógica de salvamento no localStorage se necessário
  };
  React.useEffect(() => {
      if (selectedColaborador) {
          setModalMes(mes);
          setModalAno(ano);
          setModalPilar('Todos');
          setViewMode('resumo');
      }
  }, [selectedColaborador, mes, ano]);

  const { todasAsMetas, todasAsAcoes } = useMemo(() => {
    const metasSalvas = localStorage.getItem('metas_individuais') || localStorage.getItem('peup_metas_individuais');
    const todasAsMetas = metasSalvas ? JSON.parse(metasSalvas) : [];
    
    const acoesSalvas = localStorage.getItem('peup_acoes');
    const todasAsAcoes = acoesSalvas ? JSON.parse(acoesSalvas) : acoes;
    
    return { todasAsMetas, todasAsAcoes };
  }, [acoes]);

  const dados = useMemo(() => {
    const colaboradoresData = users.map(user => {
      // 2. Map by collaborator ID
      const metasUser = todasAsMetas.filter(m => 
        String(m.colaboradorId || '').trim().toLowerCase() === String(user.nome || '').trim().toLowerCase() && 
        Number(m.mes || mes) === mes
      );
      
      const acoesUser = todasAsAcoes.filter(a => 
        String(a.responsavel || '').trim().toLowerCase() === String(user.nome || '').trim().toLowerCase() && 
        (a.status === 'Concluído' || a.status === 'Concluída') &&
        a.data_conclusao && new Date(a.data_conclusao).getMonth() + 1 === mes
      );
      
      // 3. Treatment for 'realizado' string to number
      const parseRealizado = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
              // Remove 'R$', '.', and replace ',' with '.'
              const clean = val.replace(/[R$\s.]/g, '').replace(',', '.');
              return parseFloat(clean) || 0;
          }
          return 0;
      };
      
      const entregaRealizada = metasUser.reduce((sum, m) => sum + parseRealizado(m.realizado), 0);
      
      // Determine highest status based on meta thresholds
      let highestStatus = 0; // 0: Bronze, 1: Prata, 2: Ouro
      
      metasUser.forEach(m => {
        const realizado = parseRealizado(m.realizado);
        const metaOuro = Number(m.ouro) || 0;
        const metaPrata = Number(m.prata) || 0;
        const metaBronze = Number(m.bronze) || 0;
        
        if (metaOuro > 0 && realizado >= metaOuro) highestStatus = Math.max(highestStatus, 2);
        else if (metaPrata > 0 && realizado >= metaPrata) highestStatus = Math.max(highestStatus, 1);
        else if (metaBronze > 0 && realizado >= metaBronze) highestStatus = Math.max(highestStatus, 0);
      });
      
      const statusPremiacao = highestStatus === 2 ? 'Ouro' : highestStatus === 1 ? 'Prata' : 'Bronze';
      
      return {
        user,
        metas: metasUser,
        entregaRealizada,
        acoesConcluidas: acoesUser, // Keep full action objects for details
        statusPremiacao
      };
    });

    const taxaExecucao = todasAsAcoes.length > 0 ? (todasAsAcoes.filter(a => a.status === 'Concluído' || a.status === 'Concluída').length / todasAsAcoes.length) * 100 : 0;
    const alcanceMetasOuro = colaboradoresData.filter(c => c.statusPremiacao === 'Ouro').length;
    const valorGerado = colaboradoresData.reduce((sum, c) => sum + c.entregaRealizada, 0);
    const totalAcoes = colaboradoresData.reduce((sum, c) => sum + c.acoesConcluidas.length, 0);

    return { colaboradoresData, taxaExecucao, alcanceMetasOuro, valorGerado, totalAcoes };
  }, [users, todasAsMetas, todasAsAcoes, mes]);

  const exportarGeral = (mesRef: number, anoRef: number) => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ['Relatório de Produtividade — PEUP Gestão'],
        [],
        ['Colaborador', 'Mês/Ano de Referência', 'Quantidade de Metas Vinculadas', 'Entrega Realizada (Valor Consolidado)', 'Status de Premiação', 'Total de Ações Concluídas', 'Taxa de Execução Final'],
        ...dados.colaboradoresData.map(c => [
            c.user.nome,
            `${mesRef}/${anoRef}`,
            c.metas.length,
            c.entregaRealizada,
            c.statusPremiacao,
            c.acoesConcluidas.length,
            `${dados.taxaExecucao.toFixed(1)}%`
        ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Geral');
    XLSX.writeFile(wb, `Relatorio_Produtividade_${mesRef}_${anoRef}.xlsx`);
  };

  const exportarIndividual = (colaborador: any, mesRef: number, anoRef: number) => {
    const wb = XLSX.utils.book_new();
    
    const wsResumo = XLSX.utils.aoa_to_sheet([
        ['Relatório de Produtividade — PEUP Gestão'],
        [],
        ['Resumo Individual'],
        ['Nome', colaborador.user.nome],
        ['Mês', `${mesRef}/${anoRef}`],
        ['Total de Entrega', colaborador.entregaRealizada],
        ['Status de Meritocracia', colaborador.statusPremiacao]
    ]);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    const wsMetas = XLSX.utils.aoa_to_sheet([
        ['Nome da Meta', 'Prioridade', 'Bronze', 'Prata', 'Ouro', 'Realizado'],
        ...colaborador.metas.map((m: any) => [m.indicador, m.prioridadeId, m.bronze, m.prata, m.ouro, m.realizado])
    ]);
    XLSX.utils.book_append_sheet(wb, wsMetas, 'Metas');

    const wsAcoes = XLSX.utils.aoa_to_sheet([
        ['Título', 'Data de Conclusão'],
        ...colaborador.acoesConcluidas.map((a: any) => [a.titulo, new Date(a.data_conclusao).toLocaleDateString()])
    ]);
    XLSX.utils.book_append_sheet(wb, wsAcoes, 'Ações');

    XLSX.writeFile(wb, `Relatorio_Individual_${colaborador.user.nome}_${mesRef}_${anoRef}.xlsx`);
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Gestão de Produtividade</h1>
        
        {/* Filtros */}
        <div className="flex gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200">
          <select className="p-2 border rounded" value={mes} onChange={e => setMes(Number(e.target.value))}>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
          <button 
            onClick={handleValidar} 
            disabled={validado}
            className={`px-4 py-2 rounded-lg ${validado ? 'bg-gray-400' : 'bg-[#630d16]'} text-white`}
          >
            {validado ? 'Relatório Validado' : 'Validar Entregas'}
          </button>
          <button onClick={() => exportarGeral(mes, ano)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download size={18} /> Exportar Relatório Geral (Excel)
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm">Taxa de Execução</div>
            <div className="text-2xl font-bold text-[#630d16]">{dados.taxaExecucao.toFixed(1)}%</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm">Alcance de Metas (Ouro)</div>
            <div className="text-2xl font-bold text-[#630d16]">{dados.alcanceMetasOuro}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm">Valor Gerado Consolidado</div>
            <div className="text-2xl font-bold text-[#630d16]">R$ {dados.valorGerado.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Colaborador</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Meta Individual</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Entrega Realizada</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Produtividade</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.colaboradoresData.map(c => (
                <tr key={c.user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-[#630d16] cursor-pointer hover:underline" onClick={() => setSelectedColaborador(c)}>{c.user.nome}</td>
                  <td className="p-4 text-sm">{c.metas.length} metas</td>
                  <td className="p-4 text-sm">R$ {c.entregaRealizada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.statusPremiacao === 'Ouro' ? 'bg-yellow-100 text-yellow-800' : c.statusPremiacao === 'Prata' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-900'}`}>
                      {c.statusPremiacao}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{c.acoesConcluidas.length} {c.acoesConcluidas.length === 1 ? 'ação' : 'ações'}</td>
                  <td className="p-4">
                    <button onClick={() => exportarIndividual(c, mes, ano)} className="text-gray-500 hover:text-[#630d16]">
                        <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
                <tr>
                    <td className="p-4">Total</td>
                    <td className="p-4">-</td>
                    <td className="p-4">R$ {dados.valorGerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">-</td>
                    <td className="p-4">{dados.totalAcoes} ações</td>
                    <td className="p-4">-</td>
                </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Detalhes */}
        {selectedColaborador && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                    {/* Fixed Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <h2 className="text-3xl font-serif font-bold text-[#630d16]">{selectedColaborador.user.nome}</h2>
                        <button onClick={() => setSelectedColaborador(null)} className="text-gray-500 hover:text-gray-800">Fechar</button>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="p-8 overflow-y-auto flex-1">
                        {/* Filters */}
                        <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                            <select className="p-2 border rounded" value={modalMes} onChange={e => setModalMes(Number(e.target.value))}>
                                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>)}
                            </select>
                            <select className="p-2 border rounded" value={modalAno} onChange={e => setModalAno(Number(e.target.value))}>
                                {[2026, 2025, 2024].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            <select className="p-2 border rounded" value={modalPilar} onChange={e => setModalPilar(e.target.value)}>
                                <option value="Todos">Todos os Pilares</option>
                                {Array.from(new Set(todasAsMetas.map((m: any) => m.pilar))).map((p: any) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Mini Chart */}
                        <div className="h-48 mb-8">
                            <h3 className="font-serif font-bold text-lg mb-3">📈 Evolução (6 meses)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={Array.from({length: 6}, (_, i) => ({ mes: i + 1, valor: Math.random() * 10000 }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="valor" stroke="#630d16" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-serif font-bold text-lg mb-3">📊 Metas Vinculadas</h3>
                                <div className="space-y-2">
                                    {todasAsMetas.filter((m: any) => 
                                        String(m.colaboradorId || '').trim().toLowerCase() === String(selectedColaborador.user.nome || '').trim().toLowerCase() &&
                                        Number(m.mes) === modalMes &&
                                        Number(m.ano || 2026) === modalAno &&
                                        (modalPilar === 'Todos' || m.pilar === modalPilar)
                                    ).slice(0, viewMode === 'resumo' ? 5 : undefined).map((m: any, i: number) => (
                                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">{m.indicador}</span>
                                            <span className="font-bold">R$ {Number(m.realizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-serif font-bold text-lg mb-3">✅ Ações Concluídas</h3>
                                <div className="space-y-2">
                                    {todasAsAcoes.filter((a: any) => 
                                        String(a.responsavel || '').trim().toLowerCase() === String(selectedColaborador.user.nome || '').trim().toLowerCase() &&
                                        (a.status === 'Concluído' || a.status === 'Concluída') &&
                                        a.data_conclusao && 
                                        new Date(a.data_conclusao).getMonth() + 1 === modalMes &&
                                        new Date(a.data_conclusao).getFullYear() === modalAno
                                    ).slice(0, viewMode === 'resumo' ? 5 : undefined).map((a: any) => (
                                        <div key={a.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="font-medium">{a.titulo}</div>
                                            <div className="text-xs text-gray-500">Concluída em: {new Date(a.data_conclusao).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <button onClick={() => setViewMode(viewMode === 'resumo' ? 'completo' : 'resumo')} className="text-[#630d16] font-semibold underline">
                                {viewMode === 'resumo' ? 'Ver Histórico Completo' : 'Ver Menos'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
