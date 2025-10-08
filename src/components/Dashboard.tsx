"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  Filter
} from 'lucide-react';
import { 
  analyticsService, 
  betService, 
  recrutadorService, 
  formatCurrency, 
  getFiltrosPadrao 
} from '@/lib/data-service';
import { Filtros, KPIs, ResumoPorBet, ResumoPorRecrutador, ResumoPorValor, DadosSemanal } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [filtros, setFiltros] = useState<Filtros>(getFiltrosPadrao());
  const [kpis, setKpis] = useState<KPIs>({
    totalBancas: 0,
    totalValor: 0,
    totalReembolsadas: 0,
    totalNaoReembolsadas: 0,
    valorReembolsadas: 0,
    valorNaoReembolsadas: 0,
    taxaReembolso: 0
  });
  const [resumoPorBet, setResumoPorBet] = useState<ResumoPorBet[]>([]);
  const [resumoPorRecrutador, setResumoPorRecrutador] = useState<ResumoPorRecrutador[]>([]);
  const [resumoPorValor, setResumoPorValor] = useState<ResumoPorValor[]>([]);
  const [dadosSemanais, setDadosSemanais] = useState<DadosSemanal[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [recrutadores, setRecrutadores] = useState<any[]>([]);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    setBets(betService.getAll());
    setRecrutadores(recrutadorService.getAll());
    atualizarDados();
  }, []);

  // Atualizar dados quando filtros mudarem
  useEffect(() => {
    atualizarDados();
  }, [filtros]);

  const atualizarDados = () => {
    const registrosFiltrados = analyticsService.filtrarRegistros(filtros);
    
    setKpis(analyticsService.calcularKPIs(registrosFiltrados));
    setResumoPorBet(analyticsService.resumoPorBet(registrosFiltrados));
    setResumoPorRecrutador(analyticsService.resumoPorRecrutador(registrosFiltrados));
    setResumoPorValor(analyticsService.resumoPorValor(registrosFiltrados));
    setDadosSemanais(analyticsService.dadosSemanais(registrosFiltrados));
  };

  const handleFiltroChange = (campo: keyof Filtros, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleBet = (betId: string) => {
    const novasBets = filtros.bets.includes(betId)
      ? filtros.bets.filter(id => id !== betId)
      : [...filtros.bets, betId];
    handleFiltroChange('bets', novasBets);
  };

  const toggleRecrutador = (recrutadorId: string) => {
    const novosRecrutadores = filtros.recrutadores.includes(recrutadorId)
      ? filtros.recrutadores.filter(id => id !== recrutadorId)
      : [...filtros.recrutadores, recrutadorId];
    handleFiltroChange('recrutadores', novosRecrutadores);
  };

  const resetFiltros = () => {
    setFiltros(getFiltrosPadrao());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Análise completa das bancas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={resetFiltros}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {filtrosAbertos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Globais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                />
              </div>
            </div>

            {/* Bets */}
            <div>
              <Label>Casas de Aposta</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {bets.map(bet => (
                  <Badge
                    key={generateUniqueId('bet-filter')}
                    variant={filtros.bets.length === 0 || filtros.bets.includes(bet.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleBet(bet.id)}
                  >
                    {bet.nome}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {filtros.bets.length === 0 ? 'Todas selecionadas' : `${filtros.bets.length} selecionadas`}
              </p>
            </div>

            {/* Recrutadores */}
            <div>
              <Label>Recrutadores</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {recrutadores.map(recrutador => (
                  <Badge
                    key={generateUniqueId('recrutador-filter')}
                    variant={filtros.recrutadores.length === 0 || filtros.recrutadores.includes(recrutador.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRecrutador(recrutador.id)}
                  >
                    {recrutador.nome}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {filtros.recrutadores.length === 0 ? 'Todos selecionados' : `${filtros.recrutadores.length} selecionados`}
              </p>
            </div>

            {/* Incluir Reembolsadas */}
            <div className="flex items-center space-x-2">
              <Switch
                id="incluirReembolsadas"
                checked={filtros.incluirReembolsadas}
                onCheckedChange={(checked) => handleFiltroChange('incluirReembolsadas', checked)}
              />
              <Label htmlFor="incluirReembolsadas">Incluir reembolsadas</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bancas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalBancas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalValor)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsadas</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalReembolsadas}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(kpis.valorReembolsadas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Reembolso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.taxaReembolso.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalNaoReembolsadas} não reembolsadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bancas por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosSemanais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosSemanais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Por Bet */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Casa de Aposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumoPorBet.map((item) => (
                <div key={generateUniqueId('resumo-bet')} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.bet}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qtdBancas} bancas • {item.percentualReembolso.toFixed(1)}% reembolso
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qtdReembolsadas}R / {item.qtdNaoReembolsadas}NR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Recrutador */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Recrutador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumoPorRecrutador.map((item) => (
                <div key={generateUniqueId('resumo-recrutador')} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.recrutador}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qtd} bancas • {item.percentualReembolso.toFixed(1)}% reembolso
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Valor */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumoPorValor.map((item) => (
                <div key={generateUniqueId('resumo-valor')} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(item.valor)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qtd} bancas • {item.percentualReembolso.toFixed(1)}% reembolso
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => onNavigate('registros')} className="h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              Ver Registros
            </Button>
            <Button onClick={() => onNavigate('lotes')} variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="w-6 h-6" />
              Gerenciar Lotes
            </Button>
            <Button onClick={() => onNavigate('recrutadores')} variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              Recrutadores
            </Button>
            <Button onClick={() => onNavigate('bets')} variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              Casas de Aposta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}