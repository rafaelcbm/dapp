import { MongoClient, ObjectID, Db } from "mongodb";
import * as logger from 'logops';

import { mongoUrl } from './constants';

export class MongoDB {

	private static dbConnection: Db = null;

	public static getConnection(): Db {
		try {
			if (MongoDB.dbConnection) {
				logger.info('## Conexão existente retornada');
				return MongoDB.dbConnection;
			} else {
				MongoDB.connect().then(conn => {
					logger.error('## Obtendo nova conexão', MongoDB.dbConnection);

					MongoDB.dbConnection = conn
					return MongoDB.dbConnection;
				});
			}
		} catch (err) {
			logger.error('## Erro ao obter conexão com MongoBD: %j', err);
			throw err;
		}
	}

	public static async connect() {
		try {
			if (!MongoDB.dbConnection) {
				MongoDB.dbConnection = await MongoClient.connect(mongoUrl);
				logger.info('## Conectado com sucesso com o MongoBD', MongoDB.dbConnection);
			}

			return MongoDB.dbConnection;
		} catch (err) {
			logger.error('## Erro ao tentar se conectar com MongoBD: %j', err);
			throw err;
		}
	}

	// Close the existing connection.
	public closeDbConnection() {
		if (MongoDB.dbConnection) {
			MongoDB.dbConnection.close();
			MongoDB.dbConnection = null;
		}
	}
}
