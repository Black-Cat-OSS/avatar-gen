#!/bin/bash

# Script to generate settings.production.local.yaml from environment variables
# Used during production deployment from GitHub Actions

set -e

OUTPUT_FILE="${1:-backend/settings.production.local.yaml}"

echo "📝 Generating production configuration from environment variables..."

# Validate required environment variables
REQUIRED_VARS=(
  "PROD_S3_ENDPOINT"
  "PROD_S3_BUCKET"
  "PROD_S3_ACCESS_KEY"
  "PROD_S3_SECRET_KEY"
  "PROD_S3_REGION"
  "PROD_DB_HOST"
  "PROD_DB_PORT"
  "PROD_DB_NAME"
  "PROD_DB_USERNAME"
  "PROD_DB_PASSWORD"
)

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "❌ Error: Required environment variable $VAR is not set"
    exit 1
  fi
done

# Remove existing file/directory
rm -rf "$OUTPUT_FILE"

# Generate config file
cat > "$OUTPUT_FILE" <<EOF
app:
  storage:
    type: 's3'
    s3:
      endpoint: '$PROD_S3_ENDPOINT'
      bucket: '$PROD_S3_BUCKET'
      access_key: '$PROD_S3_ACCESS_KEY'
      secret_key: '$PROD_S3_SECRET_KEY'
      region: '$PROD_S3_REGION'
      force_path_style: true
      connection:
        maxRetries: 3
        retryDelay: 2000
  server:
    host: '0.0.0.0'
    port: 3000
  database:
    driver: 'postgresql'
    connection:
      maxRetries: 3
      retryDelay: 2000
    network:
      host: '$PROD_DB_HOST'
      port: $PROD_DB_PORT
      database: '$PROD_DB_NAME'
      username: '$PROD_DB_USERNAME'
      password: '$PROD_DB_PASSWORD'
      ssl: false
    # PostgreSQL connection string for Prisma
    postgresql_params:
      url: 'postgresql://$PROD_DB_USERNAME:$PROD_DB_PASSWORD@$PROD_DB_HOST:$PROD_DB_PORT/$PROD_DB_NAME'
  logging:
    level: 'warn'
    verbose: false
    pretty: false
EOF

echo "✅ Production config generated at: $OUTPUT_FILE"
echo "📊 Config summary:"
echo "  - S3 Endpoint: $PROD_S3_ENDPOINT"
echo "  - S3 Bucket: $PROD_S3_BUCKET"
echo "  - Database: $PROD_DB_NAME@$PROD_DB_HOST:$PROD_DB_PORT"

