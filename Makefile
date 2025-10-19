# AI Chatbot Makefile
# Simplifies development and deployment tasks

.PHONY: help dev build deploy logs stop clean test lint format

# Default target
help: ## Show this help message
	@echo "🤖 AI Chatbot - Available Commands"
	@echo "=================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# Development
dev: ## Start development servers (Next.js + Convex)
	@echo "🚀 Starting development servers..."
	@echo "Make sure to run 'pnpm convex dev' in another terminal"
	@pnpm dev

convex-dev: ## Start Convex development server
	@echo "🔄 Starting Convex development server..."
	@pnpm convex dev

# Building
build: ## Build production Docker image
	@echo "🔨 Building production Docker image..."
	@./scripts/build.sh

build-no-cache: ## Build production Docker image without cache
	@echo "🔨 Building production Docker image (no cache)..."
	@./scripts/build.sh --no-cache

# Deployment
deploy: ## Deploy to production using Docker Compose
	@echo "🚀 Deploying to production..."
	@./scripts/deploy.sh --detach

deploy-build: ## Deploy with forced rebuild
	@echo "🚀 Deploying to production (with rebuild)..."
	@./scripts/deploy.sh --build --detach

deploy-logs: ## Deploy and show logs
	@echo "🚀 Deploying to production..."
	@./scripts/deploy.sh --logs

# Monitoring
logs: ## Show production logs
	@echo "📜 Showing production logs..."
	@docker-compose -f docker-compose.prod.yml logs -f

logs-tail: ## Show last 50 log lines
	@echo "📜 Showing last 50 log lines..."
	@docker-compose -f docker-compose.prod.yml logs --tail=50

status: ## Show container status
	@echo "📊 Container Status:"
	@docker-compose -f docker-compose.prod.yml ps

health: ## Check application health
	@echo "🏥 Health Check:"
	@curl -f http://localhost:3000/api/health || echo "❌ Service not responding"

# Control
stop: ## Stop production containers
	@echo "🛑 Stopping production containers..."
	@./scripts/deploy.sh --stop

restart: ## Restart production containers
	@echo "🔄 Restarting production containers..."
	@docker-compose -f docker-compose.prod.yml restart

# Cleanup
clean: ## Remove containers and unused images
	@echo "🧹 Cleaning up containers and images..."
	@docker-compose -f docker-compose.prod.yml down -v
	@docker system prune -f

clean-all: ## Remove all containers, images, and volumes
	@echo "🧹 Cleaning up everything..."
	@docker-compose -f docker-compose.prod.yml down -v --rmi all
	@docker system prune -af --volumes

# Development tools
test: ## Run tests
	@echo "🧪 Running tests..."
	@pnpm test

lint: ## Run linter
	@echo "🔍 Running linter..."
	@pnpm lint

format: ## Format code
	@echo "✨ Formatting code..."
	@pnpm format

# Setup
setup-prod: ## Setup production environment
	@echo "⚙️  Setting up production environment..."
	@if [ ! -f .env.production ]; then \
		echo "📋 Creating .env.production from template..."; \
		cp .env.production .env.production.local; \
		echo "✅ Please edit .env.production.local with your settings"; \
	else \
		echo "⚠️  .env.production already exists"; \
	fi

convex-deploy: ## Deploy Convex to production
	@echo "🔄 Deploying Convex to production..."
	@pnpm convex deploy

# Quick commands
up: deploy ## Alias for deploy
down: stop ## Alias for stop
ps: status ## Alias for status