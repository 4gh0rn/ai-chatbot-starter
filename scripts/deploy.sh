#!/bin/bash

# AI Chatbot Production Deployment Script
# This script deploys the AI Chatbot using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
SERVICE_NAME="ai-chatbot"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      COMPOSE_FILE="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --build)
      BUILD_FLAG="--build"
      shift
      ;;
    --pull)
      PULL_FLAG="--pull"
      shift
      ;;
    -d|--detach)
      DETACH_FLAG="-d"
      shift
      ;;
    --stop)
      STOP_ONLY=true
      shift
      ;;
    --logs)
      SHOW_LOGS=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -f, --file FILE       Docker compose file (default: docker-compose.prod.yml)"
      echo "  --env-file FILE       Environment file (default: .env.production)"
      echo "  --build               Force rebuild of images"
      echo "  --pull                Pull latest images before deploying"
      echo "  -d, --detach          Run in detached mode"
      echo "  --stop                Stop and remove containers only"
      echo "  --logs                Show logs after deployment"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 AI Chatbot Production Deployment${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: $COMPOSE_FILE not found${NC}"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE not found${NC}"
    echo -e "${YELLOW}   Please copy .env.production and configure your environment variables${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Compose File: ${GREEN}$COMPOSE_FILE${NC}"
echo -e "   Environment: ${GREEN}$ENV_FILE${NC}"
echo ""

# Stop containers if --stop flag is provided
if [ "$STOP_ONLY" = true ]; then
    echo -e "${BLUE}🛑 Stopping containers...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✅ Containers stopped and removed${NC}"
    exit 0
fi

# Check if Convex is deployed
echo -e "${BLUE}🔍 Checking Convex deployment...${NC}"
if grep -q "your-production-convex-deployment-here" "$ENV_FILE"; then
    echo -e "${RED}❌ Error: Convex deployment not configured${NC}"
    echo -e "${YELLOW}   Please run 'npx convex deploy' and update $ENV_FILE${NC}"
    exit 1
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker daemon is not running${NC}"
    exit 1
fi

# Check if service is already running
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$SERVICE_NAME"; then
    echo -e "${YELLOW}⚠️  Service is already running. Stopping first...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
fi

# Pull images if flag is set
if [ "$PULL_FLAG" = "--pull" ]; then
    echo -e "${BLUE}📥 Pulling latest images...${NC}"
    docker-compose -f "$COMPOSE_FILE" pull
fi

# Start deployment
echo -e "${BLUE}🚀 Starting deployment...${NC}"
echo ""

# Deploy with docker-compose
if docker-compose -f "$COMPOSE_FILE" up $BUILD_FLAG $DETACH_FLAG; then
    echo ""
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo ""
    
    # Show container status
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show health status
    echo -e "${BLUE}🏥 Health Check:${NC}"
    sleep 5
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Service is healthy and responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Service may still be starting up...${NC}"
    fi
    echo ""
    
    # Show next steps
    echo -e "${BLUE}🎉 Deployment Complete!${NC}"
    echo -e "   Application URL: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Health Check: ${GREEN}http://localhost:3000/api/health${NC}"
    echo ""
    echo -e "${BLUE}📋 Useful Commands:${NC}"
    echo -e "   View logs: ${GREEN}docker-compose -f $COMPOSE_FILE logs -f${NC}"
    echo -e "   Stop service: ${GREEN}./scripts/deploy.sh --stop${NC}"
    echo -e "   Restart service: ${GREEN}docker-compose -f $COMPOSE_FILE restart${NC}"
    echo ""
    
    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        echo -e "${BLUE}📜 Service Logs:${NC}"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50
    fi
    
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo -e "${BLUE}🔍 Troubleshooting:${NC}"
    echo -e "   Check logs: ${GREEN}docker-compose -f $COMPOSE_FILE logs${NC}"
    echo -e "   Check status: ${GREEN}docker-compose -f $COMPOSE_FILE ps${NC}"
    echo -e "   Rebuild: ${GREEN}./scripts/deploy.sh --build${NC}"
    exit 1
fi