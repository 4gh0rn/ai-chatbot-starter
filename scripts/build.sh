#!/bin/bash

# AI Chatbot Production Build Script
# This script builds the Docker image for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="ai-chatbot"
IMAGE_TAG="latest"
DOCKERFILE="Dockerfile.prod"
BUILD_ARGS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    -n|--name)
      IMAGE_NAME="$2"
      shift 2
      ;;
    --no-cache)
      BUILD_ARGS="$BUILD_ARGS --no-cache"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -t, --tag TAG     Docker image tag (default: latest)"
      echo "  -n, --name NAME   Docker image name (default: ai-chatbot)"
      echo "  --no-cache        Build without using cache"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

echo -e "${BLUE}🚀 AI Chatbot Production Build${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}❌ Error: $DOCKERFILE not found${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production not found${NC}"
    echo -e "${YELLOW}   Make sure to configure production environment variables${NC}"
fi

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo -e "   Image Name: ${GREEN}$FULL_IMAGE_NAME${NC}"
echo -e "   Dockerfile: ${GREEN}$DOCKERFILE${NC}"
echo -e "   Build Args: ${GREEN}$BUILD_ARGS${NC}"
echo ""

# Start build
echo -e "${BLUE}🔨 Starting Docker build...${NC}"
echo ""

# Build the Docker image
if docker build $BUILD_ARGS -f "$DOCKERFILE" -t "$FULL_IMAGE_NAME" .; then
    echo ""
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo ""
    
    # Show image info
    echo -e "${BLUE}📊 Image Information:${NC}"
    docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    echo ""
    
    # Show next steps
    echo -e "${BLUE}🎉 Next Steps:${NC}"
    echo -e "   1. Test the image: ${GREEN}docker run -p 3000:3000 --env-file .env.production $FULL_IMAGE_NAME${NC}"
    echo -e "   2. Deploy with compose: ${GREEN}./scripts/deploy.sh${NC}"
    echo -e "   3. Push to registry: ${GREEN}docker push $FULL_IMAGE_NAME${NC}"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi