// Tipos para o sistema de bancas

export interface Recrutador {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Bet {
  id: string;
  nome: string;
}

export interface Lote {
  id: string;
  bet_id: string;
  criado_em: string;
  observacao?: string;
}

export interface LoteItem {
  id: string;
  lote_id: string;
  valor: number;
  quantidade_planejada: number;
}

export interface Registro {
  id: string;
  data_hora: string;
  recrutador_id: string;
  bet_id: string;
  valor: number;
  reembolso: 'Sim' | 'Não';
  observacao?: string;
  lote_id?: string;
}

// Tipos para filtros
export interface Filtros {
  dataInicio: string;
  dataFim: string;
  bets: string[];
  recrutadores: string[];
  incluirReembolsadas: boolean;
}

// Tipos para KPIs
export interface KPIs {
  totalBancas: number;
  totalValor: number;
  totalReembolsadas: number;
  totalNaoReembolsadas: number;
  valorReembolsadas: number;
  valorNaoReembolsadas: number;
  taxaReembolso: number;
}

// Tipos para tabelas resumo
export interface ResumoPorBet {
  bet: string;
  qtdBancas: number;
  total: number;
  qtdReembolsadas: number;
  qtdNaoReembolsadas: number;
  percentualReembolso: number;
}

export interface ResumoPorRecrutador {
  recrutador: string;
  qtd: number;
  total: number;
  percentualReembolso: number;
}

export interface ResumoPorValor {
  valor: number;
  qtd: number;
  total: number;
  percentualReembolso: number;
}

// Tipos para gráficos
export interface DadosSemanal {
  semana: string;
  quantidade: number;
  total: number;
}

// Tipos para lotes
export interface ProgressoLote {
  lote: Lote;
  bet: Bet;
  planejadoTotal: number;
  executadoTotal: number;
  faltamTotal: number;
}

export interface DetalheLoteItem {
  valor: number;
  planejado: number;
  executado: number;
  faltam: number;
}