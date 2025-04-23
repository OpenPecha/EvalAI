#!/bin/bash
set -euo pipefail

# 1) make sure cron can find docker, aws, etc
export PATH=/usr/local/bin:/usr/bin:/bin:/snap/bin

# 2) compute the directory this script lives in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 3) debug—print PATH and where docker/aws live
echo "[ $(date '+%F %T') ] PATH=$PATH"
echo "[ $(date '+%F %T') ] which docker: $(which docker 2>/dev/null || echo 'NOT FOUND')"
echo "[ $(date '+%F %T') ] which aws: $(which aws 2>/dev/null || echo 'NOT FOUND')"

# 4) source the env file by its absolute path
ENV_FILE="$SCRIPT_DIR/docker.env"
echo "[ $(date '+%F %T') ] Sourcing $ENV_FILE..."
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ $(date '+%F %T') ] ERROR: env file not found at $ENV_FILE"
  exit 1
fi
source "$ENV_FILE"


# Define variables using environment variables
PG_CONTAINER=${POSTGRES_CONTAINER:-"evalai-db-1"}  # Default to evalai-db-1 if not set
PG_HOST=${POSTGRES_HOST:-"db"}  # Default to 'db' if not set in .env
PG_PORT=${POSTGRES_PORT:-"5432"}
PG_USER=${POSTGRES_USER:-"postgres"}
PG_DB=${POSTGRES_NAME:-"your_database_name"}
S3_BUCKET=${S3_BUCKET:-"s3://your-backup-bucket"}
BACKUP_PATH="/home/ubuntu/backups"
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="$BACKUP_PATH/db_backup_$DATE.sql"

# Create backup directory if it doesn't exist
echo "Creating backup directory at $BACKUP_PATH..."
mkdir -p $BACKUP_PATH

# Perform the backup using pg_dump
echo "Starting database backup for database '$PG_DB'..."
docker exec -t evalai-db-1 pg_dump -U postgres -d $PG_DB > $BACKUP_FILE
docker exec $PG_CONTAINER \
  pg_dump -U postgres -d $PG_DB -Fc --clean \
  > $BACKUP_FILE

echo "Database backup completed and saved to $BACKUP_FILE"

# Upload the backup to S3
echo "Uploading backup to S3 bucket $S3_BUCKET..."
aws s3 cp $BACKUP_FILE $S3_BUCKET/
echo "Backup uploaded successfully to S3."



# 4) Cleanup: list, count, and delete oldest if >7
#    We assume S3_BUCKET is "s3://my-bucket"
ALL_BACKUPS=$(aws s3 ls "$S3_BUCKET/" \
               | awk '{print $4}' \
               | grep '^db_backup_.*\.sql$' \
               | sort) 

COUNT=$(echo "$ALL_BACKUPS" | wc -l)
echo "[ $(date '+%F %T') ] Found $COUNT backup(s) in S3."

if [ "$COUNT" -gt 7 ]; then
  TO_DELETE=$((COUNT - 7))
  echo "[ $(date '+%F %T') ] Deleting the $TO_DELETE oldest backup(s)..."

  echo "$ALL_BACKUPS" \
    | head -n "$TO_DELETE" \
    | while read -r fname; do
        echo "[ $(date '+%F %T') ] Removing s3://$S3_BUCKET/$fname"
        aws s3 rm "$S3_BUCKET/$fname"
      done
else
  echo "[ $(date '+%F %T') ] No cleanup needed."
fi


# Clean up the local backup file
echo "Removing the local backup file $BACKUP_FILE..."
rm $BACKUP_FILE
echo "Backup process completed and local file removed."
