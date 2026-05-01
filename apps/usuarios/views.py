from usuarios.models import Usuario
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from axes.decorators import axes_dispatch
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from pathlib import Path
from django.conf import settings
from finanzas.db_crypto import cifrar_db, limpiar_db_temporal, DB_ACTIVA, descifrar_db, crear_db_nueva
import qrcode, io, base64

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def oauth_token(request):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(request.user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })
def oauth_redirect(request):
    return redirect('oauth_callback')

@api_view(['POST'])
@permission_classes([AllowAny])
def registro_view(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        nombre = request.data.get('nombre')
        if Usuario.objects.filter(email=email).exists():
            return Response({'error': 'Email ya registrado'}, status=400)
        Usuario.objects.create_user(email=email, password=password, nombre=nombre)
        return Response({'ok': True}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@axes_dispatch
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user:
            ruta_mmb = Path(settings.MEDIA_ROOT) / f'db_{user.pk}.mmb'
            if ruta_mmb.exists():
                ok = descifrar_db(password, ruta_mmb)
                if not ok:
                    return render(request, 'usuarios/login.html',
                        {'error': 'No se pudo abrir la base de datos'})
            else:
                ruta_mmb.parent.mkdir(parents=True, exist_ok=True)
                crear_db_nueva(password, ruta_mmb)
            login(request, user)
            if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
                return redirect('setup_2fa')
            return redirect('verify_2fa')
        return render(request, 'usuarios/login.html', {'error': 'Credenciales incorrectas'})
    return render(request, 'usuarios/login.html')


@login_required
def setup_2fa(request):
    device, _ = TOTPDevice.objects.get_or_create(
        user=request.user, defaults={'name': 'default'}
    )
    img = qrcode.make(device.config_url)
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_b64 = base64.b64encode(buffer.getvalue()).decode()
    return render(request, 'usuarios/setup_2fa.html', {'qr': qr_b64})


@login_required
def verify_2fa(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        device = TOTPDevice.objects.filter(user=request.user).first()
        if device and device.verify_token(token):
            device.confirmed = True
            device.save()
            return redirect('dashboard')
        return render(request, 'usuarios/verify_2fa.html', {'error': 'Token inválido'})
    return render(request, 'usuarios/verify_2fa.html')


@login_required
def dashboard_view(request):
    return render(request, 'usuarios/dashboard.html')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
        password = request.data.get('password')
        user = request.user
        auth = authenticate(request, email=user.email, password=password)
        if not auth:
            return Response({'error': 'Contraseña incorrecta'}, status=400)
        ruta_mmb = Path(settings.MEDIA_ROOT) / f'db_{user.pk}.mmb'
        if DB_ACTIVA.exists():
            cifrar_db(password, ruta_mmb)
            limpiar_db_temporal()
        return Response({'ok': True})
