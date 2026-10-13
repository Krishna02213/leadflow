import os

os.environ["DATABASE_URL"] = "sqlite:///./test_leadflow.db"
os.environ["JWT_SECRET"] = "test-secret-with-at-least-32-characters"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import User
from app.security import hash_password


@pytest.fixture(autouse=True)
def database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        db.add(
            User(
                email="test@example.com",
                full_name="Test User",
                password_hash=hash_password("password123"),
            )
        )
        db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/auth/login", json={"email": "test@example.com", "password": "password123"}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
