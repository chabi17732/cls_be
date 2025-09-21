const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // load .env variables
const app = express();

app.use(cors());

app.use(express.json());

app.get('/',(req, res) => {
    res.send('working');
})

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        return res.status(401).json({error:"No token provided"});
    }
    try{
        const decode = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        req.user = decode;
        next(); 
    }catch(error){
        console.error("JWT verification error:", error);
        return res.status(403).json({error:"Invalid token"});
    }
};
const udataRouter = require("./routes/udata");
const esp32Router = require("./routes/esp32");
app.use("/esp32", esp32Router);
app.use("/udata", udataRouter);//no jwt
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT,() => console.log(`Server is running on port ${PORT}`));
