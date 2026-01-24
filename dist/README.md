# Weldpoly Scripts - Repositório GitHub

Este repositório contém os scripts JavaScript para o sistema de quote (cotação) do site Weldpoly no Webflow.

## 📁 Estrutura

```
quote/
  └── weldpoly-quote-system-init.js

spare-parts/
  └── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

## 🚀 Como Usar no Webflow

### Passo 1: Obter URLs do jsDelivr

Após fazer upload deste repositório no GitHub, use estas URLs (substitua `SEU_USUARIO` e `NOME_REPO`):

```
https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/quote/weldpoly-quote-system-init.js
https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

### Passo 2: Adicionar no Webflow

No **Footer Code** do Webflow (Site Settings → Custom Code → Footer Code), adicione:

```html
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/quote/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/SEU_USUARIO/NOME_REPO@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

**⚠️ IMPORTANTE:** 
- Mantenha a ordem (quote system primeiro)
- Substitua `SEU_USUARIO` pelo seu usuário do GitHub
- Substitua `NOME_REPO` pelo nome do repositório

## 📋 Exemplo

Se seu usuário do GitHub for `mikaelsouza` e o repositório for `weldpoly-scripts`:

```html
<script src="https://cdn.jsdelivr.net/gh/mikaelsouza/weldpoly-scripts@main/quote/weldpoly-quote-system-init.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/mikaelsouza/weldpoly-scripts@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

## 🔄 Como Atualizar

1. Edite os arquivos JavaScript neste repositório
2. Faça commit das mudanças
3. Faça push para o GitHub
4. jsDelivr atualiza automaticamente em alguns minutos
5. Para forçar atualização imediata, adicione `?v=2` (ou outro número) na URL do Webflow

## ✅ Vantagens

- ✅ **Gratuito** - Sem custos
- ✅ **CDN Global** - Rápido em qualquer lugar
- ✅ **Não conta no limite** - Apenas 2 tags `<script>` no Webflow
- ✅ **Fácil de atualizar** - Apenas push no GitHub
- ✅ **Versionamento** - Histórico completo de mudanças

## 📝 Versão

Última atualização: 2025-01-23

## 🔍 Verificação

Para verificar se os scripts estão carregando corretamente:

1. Abra o console do navegador (F12)
2. Verifique se não há erros de carregamento
3. Digite: `typeof window.initQuoteSystem === 'function'`
4. Deve retornar `true`

## 📚 Documentação

Para mais informações, consulte:
- `docs/HOSPEDAGEM-SCRIPTS-GRATUITA.md` - Guia completo
- `docs/GUIA-RAPIDO-HOSPEDAGEM.md` - Guia rápido
