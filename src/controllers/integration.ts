import type { Request, Response } from "express";
import { z } from "zod";
import Integration from "../models/Integration.js";

const integrationSchema = z.object({
	name: z.string().min(1),
	type: z.enum(["mongodb", "supabase", "postgres"]),
	config: z.record(z.string(), z.any()),
});

export const createIntegration = async (req: Request, res: Response) => {
	try {
		const validatedData = integrationSchema.parse(req.body);
		const integration = new Integration(validatedData);
		await integration.save();
		res.status(201).json(integration);
	} catch (error) {
		console.error("Create integration error:", error);
		if (error instanceof z.ZodError) {
			res.status(400).json({ errors: error.issues });
		} else {
			res.status(500).json({ message: "Server error" });
		}
	}
};

export const getIntegrations = async (_req: Request, res: Response) => {
	try {
		const integrations = await Integration.find().sort({ createdAt: -1 });
		res.json(integrations);
	} catch (error) {
		console.error("Get integrations error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteIntegration = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		await Integration.findByIdAndDelete(id);
		res.json({ message: "Integration deleted" });
	} catch (error) {
		console.error("Delete integration error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

import { MongoAdapter } from "../adapters/MongoAdapter.js";
import { PostgresAdapter } from "../adapters/PostgresAdapter.js";

/**
 * Validates a connection by attempting to connect to it.
 * This is a crucial step in the "Database-first" workflow.
 */
export const testConnection = async (req: Request, res: Response) => {
	const { id } = req.body;

	try {
		const integration = await Integration.findById(id);
		if (!integration) {
			return res.status(404).json({ message: "Integration not found" });
		}

		let success = false;
		let message = "Connection failed";

		if (integration.type === "mongodb") {
			const uri = integration.config.uri;
			if (typeof uri !== "string") throw new Error("Invalid MongoDB URI");
			const adapter = new MongoAdapter({ uri });
			success = await adapter.test();
			await adapter.disconnect();
			message = success
				? "Successfully connected to MongoDB!"
				: "Failed to connect to MongoDB. Check your URI.";
		} else if (integration.type === "postgres") {
			const uri = integration.config.uri || integration.config.connectionString;
			if (typeof uri !== "string") throw new Error("Invalid Postgres URI");
			const adapter = new PostgresAdapter({ uri });
			success = await adapter.test();
			await adapter.disconnect();
			message = success
				? "Successfully connected to PostgreSQL!"
				: "Failed to connect to PostgreSQL. Check your URI.";
		} else if (integration.type === "supabase") {
			if (integration.config.connectionString) {
				const adapter = new PostgresAdapter({
					uri: integration.config.connectionString,
				});
				success = await adapter.test();
				await adapter.disconnect();
				message = success
					? "Successfully connected to Supabase (via Postgres)!"
					: "Failed to connect. Check your connection string.";
			} else {
				message =
					"Supabase API Key testing not yet implemented. Please use Connection String for full SQL access.";
				success = true;
			}
		}

		res.json({ success, message });
	} catch (error) {
		console.error("Connection test error:", error);
		res.status(500).json({ message: "Server error during connection test" });
	}
};

import { introspector } from "../services/introspector.js";

export const invokeIntrospection = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!id)
		return res.status(400).json({ message: "Integration ID is required" });

	try {
		const tables = await introspector.listTables(id);
		res.json({ tables });
	} catch (error) {
		console.error("Introspection error:", error);
		res.status(500).json({ message: "Failed to introspect database" });
	}
};

export const invokeTableIntrospection = async (req: Request, res: Response) => {
	const { id, tableName } = req.params;
	if (!id || !tableName)
		return res
			.status(400)
			.json({ message: "Integration ID and Table Name are required" });

	try {
		const schema = await introspector.getTableSchema(id, tableName);
		res.json({ schema });
	} catch (error) {
		console.error("Table introspection error:", error);
		res.status(500).json({ message: "Failed to introspect table" });
	}
};
