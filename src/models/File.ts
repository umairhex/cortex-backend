import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
}

const fileSchema = new Schema(
    {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IFile>('File', fileSchema);
