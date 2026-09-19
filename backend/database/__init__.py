"""
Skill2Career Database Package
Exports async MongoDB database connection utilities and helpers.
"""

from backend.database.mongodb import (
    connect_to_mongo,
    close_mongo_connection,
    get_db,
    serialize_doc,
    serialize_docs,
    get_utc_now,
    db_manager
)

__all__ = [
    "connect_to_mongo",
    "close_mongo_connection",
    "get_db",
    "serialize_doc",
    "serialize_docs",
    "get_utc_now",
    "db_manager"
]
