
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm, RegisterForm } from '@/modules/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Dumbbell, Calendar, ChefHat, Trophy, Star, ArrowRight, 
  CheckCircle, PlayCircle, Shield, Zap, Heart, TrendingUp,
  Smartphone, Globe, MessageCircle, Award, Clock, Target
} from 'lucide-react';

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { toast } = useToast();

  const handleDemoClick = () => {
    toast({
      title: "Demo em breve! 🚀",
      description: "Nossa demo interativa estará disponível em breve. Por enquanto, explore nossa plataforma criando uma conta gratuita!",
    });
  };

  const handleExperimentarClick = () => {
    toast({
      title: "Crie sua conta gratuita! ✨",
      description: "Para experimentar este recurso, crie sua conta gratuita e comece a usar o FitCoach hoje mesmo!",
    });
  };

  const handlePricingClick = (planName: string) => {
    toast({
      title: `Plano ${planName} selecionado! 💼`,
      description: "Entre em contato conosco ou crie sua conta para ativar este plano e começar a transformar seu negócio!",
    });
  };

  const features = [
    {
      icon: Users,
      title: 'Gestão Inteligente de Alunos',
      description: 'Gerencie até 40 alunos com sistema avançado de acompanhamento, métricas detalhadas e comunicação integrada.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calendar,
      title: 'Agendamento Automático',
      description: 'Sistema inteligente de agendamento com notificações automáticas, lembretes e gestão de horários otimizada.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: ChefHat,
      title: 'IA para Planos de Dieta',
      description: 'Crie planos alimentares personalizados com inteligência artificial avançada em segundos.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Trophy,
      title: 'Sistema de Pagamentos Seguro',
      description: 'Receba pagamentos automaticamente com segurança bancária e controle total de receitas.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Analytics e Relatórios',
      description: 'Dashboards completos com métricas de desempenho, progresso dos alunos e insights de negócio.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Plataforma completamente responsiva, otimizada para todos os dispositivos e tamanhos de tela.',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 'Grátis',
      period: 'para sempre',
      features: [
        'Até 3 alunos',
        'Agendamento básico',
        'Suporte por email',
        'Dashboard básico',
        'Controle de pagamentos'
      ],
      popular: false,
      color: 'border-gray-200',
      button: 'outline'
    },
    {
      name: 'Pro',
      price: 'R$ 49',
      period: '/mês',
      features: [
        'Até 40 alunos',
        '50 créditos IA/mês',
        'Planos de dieta com IA',
        'Analytics avançado',
        'Suporte prioritário',
        'Notificações automáticas',
        'Relatórios detalhados'
      ],
      popular: true,
      color: 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50',
      button: 'default'
    },
    {
      name: 'Elite',
      price: 'R$ 99',
      period: '/mês',
      features: [
        'Alunos ilimitados',
        '100 créditos IA/mês',
        'Recursos avançados',
        'API completa',
        'Suporte 24/7',
        'White label',
        'Integração personalizada',
        'Consultoria mensal'
      ],
      popular: false,
      color: 'border-purple-500',
      button: 'outline'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Personal Trainer',
      image: '👩‍🦰',
      content: 'O FitCoach revolucionou meu negócio! Consegui dobrar minha receita em 6 meses com a automação de processos.',
      rating: 5,
      metric: '+150% receita'
    },
    {
      name: 'João Santos',
      role: 'Coach Nutricional',
      image: '👨‍🍳',
      content: 'A IA para criação de dietas é incrível. Economizo 4 horas por semana e meus clientes adoram os resultados.',
      rating: 5,
      metric: '4h economizadas/semana'
    },
    {
      name: 'Ana Costa',
      role: 'Treinadora Funcional',
      image: '👩‍💼',
      content: 'Interface intuitiva e suporte excepcional. Meus alunos elogiam a facilidade de uso da plataforma.',
      rating: 5,
      metric: '98% satisfação clientes'
    }
  ];

  const faqs = [
    {
      question: 'Como funciona o período gratuito?',
      answer: 'Você pode usar o plano Free indefinidamente com até 3 alunos. Não há pegadinhas ou taxas ocultas.'
    },
    {
      question: 'Posso migrar entre planos facilmente?',
      answer: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente.'
    },
    {
      question: 'Como funciona a IA para dietas?',
      answer: 'Nossa IA analisa perfil, objetivos e restrições alimentares para gerar planos personalizados em segundos.'
    },
    {
      question: 'Os dados dos meus alunos estão seguros?',
      answer: 'Absolutamente! Usamos criptografia bancária e seguimos rigorosamente a LGPD para proteger todos os dados.'
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, sem multas ou burocracias. Você pode cancelar diretamente no painel ou entrando em contato conosco.'
    }
  ];

  const stats = [
    { value: '2.5k+', label: 'Personal Trainers' },
    { value: '15k+', label: 'Alunos Ativos' },
    { value: 'R$ 2M+', label: 'Processados' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-white p-2 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FitCoach
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                v2.0
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)} className="hidden sm:inline-flex">
                Entrar
              </Button>
              <Button size="sm" onClick={() => setIsRegisterOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Começar Grátis
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Star className="h-3 w-3 mr-1" />
                Mais de 2.500 Personal Trainers
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                A plataforma
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  mais completa
                </span>
                para Personal Trainers
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Gerencie alunos, crie treinos e dietas com IA, automatize pagamentos e 
                acompanhe resultados. Tudo em uma plataforma moderna e intuitiva.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => setIsRegisterOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <PlayCircle className="h-5 w-5 mr-2" />
                Começar Grátis
              </Button>
              <Button size="lg" variant="outline" className="border-2" onClick={handleDemoClick}>
                <Globe className="h-5 w-5 mr-2" />
                Ver Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Dashboard do Trainer</div>
                  <div className="text-sm text-gray-500">Visão geral completa</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-500">Alunos Ativos</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">R$ 4.8k</div>
                    <div className="text-xs text-gray-500">Este Mês</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Meta Mensal</span>
                  <span className="text-sm font-semibold">80%</span>
                </div>
                <Progress value={80} className="h-2" aria-label="Meta mensal: 80% concluído" />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +24% vs mês anterior
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-purple-100 text-purple-700">
              Recursos Poderosos
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Tudo que você precisa para
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                crescer seu negócio
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Uma suíte completa de ferramentas profissionais para elevar seu trabalho como Personal Trainer
            </p>
          </div>

          <Tabs defaultValue="0" className="max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 h-auto p-1 bg-gray-100">
              {features.map((feature, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white"
                >
                  <feature.icon className="h-5 w-5" />
                  <span className="text-xs text-center leading-tight">{feature.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {features.map((feature, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-8">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="p-8 lg:p-12 space-y-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold mb-4">{feature.title}</h3>
                          <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                        </div>
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleExperimentarClick}>
                          Experimentar Agora
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                      <div className={`bg-gradient-to-br ${feature.gradient} p-8 lg:p-12 flex items-center justify-center`}>
                        <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <feature.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-semibold">{feature.title}</div>
                                <div className="text-sm opacity-80">Ativo</div>
                              </div>
                            </div>
                            <Separator className="bg-white/20" />
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Eficiência</span>
                                <span className="text-sm">95%</span>
                              </div>
                              <Progress value={95} className="bg-white/20" aria-label="Eficiência do treino: 95%" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-green-100 text-green-700">
              <Heart className="h-3 w-3 mr-1" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Transformando carreiras de
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Personal Trainers
              </span>
            </h2>
          </div>

          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{testimonial.image}</div>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <p className="text-gray-600 italic">"{testimonial.content}"</p>
                      
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {testimonial.metric}
                      </Badge>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-orange-100 text-orange-700">
              <Award className="h-3 w-3 mr-1" />
              Planos Flexíveis
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Escolha o plano ideal para
              <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                seu momento de carreira
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comece grátis e escale conforme seu negócio cresce. Sem compromissos, sem pegadinhas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} hover:shadow-xl transition-all duration-300 ${plan.popular ? 'scale-105' : 'hover:scale-105'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {plan.price}
                    </div>
                    <div className="text-gray-500">{plan.period}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-6 text-lg ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
                    variant={plan.button as "default" | "outline"}
                    onClick={() => plan.name === 'Free' ? setIsRegisterOpen(true) : handlePricingClick(plan.name)}
                  >
                    {plan.name === 'Free' ? 'Começar Grátis' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-gray-200 text-gray-700">
              <MessageCircle className="h-3 w-3 mr-1" />
              Dúvidas Frequentes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ainda tem
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"> dúvidas?</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Pronto para transformar
                <span className="block">seu negócio?</span>
              </h2>
              <p className="text-xl sm:text-2xl opacity-90 max-w-2xl mx-auto">
                Junte-se a mais de 2.500 Personal Trainers que já estão revolucionando suas carreiras com o FitCoach
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setIsRegisterOpen(true)} className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
                <PlayCircle className="h-5 w-5 mr-2" />
                Começar Grátis Agora
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6" onClick={handleDemoClick}>
                <Clock className="h-5 w-5 mr-2" />
                Agendar Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Dados 100% Seguros
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Setup em 2 minutos
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Sem compromisso
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-white p-2 rounded-lg">
                    <Dumbbell className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <span className="text-2xl font-bold">FitCoach</span>
              </div>
              <p className="text-gray-400">
                A plataforma mais completa para Personal Trainers no Brasil.
              </p>
              <div className="flex gap-4">
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  🇧🇷 Feito no Brasil
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">
            <p>&copy; 2024 FitCoach. Todos os direitos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Bem-vindo de volta!</DialogTitle>
            <DialogDescription className="text-center">
              Entre com suas credenciais para acessar sua conta FitCoach
            </DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => setIsLoginOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Crie sua conta gratuita</DialogTitle>
            <DialogDescription className="text-center">
              Comece sua jornada no FitCoach agora mesmo. É grátis e leva menos de 2 minutos!
            </DialogDescription>
          </DialogHeader>
          <RegisterForm onSuccess={() => setIsRegisterOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
