import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Planejamento, Prioridade, User } from '../types';

const medalData = [
  { tipo: "bronze", label: "Bronze", emoji: "🥉", color: "#CD7F32", bg: "#FDF3E7", border: "#CD7F32" },
  { tipo: "prata", label: "Prata", emoji: "🥈", color: "#A8A9AD", bg: "#F4F4F5", border: "#A8A9AD" },
  { tipo: "ouro", label: "Ouro", emoji: "🥇", color: "#D4AF37", bg: "#FFFBEA", border: "#D4AF37" },
];

export default function QuarterlyPlanningModule({ activePlanejamento, setPlanejamentos, empresaId, currentUser }: { activePlanejamento: Planejamento, setPlanejamentos: any, empresaId: string, currentUser: User }) {
  if (!activePlanejamento) return <div className="p-8 text-center text-gray-500">Nenhum planejamento disponível.</div>;
  const isColaborador = currentUser.role === 'COLABORADOR';
  const [trimestre, setTrimestre] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [isEditing, setIsEditing] = useState(false);
  
  // Resetar estado de edição ao mudar de trimestre
  useEffect(() => {
    setIsEditing(false);
    console.log(`Trimestre alterado para: ${trimestre}`);
  }, [trimestre]);
  
  const historicoAnual = activePlanejamento.historico_anual?.find(h => h.ano === 2026);
  const indicadoresAnuais = historicoAnual?.pilares || [];
  
  const [trimestralData, setTrimestralData] = useState<any>(null);

  useEffect(() => {
    try {
        console.log(`Carregando dados para o trimestre: ${trimestre}`);
        const existingData = activePlanejamento.historico_trimestral?.find(h => h.trimestre === trimestre) || {
            trimestre,
            tema: "",
            recompensas: { bronze: "", prata: "", ouro: "" },
            categorias: []
        };

        const updatedCategorias = indicadoresAnuais.map(cat => {
            const existing = existingData.categorias?.find((c: any) => c.id === cat.id);
            return existing || {
              id: cat.id,
              nome: cat.nome,
              icone: cat.icone,
              prioridadesComplementares: []
            };
        });
        
        setTrimestralData({ ...existingData, categorias: updatedCategorias });
    } catch (error) {
        console.error("Erro ao carregar dados trimestrais:", error);
    }
  }, [indicadoresAnuais, trimestre, activePlanejamento.historico_trimestral]);

  if (!trimestralData) return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;

  const updateRecompensa = (catId: string, tipo: string, valor: string) => {
    if (isColaborador) return;
    console.log(`Atualizando recompensa: ${tipo} para ${valor} na categoria ${catId}`);
    setTrimestralData((prev: any) => ({
      ...prev,
      categorias: prev.categorias.map((c: any) => c.id === catId ? {
        ...c,
        recompensas: { ...(c.recompensas || { bronze: "", prata: "", ouro: "" }), [tipo]: valor }
      } : c)
    }));
  };

  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif", margin: 0 }}>Meta Trimestral - {trimestre} 2026</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={trimestre} onChange={e => setTrimestre(e.target.value as any)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            {!isColaborador && (
              isEditing ? (
                <>
                  <button onClick={() => {
                      setPlanejamentos((prev: any) => ({
                          ...prev,
                          [empresaId]: {
                              ...prev[empresaId],
                              historico_trimestral: [
                                  ...prev[empresaId].historico_trimestral.filter((h: any) => h.trimestre !== trimestre),
                                  trimestralData
                              ]
                          }
                      }));
                      setIsEditing(false);
                      alert('Planejamento trimestral salvo!');
                  }} style={{ background: "#630d16", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  <button onClick={() => setIsEditing(false)} style={{ background: "#6B7280", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{ background: "#630d16", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Editar</button>
              )
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div style={{ flex: 1, background: "#630d16", borderRadius: 16, padding: "24px", color: "white", boxShadow: "0 4px 6px -1px rgba(99, 13, 22, 0.3)" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#FDE8E8", marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tema do Trimestre</label>
            <input readOnly={!isEditing || isColaborador} value={trimestralData.tema} onChange={(e) => setTrimestralData({...trimestralData, tema: e.target.value})} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.3)', fontSize: 20, fontWeight: 700, color: 'white', outline: 'none', padding: '8px 0' }} placeholder="Ex: Trimestre da Eficiência" />
          </div>
          <div style={{ flex: 1, background: "#FFFFFF", borderRadius: 16, padding: "24px", color: "#630d16", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recompensas</label>
            <div style={{ display: 'flex', gap: 8 }}>
                {medalData.map(m => (
                    <div key={m.tipo} style={{ flex: 1, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 8, padding: '8px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.emoji} {m.label}</div>
                        <input readOnly={!isEditing || isColaborador} value={trimestralData.recompensas?.[m.tipo] || ""} onChange={(e) => setTrimestralData({...trimestralData, recompensas: {...trimestralData.recompensas, [m.tipo]: e.target.value}})} style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 12, fontWeight: 600, color: '#111827', outline: 'none' }} placeholder="Recompensa" />
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {indicadoresAnuais.map((cat) => (
            <div key={cat.id} style={{ background: "#FFFFFF", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{cat.icone}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif" }}>{cat.nome}</span>
              </div>

              {/* Annual Priorities (Read-only for reference) */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>Prioridades Anuais</h4>
                {cat.prioridades?.map((p: any) => (
                    <div key={p.id} style={{ padding: "8px 12px", background: '#F3F4F6', borderRadius: 8, fontSize: 13, color: '#374151', marginBottom: 4 }}>
                        {p.nome}
                    </div>
                ))}
              </div>

              {/* Quarterly Complementary Priorities */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#630d16", marginBottom: 8 }}>Prioridades Complementares</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {trimestralData.categorias?.find((c: any) => c.id === cat.id)?.prioridadesComplementares?.map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: "8px 12px", background: '#FFFBEA', borderRadius: 8, border: '1px solid #D4AF37' }}>
                          <input readOnly={!isEditing || isColaborador} value={p.nome} onChange={(e) => {
                              const novoNome = e.target.value;
                              setTrimestralData((prev: any) => ({
                                  ...prev,
                                  categorias: prev.categorias.map((c: any) => c.id === cat.id ? {
                                      ...c,
                                      prioridadesComplementares: c.prioridadesComplementares.map((prio: any, index: number) => index === i ? { ...prio, nome: novoNome } : prio)
                                  } : c)
                              }));
                          }} style={{ fontSize: 13, border: 'none', width: '100%', background: 'transparent', outline: 'none' }} />
                          {!isColaborador && isEditing && <button style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: 16 }}>×</button>}
                      </div>
                  ))}
                </div>
                {!isColaborador && isEditing && (
                    <button onClick={() => {
                        setTrimestralData((prev: any) => ({
                            ...prev,
                            categorias: prev.categorias.map((c: any) => c.id === cat.id ? {
                                ...c,
                                prioridadesComplementares: [...(c.prioridadesComplementares || []), { id: Date.now(), nome: "Nova Prioridade" }]
                            } : c)
                        }));
                    }} style={{ fontSize: 12, color: "#630d16", cursor: "pointer", background: 'none', border: 'none', marginTop: 8, fontWeight: 600 }}>+ Adicionar Prioridade Complementar</button>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12, marginTop: 16 }}>
                {medalData.map((m) => (
                  <div key={m.tipo} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: m.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.emoji} {m.label}</div>
                ))}
              </div>

              {cat.indicadores?.map((ind: any) => (
                <div key={ind.id} style={{ display: "flex", flexDirection: 'column', gap: 8, padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{ind.nome}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {medalData.map(medal => (
                            <div key={medal.tipo} style={{ border: `1.5px solid ${medal.border}`, borderRadius: 8, background: medal.bg, padding: "6px 8px", flex: 1 }}>
                                <input readOnly={!isEditing || isColaborador} placeholder={(Number(String(ind[medal.tipo as keyof typeof ind] || '0').replace(/\./g, '')) * 0.25).toString()} style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, fontWeight: 700, color: "#111827", outline: "none" }} />
                            </div>
                        ))}
                    </div>
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 12 }}>🏆 Recompensas do Pilar</h4>
                <div style={{ display: "flex", gap: 8 }}>
                    {medalData.map(medal => (
                        <div key={medal.tipo} style={{ flex: 1, background: medal.bg, border: `1px solid ${medal.border}`, borderRadius: 8, padding: '8px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: medal.color, marginBottom: 4 }}>{medal.emoji} {medal.label}</div>
                            <input readOnly={!isEditing || isColaborador} value={trimestralData.categorias?.find((c: any) => c.id === cat.id)?.recompensas?.[medal.tipo] || ""} onChange={(e) => updateRecompensa(cat.id, medal.tipo, e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 12, fontWeight: 600, color: '#111827', outline: 'none' }} placeholder="Recompensa" />
                        </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
