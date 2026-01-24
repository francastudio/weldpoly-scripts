# Scripts Disponíveis no GitHub

## 📦 Repositório
**GitHub:** https://github.com/francastudio/weldpoly-scripts

Todos os scripts estão na **raiz do repositório** (mesmo nível, sem subpastas).

---

## 📋 Scripts Disponíveis

### 1. **weldpoly-quote-system.js** ⭐ UNIFICADO
**Função:** Sistema completo de quote e modal (unificado)
- Gerencia o carrinho no `localStorage`
- Renderiza itens no modal
- Atualiza quantidade no navegador
- Controla botões de adicionar/remover produtos
- Abre/fecha modal automaticamente
- Gerencia botões com `data-modal-target="quote-modal"`
- Gerencia botões com `data-add-quote`
- Fecha modal via `.modal__btn-close` ou `[data-modal-close]`

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5b2636e/weldpoly-quote-system.js
```

**Quando usar:**
- ✅ **SEMPRE** - Este é o script principal do sistema de quote
- ✅ Deve ser carregado ANTES do script de spare parts
- ✅ Unifica quote e modal em um único sistema

---

### 2. **weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js**
**Função:** Controle de quantidade para spare parts
- Controle de quantidade (-, input, +) para spare parts
- Sincronização automática com o carrinho
- Adiciona/remove automaticamente quando quantidade muda
- Abre modal automaticamente quando item é adicionado

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5b2636e/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**Quando usar:**
- ✅ Quando precisar de controle de quantidade para spare parts
- ⚠️ Requer `weldpoly-quote-system.js` para funcionar

---

## 🔧 Como Usar no Webflow

### Sistema Completo (Quote + Spare Parts)
```html
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@6ee32ca/weldpoly-quote-system.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@6ee32ca/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

⚠️ **IMPORTANTE:** Sempre carregue `weldpoly-quote-system.js` primeiro!

---

## 📝 Estrutura dos Arquivos

```
weldpoly-scripts/
├── weldpoly-quote-system.js (⭐ UNIFICADO - Quote + Modal)
└── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

Todos os scripts estão no **mesmo nível**, sem subpastas.

---

## 🔄 Atualizações

O commit SHA na URL garante que você sempre usa a versão exata do código.

**Último commit:** `5b2636e`

Para atualizar, substitua o commit SHA na URL pelo mais recente:
```bash
git log -1 --format="%h"  # No diretório dist/
```

---

## ✅ Verificação

Para verificar se os scripts estão carregando:

1. Abra o console do navegador (F12)
2. Verifique se não há erros de carregamento
3. Digite: `typeof window.initQuoteSystem === 'function'`
4. Deve retornar: `true`

---

## 🎯 Funcionalidades do Sistema Unificado

O `weldpoly-quote-system.js` gerencia:

### Carrinho de Quote
- ✅ Adicionar produtos via `[data-add-quote]`
- ✅ Adicionar produtos via `[data-modal-target="quote-modal"][data-add-quote]`
- ✅ Atualizar quantidades no modal
- ✅ Remover itens do carrinho
- ✅ Persistência no `localStorage`
- ✅ Sincronização entre páginas

### Modal
- ✅ Abre automaticamente ao adicionar produtos
- ✅ Fecha via `.modal__btn-close` ou `[data-modal-close]`
- ✅ Renderiza itens do carrinho automaticamente
- ✅ Atualiza título com quantidade de itens
- ✅ Gerencia estado vazio do carrinho

### Navegação
- ✅ Atualiza badge de quantidade no navegador
- ✅ Redireciona para `/get-a-quote` ao submeter
