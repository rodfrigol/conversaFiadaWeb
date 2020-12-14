const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const socket = require("socket.io");
const http = require("http");
const expressSanitizer = require('express-sanitizer');

const app = express();
const server = http.createServer(app);
var PORT = process.env.PORT || 5000;
server.listen(PORT);
const io = socket.listen(server);

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

app.use(express.json());
app.use(expressSanitizer());

// Routes
app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));
app.use("/message", require("./routes/message.js"));
app.use("/chat", require("./routes/chat.js"));
app.use(express.static("public"));

io.on("connection", function(socket) {
    socket.on("enviar mensagem", function(mensagem, callback) {
        var sala = mensagem.chat_id

        socket.broadcast.to(sala).emit("atualizar mensagens", mensagem);
        callback();
    });

    socket.on("entrar sala", function(salas) {
        socket.join(salas)
    });
});