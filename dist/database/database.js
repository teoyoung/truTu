"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const Mongoose = require("mongoose");
const shema_user_1 = require("./user/shema_user");
const shema_book_1 = require("./book/shema_book");
const mongodb = require("mongodb");
const messages_servis_1 = require("../messages/messages_servis");
const colletionBooks = 'books';
const colletionUsers = 'users';
class Database {
    connect(url) {
        if (this.db) {
            return;
        }
        Mongoose.connect(url, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        Mongoose.connection.once('open', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to database');
        }));
        this.db = Mongoose.connection;
    }
    disconnect() {
        if (!this.db) {
            return;
        }
        Mongoose.disconnect();
    }
    addBook(param, onComplete, onHave, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, tgID_owner, username_owner, name_owner, name_book } = param;
            try {
                const booksCollection = Mongoose.model(colletionBooks, shema_book_1.shema_book, colletionBooks);
                const userCollection = Mongoose.model(colletionUsers, shema_user_1.shema_user, colletionUsers);
                const ownerFind = yield userCollection.findOne({ tgID: tgID_owner }).exec();
                const bookFind = yield booksCollection.findOne({ uid }).exec();
                if (bookFind) {
                    onHave();
                    return;
                }
                if (ownerFind === null) {
                    yield userCollection.create({
                        tgID: tgID_owner,
                        name: name_owner,
                        username: username_owner,
                        returnBooks: [],
                        broughtBooks: []
                    });
                }
                const owner = yield userCollection.findOne({ tgID: tgID_owner }).exec();
                if (!owner || owner === null) {
                    onError(`????????????! ???? ???? ???????????? ???????????????????????????????? ?????? ?????? ????????????????????????. ???????????????? ????????????????????. `, `Warning: /take ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????. @${username_owner}`);
                    return;
                }
                const ownerID = owner.get('id');
                if (!ownerID) {
                    onError(`?????????????? ???????????? ?????? ???????????????? ?????????? ????????????`, `Warning: /addBook UID ${uid} ?????????????? ???????????? ?????? ???????????????? ?????????? ????????????. @${username_owner}`);
                    return;
                }
                yield booksCollection.create({
                    uid: uid,
                    name_book: name_book,
                    owner: ownerID,
                    readers: []
                })
                    .then((book) => {
                    const broughtBooks = owner.get('broughtBooks');
                    const bookID = new mongodb.ObjectID(book.get('id'));
                    broughtBooks.push(bookID);
                    owner.save();
                    onComplete();
                })
                    .catch((error) => {
                    onError(`???????????? ?????? ???????????? ?????????? ?? ??????????????. ?????????? ??????????????????`, `Warning: /addBook @${username_owner} UID: ${uid} ::: ${error}`);
                });
            }
            catch (error) {
                onError(`?????????????????????? ????????????. ?????????? ??????????????????`, `Warning: /addBook @${username_owner} UID: ${uid} ::: ${error}`);
            }
        });
    }
    takeBook(param, onComplete, onIsTake, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, tgID_user, username_user, name_user } = param;
            try {
                const booksCollection = Mongoose.model(colletionBooks, shema_book_1.shema_book, colletionBooks);
                const userCollection = Mongoose.model(colletionUsers, shema_user_1.shema_user, colletionUsers);
                const book = yield booksCollection.findOne({ uid }).exec();
                if (!book || book === null) {
                    onError(`????????????! ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????.`, `Warning: /take ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????. @${username_user}`);
                    return;
                }
                const userFind = yield userCollection.findOne({ tgID: tgID_user }).exec();
                if (userFind === null) {
                    yield userCollection.create({
                        tgID: tgID_user,
                        name: name_user,
                        username: username_user
                    });
                }
                const nameBook = book.get('name_book');
                const user = yield userCollection.findOne({ tgID: tgID_user }).exec();
                if (!user || user === null) {
                    onError(`????????????! ???? ???? ???????????? ?????????? ?????? ?????? ????????????????????????. `, `Warning: /take ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????. @${username_user}`);
                    return;
                }
                const userID = user.get('id');
                if (!userID || user === null) {
                }
                if (book.get('user')) {
                    onIsTake(nameBook);
                    return;
                }
                book.set({
                    user: new mongodb.ObjectID(book.get(userID)),
                    date: new Date()
                });
                book.save();
                const owner = yield userCollection.findOne({ _id: book.get('owner') }).exec();
                if (!owner || owner === null) {
                    onError(undefined, `Warning: /take ????... ???????????????? ?????????? ???? ???????????? UID: ${uid}`);
                }
                const IDowner = owner.get ? owner.get('tgID') : undefined;
                onComplete(IDowner, nameBook);
            }
            catch (error) {
                onError(`?????????????????????? ????????????. ?????????? ??????????????????`, `Warning: /take @${username_user} UID: ${uid} ::: ${error}`);
            }
        });
    }
    returnBook(data, onComplete, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, tgID_user, username } = data;
            try {
                const booksCollection = Mongoose.model(colletionBooks, shema_book_1.shema_book, colletionBooks);
                const userCollection = Mongoose.model(colletionUsers, shema_user_1.shema_user, colletionUsers);
                const book = yield booksCollection.findOne({ uid }).exec();
                const user = yield userCollection.findOne({ tgID: tgID_user }).exec();
                // TODO ??????????????????, ???????? ?????????????? ???? ????????, ???? ???????????? ??????????
                if (!book || book === null) {
                    onError(`????????????! ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????.`, `Warning: /return ?????????? ?? ?????????? UID ${uid} ???? ??????????????. ???????????????????? ????????????????????????. @${username}`);
                    return;
                }
                if (!user || user === null) {
                    onError(`??????????????, ???? ???? ?????????? ?????? ?????? ???????????????? ??????????. ???????????????? ?????????? ???? ??????????. ???????? ???????????? ?????????? ??????????, ???????????????????????????? ???????????????? /take`, `Warning: /return ?????? ?????????? ?? ?????????? tgID ${tgID_user} @${username}`);
                    return;
                }
                const name_book = book.get('name_book');
                const owner = yield userCollection.findOne({ _id: book.get('owner') }).exec();
                const ownerID = owner.get('tgID');
                const isTaken = book.get('user');
                if (!isTaken) {
                    onError(`??????????????. ?? ?????? ????????????????, ?????? ?????????? ?????????? ???? ??????????. ???????????????? ?????????? ???? ??????????, ?????? ???????????????? ????????????`, `Warning: /return ?? ?????? ????????????????, ?????? ?????????? ?????????? ???? ?????????? ${uid}`);
                    return;
                }
                const date = book.get('date');
                if (!date || date === null) {
                    onError(`???????????????? ???????????? ?? ??????????. ???????????? ?????? ??????????????????, ???? ?????????? ?????????????????? ???? ????????????`, `Warning: /return ???????????????? ???????????? ?? ??????????. ???????????? ?????? ?????????????????? ${uid}`);
                }
                book.set({
                    user: undefined,
                    date: undefined
                });
                book.save();
                const readers = book.get('readers');
                const userID = user.get('id');
                if (readers.indexOf(userID) !== 0) {
                    const ID = new mongodb.ObjectID(userID);
                    readers.push(ID);
                }
                const hours = date.getHours();
                if (hours >= 24) {
                    const returnBooks = user.get('returnBooks');
                    const getBookID = book.get('id');
                    if (returnBooks.indexOf(getBookID) !== 0) {
                        const bookID = new mongodb.ObjectID(getBookID);
                        returnBooks.push(bookID);
                        user.save();
                    }
                }
                onComplete(name_book, ownerID);
            }
            catch (error) {
                onError(`?????????????????????? ????????????. ?????????? ??????????????????`, `Warning: /return UID: ${uid} ::: ${error}`);
            }
        });
    }
    getTop(onComplete, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const donateTop = [];
                const usersTop = [];
                const bookTop = [];
                const userCollection = Mongoose.model(colletionUsers, shema_user_1.shema_user, colletionUsers);
                const usersFind = yield userCollection.find().exec();
                if (!usersFind || usersFind === null) {
                    onError(`????????????. ???? ???? ???????????? ???????????????????????? ?? ???????????? ??????????????????????????`, `Warning: /getTop ???? ???? ???????????? ???????????????????????? ?? ???????????? ??????????????????????????`);
                    return;
                }
                const booksCollection = Mongoose.model(colletionBooks, shema_book_1.shema_book, colletionBooks);
                const books = yield booksCollection.find().exec();
                if (!usersFind || usersFind === null) {
                    onError(`????????????. ???? ???? ???????????? ???????????????????????? ?? ???????????? ????????`, `Warning: /getTop ???? ???? ???????????? ???????????????????????? ?? ???????????? ????????`);
                    return;
                }
                for (const user of usersFind) {
                    const broughtBooks = user.get('broughtBooks');
                    const returnBooks = user.get('returnBooks');
                    if (broughtBooks.length > 0) {
                        donateTop.push({
                            name: user.get('name'),
                            scope: broughtBooks.length
                        });
                    }
                    if (returnBooks.length > 0) {
                        usersTop.push({
                            name: user.get('name'),
                            scope: returnBooks.length
                        });
                    }
                }
                for (const book of books) {
                    const readers = book.get('readers');
                    if (readers.length > 0) {
                        bookTop.push({
                            name: book.get('name_book'),
                            scope: readers.length
                        });
                    }
                }
                donateTop.sort((a, b) => {
                    if (a.scope < b.scope) {
                        return 1;
                    }
                    if (a.scope > b.scope) {
                        return -1;
                    }
                    return 0;
                });
                usersTop.sort((a, b) => {
                    if (a.scope < b.scope) {
                        return 1;
                    }
                    if (a.scope > b.scope) {
                        return -1;
                    }
                    return 0;
                });
                onComplete(donateTop, usersTop, bookTop);
            }
            catch (error) {
                onError(`?????????????????????? ????????????. ?????????? ??????????????????`, `Warning: /getTop ::: ${error}`);
            }
        });
    }
    allBooks(onComplete) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookMsg = [' '];
                const model = Mongoose.model(colletionBooks, shema_book_1.shema_book, colletionBooks);
                const books = yield model.find().exec();
                if (!books.length) {
                    onComplete('???????? ?????? ????????');
                    return;
                }
                for (const book of books) {
                    const name_book = book.get('name_book');
                    const user = book.get('user');
                    const itHave = user ? '???? ?????? ??????????????' : '???? ????????????????';
                    bookMsg.push(messages_servis_1.allBooksDBMessage(name_book, itHave));
                }
                onComplete(bookMsg.join(''));
            }
            catch (error) {
                onComplete('?????????????????????? ????????????');
            }
        });
    }
}
exports.database = new Database();
