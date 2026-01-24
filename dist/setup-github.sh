#!/bin/bash
# Script para configurar repositório Git e preparar para GitHub

echo "🚀 Configurando repositório Git para GitHub..."
echo ""

# Verificar se estamos na pasta dist
if [ ! -f "README.md" ]; then
    echo "❌ Erro: Execute este script dentro da pasta dist/"
    exit 1
fi

# Inicializar Git (se ainda não estiver)
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    git branch -M main
fi

# Adicionar todos os arquivos
echo "📋 Adicionando arquivos..."
git add .

# Verificar se há mudanças para commit
if git diff --staged --quiet; then
    echo "✅ Arquivos já estão commitados"
else
    echo "💾 Fazendo commit inicial..."
    git commit -m "Initial commit: Add Weldpoly scripts for Webflow"
    echo "✅ Commit realizado com sucesso!"
fi

echo ""
echo "📊 Status do repositório:"
git status

echo ""
echo "✅ Repositório Git configurado!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Crie um repositório no GitHub:"
echo "   - Acesse: https://github.com/new"
echo "   - Nome: weldpoly-scripts (ou outro nome)"
echo "   - Marque como PUBLIC"
echo "   - NÃO adicione README, .gitignore ou license"
echo "   - Clique em 'Create repository'"
echo ""
echo "2. Após criar, execute estes comandos (substitua SEU_USUARIO e NOME_REPO):"
echo ""
echo "   git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git"
echo "   git push -u origin main"
echo ""
echo "3. Ou use o script automático:"
echo "   bash push-to-github.sh SEU_USUARIO NOME_REPO"
echo ""
