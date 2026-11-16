require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./models/db");
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server running on port: ${PORT}`);
    });
});
const cookieParser = require('cookie-parser');

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true,                 // allow cookies on cross-origin requests
}));
app.use(cookieParser());            
app.use(express.json());


app.get("/", (req, res)=>{
    res.send("welcome to sharespace");
});
app.use("/api/items", require("./routes/itermRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use((err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {          // schema validation failed
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {               // duplicate key, e.g. same email
    status = 409;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  } else if (err.name === 'CastError') {         // invalid ObjectId
    status = 400;
    message = 'Invalid id';
  }

  res.status(status).json({ success: false, message });
});