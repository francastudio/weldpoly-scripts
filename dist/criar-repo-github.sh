#!/bin/bash
# Script para criar repositório GitHub via API

REPO_NAME="weldpoly-scripts"
DESCRIPTION="Scripts JavaScript para sistema de quote do Weldpoly no Webflow"

echo "🚀 Criando repositório no GitHub..."
echo ""

# Verificar se GitHub CLI está disponível
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI encontrado!"
    
    # Verificar autenticação
    if gh auth status &> /dev/null; then
        echo "✅ Autenticado no GitHub"
        echo ""
        echo "📦 Criando repositório: $REPO_NAME"
        
        # Criar repositório público
        gh repo create "$REPO_NAME" \
            --public \
            --description "$DESCRIPTION" \
            --source=. \
            --remote=origin \
            --push
        
        if [ $? -eq 0 ]; then
            GITHUB_USER=$(gh api user --jq .login)
            echo ""
            echo "✅ Repositório criado com sucesso!"
            echo ""
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
            exit 0
        else
            echo "❌ Erro ao criar repositório"
            exit 1
        fi
    else
        echo "⚠️  Você precisa fazer login no GitHub CLI primeiro:"
        echo "   gh auth login"
        echo ""
        echo "Depois execute este script novamente."
        exit 1
    fi
else
    echo "❌ GitHub CLI não está instalado."
    echo ""
    echo "📋 OPÇÕES:"
    echo ""
    echo "OPÇÃO 1: Instalar GitHub CLI (Recomendado)"
    echo "   macOS: brew install gh"
    echo "   Depois: gh auth login"
    echo "   Depois execute este script novamente"
    echo ""
    echo "OPÇÃO 2: Criar Manualmente (Mais Rápido)"
    echo "   1. Acesse: https://github.com/new"
    echo "   2. Nome: weldpoly-scripts"
    echo "   3. Público: ✅ SIM"
    echo "   4. NÃO adicione README, .gitignore ou license"
    echo "   5. Clique em 'Create repository'"
    echo "   6. Execute: bash push-to-github.sh SEU_USUARIO weldpoly-scripts"
    echo ""
    exit 1
fi
