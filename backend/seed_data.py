"""Seed the database with initial reference data (government schemes)."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.services.firestore_service import firestore_service
from app.agents.government_scheme_agent import government_scheme_agent


async def seed_schemes():
    schemes = government_scheme_agent._get_default_schemes()
    count = 0
    for scheme in schemes:
        existing = firestore_service.query_by_field("schemes", "scheme_id", scheme["scheme_id"])
        if not existing:
            firestore_service.create_document("schemes", scheme["scheme_id"], scheme)
            count += 1
            print(f"  + {scheme['name']}")
        else:
            print(f"  ~ {scheme['name']} (already exists)")
    print(f"\nSeeded {count} new schemes (total: {len(schemes)})")
    return count


async def seed_knowledge():
    from app.utils.rag_pipeline import seed_medical_knowledge
    result = seed_medical_knowledge()
    print(f"Seeded {result['indexed']}/{result['total']} knowledge documents")
    return result


async def main():
    print("=" * 50)
    print("  MedAssist AI - Data Seeder")
    print("=" * 50)

    print("\n1. Seeding government schemes...")
    await seed_schemes()

    print("\n2. Seeding medical knowledge (Qdrant)...")
    try:
        await seed_knowledge()
    except Exception as e:
        print(f"  SKIP: Qdrant not available ({e})")

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
