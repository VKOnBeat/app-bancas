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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react';
import { 
  registroService, 
  betService, 
  recrutadorService, 
  loteService,
  formatCurrency, 
  formatDateTime 
} from '@/lib/data-service';
import { Registro, Bet, Recrutador, Lote } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface RegistrosProps {
  onNavigate: (page: string) => void;
}

export default function Registros({ onNavigate }: RegistrosProps) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [recrutadores, setRecrutadores] = useState<Recrutador[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<Registro | null>(null);
  const [formData, setFormData] = useState({
    recrutador_id: '',
    bet_id: '',
    valor: '',
    reembolso: 'Não' as 'Sim' | 'Não',
    observacao: '',
    lote_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setRegistros(registroService.getAll().sort((a, b) => 
      new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
    ));
    setBets(betService.getAll().sort((a, b) => a.nome.localeCompare(b.nome)));
    setRecrutadores(recrutadorService.getAll().filter(r => r.ativo).sort((a, b) => a.nome.localeCompare(b.nome)));
    setLotes(loteService.getAll().sort((a, b) => 
      new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    ));
  };

  const registrosFiltrados = registros.filter(registro => {
    if (!busca) return true;
    
    const buscaLower = busca.toLowerCase();
    const bet = bets.find(b => b.id === registro.bet_id);
    const recrutador = recrutadores.find(r => r.id === registro.recrutador_id);
    
    return (
      registro.valor.toString().includes(buscaLower) ||
      (registro.observacao && registro.observacao.toLowerCase().includes(buscaLower)) ||
      (bet && bet.nome.toLowerCase().includes(buscaLower)) ||
      (recrutador && recrutador.nome.toLowerCase().includes(buscaLower))
    );
  });

  const abrirDialog = (registro?: Registro) => {
    if (registro) {
      setRegistroEditando(registro);
      setFormData({
        recrutador_id: registro.recrutador_id,
        bet_id: registro.bet_id,
        valor: registro.valor.toString(),
        reembolso: registro.reembolso,
        observacao: registro.observacao || '',
        lote_id: registro.lote_id || ''
      });
    } else {
      setRegistroEditando(null);
      setFormData({
        recrutador_id: '',
        bet_id: '',
        valor: '',
        reembolso: 'Não',
        observacao: '',
        lote_id: ''
      });
    }
    setDialogAberto(true);
  };

  const salvarRegistro = () => {
    if (!formData.recrutador_id || !formData.bet_id || !formData.valor) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      alert('Valor deve ser um número positivo');
      return;
    }

    const dadosRegistro = {
      recrutador_id: formData.recrutador_id,
      bet_id: formData.bet_id,
      valor,
      reembolso: formData.reembolso,
      observacao: formData.observacao || undefined,
      lote_id: formData.lote_id === 'none' ? undefined : formData.lote_id || undefined
    };

    if (registroEditando) {
      registroService.update(registroEditando.id, dadosRegistro);
    } else {
      registroService.create(dadosRegistro);
    }

    setDialogAberto(false);
    carregarDados();
  };

  const excluirRegistro = (id: string) => {
    registroService.delete(id);
    carregarDados();
  };

  const getBetNome = (betId: string) => {
    return bets.find(b => b.id === betId)?.nome || 'N/A';
  };

  const getRecrutadorNome = (recrutadorId: string) => {
    return recrutadores.find(r => r.id === recrutadorId)?.nome || 'N/A';
  };

  const getLoteInfo = (loteId?: string) => {
    if (!loteId) return null;
    const lote = lotes.find(l => l.id === loteId);
    if (!lote) return null;
    const bet = bets.find(b => b.id === lote.bet_id);
    return `${bet?.nome || 'N/A'} - ${formatDateTime(lote.criado_em)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Registros de Bancas</h1>
          <p className="text-muted-foreground">Gerencie todos os registros de bancas</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar Banca
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {registroEditando ? 'Editar Registro' : 'Nova Banca'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recrutador">Recrutador *</Label>
                <Select value={formData.recrutador_id} onValueChange={(value) => setFormData(prev => ({ ...prev, recrutador_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o recrutador" />
                  </SelectTrigger>
                  <SelectContent>
                    {recrutadores.map(recrutador => (
                      <SelectItem key={generateUniqueId('recrutador')} value={recrutador.id}>
                        {recrutador.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bet">Casa de Aposta *</Label>
                <Select value={formData.bet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, bet_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a casa de aposta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bets.map(bet => (
                      <SelectItem key={generateUniqueId('bet')} value={bet.id}>
                        {bet.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reembolso">Reembolso</Label>
                <Select value={formData.reembolso} onValueChange={(value: 'Sim' | 'Não') => setFormData(prev => ({ ...prev, reembolso: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lote">Lote (opcional)</Label>
                <Select value={formData.lote_id} onValueChange={(value) => setFormData(prev => ({ ...prev, lote_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lote (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum lote</SelectItem>
                    {lotes.map(lote => {
                      const bet = bets.find(b => b.id === lote.bet_id);
                      return (
                        <SelectItem key={generateUniqueId('lote')} value={lote.id}>
                          {bet?.nome} - {formatDateTime(lote.criado_em)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  placeholder="Observações sobre a banca..."
                  value={formData.observacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarRegistro}>
                  {registroEditando ? 'Salvar' : 'Registrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por valor, observação, bet ou recrutador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      <div className="space-y-4">
        {registrosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground">
                  {busca ? 'Tente ajustar os filtros de busca' : 'Comece registrando sua primeira banca'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          registrosFiltrados.map(registro => (
            <Card key={generateUniqueId('registro')}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(registro.valor)}
                      </Badge>
                      <Badge variant={registro.reembolso === 'Sim' ? 'destructive' : 'default'}>
                        {registro.reembolso === 'Sim' ? 'Reembolsada' : 'Não Reembolsada'}
                      </Badge>
                      {registro.lote_id && (
                        <Badge variant="secondary">
                          Lote
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{getRecrutadorNome(registro.recrutador_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{getBetNome(registro.bet_id)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(registro.data_hora)}</span>
                    </div>
                    
                    {registro.observacao && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {registro.observacao}
                      </p>
                    )}
                    
                    {registro.lote_id && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Lote:</strong> {getLoteInfo(registro.lote_id)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirDialog(registro)}
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
                            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => excluirRegistro(registro.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas rápidas */}
      {registrosFiltrados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas da Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{registrosFiltrados.length}</p>
                <p className="text-sm text-muted-foreground">Registros</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + r.valor, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {registrosFiltrados.filter(r => r.reembolso === 'Sim').length}
                </p>
                <p className="text-sm text-muted-foreground">Reembolsadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}