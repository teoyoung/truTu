import { database } from './database/database';
import Telegram from './telegram/telegtam';
import * as fs from 'fs';

interface Config {
    token: string;
    db: string;
}

fs.readFile('./config.json', 'utf8', (err, data) => {
    const config = JSON.parse(data) as Config;
    database.connect(config.db);
    const telegta = new Telegram(config.token);
});