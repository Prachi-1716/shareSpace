const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

app.listen(PORT, ()=>{
    console.log(`sever running on port ${PORT}`)
});

app.get("/", (req, res)=>{
    res.send("welcome to sharespace");
});