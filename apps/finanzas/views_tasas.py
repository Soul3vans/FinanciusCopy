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
    from django.db.models import Q
    try:
        principal = Moneda.objects.filter(
            Q(usuario=request.user, es_principal=True)
        ).first()
        if not principal:
            return Response({'error': 'No hay moneda principal'}, status=400)

        res = requests.get(API_URL.format(principal.simbolo), timeout=5)
        data = res.json()

        monedas = Moneda.objects.filter(
            usuario=request.user
        ).exclude(id=principal.id)

        actualizadas = []
        for moneda in monedas:
            tasa_api = data['rates'].get(moneda.simbolo)
            if tasa_api and tasa_api > 0:
                moneda.tasa_cambio = round(1 / tasa_api, 6)
                moneda.save()
                actualizadas.append({'simbolo': moneda.simbolo, 'tasa': moneda.tasa_cambio})

        return Response({'actualizadas': actualizadas, 'base': principal.simbolo})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monedas_mundo(request):
    try:
        res = requests.get(API_URL.format('USD'), timeout=5)
        data = res.json()
        monedas = [{'simbolo': k} for k in data['rates'].keys()]
        return Response(monedas)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
