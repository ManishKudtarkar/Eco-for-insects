#!/bin/bash

# Render Pre-Deployment Script
# This script helps prepare your code for Render deployment

echo "=== EcoPredict Render Deployment Helper ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}Error: Git repository not found${NC}"
    echo "Please initialize git first: git init"
    exit 1
fi

echo -e "${GREEN}✓${NC} Git repository found"

# Check if code is committed
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠${NC} Uncommitted changes found"
    echo "Would you like to commit them? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Enter commit message:"
        read -r commit_msg
        git add -A
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓${NC} Changes committed"
    else
        echo "Please commit changes before deploying"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} All changes committed"
fi

# Check if remote is set
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}⚠${NC} No remote repository configured"
    echo "Enter your GitHub repository URL:"
    read -r repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓${NC} Remote repository added"
else
    echo -e "${GREEN}✓${NC} Remote repository configured"
fi

# Push to remote
echo ""
echo "Push to GitHub? (y/n)"
read -r push_response
if [[ "$push_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    git push -u origin main || git push -u origin master
    echo -e "${GREEN}✓${NC} Code pushed to GitHub"
fi

echo ""
echo -e "${GREEN}=== Pre-deployment checks complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Go to https://render.com and sign in"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Select this repository"
echo "5. Render will detect render.yaml and create both services"
echo "6. Wait ~10 minutes for deployment"
echo "7. Update API URL in react-frontend/src/pages/search.js"
echo "8. Commit and push the change to redeploy"
echo ""
echo "For detailed instructions, see RENDER_DEPLOY.md"
echo ""
