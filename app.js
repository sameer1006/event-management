const express= require("express");
const mongoose=require("mongoose");
 
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs")

mongoose.connect("mongodb://localhost:27017/eventDB",{useNewUrlParser: true, useUnifiedTopology: true});

app.get("/",function(req,res){
    res.render("events")
})

app.listen(3000,function(){
    console.log("Server started on port 3000");
})
