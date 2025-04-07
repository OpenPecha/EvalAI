#!/bin/sh
python manage.py migrate --noinput  && \
python manage.py collectstatic --noinput  && \
if [ "$SEED_ON_STARTUP" = "true" ]; then
  python manage.py seed
fi && \
uwsgi --ini /code/docker/dev/django/uwsgi.ini