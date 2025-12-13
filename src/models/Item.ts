import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a Content Item document in MongoDB.
 */
export interface IItem extends Document {
  collectionId: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for the Item model.
 * Stores dynamic content 'data' associated with a specific Collection.
 */
const itemSchema = new Schema(
  {
    collectionId: {
      type: String,
      required: true,
      ref: 'Collection',
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;
