from django.core.management.base import BaseCommand
from usuarios.models import Usuario
from django.contrib.sites.models import Site
from axes.models import AccessAttempt
import os

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Limpiar intentos fallidos
        AccessAttempt.objects.all().delete()
        self.stdout.write('Intentos fallidos limpiados')

        # Crear/actualizar Site
        domain = os.environ.get('ALLOWED_HOSTS', 'financiuscopy-production.up.railway.app').split(',')[0]
        Site.objects.update_or_create(
            id=1,
            defaults={'domain': domain, 'name': 'Financius'}
        )
        self.stdout.write(f'Site configurado: {domain}')

        # Crear superusuario
        email = os.environ.get('ADMIN_EMAIL') or os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@financius.com')
        password = os.environ.get('ADMIN_PASSWORD') or os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
        if not Usuario.objects.filter(email=email).exists():
            Usuario.objects.create_superuser(
                email=email, password=password, nombre='Admin'
            )
            self.stdout.write(f'Superusuario {email} creado')
        else:
            self.stdout.write(f'Superusuario {email} ya existe')

