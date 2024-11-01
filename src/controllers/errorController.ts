import { NextFunction, Response, Request } from "express";
import { AppError } from "../utils/app-error";

interface ValidationError {
  message: string;
  name: string;
  properties?: any;
  kind: string;
  path: string;
  value: any;
}

interface OperationErrorProps extends Error {
  statusCode?: number;
  status?: string;
  operational?: boolean;
  code?: number;
  path?: string;
  value?: string;
  keyValue?: string;
  errors?: Record<string, ValidationError>;
}

const handleCastErrorDB = (err: OperationErrorProps) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err: OperationErrorProps) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : "";
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: OperationErrorProps) => {
  if (!err.errors) {
    return new AppError("Validation error occured", 400);
  }

  const errors = Object.values(err.errors).map(
    (el: ValidationError) => el.message
  );
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token as expired! Please log in again", 401);
};

// Development env error handler
const sendErrorDev = (err: OperationErrorProps, res: Response) => {
  res.status(err.statusCode as number).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production env error handle

const sendErrorProd = (err: OperationErrorProps, res: Response) => {
  if (err.operational) {
    res.status(err.statusCode as number).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorHandler = (
  err: OperationErrorProps,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 1100) error = handleDuplicateFieldDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export { globalErrorHandler };
