import { Request, Response, NextFunction } from 'express';

// Basic typed request interfaces
export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedRequestQuery<T> extends Request {
  query: T;
}

export interface TypedRequestParams<T> extends Request {
  params: T;
}

// Combined interfaces for requests that need multiple types
export interface TypedRequest<B = any, Q = any, P = any> extends Request {
  body: B;
  query: Q;
  params: P;
}

// Handler types for different scenarios
export type TypedRequestHandler<B = any, Q = any, P = any> = (
  req: TypedRequest<B, Q, P>,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;
