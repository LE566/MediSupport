from config import db
from bson import ObjectId
users_collection = db["users"]

def create_user(user_data):
    return users_collection.insert_one(user_data)

def find_user_by_email(email):
    return users_collection.find_one({"email": email})

def getUsers():
    return users_collection.find()

def update_user_profile(user_id, update_data):
    
    return users_collection.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$set": update_data}
    )