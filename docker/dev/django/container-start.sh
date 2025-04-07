#!/bin/sh
# python manage.py migrate --noinput  && \
# python manage.py collectstatic --noinput  && \
# if [ "$SEED_ON_STARTUP" = "true" ]; then
#   python manage.py seed
# fi && \
# uwsgi --ini /code/docker/dev/django/uwsgi.ini



# Only run migrations if explicitly requested
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  python manage.py migrate --noinput
else
  echo "Skipping database migrations to preserve existing data"
fi

# Always collect static files
python manage.py collectstatic --noinput

# Only run seed if explicitly requested
if [ "$SEED_ON_STARTUP" = "true" ]; then
  echo "Seeding database with initial data..."
  python manage.py seed
else
  echo "Skipping database seeding to preserve existing data"
fi

# Start the application
uwsgi --ini /code/docker/dev/django/uwsgi.ini