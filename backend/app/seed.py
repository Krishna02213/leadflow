from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from .config import settings
from .database import SessionLocal
from .models import Discussion, Lead, User
from .security import hash_password


def seed() -> None:
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        if not db.scalar(select(User).where(User.email == settings.seed_user_email.lower())):
            db.add(
                User(
                    email=settings.seed_user_email.lower(),
                    full_name="Alex Morgan",
                    password_hash=hash_password(settings.seed_user_password),
                )
            )
        if db.scalar(select(Lead.id).limit(1)):
            db.commit()
            return

        leads = [
            Lead(
                name="Sarah Connor",
                company="Acme Corp",
                phone="+1 555 0199",
                email="sarah@acme.co",
                status="Proposal Sent",
                follow_up_at=now.replace(hour=14, minute=0, second=0, microsecond=0),
            ),
            Lead(
                name="Hank Scorpio",
                company="Globex",
                phone="+1 555 0112",
                email="hank@globex.com",
                status="New",
                follow_up_at=now + timedelta(days=2),
            ),
            Lead(
                name="Bill Lumbergh",
                company="Initech",
                phone="+1 555 0184",
                email="bill@initech.com",
                status="Contacted",
                follow_up_at=now - timedelta(days=1, hours=2),
            ),
            Lead(
                name="Diana Prince",
                company="Themyscira Labs",
                phone="+1 555 0147",
                email="diana@themyscira.io",
                status="Qualified",
                follow_up_at=now + timedelta(days=5),
            ),
            Lead(
                name="Bruce Wayne",
                company="Wayne Enterprises",
                phone="+1 555 0100",
                email="bruce@wayne.com",
                status="Won",
            ),
            Lead(
                name="Ellen Ripley",
                company="Weyland-Yutani",
                phone="+1 555 0166",
                email="ellen@weyland.io",
                status="Lost",
            ),
        ]
        db.add_all(leads)
        db.flush()
        notes = [
            (
                leads[0],
                "Sent the tailored pricing proposal. Sarah will review it with the "
                "procurement team.",
                now - timedelta(days=2),
                leads[0].follow_up_at,
            ),
            (
                leads[0],
                "Discovery call went well. Their team needs better visibility into follow-ups.",
                now - timedelta(days=5),
                None,
            ),
            (
                leads[1],
                "Inbound lead from the website. Requested an overview of the advisory platform.",
                now - timedelta(hours=2),
                None,
            ),
            (
                leads[2],
                "Left a voicemail and shared the product overview by email.",
                now - timedelta(days=7),
                leads[2].follow_up_at,
            ),
            (
                leads[3],
                "Completed a strong product demo with the operations and advisory teams.",
                now - timedelta(days=1),
                leads[3].follow_up_at,
            ),
            (
                leads[3],
                "Qualified budget and timeline. Planning rollout for next quarter.",
                now - timedelta(days=3),
                None,
            ),
            (
                leads[4],
                "Contract signed. Handing over to customer success for onboarding.",
                now - timedelta(days=21),
                None,
            ),
            (
                leads[5],
                "Project paused after a change in leadership. Revisit next year.",
                now - timedelta(days=14),
                None,
            ),
        ]
        db.add_all(
            [
                Discussion(
                    lead_id=lead.id, note=note, created_at=created_at, follow_up_at=follow_up
                )
                for lead, note, created_at, follow_up in notes
            ]
        )
        db.commit()
        print("Seeded LeadFlow demo data.")


if __name__ == "__main__":
    seed()
