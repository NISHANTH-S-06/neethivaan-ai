import re

with open('docker-compose.yml', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix backend indentation
text = text.replace(
    '  backend:\n  build:\n    context: .\n    dockerfile: backend/Dockerfile\n  ports:\n    - "8000:8000"\n  environment:\n    - DATABASE_URL=postgresql://${POSTGRES_USER:-neethivaan}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-neethivaan}\n    - CELERY_BROKER_URL=redis://redis:6379/0\n    - CELERY_RESULT_BACKEND=redis://redis:6379/0\n    - CLAMAV_HOST=clamav\n    - CLAMAV_PORT=3310',
    '  backend:\n    build:\n      context: .\n      dockerfile: backend/Dockerfile\n    ports:\n      - "8000:8000"\n    environment:\n      - DATABASE_URL=postgresql://${POSTGRES_USER:-neethivaan}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-neethivaan}\n      - CELERY_BROKER_URL=redis://redis:6379/0\n      - CELERY_RESULT_BACKEND=redis://redis:6379/0\n      - CLAMAV_HOST=clamav\n      - CLAMAV_PORT=3310'
)

# Fix backend indentation with \r\n
text = text.replace(
    '  backend:\r\n  build:\r\n    context: .\r\n    dockerfile: backend/Dockerfile\r\n  ports:\r\n    - "8000:8000"\r\n  environment:\r\n    - DATABASE_URL=postgresql://${POSTGRES_USER:-neethivaan}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-neethivaan}\r\n    - CELERY_BROKER_URL=redis://redis:6379/0\r\n    - CELERY_RESULT_BACKEND=redis://redis:6379/0\r\n    - CLAMAV_HOST=clamav\r\n    - CLAMAV_PORT=3310',
    '  backend:\r\n    build:\r\n      context: .\r\n      dockerfile: backend/Dockerfile\r\n    ports:\r\n      - "8000:8000"\r\n    environment:\r\n      - DATABASE_URL=postgresql://${POSTGRES_USER:-neethivaan}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-neethivaan}\r\n      - CELERY_BROKER_URL=redis://redis:6379/0\r\n      - CELERY_RESULT_BACKEND=redis://redis:6379/0\r\n      - CLAMAV_HOST=clamav\r\n      - CLAMAV_PORT=3310'
)


# Fix worker indentation
text = text.replace(
    '  worker:\n  build:\n    context: .\n    dockerfile: backend/Dockerfile\n  command: celery -A tasks worker --loglevel=info\n  depends_on:\n    - redis\n    - postgres',
    '  worker:\n    build:\n      context: .\n      dockerfile: backend/Dockerfile\n    command: celery -A tasks worker --loglevel=info\n    depends_on:\n      - redis\n      - postgres'
)

# Fix worker indentation with \r\n
text = text.replace(
    '  worker:\r\n  build:\r\n    context: .\r\n    dockerfile: backend/Dockerfile\r\n  command: celery -A tasks worker --loglevel=info\r\n  depends_on:\r\n    - redis\r\n    - postgres',
    '  worker:\r\n    build:\r\n      context: .\r\n      dockerfile: backend/Dockerfile\r\n    command: celery -A tasks worker --loglevel=info\r\n    depends_on:\r\n      - redis\r\n      - postgres'
)

with open('docker-compose.yml', 'w', encoding='utf-8') as f:
    f.write(text)
