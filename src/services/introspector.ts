import { MongoAdapter } from "../adapters/MongoAdapter.js";
import type { StorageAdapter } from "../adapters/StorageAdapter.js";
import Integration, { type IIntegration } from "../models/Integration.js";

class IntrospectorService {
	private getAdapter(integration: IIntegration): StorageAdapter {
		if (integration.type === "mongodb") {
			if (typeof integration.config.uri !== "string")
				throw new Error("Invalid MongoDB URI");
			return new MongoAdapter({ uri: integration.config.uri });
		}

		throw new Error(`Unsupported integration type: ${integration.type}`);
	}

	/**
	 * List all tables/collections in the connected database.
	 */
	async listTables(integrationId: string): Promise<string[]> {
		const integration = await Integration.findById(integrationId);
		if (!integration) throw new Error("Integration not found");

		const adapter = this.getAdapter(integration);
		try {
			return await adapter.listTables();
		} finally {
			await adapter.disconnect();
		}
	}

	/**
	 * Get the inferred schema for a specific table/collection.
	 */
	async getTableSchema(
		integrationId: string,
		tableName: string,
	): Promise<Record<string, string>> {
		const integration = await Integration.findById(integrationId);
		if (!integration) throw new Error("Integration not found");

		const adapter = this.getAdapter(integration);
		try {
			return await adapter.getTableSchema(tableName);
		} finally {
			await adapter.disconnect();
		}
	}
}

export const introspector = new IntrospectorService();
