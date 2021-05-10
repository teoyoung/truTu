"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database/database");
const telegtam_1 = require("./telegram/telegtam");
const fs = require("fs");
fs.readFile('./config.json', 'utf8', (err, data) => {
    const config = JSON.parse(data);
    database_1.database.connect(config.db);
    const telegta = new telegtam_1.default(config.token);
});
