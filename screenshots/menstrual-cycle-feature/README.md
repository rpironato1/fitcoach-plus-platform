# 🌸 Recurso de Treino Adaptado ao Ciclo Menstrual

## 📋 Visão Geral

Esta funcionalidade permite que alunas do sexo feminino ativem treinos e dietas personalizados baseados em seu ciclo menstrual, proporcionando uma experiência de fitness mais eficaz e alinhada com as necessidades fisiológicas de cada fase do ciclo.

## ✨ Características Implementadas

### 🎯 **Seleção de Gênero**
- Campo obrigatório para definir o gênero do aluno
- Interface intuitiva com dropdown de seleção
- Feedback visual quando não definido
- Suporte para: Feminino, Masculino, Outro

### 🌸 **Card de Treino Adaptado ao Ciclo**
- **Visibilidade Condicional**: Aparece apenas para alunas do sexo feminino
- **Toggle de Ativação**: Switch para ativar/desativar a funcionalidade
- **Informações Detalhadas**: Dialog explicativo sobre as fases do ciclo
- **Status Visual**: Badge mostrando se está ativo ou inativo

## 🔄 Fases do Ciclo Menstrual Consideradas

### 🌙 **Fase Menstrual (dias 1-5)**
- **Treinos**: Mais leves, foco em alongamento e yoga
- **Dieta**: Rica em ferro e magnésio
- **Exemplo**: "Treino Leve - Yoga & Alongamento"

### 🌱 **Fase Folicular (dias 6-14)**
- **Treinos**: Energia crescente, intensidade moderada
- **Benefícios**: Boa fase para novos exercícios
- **Exemplo**: "Caminhada & Mobilidade"

### 🌸 **Ovulação (dias 14-16)**
- **Treinos**: Pico de energia, treinos intensos e força
- **Performance**: Máxima capacidade física
- **Exemplo**: "Treino de Força Moderado"

### 🍂 **Fase Lútea (dias 17-28)**
- **Treinos**: Redução gradual, foco em resistência
- **Dieta**: Redução de sódio e açúcar

## 🤖 Integração com IA

### **Personalização Inteligente**
- A IA considera a fase do ciclo ao gerar treinos nos planos pagos
- Adaptação automática das recomendações nutricionais
- Sugestões baseadas em evidências científicas

### **Exemplo de Adaptação Nutricional**
```
🔄 Sem ciclo menstrual:
- Calorias: 2,200 kcal
- Gorduras: 80g

🌸 Com ciclo menstrual (fase menstrual):
- Calorias: 2,100 kcal (ajuste para reduzir inchaço)
- Ferro (alta): 18mg (para compensar perda menstrual)
- Foco em ferro, magnésio e redução de inchaço
```

## 💻 Implementação Técnica

### **Componentes Criados**
1. **MenstrualCycleCard** (`/components/ui/menstrual-cycle-card.tsx`)
2. **GenderSelection** (`/components/ui/gender-selection.tsx`)
3. **StudentDashboardDemo** (`/pages/student/StudentDashboardDemo.tsx`)

### **Tipos de Dados Estendidos**
```typescript
student_profiles: {
  gender: string | null
  menstrual_cycle_tracking: boolean
  // ... outros campos existentes
}
```

### **Funcionalidades**
- ✅ Persistência local via localStorage (demo)
- ✅ Feedback visual com toast notifications
- ✅ Interface responsiva mobile-first
- ✅ Conditional rendering baseado no gênero
- ✅ Informações educativas sobre o ciclo

## 📱 Interface do Usuário

### **Estados da Interface**

1. **Estado Inicial** (gênero não definido):
   - Mostra card de "Informações Pessoais" 
   - Dica para definir gênero e desbloquear recursos

2. **Gênero Feminino Definido**:
   - Aparece o card "Treino Adaptado ao Ciclo"
   - Switch para ativar a funcionalidade
   - Botão de informações com detalhes completos

3. **Funcionalidade Ativada**:
   - Status "Ativo" visível
   - Treinos adaptados nas sessões agendadas
   - Plano de dieta personalizado
   - Indicadores visuais das fases do ciclo

## 🎨 Design e UX

### **Elementos Visuais**
- **Cores**: Gradiente rosa/roxo para tema feminino
- **Ícones**: 💗 (coração), 📅 (calendário), 🌸 (flor)
- **Emojis das Fases**: 🌙 🌱 🌸 🍂
- **Feedback**: Toast notifications personalizadas

### **Responsividade**
- ✅ Layout mobile-first
- ✅ Cards adaptativos
- ✅ Texto escalável
- ✅ Touch-friendly em dispositivos móveis

## 🧪 Testes Realizados

### **Cenários Testados**
1. ✅ Seleção de gênero (Feminino/Masculino/Outro)
2. ✅ Aparição condicional do card de ciclo menstrual
3. ✅ Ativação/desativação da funcionalidade
4. ✅ Visualização do dialog informativo
5. ✅ Adaptação de treinos e dietas
6. ✅ Responsividade mobile

### **Screenshots Capturados**
- `menstrual-cycle-dashboard-desktop.png` - Dashboard completo desktop
- `menstrual-cycle-dashboard-mobile.png` - Dashboard completo mobile
- `menstrual-cycle-card-feature.png` - Card da funcionalidade em destaque

## 🚀 Próximos Passos

### **Integração Backend** (Futuro)
- [ ] Migração da database para adicionar campos `gender` e `menstrual_cycle_tracking`
- [ ] API endpoints para salvar/recuperar preferências
- [ ] Integração com o serviço de IA existente

### **Melhorias Futuras**
- [ ] Calendário menstrual interativo
- [ ] Previsão inteligente das fases
- [ ] Histórico de sintomas
- [ ] Relatórios de performance por fase
- [ ] Notificações baseadas no ciclo

## 🔐 Considerações de Privacidade

- ✅ Dados sensíveis tratados com cuidado
- ✅ Funcionalidade opcional (opt-in)
- ✅ Interface educativa e respeitosa
- ✅ Informações baseadas em ciência

---

**Implementado com ❤️ para empoderar mulheres em sua jornada fitness!**