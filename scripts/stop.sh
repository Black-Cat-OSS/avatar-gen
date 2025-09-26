#!/bin/bash

# Stop script for Avatar Generator

echo "🛑 Stopping Avatar Generator..."

# Stop and remove containers
echo "🔨 Stopping services..."
docker-compose down

# Optional: Remove volumes (uncomment if you want to clean data)
# echo "🧹 Removing volumes..."
# docker-compose down -v

echo "✅ Services stopped!"
