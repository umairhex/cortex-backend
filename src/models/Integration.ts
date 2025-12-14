import mongoose, { type Document, Schema } from "mongoose";

export interface IIntegration extends Document {
	name: string;
	type: "mongodb" | "supabase" | "postgres";
	config: {
		uri?: string;
		url?: string;
		apiKey?: string;
		connectionString?: string;
	};
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const integrationSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		type: {
			type: String,
			enum: ["mongodb", "supabase", "postgres"],
			required: true,
		},
		config: {
			type: Schema.Types.Mixed,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

const Integration = mongoose.model<IIntegration>(
	"Integration",
	integrationSchema,
);

export default Integration;
