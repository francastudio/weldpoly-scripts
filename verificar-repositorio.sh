#!/bin/bash
# Script para verificar se o repositório GitHub está acessível

echo "🔍 Verificando repositório GitHub..."
echo ""

# Solicitar informações do usuário
read -p "Digite seu nome de usuário do GitHub: " GITHUB_USER
read -p "Digite o nome do repositório (padrão: weldpoly-scripts): " REPO_NAME
REPO_NAME=${REPO_NAME:-weldpoly-scripts}

echo ""
echo "📋 Verificando URLs..."
echo ""

# URLs para verificar
QUOTE_URL="https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/quote/weldpoly-quote-system-init.js"
SPARE_PARTS_URL="https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js"
GITHUB_REPO="https://github.com/$GITHUB_USER/$REPO_NAME"

echo "🔗 Repositório GitHub:"
echo "   $GITHUB_REPO"
echo ""

echo "📦 URLs dos Scripts (jsDelivr):"
echo ""
echo "1. Quote System:"
echo "   $QUOTE_URL"
echo ""

echo "2. Spare Parts:"
echo "   $SPARE_PARTS_URL"
echo ""

# Verificar se as URLs estão acessíveis
echo "✅ Testando acesso..."
echo ""

if curl -s -o /dev/null -w "%{http_code}" "$QUOTE_URL" | grep -q "200"; then
    echo "✅ Quote System: ACESSÍVEL"
else
    echo "⚠️  Quote System: Verificando... (pode demorar alguns minutos após upload)"
fi

if curl -s -o /dev/null -w "%{http_code}" "$SPARE_PARTS_URL" | grep -q "200"; then
    echo "✅ Spare Parts: ACESSÍVEL"
else
    echo "⚠️  Spare Parts: Verificando... (pode demorar alguns minutos após upload)"
fi

echo ""
echo "==========================================="
echo "📋 CÓDIGO PARA WEBFLOW FOOTER:"
echo "==========================================="
echo ""
echo "<script src=\"$QUOTE_URL\" defer></script>"
echo "<script src=\"$SPARE_PARTS_URL\" defer></script>"
echo ""
echo "==========================================="
