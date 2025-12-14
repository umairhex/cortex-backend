import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import File from "../models/File.js";

export const uploadFile = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const { filename, originalname, mimetype, size } = req.file;
		const path = `/uploads/${filename}`;

		const newFile = new File({
			filename,
			originalName: originalname,
			path,
			mimetype,
			size,
		});

		await newFile.save();

		res.status(201).json(newFile);
	} catch (error) {
		console.error("Upload Error:", error);
		res.status(500).json({ message: "Server error during upload" });
	}
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
	try {
		if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		const files = req.files as Express.Multer.File[];
		const uploadedFiles = [];

		for (const file of files) {
			const { filename, originalname, mimetype, size } = file;
			const path = `/uploads/${filename}`;

			const newFile = new File({
				filename,
				originalName: originalname,
				path,
				mimetype,
				size,
			});

			await newFile.save();
			uploadedFiles.push(newFile);
		}

		res.status(201).json(uploadedFiles);
	} catch (error) {
		console.error("Upload Multiple Error:", error);
		res.status(500).json({ message: "Server error during upload" });
	}
};

export const getAllFiles = async (_req: Request, res: Response) => {
	try {
		const files = await File.find().sort({ createdAt: -1 });
		res.json(files);
	} catch (error) {
		console.error("Get All Files Error:", error);
		res.status(500).json({ message: "Server error fetching files" });
	}
};

export const deleteFile = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const file = await File.findById(id);

		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}
		const relativePath = file.path.startsWith("/")
			? file.path.slice(1)
			: file.path;
		const internalPath = path.join(process.cwd(), relativePath);

		if (fs.existsSync(internalPath)) {
			fs.unlinkSync(internalPath);
		}

		await File.findByIdAndDelete(id);

		res.json({ message: "File deleted successfully" });
	} catch (error) {
		console.error("Delete File Error:", error);
		res.status(500).json({ message: "Server error deleting file" });
	}
};
