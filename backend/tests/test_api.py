def test_login_rejects_bad_password(client):
    response = client.post(
        "/api/auth/login", json={"email": "test@example.com", "password": "wronggg"}
    )
    assert response.status_code == 401


def test_lead_discussion_flow(client, auth_headers):
    created = client.post(
        "/api/leads",
        headers=auth_headers,
        json={"name": "Ada Lovelace", "company": "Analytical Engines"},
    )
    assert created.status_code == 201
    lead = created.json()
    assert lead["status"] == "New"

    note = client.post(
        f"/api/leads/{lead['id']}/discussions",
        headers=auth_headers,
        json={"note": "Scheduled the technical demo.", "follow_up_at": "2030-01-02T10:00:00Z"},
    )
    assert note.status_code == 201

    updated = client.patch(
        f"/api/leads/{lead['id']}/status",
        headers=auth_headers,
        json={"status": "Qualified"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "Qualified"
    assert updated.json()["last_discussion"]["note"] == "Scheduled the technical demo."


def test_protected_endpoint_requires_token(client):
    assert client.get("/api/leads").status_code == 401
