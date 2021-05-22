const express= require("express");
const mongoose=require("mongoose");
const ejs=require("ejs");
 
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs")

mongoose.connect("mongodb://localhost:27017/eventDB",{useNewUrlParser: true, useUnifiedTopology: true});

app.get("/",function(req,res){
    res.send("Hello");
})

app.listen(3000,function(){
    console.log("Server started on port 3000");
})
