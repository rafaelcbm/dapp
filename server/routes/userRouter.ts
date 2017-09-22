import { Router, Request, Response, NextFunction } from 'express';
import * as logger from 'logops';

import { UserService } from '../services';

export const userRouter: Router = Router();

const userService = new UserService();

userRouter.get('/all', function (request: Request, response: Response, next: NextFunction) {

	try {

		let usersOnService = userService.getUsers().then(
			users => response.json({
				status: 'sucesso',
				data: users
			})
		);

	} catch (err) {
		logger.error('## Erro ao obter conexão com MongoBD: %j', err);
		throw err;
	}
});

userRouter.post("/", function (request: Request & { userName: string }, response: Response, next: NextFunction) {

	let userName = request.body.userName;

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


