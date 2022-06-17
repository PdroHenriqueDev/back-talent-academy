import { UserEntity } from '../entity/user';
import  Response  from '../config/utils/response';
import bcrypt  from 'bcrypt';
import { getRepository } from 'typeorm';
import { ResponsePattern } from '../types/response';
import jwt from 'jsonwebtoken';

const response = new Response();

export const create = async(body: UserEntity): Promise<ResponsePattern> => {
    if (!body) return  response.badRequest<null, string>(400, null, 'Requisição sem conteúdo!');

    const { name, email, password } = body;
    if (!name || !email || !password) return response.badRequest<null, string>(400, null, 'Preencha todos os campos!');
    const formattedEmail = email.toLocaleLowerCase();

    const userExists = await getRepository(UserEntity).findOne({
      where: {
        email: formattedEmail
      }
    })
    if (userExists) return response.badRequest<null, string>(400, null, 'Usuário já existe!');
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const data = {
            name,
            email: formattedEmail,
            password: hash,
        };
        const newUser = await getRepository(UserEntity).save(data);

        return response.successfulRequest<string, null>(201, 'Novo usuário cadastrado!', null);
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }
}

export const find = async(id: string): Promise<ResponsePattern> => {
    const idIsNumber = Number(id);
    if (id && Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(400, null, 'Formato do id inválido!');

    const data = id
        ? await getRepository(UserEntity).find({ where: { id: idIsNumber } })
        : await getRepository(UserEntity).find();

    return response.successfulRequest<UserEntity | UserEntity[], null>(200, data, null);

}

export const update = async(id: string, body: UserEntity): Promise<ResponsePattern> => {
    const idIsNumber = Number(id);
    if (!id || Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(
        400,
        null,
        !id ? 'Id inválido!' : 'Formato do id inválido!'
    );

    const { name, email, password } = body;

    if (!name || !email || !password) return response.badRequest<null, string>(400, null, 'Preencha todos os campos!');

    const userExists = await getRepository(UserEntity).findOne({ where: { id: idIsNumber } });
    if (!userExists) return response.badRequest<null, string>(400, null, 'Usuário não existe!');

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const formattedEmail = email.toLocaleLowerCase();

    try {
        await getRepository(UserEntity).update(
            { id: idIsNumber, },
            {
                name,
                email: formattedEmail,
                password: hash,
            },
        );

        return response.successfulRequest<string, null>(200, `Usuário ${id} atualizado!`, null);
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }
}

export const remove = async(id: string): Promise<ResponsePattern> => {
    const idIsNumber = Number(id);
    if (Number.isNaN(idIsNumber)) return  response.badRequest<null, string>(400, null, 'Formato do id inválido!');

    const userExists = await getRepository(UserEntity).findOne({ where: { id: idIsNumber } });
    if (!userExists) return response.badRequest<null, string>(400, null, 'Usuário não existe!');

    try {
        await getRepository(UserEntity).delete(id);

        return response.successfulRequest<string, null>(200, `Usuário ${id} deletado!`, null);
    } catch (error) {
        return response.error<string>(`Error: ${error}`)
    }
}

export const auth = async(email: string, password: string): Promise<ResponsePattern> => {
    const userPassword = await getRepository(UserEntity).findOne(
        { where:
            { email },
            select: ['password'],
        },
    );

    if (!userPassword) return response.badRequest<null, string>(400, null, 'Usuário não encontrado!');

    const match = bcrypt.compareSync(password, userPassword!.password.replace('$2y$', '$2b$'));

    if (!match) response.badRequest<null, string>(400, null, 'Credenciais inválidas!');

    const secret = process.env.SECRET_KEY!.toString();
    const refreshSecret = process.env.SECRET_KEY_TOKEN_LIFE!.toString();

    const expiresInToken = process.env.EXPIRES_IN_TOKEN!.toString();
    const expiresInTokenRefresh = process.env.EXPIRES_IN_TOKEN_REFRESH!.toString();

    const user = await getRepository(UserEntity).findOne(
        { where:
            { email },
        },
    );

    try {
        const token = jwt.sign({
            peopleId: userPassword!.id,
            isRefreshToken: false,
          }, secret, { expiresIn: expiresInToken });

          const refreshToken = jwt.sign({
            peopleId: userPassword!.id,
            isRefreshToken: true,
          }, refreshSecret, { expiresIn: expiresInTokenRefresh });

          const finalResponse = {
            user,
            token,
            refreshToken,
          }

        return response.successfulRequest<any, null>(200, finalResponse, null);
    } catch (error) {
        return response.error(error);
    }
}
