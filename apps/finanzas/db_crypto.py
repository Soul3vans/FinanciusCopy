import os
import shutil
import signal
import sqlite3
from pathlib import Path
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import base64

DB_ACTIVA = Path('/tmp/finanzas_activa.sqlite3')
SALT_SIZE = 16
NONCE_SIZE = 12
ITERATIONS = 390000

def derivar_clave(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
        backend=default_backend()
    )
    return kdf.derive(password.encode())

def cifrar_db(password: str, ruta_mmb: Path):
    """Cifra DB activa → .mmb usando escritura atómica"""
    if not DB_ACTIVA.exists():
        return

    salt = os.urandom(SALT_SIZE)
    nonce = os.urandom(NONCE_SIZE)
    clave = derivar_clave(password, salt)
    aesgcm = AESGCM(clave)

    datos = DB_ACTIVA.read_bytes()
    cifrado = aesgcm.encrypt(nonce, datos, None)

    tmp = ruta_mmb.with_suffix('.mmb.tmp')
    with open(tmp, 'wb') as f:
        f.write(salt + nonce + cifrado)

    # Escritura atómica - solo reemplaza si todo fue exitoso
    os.replace(tmp, ruta_mmb)

def descifrar_db(password: str, ruta_mmb: Path) -> bool:
    """Descifra .mmb → DB activa temporal"""
    try:
        datos = ruta_mmb.read_bytes()
        salt = datos[:SALT_SIZE]
        nonce = datos[SALT_SIZE:SALT_SIZE + NONCE_SIZE]
        cifrado = datos[SALT_SIZE + NONCE_SIZE:]

        clave = derivar_clave(password, salt)
        aesgcm = AESGCM(clave)
        descifrado = aesgcm.decrypt(nonce, cifrado, None)

        DB_ACTIVA.write_bytes(descifrado)
        return True
    except Exception:
        return False  # Contraseña incorrecta o archivo corrupto

def crear_db_nueva(password: str, ruta_mmb: Path):
    """Crea una BD vacía y la cifra como .mmb"""
    conn = sqlite3.connect(DB_ACTIVA)
    conn.close()
    cifrar_db(password, ruta_mmb)

def limpiar_db_temporal():
    """Elimina la BD temporal de forma segura"""
    if DB_ACTIVA.exists():
        # Sobreescribir con ceros antes de eliminar
        size = DB_ACTIVA.stat().st_size
        with open(DB_ACTIVA, 'wb') as f:
            f.write(b'\x00' * size)
        DB_ACTIVA.unlink()
