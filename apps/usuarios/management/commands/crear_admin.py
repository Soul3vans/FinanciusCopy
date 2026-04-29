from django.core.management.base import BaseCommand
from usuarios.models import Usuario
import os

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        email = os.environ.get('ADMIN_EMAIL', 'admin@financius.com')
        password = os.environ.get('ADMIN_PASSWORD', '')
        if not Usuario.objects.filter(email=email).exists():
            Usuario.objects.create_superuser(
                email=email,
                password=password,
                nombre='Admin'
            )
            self.stdout.write(f'Superusuario {email} creado')
        else:
            self.stdout.write(f'Superusuario {email} ya existe')
