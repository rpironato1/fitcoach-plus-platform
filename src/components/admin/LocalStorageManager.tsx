/**
 * LocalStorage Manager Component
 * 
 * Provides UI controls for managing localStorage data and switching
 * between localStorage and Supabase modes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { localStorageService } from '@/services/localStorageService';
import { Database, Trash2, Download, Upload, User, Users, Settings } from 'lucide-react';

export function LocalStorageManager() {
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [currentData, setCurrentData] = useState<Record<string, unknown> | null>(null);
  const [authSession, setAuthSession] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    checkCurrentMode();
    loadCurrentData();
  }, []);

  const checkCurrentMode = () => {
    const isUsingLocalStorage = localStorageService.shouldUseLocalStorage();
    setUseLocalStorage(isUsingLocalStorage);
  };

  const loadCurrentData = () => {
    const data = localStorageService.getData();
    const session = localStorageService.getCurrentSession();
    setCurrentData(data);
    setAuthSession(session);
  };

  const toggleStorageMode = (enabled: boolean) => {
    if (enabled) {
      localStorageService.enableLocalStorageMode();
      toast({
        title: "Modo localStorage Ativado",
        description: "Agora usando dados locais para testes. Recarregando página...",
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      localStorageService.disableLocalStorageMode();
      toast({
        title: "Modo Supabase Ativado",
        description: "Voltando para banco de dados Supabase. Recarregando página...",
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const quickLogin = async (role: 'admin' | 'trainer' | 'student') => {
    try {
      let session;
      switch (role) {
        case 'admin':
          session = await localStorageService.quickLoginAsAdmin();
          break;
        case 'trainer':
          session = await localStorageService.quickLoginAsTrainer();
          break;
        case 'student':
          session = await localStorageService.quickLoginAsStudent();
          break;
      }
      
      toast({
        title: "Login Realizado",
        description: `Logado como ${role}. Recarregando página...`,
      });
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Erro no Login",
        description: "Não foi possível fazer login automático.",
        variant: "destructive"
      });
    }
  };

  const handleDataVariation = (variation: 'empty' | 'minimal' | 'full') => {
    localStorageService.addDataVariation(variation);
    loadCurrentData();
    
    toast({
      title: "Dados Atualizados",
      description: `Carregado conjunto de dados: ${variation}`,
    });
  };

  const clearAllData = () => {
    localStorageService.clearData();
    setCurrentData(null);
    setAuthSession(null);
    
    toast({
      title: "Dados Limpos",
      description: "Todos os dados localStorage foram removidos.",
    });
  };

  const exportData = () => {
    const exportedData = localStorageService.exportForSupabase();
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitcoach-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados Exportados",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  const demoCredentials = localStorageService.getDemoCredentials();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciador de Dados localStorage
          </CardTitle>
          <CardDescription>
            Controle o sistema de dados para testes e desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Modo de Armazenamento</h3>
              <p className="text-sm text-muted-foreground">
                {useLocalStorage ? 'Usando localStorage (modo teste)' : 'Usando Supabase (produção)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={useLocalStorage ? "default" : "secondary"}>
                {useLocalStorage ? 'localStorage' : 'Supabase'}
              </Badge>
              <Switch
                checked={useLocalStorage}
                onCheckedChange={toggleStorageMode}
                aria-label="Alternar entre localStorage e Supabase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {useLocalStorage && (
        <>
          <Tabs defaultValue="quick-access" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick-access">Acesso Rápido</TabsTrigger>
              <TabsTrigger value="data-management">Gestão de Dados</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
            </TabsList>

            <TabsContent value="quick-access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Login Rápido
                  </CardTitle>
                  <CardDescription>
                    Faça login instantâneo com contas de demonstração
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={() => quickLogin('admin')} variant="outline">
                      🛡️ Admin
                    </Button>
                    <Button onClick={() => quickLogin('trainer')} variant="outline">
                      💪 Personal Trainer
                    </Button>
                    <Button onClick={() => quickLogin('student')} variant="outline">
                      👤 Aluno
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Credenciais Demo:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Admin:</strong><br />
                        {demoCredentials.admin.email}<br />
                        {demoCredentials.admin.password}
                      </div>
                      <div>
                        <strong>Trainer:</strong><br />
                        {demoCredentials.trainer.email}<br />
                        {demoCredentials.trainer.password}
                      </div>
                      <div>
                        <strong>Student:</strong><br />
                        {demoCredentials.student.email}<br />
                        {demoCredentials.student.password}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Variações de Dados
                  </CardTitle>
                  <CardDescription>
                    Carregue diferentes conjuntos de dados para teste
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => handleDataVariation('empty')}
                      variant="outline"
                    >
                      📭 Dados Vazios
                    </Button>
                    <Button 
                      onClick={() => handleDataVariation('minimal')}
                      variant="outline"
                    >
                      📄 Dados Mínimos
                    </Button>
                    <Button 
                      onClick={() => handleDataVariation('full')}
                      variant="outline"
                    >
                      📚 Dados Completos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Operações de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={exportData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button onClick={loadCurrentData} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Recarregar
                    </Button>
                    <Button onClick={clearAllData} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Tudo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Sessão Ativa:</h4>
                      <p className="text-sm text-muted-foreground">
                        {authSession ? `${authSession.user.email} (${authSession.user.id})` : 'Nenhuma'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Última Atualização:</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentData?.lastUpdated ? new Date(currentData.lastUpdated).toLocaleString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {currentData && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Estatísticas de Dados:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <strong>Usuários:</strong> {currentData.users?.length || 0}
                        </div>
                        <div>
                          <strong>Profiles:</strong> {currentData.profiles?.length || 0}
                        </div>
                        <div>
                          <strong>Trainers:</strong> {currentData.trainer_profiles?.length || 0}
                        </div>
                        <div>
                          <strong>Alunos:</strong> {currentData.student_profiles?.length || 0}
                        </div>
                        <div>
                          <strong>Sessões:</strong> {currentData.sessions?.length || 0}
                        </div>
                        <div>
                          <strong>Pagamentos:</strong> {currentData.payments?.length || 0}
                        </div>
                        <div>
                          <strong>Dietas:</strong> {currentData.diet_plans?.length || 0}
                        </div>
                        <div>
                          <strong>Treinos:</strong> {currentData.workout_plans?.length || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}