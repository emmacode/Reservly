import express from 'express';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signup,
  updatePassword,
} from '../controllers/authController';
import {
  deleteAccount,
  getAllUsers,
  updateAccount,
} from '../controllers/userContoller';

const accountRouter = express.Router();

accountRouter.post('/signup', signup);
accountRouter.post('/login', login);

accountRouter.post('/forgot-password', forgotPassword);
accountRouter.patch('/reset-password/:token', resetPassword);
accountRouter.patch('/update-password', protect, updatePassword);
accountRouter.patch('/update-account', protect, updateAccount);
accountRouter.delete('/delete-account', protect, deleteAccount);

accountRouter.get('/', protect, getAllUsers);

export default accountRouter;
