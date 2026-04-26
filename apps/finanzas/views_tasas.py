import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Moneda

API_URL = "https://api.exchangerate-api.com/v4/latest/{}"

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_tasa(request):
    origen = request.GET.get('origen', 'USD')
    destino = request.GET.get('destino', 'USD')
    try:
        res = requests.get(API_URL.format(origen), timeout=5)
        data = res.json()
        tasa = data['rates'].get(destino)
        if tasa is None:
            return Response({'error': 'Moneda no encontrada'}, status=400)
        return Response({'tasa': tasa, 'origen': origen, 'destino': destino})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def actualizar_todas_tasas(request):
    """Actualiza tasas de todas las monedas del usuario respecto a la principal"""
    try:
        principal = Moneda.objects.filter(
            usuario=request.user, es_principal=True
        ).first()
        if not principal:
            principal = Moneda.objects.filter(
                usuario__isnull=True, es_principal=True
            ).first()
        if not principal:
            return Response({'error': 'No hay moneda principal'}, status=400)

        res = requests.get(API_URL.format(principal.simbolo), timeout=5)
        data = res.json()

        monedas = Moneda.objects.filter(
            usuario=request.user
        ).exclude(es_principal=True)

        actualizadas = []
        for moneda in monedas:
            tasa = data['rates'].get(moneda.simbolo)
            if tasa:
                moneda.tasa_cambio = tasa
                moneda.save()
                actualizadas.append({'simbolo': moneda.simbolo, 'tasa': tasa})

        return Response({'actualizadas': actualizadas, 'base': principal.simbolo})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
