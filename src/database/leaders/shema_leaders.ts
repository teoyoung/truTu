import * as Mongoose from 'mongoose';
import {Document} from 'mongoose';

interface LeadersInt {
    owners: NumberConstructor[];
    users: NumberConstructor[];
    books: {
        uid: NumberConstructor;
        name: StringConstructor;
    }[];
}

export interface Leaders extends Document {
    owners: number[];
    users: number[];
    books: {
        uid: number;
        name: string;
    }[];
}

const shema = {
    owners: [Number],
    users: [Number],
    books: [{uid: Number, name: String}]
} as LeadersInt;

export const leaders_user = new Mongoose.Schema(shema);