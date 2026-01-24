# Scripts Disponíveis no GitHub

## 📦 Repositório
**GitHub:** https://github.com/francastudio/weldpoly-scripts

Todos os scripts estão na **raiz do repositório** (mesmo nível, sem subpastas).

---

## 📋 Scripts Disponíveis

### 1. **weldpoly-quote-system-init.js**
**Função:** Sistema base de quote (carrinho de cotação)
- Gerencia o carrinho no `localStorage`
- Renderiza itens no modal
- Atualiza quantidade no navegador
- Controla botões de adicionar/remover produtos

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@6f162ee/weldpoly-quote-system-init.js
```

**Quando usar:**
- ✅ Sempre que precisar do sistema de quote completo
- ✅ Deve ser carregado ANTES dos outros scripts de quote

---

### 2. **weldpoly-quote-modal-simple.js**
**Função:** Handler simples para abrir/fechar modal
- Abre modal quando clicar em `[data-modal-target="quote-modal"]`
- Fecha modal quando clicar em `.modal__btn-close` ou `[data-modal-close]`
- Adiciona produtos ao carrinho quando botão tem `data-add-quote`

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@6f162ee/weldpoly-quote-modal-simple.js
```

**Quando usar:**
- ✅ Quando precisar apenas de controle básico do modal
- ⚠️ Requer `weldpoly-quote-system-init.js` para renderizar itens

---

### 3. **weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js**
**Função:** Controle de quantidade para spare parts
- Controle de quantidade (-, input, +) para spare parts
- Sincronização automática com o carrinho
- Adiciona/remove automaticamente quando quantidade muda
- Abre modal automaticamente quando item é adicionado

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@6f162ee/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**Quando usar:**
- ✅ Quando precisar de controle de quantidade para spare parts
- ⚠️ Requer `weldpoly-quote-system-init.js` para funcionar

---

## 🔧 Como Usar no Webflow

### Opção 1: Sistema Completo (Quote + Spare Parts)
```html
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@d816149/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@d816149/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

### Opção 2: Apenas Modal Simples
```html
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@d816149/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@d816149/weldpoly-quote-modal-simple.js" defer></script>
```

⚠️ **IMPORTANTE:** Sempre carregue `weldpoly-quote-system-init.js` primeiro!

---

## 📝 Estrutura dos Arquivos

```
weldpoly-scripts/
├── weldpoly-quote-system-init.js
├── weldpoly-quote-modal-simple.js
└── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

Todos os scripts estão no **mesmo nível**, sem subpastas.

---

## 🔄 Atualizações

O commit SHA na URL garante que você sempre usa a versão exata do código.

**Último commit:** `d816149`

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
