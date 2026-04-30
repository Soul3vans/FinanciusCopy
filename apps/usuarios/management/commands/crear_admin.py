from django.core.management.base import BaseCommand
from usuarios.models import Usuario
from django.contrib.sites.models import Site
import os

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Crear/actualizar Site
        domain = os.environ.get('ALLOWED_HOSTS', 'financiuscopy-production.up.railway.app').split(',')[0]
        site, _ = Site.objects.update_or_create(
            id=1,
            defaults={'domain': domain, 'name': 'Financius'}
        )
        self.stdout.write(f'Site configurado: {domain}')

        # Crear superusuario
        email = os.environ.get('ADMIN_EMAIL', 'admin@financius.com')
        password = os.environ.get('ADMIN_PASSWORD', '')
        if not Usuario.objects.filter(email=email).exists():
            Usuario.objects.create_superuser(
                email=email, password=password, nombre='Admin'
            )
            self.stdout.write(f'Superusuario {email} creado')
        else:
            self.stdout.write(f'Superusuario {email} ya existe')

