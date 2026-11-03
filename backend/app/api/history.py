from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
import datetime

from app.db.database import get_db
from app.db.models import GenerationHistory, Snippet

router = APIRouter(tags=["history_and_snippets"])

class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prompt: str
    requested_language: str
    detected_language: str
    code: str
    model_used: str
    tokens_generated: int
    duration_ms: float
    is_syntax_valid: bool
    retry_count: int
    created_at: datetime.datetime


class SnippetCreate(BaseModel):
    title: str = Field(..., min_length=1)
    prompt: Optional[str] = ""
    language: str
    code: str = Field(..., min_length=1)
    tags: Optional[str] = ""

class SnippetItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    prompt: Optional[str]
    language: str
    code: str
    tags: Optional[str]
    created_at: datetime.datetime
    updated_at: datetime.datetime


# History Endpoints
@router.get("/api/history", response_model=List[HistoryItem])
def list_history(
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(GenerationHistory)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                GenerationHistory.prompt.ilike(search_pattern),
                GenerationHistory.code.ilike(search_pattern),
                GenerationHistory.detected_language.ilike(search_pattern),
            )
        )
    return query.order_by(desc(GenerationHistory.created_at)).limit(limit).all()


@router.delete("/api/history/{id}")
def delete_history_item(id: int, db: Session = Depends(get_db)):
    item = db.query(GenerationHistory).filter(GenerationHistory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History entry not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": id}


@router.delete("/api/history")
def clear_all_history(db: Session = Depends(get_db)):
    db.query(GenerationHistory).delete()
    db.commit()
    return {"status": "cleared"}


# Snippet Endpoints
@router.get("/api/snippets", response_model=List[SnippetItem])
def list_snippets(
    q: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    query = db.query(Snippet)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Snippet.title.ilike(search_pattern),
                Snippet.code.ilike(search_pattern),
                Snippet.language.ilike(search_pattern),
                Snippet.tags.ilike(search_pattern),
            )
        )
    return query.order_by(desc(Snippet.updated_at)).all()


@router.post("/api/snippets", response_model=SnippetItem)
def create_snippet(snippet: SnippetCreate, db: Session = Depends(get_db)):
    item = Snippet(
        title=snippet.title.strip(),
        prompt=snippet.prompt.strip() if snippet.prompt else "",
        language=snippet.language.strip(),
        code=snippet.code.strip(),
        tags=snippet.tags.strip() if snippet.tags else "",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/api/snippets/{id}")
def delete_snippet(id: int, db: Session = Depends(get_db)):
    item = db.query(Snippet).filter(Snippet.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Snippet not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": id}
