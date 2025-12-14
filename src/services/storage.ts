import { MongoAdapter } from "../adapters/MongoAdapter.js";
import { PostgresAdapter } from "../adapters/PostgresAdapter.js";
import type { StorageAdapter } from "../adapters/StorageAdapter.js";
import { Collection } from "../models/CollectionTypes.js";
import Integration from "../models/Integration.js";

/**
 * Helper to get storage adapter if collection is external
 */
export async function getStorageAdapter(
	collectionId: string,
): Promise<{ adapter: StorageAdapter | null; tableName: string | null }> {
	console.log(`[Storage] Lookup for collection: ${collectionId}`);
	const collection = await Collection.findOne({ id: collectionId });

	if (!collection) {
		console.log(`[Storage] Collection not found in DB`);
		return { adapter: null, tableName: null };
	}

	if (!collection.integrationId) {
		console.log(`[Storage] Collection has no integrationId`);
		return { adapter: null, tableName: null };
	}

	const integration = await Integration.findById(collection.integrationId);
	if (!integration) {
		console.log(`[Storage] Integration ${collection.integrationId} not found`);
		return { adapter: null, tableName: null };
	}

	console.log(`[Storage] Found integration type: ${integration.type}`);

	if (integration.type === "mongodb") {
		return {
			adapter: new MongoAdapter(integration.config as { uri: string }),
			tableName: collection.externalTableName || collectionId,
		};
	}

	if (integration.type === "postgres") {
		return {
			adapter: new PostgresAdapter(integration.config as { uri: string }),
			tableName: collection.externalTableName || collectionId,
		};
	}

	return { adapter: null, tableName: null };
}
