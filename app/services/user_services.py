from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate

def create_user(user_data: UserCreate, db: Session) -> User:
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        return None

    new_user = User(
        name  =  user_data.name,
        email =  user_data.email,
        hashed_password = user_data.password  # TODO: hash later
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user