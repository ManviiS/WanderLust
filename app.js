if(process.env.NODE_ENV!="production")
    {require("dotenv").config();}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose"); 

const User=require("./models/user.js");







app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
const dbUrl=process.env.ATLASDB_URL;
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*100,
        maxAge:7*24*60*60*100,
        httpOnly:true,
    }

};

app.use(session(sessionOptions));
app.use(flash());

// app.use(require('express-session'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"studenr@gmail.com",
//         username:"delta-student",

//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connectd to db");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbUrl);
}

// app.get("/", (req, res) => {
//     res.send("hi,i am root");
// });

// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     // console.log(result); 
//     if (error) {
//         let errMsg = error.details.map((e) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     // console.log(result); 
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// //index route
// app.get("/listings", wrapAsync(async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index", { allListings });

// })
// );
// //new
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new");
// });
// //create route

// app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
//     // if (!req.body.listing){
//     //     throw new ExpressError(400,"send some valid data for listing");
//     // }

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");




// })
// );

// //edit route
// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });

// })
// );
// //update route
// app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
//     // if (!req.body.listing){
//     //     throw new ExpressError(400,"send some valid data for listing");
//     // }
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);
// })
// );
// //show route
// app.get("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     console.log("Listing fetched:", listing);
//     res.render("listings/show", { listing });

// })
// );
// //delete route
// app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");

// })
// );
// //review routes
// //post route
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     console.log("review was saved");
//     res.redirect(`/listings/${listing._id}`);

// })
// );
// //delete review route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }

// ));



// app.get("/testListing", async (req,res) => {
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:" Calangute ,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });

// app.use((err, req, res, next) => {
//     // res.send("something went wrong");
//     // res.status(500).send("something went wrong");
//     let { statusCode, message } = err;
//     res.status(statusCode).send(message);

// });
// app.all("/.*/", (req,res,next) => {
//     next(new ExpressError(404, "Page not found"));
// });
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);

});
app.listen(8080, () => {
    console.log("server is listening to port 8080");
});