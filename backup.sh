#!/bin/bash

# Load environment variables from .env file (if using it)
# If not using .env, make sure the environment variables are set in the shell beforehand
echo "Loading environment variables from docker.env..."
source docker.env

# Define variables using environment variables
PG_HOST=${POSTGRES_HOST:-"db"}  # Default to 'db' if not set in .env
PG_PORT=${POSTGRES_PORT:-"5432"}
PG_USER=${POSTGRES_USER:-"postgres"}
PG_DB=${POSTGRES_NAME:-"your_database_name"}
S3_BUCKET=${S3_BUCKET:-"s3://your-backup-bucket"}
BACKUP_PATH="/home/ubuntu/backups"
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="$BACKUP_PATH/db_backup_$DATE.dump"

# Create backup directory if it doesn't exist
echo "Creating backup directory at $BACKUP_PATH..."
mkdir -p $BACKUP_PATH

# Perform the backup using pg_dump
echo "Starting database backup for database '$PG_DB'..."
docker exec -t evalai-db-1 pg_dump -h $PG_HOST -U $PG_USER -F c $PG_DB > $BACKUP_FILE
echo "Database backup completed and saved to $BACKUP_FILE"

# Upload the backup to S3
echo "Uploading backup to S3 bucket $S3_BUCKET..."
aws s3 cp $BACKUP_FILE $S3_BUCKET/
echo "Backup uploaded successfully to S3."

# Clean up the local backup file
echo "Removing the local backup file $BACKUP_FILE..."
rm $BACKUP_FILE
echo "Backup process completed and local file removed."
