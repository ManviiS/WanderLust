
const Listing=require("../models/listing");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({ accessToken:mapToken});

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });

};
module.exports.renderNewForm=(req, res) => {
    res.render("listings/new");
};
module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    console.log("Listing fetched:", listing);
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
      return   res.redirect("/listings");
    }
    res.render("listings/show", { listing ,mapToken: process.env.MAP_TOKEN});

}
// module.exports.editListing=
module.exports.createListing=async (req, res, next) => {
    // if (!req.body.listing){
    //     throw new ExpressError(400,"send some valid data for listing");
    // }
    let response=await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit:1,
    })
    .send();
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;


   
  

    // newListing.image={url,filename};
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing created!");
    res.redirect(`/listings`);
}

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    
     // 👇 if listing.image is an object, convert it to string
     if (listing.image && listing.image.url) {
        listing.image = listing.image.url;
    }
    // req.flash("success"," listing edited!");
    res.render("listings/edit", { listing,originalImageUrl });
}

//update route
// router.put("/:id", validateListing, wrapAsync(async (req, res) => {
//     // if (!req.body.listing){
//     //     throw new ExpressError(400,"send some valid data for listing");
//     // }
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);
// })
// );
// module.exports.updateListing=async (req, res) => {
//     let { id } = req.params;
//     const listingData = { ...req.body.listing };

//     // if user only provides url string, wrap it
//     if (typeof listingData.image === "string") {
//         listingData.image = { filename: "listingimage", url: listingData.image };
//     }

//     const listing=await Listing.findByIdAndUpdate(id, listingData,{ new: true });

//     if(typeof req.file!=="undefined"){
//         let url=req.file.path;
//         let filename=req.file.filename;
//         listing.image={url,filename};
//         await listing.save()
//     }
//     req.flash("success"," listing updated!");
//     if(!listing){
//         req.flash("error","listing you requested for does not exist!");
//       return   res.redirect("/listings");
//     }
//     res.redirect(`/listings/${id}`);
// }
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const listingData = { ...req.body.listing };

    // if user only provides url string, wrap it
    if (typeof listingData.image === "string") {
        listingData.image = { filename: "listingimage", url: listingData.image };
    }

    // 1. Find listing first
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // 2. Update normal fields
    listing.set(listingData);

    // 3. If location updated, fetch new geometry from Mapbox
    if (listingData.location) {
        const geoData = await geocodingClient
            .forwardGeocode({
                query: listingData.location,
                limit: 1,
            })
            .send();

        if (geoData.body.features.length > 0) {
            listing.geometry = geoData.body.features[0].geometry; // { type: "Point", coordinates: [lng, lat] }
        }
    }

    // 4. If a new file uploaded, replace image
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    // 5. Save changes
    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," listing deleted!");
    res.redirect("/listings");

}
