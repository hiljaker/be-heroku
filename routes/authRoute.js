const express = require('express');
const { login, register, sendemail, verified, sendVerificationEmail, keepLoggedIn, cekAkun, gantiPassword } = require('../controllers/authController');
const { verifyEmailToken, verifyTokenAccess, verifyTokenFP } = require('../helpers/verifyToken');
const router = express.Router()

router.get("/login", login)
router.post("/register", register)
router.get("/sendemail", sendemail)
router.get("/verified", verifyEmailToken, verified)
router.get("/send/verified/:id", sendVerificationEmail)
router.get("/keep/login", verifyTokenAccess, keepLoggedIn)
router.get("/forgot", cekAkun)
router.put("/changepassword", verifyTokenFP, gantiPassword)

module.exports = router
