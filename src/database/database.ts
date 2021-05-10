
import * as Mongoose from 'mongoose';
import {Document, ObjectId} from 'mongoose';
import {UserSheme, shema_user} from './user/shema_user';
import {shema_book} from './book/shema_book';
import mongodb = require('mongodb');
import { allBooksDBMessage } from '../messages/messages_servis';

const colletionBooks = 'books';
const colletionUsers = 'users';

export interface Book extends Document {
    uid: number;
    name_book: string;
    owner: User;
    user: User;
    isTaken: boolean;
}

export interface User {
    name: number;
    id: number;
    username: string;
}

interface AddBook {
    uid: number;
    name_book: string;
    username_owner: string;
    tgID_owner: number;
    name_owner: string;
}

interface TakeBook {
    uid: number;
    username_user: string;
    tgID_user: number;
    name_user: string;
}

interface TopInfo {
    name: string;
    scope: number;
}

class Database {

    private db: Mongoose.Connection;

    public connect(url: string) {

        if (this.db) { return; }

        Mongoose.connect(url, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        Mongoose.connection.once('open', async () => {
            console.log('Connected to database');
        });

        this.db = Mongoose.connection;
    }

    public disconnect() {
        if (!this.db) { return; }

        Mongoose.disconnect();
    }

    public async addBook(param: AddBook, onComplete: () => void, onHave: () => void, onError: (userError: string, adminError: string) => void) {

        const {uid, tgID_owner, username_owner, name_owner, name_book} = param;

        try {
            const booksCollection = Mongoose.model<Book>(colletionBooks, shema_book, colletionBooks);
            const userCollection = Mongoose.model<UserSheme>(colletionUsers, shema_user, colletionUsers);

            const ownerFind = await userCollection.findOne({tgID: tgID_owner}).exec();
            const bookFind = await booksCollection.findOne({uid}).exec();

            if(bookFind){
                onHave();
                return;
            }

            if(ownerFind === null){
                await userCollection.create({
                    tgID: tgID_owner,
                    name: name_owner,
                    username: username_owner,
                    returnBooks: [],
                    broughtBooks: []
                })
            }

            const owner = await userCollection.findOne({tgID: tgID_owner}).exec();

            if(!owner || owner === null) {
                onError(
                    `Ошибка! Мы не смогли зарегистрировать вас как пользователя. Странные странности. `,
                    `Warning: /take Книга с таким UID ${uid} не найдена. Посмотрите внимательнее. @${username_owner}`
                );
                return;
            }

            const ownerID = owner.get('id');

            if(!ownerID) {
                onError(
                    `Сранная ошибка при создании вашей записи`,
                    `Warning: /addBook UID ${uid} Сранная ошибка при создании вашей записи. @${username_owner}`
                );
                return;
            }

            await booksCollection.create({
                uid: uid,
                name_book: name_book,
                owner: ownerID,
                readers: []
            })            
            .then((book) => {
                const broughtBooks = owner.get('broughtBooks') as mongodb.ObjectID[];
                const bookID = new mongodb.ObjectID(book.get('id'));
                broughtBooks.push(bookID);
                owner.save();
                onComplete()
            })
            .catch((error) => {
                onError(
                    `Ошибка при записи книги в каталог. Админ уведомлен`,
                    `Warning: /addBook @${username_owner} UID: ${uid} ::: ${error}`
                );
            })

        } catch (error) {
            onError(
                `Неизвестная ошибка. Админ уведомлен`,
                `Warning: /addBook @${username_owner} UID: ${uid} ::: ${error}`
            );
        }

    }

    public async takeBook(param: TakeBook, onComplete: (idOwner: number, nameBook: string) => void, onIsTake: (nameBook: string) => void, onError: (userError: string, adminError: string) => void ) {

        const {uid, tgID_user, username_user, name_user} = param;

        try {

            const booksCollection = Mongoose.model<Book>(colletionBooks, shema_book, colletionBooks);
            const userCollection = Mongoose.model<UserSheme>(colletionUsers, shema_user, colletionUsers);

            const book = await booksCollection.findOne({uid}).exec();

            if(!book || book === null) {
                onError(
                    `Ошибка! Книга с таким UID ${uid} не найдена. Посмотрите внимательнее.`,
                    `Warning: /take Книга с таким UID ${uid} не найдена. Посмотрите внимательнее. @${username_user}`
                );
                return;
            }

            const userFind = await userCollection.findOne({tgID: tgID_user}).exec();

            if(userFind === null){
                await userCollection.create({
                    tgID: tgID_user,
                    name: name_user,
                    username: username_user
                })
            }

            const nameBook = book.get('name_book');
            const user = await userCollection.findOne({tgID: tgID_user}).exec();

            if(!user || user === null) {
                onError(
                    `Ошибка! Мы не смогли найти вас как пользователя. `,
                    `Warning: /take Книга с таким UID ${uid} не найдена. Посмотрите внимательнее. @${username_user}`
                );
                return;
            }

            const userID = user.get('id');

            if(!userID || user === null){

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

            const owner = await userCollection.findOne({_id: book.get('owner')}).exec();

            if(!owner || owner === null) {
                onError(
                    undefined,
                    `Warning: /take Хм... Владелец книги не найден UID: ${uid}`
                );
            }

            const IDowner = owner.get? owner.get('tgID') : undefined;

            onComplete(IDowner, nameBook);
            
        } catch (error) {
            onError(
                `Неизвестная ошибка. Админ уведомлен`,
                `Warning: /take @${username_user} UID: ${uid} ::: ${error}`
            );
        }

        
    }

    public async returnBook(data: {uid: number, tgID_user: number, username: string}, onComplete: (name_book: string, owner: number) => void, onError: (userError: string, adminError: string) => void) {

        const {uid, tgID_user, username} = data;

        try {
            
            const booksCollection = Mongoose.model<Book>(colletionBooks, shema_book, colletionBooks);
            const userCollection = Mongoose.model<UserSheme>(colletionUsers, shema_user, colletionUsers);

            const book = await booksCollection.findOne({uid}).exec();
            const user = await userCollection.findOne({tgID: tgID_user}).exec();

            // TODO Прописать, если человек не брал, но вернул книгу

            if(!book || book === null) {
                onError(
                    `Ошибка! Книга с таким UID ${uid} не найдена. Посмотрите внимательнее.`,
                    `Warning: /return Книга с таким UID ${uid} не найдена. Посмотрите внимательнее. @${username}`
                );
                return;
            }

            if(!user || user === null) {
                onError(
                    `Странно, мы не нашли вас как читателя книги. Положите книгу на полку. Если хотите взять книгу, воспользуйтесь командой /take`,
                    `Warning: /return Нет юзера с таким tgID ${tgID_user} @${username}`
                );
                return;
            }

            const name_book = book.get('name_book') as string;

            const owner = await userCollection.findOne({_id: book.get('owner')}).exec();
            const ownerID = owner.get('tgID') as number;

            const isTaken = book.get('user');
            if (!isTaken) {
                onError(
                    `Странно. У нас записано, что книга лежит на месте. Положите книгу на полку, бот уведомит админа`,
                    `Warning: /return У нас записано, что книга лежит на месте ${uid}`
                );
                return;
            }

            const date = book.get('date') as Date;

            if(!date || date === null){
                onError(
                    `Странная ошибка с дадой. Запрос был обработан, но админ уведомлен об ошибке`,
                    `Warning: /return Странная ошибка с дадой. Запрос был обработан ${uid}`
                );
            }

            book.set({
                user: undefined,
                date: undefined
            });

            book.save();

            const readers = book.get('readers') as mongodb.ObjectID[];
            const userID = user.get('id');

            if(readers.indexOf(userID) !== 0){
                const ID = new mongodb.ObjectID(userID);
                readers.push(ID);
            }

            const hours = date.getHours();

            if(hours >= 24){

                const returnBooks = user.get('returnBooks') as mongodb.ObjectID[];
                const getBookID = book.get('id');
    
                if(returnBooks.indexOf(getBookID) !== 0){
                    const bookID = new mongodb.ObjectID(getBookID);
                    returnBooks.push(bookID);
                    user.save();
                }

            }

            onComplete(name_book, ownerID);
            
        } catch (error) {
            onError(
                `Неизвестная ошибка. Админ уведомлен`,
                `Warning: /return UID: ${uid} ::: ${error}`
            );
        }
    }

    public async getTop( onComplete: ( donateTop: TopInfo[],  usersTop: TopInfo[], bookTop: TopInfo[]) => void,  onError: (userError: string, adminError: string) => void ){

        try {

            const donateTop: TopInfo[] = [];
            const usersTop: TopInfo[] = [];
            const bookTop: TopInfo[] = [];

            const userCollection = Mongoose.model<UserSheme>(colletionUsers, shema_user, colletionUsers);
            const usersFind = await userCollection.find().exec();


            if (!usersFind || usersFind === null) {
                onError(
                    `Ошибка. Мы не смогли подключиться к списку пользователей`,
                    `Warning: /getTop Мы не смогли подключиться к списку пользователей`
                );
                return;
            }

            const booksCollection = Mongoose.model<Book>(colletionBooks, shema_book, colletionBooks);
            const books = await booksCollection.find().exec();

            if (!usersFind || usersFind === null) {
                onError(
                    `Ошибка. Мы не смогли подключиться к списку книг`,
                    `Warning: /getTop Мы не смогли подключиться к списку книг`
                );
                return;
            }

    
            for(const user of usersFind){
                const broughtBooks = user.get('broughtBooks') as string[];
                const returnBooks = user.get('returnBooks') as string[];
    
                if(broughtBooks.length > 0){
                    donateTop.push({
                        name: user.get('name'),
                        scope: broughtBooks.length
                    });
                }
    
                if(returnBooks.length > 0){
                    usersTop.push({
                        name: user.get('name'),
                        scope: returnBooks.length
                    });
                }
    
            }

            for(const book of books){
                const readers = book.get('readers') as string[];
    
                if(readers.length > 0){
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
            
        } catch (error) {
            onError(
                `Неизвестная ошибка. Админ уведомлен`,
                `Warning: /getTop ::: ${error}`
            );
        }


    }

    public async allBooks(onComplete: (msg: string) => void ) {

        try {

            const bookMsg: string[] = [' '];

            const model = Mongoose.model<Book>(colletionBooks, shema_book, colletionBooks);
            const books = await model.find().exec();
    
            if (!books.length) { 
                onComplete('Пока нет книг');
                return; 
            }
    
            for (const book of books) {
    
                const name_book = book.get('name_book');
                const user = book.get('user');
    
                const itHave = user ? '📘 Уже забрали' : '📗 Свободно';
    
                bookMsg.push(allBooksDBMessage(name_book, itHave));
            }
    
            onComplete(bookMsg.join(''));
            
        } catch (error) {
            onComplete('Неизвестная ошибка');
        }

    }

}

export const database =  new Database();