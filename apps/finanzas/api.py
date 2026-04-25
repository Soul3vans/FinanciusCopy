from rest_framework import viewsets, permissions
from .models import Moneda, Cuenta, Categoria, Transaccion
from .serializers import MonedaSerializer, CuentaSerializer, CategoriaSerializer, TransaccionSerializer

class BaseUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class MonedaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MonedaSerializer

    def get_queryset(self):
        from django.db.models import Q
        return Moneda.objects.filter(
            Q(usuario=self.request.user) | Q(usuario__isnull=True)
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class CuentaViewSet(BaseUserViewSet):
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer

class CategoriaViewSet(BaseUserViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class TransaccionViewSet(BaseUserViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer
