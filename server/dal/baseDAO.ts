import { MongoClient, ObjectID, Db } from "mongodb";
import * as logger from 'logops';

import { MongoDB } from '../config/mongo-db';

export class BaseDAO {

	// Insert a new document in the collection.
	public insertDocument(collectionName: string, document: any): any {
		logger.info("** DAL - Collection: %j - Inserting Document: %j", collectionName, document);
		return MongoDB.getConnection().collection(collectionName).insertOne(document);
	}

	public getDocuments(collectionName: string, query = {}) {
		return MongoDB.getConnection().collection(collectionName).find(query).toArray();
	}

	public getDocument(collectionName: string, query = {}): any {
		return MongoDB.getConnection().collection(collectionName).findOne(query);
	}

	//Obter um documento pelo atributo _id passado como parâmetro
	//A funcao findOne retorna uma Promise, entao eh soh retorna-la
	public getDocumentById(collectionName: string, id: string): any {

		let idAsObjectID = ObjectID.createFromHexString(id);
		return this.getDocument(collectionName, { _id: idAsObjectID });
	}

	// Recebe o _id do documento como string, transforma em ObjectID e o remove.
	public removeDocumentById(collectionName: string, id: string): any {

		let idAsObjectID = ObjectID.createFromHexString(id);
		return MongoDB.getConnection().collection(collectionName).deleteOne({ _id: idAsObjectID });
	}

	public removeDocuments(collectionName: string, query = {}): any {
		return MongoDB.getConnection().collection(collectionName).remove(query);
	}

	public getDocumentCount(collectionName: string): any {
		return MongoDB.getConnection() && MongoDB.getConnection().collection(collectionName).count({});
	}
}
