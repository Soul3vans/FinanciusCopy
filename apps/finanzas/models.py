from django.db import models
from django.conf import settings


class Moneda(models.Model):
    SEPARADOR_MILLARES = [
        (',', 'Coma ,'),
        ('.', 'Punto .'),
        (' ', 'Espacio'),
        ('', 'Vacío'),
    ]
    SEPARADOR_DECIMAL = [
        ('.', 'Punto .'),
        (',', 'Coma ,'),
        (' ', 'Espacio'),
    ]
    FORMATO_CHOICES = [
        ('0 S', '0 S'),
        ('0S', '0S'),
        ('S 0', 'S 0'),
        ('S0', 'S0'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    simbolo = models.CharField(max_length=10)  # CUP, USD, CLP
    es_principal = models.BooleanField(default=False)
    separador_millares = models.CharField(max_length=2, choices=SEPARADOR_MILLARES, default=',')
    separador_decimal = models.CharField(max_length=2, choices=SEPARADOR_DECIMAL, default='.')
    decimales = models.IntegerField(default=2)  # 0, 1, 2
    formato = models.CharField(max_length=5, choices=FORMATO_CHOICES, default='0 S')
    tasa_cambio = models.FloatField(default=1.0)

    def save(self, *args, **kwargs):
        # Solo una moneda principal por usuario
        if self.es_principal:
            Moneda.objects.filter(usuario=self.usuario, es_principal=True).update(es_principal=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.simbolo

class Cuenta(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    moneda = models.ForeignKey(Moneda, on_delete=models.PROTECT)
    balance = models.FloatField(default=0.0)
    incluir_en_totales = models.BooleanField(default=True)
    mostrar_en_seleccion = models.BooleanField(default=True)
    nota = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.titulo} ({self.moneda})"

class Categoria(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#000000')  # hex
    padre = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='subcategorias'
    )

    def __str__(self):
        return f"{self.padre.nombre} > {self.nombre}" if self.padre else self.nombre

class Transaccion(models.Model):
    TIPO_CHOICES = [
        ('gasto', 'Gasto'),
        ('ingreso', 'Ingreso'),
        ('transferencia', 'Transferencia'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    fecha = models.DateField()
    hora = models.TimeField()
    cuenta_origen = models.ForeignKey(
        Cuenta, on_delete=models.PROTECT,
        related_name='transacciones_origen'
    )
    cuenta_destino = models.ForeignKey(
        Cuenta, on_delete=models.PROTECT,
        related_name='transacciones_destino',
        null=True, blank=True  # solo para transferencias
    )
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT,
        null=True, blank=True  # no aplica en transferencias
    )
    monto = models.FloatField()
    tasa_cambio = models.FloatField(null=True, blank=True)  # para transferencias
    monto_destino = models.FloatField(null=True, blank=True)  # monto convertido
    nota = models.TextField(blank=True, null=True)
    confirmada = models.BooleanField(default=True)
    incluir_en_informes = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tipo} - {self.monto} ({self.fecha})"

