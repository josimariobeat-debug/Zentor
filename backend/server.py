from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File, Response
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import uuid
import subprocess
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'zentor-dev-secret-change-me')
JWT_ALG = 'HS256'
JWT_TTL = timedelta(days=30)

app = FastAPI()
api = APIRouter(prefix="/api")
log = logging.getLogger('zentor')

# -------- Helpers --------
def _utcnow():
    return datetime.now(timezone.utc)

def _make_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": _utcnow() + JWT_TTL}, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(' ', 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def _initials(name: str) -> str:
    parts = [p for p in name.strip().split() if p]
    if not parts:
        return "U"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()

def _public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "initials": u.get("initials") or _initials(u["name"]),
    }

# -------- Catalog (server-seeded) --------
CATALOG = [
    {"id": "stories-videos", "name": "Stories Vídeos", "type": "SCRIPT EXTERNO",
     "description": "Crie e gerencie stories e vídeos com player flutuante e carrossel na sua loja.",
     "price": "R$ 29,90/mês", "plan": "Mensal", "price_value": "R$ 29,90"},
    {"id": "avaliacoes-pro", "name": "Avaliações Pro", "type": "SCRIPT EXTERNO",
     "description": "Colete e exiba avaliações verificadas dos seus clientes com fotos e vídeos.",
     "price": "R$ 19,90/mês", "plan": "Mensal", "price_value": "R$ 19,90"},
    {"id": "popup-conversao", "name": "Pop-up de Conversão", "type": "SCRIPT EXTERNO",
     "description": "Pop-ups inteligentes baseados em comportamento para aumentar conversão.",
     "price": "R$ 14,90/mês", "plan": "Mensal", "price_value": "R$ 14,90"},
    {"id": "frete-tempo-real", "name": "Frete em Tempo Real", "type": "INTEGRAÇÃO",
     "description": "Calcule fretes em tempo real direto na página do produto.",
     "price": "R$ 24,90/mês", "plan": "Mensal", "price_value": "R$ 24,90"},
    {"id": "whatsapp-button", "name": "WhatsApp Button", "type": "SCRIPT EXTERNO",
     "description": "Botão flutuante de WhatsApp com mensagens personalizadas por página.",
     "price": "Grátis", "plan": "Gratuito", "price_value": "R$ 0,00"},
    {"id": "timer-promo", "name": "Timer Promocional", "type": "SCRIPT EXTERNO",
     "description": "Contador regressivo para criar urgência em promoções e lançamentos.",
     "price": "R$ 9,90/mês", "plan": "Mensal", "price_value": "R$ 9,90"},
]
CATALOG_BY_ID = {c["id"]: c for c in CATALOG}

# -------- Models --------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileIn(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class MediaItem(BaseModel):
    url: str
    type: str = "image"
    name: Optional[str] = None
    cover: bool = False
    poster: Optional[str] = None

class UrlRule(BaseModel):
    value: str
    type: Literal["contem", "exato", "todas"] = "contem"
    ignore_params: bool = False

class StoryIn(BaseModel):
    app_id: str
    title: str
    format: str = "vertical"
    scroll: str = "auto"
    active: bool = True
    cta: str = ""
    media: List[MediaItem] = []
    urls: List[UrlRule] = []

class FeedbackIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = ""

# -------- Auth --------
@api.post("/auth/register")
async def register(body: RegisterIn):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(400, "E-mail já cadastrado")
    uid = str(uuid.uuid4())
    pwd_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "id": uid, "name": body.name, "email": body.email.lower(),
        "password_hash": pwd_hash, "initials": _initials(body.name),
        "created_at": _utcnow().isoformat(),
    }
    await db.users.insert_one(user)
    # auto-install stories-videos for new accounts (matches the original demo)
    await db.installed_apps.insert_one({
        "id": str(uuid.uuid4()), "user_id": uid, "app_id": "stories-videos",
        "installed_at": _utcnow().isoformat(),
        "expires_at": (_utcnow() + timedelta(days=7)).isoformat(),
    })
    await db.subscriptions.insert_one({
        "id": str(uuid.uuid4()), "user_id": uid, "app_id": "stories-videos",
        "plan": "Mensal", "price": "R$ 29,90",
        "next_billing": (_utcnow() + timedelta(days=7)).strftime("%d/%m/%Y"),
        "status": "ativa",
    })
    return {"token": _make_token(uid), "user": _public_user(user)}

@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Credenciais inválidas")
    return {"token": _make_token(user["id"]), "user": _public_user(user)}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return {"user": _public_user(user)}

# -------- Profile --------
@api.put("/profile")
async def update_profile(body: ProfileIn, user=Depends(get_current_user)):
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if "name" in updates:
        updates["initials"] = _initials(updates["name"])
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    new = await db.users.find_one({"id": user["id"]})
    return {"user": _public_user(new)}

# -------- Apps --------
@api.get("/apps/catalog")
async def apps_catalog(user=Depends(get_current_user)):
    installed_ids = {x["app_id"] async for x in db.installed_apps.find({"user_id": user["id"]})}
    out = []
    for c in CATALOG:
        out.append({**{k: c[k] for k in ["id","name","type","description","price"]}, "installed": c["id"] in installed_ids})
    return out

@api.get("/apps/installed")
async def apps_installed(user=Depends(get_current_user)):
    items = await db.installed_apps.find({"user_id": user["id"]}).to_list(500)
    out = []
    now = _utcnow()
    for it in items:
        c = CATALOG_BY_ID.get(it["app_id"])
        if not c:
            continue
        try:
            exp = datetime.fromisoformat(it["expires_at"])
            days = max(0, (exp - now).days)
        except Exception:
            days = 0
        out.append({
            "id": c["id"], "name": c["name"], "type": c["type"],
            "description": c["description"], "status": "ativa",
            "expiresInDays": days,
        })
    return out

@api.post("/apps/install/{app_id}")
async def install_app(app_id: str, user=Depends(get_current_user)):
    if app_id not in CATALOG_BY_ID:
        raise HTTPException(404, "App não encontrado")
    existing = await db.installed_apps.find_one({"user_id": user["id"], "app_id": app_id})
    if existing:
        return {"ok": True, "already": True}
    await db.installed_apps.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "app_id": app_id,
        "installed_at": _utcnow().isoformat(),
        "expires_at": (_utcnow() + timedelta(days=7)).isoformat(),
    })
    c = CATALOG_BY_ID[app_id]
    await db.subscriptions.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "app_id": app_id,
        "plan": c["plan"], "price": c["price_value"],
        "next_billing": (_utcnow() + timedelta(days=7)).strftime("%d/%m/%Y"),
        "status": "ativa",
    })
    return {"ok": True}

@api.delete("/apps/uninstall/{app_id}")
async def uninstall_app(app_id: str, user=Depends(get_current_user)):
    await db.installed_apps.delete_many({"user_id": user["id"], "app_id": app_id})
    await db.subscriptions.delete_many({"user_id": user["id"], "app_id": app_id})
    return {"ok": True}

# -------- Stories --------
def _story_out(s: dict) -> dict:
    media_list = s.get("media", []) or []
    cover = next((m for m in media_list if m.get("cover")), media_list[0] if media_list else None)
    thumbnail = None
    cover_url = None
    cover_type = "image"
    if cover:
        cover_url = cover.get("url")
        cover_type = cover.get("type", "image")
        # Prefer poster (still image) for thumbnail; otherwise use url only if not video
        thumbnail = cover.get("poster") or (cover_url if cover_type != "video" else None)
    return {
        "id": s["id"], "app_id": s["app_id"], "title": s["title"],
        "format": s.get("format", "vertical"), "scroll": s.get("scroll", "auto"),
        "active": s.get("active", True), "cta": s.get("cta", ""),
        "media": media_list, "urls": s.get("urls", []),
        "thumbnail": thumbnail,
        "cover_url": cover_url,
        "cover_type": cover_type,
        "views": s.get("views", 0),
        "created_at": s.get("created_at"),
    }

@api.get("/stories")
async def list_stories(app_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {"user_id": user["id"]}
    if app_id:
        q["app_id"] = app_id
    items = await db.stories.find(q).sort("created_at", -1).to_list(1000)
    return [_story_out(x) for x in items]

@api.post("/stories")
async def create_story(body: StoryIn, user=Depends(get_current_user)):
    sid = str(uuid.uuid4())
    doc = {
        "id": sid, "user_id": user["id"], **body.dict(),
        "media": [m.dict() for m in body.media] if hasattr(body.media[0], 'dict') else body.dict()["media"],
        "urls": body.dict()["urls"],
        "views": 0,
        "created_at": _utcnow().isoformat(),
        "updated_at": _utcnow().isoformat(),
    }
    # normalize lists
    doc["media"] = body.dict()["media"]
    doc["urls"] = body.dict()["urls"]
    await db.stories.insert_one(doc)
    return _story_out(doc)

@api.get("/stories/{sid}")
async def get_story(sid: str, user=Depends(get_current_user)):
    s = await db.stories.find_one({"id": sid, "user_id": user["id"]})
    if not s:
        raise HTTPException(404, "Story não encontrado")
    return _story_out(s)

@api.put("/stories/{sid}")
async def update_story(sid: str, body: StoryIn, user=Depends(get_current_user)):
    s = await db.stories.find_one({"id": sid, "user_id": user["id"]})
    if not s:
        raise HTTPException(404, "Story não encontrado")
    payload = body.dict()
    payload["updated_at"] = _utcnow().isoformat()
    await db.stories.update_one({"id": sid}, {"$set": payload})
    s2 = await db.stories.find_one({"id": sid})
    return _story_out(s2)

@api.delete("/stories/{sid}")
async def delete_story(sid: str, user=Depends(get_current_user)):
    res = await db.stories.delete_one({"id": sid, "user_id": user["id"]})
    if not res.deleted_count:
        raise HTTPException(404, "Story não encontrado")
    return {"ok": True}

@api.patch("/stories/{sid}/toggle")
async def toggle_story(sid: str, user=Depends(get_current_user)):
    s = await db.stories.find_one({"id": sid, "user_id": user["id"]})
    if not s:
        raise HTTPException(404, "Story não encontrado")
    new_active = not s.get("active", True)
    await db.stories.update_one({"id": sid}, {"$set": {"active": new_active}})
    return {"active": new_active}

# -------- Uploads (stored as base64 in MongoDB) --------
MAX_UPLOAD = 50 * 1024 * 1024  # 50 MB

def _extract_video_poster(video_bytes: bytes) -> Optional[bytes]:
    """Extract a poster JPEG from a video using ffmpeg. Returns None on failure."""
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as fin:
            fin.write(video_bytes)
            in_path = fin.name
        out_path = in_path + ".jpg"
        # Grab a frame at ~0.5s, scale to max 720 width, quality 4 (high)
        cmd = [
            "ffmpeg", "-y", "-ss", "00:00:00.500", "-i", in_path,
            "-vframes", "1", "-vf", "scale='min(720,iw)':-2",
            "-q:v", "4", out_path,
        ]
        subprocess.run(cmd, capture_output=True, timeout=15, check=True)
        with open(out_path, "rb") as f:
            data = f.read()
        try: os.remove(in_path)
        except Exception: pass
        try: os.remove(out_path)
        except Exception: pass
        return data
    except Exception as e:
        log.warning(f"ffmpeg poster failed: {e}")
        return None

@api.post("/upload")
async def upload(file: UploadFile = File(...), user=Depends(get_current_user)):
    data = await file.read()
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Arquivo muito grande (máx. 50MB)")
    fid = str(uuid.uuid4())
    mime = file.content_type or "application/octet-stream"
    doc = {
        "id": fid, "user_id": user["id"],
        "name": file.filename or "file",
        "mime": mime,
        "size": len(data),
        "data_b64": base64.b64encode(data).decode(),
        "created_at": _utcnow().isoformat(),
    }
    await db.media_files.insert_one(doc)
    base = os.environ.get("PUBLIC_BACKEND_URL", "")
    url = f"{base}/api/files/{fid}" if base else f"/api/files/{fid}"

    poster_url = None
    if mime.startswith("video/"):
        poster = _extract_video_poster(data)
        if poster:
            pid = str(uuid.uuid4())
            pdoc = {
                "id": pid, "user_id": user["id"],
                "name": (file.filename or "video") + "-poster.jpg",
                "mime": "image/jpeg",
                "size": len(poster),
                "data_b64": base64.b64encode(poster).decode(),
                "created_at": _utcnow().isoformat(),
                "is_poster_for": fid,
            }
            await db.media_files.insert_one(pdoc)
            poster_url = f"{base}/api/files/{pid}" if base else f"/api/files/{pid}"

    return {"id": fid, "url": url, "name": doc["name"], "mime": doc["mime"], "size": doc["size"], "poster": poster_url}

@api.get("/files/{fid}")
async def get_file(fid: str):
    doc = await db.media_files.find_one({"id": fid})
    if not doc:
        raise HTTPException(404, "Arquivo não encontrado")
    return Response(content=base64.b64decode(doc["data_b64"]), media_type=doc["mime"])

@api.get("/files")
async def list_files(user=Depends(get_current_user)):
    items = await db.media_files.find({"user_id": user["id"]}).sort("created_at", -1).to_list(500)
    base = os.environ.get("PUBLIC_BACKEND_URL", "")
    out = []
    for it in items:
        url = f"{base}/api/files/{it['id']}" if base else f"/api/files/{it['id']}"
        out.append({"id": it["id"], "url": url, "name": it["name"], "mime": it["mime"], "size": it["size"]})
    return out

# -------- Subscriptions --------
@api.get("/subscriptions")
async def list_subs(user=Depends(get_current_user)):
    items = await db.subscriptions.find({"user_id": user["id"]}).to_list(500)
    out = []
    for it in items:
        app_name = CATALOG_BY_ID.get(it["app_id"], {}).get("name", it["app_id"])
        out.append({
            "id": it["id"], "app": app_name, "plan": it.get("plan", "Mensal"),
            "price": it.get("price", "R$ 0,00"), "nextBilling": it.get("next_billing", ""),
            "status": it.get("status", "ativa"),
        })
    return out

# -------- Feedback --------
@api.post("/feedback")
async def submit_feedback(body: FeedbackIn, user=Depends(get_current_user)):
    doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "rating": body.rating,
           "text": body.text, "created_at": _utcnow().isoformat()}
    await db.feedbacks.insert_one(doc)
    return {"ok": True}

# -------- Root --------
@api.get("/")
async def root():
    return {"message": "Zentor API"}

# Include router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
