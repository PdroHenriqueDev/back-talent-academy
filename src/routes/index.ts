import express from 'express';
const router = express.Router();
import UserRouter from './UserRouter';
import BookRouter from './BookRouter';

router.use('/user', UserRouter);
router.use('/book', BookRouter);

export default router;