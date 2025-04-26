const express = require("express");
const connectDB = require("./config/mongo");
const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const mlRoutes = require("./routes/machinelarning");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();
app.set('view engine', 'pug');

app.use(cors());
app.use(express.json());
app.use("/api", stockRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "01y28nvus09v0nq",
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false, maxAge: 6000000} // 1 hour til cookie expires
    })
);

//routing for API logins
app.use("/api", authRoutes);
app.use("/api", mlRoutes);

// Routing for website pages
var pages = require('./routes/pages');
app.use(express.urlencoded({extended: true}));
app.use(pages);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


