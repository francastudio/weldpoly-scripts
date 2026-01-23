# 🚀 Início Rápido - 3 Passos

## ✅ Passo 1: Criar Repositório no GitHub

1. **Acesse:** [github.com/new](https://github.com/new)
2. **Repository name:** `weldpoly-scripts`
3. **Description:** "Scripts JavaScript para sistema de quote do Weldpoly"
4. **Visibility:** ✅ **Public** (OBRIGATÓRIO)
5. **NÃO marque:** README, .gitignore, license
6. **Clique:** "Create repository"

---

## ✅ Passo 2: Fazer Push dos Arquivos

No terminal, execute (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
cd dist
bash push-to-github.sh SEU_USUARIO weldpoly-scripts
```

**Exemplo:**
```bash
cd dist
bash push-to-github.sh mikaelsouza weldpoly-scripts
```

O script vai:
- Adicionar o remote do GitHub
- Fazer push dos arquivos
- Mostrar as URLs prontas para usar

---

## ✅ Passo 3: Adicionar no Webflow

Após o push, o script mostrará as URLs. Adicione no **Footer Code** do Webflow:

```html
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

**Substitua `SEU_USUARIO` pelo seu usuário do GitHub.**

---

## 🎉 Pronto!

Agora seus scripts estão hospedados gratuitamente e você tem **0 caracteres** contando no limite do Webflow!
