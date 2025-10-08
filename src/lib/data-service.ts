import { 
  Recrutador, 
  Bet, 
  Lote, 
  LoteItem, 
  Registro, 
  Filtros, 
  KPIs, 
  ResumoPorBet, 
  ResumoPorRecrutador, 
  ResumoPorValor, 
  DadosSemanal,
  ProgressoLote,
  DetalheLoteItem
} from './types';

// Utilitários para localStorage
const STORAGE_KEYS = {
  recrutadores: 'bancas_recrutadores',
  bets: 'bancas_bets',
  lotes: 'bancas_lotes',
  loteItens: 'bancas_lote_itens',
  registros: 'bancas_registros'
};

// Gerador de IDs únicos melhorado
let idCounter = 0;
const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const counter = ++idCounter;
  const random = Math.random().toString(36).substr(2, 9);
  const performance = typeof window !== 'undefined' && window.performance ? window.performance.now() : Math.random() * 1000;
  // Garantir que cada ID seja único combinando timestamp, contador, random e performance
  return `id_${timestamp}_${counter}_${random}_${Math.floor(performance)}`;
};

// Funções de persistência
export const storage = {
  get: <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  
  set: <T>(key: string, data: T[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// CRUD para Recrutadores
export const recrutadorService = {
  getAll: (): Recrutador[] => storage.get<Recrutador>(STORAGE_KEYS.recrutadores),
  
  create: (recrutador: Omit<Recrutador, 'id'>): Recrutador => {
    const recrutadores = recrutadorService.getAll();
    const novo: Recrutador = {
      ...recrutador,
      id: generateUniqueId()
    };
    recrutadores.push(novo);
    storage.set(STORAGE_KEYS.recrutadores, recrutadores);
    return novo;
  },
  
  update: (id: string, data: Partial<Recrutador>): Recrutador | null => {
    const recrutadores = recrutadorService.getAll();
    const index = recrutadores.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    recrutadores[index] = { ...recrutadores[index], ...data };
    storage.set(STORAGE_KEYS.recrutadores, recrutadores);
    return recrutadores[index];
  },
  
  delete: (id: string): boolean => {
    const recrutadores = recrutadorService.getAll();
    const filtered = recrutadores.filter(r => r.id !== id);
    if (filtered.length === recrutadores.length) return false;
    
    storage.set(STORAGE_KEYS.recrutadores, filtered);
    return true;
  }
};

// CRUD para Bets
export const betService = {
  getAll: (): Bet[] => storage.get<Bet>(STORAGE_KEYS.bets),
  
  create: (bet: Omit<Bet, 'id'>): Bet => {
    const bets = betService.getAll();
    const nova: Bet = {
      ...bet,
      id: generateUniqueId()
    };
    bets.push(nova);
    storage.set(STORAGE_KEYS.bets, bets);
    return nova;
  },
  
  update: (id: string, data: Partial<Bet>): Bet | null => {
    const bets = betService.getAll();
    const index = bets.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    bets[index] = { ...bets[index], ...data };
    storage.set(STORAGE_KEYS.bets, bets);
    return bets[index];
  },
  
  delete: (id: string): boolean => {
    const bets = betService.getAll();
    const filtered = bets.filter(b => b.id !== id);
    if (filtered.length === bets.length) return false;
    
    storage.set(STORAGE_KEYS.bets, filtered);
    return true;
  }
};

// CRUD para Lotes
export const loteService = {
  getAll: (): Lote[] => storage.get<Lote>(STORAGE_KEYS.lotes),
  
  create: (lote: Omit<Lote, 'id' | 'criado_em'>): Lote => {
    const lotes = loteService.getAll();
    const novo: Lote = {
      ...lote,
      id: generateUniqueId(),
      criado_em: new Date().toISOString()
    };
    lotes.push(novo);
    storage.set(STORAGE_KEYS.lotes, lotes);
    return novo;
  },
  
  update: (id: string, data: Partial<Lote>): Lote | null => {
    const lotes = loteService.getAll();
    const index = lotes.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    lotes[index] = { ...lotes[index], ...data };
    storage.set(STORAGE_KEYS.lotes, lotes);
    return lotes[index];
  },
  
  delete: (id: string): boolean => {
    const lotes = loteService.getAll();
    const filtered = lotes.filter(l => l.id !== id);
    if (filtered.length === lotes.length) return false;
    
    storage.set(STORAGE_KEYS.lotes, filtered);
    return true;
  }
};

// CRUD para LoteItens
export const loteItemService = {
  getAll: (): LoteItem[] => storage.get<LoteItem>(STORAGE_KEYS.loteItens),
  
  getByLoteId: (loteId: string): LoteItem[] => {
    return loteItemService.getAll().filter(item => item.lote_id === loteId);
  },
  
  create: (loteItem: Omit<LoteItem, 'id'>): LoteItem => {
    const loteItens = loteItemService.getAll();
    const novo: LoteItem = {
      ...loteItem,
      id: generateUniqueId()
    };
    loteItens.push(novo);
    storage.set(STORAGE_KEYS.loteItens, loteItens);
    return novo;
  },
  
  update: (id: string, data: Partial<LoteItem>): LoteItem | null => {
    const loteItens = loteItemService.getAll();
    const index = loteItens.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    loteItens[index] = { ...loteItens[index], ...data };
    storage.set(STORAGE_KEYS.loteItens, loteItens);
    return loteItens[index];
  },
  
  delete: (id: string): boolean => {
    const loteItens = loteItemService.getAll();
    const filtered = loteItens.filter(item => item.id !== id);
    if (filtered.length === loteItens.length) return false;
    
    storage.set(STORAGE_KEYS.loteItens, filtered);
    return true;
  },
  
  deleteByLoteId: (loteId: string): void => {
    const loteItens = loteItemService.getAll();
    const filtered = loteItens.filter(item => item.lote_id !== loteId);
    storage.set(STORAGE_KEYS.loteItens, filtered);
  }
};

// CRUD para Registros
export const registroService = {
  getAll: (): Registro[] => storage.get<Registro>(STORAGE_KEYS.registros),
  
  create: (registro: Omit<Registro, 'id' | 'data_hora'>): Registro => {
    const registros = registroService.getAll();
    const novo: Registro = {
      ...registro,
      id: generateUniqueId(),
      data_hora: new Date().toISOString()
    };
    registros.push(novo);
    storage.set(STORAGE_KEYS.registros, registros);
    return novo;
  },
  
  update: (id: string, data: Partial<Registro>): Registro | null => {
    const registros = registroService.getAll();
    const index = registros.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    // Não permitir alterar data_hora
    const { data_hora, ...updateData } = data;
    registros[index] = { ...registros[index], ...updateData };
    storage.set(STORAGE_KEYS.registros, registros);
    return registros[index];
  },
  
  delete: (id: string): boolean => {
    const registros = registroService.getAll();
    const filtered = registros.filter(r => r.id !== id);
    if (filtered.length === registros.length) return false;
    
    storage.set(STORAGE_KEYS.registros, filtered);
    return true;
  }
};

// Utilitários de formatação
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Filtros padrão
export const getFiltrosPadrao = (): Filtros => {
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  
  return {
    dataInicio: trintaDiasAtras.toISOString().split('T')[0],
    dataFim: hoje.toISOString().split('T')[0],
    bets: [],
    recrutadores: [],
    incluirReembolsadas: true
  };
};

// Serviços de Analytics
export const analyticsService = {
  filtrarRegistros: (filtros: Filtros): Registro[] => {
    const registros = registroService.getAll();
    
    return registros.filter(registro => {
      // Filtro de data
      const dataRegistro = new Date(registro.data_hora).toISOString().split('T')[0];
      if (dataRegistro < filtros.dataInicio || dataRegistro > filtros.dataFim) {
        return false;
      }
      
      // Filtro de bets (se vazio, inclui todas)
      if (filtros.bets.length > 0 && !filtros.bets.includes(registro.bet_id)) {
        return false;
      }
      
      // Filtro de recrutadores (se vazio, inclui todos)
      if (filtros.recrutadores.length > 0 && !filtros.recrutadores.includes(registro.recrutador_id)) {
        return false;
      }
      
      // Filtro de reembolsadas
      if (!filtros.incluirReembolsadas && registro.reembolso === 'Sim') {
        return false;
      }
      
      return true;
    });
  },
  
  calcularKPIs: (registros: Registro[]): KPIs => {
    const totalBancas = registros.length;
    const totalValor = registros.reduce((sum, r) => sum + r.valor, 0);
    const reembolsadas = registros.filter(r => r.reembolso === 'Sim');
    const naoReembolsadas = registros.filter(r => r.reembolso === 'Não');
    
    const totalReembolsadas = reembolsadas.length;
    const totalNaoReembolsadas = naoReembolsadas.length;
    const valorReembolsadas = reembolsadas.reduce((sum, r) => sum + r.valor, 0);
    const valorNaoReembolsadas = naoReembolsadas.reduce((sum, r) => sum + r.valor, 0);
    const taxaReembolso = totalBancas > 0 ? (totalReembolsadas / totalBancas) * 100 : 0;
    
    return {
      totalBancas,
      totalValor,
      totalReembolsadas,
      totalNaoReembolsadas,
      valorReembolsadas,
      valorNaoReembolsadas,
      taxaReembolso
    };
  },
  
  resumoPorBet: (registros: Registro[]): ResumoPorBet[] => {
    const bets = betService.getAll();
    const resumo: { [key: string]: ResumoPorBet } = {};
    
    // Inicializar resumo
    bets.forEach(bet => {
      resumo[bet.id] = {
        bet: bet.nome,
        qtdBancas: 0,
        total: 0,
        qtdReembolsadas: 0,
        qtdNaoReembolsadas: 0,
        percentualReembolso: 0
      };
    });
    
    // Calcular dados
    registros.forEach(registro => {
      if (resumo[registro.bet_id]) {
        resumo[registro.bet_id].qtdBancas++;
        resumo[registro.bet_id].total += registro.valor;
        
        if (registro.reembolso === 'Sim') {
          resumo[registro.bet_id].qtdReembolsadas++;
        } else {
          resumo[registro.bet_id].qtdNaoReembolsadas++;
        }
      }
    });
    
    // Calcular percentuais e filtrar apenas com dados
    return Object.values(resumo)
      .filter(item => item.qtdBancas > 0)
      .map(item => ({
        ...item,
        percentualReembolso: item.qtdBancas > 0 ? (item.qtdReembolsadas / item.qtdBancas) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  },
  
  resumoPorRecrutador: (registros: Registro[]): ResumoPorRecrutador[] => {
    const recrutadores = recrutadorService.getAll();
    const resumo: { [key: string]: ResumoPorRecrutador } = {};
    
    // Inicializar resumo
    recrutadores.forEach(recrutador => {
      resumo[recrutador.id] = {
        recrutador: recrutador.nome,
        qtd: 0,
        total: 0,
        percentualReembolso: 0
      };
    });
    
    // Calcular dados
    registros.forEach(registro => {
      if (resumo[registro.recrutador_id]) {
        resumo[registro.recrutador_id].qtd++;
        resumo[registro.recrutador_id].total += registro.valor;
      }
    });
    
    // Calcular percentuais e filtrar apenas com dados
    const registrosReembolsados = registros.filter(r => r.reembolso === 'Sim');
    
    return Object.values(resumo)
      .filter(item => item.qtd > 0)
      .map(item => {
        const reembolsadasRecrutador = registrosReembolsados.filter(r => 
          resumo[r.recrutador_id] && resumo[r.recrutador_id].recrutador === item.recrutador
        ).length;
        
        return {
          ...item,
          percentualReembolso: item.qtd > 0 ? (reembolsadasRecrutador / item.qtd) * 100 : 0
        };
      })
      .sort((a, b) => b.total - a.total);
  },
  
  resumoPorValor: (registros: Registro[]): ResumoPorValor[] => {
    const resumo: { [key: number]: ResumoPorValor } = {};
    
    registros.forEach(registro => {
      if (!resumo[registro.valor]) {
        resumo[registro.valor] = {
          valor: registro.valor,
          qtd: 0,
          total: 0,
          percentualReembolso: 0
        };
      }
      
      resumo[registro.valor].qtd++;
      resumo[registro.valor].total += registro.valor;
    });
    
    // Calcular percentuais
    const registrosReembolsados = registros.filter(r => r.reembolso === 'Sim');
    
    return Object.values(resumo)
      .map(item => {
        const reembolsadasValor = registrosReembolsados.filter(r => r.valor === item.valor).length;
        return {
          ...item,
          percentualReembolso: item.qtd > 0 ? (reembolsadasValor / item.qtd) * 100 : 0
        };
      })
      .sort((a, b) => b.total - a.total);
  },
  
  dadosSemanais: (registros: Registro[]): DadosSemanal[] => {
    const semanas: { [key: string]: DadosSemanal } = {};
    
    registros.forEach(registro => {
      const data = new Date(registro.data_hora);
      const ano = data.getFullYear();
      const semana = getWeekNumber(data);
      const chave = `${ano}-S${semana.toString().padStart(2, '0')}`;
      
      if (!semanas[chave]) {
        semanas[chave] = {
          semana: chave,
          quantidade: 0,
          total: 0
        };
      }
      
      semanas[chave].quantidade++;
      semanas[chave].total += registro.valor;
    });
    
    return Object.values(semanas).sort((a, b) => a.semana.localeCompare(b.semana));
  },
  
  progressoLotes: (): ProgressoLote[] => {
    const lotes = loteService.getAll();
    const bets = betService.getAll();
    const registros = registroService.getAll();
    
    return lotes.map(lote => {
      const bet = bets.find(b => b.id === lote.bet_id)!;
      const itensLote = loteItemService.getByLoteId(lote.id);
      const registrosLote = registros.filter(r => r.lote_id === lote.id);
      
      const planejadoTotal = itensLote.reduce((sum, item) => sum + item.quantidade_planejada, 0);
      const executadoTotal = registrosLote.length;
      const faltamTotal = Math.max(0, planejadoTotal - executadoTotal);
      
      return {
        lote,
        bet,
        planejadoTotal,
        executadoTotal,
        faltamTotal
      };
    }).sort((a, b) => new Date(b.lote.criado_em).getTime() - new Date(a.lote.criado_em).getTime());
  },
  
  detalheLote: (loteId: string): DetalheLoteItem[] => {
    const itensLote = loteItemService.getByLoteId(loteId);
    const registros = registroService.getAll().filter(r => r.lote_id === loteId);
    
    return itensLote.map(item => {
      const executado = registros.filter(r => r.valor === item.valor).length;
      const faltam = Math.max(0, item.quantidade_planejada - executado);
      
      return {
        valor: item.valor,
        planejado: item.quantidade_planejada,
        executado,
        faltam
      };
    }).sort((a, b) => a.valor - b.valor);
  }
};

// Função auxiliar para calcular número da semana
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}