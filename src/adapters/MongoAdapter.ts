import mongoose from "mongoose";
import type { StorageAdapter } from "./StorageAdapter.js";

export class MongoAdapter implements StorageAdapter {
	private uri: string;
	private connection: mongoose.Connection | null = null;

	constructor(config: { uri: string }) {
		this.uri = config.uri;
	}

	/**
	 * Connects to the MongoDB database using the provided URI.
	 * Uses a separate Mongoose connection to avoid conflicts with the main application connection.
	 * @throws Will throw an error if connection fails.
	 */
	async connect(): Promise<void> {
		if (this.connection && this.connection.readyState === 1) return;

		try {
			this.connection = await mongoose.createConnection(this.uri).asPromise();
			console.log("MongoAdapter: Connected successfully");
		} catch (error) {
			console.error("MongoAdapter: Connection failed", error);
			throw error;
		}
	}

	/**
	 * Tests the database connection.
	 * @returns True if connection is successful, false otherwise.
	 */
	async test(): Promise<boolean> {
		try {
			await this.connect();
			return true;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Closes the database connection.
	 */
	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.close();
			this.connection = null;
		}
	}

	/**
	 * Lists all collections (tables) in the database.
	 * @returns A list of collection names.
	 */
	async listTables(): Promise<string[]> {
		if (!this.connection) await this.connect();

		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collections = await db.listCollections().toArray();
		return collections.map((c) => c.name);
	}

	/**
	 * Infers a schema from a sample of documents in a collection.
	 * @param tableName - The name of the collection to inspect.
	 * @returns A simplified schema object mapping field names to types.
	 */
	async getTableSchema(tableName: string): Promise<Record<string, string>> {
		if (!this.connection) await this.connect();

		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);
		const docs = await collection.find().limit(5).toArray();

		const schema: Record<string, string> = {};

		docs.forEach((doc) => {
			Object.keys(doc).forEach((key) => {
				if (key === "_id") return;
				const type = typeof doc[key];
				if (type === "object" && doc[key] instanceof Date) {
					schema[key] = "date";
				} else if (type === "object" && Array.isArray(doc[key])) {
					schema[key] = "array";
				} else {
					schema[key] = type;
				}
			});
		});

		return schema;
	}

	/**
	 * Creates a new document in the specified collection.
	 * @param tableName - The name of the collection.
	 * @param data - The data to insert.
	 * @returns The created document with its ID.
	 */
	async createItem(
		tableName: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		if (!this.connection) await this.connect();
		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);
		const result = await collection.insertOne(data);
		return { ...data, _id: result.insertedId };
	}

	/**
	 * Retrieves documents from a collection.
	 * @param tableName - The name of the collection.
	 * @param _filter - Query filter (currently unused/passed through).
	 * @param options - Query options like sort.
	 * @returns An array of documents.
	 */
	async getItems(
		tableName: string,
		_filter: Record<string, unknown> = {},
		options: Record<string, unknown> = {},
	): Promise<Record<string, unknown>[]> {
		if (!this.connection) await this.connect();
		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);

		const cursor = collection.find({});
		if (options.sort) {
			// biome-ignore lint/suspicious/noExplicitAny: Mongoose sort accepts flexibility that we're passing through
			cursor.sort(options.sort as any);
		}
		return (await cursor.toArray()) as Record<string, unknown>[];
	}

	/**
	 * Retrieves a single document by ID.
	 * @param tableName - The name of the collection.
	 * @param id - The ID of the document.
	 * @returns The document or null if not found.
	 */
	async getItem(
		tableName: string,
		id: string,
	): Promise<Record<string, unknown> | null> {
		if (!this.connection) await this.connect();
		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);
		let query: Record<string, unknown>;
		try {
			query = { _id: new mongoose.Types.ObjectId(id) };
		} catch {
			query = { _id: id };
		}
		return (await collection.findOne(query)) as Record<string, unknown> | null;
	}

	/**
	 * Updates a document by ID.
	 * @param tableName - The name of the collection.
	 * @param id - The ID of the document.
	 * @param data - The update data (using $set).
	 * @returns The updated document.
	 */
	async updateItem(
		tableName: string,
		id: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown> | null> {
		if (!this.connection) await this.connect();
		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);
		let query: Record<string, unknown>;
		try {
			query = { _id: new mongoose.Types.ObjectId(id) };
		} catch {
			query = { _id: id };
		}
		const result = await collection.findOneAndUpdate(
			query as Record<string, unknown>,
			{ $set: data },
			{ returnDocument: "after" },
		);
		return result as Record<string, unknown> | null;
	}

	/**
	 * Deletes a document by ID.
	 * @param tableName - The name of the collection.
	 * @param id - The ID of the document.
	 * @returns True if deleted, false otherwise.
	 */
	async deleteItem(tableName: string, id: string): Promise<boolean> {
		if (!this.connection) await this.connect();
		const db = this.connection?.db;
		if (!db) throw new Error("Database not connected");
		const collection = db.collection(tableName);
		let query: Record<string, unknown>;
		try {
			query = { _id: new mongoose.Types.ObjectId(id) };
		} catch {
			query = { _id: id };
		}
		const result = await collection.deleteOne(query as Record<string, unknown>);
		return result.deletedCount === 1;
	}
}
