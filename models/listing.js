const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    // image:{
    //     type:String,
    //     set:(v)=>
    //         v===""
    //     ?"https://images.unsplash.com/photo-1750263102524-8f24f397b59b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //     :v,
    // },
    //this is  not working beacuse the given data.js doesnt follow this schema

    image: {
        filename: String,
        url: String
      },
    price : Number,
    location : String,
    country : String,
    reviews:[
        {type: Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
    geometry:{
    type:{
      type:String,
      enum:['Point'],
      required:true
    },
    coordinates:{
      type:[Number],
      required:true
    }
  }

});
// listingSchema.post("findOneAndDelete", async (listing) => {
//     if (listing) {
//         await Review.deleteMany({ _id: { $in : listing.reviews } });
//     }
// });
// listingSchema.pre("findOneAndDelete", async function (next) {
//     const listing = await this.model.findOne(this.getFilter());
//     if (listing) {
//         await Review.deleteMany({ _id: { $in: listing.reviews } });
//     }
//     next();
// });
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
  });

const Listing=mongoose.model("listing",listingSchema);
module.exports=Listing;

