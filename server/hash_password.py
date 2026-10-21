
from getpass import getpass
from pwdlib import PasswordHash

password = getpass("Enter your admin password: ")

if len(password) < 12:
    raise ValueError("Use a password with at least 12 characters.")

password_hash = PasswordHash.recommended().hash(password)

print("\nYour password hash is:\n")
print(password_hash)
