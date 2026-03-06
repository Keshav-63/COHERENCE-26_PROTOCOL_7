"""
Cryptography Utilities
SSH key handling, signature verification, and hashing functions
"""

import base64
import hashlib
import secrets
from typing import Tuple, Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding, ed25519
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


def generate_invitation_hash() -> str:
    """
    Generate a secure random hash for invitation URLs

    Returns:
        64-character hexadecimal string
    """
    return secrets.token_hex(32)


def generate_temporary_password(length: int = 16) -> str:
    """
    Generate a secure temporary password

    Args:
        length: Length of password

    Returns:
        Secure random password
    """
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password_hash(password: str, hashed: str) -> bool:
    """
    Verify password against hash

    Args:
        password: Plain text password
        hashed: Hashed password

    Returns:
        True if password matches hash
    """
    return hash_password(password) == hashed


def get_public_key_fingerprint(public_key_pem: str) -> str:
    """
    Calculate fingerprint of a public key

    Args:
        public_key_pem: Public key in PEM format

    Returns:
        SHA256 fingerprint of the public key
    """
    try:
        # Parse the public key
        public_key = serialization.load_ssh_public_key(
            public_key_pem.encode(),
            backend=default_backend()
        )

        # Serialize to DER format
        public_der = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        # Calculate SHA256 hash
        fingerprint = hashlib.sha256(public_der).hexdigest()

        # Format as colon-separated pairs
        return ':'.join(fingerprint[i:i+2] for i in range(0, len(fingerprint), 2))

    except Exception as e:
        raise ValueError(f"Invalid public key format: {str(e)}")


def verify_signature(public_key_pem: str, message: str, signature_b64: str) -> bool:
    """
    Verify a signature using the public key

    Args:
        public_key_pem: Public key in SSH format
        message: Original message that was signed
        signature_b64: Base64 encoded signature

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Load public key
        public_key = serialization.load_ssh_public_key(
            public_key_pem.encode(),
            backend=default_backend()
        )

        # Decode signature from base64
        signature = base64.b64decode(signature_b64)

        # Convert message to bytes
        message_bytes = message.encode('utf-8')

        # Verify based on key type
        if isinstance(public_key, rsa.RSAPublicKey):
            # RSA signature verification
            public_key.verify(
                signature,
                message_bytes,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True

        elif isinstance(public_key, ed25519.Ed25519PublicKey):
            # Ed25519 signature verification
            public_key.verify(signature, message_bytes)
            return True

        else:
            raise ValueError("Unsupported key type")

    except InvalidSignature:
        return False
    except Exception as e:
        print(f"Signature verification error: {str(e)}")
        return False


def validate_ssh_public_key(public_key: str) -> Tuple[bool, Optional[str]]:
    """
    Validate if a string is a valid SSH public key

    Args:
        public_key: Public key string

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Try to parse as SSH public key
        serialization.load_ssh_public_key(
            public_key.encode(),
            backend=default_backend()
        )
        return True, None
    except Exception as e:
        return False, f"Invalid SSH public key: {str(e)}"


def generate_tenant_code(tenant_name: str) -> str:
    """
    Generate a unique tenant code from tenant name

    Args:
        tenant_name: Name of the tenant

    Returns:
        Unique tenant code
    """
    # Create base code from name
    base_code = ''.join(c for c in tenant_name.upper() if c.isalnum())[:10]

    # Add random suffix
    suffix = secrets.token_hex(4).upper()

    return f"{base_code}-{suffix}"
