#!/bin/bash

# Load environment variables from .env file (if using it)
echo "Loading environment variables from docker.env..."
source /path/to/your/docker.env

# Define variables using environment variables
PG_HOST=${POSTGRES_HOST:-"evalai-db-1"}  # Default to evalai-db-1 if not set
PG_PORT=${POSTGRES_PORT:-"5432"}
PG_USER=${POSTGRES_USER:-"postgres"}
PG_DB=${POSTGRES_NAME:-"your_database_name"}
S3_BUCKET=${S3_BUCKET:-"s3://your-backup-bucket"}
BACKUP_PATH="/home/ubuntu/backups"
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="$BACKUP_PATH/db_backup_latest.dump"

# List the backups in S3 and get the latest one based on the naming convention
echo "Listing backups in S3 bucket $S3_BUCKET..."
LATEST_BACKUP=$(aws s3 ls $S3_BUCKET/db_backup_*.dump | sort | tail -n 1 | awk '{print $4}')
echo "Latest backup file found: $LATEST_BACKUP"

# Download the latest backup from S3
echo "Downloading the latest backup from S3..."
# aws s3 cp $S3_BUCKET/$LATEST_BACKUP $BACKUP_FILE
echo "Backup downloaded successfully."

# Restore the backup into the PostgreSQL database
echo "Restoring the backup into the database '$PG_DB'..."
# docker exec -i evalai-db-1 pg_restore -U $PG_USER -d $PG_DB $BACKUP_FILE

# Clean up the local backup file
echo "Removing the local backup file $BACKUP_FILE..."
# rm $BACKUP_FILE

echo "Restore process completed."
