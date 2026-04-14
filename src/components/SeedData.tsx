import React from 'react';

export default function SeedData() {
  const seed = () => {
    localStorage.setItem('peup_meta_anual', JSON.stringify({
      Financeiro: { trabalho: 'Faturamento', ouro: 1000000 },
      Clientes: { indicador: 'Número de Clientes', ouro: 200 },
      Pessoas: { indicador: 'Rotatividade', ouro: 5 },
      Eficiência: { indicador: 'Margem', ouro: 20 }
    }));
    localStorage.setItem('peup_meta_trimestral', JSON.stringify({
      Financeiro: { ouro: 250000, recompensas: { bronze: "R$ 500", prata: "R$ 1.000", ouro: "R$ 2.000" } },
      Clientes: { ouro: 50, recompensas: { bronze: "R$ 500", prata: "R$ 1.000", ouro: "R$ 2.000" } },
      Pessoas: { ouro: 2, recompensas: { bronze: "R$ 500", prata: "R$ 1.000", ouro: "R$ 2.000" } },
      Eficiência: { ouro: 5, recompensas: { bronze: "R$ 500", prata: "R$ 1.000", ouro: "R$ 2.000" } }
    }));
    localStorage.setItem('peup_metas_individuais', JSON.stringify([
      { colaboradorId: 'João', pilar: 'Financeiro', indicador: 'Faturamento', ouro: 50000, realizado: 10000 }
    ]));
    localStorage.setItem('peup_acoes', JSON.stringify([
      { titulo: "Ligar para 10 clientes", responsavelId: "João", prazo: new Date().toISOString().split('T')[0], status: "capa" },
      { titulo: "Atualizar CRM", responsavelId: "João", prazo: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: "capa" }
    ]));
    window.location.reload();
  };

  return (
    <div className="p-8">
      <button onClick={seed} className="bg-[#630d16] text-white p-4 rounded-lg">
        Carregar Dados Iniciais Reais
      </button>
    </div>
  );
}
