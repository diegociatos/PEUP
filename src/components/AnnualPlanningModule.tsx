import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Planejamento, AuditLog, Reuniao, User } from '../types';
import AuditTrailModal from './AuditTrailModal';

const medalData = [
  { tipo: "bronze", label: "Bronze", emoji: "🥉", color: "#CD7F32", bg: "#FDF3E7", border: "#CD7F32" },
  { tipo: "prata", label: "Prata", emoji: "🥈", color: "#A8A9AD", bg: "#F4F4F5", border: "#A8A9AD" },
  { tipo: "ouro", label: "Ouro", emoji: "🥇", color: "#D4AF37", bg: "#FFFBEA", border: "#D4AF37" },
];

function MedalCard({ medal, value, onChange, readOnly }: { medal: any, value: string, onChange: (val: string) => void, readOnly?: boolean }) {
  return (
    <div style={{ border: `1.5px solid ${medal.border}`, borderRadius: 8, background: medal.bg, padding: "6px 8px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        <span style={{ fontSize: 14 }}>{medal.emoji}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: medal.color, textTransform: "uppercase" }}>{medal.label}</span>
      </div>
      <input
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, fontWeight: 700, color: "#111827", outline: "none", fontFamily: "Inter, sans-serif" }}
        placeholder="0"
      />
    </div>
  );
}

function IndicadorRow({ indicador, onUpdate, onDelete, isColaborador, isEditing }: { indicador: any, onUpdate: (campo: string, valor: string) => void, onDelete: () => void, isColaborador: boolean, isEditing: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: 'column', gap: 8, padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{indicador.nome}</div>
      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        {medalData.map((medal) => (
          <div key={medal.tipo}>
            <MedalCard
              medal={medal}
              value={indicador[medal.tipo]}
              onChange={(val) => !isColaborador && isEditing && onUpdate(medal.tipo, val)}
              readOnly={isColaborador || !isEditing}
            />
          </div>
        ))}
        {!isColaborador && isEditing && <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16, padding: "4px" }}>×</button>}
      </div>
    </div>
  );
}

export default function AnnualPlanningModule({ activePlanejamento, setPlanejamentos, empresaId, auditLogs, setAuditLogs, reunioes, currentUser }: { activePlanejamento: Planejamento, setPlanejamentos: any, empresaId: string, auditLogs: AuditLog[], setAuditLogs: any, reunioes: Reuniao[], currentUser: User }) {
  useEffect(() => {
    console.log("AnnualPlanningModule - activePlanejamento:", JSON.stringify(activePlanejamento, null, 2));
    console.log("AnnualPlanningModule - empresaId:", empresaId);
  }, [activePlanejamento, empresaId]);

  if (!activePlanejamento) return <div className="p-8 text-center text-gray-500">Nenhum planejamento disponível.</div>;
  const isColaborador = currentUser.role === 'COLABORADOR';
  const [ano, setAno] = useState(2026);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [deletedIndicadores, setDeletedIndicadores] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [showHistoryMap, setShowHistoryMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
        if (!activePlanejamento || !activePlanejamento.historico_anual) {
            console.warn("activePlanejamento ou historico_anual não disponível.");
            setCategorias([]);
            return;
        }
        const anoData = activePlanejamento.historico_anual.find(h => h.ano === ano);
        setCategorias(anoData?.pilares || []);
    } catch (e) {
        console.error("Erro ao carregar planejamento anual:", e);
        setCategorias([]);
    }
  }, [activePlanejamento, ano]);

  // Resetar estado de edição ao mudar de ano
  useEffect(() => {
    setIsEditing(false);
  }, [ano]);

  const handleSave = () => {
    if (currentUser.role === 'COLABORADOR') { console.warn('Ação não permitida para Colaborador'); return; }
    const oldCategorias = activePlanejamento.historico_anual.find(h => h.ano === ano)?.pilares || [];
    const changes: any[] = [];

    // Compare old vs new
    categorias.forEach(cat => {
        const oldCat = oldCategorias.find(c => c.id === cat.id);
        if (oldCat) {
            cat.indicadores.forEach(ind => {
                const oldInd = oldCat.indicadores.find((i: any) => i.id === ind.id);
                if (oldInd) {
                    ['bronze', 'prata', 'ouro'].forEach(campo => {
                        if (ind[campo] !== oldInd[campo]) {
                            changes.push({
                                meta_id: ind.id,
                                campo_alterado: campo,
                                valor_anterior: oldInd[campo],
                                valor_novo: ind[campo]
                            });
                        }
                    });
                }
            });
        }
    });

    if (changes.length > 0) {
        setPendingChanges(changes);
        setIsAuditModalOpen(true);
    } else {
        saveChanges();
    }
  };

  const saveChanges = (motivo?: string, reuniaoId?: string | null) => {
    setPlanejamentos(prev => ({
      ...prev,
      [empresaId]: {
        ...prev[empresaId],
        historico_anual: [
          ...prev[empresaId].historico_anual.filter(h => h.ano !== ano),
          { ano, pilares: categorias }
        ]
      }
    }));

    if (pendingChanges.length > 0) {
        const newLogs = pendingChanges.map(change => ({
            id: Date.now().toString() + Math.random(),
            meta_id: change.meta_id,
            empresa_id: empresaId,
            tipo: 'alteracao' as const,
            campo_alterado: change.campo_alterado,
            valor_anterior: change.valor_anterior,
            valor_novo: change.valor_novo,
            alterado_por: currentUser.nome,
            alterado_em: new Date().toISOString(),
            reuniao_vinculada: reuniaoId || null,
            motivo: motivo || null
        }));
        setAuditLogs([...auditLogs, ...newLogs]);
    }
    
    setIsAuditModalOpen(false);
    setPendingChanges([]);
    setIsEditing(false);
    alert('Planejamento anual salvo!');
  };

  const addCategoria = () => {
    const novaCategoria = { id: Date.now(), nome: "Nova Categoria", icone: "📊", indicadores: [], prioridades: [] };
    setCategorias([...categorias, novaCategoria]);
  };

  const deleteCategoria = (catId: number) => {
    setCategorias(categorias.filter(cat => cat.id !== catId));
  };

  const updateIndicador = (catId: number, indId: number, campo: string, valor: string) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, indicadores: cat.indicadores.map((ind: any) => ind.id === indId ? { ...ind, [campo]: valor } : ind) } : cat));
  };

  const addIndicador = (catId: number) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, indicadores: [...cat.indicadores, { id: Date.now(), nome: "Novo Indicador", bronze: "", prata: "", ouro: "" }] } : cat));
  };

  const deleteIndicador = (catId: number, indId: number) => {
    setDeletedIndicadores(prev => [...prev, indId]);
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, indicadores: cat.indicadores.filter((ind: any) => ind.id !== indId) } : cat));
  };

  const addPrioridade = (catId: number) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, prioridades: [...(cat.prioridades || []), { id: Date.now(), nome: "Nova Prioridade" }] } : cat));
  };

  const updatePrioridade = (catId: number, prioId: number, nome: string) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, prioridades: cat.prioridades.map((p: any) => p.id === prioId ? { ...p, nome } : p) } : cat));
  };

  const deletePrioridade = (catId: number, prioId: number) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, prioridades: cat.prioridades.filter((p: any) => p.id !== prioId) } : cat));
  };


  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif", margin: 0 }}>Meta Anual - {ano}</h1>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button onClick={() => setAno(ano - 1)}>{'<'}</button>
                <span>{ano}</span>
                <button onClick={() => setAno(ano + 1)}>{'>'}</button>
            </div>
          </div>
          {!isColaborador && (
            <div style={{ display: "flex", gap: 10 }}>
              {isEditing ? (
                <>
                  <button onClick={addCategoria} style={{ border: "1.5px solid #630d16", background: "none", color: "#630d16", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nova Categoria</button>
                  <button onClick={handleSave} style={{ background: "#630d16", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  <button onClick={() => setIsEditing(false)} style={{ background: "#6B7280", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{ background: "#630d16", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Editar</button>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {categorias.map((cat) => (
            <div key={cat.id} style={{ background: "#FFFFFF", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{cat.icone}</span>
                  <input readOnly={!isEditing || isColaborador} value={cat.nome} onChange={(e) => setCategorias(categorias.map(c => c.id === cat.id ? {...c, nome: e.target.value} : c))} style={{ fontSize: 18, fontWeight: 700, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif", border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
                </div>
                {!isColaborador && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => deleteCategoria(cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16 }}>🗑️</button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 12 }}>Prioridades</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.prioridades?.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: "8px 12px", background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                          <input readOnly={!isEditing || isColaborador} value={p.nome} onChange={(e) => updatePrioridade(cat.id, p.id, e.target.value)} style={{ fontSize: 13, border: 'none', width: '100%', background: 'transparent', outline: 'none' }} />
                          {!isColaborador && <button onClick={() => deletePrioridade(cat.id, p.id)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16 }}>×</button>}
                      </div>
                  ))}
                </div>
                {!isColaborador && isEditing && <button onClick={() => addPrioridade(cat.id)} style={{ fontSize: 12, color: "#630d16", cursor: "pointer", background: 'none', border: 'none', marginTop: 8, fontWeight: 600 }}>+ Adicionar Prioridade</button>}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12, marginTop: 16 }}>
                {medalData.map((m) => (
                  <div key={m.tipo} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.emoji} {m.label}</div>
                ))}
              </div>

              {cat.indicadores?.map((ind: any) => {
                const logs = auditLogs.filter(l => l.meta_id === ind.id);
                const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
                const showHistory = showHistoryMap[ind.id] || false;
                const setShowHistory = (val: boolean) => setShowHistoryMap(prev => ({ ...prev, [ind.id]: val }));

                return (
                    <div key={ind.id} className="mb-4">
                        <IndicadorRow
                            indicador={ind}
                            onUpdate={(campo, valor) => updateIndicador(cat.id, ind.id, campo, valor)}
                            onDelete={() => deleteIndicador(cat.id, ind.id)}
                            isColaborador={isColaborador}
                            isEditing={isEditing}
                        />
                        {lastLog && (
                            <div className={`text-xs font-semibold px-2 py-1 rounded inline-block mt-2 ${lastLog.reuniao_vinculada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                {lastLog.reuniao_vinculada ? '✅ Alteração documentada' : '⚠️ Alterada fora de reunião'}
                            </div>
                        )}
                        <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-blue-600 block mt-1 hover:underline">📋 Ver histórico</button>
                        {showHistory && (
                            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-xs space-y-2">
                                {logs.map(log => (
                                    <div key={log.id} className="border-b pb-1">
                                        <p className="font-semibold">{new Date(log.alterado_em).toLocaleString()} - {log.alterado_por}</p>
                                        <p>{log.campo_alterado}: {log.valor_anterior} → {log.valor_novo}</p>
                                        <p className="text-gray-500">{log.reuniao_vinculada ? 'Reunião vinculada' : 'Sem reunião'}</p>
                                        {log.motivo && <p className="italic">Motivo: {log.motivo}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
              })}

              <button onClick={() => addIndicador(cat.id)} style={{ marginTop: 12, background: "none", border: "1.5px dashed #D1D5DB", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#6B7280", cursor: "pointer", width: "100%" }}>+ Adicionar Indicador</button>
            </div>
          ))}
        </div>
        <AuditTrailModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} onSave={saveChanges} reunioes={reunioes} />
      </div>
    </div>
  );
}
