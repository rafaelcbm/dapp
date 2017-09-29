import { Router, Request, Response, NextFunction } from 'express';
import * as logger from 'logops';

import { UserService } from '../services';

export const userRouter: Router = Router();

const userService = new UserService();

userRouter.get('/all', function (request: Request, response: Response, next: NextFunction) {

    try {


        const usersOnService = userService.getUsers().then(
            users => {
                setTimeout(() => {
                    logger.info('Esperando ............');
                    response.json({
                        status: 'sucesso',
                        data: users
                    })
                }, 10000);
            });
    } catch (err) {
        logger.error('## Erro ao obter conexão com MongoBD: %j', err);
        throw err;
    }
});

userRouter.post('/', function (request: Request & { userName: string }, response: Response, next: NextFunction) {

    const userName = request.body.userName;

    try {
        userService.insertUser(userName).then(
            data => response.status(201).json({
                status: 'sucesso'
            })
        );
    } catch (err) {
        logger.error('## Erro ao obter conexão com MongoBD: %j', err);
        throw err;
    }
});


