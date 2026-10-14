from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from .config import settings
from .database import Base, engine, get_db
from .models import Discussion, Lead, User
from .schemas import (
    DiscussionCreate,
    DiscussionResponse,
    LeadCreate,
    LeadResponse,
    LeadStatus,
    LoginRequest,
    StatusUpdate,
    TokenResponse,
    UserResponse,
)
from .security import create_access_token, get_current_user, verify_password
from .seed import seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed()
    yield


app = FastAPI(title="LeadFlow API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_lead(lead: Lead) -> LeadResponse:
    latest = lead.discussions[0] if lead.discussions else None
    return LeadResponse(
        id=lead.id,
        name=lead.name,
        company=lead.company,
        phone=lead.phone,
        email=lead.email,
        status=lead.status,
        follow_up_at=lead.follow_up_at,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
        last_discussion=latest,
        discussion_count=len(lead.discussions),
    )


def get_lead_or_404(lead_id: int, db: Session) -> Lead:
    lead = db.scalar(select(Lead).options(selectinload(Lead.discussions)).where(Lead.id == lead_id))
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenResponse(access_token=create_access_token(user.id), user=user)


@app.get("/api/auth/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@app.get("/api/leads", response_model=list[LeadResponse])
def list_leads(
    status_filter: LeadStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[LeadResponse]:
    statement = (
        select(Lead).options(selectinload(Lead.discussions)).order_by(Lead.updated_at.desc())
    )
    if status_filter:
        statement = statement.where(Lead.status == status_filter.value)
    if search and search.strip():
        term = f"%{search.strip()}%"
        statement = statement.where(or_(Lead.name.ilike(term), Lead.company.ilike(term)))
    return [serialize_lead(lead) for lead in db.scalars(statement).all()]


@app.post("/api/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> LeadResponse:
    lead = Lead(**payload.model_dump(), status=LeadStatus.new.value)
    db.add(lead)
    db.commit()
    return serialize_lead(get_lead_or_404(lead.id, db))


@app.patch("/api/leads/{lead_id}/status", response_model=LeadResponse)
def update_status(
    lead_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> LeadResponse:
    lead = get_lead_or_404(lead_id, db)
    lead.status = payload.status.value
    db.commit()
    db.refresh(lead)
    return serialize_lead(lead)


@app.get("/api/leads/{lead_id}/discussions", response_model=list[DiscussionResponse])
def list_discussions(
    lead_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Discussion]:
    get_lead_or_404(lead_id, db)
    return list(
        db.scalars(
            select(Discussion)
            .where(Discussion.lead_id == lead_id)
            .order_by(Discussion.created_at.desc())
        ).all()
    )


@app.post(
    "/api/leads/{lead_id}/discussions",
    response_model=DiscussionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_discussion(
    lead_id: int,
    payload: DiscussionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Discussion:
    lead = get_lead_or_404(lead_id, db)
    discussion = Discussion(lead_id=lead.id, **payload.model_dump())
    if payload.follow_up_at is not None:
        lead.follow_up_at = payload.follow_up_at
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    return discussion
