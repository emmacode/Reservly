import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {
  signup,
  login,
  protect,
  createSendToken,
} from '../src/controllers/auth.controller';
import User from '../src/models/User';
import { IUser } from '../src/types';
import { generateToken } from '../src/utils/generate.token';
import { sendVerificationEmail } from '../src/utils/verification.email';
import AppError from '../src/utils/app-error';
import { mock } from 'node:test';

jest.mock('../src/models/User');
jest.mock('../src/utils/generate.token');
jest.mock('../src/utils/verification.email');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  //   let mockRes: Partial<Response> & {
  //     status: jest.Mock;
  //     json: jest.Mock;
  //     cookie: jest.Mock;
  //   };
  //   let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserId: mongoose.Types.ObjectId;

  const mockResponse = () => {
    const res = {};
    // replace the following () => res
    // with your function stub/mock of choice
    // making sure they still return `res`
    // @ts-ignore
    res.status = jest.fn().mockReturnValue(res);

    // @ts-ignore
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    mockUserId = new mongoose.Types.ObjectId();
    mockReq = {
      body: {},
      headers: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    };
    // mockRes = {
    //   status: jest.fn().mockReturnThis(),
    //   json: jest.fn(),
    //   cookie: jest.fn(),
    // };

    // mockRes.status = jest.fn().mockReturnValue(mockRes);
    // mockRes.status().json = jest.fn();
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    beforeEach(() => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'owner',
      };

      (generateToken as jest.Mock).mockReturnValue({
        token: 'mockToken',
        hashedToken: 'mockHashedToken',
      });
    });

    it('should create a new user and send a verification email', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'test@example.com',
        role: 'owner',
        toObject: () => ({
          email: 'test@example.com',
          role: 'owner',
        }),
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
      //   (mockRes.status as jest.Mock).mockResolvedValue(201);
      //   (createSendToken as jest.Mock).mockReturnValue(undefined);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      try {
        await signup(
          mockReq as Request,
          mockResponse as unknown as Response,
          mockNext,
        );
        console.log(mockReq, 'mockReq');
        console.log(mockResponse, 'mockResponse');

        // Add debugging logs
        console.log('Mock Next calls:', (mockNext as jest.Mock).mock.calls);
        // console.log(
        //   'Mock Res status calls:',
        //   (mockResponse.status as jest.Mock).mock.calls,
        // );
        // console.log(
        //   'Mock Res json calls:',
        //   (mockResponse.json as jest.Mock).mock.calls,
        // );

        expect(User.create).toHaveBeenCalledWith({
          ...mockReq.body,
          emailVerificationToken: 'mockHashedToken',
          emailVerificationExpires: expect.any(Number),
        });
        expect(sendVerificationEmail).toHaveBeenCalled();
        // @ts-ignore
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        // expect(createSendToken).toHaveBeenCalled();
        // expect(mockRes.json).toHaveBeenCalledWith({
        //   status: 'success',
        //   token: expect.any(String),
        //   data: {
        //     user: expect.objectContaining({
        //       email: 'test@example.com',
        //       role: 'owner',
        //     }),
        //   },
        // });
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }

      //   expect(User.create).toHaveBeenCalledWith({
      //     ...mockReq.body,
      //     emailVerificationToken: 'mockHashedToken',
      //     emailVerificationExpires: expect.any(Number),
      //   });
      //   expect(sendVerificationEmail).toHaveBeenCalledWith(
      //     expect.objectContaining({
      //       email: 'test@example.com',
      //     }),
      //   );
      //   expect(mockRes.status).toHaveBeenCalledWith(201);
      //   expect(mockRes.json).toHaveBeenCalledWith({
      //     status: 'success',
      //     token: expect.any(String),
      //     data: { user: expect.any(Object) },
      //   });
    });
  });

  describe('login', () => {});
});
