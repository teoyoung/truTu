"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shema_user = void 0;
const Mongoose = require("mongoose");
const shema = {
    tgID: Number,
    name: String,
    username: String,
    returnBooks: [String],
    broughtBooks: [String]
};
exports.shema_user = new Mongoose.Schema(shema);
