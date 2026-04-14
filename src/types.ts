export interface ValorComplementar {
  id: string;
  nome: string;
  significado: string;
  devemosFazer: string;
  naoDevemosFazer: string;
}

export interface Promessa {
  id: string;
  descricao: string;
  aplicacaoPratica: string;
}

export interface PEUP {
  empresa_id: string;
  proposito: string;
  valores_grupo: string[]; // Fixos
  valores_complementares: ValorComplementar[];
  promessas: Promessa[];
  bhag: {
    meta_3_5: string;
    meta_10: string;
    meta_25: string;
  };
}

export interface Empresa {
  id: string;
  nome: string;
  segmento: string;
  responsavel: string;
  descricao: string;
  logo_url: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  ano_fiscal_inicio?: string;
  status?: 'Ativa' | 'Inativa';
  dataCadastro?: string;
  cnpj: string;
  qualificacao: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

export interface OnboardingState {
  step: number;
  completed: boolean;
}

export interface Faixa {
  nome: 'Bronze' | 'Prata' | 'Ouro';
  valor: number;
  recompensa: string;
}

export interface Prioridade {
  id: number;
  nome: string;
}

export interface Pilar {
  id: string;
  nome: string;
  icone: string;
  indicadores: Indicador[];
  prioridades: Prioridade[];
}

export interface Acao {
  id: string;
  titulo: string;
  responsavel: string;
  responsavelId?: string; // Novo campo
  data_inicio: string;
  prazo: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  ordem: number;
  status: 'A Fazer' | 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Aguardando Verificação';
  kpi: {
    nome: string;
    unidade: 'Número' | '%' | 'R$';
    meta: number;
    realizado: number;
  };
  prioridadeVinculadaId: string;
  kpiEstrategicoVinculadoId: string;
  categoria: string;
  metaIndividualId?: string; // New field
  verificado: boolean; // New field
  comentarioVerificacao?: string;
  valorEntregue?: number;
  data_conclusao?: string; // Added field
}

export interface Indicador {
  id: string;
  nome: string;
  bronze: number;
  prata: number;
  ouro: number;
  unidade?: string;
  realizado_mensal: Record<number, number>; // mes -> valor
}

export interface HistoricoMensal {
  ano: number;
  mes: number; // 1-12
  meta_mensal: number;
  meta_mensal_vinculada_trimestre_id?: string; // New field
  resultado_real: number;
  acoes: Acao[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  autor?: string;
  data?: string;
}

export interface HistoricoTrimestral {
  ano: number;
  trimestre: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  faixas: Faixa[];
  tema: string;
  recompensas: { bronze: string; prata: string; ouro: string; };
  prioridades: Prioridade[]; // Max 3
  swot: SWOTAnalysis;
  categorias: any[];
}

export interface Planejamento {
  empresa_id: string;
  historico_anual: {
    ano: number;
    pilares: Pilar[];
    faixas: Faixa[]; // Added rewards per level
    faturamento_total: number;
    margem_liquida: number;
    ticket_medio: number;
  }[];
  historico_trimestral: HistoricoTrimestral[];
  historico_mensal: HistoricoMensal[];
}

export interface KPI {
  id: string;
  nome: string;
  meta: number;
  realizado: number;
  unidade: string;
}

export type Role = 'ADMIN' | 'SOCIO' | 'GESTOR' | 'COLABORADOR';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  empresa_id?: string;
  empresaId?: string; // Alias para consistência
  responsavelDiretoId?: string;
  senha?: string;
  primeiro_acesso?: boolean;
}

export interface ColaboradorPrioridade {
  id: string;
  colaboradorId: string;
  titulo: string;
  texto: string; // Added
  ano: number; // Added
  vinculoPrioridadeTrimestralId: string;
  kpi: {
    nome: string;
    meta: number;
    atual: number;
    status: 'verde' | 'amarelo' | 'vermelho';
  };
}

export interface TipoReuniao {
  id: string;
  nome: string;
  empresa_id: string;
  ativo: boolean;
}

export interface Decisao {
  id: string;
  descricao: string;
  status: 'Pendente' | 'Concluída';
}

export interface Reuniao {
  id: string;
  data: string;
  tipo: 'Sala de Guerra' | 'Planejamento Interno' | 'Reunião de Sócios' | 'Outros';
  empresa_ids: string[];
  participantes: string[];
  ata: string;
  decisoes: Decisao[];
  acoes_geradas: Acao[];
  status: 'Editando' | 'Finalizada';
  gestor_id: string;
  timer_duration?: number; // Added
}

export interface ValorEmpresa {
  id: string;
  empresa_id: string;
  nome: string;
}

export interface AuditLog {
  id: string;
  meta_id: string;
  empresa_id: string;
  tipo: 'criacao' | 'alteracao' | 'exclusao';
  campo_alterado: 'bronze' | 'prata' | 'ouro' | 'indicador' | 'responsavel';
  valor_anterior: string;
  valor_novo: string;
  alterado_por: string;
  alterado_em: string;
  reuniao_vinculada: string | null;
  motivo: string | null;
}

export interface RockefellerHabit {
  id: number;
  titulo: string;
  acoes: string[];
}

export interface ValidationHistory {
  id: string;
  metaId: string;
  status: 'pendente' | 'validada' | 'rejeitada';
  comentario?: string;
  data: string;
  autorId: string;
}

export interface Message {
  id: string;
  autorId: string;
  autorNome: string;
  texto: string;
  data: string;
}

export interface MetaIndividual {
  id: string;
  colaboradorId: string;
  pilar: string;
  indicador: string;
  bronze: number;
  prata: number;
  ouro: number;
  realizado: number;
  mes: number;
  ano: number;
  status: 'pendente' | 'concluida_pendente_validacao' | 'validada' | 'rejeitada';
  validado?: boolean;
  data_conclusao_proposta?: string;
  data_validacao?: string;
  validadoPor?: string;
  comentario_validacao?: string;
  historico?: ValidationHistory[];
  thread: Message[];
  comentarios: string[];
}

export interface RockefellerCheckin {
  id: string;
  semana: number;
  ano: number;
  respostas: {
    habitId: number;
    checkedActions: number[]; // indices das acoes marcadas
    comentario: string;
  }[];
  autorId: string;
  data: string;
}
