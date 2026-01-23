#!/bin/bash
# Script para criar repositório GitHub automaticamente (se GitHub CLI estiver instalado)

echo "🚀 Criando repositório no GitHub..."
echo ""

# Verificar se GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo ""
    echo "📋 OPÇÃO 1: Instalar GitHub CLI"
    echo "   macOS: brew install gh"
    echo "   Depois: gh auth login"
    echo ""
    echo "📋 OPÇÃO 2: Criar manualmente"
    echo "   1. Acesse: https://github.com/new"
    echo "   2. Nome: weldpoly-scripts"
    echo "   3. Público: ✅ SIM"
    echo "   4. NÃO adicione README, .gitignore ou license"
    echo "   5. Clique em 'Create repository'"
    echo "   6. Execute: bash push-to-github.sh SEU_USUARIO weldpoly-scripts"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "⚠️  Você precisa fazer login no GitHub CLI primeiro:"
    echo "   gh auth login"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

# Nome do repositório
REPO_NAME="weldpoly-scripts"

echo "📦 Criando repositório: $REPO_NAME"
echo ""

# Criar repositório público
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repositório criado e push realizado com sucesso!"
    echo ""
    
    # Obter usuário do GitHub
    GITHUB_USER=$(gh api user --jq .login)
    
    echo "🔗 URLs dos Scripts:"
    echo ""
    echo "https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/quote/weldpoly-quote-system-init.js"
    echo "https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js"
    echo ""
    echo "📋 Código para Webflow Footer:"
    echo ""
    echo "<script src=\"https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/quote/weldpoly-quote-system-init.js\" defer></script>"
    echo "<script src=\"https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js\" defer></script>"
    echo ""
    echo "🌐 Repositório: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
else
    echo ""
    echo "❌ Erro ao criar repositório"
    echo ""
    echo "💡 Tente criar manualmente:"
    echo "   1. Acesse: https://github.com/new"
    echo "   2. Nome: weldpoly-scripts"
    echo "   3. Público: ✅ SIM"
    echo "   4. Execute: bash push-to-github.sh SEU_USUARIO weldpoly-scripts"
fi
