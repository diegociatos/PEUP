export interface Prioridade {
  id: string;
  texto: string;
  origem: 'anual' | 'trimestral';
}

export interface Categoria {
  id: string;
  nome: string;
  indicadores: any[];
  prioridades: Prioridade[];
}

export interface PeupData {
  empresaId: string;
  ano: number;
  trimestre: string;
  mes: string;
  categorias: Categoria[];
  metasIndividuais: any[];
  acoes: any[];
}

export function getPeupData(): PeupData {
  const data = localStorage.getItem('peup_data');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse peup_data", e);
    }
  }
  return {
    empresaId: 'empresa_a',
    ano: 2026,
    trimestre: 'Q1',
    mes: 'abril',
    categorias: [],
    metasIndividuais: [],
    acoes: []
  };
}

export function savePeupData(data: PeupData) {
  localStorage.setItem('peup_data', JSON.stringify(data));
}
