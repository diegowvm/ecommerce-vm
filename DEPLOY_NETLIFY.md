# 🚀 Guia de Deploy - Netlify

## 📋 Configuração das Variáveis de Ambiente na Netlify

### **1. Acessar o Painel da Netlify**
1. Vá para [netlify.com](https://netlify.com)
2. Faça login na sua conta
3. Acesse o projeto Xegai Shop

### **2. Configurar Variáveis de Ambiente**
1. No painel do projeto, clique em **"Site settings"**
2. No menu lateral, clique em **"Environment variables"**
3. Clique em **"Add variable"** e adicione cada uma:

```env
# Variáveis OBRIGATÓRIAS para o projeto funcionar:

VITE_SUPABASE_URL
https://ikwttetqfltpxpkbqgpj.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0

VITE_APP_NAME
Xegai Shop

VITE_APP_ENV
production

VITE_WHATSAPP_NUMBER
5544991512466
```

### **3. Configurações de Build**
As configurações já estão no arquivo `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18`

### **4. Fazer Deploy**
1. Faça commit das mudanças:
```bash
git add .
git commit -m "fix: Configuração para deploy Netlify"
git push origin main
```

2. A Netlify vai fazer deploy automaticamente

### **5. Verificar se Funcionou**
- ✅ Site carrega sem erros
- ✅ Página inicial aparece corretamente
- ✅ Produtos são carregados
- ✅ Autenticação funciona
- ✅ Carrinho funciona

## 🔧 **Solução de Problemas**

### **Erro: "Failed to install dependencies"**
- ✅ **RESOLVIDO:** Removido script `prepare` do package.json

### **Erro: "Environment variables not found"**
- Verifique se todas as variáveis foram adicionadas na Netlify
- Certifique-se que os nomes estão corretos (com VITE_ no início)

### **Erro: "Supabase connection failed"**
- Verifique se as credenciais do Supabase estão corretas
- Teste a conexão localmente primeiro

### **Erro: "Page not found" em rotas**
- ✅ **RESOLVIDO:** Configurado redirect no netlify.toml

## 📱 **Teste Pós-Deploy**

### **Funcionalidades para testar:**
1. **Página inicial** - deve carregar rapidamente
2. **Navegação** - todos os links funcionam
3. **Produtos** - lista carrega corretamente
4. **Busca** - funciona no header
5. **Autenticação** - login/cadastro funciona
6. **Carrinho** - adicionar/remover produtos
7. **Responsividade** - teste no mobile

## 🎯 **URLs Importantes**

- **Site em produção:** https://seu-projeto.netlify.app
- **Painel Netlify:** https://app.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard

## 🚨 **Importante**

- As variáveis de ambiente são **OBRIGATÓRIAS**
- Sem elas, o site não vai funcionar
- Sempre teste localmente antes do deploy
- Mantenha as credenciais do Supabase seguras

## ✅ **Checklist Final**

- [ ] Variáveis de ambiente configuradas na Netlify
- [ ] Build passou sem erros
- [ ] Site carrega corretamente
- [ ] Funcionalidades principais testadas
- [ ] Responsividade verificada
- [ ] Performance satisfatória

**Agora seu Xegai Shop está no ar! 🎉**