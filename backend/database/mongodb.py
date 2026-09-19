"""
Skill2Career MongoDB Async Client & Database Lifecycle
Implements connection management using PyMongo AsyncMongoClient and JSON serialization helpers.
"""

import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from backend.config import settings


class MongoDBManager:
    client: Optional[AsyncMongoClient] = None
    db: Optional[AsyncDatabase] = None
    loop: Optional[asyncio.AbstractEventLoop] = None


db_manager = MongoDBManager()


async def connect_to_mongo() -> AsyncDatabase:
    """Initializes AsyncMongoClient for the current event loop and verifies connection."""
    current_loop = asyncio.get_running_loop()
    if db_manager.client is None or db_manager.loop != current_loop:
        db_manager.client = AsyncMongoClient(settings.MONGODB_URI)
        db_manager.db = db_manager.client[settings.MONGODB_DATABASE]
        db_manager.loop = current_loop
        # Ping the server to verify connectivity
        await db_manager.client.admin.command("ping")
    return db_manager.db


async def close_mongo_connection():
    """Closes the AsyncMongoClient connection pool cleanly."""
    if db_manager.client is not None:
        try:
            await db_manager.client.close()
        except Exception:
            pass
        db_manager.client = None
        db_manager.db = None
        db_manager.loop = None


async def get_db() -> AsyncDatabase:
    """Dependency / accessor for getting the active async MongoDB database."""
    current_loop = asyncio.get_running_loop()
    if db_manager.db is None or db_manager.loop != current_loop:
        await connect_to_mongo()
    return db_manager.db


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Serializes a MongoDB document:
    - Converts `_id` ObjectId to string `id` and `_id`
    - Converts datetime objects to ISO-8601 strings or preserves datetimes
    - Recursively processes embedded lists and dictionaries
    """
    if doc is None:
        return None

    result = {}
    for key, val in doc.items():
        if key == "_id":
            str_id = str(val)
            result["id"] = str_id
            result["_id"] = str_id
        elif isinstance(val, ObjectId):
            result[key] = str(val)
        elif isinstance(val, dict):
            result[key] = serialize_doc(val)
        elif isinstance(val, list):
            result[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else (str(item) if isinstance(item, ObjectId) else item)
                for item in val
            ]
        else:
            result[key] = val

    # Ensure top-level 'id' exists if '_id' is present
    if "id" not in result and "_id" in result:
        result["id"] = str(result["_id"])

    return result


def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Serializes a list of MongoDB documents."""
    return [serialize_doc(d) for d in docs if d is not None]


def get_utc_now() -> datetime:
    """Helper returning current UTC datetime."""
    return datetime.now(timezone.utc)
