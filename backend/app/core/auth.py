from fastapi import Header, HTTPException

from app.db.supabase import supabase



async def get_current_user(
    authorization: str = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )


    token = authorization.replace(
        "Bearer ",
        ""
    )


    try:

        response = supabase.auth.get_user(
            token
        )


        user = response.user


        if user is None:

            raise Exception()


        return user


    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )