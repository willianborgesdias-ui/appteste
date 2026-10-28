# Instruções de Deploy na Cloudflare Pages

Este projeto é um aplicativo web moderno em **React + Vite + Tailwind CSS**, 100% compatível com a hospedagem gratuita e global do **Cloudflare Pages**.

---

## 🚀 Opção 1: Deploy Automático via GitHub (Recomendado)

1. **Baixar ou exportar o código**:
   - No Google AI Studio, vá no menu de configurações do projeto e clique em **Export to GitHub** (ou baixe como ZIP e envie para seu repositório GitHub).

2. **Acessar a Cloudflare**:
   - Acesse seu painel em [dash.cloudflare.com](https://dash.cloudflare.com).
   - Vá no menu lateral em **Workers & Pages** -> **Create Application** -> aba **Pages** -> **Connect to Git**.

3. **Configurações da Build no Cloudflare Pages**:
   - **Project name**: `finan-autonomo` (ou o nome de sua preferência)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (deixe em branco ou raiz)

4. Clique em **Save and Deploy**. Em menos de 1 minuto seu aplicativo estará online com HTTPS gratuito e domínio `.pages.dev`.

---

## ⚡ Opção 2: Deploy Direto via Wrangler CLI (Linha de Comando)

Se preferir publicar direto da sua máquina local pelo terminal:

```bash
# 1. Instalar dependências e gerar a build de produção
npm install
npm run build

# 2. Publicar na Cloudflare Pages com Wrangler
npx wrangler pages deploy dist --project-name=finan-autonomo
```

---

## ⚙️ Arquivos de Configuração Inclusos no Projeto

- `public/_redirects`: Regra de redirecionamento SPA (`/* /index.html 200`) para garantir que todas as rotas e recarregamentos de página funcionem perfeitamente no Cloudflare Pages.
- `package.json`: Script `npm run build` configurado com `vite build` gerando a pasta `dist`.
