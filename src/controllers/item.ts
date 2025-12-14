import type { Request, Response } from "express";
import { getStorageAdapter } from "../services/storage.js";

export const createItem = async (req: Request, res: Response) => {
	const collectionId = req.params.collectionId as string;
	const { data } = req.body;

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);

		if (!adapter || !tableName) {
			return res.status(400).json({
				message:
					"Database integration required. Please configure MongoDB, PostgreSQL, or Supabase in API Integration settings.",
				code: "NO_INTEGRATION",
			});
		}

		const result = await adapter.createItem(tableName, data || {});
		await adapter.disconnect();
		return res.status(201).json(result);
	} catch (error) {
		console.error("Error creating item:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getItems = async (req: Request, res: Response) => {
	const collectionId = req.params.collectionId as string;

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);

		if (!adapter || !tableName) {
			return res.status(400).json({
				message: "Database integration required.",
				code: "NO_INTEGRATION",
			});
		}

		const items = await adapter.getItems(tableName, {}, { sort: { _id: -1 } });
		await adapter.disconnect();
		return res.json(items);
	} catch (error) {
		console.error("Error fetching items:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getItemById = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const collectionId = req.params.collectionId as string;

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);

		if (!adapter || !tableName) {
			return res.status(400).json({
				message: "Database integration required.",
				code: "NO_INTEGRATION",
			});
		}

		const item = await adapter.getItem(tableName, id);
		await adapter.disconnect();
		if (!item) return res.status(404).json({ message: "Item not found" });
		return res.json(item);
	} catch (error) {
		console.error("Error fetching item:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateItem = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const collectionId = req.params.collectionId as string;
	const { data } = req.body;

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);

		if (!adapter || !tableName) {
			return res.status(400).json({
				message: "Database integration required.",
				code: "NO_INTEGRATION",
			});
		}

		const result = await adapter.updateItem(tableName, id, data);
		await adapter.disconnect();
		if (!result) return res.status(404).json({ message: "Item not found" });
		return res.json(result);
	} catch (error) {
		console.error("Error updating item:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteItem = async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const collectionId = req.params.collectionId as string;

	try {
		const { adapter, tableName } = await getStorageAdapter(collectionId);

		if (!adapter || !tableName) {
			return res.status(400).json({
				message: "Database integration required.",
				code: "NO_INTEGRATION",
			});
		}

		const result = await adapter.deleteItem(tableName, id);
		await adapter.disconnect();
		if (!result) return res.status(404).json({ message: "Item not found" });
		return res.json({ message: "Item deleted successfully" });
	} catch (error) {
		console.error("Error deleting item:", error);
		res.status(500).json({ message: "Server error" });
	}
};
