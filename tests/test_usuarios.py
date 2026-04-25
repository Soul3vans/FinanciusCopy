import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from usuarios.models import Usuario

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def usuario():
    return Usuario.objects.create_user(
        email='test@test.com',
        password='Test1234',
        nombre='Test'
    )

@pytest.mark.django_db
def test_registro_exitoso(client):
    res = client.post('/api/registro/', {
        'email': 'nuevo@test.com',
        'password': 'Test1234',
        'nombre': 'Nuevo'
    })
    assert res.status_code == 201

@pytest.mark.django_db
def test_registro_email_duplicado(client, usuario):
    res = client.post('/api/registro/', {
        'email': 'test@test.com',
        'password': 'Test1234',
        'nombre': 'Otro'
    })
    assert res.status_code == 400

@pytest.mark.django_db
def test_login_exitoso(client, usuario):
    res = client.post('/api/token/', {
        'email': 'test@test.com',
        'password': 'Test1234'
    })
    assert res.status_code == 200
    assert 'access' in res.data

@pytest.mark.django_db
def test_login_fallido(client):
    res = client.post('/api/token/', {
        'email': 'test@test.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
