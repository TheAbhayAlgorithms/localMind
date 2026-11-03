from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from app.db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    requested_language = Column(String(50), default="Auto")
    detected_language = Column(String(50), default="")
    code = Column(Text, nullable=False)
    model_used = Column(String(100), nullable=False)
    tokens_generated = Column(Integer, default=0)
    duration_ms = Column(Float, default=0.0)
    is_syntax_valid = Column(Boolean, default=True)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

class Snippet(Base):
    __tablename__ = "snippets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    prompt = Column(Text, nullable=True)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    tags = Column(String(255), default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class UserSetting(Base):
    __tablename__ = "user_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
