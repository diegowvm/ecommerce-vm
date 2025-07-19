# XEGAI OUTLET - Documentação do Projeto

## Visão Geral

O **Xegai Outlet** é uma plataforma de e-commerce moderna, focada em moda, calçados, roupas e acessórios, que conecta consumidores a produtos de qualidade de marcas renomadas, com experiência de compra inovadora, segura e acessível. O projeto é desenvolvido com tecnologias de ponta e integra funcionalidades avançadas tanto para o usuário final quanto para administradores e empresas parceiras.

---

## Missão, Visão e Valores

- **Missão:** Democratizar o acesso à moda de qualidade, tornando produtos premium acessíveis a todos, com preços justos e tecnologia inovadora.
- **Visão:** Ser a principal plataforma de moda online do Brasil, reconhecida pela qualidade, inovação e excelência no atendimento.
- **Valores:**
  - Paixão por Moda
  - Qualidade Garantida
  - Foco no Cliente
  - Inovação Contínua

---

## Linha do Tempo
- **2020:** Fundação e início da jornada.
- **2021:** Primeiras parcerias e expansão do catálogo.
- **2022:** Lançamento do programa de fidelidade.
- **2023:** Expansão nacional.
- **2024:** Plataforma de dropshipping inteligente e IA para recomendações.
- **2025:** Práticas sustentáveis e parcerias eco-friendly.

---

## Principais Funcionalidades

### Para Usuários
- **Catálogo com milhares de produtos** (filtros inteligentes, busca avançada, avaliações reais)
- **Carrinho persistente** e lista de desejos
- **Checkout seguro** (PIX, cartão, boleto, parcelamento até 12x)
- **Acompanhamento de pedidos** (rastreio, notificações por e-mail/WhatsApp)
- **Troca garantida** (7 dias)
- **Programa de fidelidade**
- **Ofertas exclusivas**
- **Suporte 24/7**

### Para Administradores
- **Dashboard com estatísticas**
- **Gestão de produtos** (CRUD, estoque, destaques)
- **Gestão de categorias**
- **Gestão de pedidos** (status, detalhes, atualização)
- **Gestão de usuários e permissões**
- **Gestão de devoluções**
- **Integração com marketplaces** (MercadoLivre, Amazon, AliExpress)
- **Sincronização de produtos e pedidos**
- **Monitoramento de APIs e logs**
- **Configurações avançadas**

---

## Estrutura de Dados (Supabase)

- **profiles:** Dados do usuário (nome, avatar, telefone)
- **categories:** Categorias de produtos
- **products:** Produtos (nome, descrição, preço, imagens, estoque, categoria, tamanhos, cores, ativo)
- **cart_items:** Itens do carrinho por usuário
- **orders:** Pedidos (total, status, endereço, data)
- **order_items:** Itens de cada pedido
- **user_roles:** Papéis de usuário (admin, user)

Políticas de segurança (RLS) garantem que cada usuário só acesse seus próprios dados, e administradores têm permissões ampliadas.

---

## Tecnologias Utilizadas
- **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Functions)
- **Integrações:** supabase-js, integrações com marketplaces via funções edge
- **Testes:** Vitest, Testing Library

---

## Fluxo do Usuário

1. **Explorar e Descobrir:** Catálogo com filtros, busca, avaliações
2. **Adicionar ao Carrinho:** Seleção de tamanho/cor, carrinho persistente
3. **Finalizar Pagamento:** Checkout seguro, múltiplas formas de pagamento
4. **Acompanhar Entrega:** Rastreio, notificações, previsão de entrega

Benefícios:
- Frete grátis acima de R$199
- Até 12x sem juros
- Troca garantida
- Suporte 24/7

---

## Diferenciais
- Compra 100% segura (criptografia, certificados)
- Troca garantida e fácil
- Entrega rápida e rastreável
- Atendimento premium
- Programa de fidelidade
- Ofertas exclusivas

---

## Estrutura Administrativa

- **Dashboard:** Visão geral de vendas, produtos, usuários, pedidos
- **Produtos:** Cadastro, edição, exclusão, controle de estoque e destaques
- **Categorias:** Organização e gestão de categorias
- **Pedidos:** Acompanhamento, atualização de status, detalhes completos
- **Usuários:** Gestão de perfis, papéis (admin/user), permissões
- **Devoluções:** Controle de trocas e devoluções
- **Marketplaces:** Integração, sincronização, mapeamento de categorias, histórico de sync
- **APIs:** Monitoramento, logs, limites de requisição
- **Configurações:** Ajustes gerais do sistema

---

## Como Contribuir e Executar Localmente

1. Clone o repositório
2. Instale as dependências (`npm i`)
3. Rode o projeto (`npm run dev`)
4. Acesse o painel admin em `/admin` (requer permissão)

---

## Contato e Suporte
- Telefone/WhatsApp: (44) 99151-2466
- E-mail: contato.xegaientregas@gmail.com

---

## Estatísticas
- 50K+ clientes satisfeitos
- 500+ marcas parceiras
- 100K+ produtos entregues
- 4.8 avaliação média

---

## Licença
Projeto privado, todos os direitos reservados. 