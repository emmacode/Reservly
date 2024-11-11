import express from 'express';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signup,
} from '../controllers/authController';
import { getAllUsers } from '../controllers/userContoller';

const accountRouter = express.Router();

accountRouter.post('/signup', signup);
accountRouter.post('/login', login);

accountRouter.post('/forgot-password', forgotPassword);
accountRouter.patch('/reset-password/:token', resetPassword);

accountRouter.get('/', protect, getAllUsers);

export default accountRouter;
