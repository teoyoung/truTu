"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TelegramBot = require("node-telegram-bot-api");
const database_1 = require("../database/database");
const messages_servis_1 = require("../messages/messages_servis");
const addKey = '123456789';
const takeKey = '123456789';
const returnKey = '123456789';
const warning = '259617795';
class Telegram {
    constructor(token) {
        const bot = new TelegramBot(token, { polling: true });
        bot.onText(/\/start/, (msg) => {
            bot.sendMessage(msg.chat.id, messages_servis_1.message_start, { parse_mode: 'Markdown' });
        });
        bot.onText(/\/add (.+)/, (msg, [command, data]) => {
            const info = data.split(' ');
            const { id, username, first_name } = msg.chat;
            const uid = +info.shift();
            const key = info.shift();
            const name_book = info.join(' ');
            if (isNaN(uid)) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_id);
                return;
            }
            if (!key || key !== addKey) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_key);
                return;
            }
            if (!name_book) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_name_book);
                return;
            }
            const dataBook = {
                tgID_owner: id,
                name_book,
                uid,
                username_owner: username,
                name_owner: first_name
            };
            database_1.database.addBook(dataBook, () => { bot.sendMessage(id, messages_servis_1.AddBookMessage('Complete', { uid, name_book }), { parse_mode: 'Markdown' }); }, () => {
                bot.sendMessage(id, messages_servis_1.AddBookMessage('Warning', { uid, name_book }), { parse_mode: 'Markdown' });
                bot.sendMessage(warning, `Warning: ${messages_servis_1.AddBookMessage('Warning', { uid, name_book })}`, { parse_mode: 'Markdown' });
            }, () => {
                bot.sendMessage(id, 'Что-то пошло не так');
            });
        });
        bot.onText(/\/take (.+)/, (msg, [command, data]) => {
            const { id, username, first_name } = msg.chat;
            const info = data.split(' ');
            const id_book = +info.shift();
            const key = info.shift();
            if (isNaN(id_book)) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_id);
                return;
            }
            if (typeof id_book !== 'number') {
                bot.sendMessage(id, messages_servis_1.message_incorrect_id);
                return;
            }
            if (!key || key !== takeKey) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_key);
                return;
            }
            const dataBook = { uid: id_book, tgID_user: id, name_user: first_name, username_user: username };
            database_1.database.takeBook(dataBook, (idOwner, nameBook) => {
                bot.sendMessage(id, `📘 Вы взяли почитать книгу почитать книгу «${nameBook}» `);
                bot.sendMessage(idOwner, `📘 ${first_name} (@${username}) взял(а) почитать книгу «${nameBook}» `);
            }, (nameBook) => {
                bot.sendMessage(id, `📙 Книга ${nameBook} (ID ${id_book}) уже взята`);
            }, (userError, adminError) => {
                if (userError) {
                    bot.sendMessage(id, userError);
                }
                bot.sendMessage(warning, adminError, { parse_mode: 'Markdown' });
            });
        });
        bot.onText(/\/return (.+)/, (msg, [command, data]) => {
            const { id, username, first_name } = msg.chat;
            const info = data.split(' ');
            const uid = +info.shift();
            const key = info.shift();
            if (isNaN(uid)) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_id);
                return;
            }
            if (!key || key !== returnKey) {
                bot.sendMessage(id, messages_servis_1.message_incorrect_key);
                return;
            }
            database_1.database.returnBook({ tgID_user: id, uid, username }, (name_book, ownerID) => {
                bot.sendMessage(id, `📗 Книга ${name_book} возращена. Надеюсь она вам понравилась`);
                if (ownerID && ownerID !== null) {
                    bot.sendMessage(ownerID, `📘 ${first_name} (@${username}) вернул(а) прочитанную книгу ${name_book} `);
                }
            }, (userError, adminError) => {
                if (userError) {
                    bot.sendMessage(id, userError);
                }
                if (adminError) {
                    bot.sendMessage(warning, adminError, { parse_mode: 'Markdown' });
                }
            });
        });
        bot.onText(/\/all/, (msg) => {
            database_1.database.allBooks((books) => bot.sendMessage(msg.chat.id, books, { parse_mode: 'Markdown' }));
        });
        bot.onText(/\/top/, (msg) => {
            database_1.database.getTop((topDonat, topUsers, bookTop) => {
                const prize = [`🥇`, `🥈`, `🥉`];
                const messageTop = topDonat.map((user, i) => {
                    const coin = prize[i] ? prize[i] : `🏅`;
                    return `${coin} *${i + 1} место:* ${user.name} (${user.scope})`;
                });
                const messageTopUsers = topUsers.map((user, i) => {
                    const coin = prize[i] ? prize[i] : `🏅`;
                    return `${coin} *${i + 1} место:* ${user.name} (${user.scope})`;
                });
                const messageTopBook = bookTop.map((book, i) => {
                    const coin = prize[i] ? prize[i] : `🏅`;
                    return `${coin} *${i + 1} место:* ${book.name} (${book.scope})`;
                });
                bot.sendMessage(msg.chat.id, messages_servis_1.TopMessage('*Топ владельцев книг*', messageTop), { parse_mode: 'Markdown' });
                bot.sendMessage(msg.chat.id, messages_servis_1.TopMessage('*Топ читателей книг*', messageTopUsers), { parse_mode: 'Markdown' });
                bot.sendMessage(msg.chat.id, messages_servis_1.TopMessage('*Топ читаемых книг*', messageTopBook), { parse_mode: 'Markdown' });
            }, (userError, adminError) => {
                if (userError) {
                    bot.sendMessage(msg.chat.id, userError);
                }
                if (adminError) {
                    bot.sendMessage(warning, adminError, { parse_mode: 'Markdown' });
                }
            });
        });
    }
}
exports.default = Telegram;
