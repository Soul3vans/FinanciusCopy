from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import Moneda, Cuenta, Transaccion, Categoria
from django.utils import timezone

# ─── MONEDAS ───────────────────────────────────────

@login_required
def lista_monedas(request):
    monedas = Moneda.objects.filter(usuario=request.user)
    return render(request, 'finanzas/lista_monedas.html', {'monedas': monedas})

@login_required
def crear_moneda(request):
    if request.method == 'POST':
        Moneda.objects.create(
            usuario=request.user,
            simbolo=request.POST.get('simbolo'),
            es_principal=request.POST.get('es_principal') == 'on',
            separador_millares=request.POST.get('separador_millares'),
            separador_decimal=request.POST.get('separador_decimal'),
            decimales=int(request.POST.get('decimales')),
            formato=request.POST.get('formato'),
            tasa_cambio=float(request.POST.get('tasa_cambio', 1.0)),
        )
        return redirect('lista_monedas')
    return render(request, 'finanzas/form_moneda.html')

@login_required
def editar_moneda(request, pk):
    moneda = get_object_or_404(Moneda, pk=pk, usuario=request.user)
    if request.method == 'POST':
        moneda.simbolo = request.POST.get('simbolo')
        moneda.es_principal = request.POST.get('es_principal') == 'on'
        moneda.separador_millares = request.POST.get('separador_millares')
        moneda.separador_decimal = request.POST.get('separador_decimal')
        moneda.decimales = int(request.POST.get('decimales'))
        moneda.formato = request.POST.get('formato')
        moneda.tasa_cambio = float(request.POST.get('tasa_cambio', 1.0))
        moneda.save()
        return redirect('lista_monedas')
    return render(request, 'finanzas/form_moneda.html', {'moneda': moneda})

@login_required
def eliminar_moneda(request, pk):
    moneda = get_object_or_404(Moneda, pk=pk, usuario=request.user)
    if request.method == 'POST':
        moneda.delete()
        return redirect('lista_monedas')
    return render(request, 'finanzas/confirmar_eliminar.html', {'objeto': moneda})


# ─── CUENTAS ───────────────────────────────────────

@login_required
def lista_cuentas(request):
    cuentas = Cuenta.objects.filter(usuario=request.user)
    return render(request, 'finanzas/lista_cuentas.html', {'cuentas': cuentas})

@login_required
def crear_cuenta(request):
    monedas = Moneda.objects.filter(usuario=request.user)
    if request.method == 'POST':
        Cuenta.objects.create(
            usuario=request.user,
            titulo=request.POST.get('titulo'),
            moneda_id=request.POST.get('moneda'),
            balance=float(request.POST.get('balance', 0)),
            incluir_en_totales=request.POST.get('incluir_en_totales') == 'on',
            mostrar_en_seleccion=request.POST.get('mostrar_en_seleccion') == 'on',
            nota=request.POST.get('nota'),
        )
        return redirect('lista_cuentas')
    return render(request, 'finanzas/form_cuenta.html', {'monedas': monedas})

@login_required
def editar_cuenta(request, pk):
    cuenta = get_object_or_404(Cuenta, pk=pk, usuario=request.user)
    monedas = Moneda.objects.filter(usuario=request.user)
    if request.method == 'POST':
        cuenta.titulo = request.POST.get('titulo')
        cuenta.moneda_id = request.POST.get('moneda')
        cuenta.balance = float(request.POST.get('balance', 0))
        cuenta.incluir_en_totales = request.POST.get('incluir_en_totales') == 'on'
        cuenta.mostrar_en_seleccion = request.POST.get('mostrar_en_seleccion') == 'on'
        cuenta.nota = request.POST.get('nota')
        cuenta.save()
        return redirect('lista_cuentas')
    return render(request, 'finanzas/form_cuenta.html', {'cuenta': cuenta, 'monedas': monedas})

@login_required
def eliminar_cuenta(request, pk):
    cuenta = get_object_or_404(Cuenta, pk=pk, usuario=request.user)
    if request.method == 'POST':
        cuenta.delete()
        return redirect('lista_cuentas')
    return render(request, 'finanzas/confirmar_eliminar.html', {'objeto': cuenta})

# ─── TRANSACCIONES ─────────────────────────────────

@login_required
def lista_transacciones(request):
    transacciones = Transaccion.objects.filter(
        usuario=request.user
    ).order_by('-fecha', '-hora')
    return render(request, 'finanzas/lista_transacciones.html', {'transacciones': transacciones})

@login_required
def crear_transaccion(request):
    cuentas = Cuenta.objects.filter(usuario=request.user, mostrar_en_seleccion=True)
    categorias = Categoria.objects.filter(usuario=request.user)
    hoy = timezone.now()

    if request.method == 'POST':
        tipo = request.POST.get('tipo')
        monto = float(request.POST.get('monto', 0))
        tasa = request.POST.get('tasa_cambio')
        cuenta_origen_id = request.POST.get('cuenta_origen')
        cuenta_destino_id = request.POST.get('cuenta_destino')

        transaccion = Transaccion.objects.create(
            usuario=request.user,
            tipo=tipo,
            fecha=request.POST.get('fecha'),
            hora=request.POST.get('hora'),
            cuenta_origen_id=cuenta_origen_id,
            cuenta_destino_id=cuenta_destino_id if tipo == 'transferencia' else None,
            categoria_id=request.POST.get('categoria') if tipo != 'transferencia' else None,
            monto=monto,
            tasa_cambio=float(tasa) if tasa else None,
            monto_destino=float(request.POST.get('monto_destino', 0)) if tipo == 'transferencia' else None,
            nota=request.POST.get('nota'),
            confirmada=request.POST.get('confirmada') == 'on',
            incluir_en_informes=request.POST.get('incluir_en_informes') == 'on',
        )

        # Actualizar balance de cuentas
        cuenta_origen = Cuenta.objects.get(pk=cuenta_origen_id)
        if tipo == 'gasto' or tipo == 'transferencia':
            cuenta_origen.balance -= monto
        elif tipo == 'ingreso':
            cuenta_origen.balance += monto
        cuenta_origen.save()

        if tipo == 'transferencia' and cuenta_destino_id:
            cuenta_destino = Cuenta.objects.get(pk=cuenta_destino_id)
            cuenta_destino.balance += transaccion.monto_destino
            cuenta_destino.save()

        return redirect('lista_transacciones')

    return render(request, 'finanzas/form_transaccion.html', {
        'cuentas': cuentas,
        'categorias': categorias,
        'hoy': hoy,
    })

@login_required
def editar_transaccion(request, pk):
    transaccion = get_object_or_404(Transaccion, pk=pk, usuario=request.user)
    cuentas = Cuenta.objects.filter(usuario=request.user, mostrar_en_seleccion=True)
    categorias = Categoria.objects.filter(usuario=request.user)

    if request.method == 'POST':
        # Revertir balance anterior
        cuenta_origen = transaccion.cuenta_origen
        if transaccion.tipo == 'gasto' or transaccion.tipo == 'transferencia':
            cuenta_origen.balance += transaccion.monto
        elif transaccion.tipo == 'ingreso':
            cuenta_origen.balance -= transaccion.monto
        cuenta_origen.save()

        if transaccion.tipo == 'transferencia' and transaccion.cuenta_destino:
            transaccion.cuenta_destino.balance -= transaccion.monto_destino
            transaccion.cuenta_destino.save()

        # Aplicar nuevos valores
        tipo = request.POST.get('tipo')
        monto = float(request.POST.get('monto', 0))
        tasa = request.POST.get('tasa_cambio')
        cuenta_origen_id = request.POST.get('cuenta_origen')
        cuenta_destino_id = request.POST.get('cuenta_destino')

        transaccion.tipo = tipo
        transaccion.fecha = request.POST.get('fecha')
        transaccion.hora = request.POST.get('hora')
        transaccion.cuenta_origen_id = cuenta_origen_id
        transaccion.cuenta_destino_id = cuenta_destino_id if tipo == 'transferencia' else None
        transaccion.categoria_id = request.POST.get('categoria') if tipo != 'transferencia' else None
        transaccion.monto = monto
        transaccion.tasa_cambio = float(tasa) if tasa else None
        transaccion.monto_destino = float(request.POST.get('monto_destino', 0)) if tipo == 'transferencia' else None
        transaccion.nota = request.POST.get('nota')
        transaccion.confirmada = request.POST.get('confirmada') == 'on'
        transaccion.incluir_en_informes = request.POST.get('incluir_en_informes') == 'on'
        transaccion.save()

        # Aplicar nuevo balance
        nueva_cuenta_origen = Cuenta.objects.get(pk=cuenta_origen_id)
        if tipo == 'gasto' or tipo == 'transferencia':
            nueva_cuenta_origen.balance -= monto
        elif tipo == 'ingreso':
            nueva_cuenta_origen.balance += monto
        nueva_cuenta_origen.save()

        if tipo == 'transferencia' and cuenta_destino_id:
            nueva_cuenta_destino = Cuenta.objects.get(pk=cuenta_destino_id)
            nueva_cuenta_destino.balance += transaccion.monto_destino
            nueva_cuenta_destino.save()

        return redirect('lista_transacciones')

    return render(request, 'finanzas/form_transaccion.html', {
        'transaccion': transaccion,
        'cuentas': cuentas,
        'categorias': categorias,
    })

@login_required
def eliminar_transaccion(request, pk):
    transaccion = get_object_or_404(Transaccion, pk=pk, usuario=request.user)
    if request.method == 'POST':
        # Revertir balance
        cuenta_origen = transaccion.cuenta_origen
        if transaccion.tipo == 'gasto' or transaccion.tipo == 'transferencia':
            cuenta_origen.balance += transaccion.monto
        elif transaccion.tipo == 'ingreso':
            cuenta_origen.balance -= transaccion.monto
        cuenta_origen.save()

        if transaccion.tipo == 'transferencia' and transaccion.cuenta_destino:
            transaccion.cuenta_destino.balance -= transaccion.monto_destino
            transaccion.cuenta_destino.save()

        transaccion.delete()
        return redirect('lista_transacciones')
    return render(request, 'finanzas/confirmar_eliminar.html', {'objeto': transaccion})

# ─── API: tasa de cambio en tiempo real ────────────

@login_required
def tasa_cambio_api(request):
    moneda_origen = request.GET.get('origen')
    moneda_destino = request.GET.get('destino')
    origen = get_object_or_404(Moneda, simbolo=moneda_origen, usuario=request.user)
    destino = get_object_or_404(Moneda, simbolo=moneda_destino, usuario=request.user)
    tasa = destino.tasa_cambio / origen.tasa_cambio
    return JsonResponse({'tasa': tasa})
