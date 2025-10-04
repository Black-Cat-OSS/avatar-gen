#!/bin/bash

set -e

echo "========================================="
echo "Avatar Generator - Production Server Setup"
echo "========================================="
echo ""

if [ -z "$1" ]; then
  echo "Usage: $0 <app_path>"
  echo "Example: $0 /opt/avatar-gen"
  exit 1
fi

APP_PATH=$1

echo "Setting up production server at: $APP_PATH"
echo ""

cd "$APP_PATH"

echo "Step 1: Creating local configuration files..."
echo "-------------------------------------------"

if [ ! -f backend/settings.local.yaml ]; then
  echo "Creating backend/settings.local.yaml..."
  cat > backend/settings.local.yaml << 'EOF'
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
  logging:
    level: 'info'
    verbose: false
    pretty: false
EOF
  echo "✓ Created backend/settings.local.yaml (please edit with real values)"
else
  echo "✓ backend/settings.local.yaml already exists"
fi

if [ ! -f backend/settings.production.local.yaml ]; then
  echo "Creating backend/settings.production.local.yaml..."
  cat > backend/settings.production.local.yaml << 'EOF'
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-production-s3-endpoint.com'
      bucket: 'your-production-bucket'
      access_key: 'YOUR_PRODUCTION_S3_ACCESS_KEY'
      secret_key: 'YOUR_PRODUCTION_S3_SECRET_KEY'
      region: 'us-east-1'
      force_path_style: true
      connection:
        maxRetries: 3
        retryDelay: 3000
  database:
    driver: 'postgresql'
    connection:
      maxRetries: 3
      retryDelay: 3000
    network:
      host: 'postgres'
      port: 5432
      database: 'avatar_gen'
      username: 'postgres'
      password: 'CHANGE_THIS_PASSWORD'
      ssl: false
  logging:
    level: 'warn'
    verbose: false
    pretty: false
EOF
  echo "✓ Created backend/settings.production.local.yaml (please edit with real values)"
else
  echo "✓ backend/settings.production.local.yaml already exists"
fi

echo ""
echo "Step 2: Setting up Docker network..."
echo "-----------------------------------"

if ! docker network ls | grep -q avatar-gen-external; then
  docker network create avatar-gen-external
  echo "✓ Created avatar-gen-external network"
else
  echo "✓ avatar-gen-external network already exists"
fi

echo ""
echo "Step 3: Creating necessary directories..."
echo "---------------------------------------"

mkdir -p backend/storage/avatars
mkdir -p backend/storage/database
mkdir -p backend/logs
mkdir -p frontend/logs
mkdir -p gateway/logs

echo "✓ Directories created"

echo ""
echo "Step 4: Setting permissions..."
echo "-----------------------------"

chmod 600 backend/settings.local.yaml
chmod 600 backend/settings.production.local.yaml

echo "✓ Permissions set"

echo ""
echo "========================================="
echo "Setup completed!"
echo "========================================="
echo ""
echo "IMPORTANT: Edit configuration files with real credentials:"
echo "  - backend/settings.production.local.yaml"
echo ""
echo "Then run deployment:"
echo "  cd $APP_PATH"
echo "  docker compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up -d"
echo ""

