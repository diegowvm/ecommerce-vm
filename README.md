# 🛍️ Xegai Shop - E-commerce Moderno

Uma plataforma de e-commerce completa e moderna, focada em moda, calçados e acessórios, desenvolvida com as melhores tecnologias do mercado.

## ✨ Principais Melhorias Implementadas

### 🏗️ **Arquitetura e Estrutura**
- ✅ **Estrutura de pastas reorganizada** e padronizada
- ✅ **Sistema de tipos TypeScript** completo e consistente
- ✅ **Hooks customizados** para autenticação, carrinho e produtos
- ✅ **Configuração otimizada** do Vite e Tailwind CSS
- ✅ **Lazy loading estratégico** para melhor performance

### 🎨 **Design System Profissional**
- ✅ **Design system moderno** com tokens de design padronizados
- ✅ **Tema claro/escuro** com identidade visual da Xegai
- ✅ **Componentes reutilizáveis** e acessíveis
- ✅ **Animações suaves** e micro-interações
- ✅ **Layout responsivo** otimizado para todos os dispositivos

### 🚀 **Performance e SEO**
- ✅ **Bundle otimizado** com code splitting inteligente
- ✅ **Meta tags e SEO** configurados com React Helmet
- ✅ **Imagens otimizadas** e lazy loading
- ✅ **Cache estratégico** com React Query
- ✅ **Compressão e minificação** automática

### 🔐 **Funcionalidades Avançadas**
- ✅ **Sistema de autenticação** completo com Supabase
- ✅ **Carrinho persistente** com estado global
- ✅ **Gestão de produtos** com filtros e busca
- ✅ **Sistema de categorias** dinâmico
- ✅ **Integração com pagamentos** (preparado)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **React Query** - Gerenciamento de estado servidor
- **React Router** - Roteamento SPA
- **React Helmet** - SEO e meta tags

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Vitest** - Testes unitários
- **TypeScript** - Verificação de tipos

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Header, Footer, etc.
│   ├── sections/       # Seções da página inicial
│   ├── cart/          # Componentes do carrinho
│   └── ui/            # Componentes base (shadcn/ui)
├── hooks/              # Hooks customizados
│   ├── useAuth.tsx    # Autenticação
│   ├── useCart.ts     # Carrinho de compras
│   └── useProducts.ts # Gestão de produtos
├── lib/               # Utilitários e configurações
│   ├── supabase.ts    # Cliente Supabase
│   ├── constants.ts   # Constantes da aplicação
│   └── utils.ts       # Funções utilitárias
├── pages/             # Páginas da aplicação
├── types/             # Definições de tipos TypeScript
└── styles/            # Estilos globais
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (opcional para desenvolvimento)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ecommerce-vm
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:8080
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview do build de produção

# Qualidade de Código
npm run lint            # Executa ESLint
npm run lint:fix        # Corrige problemas do ESLint
npm run type-check      # Verifica tipos TypeScript

# Testes
npm run test            # Executa testes
npm run test:ui         # Interface de testes
npm run test:coverage   # Cobertura de testes

# Formatação
npm run format          # Formata código com Prettier
npm run format:check    # Verifica formatação
```

## 🌟 Funcionalidades Principais

### Para Usuários
- 🛍️ **Catálogo de produtos** com filtros avançados
- 🛒 **Carrinho persistente** com cálculo automático
- 💳 **Checkout seguro** com múltiplas formas de pagamento
- 👤 **Perfil do usuário** com histórico de pedidos
- ❤️ **Lista de desejos** personalizada
- 📱 **Design responsivo** para todos os dispositivos

### Para Administradores
- 📊 **Dashboard completo** com métricas
- 📦 **Gestão de produtos** (CRUD completo)
- 🏷️ **Gestão de categorias** hierárquicas
- 📋 **Gestão de pedidos** com status
- 👥 **Gestão de usuários** e permissões
- 🔄 **Integração com marketplaces**

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] Sistema de pagamentos (PIX, Cartão, Boleto)
- [ ] Integração com correios para frete
- [ ] Sistema de avaliações e comentários
- [ ] Chat de suporte em tempo real
- [ ] Programa de fidelidade
- [ ] Notificações push
- [ ] App mobile (React Native)

### Melhorias Técnicas
- [ ] Testes E2E com Playwright
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Analytics com Google Analytics
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **WhatsApp:** (44) 99151-2466
- **Email:** contato.xegaientregas@gmail.com
- **Website:** [xegaishop.com](https://xegaishop.com)

## 📄 Licença

Este projeto é propriedade privada da Xegai Shop. Todos os direitos reservados.

---

**Desenvolvido com ❤️ pela equipe Xegai Shop**