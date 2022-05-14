const axios = require("axios");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Shop = require("../models/shopModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const DeliveryDetail = require("../models/deliveryDetailModel");

exports.getHomePage = catchAsync(async (req, res, next) => {
    if (req.user && req.user.role === "seller")
        return res.redirect("/products");

    const products = await Product.find();
    res.status(200).render("products/index", { products });
});

exports.getProductDetails = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) return next(new AppError("No Product Found!", 404));

    res.status(200).render("products/show", { product });
});

exports.login = (req, res) => {
    res.status(200).render("login");
};

exports.signup = (req, res) => {
    res.status(200).render("signup");
};

exports.getOrders = catchAsync(async (req, res, next) => {
    //FOR USER ORDERS
    if (req.user.role === "user") {
        const response = await axios({
            method: "GET",
            url: `${req.protocol}://${req.headers.host}/api/v1/orders`,
            headers: {
                cookie: `jwt=${req.cookies.jwt}`
            }
        });
        if (response.data.status === "success")
            return res
                .status(200)
                .render("orders/index", { orders: response.data.data.orders });
        return next(
            new AppError("Something went wrong. Please try again later", 500)
        );
    }

    //FOR SELLER ORDERS
    const response = await axios({
        method: "GET",
        url: `${req.protocol}://${req.headers.host}/api/v1/orders/seller`,
        headers: {
            cookie: `jwt=${req.cookies.jwt}`
        }
    });
    if (response.data.status === "success")
        return res
            .status(200)
            .render("orders/index", { orders: response.data.data.orders });
    return next(
        new AppError("Something went wrong. Please try again later", 500)
    );
});

exports.getOrderDetails = catchAsync(async (req, res, next) => {
    let order;
    if (req.user.role === "user")
        order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: { $nin: ["removed"] }
        });
    else if (req.user.role === "seller")
        order = await Order.findOne({
            _id: req.params.id,
            "product.seller": req.user._id
        });

    if (!order) return next(new AppError("Not Found", 404));

    res.status(200).render("orders/show", { order });
});

//Seller's all products page
exports.getAllProductsPage = catchAsync(async (req, res, next) => {
    const products = await Product.find(
        { seller: req.user._id },
        "-seller -__v"
    );
    res.status(200).render("products/seller/index", { products });
});

exports.getNewProductPage = (req, res, next) => {
    res.status(200).render("products/seller/new");
};

exports.getEditProductPage = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).render("products/seller/edit", { product });
});

//User address
exports.getAllAddresses = catchAsync(async (req, res, next) => {
    const addresses = await DeliveryDetail.find({
        user: req.user._id
    });

    res.status(200).render("addresses/index", { addresses });
});

exports.getNewAddressPage = (req, res) => {
    res.status(200).render("addresses/new");
};

exports.getEditAddressPage = catchAsync(async (req, res, next) => {
    const address = await DeliveryDetail.findOne({
        user: req.user._id,
        _id: req.params.id
    });

    if (!address) return next(new AppError("No Address Found!", 404));

    res.status(200).render("addresses/edit", { address });
});

exports.getCheckoutPage = catchAsync(async (req, res, next) => {
    const address = await DeliveryDetail.findOne({
        user: req.user._id,
        _id: req.params.id
    });

    if (!address) return next(new AppError("No Address Found!", 404));

    const product = await Product.findById(req.params.productId);

    if (!product) return next(new AppError("No Product Found!", 404));

    res.status(200).render("checkout", { address, product });
});

//SHOPS
exports.getAllShopPage = catchAsync(async (req, res, next) => {
    let URL = `${req.protocol}://${req.headers.host}/api/v1/shops`;

    if (req.query.lat && req.query.lng) {
        URL += `?lat=${req.query.lat}&lng=${req.query.lng}`;
        if (req.query.radius) URL += `&radius=${req.query.radius}`;
    }

    const response = await axios({
        method: "GET",
        url: URL
    });
    if (response.data.status === "success")
        return res
            .status(200)
            .render("shops", { shops: response.data.data.shops });
    return next(
        new AppError("Something went wrong. Please try again later", 500)
    );
});

exports.getProductsOfAShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);

    const products = await Product.find({ seller: shop.seller });
    res.status(200).render("shops/products", { products });
});

exports.getCurrentSellerShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findOne({ seller: req.user._id });
    if (!shop) return res.status(200).redirect("shops/new");
    // return next(new AppError("No shop found"));
    res.status(200).render("shops/myShop", { shop });
});

exports.getNewShopPage = catchAsync(async (req, res, next) => {
    res.status(200).render("shops/new");
});

exports.getEditShopPage = catchAsync(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop || !shop.seller.equals(req.user._id))
        return next(
            new AppError(
                "No shop found or shop with this ID doesn't belong to you"
            )
        );

    res.status(200).render("shops/edit", { shop });
});
