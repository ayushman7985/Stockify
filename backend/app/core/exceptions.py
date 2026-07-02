from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    message = str(exc.orig).lower() if exc.orig else ""

    if "sku" in message or "products_sku" in message:
        detail = "Product with this SKU already exists"
    elif "email" in message or "customers_email" in message:
        detail = "Customer with this email already exists"
    elif "ck_products_quantity_non_negative" in message:
        detail = "Product quantity cannot be negative"
    elif "ck_products_price_positive" in message:
        detail = "Product price must be greater than zero"
    else:
        detail = "Database constraint violation"

    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": detail},
    )
