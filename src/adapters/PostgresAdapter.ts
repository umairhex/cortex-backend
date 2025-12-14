import pg from "pg";
import type { StorageAdapter } from "./StorageAdapter.js";

const { Pool } = pg;

/**
 * PostgreSQL implementation of the StorageAdapter.
 * Allows Cortex to use PostgreSQL (and compatible databases like Supabase) as the backend.
 */
export class PostgresAdapter implements StorageAdapter {
	private pool: pg.Pool;
	private uri: string;

	/**
	 * Creates an instance of PostgresAdapter.
	 * @param config - Configuration object containing the connection URI.
	 */
	constructor(config: { uri: string }) {
		this.uri = config.uri;
		this.pool = new Pool({
			connectionString: this.uri,
		});
	}

	/**
	 * Connects to the database.
	 * For the pg Pool, this effectively validates the configuration.
	 */
	async connect(): Promise<void> {
		try {
			const client = await this.pool.connect();
			client.release();
			console.log("PostgresAdapter: Connected successfully");
		} catch (error) {
			console.error("PostgresAdapter: Connection failed", error);
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
	 * Disconnects from the database.
	 * Ends the connection pool.
	 */
	async disconnect(): Promise<void> {
		await this.pool.end();
	}

	/**
	 * Lists all public tables in the database.
	 * Excludes standard system tables and information_schema.
	 * @returns A list of table names.
	 */
	async listTables(): Promise<string[]> {
		const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
		const result = await this.pool.query(query);
		return result.rows.map((row) => row.table_name);
	}

	/**
	 * Retrieves the schema for a specific table.
	 * Maps PostgreSQL data types to a simplified schema format.
	 * @param tableName - The name of the table.
	 * @returns An object representing the table schema.
	 */
	async getTableSchema(tableName: string): Promise<Record<string, string>> {
		const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
    `;
		const result = await this.pool.query(query, [tableName]);

		const schema: Record<string, string> = {};
		result.rows.forEach((row) => {
			let type = row.data_type;

			if (
				type.includes("int") ||
				type.includes("float") ||
				type.includes("numeric")
			) {
				type = "number";
			} else if (type.includes("char") || type.includes("text")) {
				type = "string";
			} else if (type.includes("bool")) {
				type = "boolean";
			} else if (type.includes("timestamp") || type.includes("date")) {
				type = "date";
			} else if (type === "json" || type === "jsonb") {
				type = "object";
			}
			schema[row.column_name] = type;
		});
		return schema;
	}

	/**
	 * Creates a new item (row) in the specified table.
	 * @param tableName - The name of the table.
	 * @param data - The data directly mapped to columns.
	 * @returns The created item.
	 */
	async createItem(
		tableName: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		const columns = Object.keys(data).join(", ");

		const placeholders = Object.keys(data)
			.map((_, i) => `$${i + 1}`)
			.join(", ");
		const values = Object.values(data);

		const query = `
      INSERT INTO "${tableName}" (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;
		const result = await this.pool.query(query, values);
		return result.rows[0];
	}

	/**
	 * Retrieves items from a table.
	 * @param tableName - The name of the table.
	 * @param _filter - Optional filter (not fully implemented for generic SQL yet, acts as 'all').
	 * @param options - Optional query options like sort, limit, etc.
	 * @returns An array of items.
	 */
	async getItems(
		tableName: string,
		_filter: Record<string, unknown> = {},
		options: Record<string, unknown> = {},
	): Promise<Record<string, unknown>[]> {
		let query = `SELECT * FROM "${tableName}"`;

		if (options.limit) {
			query += ` LIMIT ${parseInt(String(options.limit), 10)}`;
		}

		const result = await this.pool.query(query);
		return result.rows;
	}

	/**
	 * Retrieves a single item by ID.
	 * Assumes a standard 'id' column exists, or tries to find a Primary Key.
	 * For this implementation, we assume a column named 'id' exists.
	 * @param tableName - The name of the table.
	 * @param id - The ID of the item.
	 * @returns The found item or null.
	 */
	async getItem(
		tableName: string,
		id: string,
	): Promise<Record<string, unknown> | null> {
		const query = `SELECT * FROM "${tableName}" WHERE id = $1`;
		try {
			const result = await this.pool.query(query, [id]);
			return result.rows[0] || null;
		} catch (_e) {
			try {
				const query2 = `SELECT * FROM "${tableName}" WHERE _id = $1`;
				const result2 = await this.pool.query(query2, [id]);
				return result2.rows[0] || null;
			} catch (_e2) {
				return null;
			}
		}
	}

	/**
	 * Updates an item by ID.
	 * @param tableName - The name of the table.
	 * @param id - The ID of the item.
	 * @param data - The data to update.
	 * @returns The updated item.
	 */
	async updateItem(
		tableName: string,
		id: string,
		data: Record<string, unknown>,
	): Promise<Record<string, unknown> | null> {
		const keys = Object.keys(data);
		const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(", ");
		const values = [id, ...Object.values(data)];

		const query = `
      UPDATE "${tableName}"
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
		const result = await this.pool.query(query, values);
		return result.rows[0];
	}

	/**
	 * Deletes an item by ID.
	 * @param tableName - The name of the table.
	 * @param id - The ID of the item.
	 * @returns True if deleted, false otherwise.
	 */
	async deleteItem(tableName: string, id: string): Promise<boolean> {
		const query = `DELETE FROM "${tableName}" WHERE id = $1`;
		const result = await this.pool.query(query, [id]);
		return (result.rowCount ?? 0) > 0;
	}
}
