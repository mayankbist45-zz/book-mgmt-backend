const express = require("express");
const app = express();
const cors = require("cors");
require("./prod");

const mongoose = require("mongoose");
const uri = `mongodb+srv://corbett:zpTiC0denyk3iesn@cluster0.ll84g.mongodb.net/test`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", function () {
    console.log("We are connected");
});

const Schema = mongoose.Schema({
    author: String,
    title: String,
    availableCopies: Number,
    timesBought: Number,
    yop: Number
});

const Book = mongoose.model("bookModel", Schema);

async function getAllBooks() {
    const book = await Book.find();
    return book;
}

async function addData(data) {
    const book = new Book(data);
    return await book.save();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

const processToRules = (books, title, authorName, startP, startE) => {
    const updatedBooks = [];
    books.forEach((book) => {
        if (title === '' || book.title.toUpperCase() === title.toUpperCase()) {
            if (authorName === '' || book.author.toUpperCase() === authorName.toUpperCase()) {
                if (startP <= book.yop) {
                    if (startE >= book.yop) {
                        updatedBooks.push(book);
                    }
                }
            }
        }
    });
    return updatedBooks;
}

app.get("/books/search", async (req, res) => {
    const books = await getAllBooks();
    res.send(processToRules(books, req.query.title, req.query.authorName, req.query.startP, req.query.startE));
});

app.get("/books/recommendations", async (req, res) => {
    let books = await getAllBooks();
    books.sort((a, b) => b.timesBought - a.timesBought);
    res.send(books.slice(0, 4));
});

app.get("/books", async (req, res) => {
    res.send(await getAllBooks());
});

app.post("/books", async (req, res) => {
    await addData(req.body);
    res.send(await getAllBooks());
});

app.delete("/books/:id", async (req, res) => {
    await Book.findByIdAndRemove(req.params.id);
    res.send(await getAllBooks());
});

app.put("/books/:id", async (req, res) => {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.send(await getAllBooks());
})

const PORT = process.env.PORT || 8021;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
