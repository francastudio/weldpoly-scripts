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
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5821697/weldpoly-quote-system.js
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
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5821697/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**Quando usar:**
- ✅ Quando precisar de controle de quantidade para spare parts
- ⚠️ Requer `weldpoly-quote-system.js` para funcionar

---

### 3. **weldpoly-lenis-scroll-control.js** 🆕
**Função:** Controle de scroll em seções específicas usando Lenis Scroll
- Habilita/desabilita scroll em seções específicas
- Suporta atributos `data-lenis-scroll="disabled"` ou `data-lenis-scroll="enabled"`
- API JavaScript para controle dinâmico
- Detecta automaticamente novos elementos adicionados ao DOM
- Compatível com Lenis puro e Locomotive Scroll V5

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5e0b249/weldpoly-lenis-scroll-control.js
```

**Quando usar:**
- ✅ Quando precisar desabilitar scroll em modais, formulários ou seções específicas
- ✅ Para controle dinâmico de scroll baseado em interações do usuário
- ⚠️ Requer Lenis Scroll ou Locomotive Scroll V5 estar carregado

**Exemplo de uso:**
```html
<!-- Desabilitar scroll em uma seção -->
<section data-lenis-scroll="disabled">
  Conteúdo sem scroll
</section>

<!-- JavaScript -->
<script>
disableLenisScroll('.minha-secao');
enableLenisScroll('.minha-secao');
toggleLenisScroll('.minha-secao');
</script>
```

**Documentação completa:** `docs/LENIS-SCROLL-CONTROL.md`

---

### 4. **weldpoly-nav-contrast.js** 🆕
**Função:** Alterna a cor do logo e do menu conforme o fundo da seção sob o nav
- Logo e texto ficam escuros em seções com `.background-color-white`
- Logo e texto ficam claros em seções com `.background-color-black`
- Usa Intersection Observer para detectar a seção atual
- Suporta `[data-nav-contrast="light"]` para controle manual

**URL (após push):**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-nav-contrast.js
```

**Quando usar:**
- ✅ Site Webflow com menu fixo e seções alternando fundo claro/escuro
- ⚠️ Requer classes CSS no nav: `.navigation.nav--over-light` (incluir no Custom Code)

---

### 5. **weldpoly-centered-nav.js**
**Função:** Toggle do menu centralizado e fechar com ESC
- `[data-navigation-toggle="toggle"]` abre/fecha o menu
- `[data-navigation-toggle="close"]` fecha o menu
- Tecla ESC fecha o menu
- `[data-navigation-status]` controla estado active/not-active

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-centered-nav.js
```

---

### 6. **weldpoly-locomotive-init.js**
**Função:** Inicializa Locomotive Scroll com Lenis
- Cria instância em `window.locomotiveScroll`
- ⚠️ Requer Locomotive Scroll carregado antes

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-locomotive-init.js
```

---

### 7. **weldpoly-content-reveal.js**
**Função:** Animações de reveal no scroll com GSAP ScrollTrigger
- `[data-reveal-group]` – grupo de elementos
- `[data-reveal-group-nested]` – subgrupos
- `data-stagger`, `data-distance`, `data-start` para configuração
- ⚠️ Requer GSAP e ScrollTrigger carregados antes

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-content-reveal.js
```

---

### 8. **weldpoly-finsweet-sort.js**
**Função:** Ordenação alfanumérica (natural sort) em listas Finsweet
- Ordena por campo `name` usando natural sort (ex: Item 2 antes de Item 10)
- ⚠️ Requer Finsweet Attributes List API carregada antes

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-finsweet-sort.js
```

---

## 🔧 Como Usar no Webflow

### Sistema Completo (Quote + Spare Parts)
```html
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5821697/weldpoly-quote-system.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@5821697/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

⚠️ **IMPORTANTE:** Sempre carregue `weldpoly-quote-system.js` primeiro!

---

## 📝 Estrutura dos Arquivos

```
weldpoly-scripts/
├── weldpoly-quote-system.js
├── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
├── weldpoly-lenis-scroll-control.js
├── weldpoly-nav-contrast.js
├── weldpoly-centered-nav.js
├── weldpoly-locomotive-init.js
├── weldpoly-content-reveal.js
└── weldpoly-finsweet-sort.js
```

Todos os scripts estão no **mesmo nível**, sem subpastas.

---

## 🔄 Atualizações

O commit SHA na URL garante que você sempre usa a versão exata do código.

**Último commit:** `5e0b249`

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
- ✅ Scroll vertical dentro do modal (compatível com Locomotive Scroll)
- ✅ Pausa Locomotive Scroll quando modal está aberto

### Navegação
- ✅ Atualiza badge de quantidade no navegador
- ✅ Redireciona para `/get-a-quote` ao submeter
