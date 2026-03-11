import os
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["medisupport"]

def hash_password(password):
    # Hashea y lo convierte a string para guardarlo limpio en Mongo
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    # Se asegura de que ambos sean bytes antes de comparar
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))