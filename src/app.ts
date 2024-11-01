import express from "express";
import morgan from "morgan";
import { AppError } from "./utils/app-error";
import { globalErrorHandler } from "./controllers/errorController";

const app = express();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
