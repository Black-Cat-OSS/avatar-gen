#!/bin/bash

# Docker build script for React SDK
# Usage: ./scripts/docker-build.sh [build|run|stop|clean]

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Extract version from package.json
VERSION=$(cd "$PROJECT_ROOT" && node -p "require('./package.json').version")
IMAGE_NAME="react-sdk"
CONTAINER_NAME="react-sdk-app"
PORT="8080"

case "${1:-build}" in
  "build")
    echo "🔨 Building Docker image..."
    echo "📦 Version: $VERSION"
    cd "$PROJECT_ROOT"
    docker build -f docker/Dockerfile -t $IMAGE_NAME:$VERSION -t $IMAGE_NAME:latest .
    echo "✅ Build completed successfully!"
    echo "🏷️  Image tagged as: $IMAGE_NAME:$VERSION and $IMAGE_NAME:latest"
    ;;
  "run")
    echo "🚀 Starting container..."
    docker run -d \
      --name $CONTAINER_NAME \
      -p $PORT:8080 \
      --restart unless-stopped \
      -v "$PROJECT_ROOT/configs/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
      $IMAGE_NAME:latest
    echo "✅ Container started on http://localhost:$PORT"
    echo "📝 Nginx config mounted from $PROJECT_ROOT/configs/nginx/nginx.conf"
    ;;
  "stop")
    echo "🛑 Stopping container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    echo "✅ Container stopped and removed"
    ;;
  "clean")
    echo "🧹 Cleaning up..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    docker rmi $IMAGE_NAME:$VERSION || true
    docker rmi $IMAGE_NAME:latest || true
    echo "✅ Cleanup completed"
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker logs -f $CONTAINER_NAME
    ;;
  "reload")
    echo "🔄 Reloading nginx configuration..."
    docker exec $CONTAINER_NAME nginx -s reload
    echo "✅ Nginx configuration reloaded"
    ;;
  "version")
    echo "📦 Current version: $VERSION"
    echo "🏷️  Image name: $IMAGE_NAME"
    echo "📋 Available tags:"
    docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" 2>/dev/null || echo "No images found"
    ;;
  "status")
    echo "📊 Container status:"
    docker ps -a --filter name=$CONTAINER_NAME
    ;;
  *)
    echo "Usage: $0 {build|run|stop|clean|logs|reload|version|status}"
    echo ""
    echo "Commands:"
    echo "  build   - Build Docker image"
    echo "  run     - Run container"
    echo "  stop    - Stop and remove container"
    echo "  clean   - Stop, remove container and image"
    echo "  logs    - Show container logs"
    echo "  reload  - Reload nginx configuration"
    echo "  version - Show version information"
    echo "  status  - Show container status"
    exit 1
    ;;
esac
