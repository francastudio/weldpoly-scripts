# 🚀 CRIAR REPOSITÓRIO NO GITHUB - PASSO A PASSO

## ⚡ Método Mais Rápido (2 minutos)

### Passo 1: Criar Repositório

1. **Abra:** [github.com/new](https://github.com/new)
2. **Repository name:** `weldpoly-scripts`
3. **Description:** `Scripts JavaScript para sistema de quote do Weldpoly`
4. **Visibility:** ✅ **Public** (OBRIGATÓRIO - marque como público)
5. **NÃO marque nenhuma opção:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. **Clique:** "Create repository"

### Passo 2: Fazer Upload

Após criar, você verá uma página com instruções. **IGNORE** essas instruções e faça:

**Opção A: Via Interface Web (Mais Fácil)**

1. Na página do repositório criado, clique em **"Add file"** → **"Upload files"**
2. Arraste **TODA a pasta `dist/`** para a área de upload
   - Ou arraste individualmente: `quote/`, `spare-parts/`, `README.md`, etc.
3. Role até o final
4. **Commit message:** `Initial commit: Add Weldpoly scripts`
5. Clique em **"Commit changes"**

**Opção B: Via Terminal (Mais Rápido para Futuras Atualizações)**

No terminal, execute (substitua `SEU_USUARIO`):

```bash
cd dist
bash push-to-github.sh SEU_USUARIO weldpoly-scripts
```

**Exemplo:**
```bash
cd dist
bash push-to-github.sh mikaelsouza weldpoly-scripts
```

---

## ✅ Após Upload

O repositório estará pronto! As URLs serão:

```
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

---

## 📋 Código para Webflow

Adicione no **Footer Code**:

```html
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

**Substitua `SEU_USUARIO` pelo seu usuário do GitHub.**

---

## 🎯 Resumo Visual

```
1. github.com/new
   ↓
2. Nome: weldpoly-scripts
   Público: ✅
   Criar
   ↓
3. Add file → Upload files
   ↓
4. Arrastar pasta dist/
   ↓
5. Commit changes
   ↓
✅ PRONTO!
```

---

## ⚠️ Importante

- ✅ Repositório **DEVE ser público** (para jsDelivr funcionar)
- ✅ NÃO adicione README, .gitignore ou license ao criar
- ✅ Mantenha a estrutura de pastas (`quote/` e `spare-parts/`)

---

## 🆘 Problemas?

- **"Repository already exists"** → Use outro nome ou delete o existente
- **"Permission denied"** → Verifique se está logado no GitHub
- **"404 Not Found" após upload** → Aguarde alguns minutos (jsDelivr pode demorar)
