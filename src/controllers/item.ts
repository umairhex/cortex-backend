import type { Request, Response } from 'express';
import Item from '../models/Item.js';
import { Collection } from '../models/CollectionTypes.js';

/**
 * Create a new item in a collection.
 * POST /api/collections/:collectionId/items
 */
export const createItem = async (req: Request, res: Response) => {
  const { collectionId } = req.params;
  const { data } = req.body;

  try {
   
    const collection = await Collection.findOne({ id: collectionId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

   
   
   
   
    
    const newItem = new Item({
      collectionId,
      data: data || {},
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all items for a specific collection.
 * GET /api/collections/:collectionId/items
 */
export const getItems = async (req: Request, res: Response) => {
  const { collectionId } = req.params;

  try {
    const items = await Item.find({ collectionId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single item by ID.
 * GET /api/items/:id
 */
export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an item by ID.
 * PUT /api/items/:id
 */
export const updateItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { 
        $set: { data }
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an item by ID.
 * DELETE /api/items/:id
 */
export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
