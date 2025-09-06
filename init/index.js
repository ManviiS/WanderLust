const mongoose=require("mongoose");
const data=require("./data.js");
const Listing=require("../models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main ()
.then(()=>{
    console.log("connectd to db");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB=async()=>{
    await Listing.deleteMany({});//to delete already existing data
    //add owner field to each listing
    const listingswithOwner=data.data.map((obj)=>({
        ...obj,owner:"68afb7c4c86156c65e288d3d"
    }))
    await Listing.insertMany(listingswithOwner);
    console.log("data was initialized")
};
//  initData.data=initData.data.map((obj)=>({...obj,owner:"68afb7c4c86156c65e288d3d"}));
initDB();