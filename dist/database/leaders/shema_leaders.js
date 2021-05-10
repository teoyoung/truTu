"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaders_user = void 0;
const Mongoose = require("mongoose");
const shema = {
    owners: [Number],
    users: [Number],
    books: [{ uid: Number, name: String }]
};
exports.leaders_user = new Mongoose.Schema(shema);
