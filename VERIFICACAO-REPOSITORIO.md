# ✅ Verificação do Repositório GitHub

## 🔍 Como Verificar

Execute um dos scripts abaixo para verificar se o repositório está acessível:

### Opção 1: Script Interativo

```bash
cd dist
bash verificar-repositorio.sh
```

Este script vai:
- Solicitar seu usuário do GitHub
- Solicitar o nome do repositório
- Testar as URLs
- Gerar o código para Webflow

### Opção 2: Gerar Código Direto

```bash
cd dist
bash GERAR-CODIGO-WEBFLOW.sh
```

Este script vai:
- Solicitar seu usuário do GitHub
- Gerar o código final para Webflow
- Salvar em `CODIGO-WEBFLOW-FINAL.txt`

---

## 📋 Verificação Manual

### 1. Verificar Repositório no GitHub

Acesse: `https://github.com/SEU_USUARIO/weldpoly-scripts`

Você deve ver:
- ✅ Pasta `quote/` com `weldpoly-quote-system-init.js`
- ✅ Pasta `spare-parts/` com `weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js`
- ✅ Arquivo `README.md`

### 2. Testar URLs do jsDelivr

Abra no navegador (substitua `SEU_USUARIO`):

```
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**Resultado esperado:**
- ✅ Deve mostrar o código JavaScript (não erro 404)
- ⚠️ Se mostrar 404, aguarde alguns minutos (jsDelivr pode demorar para indexar)

### 3. Verificar Tamanho dos Arquivos

No GitHub, os arquivos devem ter:
- `weldpoly-quote-system-init.js`: ~6 KB
- `weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js`: ~39 KB

---

## 🚨 Problemas Comuns

### ❌ "404 Not Found"

**Causa:** jsDelivr ainda não indexou o repositório

**Solução:**
1. Aguarde 5-10 minutos após o upload
2. Verifique se o repositório é **público**
3. Verifique se o nome do repositório está correto
4. Tente acessar diretamente: `https://github.com/SEU_USUARIO/weldpoly-scripts`

### ❌ "Repository not found"

**Causa:** Repositório não existe ou é privado

**Solução:**
1. Verifique se o repositório foi criado
2. Verifique se está **público** (não privado)
3. Verifique o nome do repositório

### ❌ Arquivos não aparecem

**Causa:** Upload não foi concluído

**Solução:**
1. Verifique se fez commit das mudanças
2. Verifique se os arquivos estão na estrutura correta:
   ```
   quote/
     └── weldpoly-quote-system-init.js
   spare-parts/
     └── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
   ```

---

## ✅ Checklist de Verificação

- [ ] Repositório criado no GitHub
- [ ] Repositório é **público**
- [ ] Arquivos estão na estrutura correta
- [ ] URLs do jsDelivr retornam código (não 404)
- [ ] Código para Webflow gerado
- [ ] Código adicionado no Footer Code do Webflow
- [ ] Site publicado e testado

---

## 📞 Próximos Passos

Após verificar que tudo está funcionando:

1. **Adicione o código no Webflow:**
   - Site Settings → Custom Code → Footer Code
   - Cole o código gerado
   - Salve

2. **Publique o site:**
   - Publish → Publish to staging
   - Teste no site de staging

3. **Teste no navegador:**
   - Abra o console (F12)
   - Verifique se não há erros
   - Teste adicionar items ao quote

---

## 🎯 URLs Finais

Após confirmar seu usuário e nome do repositório, as URLs serão:

```
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```
