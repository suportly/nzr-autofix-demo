"""
URL configuration for NZR Autofix Demo.

All error endpoints are under /api/demo/errors/ for clarity.
"""
from django.urls import path
from demo import views

urlpatterns = [
    # Fake authentication
    path('api/demo/auth/login/', views.fake_login),

    # Automatic capture (AutofixMiddleware catches these)
    path('api/demo/errors/value-error/', views.trigger_value_error),
    path('api/demo/errors/key-error/', views.trigger_key_error),
    path('api/demo/errors/type-error/', views.trigger_type_error),
    path('api/demo/errors/zero-division/', views.trigger_zero_division),
    path('api/demo/errors/attribute-error/', views.trigger_attribute_error),
    path('api/demo/errors/index-error/', views.trigger_index_error),

    # Manual capture (try/except + capture_exception/capture_message)
    path('api/demo/errors/manual-capture/', views.manual_capture_exception),
    path('api/demo/errors/manual-message/', views.manual_capture_message),
]
