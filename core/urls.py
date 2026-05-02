"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from finanzas.api import MonedaViewSet, CuentaViewSet, CategoriaViewSet, TransaccionViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.usuarios import views as usuarios_views
from finanzas import views_tasas
from django.views.generic import TemplateView
from django.conf import settings

router = DefaultRouter()
router.register(r'monedas', MonedaViewSet, basename='moneda')
router.register(r'cuentas', CuentaViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'transacciones', TransaccionViewSet)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API
    path('api/', include(router.urls)),
    path('api/registro/', usuarios_views.registro_view, name='registro'),
    path('api/logout/', usuarios_views.logout_view, name='api_logout'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/tasa/', views_tasas.obtener_tasa, name='obtener_tasa'),
    path('api/tasas/actualizar/', views_tasas.actualizar_todas_tasas, name='actualizar_tasas'),
    path('api/monedas-mundo/', views_tasas.monedas_mundo, name='monedas_mundo'),
    path('api/oauth-token/', usuarios_views.oauth_token, name='oauth_token'),
    path('api/oauth-redirect/', usuarios_views.oauth_redirect, name='oauth_redirect'),

    # OAuth allauth
    path('accounts/', include('allauth.urls')),

    # React SPA - captura todo lo demás
    path('', TemplateView.as_view(template_name='frontend/index.html')),
    path('<path:path>', TemplateView.as_view(template_name='frontend/index.html')),
]
