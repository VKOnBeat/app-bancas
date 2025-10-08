"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';
import { recrutadorService } from '@/lib/data-service';
import { Recrutador } from '@/lib/types';

interface RecrutadoresProps {
  onNavigate: (page: string) => void;
}

export default function Recrutadores({ onNavigate }: RecrutadoresProps) {
  const [recrutadores, setRecrutadores] = useState<Recrutador[]>([]);
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [recrutadorEditando, setRecrutadorEditando] = useState<Recrutador | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    ativo: true
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setRecrutadores(recrutadorService.getAll().sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  const recrutadoresFiltrados = recrutadores.filter(recrutador => {
    if (!busca) return true;
    return recrutador.nome.toLowerCase().includes(busca.toLowerCase());
  });

  const abrirDialog = (recrutador?: Recrutador) => {
    if (recrutador) {
      setRecrutadorEditando(recrutador);
      setFormData({
        nome: recrutador.nome,
        ativo: recrutador.ativo
      });
    } else {
      setRecrutadorEditando(null);
      setFormData({
        nome: '',
        ativo: true
      });
    }
    setDialogAberto(true);
  };

  const salvarRecrutador = () => {
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    // Verificar se nome já existe (exceto se estiver editando o mesmo)
    const nomeExiste = recrutadores.some(r => 
      r.nome.toLowerCase() === formData.nome.trim().toLowerCase() && 
      r.id !== recrutadorEditando?.id
    );

    if (nomeExiste) {
      alert('Já existe um recrutador com este nome');
      return;
    }

    const dadosRecrutador = {
      nome: formData.nome.trim(),
      ativo: formData.ativo
    };

    if (recrutadorEditando) {
      recrutadorService.update(recrutadorEditando.id, dadosRecrutador);
    } else {
      recrutadorService.create(dadosRecrutador);
    }

    setDialogAberto(false);
    carregarDados();
  };

  const excluirRecrutador = (id: string) => {
    recrutadorService.delete(id);
    carregarDados();
  };

  const toggleStatus = (recrutador: Recrutador) => {
    recrutadorService.update(recrutador.id, { ativo: !recrutador.ativo });
    carregarDados();
  };

  const recrutadoresAtivos = recrutadores.filter(r => r.ativo).length;
  const recrutadoresInativos = recrutadores.filter(r => !r.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recrutadores</h1>
          <p className="text-muted-foreground">Gerencie os recrutadores do sistema</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Recrutador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {recrutadorEditando ? 'Editar Recrutador' : 'Novo Recrutador'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Nome do recrutador"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarRecrutador}>
                  {recrutadorEditando ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recrutadores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recrutadoresAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{recrutadoresInativos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recrutadores..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recrutadores */}
      <div className="space-y-4">
        {recrutadoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum recrutador encontrado</h3>
                <p className="text-muted-foreground">
                  {busca ? 'Tente ajustar os filtros de busca' : 'Comece adicionando seu primeiro recrutador'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recrutadoresFiltrados.map(recrutador => (
              <Card key={recrutador.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{recrutador.nome}</h3>
                      <Badge 
                        variant={recrutador.ativo ? 'default' : 'secondary'}
                        className="mt-2"
                      >
                        {recrutador.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(recrutador)}
                      className="flex-1"
                    >
                      {recrutador.ativo ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirDialog(recrutador)}
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
                            Tem certeza que deseja excluir o recrutador "{recrutador.nome}"? 
                            Esta ação não pode ser desfeita e pode afetar registros existentes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => excluirRecrutador(recrutador.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dica */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Recrutadores inativos não aparecem nos formulários de registro, 
                mas seus registros históricos são preservados. Use a opção "Desativar" em vez de excluir 
                para manter o histórico completo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}