import crypto from 'crypto';
import { Query } from 'mongoose';

import AppError from '../src/utils/app-error';
import { formatTime } from '../src/utils/date-time.format';
import { generateToken } from '../src/utils/generate.token';
import { ReservationAPIFeatures } from '../src/utils/reservation-features';

interface MockDocument {
  _id: string;
  [key: string]: any;
}

describe('formatTime', () => {
  it('PM time format', () => {
    const formattedTime = formatTime('13:30');
    expect(formattedTime).toBe('1:30 PM');
  });

  it('AM time format', () => {
    const formattedTime = formatTime('08:45');
    expect(formattedTime).toBe('8:45 AM');
  });
});

describe('AppError class', () => {
  it('should create an instance of AppError for a 4xx status code', () => {
    const error = new AppError('Not Found', 404);

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.operational).toBe(true);
  });

  it('should create an instance of AppError for a 5xx status code', () => {
    const error = new AppError('internal server error', 500);

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('internal server error');
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.operational).toBe(true);
  });
});

describe('generateToken', () => {
  it('Generate a token and its hashed version', () => {
    const { token, hashedToken } = generateToken();

    expect(token).toBeDefined();
    expect(hashedToken).toBeDefined();

    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    expect(hashedToken).toHaveLength(64);
    expect(hashedToken).toMatch(/^[0-9a-f]{64}$/);

    const expectedHashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    expect(hashedToken).toBe(expectedHashedToken);
  });

  it('Generate unique tokens on each call', () => {
    const first = generateToken();
    const second = generateToken();

    expect(first.token).not.toBe(second.token);
    expect(first.hashedToken).not.toBe(second.hashedToken);
  });
});

describe('ReservationAPIFeatures', () => {
  let mockQuery: jest.Mocked<Query<MockDocument[], MockDocument>>;
  beforeEach(() => {
    mockQuery = {
      find: jest.fn().mockReturnThis(),
    } as any;
  });

  describe('filter', () => {
    it('should remove excluded fields from the the queryString', () => {
      const queryString = {
        page: '1',
        sort: 'date',
        limit: '10',
        fields: 'name',
        gte: '100',
        status: 'confirmed',
      };

      const features = new ReservationAPIFeatures(mockQuery, queryString);
      features.filter();

      expect(mockQuery.find).toHaveBeenCalledWith(
        expect.not.objectContaining({
          page: expect.any(String),
          sort: expect.any(String),
          limit: expect.any(String),
          fields: expect.any(String),
        }),
      );

      expect(mockQuery.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $gte: '100',
          status: 'confirmed',
        }),
      );
    });
  });
});
