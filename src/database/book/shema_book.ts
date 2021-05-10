import * as Mongoose from 'mongoose';
import {Document} from 'mongoose';

export interface Book extends Document {
    uid: number;
    name_book: string;
}

export const shema_book = new Mongoose.Schema({
    uid: Number,
    name_book: String,
    owner: String,
    user: String,
    readers: [String],
    date: Date
});