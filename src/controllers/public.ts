import type { Request, Response } from "express";
import { Collection } from "../models/CollectionTypes.js";
import { getStorageAdapter } from "../services/storage.js";

/**
 * Retrieves all public collections.
 * Returns a list of collections with their basic metadata/schema.
 */
export const getPublicCollections = async (_req: Request, res: Response) => {
	try {
		const collections = await Collection.find().select(
			"id name singular plural type fields",
		);
		res.json(collections);
	} catch (error) {
		console.error("Error fetching public collections:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * Retrieves items for a specific public collection.
 * Uses the configured storage adapter to fetch data.
 */
export const getPublicItems = async (req: Request, res: Response) => {
	const collectionId = req.params.collectionId;
	if (!collectionId) {
		return res.status(400).json({ message: "Collection ID is required" });
	}

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);
		if (adapter && tableName) {
			const items = await adapter.getItems(
				tableName,
				{},
				{ sort: { _id: -1 } },
			);
			await adapter.disconnect();
			return res.json(items);
		}

		res
			.status(404)
			.json({ message: "Collection not found or no integration configured" });
	} catch (error) {
		console.error("Error fetching public items:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * Retrieves a single item by ID from a public collection.
 */
export const getPublicItemById = async (req: Request, res: Response) => {
	const { collectionId, id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "Item ID is required" });
	}

	try {
		if (!collectionId) {
			return res
				.status(400)
				.json({ message: "Collection ID is required to fetch item." });
		}

		const { adapter, tableName } = await getStorageAdapter(collectionId);
		if (adapter && tableName) {
			const item = await adapter.getItem(tableName, id);
			await adapter.disconnect();
			if (item) return res.json(item);
			return res.status(404).json({ message: "Item not found" });
		}

		res
			.status(404)
			.json({ message: "Item not found or no integration configured" });
	} catch (error) {
		console.error("Error fetching public item:", error);
		res.status(500).json({ message: "Server error" });
	}
};
