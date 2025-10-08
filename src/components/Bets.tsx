"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp
} from 'lucide-react';
import { betService, registroService, formatCurrency } from '@/lib/data-service';
import { Bet } from '@/lib/types';

interface BetsProps {
  onNavigate: (page: string) => void;
}

export default function Bets({ onNavigate }: BetsProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [betEditando, setBetEditando] = useState<Bet | null>(null);
  const [formData, setFormData] = useState({
    nome: ''
  });
  const [estatisticas, setEstatisticas] = useState<{ [key: string]: { total: number; registros: number } }>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const todasBets = betService.getAll().sort((a, b) => a.nome.localeCompare(b.nome));
    setBets(todasBets);
    
    // Calcular estatísticas
    const registros = registroService.getAll();
    const stats: { [key: string]: { total: number; registros: number } } = {};
    
    todasBets.forEach(bet => {
      const registrosBet = registros.filter(r => r.bet_id === bet.id);
      stats[bet.id] = {
        total: registrosBet.reduce((sum, r) => sum + r.valor, 0),
        registros: registrosBet.length
      };
    });
    
    setEstatisticas(stats);
  };

  const betsFiltradas = bets.filter(bet => {
    if (!busca) return true;
    return bet.nome.toLowerCase().includes(busca.toLowerCase());
  });

  const abrirDialog = (bet?: Bet) => {
    if (bet) {
      setBetEditando(bet);
      setFormData({
        nome: bet.nome
      });
    } else {
      setBetEditando(null);
      setFormData({
        nome: ''
      });
    }
    setDialogAberto(true);
  };

  const salvarBet = () => {
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    // Verificar se nome já existe (exceto se estiver editando a mesma)
    const nomeExiste = bets.some(b => 
      b.nome.toLowerCase() === formData.nome.trim().toLowerCase() && 
      b.id !== betEditando?.id
    );

    if (nomeExiste) {
      alert('Já existe uma casa de aposta com este nome');
      return;
    }

    const dadosBet = {
      nome: formData.nome.trim()
    };

    if (betEditando) {
      betService.update(betEditando.id, dadosBet);
    } else {
      betService.create(dadosBet);
    }

    setDialogAberto(false);
    carregarDados();
  };

  const excluirBet = (id: string) => {
    betService.delete(id);
    carregarDados();
  };

  const totalGeral = Object.values(estatisticas).reduce((sum, stat) => sum + stat.total, 0);
  const registrosGeral = Object.values(estatisticas).reduce((sum, stat) => sum + stat.registros, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Casas de Aposta</h1>
          <p className="text-muted-foreground">Gerencie as casas de aposta do sistema</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Casa de Aposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {betEditando ? 'Editar Casa de Aposta' : 'Nova Casa de Aposta'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Nome da casa de aposta"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarBet}>
                  {betEditando ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Casas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimentado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGeral)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrosGeral}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar casas de aposta..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Casas de Aposta */}
      <div className="space-y-4">
        {betsFiltradas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma casa de aposta encontrada</h3>
                <p className="text-muted-foreground">
                  {busca ? 'Tente ajustar os filtros de busca' : 'Comece adicionando sua primeira casa de aposta'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {betsFiltradas.map(bet => {
              const stats = estatisticas[bet.id] || { total: 0, registros: 0 };
              return (
                <Card key={bet.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bet.nome}</h3>
                        <div className="mt-2 space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {stats.registros} registros
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total movimentado:</span>
                        <span className="font-semibold">{formatCurrency(stats.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Registros:</span>
                        <span className="font-semibold">{stats.registros}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDialog(bet)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a casa de aposta "{bet.nome}"? 
                              Esta ação não pode ser desfeita e pode afetar registros existentes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => excluirBet(bet.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ranking das Casas de Aposta */}
      {bets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking por Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bets
                .map(bet => ({
                  ...bet,
                  stats: estatisticas[bet.id] || { total: 0, registros: 0 }
                }))
                .sort((a, b) => b.stats.total - a.stats.total)
                .slice(0, 5)
                .map((bet, index) => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{bet.nome}</p>
                        <p className="text-sm text-muted-foreground">{bet.stats.registros} registros</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(bet.stats.total)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dica */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> As casas de aposta são usadas para categorizar os registros de bancas. 
                Certifique-se de que os nomes sejam claros e únicos para facilitar a análise dos dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}