import { UserDAO } from '../dal';
import * as assert from "assert";

export class UserService {

	userDAO = new UserDAO();

	async getUsers() {

		return await this.userDAO.getUsers();

		//     return [
		//       { userId: 111, userName: 'Joao 1' },
		//       { userId: 222, userName: 'Joao 2' },
		//       { userId: 333, userName: 'Joao 3' },
		//       { userId: 444, userName: 'Joao 4' },
		//       { userId: 555, userName: 'Joao 5' }];
	}

	async insertUser(userName: any) {
		let daoReturn = await this.userDAO.insertUser({ userName: userName });
		assert.equal(daoReturn.result.n, 1);
	}
}
