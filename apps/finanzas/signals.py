import signal
import atexit
from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver
from pathlib import Path
from .db_crypto import cifrar_db, limpiar_db_temporal

def obtener_ruta_mmb(user):
    from django.conf import settings
    return Path(settings.MEDIA_ROOT) / f'db_{user.pk}.mmb'

@receiver(user_logged_out)
def cifrar_al_salir(sender, request, user, **kwargs):
    if user:
        password = request.session.get('db_password')
        if password:
            cifrar_db(password, obtener_ruta_mmb(user))
            limpiar_db_temporal()
            del request.session['db_password']

# Protección ante cierre inesperado
def _manejador_señal(signum, frame):
    limpiar_db_temporal()
    exit(0)

signal.signal(signal.SIGTERM, _manejador_señal)
atexit.register(limpiar_db_temporal)
