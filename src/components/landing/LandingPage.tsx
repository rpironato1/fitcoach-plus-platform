
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Dumbbell, Calendar, CreditCard, Users, Star, Zap } from "lucide-react";
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAuth(false)}
              className="text-sm"
            >
              ← Voltar para página inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">FitCoach</h1>
            </div>
            <div className="space-x-4">
              <Button variant="ghost" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
                Entrar
              </Button>
              <Button onClick={() => { setShowAuth(true); setIsLogin(false); }}>
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gerencie seu negócio fitness com
            <span className="text-blue-600"> FitCoach</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A plataforma completa para personal trainers organizarem agenda, treinos, 
            dietas e pagamentos dos alunos em um só lugar.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => { setShowAuth(true); setIsLogin(false); }}>
              Começar Grátis
            </Button>
            <Button size="lg" variant="outline">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa para gerenciar seus alunos
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Agenda Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize suas sessões, controle horários e receba lembretes automáticos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Gestão de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acompanhe o progresso, histórico e informações completas de cada aluno.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Pagamentos Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receba pagamentos por cartão ou PIX com taxas reduzidas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Planos para cada momento do seu negócio
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Free</CardTitle>
                <CardDescription className="text-center">
                  <span className="text-3xl font-bold">Grátis</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Até 3 alunos
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Agenda básica
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Taxa 1,5% por sessão
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Dietas R$ 7,90/unidade
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-blue-500 border-2 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-center">Pro</CardTitle>
                <CardDescription className="text-center">
                  <span className="text-3xl font-bold">R$ 49</span>/mês
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Até 40 alunos
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Sem taxas por sessão
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    50 créditos IA/mês
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Dietas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    Trial 14 dias grátis
                  </li>
                </ul>
                <Button className="w-full">
                  Começar Trial
                </Button>
              </CardContent>
            </Card>

            {/* Elite Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Elite</CardTitle>
                <CardDescription className="text-center">
                  <span className="text-3xl font-bold">R$ 99</span>/mês
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Alunos ilimitados
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-blue-500 mr-2" />
                    Cashback 0,5%
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    150 créditos IA/mês
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Relatórios avançados
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-xl font-bold">FitCoach</span>
          </div>
          <p className="text-gray-400">
            © 2024 FitCoach. Todos os direitos reservados. Transforme seu negócio fitness.
          </p>
        </div>
      </footer>
    </div>
  );
}
