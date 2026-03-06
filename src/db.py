from pymongo import MongoClient
from config import MONGO_URI, DB_NAME, DEPARTMENTS_COLLECTION, TRANSACTIONS_COLLECTION, REALLOCATION_COLLECTION

client = MongoClient(MONGO_URI)

db = client[DB_NAME]

departments = db[DEPARTMENTS_COLLECTION]
transactions = db[TRANSACTIONS_COLLECTION]
reallocation_transactions = db[REALLOCATION_COLLECTION]