import { NextFunction, Request, Response } from "express";
import ResponseReturn from '../../config/utils/response';
import jwt from 'jsonwebtoken';


class Middleware {
    async auth(req: Request, res: Response, next: NextFunction): Promise<any> {
        const response = new ResponseReturn();

        const token = req.headers.authorization;
        const secret = process.env.SECRET_KEY!;

        if (!token) {
            return res.status(400).json({ status: false, data: null, error: 'Token não fornecido!' });
        }
        const parts = token.split(' ');
        if (parts.length !== 2) return res.status(400).json({ status: false, data: null, error: 'Formado do token inválido!' });

        const [scheme, tokenHash] = parts;
        console.log(tokenHash);
        if (scheme !== 'Bearer') return res.status(400).json({ status: false, data: null, error: 'Formado do token inválido!' });

        try {
            jwt.verify(tokenHash, secret, (error) => {
                if (error) return res.status(403).json({ status: false, data: null, error: 'Não autorizado!' });
                return next();
            });
        } catch (error) {
            return response.error(error)
        }
    }
};

export default Middleware;
