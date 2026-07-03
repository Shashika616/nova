from fastapi import APIRouter, HTTPException

from app.db.supabase import supabase

from app.schemas.user import (
    RegisterRequest,
    LoginRequest
)



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)



@router.post("/register")
async def register(
    request: RegisterRequest
):

    try:

        response = supabase.auth.sign_up(

            {
                "email": request.email,

                "password": request.password

            }

        )


        return {

            "message": "User registered successfully",

            "user": response.user

        }


    except Exception as e:


        raise HTTPException(

            status_code=400,

            detail=str(e)

        )




@router.post("/login")
async def login(
    request: LoginRequest
):


    try:


        response = supabase.auth.sign_in_with_password(

            {

                "email": request.email,

                "password": request.password

            }

        )


        session = response.session


        return {


            "access_token": session.access_token,


            "refresh_token": session.refresh_token,


            "user": response.user

        }



    except Exception as e:


        raise HTTPException(

            status_code=401,

            detail="Invalid credentials"

        )