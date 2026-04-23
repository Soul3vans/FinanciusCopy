from rest_framework import serializers
from .models import Moneda, Cuenta, Categoria, Transaccion

class MonedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moneda
        exclude = ['usuario']

class CuentaSerializer(serializers.ModelSerializer):
    moneda = MonedaSerializer(read_only=True)
    moneda_id = serializers.PrimaryKeyRelatedField(
        queryset=Moneda.objects.all(), source='moneda', write_only=True
    )
    class Meta:
        model = Cuenta
        exclude = ['usuario']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        exclude = ['usuario']

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        exclude = ['usuario']
