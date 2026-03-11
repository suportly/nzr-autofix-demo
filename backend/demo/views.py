"""
Demo API views that intentionally trigger errors.

Each view demonstrates a different SDK capture scenario.
The AutofixMiddleware (configured in settings.py) automatically captures
unhandled exceptions — no manual code needed for those cases.

For manual capture scenarios, we use nzr_autofix.capture_exception()
and nzr_autofix.capture_message() inside try/except blocks.
"""
import nzr_autofix
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


# =============================================================
# Fake Authentication
# =============================================================

FAKE_USERS = {
    'admin': {'password': 'admin123', 'name': 'Ana Silva', 'role': 'admin'},
    'dev': {'password': 'dev123', 'name': 'Carlos Oliveira', 'role': 'developer'},
}


@api_view(['POST'])
@permission_classes([AllowAny])
def fake_login(request):
    """
    Fake login endpoint — returns a hardcoded token.
    No real authentication is performed. This is just for the demo UI.
    """
    username = request.data.get('username', '')
    password = request.data.get('password', '')

    user = FAKE_USERS.get(username)
    if not user or user['password'] != password:
        return Response({'error': 'Invalid credentials'}, status=401)

    return Response({
        'token': f'fake-jwt-token-{username}',
        'user': {
            'username': username,
            'name': user['name'],
            'role': user['role'],
        },
    })


# =============================================================
# Automatic Capture — AutofixMiddleware catches these
# =============================================================
# These views raise exceptions that propagate out of the view.
# The AutofixMiddleware.process_exception() automatically captures
# them and sends to NZR Autofix. No manual code needed!
# =============================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_value_error(request):
    """
    Raises ValueError — caught automatically by AutofixMiddleware.

    Common scenario: parsing user input without proper validation.
    """
    user_input = "not-a-number"
    age = int(user_input)  # ValueError: invalid literal for int() with base 10
    return Response({'age': age})


@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_key_error(request):
    """
    Raises KeyError — caught automatically by AutofixMiddleware.

    Common scenario: accessing a dict key that doesn't exist.
    """
    config = {'database': 'postgres', 'host': 'localhost'}
    port = config['port']  # KeyError: 'port'
    return Response({'port': port})


@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_type_error(request):
    """
    Raises TypeError — caught automatically by AutofixMiddleware.

    Common scenario: operating on incompatible types.
    """
    count = None
    total = count + 1  # TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
    return Response({'total': total})


@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_zero_division(request):
    """
    Raises ZeroDivisionError — caught automatically by AutofixMiddleware.

    Common scenario: dividing by zero without checking the denominator.
    """
    total_items = 100
    num_pages = 0
    items_per_page = total_items / num_pages  # ZeroDivisionError
    return Response({'items_per_page': items_per_page})


@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_attribute_error(request):
    """
    Raises AttributeError — caught automatically by AutofixMiddleware.

    Common scenario: calling a method on None (null pointer equivalent).
    """
    user = None
    name = user.get_full_name()  # AttributeError: 'NoneType' has no attribute 'get_full_name'
    return Response({'name': name})


@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_index_error(request):
    """
    Raises IndexError — caught automatically by AutofixMiddleware.

    Common scenario: accessing a list index out of range.
    """
    items = ['alpha', 'beta', 'gamma']
    selected = items[10]  # IndexError: list index out of range
    return Response({'selected': selected})


# =============================================================
# Manual Capture — Using nzr_autofix.capture_exception/message
# =============================================================
# Sometimes you want to catch an exception, handle it gracefully,
# but still report it to NZR Autofix for tracking. Use
# capture_exception() inside a try/except block.
# =============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def manual_capture_exception(request):
    """
    Demonstrates manual exception capture with nzr_autofix.capture_exception().

    The error is caught and handled gracefully (returns a 200 response),
    but still reported to NZR Autofix for tracking and potential auto-fix.
    """
    try:
        # Simulate a business logic error
        data = {'price': '19.99', 'quantity': 'abc'}
        total = float(data['price']) * int(data['quantity'])  # ValueError
        return Response({'total': total})
    except Exception as exc:
        # Capture the exception manually — it won't crash the view
        event_id = nzr_autofix.capture_exception(exc)
        return Response({
            'status': 'error_captured',
            'message': 'The error was caught and reported to NZR Autofix.',
            'event_id': event_id,
            'error': str(exc),
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def manual_capture_message(request):
    """
    Demonstrates manual message capture with nzr_autofix.capture_message().

    Useful for tracking warnings, business rule violations, or
    unusual conditions that aren't exceptions.
    """
    message = request.data.get('message', 'User triggered a demo warning')
    level = request.data.get('level', 'warning')

    # Send a message (not an exception) to NZR Autofix
    event_id = nzr_autofix.capture_message(
        message=f'[Demo] {message}',
        level=level,
    )

    return Response({
        'status': 'message_captured',
        'message': 'The message was sent to NZR Autofix.',
        'event_id': event_id,
        'level': level,
    })
