require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server running on port: ${PORT}`);
    });
});

app.get("/", (req, res)=>{
    res.send("welcome to sharespace");
});