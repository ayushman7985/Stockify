from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


def safe_commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
