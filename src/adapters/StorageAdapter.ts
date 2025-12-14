/**
 * Interface for Storage Adapters.
 * This abstraction allows Cortex to interact with any database (Mongo, Postgres, etc.)
 * in a uniform way, enabling the "Vendor-agnostic" principle.
 */
export interface StorageAdapter {
	/**
	 * Connect to the database.
	 */
	connect(): Promise<void>;

	/**
	 * Test the connection.
	 */
	test(): Promise<boolean>;

	/**
	 * Disconnect/Close the connection.
	 */
	disconnect(): Promise<void>;

	/**
	 * Introspect the database to find tables/collections.
	 * @returns A list of table/collection names.
	 */
	listTables(): Promise<string[]>;

	/**
	 * Introspect a specific table to find its schema.
	 * @param tableName The name of the table/collection.
	 */
	getTableSchema(tableName: string): Promise<Record<string, string>>;
	createItem(
		tableName: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown>>;
	getItems(
		tableName: string,
		filter?: Record<string, unknown>,
		options?: Record<string, unknown>,
	): Promise<Record<string, unknown>[]>;
	getItem(
		tableName: string,
		id: string,
	): Promise<Record<string, unknown> | null>;
	updateItem(
		tableName: string,
		id: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown> | null>;
	deleteItem(tableName: string, id: string): Promise<boolean>;
}
