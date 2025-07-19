# Fluxo Real das Rotas - XEGAI SHOP

Este documento descreve, de forma prática e detalhada, o fluxo de cada rota principal do projeto Xegai Shop, desde o layout até as ações finais, incluindo movimentação de dados, navegação, integrações e componentes envolvidos.

---

## Rotas do Usuário

### `/` (Home)
- **Layout:** Navbar fixa, HeroSection, Produtos em destaque, Categorias, Footer, Banner de cookies.
- **Ações:** Navegação para produtos, categorias, login/cadastro, busca global.

### `/products` (Catálogo de Produtos)
- **Layout:** Navbar, filtros (busca, categoria, ordenação), grid de produtos, paginação, Footer.
- **Movimentação:**
  - Busca e filtros atualizam a URL e recarregam os produtos via Supabase.
  - Paginação controlada por hook customizado.
  - Cada card leva ao detalhe do produto.

### `/products/:id` (Detalhe do Produto)
- **Layout:** Navbar, informações do produto (nome, preço, imagens, tamanhos, cores, estoque), botões de ação (adicionar ao carrinho, wishlist), Footer.
- **Movimentação:**
  - Busca do produto no Supabase.
  - Seleção de tamanho/cor obrigatória.
  - Adição ao carrinho faz upsert em `cart_items`.
  - Feedback visual via toast.

### `/cart` (Carrinho)
- **Layout:** Navbar, lista de itens, resumo do pedido, botões para checkout e continuar comprando, Footer.
- **Movimentação:**
  - Busca dos itens do carrinho do usuário logado.
  - Permite alterar quantidade, remover itens (update/delete em `cart_items`).
  - Calcula subtotal, frete (grátis acima de R$199), total.
  - Botão "Finalizar Compra" leva ao checkout.

### `/checkout` (Checkout)
- **Layout:** Navbar, formulário de endereço, seleção de pagamento, resumo do pedido, Footer.
- **Movimentação:**
  - Busca dos itens do carrinho.
  - Preenchimento de endereço e pagamento.
  - Ao finalizar:
    - Cria pedido em `orders`.
    - Cria itens em `order_items`.
    - Limpa `cart_items` do usuário.
    - Redireciona para confirmação.

### `/order-confirmation/:id` (Confirmação de Pedido)
- **Layout:** Navbar, detalhes do pedido, resumo do pagamento, próximos passos, Footer.
- **Movimentação:**
  - Busca do pedido e itens no Supabase.
  - Exibe previsão de entrega, opções para continuar comprando ou voltar ao início.

### `/profile`, `/profile/addresses`, `/profile/wishlist`
- **Layout:** Navbar, abas de perfil, formulários de edição, lista de endereços, wishlist, Footer.
- **Movimentação:**
  - Busca e atualização de dados do usuário.
  - Gerenciamento de endereços e favoritos.

### `/auth` (Login/Cadastro)
- **Layout:** Tabs para login/cadastro, formulários, feedback visual.
- **Movimentação:**
  - Login/cadastro via Supabase Auth.
  - Redirecionamento pós-login.

---

## Rotas Administrativas

> Todas as rotas admin usam o `AdminLayout` (sidebar, header com avatar, proteção de rota, verificação de admin).

### `/admin` (Dashboard)
- **Layout:** Sidebar, cards de estatísticas, gráficos, últimas vendas.
- **Movimentação:**
  - Busca dados agregados de produtos, usuários, pedidos.
  - Exibe gráficos e KPIs.

### `/admin/products` (Gestão de Produtos)
- **Layout:** Sidebar, lista de produtos, filtros, cards de estatísticas, botão de novo produto, formulário modal.
- **Movimentação:**
  - CRUD completo em `products`.
  - Busca, paginação, filtro por categoria.
  - Edição/remoção com confirmação.

### `/admin/categories` (Gestão de Categorias)
- **Layout:** Sidebar, lista de categorias, busca, botão de nova categoria, formulário modal.
- **Movimentação:**
  - CRUD em `categories`.
  - Bloqueio de exclusão se houver produtos associados.

### `/admin/orders` (Gestão de Pedidos)
- **Layout:** Sidebar, lista de pedidos, filtros por status, cards de estatísticas, detalhe do pedido.
- **Movimentação:**
  - Busca e paginação de pedidos.
  - Atualização de status (pending, processing, shipped, delivered).
  - Visualização de itens, valores, cliente.

### `/admin/users` (Gestão de Usuários)
- **Layout:** Sidebar, lista de usuários, busca, cards de estatísticas, detalhe do usuário.
- **Movimentação:**
  - Busca e paginação de usuários.
  - Visualização de pedidos do usuário.
  - Alteração de papel (admin/user).

### `/admin/marketplaces` (Integração com Marketplaces)
- **Layout:** Sidebar, tabs (visão geral, sincronização, mapeamentos, histórico), cards de status.
- **Movimentação:**
  - Exibe conexões ativas, status, produtos/pedidos sincronizados.
  - Permite iniciar sincronização, configurar integrações, mapear categorias.

### `/admin/api-integrations`, `/admin/api-monitoring`, `/admin/returns`, `/admin/settings`, `/admin/inventory`, `/admin/analytics`
- **Layout:** Sidebar, cards, tabelas, formulários conforme o contexto.
- **Movimentação:**
  - Monitoramento de APIs, logs, limites.
  - Gestão de devoluções, configurações gerais, estoque, análises.

---

## Observações Gerais
- **Proteção de Rotas:**
  - Usuário precisa estar logado para acessar rotas protegidas.
  - Admin precisa ter papel de admin (verificado via Supabase) para acessar rotas administrativas.
- **Movimentação de Dados:**
  - Todas as operações (CRUD) são feitas via Supabase (tabelas: products, categories, orders, order_items, cart_items, profiles, user_roles, etc).
- **Feedback Visual:**
  - Toasts para sucesso/erro em todas as ações.
- **Navegação:**
  - React Router DOM, navegação programática após ações importantes.

---

Este documento reflete o fluxo real e atual de cada rota, do layout à movimentação de dados, para desenvolvedores e stakeholders acompanharem o estágio e funcionamento do projeto. 