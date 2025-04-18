#!/bin/bash

# Load environment variables from .env file (if using it)
# If not using .env, make sure the environment variables are set in the shell beforehand
source docker.env

# Define variables using environment variables
PG_HOST=${POSTGRES_HOST:-"db"}  # Default to 'db' if not set in .env
PG_PORT=${POSTGRES_PORT:-"5432"}
PG_USER=${POSTGRES_USER:-"postgres"}
PG_DB=${POSTGRES_NAME:-"your_database_name"}
S3_BUCKET=${S3_BUCKET:-"s3://your-backup-bucket"}
BACKUP_PATH="/backups"
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="$BACKUP_PATH/db_backup_$DATE.dump"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_PATH

# Perform the backup using pg_dump
docker exec -t evalai-db-1 pg_dump -h $PG_HOST -U $PG_USER -F c $PG_DB > $BACKUP_FILE

# Upload the backup to S3
aws s3 cp $BACKUP_FILE $S3_BUCKET/

# Clean up the local backup file
rm $BACKUP_FILE
