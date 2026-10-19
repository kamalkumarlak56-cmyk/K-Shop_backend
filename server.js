const express = require ("express");
const dotenv = require ("dotenv")
dotenv.config();

const connectdb = require("./db/connect");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const app = express();

const cors = require("cors")
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

const  path = require("path");
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/user',userRouter);
app.use('/api/products', productRouter);
connectdb();

const port = process.env.PORT || 3000 ;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});

