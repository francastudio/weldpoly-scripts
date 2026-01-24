#!/bin/bash
# Script para gerar código final do Webflow

echo "🚀 Gerador de Código para Webflow"
echo ""

read -p "Digite seu nome de usuário do GitHub: " GITHUB_USER
read -p "Digite o nome do repositório (padrão: weldpoly-scripts): " REPO_NAME
REPO_NAME=${REPO_NAME:-weldpoly-scripts}

QUOTE_URL="https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/quote/weldpoly-quote-system-init.js"
SPARE_PARTS_URL="https://cdn.jsdelivr.net/gh/$GITHUB_USER/$REPO_NAME@main/spare-parts/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js"

echo ""
echo "==========================================="
echo "📋 CÓDIGO PARA WEBFLOW FOOTER CODE:"
echo "==========================================="
echo ""
echo "<script src=\"$QUOTE_URL\" defer></script>"
echo "<script src=\"$SPARE_PARTS_URL\" defer></script>"
echo ""
echo "==========================================="
echo ""
echo "✅ Copie e cole o código acima no Footer Code do Webflow"
echo "   (Site Settings → Custom Code → Footer Code)"
echo ""

# Salvar em arquivo
OUTPUT_FILE="CODIGO-WEBFLOW-FINAL.txt"
cat > "$OUTPUT_FILE" << EOF
===========================================
CÓDIGO PARA WEBFLOW FOOTER CODE
===========================================

<script src="$QUOTE_URL" defer></script>
<script src="$SPARE_PARTS_URL" defer></script>

===========================================
INSTRUÇÕES:
===========================================

1. Acesse: Webflow → Site Settings → Custom Code
2. Cole o código acima no campo "Footer Code"
3. Clique em "Save"
4. Publique o site

===========================================
URLs:
===========================================

Quote System:
$QUOTE_URL

Spare Parts:
$SPARE_PARTS_URL

Repositório:
https://github.com/$GITHUB_USER/$REPO_NAME

===========================================
EOF

echo "💾 Código salvo em: $OUTPUT_FILE"
echo ""
