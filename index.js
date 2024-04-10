const express = require("express");
require('dotenv').config();
const app = express();
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const Blogs = require("./models/blog");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const checkAuthenticationCookie = require("./middlewares/authentication");
const PORT =  process.env.PORT || 5000;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(checkAuthenticationCookie("token"));

app.listen(PORT,()=>{
    console.log("App is listing on the port",PORT);
})

app.get("/",async (req,res)=>{
    const allBlogs = await Blogs.find({}); 
    res.render("home.ejs",{
        user : req.user,
        blogs : allBlogs,
    });
})

app.get("/blogs",async (req,res)=>{
    const allBlogs = await Blogs.find({}); 
    res.render("yourBlogs.ejs",{
        user : req.user,
        blogs : allBlogs,
    });
  });


app.use("/user",userRoute);
app.use("/blog",blogRoute);

// mongodb

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connection Successful");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

main();