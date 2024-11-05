import express from 'express';
import { login, signup } from '../controllers/authController';

const accountRouter = express.Router();

accountRouter.post('/signup', signup);
accountRouter.post('/login', login);

export default accountRouter;
