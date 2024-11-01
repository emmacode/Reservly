export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public operational: true;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.operational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
