import { Request, Response } from 'express';
import { create, find, remove, update } from '../repository/Book';

export class BookController {
    async new(request: Request, response: Response) {      
      const { body } = request;      
      const { httpCode, ...rest } = await create(body);
      return response.status(httpCode).json(rest);
    }
    
    async find(request: Request, response: Response) {      
      const { id } = request.query;      
      const { httpCode, ...rest } = await find(id as string);
      return response.status(httpCode).json(rest);
    }

    async update(request: Request, response: Response) {          
      const { id } = request.params;      
      const { body } = request;     
      const { httpCode, ...rest } = await update(id as string, body );
      return response.status(httpCode).json(rest);
    }

    async delete(request: Request, response: Response) {
      const { id } = request.params;      
      const { httpCode, ...rest } = await remove(id as string);
      return response.status(httpCode).json(rest);
    }
}