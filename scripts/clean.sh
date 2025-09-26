#!/bin/bash

# Clean script for Avatar Generator

echo "🧹 Cleaning Avatar Generator..."

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Remove containers, networks, and volumes
echo "🗑️ Removing containers, networks, and volumes..."
docker-compose down -v

# Remove images
echo "🖼️ Removing images..."
docker rmi avatar-gen-backend:latest 2>/dev/null || true

# Clean up unused Docker resources
echo "🧽 Cleaning up unused Docker resources..."
docker system prune -f
docker builder prune -f

echo "✅ Cleanup completed!"
echo "💡 Run ./scripts/build.sh to rebuild the project"
