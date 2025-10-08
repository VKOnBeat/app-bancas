"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Package, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Building2,
  X
} from 'lucide-react';
import { 
  loteService, 
  loteItemService, 
  betService,
  analyticsService,
  formatCurrency, 
  formatDateTime 
} from '@/lib/data-service';
import { Lote, LoteItem, Bet, ProgressoLote, DetalheLoteItem } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface LotesProps {
  onNavigate: (page: string) => void;
}

export default function Lotes({ onNavigate }: LotesProps) {
  const [lotes, setLotes] = useState<ProgressoLote[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [loteEditando, setLoteEditando] = useState<Lote | null>(null);
  const [loteDetalhando, setLoteDetalhando] = useState<ProgressoLote | null>(null);
  const [detalheLote, setDetalheLote] = useState<DetalheLoteItem[]>([]);
  const [formData, setFormData] = useState({
    bet_id: '',
    observacao: ''
  });
  const [itensLote, setItensLote] = useState<{ valor: string; quantidade: string }[]>([
    { valor: '', quantidade: '' }
  ]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setLotes(analyticsService.progressoLotes());
    setBets(betService.getAll().sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  const abrirDialog = (lote?: Lote) => {
    if (lote) {
      setLoteEditando(lote);
      setFormData({
        bet_id: lote.bet_id,
        observacao: lote.observacao || ''
      });
      
      // Carregar itens do lote
      const itens = loteItemService.getByLoteId(lote.id);
      setItensLote(itens.length > 0 
        ? itens.map(item => ({ valor: item.valor.toString(), quantidade: item.quantidade_planejada.toString() }))
        : [{ valor: '', quantidade: '' }]
      );
    } else {
      setLoteEditando(null);
      setFormData({
        bet_id: '',
        observacao: ''
      });
      setItensLote([{ valor: '', quantidade: '' }]);
    }
    setDialogAberto(true);
  };

  const abrirDetalhe = (lote: ProgressoLote) => {
    setLoteDetalhando(lote);
    setDetalheLote(analyticsService.detalheLote(lote.lote.id));
    setDetalheAberto(true);
  };

  const adicionarItem = () => {
    setItensLote(prev => [...prev, { valor: '', quantidade: '' }]);
  };

  const removerItem = (index: number) => {
    if (itensLote.length > 1) {
      setItensLote(prev => prev.filter((_, i) => i !== index));
    }
  };

  const atualizarItem = (index: number, campo: 'valor' | 'quantidade', valor: string) => {
    setItensLote(prev => prev.map((item, i) => 
      i === index ? { ...item, [campo]: valor } : item
    ));
  };

  const salvarLote = () => {
    if (!formData.bet_id) {
      alert('Selecione uma casa de aposta');
      return;
    }

    // Validar itens
    const itensValidos = itensLote.filter(item => item.valor && item.quantidade);
    if (itensValidos.length === 0) {
      alert('Adicione pelo menos um item com valor e quantidade');
      return;
    }

    for (const item of itensValidos) {
      const valor = parseFloat(item.valor);
      const quantidade = parseInt(item.quantidade);
      
      if (isNaN(valor) || valor <= 0) {
        alert('Todos os valores devem ser números positivos');
        return;
      }
      
      if (isNaN(quantidade) || quantidade <= 0) {
        alert('Todas as quantidades devem ser números inteiros positivos');
        return;
      }
    }

    const dadosLote = {
      bet_id: formData.bet_id,
      observacao: formData.observacao || undefined
    };

    let lote: Lote;
    if (loteEditando) {
      lote = loteService.update(loteEditando.id, dadosLote)!;
      // Remover itens antigos
      loteItemService.deleteByLoteId(lote.id);
    } else {
      lote = loteService.create(dadosLote);
    }

    // Criar novos itens
    itensValidos.forEach(item => {
      loteItemService.create({
        lote_id: lote.id,
        valor: parseFloat(item.valor),
        quantidade_planejada: parseInt(item.quantidade)
      });
    });

    setDialogAberto(false);
    carregarDados();
  };

  const excluirLote = (id: string) => {
    loteItemService.deleteByLoteId(id);
    loteService.delete(id);
    carregarDados();
  };

  const getBetNome = (betId: string) => {
    return bets.find(b => b.id === betId)?.nome || 'N/A';
  };

  const calcularProgressoPercentual = (executado: number, planejado: number) => {
    if (planejado === 0) return 0;
    return Math.min(100, (executado / planejado) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Lotes</h1>
          <p className="text-muted-foreground">Controle de metas e progresso por lote</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {loteEditando ? 'Editar Lote' : 'Novo Lote'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="bet">Casa de Aposta *</Label>
                <Select value={formData.bet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, bet_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a casa de aposta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bets.map(bet => (
                      <SelectItem key={generateUniqueId('bet-lote')} value={bet.id}>
                        {bet.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  placeholder="Observações sobre o lote..."
                  value={formData.observacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Itens do Lote (Metas por Valor)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {itensLote.map((item, index) => (
                    <div key={generateUniqueId('item-lote')} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="10.00"
                          value={item.valor}
                          onChange={(e) => atualizarItem(index, 'valor', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Quantidade Planejada</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="50"
                          value={item.quantidade}
                          onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                        />
                      </div>
                      {itensLote.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removerItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarLote}>
                  {loteEditando ? 'Salvar' : 'Criar Lote'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Lotes */}
      <div className="space-y-4">
        {lotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum lote encontrado</h3>
                <p className="text-muted-foreground">
                  Comece criando seu primeiro lote para organizar as metas
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          lotes.map(lote => {
            const progresso = calcularProgressoPercentual(lote.executadoTotal, lote.planejadoTotal);
            const status = lote.faltamTotal === 0 ? 'completo' : lote.executadoTotal > 0 ? 'progresso' : 'pendente';
            
            return (
              <Card key={generateUniqueId('lote-card')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {lote.bet.nome}
                        </Badge>
                        <Badge variant={
                          status === 'completo' ? 'default' : 
                          status === 'progresso' ? 'secondary' : 'outline'
                        }>
                          {status === 'completo' ? 'Completo' : 
                           status === 'progresso' ? 'Em Progresso' : 'Pendente'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Criado em {formatDateTime(lote.lote.criado_em)}</span>
                      </div>
                      
                      {lote.lote.observacao && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {lote.lote.observacao}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso: {lote.executadoTotal} / {lote.planejadoTotal}</span>
                          <span>{progresso.toFixed(1)}%</span>
                        </div>
                        <Progress value={progresso} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{lote.planejadoTotal}</p>
                          <p className="text-xs text-muted-foreground">Planejado</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{lote.executadoTotal}</p>
                          <p className="text-xs text-muted-foreground">Executado</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-orange-600">{lote.faltamTotal}</p>
                          <p className="text-xs text-muted-foreground">Faltam</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDetalhe(lote)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDialog(lote.lote)}
                      >
                        <Edit className="w-4 h-4" />
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
                              Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita e todos os itens do lote serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => excluirLote(lote.lote.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Detalhe do Lote */}
      <Dialog open={detalheAberto} onOpenChange={setDetalheAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalhe do Lote - {loteDetalhando?.bet.nome}
            </DialogTitle>
          </DialogHeader>
          {loteDetalhando && (
            <div className="space-y-6">
              {/* Resumo Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{loteDetalhando.planejadoTotal}</p>
                      <p className="text-sm text-muted-foreground">Total Planejado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{loteDetalhando.executadoTotal}</p>
                      <p className="text-sm text-muted-foreground">Total Executado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{loteDetalhando.faltamTotal}</p>
                      <p className="text-sm text-muted-foreground">Total Faltam</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress 
                      value={calcularProgressoPercentual(loteDetalhando.executadoTotal, loteDetalhando.planejadoTotal)} 
                      className="h-3" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detalhe por Valor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhe por Valor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detalheLote.map((item) => {
                      const progressoItem = calcularProgressoPercentual(item.executado, item.planejado);
                      return (
                        <div key={generateUniqueId('detalhe-item')} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{formatCurrency(item.valor)}</h4>
                            <Badge variant={item.faltam === 0 ? 'default' : 'outline'}>
                              {item.faltam === 0 ? 'Completo' : `${item.faltam} faltam`}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-center text-sm mb-3">
                            <div>
                              <p className="font-bold text-blue-600">{item.planejado}</p>
                              <p className="text-muted-foreground">Planejado</p>
                            </div>
                            <div>
                              <p className="font-bold text-green-600">{item.executado}</p>
                              <p className="text-muted-foreground">Executado</p>
                            </div>
                            <div>
                              <p className="font-bold text-orange-600">{item.faltam}</p>
                              <p className="text-muted-foreground">Faltam</p>
                            </div>
                          </div>
                          
                          <Progress value={progressoItem} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setDetalheAberto(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estatísticas Gerais */}
      {lotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Gerais dos Lotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{lotes.length}</p>
                <p className="text-sm text-muted-foreground">Total de Lotes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {lotes.reduce((sum, l) => sum + l.planejadoTotal, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Planejado</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {lotes.reduce((sum, l) => sum + l.executadoTotal, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Executado</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {lotes.filter(l => l.faltamTotal === 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Lotes Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}