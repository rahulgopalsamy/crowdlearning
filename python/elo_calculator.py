import sys
from pymongo import MongoClient

MONGODB_URI = "mongodb://python:python@ds159662.mlab.com:59662/crowdlearning"
client = MongoClient(MONGODB_URI, connectTimeoutMS=300000)
db = client.get_default_database()
user = db.users.find({}, {"firstname": 1})
print user[0]["firstname"]
