const express = require("express");
const { tesUpload, getProducts, addProduct, deleteproduct, editproduct } = require("../controllers/productController");
const productController = require("../controllers/productController");
const { verifyToken, uploader } = require("../helpers");
const { verifyTokenAccess } = require("../helpers/verifyToken");
const router = express.Router()

const uploadfile = uploader("/tes", "TES").fields([
    {name: "tes", maxCount: 3}
])

const uploadProductImg = uploader("/products", "PROD").fields([
    { name: "image", maxCount: 3 },
  ]);

router.get("/allproducts", getProducts)
router.post("/addproduct",uploadProductImg, addProduct)
router.delete("/deleteproduct/:id", deleteproduct)
router.put("/editproduct/:id", editproduct)
router.post("/tesupload", uploadfile, tesUpload)

module.exports = router