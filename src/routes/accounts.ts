import express from 'express';
import { signup } from '../controllers/authController';

const accountRouter = express.Router();

accountRouter.post('/signup', signup);

export default accountRouter;