"""
Django settings for NZR Autofix Demo.

This is a minimal Django project that demonstrates the nzr-autofix Python SDK.
No database is used — all responses are computed at request time.
"""
import os

# --- Base ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'demo-insecure-key-do-not-use-in-production')
DEBUG = True
ALLOWED_HOSTS = ['*']
ROOT_URLCONF = 'demo.urls'
WSGI_APPLICATION = 'demo.wsgi.application'

# --- Apps ---
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'corsheaders',
    'rest_framework',
]

# --- Middleware ---
# AutofixMiddleware catches unhandled exceptions in views and sends them
# to NZR Autofix automatically. No manual capture needed for view errors.
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'nzr_autofix.integrations.django.AutofixMiddleware',
]

# --- CORS ---
# Allow the frontend dev server to call our API
CORS_ALLOW_ALL_ORIGINS = True

# --- DRF ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'UNAUTHENTICATED_USER': None,
}

# --- No database needed for this demo ---
DATABASES = {}

# =============================================================
# NZR Autofix SDK Initialization
# =============================================================
# The SDK reads configuration from environment variables:
#   NZR_AUTOFIX_DSN          — Your project's Data Source Name
#   NZR_AUTOFIX_ENDPOINT_URL — The ingest API endpoint
#   NZR_AUTOFIX_ENVIRONMENT  — e.g. 'production', 'staging', 'demo'
#
# Call init() once at application startup. After this, the SDK:
#   1. Installs sys.excepthook to capture unhandled exceptions
#   2. Makes capture_exception() and capture_message() available
#   3. AutofixMiddleware will capture Django view exceptions
# =============================================================
import nzr_autofix

nzr_autofix.init(
    # DSN and endpoint_url are read from env vars automatically.
    # You can also pass them explicitly:
    # dsn='nzr://your-token@autofix/your-project-id',
    # endpoint_url='https://your-instance.com/api/v1/autofix/ingest/',
    environment=os.environ.get('NZR_AUTOFIX_ENVIRONMENT', 'demo'),
    release='1.0.0-demo',
)
