import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_acceso_sin_token():
    client = APIClient()
    res = client.get('/api/cuentas/')
    assert res.status_code == 401

@pytest.mark.django_db
def test_acceso_token_invalido():
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION='Bearer tokenfalso123')
    res = client.get('/api/cuentas/')
    assert res.status_code == 401

@pytest.mark.django_db
def test_logout_password_incorrecta():
    from usuarios.models import Usuario
    user = Usuario.objects.create_user(
        email='seg@test.com', password='Test1234', nombre='Seg'
    )
    client = APIClient()
    res = client.post('/api/token/', {
        'email': 'seg@test.com', 'password': 'Test1234'
    })
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    res = client.post('/api/logout/', {'password': 'wrongpassword'})
    assert res.status_code == 400
