import { BaseDAO } from './baseDAO';

export class UserDAO extends BaseDAO {

	getUsers() {
		return this.getDocuments('users');
		// return [
		//   { userId: 111, userName: 'Joao 1' },
		//   { userId: 222, userName: 'Joao 2' },
		//   { userId: 333, userName: 'Joao 3' },
		//   { userId: 444, userName: 'Joao 4' },
		//   { userId: 555, userName: 'Joao 5' }];
	}

	insertUser(user) {
		return this.insertDocument('users', user);
	}
}
