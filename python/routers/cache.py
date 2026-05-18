from __future__ import annotations

from fastapi import APIRouter

from cache.memory_store import store
from schemas import CacheDeleteResponse


router = APIRouter(prefix="/cache", tags=["cache"])


@router.delete("/{song_id}", response_model=CacheDeleteResponse)
async def delete_song_cache(song_id: str) -> CacheDeleteResponse:
    deleted = store.delete_song(song_id)
    return CacheDeleteResponse(song_id=song_id, deleted=deleted)
