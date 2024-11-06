import express from 'express';
import { login, protect, signup } from '../controllers/authController';
import { getAllUsers } from '../controllers/userContoller';

const accountRouter = express.Router();

accountRouter.post('/signup', signup);
accountRouter.post('/login', login);

accountRouter.get('/', protect, getAllUsers);

export default accountRouter;
