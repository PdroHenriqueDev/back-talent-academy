import express from 'express';
import { BookController } from '../controller/BookController';
import middlewareAuth from './middleware/auth';

const router = express.Router();
const controller = new BookController();
const auth = new middlewareAuth().auth;

router.post('/create', auth, controller.new);

router.get('/', auth, controller.find);

router.put('/:id', auth, controller.update);

router.delete('/:id', auth, controller.delete);

export default router;