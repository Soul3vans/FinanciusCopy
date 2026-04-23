import os
import json
from django.conf import settings

SESIONES_FILE = os.path.join(settings.BASE_DIR, '.sesiones_activas.json')

def registrar_sesion(session_key: str, ruta_tmp: str, ruta_mmb: str):
    sesiones = _leer()
    sesiones[session_key] = {
        'ruta_tmp': ruta_tmp,
        'ruta_mmb': ruta_mmb,
    }
    _guardar(sesiones)

def obtener_sesion(session_key: str) -> dict:
    return _leer().get(session_key, {})

def eliminar_sesion(session_key: str):
    sesiones = _leer()
    sesiones.pop(session_key, None)
    _guardar(sesiones)

def limpiar_sesiones_huerfanas():
    """Llamar al arrancar Django para cifrar BDs de sesiones muertas"""
    from .crypto import cifrar_bd, limpiar_bd_temporal
    sesiones = _leer()
    for key, datos in list(sesiones.items()):
        ruta_tmp = datos.get('ruta_tmp')
        ruta_mmb = datos.get('ruta_mmb')
        if ruta_tmp and os.path.exists(ruta_tmp):
            # No podemos cifrar sin contraseña, solo eliminamos
            limpiar_bd_temporal(ruta_tmp)
        eliminar_sesion(key)

def _leer() -> dict:
    if not os.path.exists(SESIONES_FILE):
        return {}
    with open(SESIONES_FILE, 'r') as f:
        return json.load(f)

def _guardar(data: dict):
    with open(SESIONES_FILE, 'w') as f:
        json.dump(data, f)
