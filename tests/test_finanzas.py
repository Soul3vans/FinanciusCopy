import pytest
from rest_framework.test import APIClient
from usuarios.models import Usuario
from finanzas.models import Moneda, Cuenta, Categoria, Transaccion

@pytest.fixture
def client_auth():
    user = Usuario.objects.create_user(
        email='fin@test.com',
        password='Test1234',
        nombre='Fin'
    )
    client = APIClient()
    res = client.post('/api/token/', {
        'email': 'fin@test.com',
        'password': 'Test1234'
    })
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return client, user

@pytest.mark.django_db
def test_crear_moneda(client_auth):
    client, user = client_auth
    res = client.post('/api/monedas/', {
        'simbolo': 'USD',
        'es_principal': True,
        'separador_millares': ',',
        'separador_decimal': '.',
        'decimales': 2,
        'formato': '0 S',
        'tasa_cambio': 1.0
    })
    assert res.status_code == 201

@pytest.mark.django_db
def test_crear_cuenta(client_auth):
    client, user = client_auth
    moneda = Moneda.objects.create(
        usuario=user, simbolo='CLP',
        separador_millares=',', separador_decimal='.',
        decimales=0, formato='0 S', tasa_cambio=1.0
    )
    res = client.post('/api/cuentas/', {
        'titulo': 'Efectivo',
        'moneda_id': moneda.pk,
        'balance': 1000,
        'incluir_en_totales': True,
        'mostrar_en_seleccion': True,
    })
    assert res.status_code == 201

@pytest.mark.django_db
def test_usuario_solo_ve_sus_datos(client_auth):
    client, user = client_auth
    # Crear otro usuario con su moneda
    otro = Usuario.objects.create_user(
        email='otro@test.com', password='Test1234', nombre='Otro'
    )
    Moneda.objects.create(
        usuario=otro, simbolo='EUR',
        separador_millares=',', separador_decimal='.',
        decimales=2, formato='0 S', tasa_cambio=1.0
    )
    res = client.get('/api/monedas/')
    # No debe ver la moneda del otro usuario
    simbolos = [m['simbolo'] for m in res.data]
    assert 'EUR' not in simbolos
