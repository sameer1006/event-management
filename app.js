require('dotenv').config()
const express= require("express");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
 
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs")
app.use(session({
    secret:process.env.KEY,
    resave:false,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/eventDB",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema=new mongoose.Schema({
    name:String,
    usn:String,
    username:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/events",function(req,res){
    if(req.isAuthenticated()){
        Event.find({},function(err,foundEvents){
            if(!err){
                res.render("events",{events:foundEvents})
            }
        })
    }
    else{
        res.render("signin");
    }
})

app.get("/signup",function(req,res){
    res.render("signup");
})

app.get("/signin",function(req,res){
    res.render("signin");
})


app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("signin")
})

app.post("/signup",function(req,res){
    User.register({username:req.body.username,name:req.body.name,usn:req.body.usn},req.body.password,function(err,user){
        if(err){
            console.log("Error :"+err);
            res.redirect("signup");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("signin");
            });
        }
    })
});

app.post("/signin",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log("signin");
            console.log("Error :"+err);
            res.redirect("signin");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/events");    
            });
        }
    })
});

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
            res.redirect("events")
        }
        else{
            console.log("Sorry cant enter")
            res.redirect("events")
        }
    })
});


app.listen(3000,function(){
    console.log("Server started on port 3000");
})


//JS FOR HOMEPAGE



