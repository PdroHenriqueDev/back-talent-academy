import { UserEntity } from '../entity/user';
import  Response  from '../config/utils/response';
import bcrypt  from 'bcrypt';
import { getRepository } from 'typeorm';
import { BookEntity } from './../entity/book';
import { ResponsePattern } from './../types/response';

const response = new Response();

export const create = async(body: BookEntity): Promise<ResponsePattern> => {
    if (!body) return  response.badRequest<null, string>(400, null, 'Requisição sem conteúdo!');
    
    const { user_id, title, description, release_date } = body;
    if (!user_id || !title || !description || !release_date) {
        return response.badRequest<null, string>(400, null, 'Preencha todos os campos!');
    }

    const formattedDate = new Date(release_date);
    
    const userIdNumber = Number(user_id);
    
    if (user_id && Number.isNaN(userIdNumber)) return response.badRequest<null, string>(400, null, 'Formato do user_id inválido!');
    try {
        const data = {
            user_id: userIdNumber,
            title,
            description,
            release_date: formattedDate,
        };
        await getRepository(BookEntity).save(data); 

        return response.successfulRequest<string, null>(201, 'Novo livro cadastrado!', null);
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }   
}

export const find = async(id: string): Promise<ResponsePattern> => {
    const idIsNumber = Number(id);
    if (id && Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(400, null, 'Formato do id inválido!');

    const data = id
        ? await getRepository(BookEntity).find({ 
            where: { id: idIsNumber },
            relations: ['user_id']
        })
        : await getRepository(BookEntity).find({
            relations: ['user_id']
        });
    
    return response.successfulRequest<BookEntity | BookEntity[], null>(200, data, null);
    
}

export const update = async(id: string, body: BookEntity): Promise<ResponsePattern> => {
    console.log(body);
    
    const idIsNumber = Number(id);
    if (!id || Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(
        400,
        null,
        !id ? 'Id inválido!' : 'Formato do id inválido!'
    );
    
    const { user_id, title, description, release_date } = body;

    if (!user_id || !title || !description || !release_date) return response.badRequest<null, string>(400, null, 'Preencha todos os campos!');

    const bookExists = await getRepository(BookEntity).findOne({ where: { id: idIsNumber } });
    if (!bookExists) return response.badRequest<null, string>(400, null, 'Livro não existe!');

    const userIdNumber = Number(user_id);
    if (user_id && Number.isNaN(userIdNumber)) return response.badRequest<null, string>(400, null, 'Formato do user_id inválido!');

    const formattedDate = new Date(release_date);
    try {
        await getRepository(BookEntity).update(
            { id: idIsNumber, },
            {
                user_id: userIdNumber,
                title,
                description,
                release_date: formattedDate,
            },
        );
    
        return response.successfulRequest<string, null>(200, `Livro ${id} atualizado!`, null);        
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }
}

export const remove = async(id: string): Promise<ResponsePattern> => {
    const idIsNumber = Number(id);
    if (Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(400, null, 'Formato do id inválido!');

    const bookExists = await getRepository(BookEntity).findOne({ where: { id: idIsNumber } });
    if (!bookExists) return response.badRequest<null, string>(400, null, 'Livro não existe!');

    try {
        await getRepository(BookEntity).delete(id);

        return response.successfulRequest<string, null>(200, `Livro ${id} deletado!`, null);
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }
}