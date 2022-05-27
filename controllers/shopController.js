const Shop = require("../models/shopModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllShops = catchAsync(async (req, res, next) => {
    let condition = {};
    if (req.query.lat && req.query.lng) {
        const { lat, lng, radius = 1000 } = req.query;
        condition = {
            location: {
                $near: {
                    $maxDistance: radius,
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }
            }
        };
    }

    const features = new APIFeatures(Shop.find(condition), req.query)
        .filter(["radius", "lat", "lng"])
        .sort()
        .limitFields()
        .paginate();

    const shops = await features.query;
    res.status(200).json({
        status: "success",
        results: shops.length,
        data: {
            shops
        }
    });
});

exports.getShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
        return next(new AppError("No document found with this ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            shop
        }
    });
});

exports.createShop = catchAsync(async (req, res, next) => {
    if (
        !req.body.name ||
        !req.body.image ||
        !req.body.address ||
        !req.body.latitude ||
        !req.body.longitude
    ) {
        return next(
            new AppError(
                "Shop name or image or address or latitude  or longitude is not provided.",
                400
            )
        );
    }

    //Checking if seller already have a shop
    let shop = await Shop.findOne({
        seller: req.user._id
    });

    if (shop) {
        return next(new AppError("One seller can have only one shop"));
    }

    const location = {
        type: "Point",
        coordinates: [req.body.longitude, req.body.latitude],
        address: req.body.address
    };

    try {
        shop = await Shop.create({
            name: req.body.name,
            image: req.body.image,
            seller: req.user._id,
            location: location
        });

        res.status(201).json({
            status: "success",
            data: {
                shop
            }
        });
    } catch (error) {
        return next(error);
    }
});

exports.updateShop = catchAsync(async (req, res, next) => {
    //find and update shop with provided id
    const shop = await Shop.findOne({
        _id: req.params.id,
        seller: req.user._id
    });

    if (!shop) {
        return next(
            new AppError(
                "No document found with this ID or it doesn't belong to you",
                404
            )
        );
    }

    //Adding location
    const { location } = shop;
    if (req.body.address) location.address = req.body.address;
    if (req.body.longitude) location.coordinates[0] = req.body.longitude;
    if (req.body.latitude) location.coordinates[1] = req.body.latitude;

    const updatedShop = await Shop.findOneAndUpdate(
        {
            _id: req.params.id,
            seller: req.user._id
        },
        {
            name: req.body.name,
            image: req.body.image,
            location: location
        },
        {
            new: true,
            omitUndefined: true
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            updatedShop
        }
    });
});

exports.deleteShop = catchAsync(async (req, res, next) => {
    //find and delete product
    const shop = await Shop.findOne({
        _id: req.params.id,
        seller: req.user._id
    });

    if (!shop) {
        return next(
            new AppError(
                "No document found with this ID or it doesn't belong to you",
                404
            )
        );
    }

    await shop.deleteOne();

    res.status(204).json({
        status: "success",
        data: null
    });
});
