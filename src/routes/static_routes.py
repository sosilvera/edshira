from fastapi import APIRouter
from fastapi.responses import FileResponse


router = APIRouter(prefix="/edshira")

@router.get("/")
async def read_root():
    return FileResponse("static/index.html")

@router.get("/backlog")
async def read_backlog():
    return FileResponse("static/backlog.html")