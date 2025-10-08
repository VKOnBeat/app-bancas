import { 
  recrutadorService, 
  betService, 
  loteService, 
  loteItemService, 
  registroService 
} from './data-service';

// Função para inicializar dados de exemplo
export const initializeSeedData = () => {
  // Verificar se já existem dados
  if (recrutadorService.getAll().length > 0) {
    return; // Dados já existem
  }
  
  // Criar Bets
  const bets = [
    { nome: 'BetApp' },
    { nome: 'SeguraBet' },
    { nome: 'BetNacional' },
    { nome: 'MilhãoBet' }
  ];
  
  const betsCreated = bets.map(bet => betService.create(bet));
  
  // Criar Recrutadores
  const recrutadores = [
    { nome: 'Duzin', ativo: true },
    { nome: 'TK', ativo: true },
    { nome: 'Rai', ativo: true }
  ];
  
  const recrutadoresCreated = recrutadores.map(rec => recrutadorService.create(rec));
  
  // Criar um lote de exemplo
  const loteExample = loteService.create({
    bet_id: betsCreated[0].id, // BetApp
    observacao: 'Lote BetApp – Semana atual'
  });
  
  // Criar itens do lote
  const loteItens = [
    { lote_id: loteExample.id, valor: 10, quantidade_planejada: 50 },
    { lote_id: loteExample.id, valor: 20, quantidade_planejada: 30 }
  ];
  
  loteItens.forEach(item => loteItemService.create(item));
  
  // Gerar 30 registros distribuídos nas últimas 6 semanas
  const valores = [10, 20, 30, 40];
  const reembolsos: ('Sim' | 'Não')[] = ['Sim', 'Não'];
  const observacoes = [
    'Registro automático',
    'Cliente novo',
    'Promoção especial',
    'Indicação',
    undefined
  ];
  
  const agora = new Date();
  
  for (let i = 0; i < 30; i++) {
    // Distribuir nas últimas 6 semanas (42 dias)
    const diasAtras = Math.floor(Math.random() * 42);
    const dataRegistro = new Date(agora);
    dataRegistro.setDate(agora.getDate() - diasAtras);
    
    const recrutadorAleatorio = recrutadoresCreated[Math.floor(Math.random() * recrutadoresCreated.length)];
    const betAleatoria = betsCreated[Math.floor(Math.random() * betsCreated.length)];
    const valorAleatorio = valores[Math.floor(Math.random() * valores.length)];
    const reembolsoAleatorio = reembolsos[Math.floor(Math.random() * reembolsos.length)];
    const observacaoAleatoria = observacoes[Math.floor(Math.random() * observacoes.length)];
    
    // Alguns registros vinculados ao lote (apenas para BetApp e valores 10 ou 20)
    let loteId: string | undefined;
    if (betAleatoria.id === betsCreated[0].id && (valorAleatorio === 10 || valorAleatorio === 20) && Math.random() < 0.3) {
      loteId = loteExample.id;
    }
    
    const registro = {
      recrutador_id: recrutadorAleatorio.id,
      bet_id: betAleatoria.id,
      valor: valorAleatorio,
      reembolso: reembolsoAleatorio,
      observacao: observacaoAleatoria,
      lote_id: loteId
    };
    
    // Criar registro com data específica
    const registroCreated = registroService.create(registro);
    
    // Ajustar a data manualmente (hack para seed data)
    const registros = registroService.getAll();
    const index = registros.findIndex(r => r.id === registroCreated.id);
    if (index !== -1) {
      registros[index].data_hora = dataRegistro.toISOString();
      // Salvar diretamente no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancas_registros', JSON.stringify(registros));
      }
    }
  }
  
  console.log('Dados de exemplo inicializados com sucesso!');
};