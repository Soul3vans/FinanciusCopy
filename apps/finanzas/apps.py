from django.apps import AppConfig


class FinanzasConfig(AppConfig):
    name = 'finanzas'

    def ready(self):
        import apps.finanzas.signals
