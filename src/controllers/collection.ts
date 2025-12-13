import type { Request, Response } from 'express';
import { z } from 'zod';
import { Collection } from '../models/CollectionTypes.js';

/**
 * Zod schema for collection field
 */
const collectionFieldSchema = z.object({
    field_name: z.string().min(1).max(100).trim(),
    type: z.string().min(1).max(50).trim(),
    label: z.string().min(1).max(100).trim()
});

/**
 * Zod schema for creating a collection
 */
const createCollectionSchema = z.object({
    id: z.string().min(1).max(50).trim(),
    name: z.string().min(1).max(100).trim(),
    singular: z.string().min(1).max(50).trim(),
    plural: z.string().min(1).max(50).trim(),
    type: z.enum(['collection', 'single']),
    fields: z.array(collectionFieldSchema)
});

/**
 * Controller to create a new collection
 * @param req - Express request object
 * @param res - Express response object
 */
export async function createCollection(req: Request, res: Response): Promise<void> {
    try {
        const validatedData = createCollectionSchema.parse(req.body);
        const newCollection = new Collection(validatedData);
        await newCollection.save();
        res.status(201).json(newCollection);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error creating collection:', error.issues);
            res.status(400).json({ message: 'Validation error', errors: error.issues });
        } else {
            console.error('Error creating collection:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

/**
 * Controller to get all collections
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getCollections(req: Request, res: Response): Promise<void> {
    try {
        const collections = await Collection.find();
        res.status(200).json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Controller to get a collection by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getCollectionById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const collection = await Collection.findOne({ id });
        if (!collection) {
            console.error(`Collection with id '${id}' not found`);
            res.status(404).json({ message: 'Collection not found' });
            return;
        }
        res.status(200).json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Zod schema for updating a collection (partial)
 */
const updateCollectionSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    singular: z.string().min(1).max(50).trim().optional(),
    plural: z.string().min(1).max(50).trim().optional(),
    type: z.enum(['collection', 'single']).optional(),
    fields: z.array(collectionFieldSchema).optional()
});

/**
 * Controller to update a collection by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export async function updateCollection(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const validatedData = updateCollectionSchema.parse(req.body);

        const updatedCollection = await Collection.findOneAndUpdate(
            { id },
            validatedData,
            { new: true, runValidators: true }
        );

        if (!updatedCollection) {
            console.error(`Collection with id '${id}' not found for update`);
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        res.status(200).json(updatedCollection);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error updating collection:', error.issues);
            res.status(400).json({ message: 'Validation error', errors: error.issues });
        } else {
            console.error('Error updating collection:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

/**
 * Controller to delete a collection by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export async function deleteCollection(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const deletedCollection = await Collection.findOneAndDelete({ id });

        if (!deletedCollection) {
            console.error(`Collection with id '${id}' not found for deletion`);
            res.status(404).json({ message: 'Collection not found' });
            return;
        }

        res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}