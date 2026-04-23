import os
import hmac
import hashlib
import tempfile
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

SALT_SIZE = 16
NONCE_SIZE = 12
ITERATIONS = 600_000

def derivar_clave(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
    )
    return kdf.derive(password.encode())

def cifrar_bd(password: str, ruta_mmb: Path) -> bool:
    try:
        if not DB_ACTIVA.exists():
            return False
        salt = os.urandom(SALT_SIZE)
        nonce = os.urandom(NONCE_SIZE)
        clave = derivar_clave(password, salt)
        aesgcm = AESGCM(clave)
        datos = DB_ACTIVA.read_bytes()
        cifrado = aesgcm.encrypt(nonce, datos, None)
        tmp = ruta_mmb.with_suffix('.mmb.tmp')
        with open(tmp, 'wb') as f:
            f.write(salt + nonce + cifrado)
        os.replace(tmp, ruta_mmb)
        return True
    except Exception:
        return False

def descifrar_bd(ruta_mmb: str, password: str) -> str:
    """Descifra .mmb → archivo SQLite temporal, retorna su ruta"""
    with open(ruta_mmb, 'rb') as f:
        contenido = f.read()

    salt = contenido[:SALT_SIZE]
    nonce = contenido[SALT_SIZE:SALT_SIZE + NONCE_SIZE]
    cifrado = contenido[SALT_SIZE + NONCE_SIZE:]

    clave = derivar_clave(password, salt)
    aesgcm = AESGCM(clave)

    try:
        datos = aesgcm.decrypt(nonce, cifrado, None)
    except Exception:
        raise ValueError("Contraseña incorrecta o archivo corrupto")

    # BD temporal con nombre aleatorio en /tmp
    tmp = tempfile.NamedTemporaryFile(
        suffix='.sqlite3', delete=False, dir='/tmp'
    )
    tmp.write(datos)
    tmp.close()
    return tmp.name

def limpiar_bd_temporal(ruta_tmp: str):
    """Elimina BD temporal de forma segura"""
    if ruta_tmp and os.path.exists(ruta_tmp):
        # Sobreescribir antes de eliminar
        size = os.path.getsize(ruta_tmp)
        with open(ruta_tmp, 'wb') as f:
            f.write(os.urandom(size))
        os.remove(ruta_tmp)
