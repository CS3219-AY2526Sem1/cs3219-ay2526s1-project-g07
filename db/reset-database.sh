#!/bin/bash

# Database connection string
DB_URL="postgres://postgres:X-pp-db-dev-3b7df01f@34.87.140.88:5432/postgres"

echo "🗑️  Dropping all tables..."

# Drop all tables in the database using CASCADE
psql "$DB_URL" << 'EOF'
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "jwks" CASCADE;
DROP TABLE IF EXISTS "question" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
EOF

if [ $? -ne 0 ]; then
    echo "❌ Error dropping tables"
    exit 1
fi

echo "✅ All tables dropped successfully"
echo ""
echo "📝 Creating tables from init.sql..."

# Run the init.sql file
psql "$DB_URL" < "$(dirname "$0")/init.sql"

if [ $? -ne 0 ]; then
    echo "❌ Error creating tables"
    exit 1
fi

echo "✅ Database reset complete!"
