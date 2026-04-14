import React, { useState } from 'react';

const niveis = [
  { id: "bhag", label: "BHAG", sublabel: "Visão de Longo Prazo", icon: "🌟", cor: "#7C3AED", bg: "#F5F3FF", border: "#7C3AED", descricao: "Onde a empresa quer chegar em 10-25 anos", placeholder: "Ex: Ser a maior consultoria tributária do Brasil até 2040", tipo: "texto" },
  { id: "anual", label: "Alvo Anual", sublabel: "Direção Estratégica", icon: "🎯", cor: "#DC2626", bg: "#FEF2F2", border: "#DC2626", descricao: "3 a 5 prioridades que definem o sucesso do ano", dica: "Se eu cumprir isso, o ano valeu.", tipo: "lista", max: 5 },
  { id: "trimestral", label: "Prioridades Trimestrais", sublabel: "Execução — Os Rocks", icon: "🪨", cor: "#16A34A", bg: "#F0FDF4", border: "#16A34A", descricao: "3 a 5 prioridades claras, mensuráveis e com dono", dica: "O que precisa acontecer nos próximos 90 dias para o ano andar?", tipo: "lista", max: 5 },
  { id: "semanal", label: "Ações Semanais", sublabel: "Execução Prática", icon: "⚡", cor: "#D97706", bg: "#FFFBEB", border: "#D97706", descricao: "Tarefas concretas da semana com responsável e prazo", tipo: "lista", max: 10 },
];

function BhagCard({ valor, setValor, placeholder }: { valor: string, setValor: (v: string) => void, placeholder: string }) {
  return (
    <div style={{ padding: "16px 0" }}>
      <textarea
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        rows={2}
        style={{ width: "100%", border: "1.5px solid #DDD6FE", borderRadius: 10, padding: "12px 16px", fontSize: 15, fontWeight: 600, color: "#1F2937", background: "#FAFAFA", outline: "none", resize: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
        placeholder={placeholder}
      />
    </div>
  );
}

function ListaCard({ nivel, itens, setItens, parentItens }: { nivel: any, itens: any[], setItens: (i: any[]) => void, parentItens?: any[] }) {
  const addItem = () => {
    if (itens.length >= nivel.max) return;
    setItens([...itens, { id: Date.now(), texto: "", dono: "", parentId: parentItens && parentItens.length > 0 ? parentItens[0].id : null }]);
  };

  const updateItem = (idx: number, campo: string, val: any) => {
    const novos = [...itens];
    novos[idx] = { ...novos[idx], [campo]: val };
    setItens(novos);
  };

  const removeItem = (idx: number) => {
    setItens(itens.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ padding: "12px 0" }}>
      {itens.map((item, idx) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px" }}>
          <span style={{ fontSize: 14, color: nivel.cor, fontWeight: 700, minWidth: 22 }}>{idx + 1}.</span>
          <input
            value={item.texto}
            onChange={(e) => updateItem(idx, "texto", e.target.value)}
            placeholder={nivel.id === 'anual' ? "Ex: Expandir para 2 novos estados..." : "Descreva a prioridade..."}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#1F2937", background: "transparent", fontFamily: "Inter, sans-serif" }}
          />
          <input
            type="number"
            value={item.valor || ""}
            onChange={(e) => updateItem(idx, "valor", e.target.value)}
            placeholder="Valor"
            style={{ width: 60, border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#6B7280", outline: "none", background: "#F9FAFB", fontFamily: "Inter, sans-serif" }}
          />
          {parentItens && (
            <select
              value={item.parentId || ""}
              onChange={(e) => updateItem(idx, "parentId", Number(e.target.value))}
              style={{ fontSize: 12, padding: "4px", borderRadius: 6, border: "1px solid #E5E7EB" }}
            >
              <option value="">Vincular...</option>
              {parentItens.map(p => <option key={p.id} value={p.id}>{p.texto.substring(0, 20)}...</option>)}
            </select>
          )}
          {nivel.id !== "bhag" && nivel.id !== "anual" && (
            <input
              value={item.dono || ""}
              onChange={(e) => updateItem(idx, "dono", e.target.value)}
              placeholder="Responsável"
              style={{ width: 100, border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#6B7280", outline: "none", background: "#F9FAFB", fontFamily: "Inter, sans-serif" }}
            />
          )}
          <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", fontSize: 16, padding: "2px 6px" }}>✕</button>
        </div>
      ))}
      {itens.length < nivel.max && (
        <button onClick={addItem} style={{ background: "none", border: `1.5px dashed ${nivel.cor}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, color: nivel.cor, cursor: "pointer", width: "100%", fontFamily: "Inter, sans-serif", opacity: 0.7 }}>
          + Adicionar ({itens.length}/{nivel.max})
        </button>
      )}
    </div>
  );
}

function NivelCard({ nivel, isLast, children }: { nivel: any, isLast: boolean, children: React.ReactNode }) {
  const [aberto, setAberto] = useState(true);
  return (
    <div style={{ display: "flex", gap: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: nivel.bg, border: `2.5px solid ${nivel.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, zIndex: 1 }}>{nivel.icon}</div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 32, background: `linear-gradient(${nivel.cor}, #E5E7EB)`, marginTop: 4, marginBottom: 4 }} />}
      </div>
      <div style={{ flex: 1, marginBottom: isLast ? 0 : 16 }}>
        <div style={{ background: "#FFFFFF", border: `1.5px solid ${nivel.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div onClick={() => setAberto(!aberto)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: nivel.bg, cursor: "pointer" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: nivel.cor, fontFamily: "'Book Antiqua', Georgia, serif" }}>{nivel.label}</span>
                <span style={{ fontSize: 11, background: nivel.cor, color: "white", borderRadius: 20, padding: "2px 10px", fontWeight: 600, letterSpacing: 0.5 }}>{nivel.sublabel}</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>{nivel.descricao}</p>
            </div>
            <span style={{ fontSize: 18, color: nivel.cor }}>{aberto ? "▲" : "▼"}</span>
          </div>
          {aberto && nivel.dica && <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 20px", fontSize: 12, color: "#92400E", fontStyle: "italic" }}>💡 "{nivel.dica}"</div>}
          {aberto && <div style={{ padding: "4px 20px 16px" }}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

export default function StrategicFunnelModule() {
  const [bhag, setBhag] = useState("Ser a maior consultoria tributária do Brasil até 2040");
  const [anual, setAnual] = useState([{ id: 1, texto: "Atingir R$ 1.200.000 de faturamento" }, { id: 2, texto: "Lançar serviço de Holding Familiar" }]);
  const [trimestral, setTrimestral] = useState([{ id: 101, texto: "Fechar 10 novos clientes", parentId: 1 }]);
  const [semanal, setSemanal] = useState([{ id: 201, texto: "Enviar proposta para 3 leads", parentId: 101 }]);

  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "100%", padding: "28px 32px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif", margin: 0 }}>Funil Estratégico PEUP</h1>
        <div style={{ maxWidth: 780, marginTop: 32 }}>
          <NivelCard nivel={niveis[0]} isLast={false}><BhagCard valor={bhag} setValor={setBhag} placeholder={niveis[0].placeholder} /></NivelCard>
          <NivelCard nivel={niveis[1]} isLast={false}><ListaCard nivel={niveis[1]} itens={anual} setItens={setAnual} /></NivelCard>
          <NivelCard nivel={niveis[2]} isLast={false}><ListaCard nivel={niveis[2]} itens={trimestral} setItens={setTrimestral} parentItens={anual} /></NivelCard>
          <NivelCard nivel={niveis[3]} isLast={true}><ListaCard nivel={niveis[3]} itens={semanal} setItens={setSemanal} parentItens={trimestral} /></NivelCard>
        </div>
      </div>
    </div>
  );
}
