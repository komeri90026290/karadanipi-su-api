from dotenv import load_dotenv
import os
load_dotenv()
class Config:    
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')   
    print(SQLALCHEMY_DATABASE_URI); 
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):        
        
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)    
        SQLALCHEMY_TRACK_MODIFICATIONS = False