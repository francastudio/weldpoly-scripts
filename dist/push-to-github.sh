#!/bin/bash
# Script para fazer push automático para GitHub

if [ $# -lt 2 ]; then
    echo "❌ Uso: bash push-to-github.sh SEU_USUARIO NOME_REPO"
    echo ""
    echo "Exemplo:"
    echo "  bash push-to-github.sh mikaelsouza weldpoly-scripts"
    exit 1
fi

GITHUB_USER="$1"
REPO_NAME="$2"

echo "🚀 Configurando push para GitHub..."
echo "   Usuário: $GITHUB_USER"
echo "   Repositório: $REPO_NAME"
echo ""

# Verificar se Git está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando Git..."
    git init
    git branch -M main
    git add .
    git commit -m "Initial commit: Add Weldpoly scripts for Webflow"
fi

# Remover remote antigo se existir
git remote remove origin 2>/dev/null

# Adicionar remote
echo "🔗 Adicionando remote do GitHub..."
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Verificar se remote foi adicionado
if git remote -v | grep -q "$GITHUB_USER/$REPO_NAME"; then
    echo "✅ Remote configurado com sucesso!"
else
    echo "❌ Erro ao configurar remote"
    exit 1
fi

# Fazer push
echo ""
echo "📤 Fazendo push para GitHub..."
echo "   (Você pode precisar fazer login no GitHub)"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push realizado com sucesso!"
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
else
    echo ""
    echo "⚠️  Push falhou. Possíveis causas:"
    echo "   1. Repositório ainda não foi criado no GitHub"
    echo "   2. Precisa fazer autenticação (use: gh auth login)"
    echo "   3. Repositório não é público"
    echo ""
    echo "💡 Dica: Crie o repositório primeiro em https://github.com/new"
    echo "   Certifique-se de que é PÚBLICO"
fi
