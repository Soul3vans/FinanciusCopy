from django.urls import path
from . import views, views_tasas

urlpatterns = [
    # Monedas
    path('monedas/', views.lista_monedas, name='lista_monedas'),
    path('monedas/crear/', views.crear_moneda, name='crear_moneda'),
    path('monedas/<int:pk>/editar/', views.editar_moneda, name='editar_moneda'),
    path('monedas/<int:pk>/eliminar/', views.eliminar_moneda, name='eliminar_moneda'),
    # Cuentas
    path('cuentas/', views.lista_cuentas, name='lista_cuentas'),
    path('cuentas/crear/', views.crear_cuenta, name='crear_cuenta'),
    path('cuentas/<int:pk>/editar/', views.editar_cuenta, name='editar_cuenta'),
    path('cuentas/<int:pk>/eliminar/', views.eliminar_cuenta, name='eliminar_cuenta'),
    # Transacciones
    path('transacciones/', views.lista_transacciones, name='lista_transacciones'),
    path('transacciones/crear/', views.crear_transaccion, name='crear_transaccion'),
    path('transacciones/<int:pk>/editar/', views.editar_transaccion, name='editar_transaccion'),
    path('transacciones/<int:pk>/eliminar/', views.eliminar_transaccion, name='eliminar_transaccion'),
    # Apis
    path('api/tasa-cambio/', views.tasa_cambio_api, name='tasa_cambio_api'),
    path('api/tasa/', views_tasas.obtener_tasa, name='obtener_tasa'),
    path('api/tasas/actualizar/', views_tasas.actualizar_todas_tasas, name='actualizar_tasas'),

]

