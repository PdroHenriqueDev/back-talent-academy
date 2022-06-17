import express, { response } from 'express';
import { UserController } from '../controller/UserController';
import middlewareAuth from './middleware/auth';

const router = express.Router();
const controller = new UserController();
const auth = new middlewareAuth().auth;

router.post('/create', auth, controller.new);
router.post('/login', controller.login);

router.get('/', auth, controller.find);

router.put('/:id', auth, controller.update);

router.delete('/:id', auth, controller.delete);

export default router;