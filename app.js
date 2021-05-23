const express= require("express");
const mongoose=require("mongoose");
 
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs")


mongoose.connect("mongodb://localhost:27017/eventDB",{useNewUrlParser: true, useUnifiedTopology: true});

const eventSchema= new mongoose.Schema({
    eventName:String,
    eventOrg:String,
    eventDate:Date,
    eventNumDate:Number,
    eventMonthDate:String,
    eventWeekdayDate:String,
    eventGuest:String,
    eventStartTime:String,
    eventEndTime:String
})
const Event= mongoose.model("Event",eventSchema);



app.get("/",function(req,res){

    Event.find({},function(err,foundEvents){
        if(!err){
            res.render("events",{events:foundEvents})
        }
    })
})


app.route("/eventadd")
.get(function(req,res){
    res.render("eventadd")
})

.post(function(req,res){
    const eventFullDate= new Date(req.body.eventDate);
    const weekDaysArr=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const monthArr=["January","February","March","April","May","June","July","August","September","October","November","December"];
    eventDate=eventFullDate.getDate();
    eventStringMonth=monthArr[eventFullDate.getMonth()];
    eventStringWeekday=weekDaysArr[eventFullDate.getDay()];
    Event.findOne({eventName:req.body.eventName},function(err,foundEvent){
        if(!foundEvent){
            const event=new Event({
                eventName:req.body.eventName,
                eventOrg:req.body.eventOrg,
                eventDate:req.body.eventDate,
                eventNumDate:eventDate,
                eventMonthDate:eventStringMonth,
                eventWeekdayDate:eventStringWeekday,
                eventGuest:req.body.eventGuest,
                eventStartTime:req.body.eventStartTime,
                eventEndTime:req.body.eventEndTime
            }) 
            event.save();
            console.log("Great Success")
            res.redirect("/")
        }
        else{
            console.log("Sorry cant enter")
            res.redirect("/")
        }
    })
});


app.listen(3000,function(){
    console.log("Server started on port 3000");
})
