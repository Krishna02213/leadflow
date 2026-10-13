from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LeadStatus(str, Enum):
    new = "New"
    contacted = "Contacted"
    qualified = "Qualified"
    proposal_sent = "Proposal Sent"
    won = "Won"
    lost = "Lost"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank")
        return value


class StatusUpdate(BaseModel):
    status: LeadStatus


class DiscussionCreate(BaseModel):
    note: str = Field(min_length=1, max_length=5000)
    follow_up_at: datetime | None = None

    @field_validator("note")
    @classmethod
    def clean_note(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Discussion note cannot be blank")
        return value


class DiscussionResponse(BaseModel):
    id: int
    note: str
    follow_up_at: datetime | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

    @field_validator("follow_up_at", "created_at", mode="before")
    @classmethod
    def normalize_timezone(cls, value: datetime | None) -> datetime | None:
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class LeadResponse(BaseModel):
    id: int
    name: str
    company: str | None
    phone: str | None
    email: str | None
    status: LeadStatus
    follow_up_at: datetime | None
    created_at: datetime
    updated_at: datetime
    last_discussion: DiscussionResponse | None = None
    discussion_count: int = 0

    @field_validator("follow_up_at", "created_at", "updated_at", mode="before")
    @classmethod
    def normalize_timezone(cls, value: datetime | None) -> datetime | None:
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
