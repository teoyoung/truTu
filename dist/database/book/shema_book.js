"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shema_book = void 0;
const Mongoose = require("mongoose");
exports.shema_book = new Mongoose.Schema({
    uid: Number,
    name_book: String,
    owner: String,
    user: String,
    readers: [String],
    date: Date
});
