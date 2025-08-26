from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    email = Column(String(50), unique=True)

    hashed_password = Column(String(128), nullable=False)
