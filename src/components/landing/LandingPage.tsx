
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Dumbbell, Calendar, ChefHat, Trophy, Star } from 'lucide-react';

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Gestão de Alunos',
      description: 'Gerencie seus alunos e acompanhe seu progresso de forma eficiente.'
    },
    {
      icon: Calendar,
      title: 'Agendamento de Sessões',
      description: 'Organize sua agenda e mantenha controle total dos seus treinos.'
    },
    {
      icon: ChefHat,
      title: 'Planos de Dieta com IA',
      description: 'Crie planos alimentares personalizados com inteligência artificial.'
    },
    {
      icon: Trophy,
      title: 'Sistema de Pagamentos',
      description: 'Receba pagamentos de forma segura e automática.'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 'Grátis',
      features: ['Até 3 alunos', 'Agendamento básico', 'Suporte por email'],
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 49/mês',
      features: ['Até 40 alunos', '50 créditos IA/mês', 'Planos de dieta com IA', 'Suporte prioritário'],
      popular: true
    },
    {
      name: 'Elite',
      price: 'R$ 99/mês',
      features: ['Alunos ilimitados', '100 créditos IA/mês', 'Recursos avançados', 'Suporte 24/7'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FitCoach</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setIsLoginOpen(true)}>
              Entrar
            </Button>
            <Button onClick={() => setIsRegisterOpen(true)}>
              Cadastrar
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          A plataforma completa para
          <span className="text-blue-600"> Personal Trainers</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Gerencie seus alunos, crie planos de treino e dieta com IA, agende sessões e receba pagamentos tudo em um só lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => setIsRegisterOpen(true)}>
            Começar Grátis
          </Button>
          <Button size="lg" variant="outline">
            Ver Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tudo que você precisa para crescer
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Planos que se adaptam ao seu negócio
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'}>
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de personal trainers que já estão usando o FitCoach
          </p>
          <Button size="lg" variant="secondary" onClick={() => setIsRegisterOpen(true)}>
            Começar Agora - É Grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Dumbbell className="h-8 w-8" />
            <span className="text-2xl font-bold">FitCoach</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 FitCoach. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrar na sua conta</DialogTitle>
            <DialogDescription>
              Entre com suas credenciais para acessar o FitCoach
            </DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => setIsLoginOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar sua conta</DialogTitle>
            <DialogDescription>
              Cadastre-se gratuitamente e comece a usar o FitCoach hoje mesmo
            </DialogDescription>
          </DialogHeader>
          <RegisterForm onSuccess={() => setIsRegisterOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
