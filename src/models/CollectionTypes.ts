import mongoose from "mongoose";

/**
 * Interface for collection field schema
 */
interface ICollectionField {
	field_name: string;
	type: string;
	label: string;
	required?: boolean;
}

/**
 * Interface for collection schema
 */
interface ICollection {
	id: string;
	name: string;
	singular: string;
	plural: string;
	type: "collection" | "single";
	fields: ICollectionField[];
	integrationId?: string;
	externalTableName?: string;
}

/**
 * Schema for collection fields
 */
const collectionFieldSchema = new mongoose.Schema<ICollectionField>({
	field_name: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 100,
	},
	type: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 50,
	},
	label: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: 100,
	},
	required: { type: Boolean, required: false, default: false },
});

/**
 * Schema for collections
 */
const collectionSchema = new mongoose.Schema<ICollection>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 1,
			maxlength: 50,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 100,
		},
		singular: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 50,
		},
		plural: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 50,
		},
		type: { type: String, enum: ["collection", "single"], required: true },
		fields: [collectionFieldSchema],
		integrationId: { type: String, required: false },
		externalTableName: { type: String, required: false },
	},
	{ timestamps: true, versionKey: false },
);

export const Collection = mongoose.model<ICollection>(
	"Collection",
	collectionSchema,
);
