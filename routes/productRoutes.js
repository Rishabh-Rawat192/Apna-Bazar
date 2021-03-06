const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
    "/getMyProducts",
    authController.protect,
    authController.restrictTo("seller"),
    productController.getMyProducts
);

router
    .route("/")
    .get(productController.getAllProducts)
    .post(
        authController.protect,
        authController.restrictTo("seller"),
        productController.uploadProductPhoto,
        productController.resizeUserPhoto,
        productController.createProduct
    );

router
    .route("/:id")
    .get(productController.getProduct)
    .patch(
        authController.protect,
        authController.restrictTo("seller"),
        productController.uploadProductPhoto,
        productController.resizeUserPhoto,
        productController.updateProduct
    )
    .delete(
        authController.protect,
        authController.restrictTo("seller"),
        productController.deleteProduct
    );

module.exports = router;
