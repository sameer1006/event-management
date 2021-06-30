require('dotenv').config()
const methodOverride=require("method-override");
var $ = require('jquery')
const express= require("express");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const { event } = require('jquery');
 
const app = express();

app.use(methodOverride('_method'))
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
    eventName:{
        type:String,
        required: true
    },
    eventOrg:{
        type:String,
        required: true
    },
    eventDate:Date,
    eventNumDate:Number,
    eventMonthDate:{
        type:String,
        required: true
    },
    eventWeekdayDate:{
        type:String,
        required: true
    },
    eventGuest:{
        type:String,
        required: true
    },
    eventStartTime:{
        type:String,
        required: true
    },
    eventEndTime:{
        type:String,
        required: true
    },
    upVotes:Number,
    downVotes:Number,
    registeredUsn:[String],
    registerUsername:[String],
    eventDesc:String
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

app.get("/showoneevent/:id",async function(req,res){
    foundEvent=await Event.findById(req.params.id)
    res.render("showOneEvent",{event:foundEvent});
})

app.get("/eventshow",function(req,res){
    Event.find({},function(err,foundEvents){
        if(!err){
            res.render("eventshow",{events:foundEvents});
        }
    })
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
                res.redirect("events");    
            });
        }
    })
});
app.delete("/eventshow/:id",async function(req,res){
    await Event.findByIdAndDelete(req.params.id);
    res.redirect("/eventshow");
})

app.get("/eventupdate/:id",async function(req,res){
    foundEvent=await Event.findById(req.params.id)
    res.render("eventupdate",{event: foundEvent})
})

app.put("/eventupdate/:id",async function(req,res,next){
    req.event = await Event.findById(req.params.id)
    next()
  }, saveArticleAndRedirect('eventupdate'))


app.route("/eventadd")
.get(function(req,res){
    // console.log("query string", req.query);
    // const event = JSON.parse(req.query);
    // console.log(event);

    res.render("eventadd",{eventOld: new Event()})
})

.post(function(req,res){
    const eventFullDate= new Date(req.body.eventDate);
    const weekDaysArr=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const monthArr=["January","February","March","April","May","June","July","August","September","October","November","December"];
    eventDate=eventFullDate.getDate();
    eventStringMonth=monthArr[eventFullDate.getMonth()];
    eventStringWeekday=weekDaysArr[eventFullDate.getDay()];
    const event=new Event({
        eventName:req.body.eventName,
        eventOrg:req.body.eventOrg,
        eventDate:req.body.eventDate,
        eventNumDate:eventDate,
        eventMonthDate:eventStringMonth,
        eventWeekdayDate:eventStringWeekday,
        eventGuest:req.body.eventGuest,
        eventStartTime:req.body.eventStartTime,
        eventEndTime:req.body.eventEndTime,
        eventDesc:req.body.eventDesc,
        upVotes:0,
        downVotes:0
    }) ;
    Event.findOne({eventName:req.body.eventName},async function(err,foundEvent){
            try{
                await event.save();
                console.log("Great Success")
                res.redirect("events")
            }
            catch(e){
                console.log("Sorry cant enter" +e)
                res.render("eventadd",{eventOld:event})   
            }
    })
});

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let event = req.event
        const eventFullDate= new Date(req.body.eventDate);
        const weekDaysArr=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const monthArr=["January","February","March","April","May","June","July","August","September","October","November","December"];
        eventDate=eventFullDate.getDate();
        eventStringMonth=monthArr[eventFullDate.getMonth()];
        eventStringWeekday=weekDaysArr[eventFullDate.getDay()];
        event.eventName=req.body.eventName
        event.ventOrg=req.body.eventOrg
        event.eventDate=req.body.eventDate
        event.eventNumDate=eventDate
        event.eventMonthDate=eventStringMonth
        event.eventWeekdayDate=eventStringWeekday
        event.eventGuest=req.body.eventGuest
        event.eventStartTime=req.body.eventStartTime
        event.eventEndTime=req.body.eventEndTime
        event.eventDesc=req.body.eventDesc
        try {
            event = await event.save()
            res.redirect(`/eventshow`)
        }catch (e) {
            res.render(`/${path}`, { event: event })
        }
    }   
}

app.listen(3000,function(){
    console.log("Server started on port 3000");
})




