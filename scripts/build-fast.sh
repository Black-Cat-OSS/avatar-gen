#!/bin/bash

# Fast build script with maximum parallelization

echo "⚡ Fast building with maximum parallelization..."

# Set environment variables for parallel processing
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Use all available CPU cores
export DOCKER_BUILDKIT_INLINE_CACHE=2

# Build with maximum parallelization
echo "🔨 Building with maximum parallelization..."
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg NODE_OPTIONS="--max-old-space-size=4096" \
  --progress=plain \
  --no-cache \
  -t avatar-gen-backend:latest \
  ../backend

# Show image size
echo "📊 Image size:"
docker images avatar-gen-backend:latest

echo "✅ Fast build completed!"
