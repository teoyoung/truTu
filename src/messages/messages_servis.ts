const admin = '@MikhaylovFedor';

export const message_start = `
Добро пожаловать!

*Библиотекарь* — 🤖 бот, который поможет Вам не потерять свою книгу в нашей библиотеке, а так же не забыть вернуть уже прочитанную на место.
Миссия бота наполнить библиотеку хорошими, полезными и интересными книгами из личных коллекций наших коллег. Вы всегда знаете кто и когда взял почитать ваше сокровище ;)

*Как добавить книгу:*
1. Принесите свою книгу в зал с библиотекой;
2. Возьмите полоску с уникальным UID и оберните первую страницу обложки книги, скрепив оба конца двусторонним скотчем (есть на полоске);
3. С помощью команды /add зарегистрируйте вашу книгу (уникальный UID и название в свободной форме). Код для добавления висит в зоне видимости возле книг.
4. Когда кто-то возьмёт вашу книгу, вы получите об этом уведомление.

*Как взять книгу:*
1. Выберите понравившуюся книгу;
2. В зоне видимости у стеллажа с книгами висит код с надписью «Забрать»;
3. С помощью команду /take введите код книги и код с таблички;

*Как вернуть книгу:*
1. Принесите книгу в библиотеку;
2. В зоне видимости у стеллажей с книгами висит код «Вернуть»;
3. С помощью комадны /retun введите код книги и код с таблички;

*Есть три простых команды:*

👉 /add — добавить книгу.
Пример:
/add <UID-книги> <Код на шкафчике> <Название книги>
/add 00001 <Код на шкафчике> Маленький принц

---------------------------------

👉 /take — взять книгу.
Пример:
/take <UID-книги> <Код на шкафчике>
/take 00001 <Код на шкафчике>
📬 Хозяин или хозяйка книги получат уведомление о том, то вы взяли почитать.

---------------------------------

👉 /return - вернуть книгу.
Пример:
/return <UID-книги> <Код на шкафчике>
/take 00001 <Код на шкафчике>
📬 Хозяин или хозяйка книги получат уведомление о том, то вы вернули книгу.

---------------------------------

👉 /all — посмотреть все книги  📚📚📚
👉 /top — посмотреть рейтинг  🥇, 🥈, 🥉
`;

export const message_incorrect_key = `
📙 Не корректный секретный код.
Рядом с книгами висит инструкция с кодом.
`;

export const message_incorrect_id = `
📙 Не корректный ID книги.
ID должен состоять из цифр, напечатанных на наклейке, которую вы взяли.
Рядом с книгами висит инструкция.
`;

export const message_incorrect_name_book = `
📙 Не забудь добавить название книги.
Пример:
/add 0001 secretKey Маленький принц
`;

export type Mode = 'Complete' | 'Warning' | 'Error';
export interface AddBookMessageData {
    name_book?: string;
    uid: number;
}

export function AddBookMessage(mode: Mode, data: AddBookMessageData): string {

    const {name_book, uid} = data;

    switch (mode) {
        case 'Complete':
            return `
📚 Спасибо!

Книга под названием *«${name_book}»* (UID:${uid}) зарегистрирована. 
Когда кто-то возьмёт вашу книгу, вы получите уведомление об этом.

👉 Если вы опечатались в уникальном номере книги, сообщите админу: ${admin}
`;        case 'Warning':
            return `
📙 Такое UID: ${uid} уже занято.

Посмотрите внимательно на UID. Если код верен, то возьмите другой UID, админ уже уведомлен`;
        default:
            return 'Ошибка: Текст ответа сформирован с ошибкой';
    }
}

export function TopMessage(header: string, top: string[]): string {
    return `
${header}

${top.join(
`

`)}`;

}

export function allBooksDBMessage(name_book: string, itHave: string): string {
    return `
«${name_book}»
${itHave}
----
    `
}