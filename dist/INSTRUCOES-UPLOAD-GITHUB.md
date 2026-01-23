# 📤 Instruções: Upload para GitHub

## Passo a Passo Completo

### 1. Criar Conta/Login no GitHub

1. Acesse [github.com](https://github.com)
2. Faça login ou crie uma conta (é gratuito)

### 2. Criar Novo Repositório

1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"**
3. Preencha:
   - **Repository name:** `weldpoly-scripts` (ou qualquer nome)
   - **Description:** "Scripts JavaScript para sistema de quote do Weldpoly"
   - **Visibility:** ✅ **Public** (IMPORTANTE - necessário para jsDelivr funcionar)
   - **NÃO marque** "Add a README file" (já temos um)
   - **NÃO marque** "Add .gitignore" (não necessário)
   - **NÃO marque** "Choose a license" (opcional)
4. Clique em **"Create repository"**

### 3. Fazer Upload dos Arquivos

#### Opção A: Via Interface Web (Mais Fácil)

1. No repositório criado, você verá uma página com instruções
2. Clique em **"uploading an existing file"** (ou vá em "Add file" → "Upload files")
3. Arraste TODA a pasta `dist/` para a área de upload, OU:
   - Arraste a pasta `quote/` inteira
   - Arraste a pasta `spare-parts/` inteira
   - Arraste o arquivo `README.md`
4. Na parte inferior, escreva uma mensagem de commit: `"Initial commit: Add Weldpoly scripts"`
5. Clique em **"Commit changes"**

#### Opção B: Via Git (Para Futuras Atualizações)

Se você tem Git instalado, pode usar:

```bash
cd /Users/mikaelsouza/Documents/Profissional/cursor/weldpoly/dist

# Inicializar git
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit: Add Weldpoly scripts"

# Adicionar repositório remoto (substitua SEU_USUARIO e NOME_REPO)
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git

# Push
git branch -M main
git push -u origin main
```

### 4. Verificar Estrutura

Após o upload, seu repositório deve ter esta estrutura:

```
weldpoly-scripts/
├── README.md
├── quote/
│   └── weldpoly-quote-system-init.js
└── spare-parts/
    └── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

### 5. Obter URLs do jsDelivr

Substitua na URL:
- `SEU_USUARIO` = seu usuário do GitHub
- `NOME_REPO` = nome do repositório (ex: `weldpoly-scripts`)

**URLs dos Scripts:**

```
https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**Exemplo real:**
Se seu usuário for `mikaelsouza` e o repositório for `weldpoly-scripts`:

```
https://cdn.jsdelivr.net/gh/mikaelsouza/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/mikaelsouza/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

### 6. Testar URLs

Antes de adicionar no Webflow, teste as URLs:

1. Abra cada URL no navegador
2. Você deve ver o código JavaScript
3. Se aparecer "404 Not Found", verifique:
   - Repositório é público?
   - Caminho dos arquivos está correto?
   - Nome do repositório está correto?

### 7. Adicionar no Webflow

1. Acesse Webflow: **Site Settings** → **Custom Code**
2. No campo **Footer Code**, adicione:

```html
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/quote/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

3. **Substitua** `SEU_USUARIO` e `NOME_REPO` pelos valores reais
4. Clique em **Save**
5. Publique o site

### 8. Verificar Funcionamento

1. Abra o site publicado
2. Abra o console do navegador (F12)
3. Verifique se não há erros
4. Digite: `typeof window.initQuoteSystem === 'function'`
5. Deve retornar `true`
6. Teste adicionar um spare part ao quote

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Repositório é **público**
- [ ] Arquivos enviados corretamente
- [ ] Estrutura de pastas está correta
- [ ] URLs do jsDelivr testadas no navegador
- [ ] Scripts adicionados no Webflow Footer Code
- [ ] Ordem correta (quote system primeiro)
- [ ] Site publicado
- [ ] Funcionalidade testada

## 🆘 Problemas Comuns

### "404 Not Found" ao acessar URL

- Verifique se o repositório é **público**
- Verifique se o caminho dos arquivos está correto
- Aguarde alguns minutos após o upload (jsDelivr pode demorar)

### Scripts não carregam

- Verifique console do navegador para erros
- Verifique se as URLs estão corretas
- Certifique-se de que `defer` está presente

### Scripts carregam mas não funcionam

- Verifique ordem dos scripts (quote system primeiro)
- Verifique console para erros JavaScript
- Teste se `window.initQuoteSystem` existe

## 📞 Próximos Passos

Após configurar, você terá:
- ✅ Scripts hospedados gratuitamente
- ✅ 0 caracteres contando no limite do Webflow
- ✅ Fácil de atualizar (apenas push no GitHub)
