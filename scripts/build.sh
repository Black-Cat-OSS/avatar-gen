#!/bin/bash

# Build script for Docker image optimization

echo "🚀 Building optimized Docker image..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
docker system prune -f
docker builder prune -f

# Build with BuildKit for better caching and parallel processing
echo "🔨 Building with BuildKit and parallel processing..."
DOCKER_BUILDKIT=1 docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --progress=plain \
  -t avatar-gen-backend:latest \
  ../backend

# Show image size
echo "📊 Image size:"
docker images avatar-gen-backend:latest

echo "✅ Build completed!"
echo "To run: docker-compose up"
