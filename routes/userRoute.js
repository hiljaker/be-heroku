const express = require('express');
const { get, getbyid, post, put, deleteuser } = require('../controllers/userController');
const router = express.Router()

router.get("/", get);
router.get("/:id", getbyid)
router.post("/", post)
router.put("/id", put)
router.delete("/:id", deleteuser)

module.exports = router