import * as Mongoose from 'mongoose';
import {Document} from 'mongoose';

interface UserInt {
    tgID: NumberConstructor;
    name: StringConstructor;
    username: StringConstructor;
    returnBooks:  StringConstructor[];
    broughtBooks: StringConstructor[];
}

export interface UserSheme extends Document {
    tgID: number;
    name: String;
    username: String;
    returnBooks: String[];
    broughtBooks: String[];
}

const shema = {
    tgID: Number,
    name: String,
    username: String,
    returnBooks: [String],
    broughtBooks: [String]
} as UserInt;

export const shema_user = new Mongoose.Schema(shema);