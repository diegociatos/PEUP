import React, { useState } from 'react';
import { Planejamento, SWOTAnalysis } from '../types';

interface SWOTPlanningProps {
  activePlanejamento: Planejamento;
  setPlanejamentos: React.Dispatch<React.SetStateAction<Record<string, Planejamento>>>;
  trimestre: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  ano: number;
}

export default function SWOTPlanningModule({ activePlanejamento, setPlanejamentos, trimestre, ano }: SWOTPlanningProps) {
  const historicoTrimestral = activePlanejamento.historico_trimestral.find(h => h.trimestre === trimestre && h.ano === ano);
  const [swot, setSwot] = useState<SWOTAnalysis>(historicoTrimestral?.swot || { strengths: [''], weaknesses: [''], opportunities: [''], threats: [''] });

  const updateSwot = (key: keyof SWOTAnalysis, index: number, value: string) => {
    const newSwot = { ...swot };
    newSwot[key][index] = value;
    setSwot(newSwot);
  };

  const addField = (key: keyof SWOTAnalysis) => {
    setSwot({ ...swot, [key]: [...swot[key], ''] });
  };

  const renderSection = (title: string, key: keyof SWOTAnalysis, color: string) => (
    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: `1px solid ${color}` }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: color, marginBottom: 16 }}>{title}</h3>
      {swot[key].map((item, index) => (
        <input key={index} value={item} onChange={e => updateSwot(key, index, e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB' }} placeholder={`Adicionar ${title.toLowerCase()}...`} />
      ))}
      <button onClick={() => addField(key)} style={{ marginTop: 8, color: color, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Adicionar</button>
    </div>
  );

  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", fontFamily: "Inter, sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#630d16", fontFamily: "'Book Antiqua', Georgia, serif", marginBottom: 32 }}>Análise SWOT - {trimestre} {ano}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {renderSection('Forças', 'strengths', '#059669')}
          {renderSection('Fraquezas', 'weaknesses', '#DC2626')}
          {renderSection('Oportunidades', 'opportunities', '#2563EB')}
          {renderSection('Ameaças', 'threats', '#D97706')}
        </div>
      </div>
    </div>
  );
}
