const { connection } = require("../connections")
const { hash, transporter } = require("../helpers")
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
const {
    createTokenAccess,
    createTokenEmailVerified,
    createTokenFP
} = require("../helpers/createToken")

module.exports = {
    login: async (req, res) => {
        const { username, password } = req.query
        if (!username || !password) {
            return res
                .status(400)
                .send({ message: "tidak ada username atau password" })
        }
        let sql = `select * from user where username = ? and password = ?`
        let msc = connection.promise()
        try {
            let [results] = await msc.query(sql, [username, hash(password)])
            if (!results.length) {
                return res.status(500).send({ message: "user tidak ditemukan" })
            }
            let dataToken = {
                id: results[0].id,
                role_id: results[0].role_id
            }
            const tokenAccess = createTokenAccess(dataToken)
            return res.status(200).send({ token: tokenAccess, data: results })
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    register: async (req, res) => {
        const { username, password, email } = req.body
        if (!username || !password || !email) {
            return res.status(400).send({ message: "tidak ada username atau password" })
        }
        let sql = `select * from user where username = ?`
        let msc = connection.promise()
        try {
            let [results] = await msc.query(sql, [username])
            if (results.length) {
                return res.status(400).send({ message: "username telah terdaftar" })
            }
            let regist = {
                username,
                email,
                password: hash(password)
            }
            sql = `insert into user set ?`
            let [insertData] = await msc.query(sql, regist)
            sql = `select * from user where id = ?`
            let [results2] = await msc.query(sql, insertData.insertId)
            let dataToken = {
                id: results2[0].id,
                role_id: results2[0].role_id
            }
            let tokenAccess = createTokenAccess(dataToken)
            let tokenEmailVerified = createTokenEmailVerified(dataToken)
            let filepath = path.resolve(
                __dirname,
                "../template/emailverifikasi.html"
            )
            let htmlString = fs.readFileSync(filepath, "utf-8")
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                nama: "Hilmawan",
                token: tokenEmailVerified
            })
            await transporter.sendMail({
                from: "Jakii <hilmawanzaky57@gmail.com>",
                to: "hilmawanzaky57@gmail.com",
                subject: "email verifikasiiii",
                html: htmlToEmail
            })
            return res.status(200).send({ token: tokenAccess, data: results2 })
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    sendemail: async (req, res) => {
        try {
            let filepath = path.resolve(__dirname, "../template/email.html")
            let htmlString = fs.readFileSync(filepath, "utf-8")
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                nama: "Mas Dino",
                teks: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Amet porttitor eget dolor morbi non arcu risus quis. Nascetur ridiculus mus mauris vitae ultricies leo integer malesuada nunc. Tincidunt ornare massa eget egestas. Malesuada fames ac turpis egestas sed. Et malesuada fames ac turpis egestas integer eget. Enim neque volutpat ac tincidunt. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Sit amet consectetur adipiscing elit ut aliquam. Pretium fusce id velit ut tortor pretium. Bibendum est ultricies integer quis auctor elit sed vulputate mi. Eget dolor morbi non arcu risus quis. Vel pharetra vel turpis nunc. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla."
            })
            await transporter.sendMail({
                from: "Hilmawan <hilmawanzaky57@gmail.com>",
                to: "dinopwdk@gmail.com ",
                subject: "Hohoho apa ini",
                html: htmlToEmail
            })
            res.send({ message: "berhasil" })
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    verified: async (req, res) => {
        const { id } = req.user
        const msc = connection.promise()
        try {
            let updateData = {
                isverified: 1
            }
            let sql = `update user set ? where id = ?`
            await msc.query(sql, [updateData, id])
            sql = `select * from user where id = ?`
            let [results] = await msc.query(sql, id)
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    sendVerificationEmail: async (req, res) => {
        const { id } = req.params
        const msc = connection.promise()
        try {
            let sql = `select * from user where id = ?`
            let [resDataUser] = await msc.query(sql, id)
            let dataToken = {
                id: resDataUser[0].id,
                role_id: resDataUser[0].role_id
            }
            let tokenVerificationEmail = createTokenEmailVerified(dataToken)
            let filepath = path.resolve(__dirname, "../template/emailverifikasi.html")
            let htmlString = fs.readFileSync(filepath, "utf-8")
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                nama: resDataUser[0].username,
                token: tokenVerificationEmail
            })
            await transporter.sendMail({
                from: "Hilmawan <hilmawanzaky57@gmail.com>",
                to: resDataUser[0].email,
                subject: "Verifikasi dulu dong",
                html: htmlToEmail
            })
            return res.status(200).send({ message: "berhasil kirim email verifikasi" });
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    keepLoggedIn: async (req, res) => {
        const { id } = req.user
        const msc = connection.promise()
        try {
            let sql = `select * from user where id = ?`
            let [resDataUser] = await msc.query(sql, id)
            return res.status(200).send(resDataUser)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    cekAkun: async (req, res) => {
        const { email, username } = req.query
        let msc = connection.promise()
        let sql = `select * from user where email = ? or username = ?`
        try {
            let [results] = await msc.query(sql, [email, username])
            if (!results.length) {
                return res.status(400).send({ message: "akun tidak ditemukan" })
            }
            let dataToken = {
                id: results[0].id,
                role_id: results[0].role_id
            }
            let tokenGantiPass = createTokenFP(dataToken)
            console.log(tokenGantiPass);
            let filepath = path.resolve(
                __dirname,
                "../template/lupapassword.html"
            )
            let htmlString = fs.readFileSync(filepath, "utf-8")
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                nama: results[0].username,
                token: tokenGantiPass
            })
            await transporter.sendMail({
                from: "Jakii <hilmawanzaky57@gmail.com>",
                to: "hilmawanzaky57@gmail.com",
                subject: "email ganti token",
                html: htmlToEmail
            })
            return res.status(200).send({token: tokenGantiPass, data: results})
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    gantiPassword: async (req, res) => {
        console.log(req.user);
        const { id } = req.user
        const { password } = req.body
        const msc = connection.promise()
        try {
            let pwBaru = {
                password: hash(password)
            }
            let sql = `update user set ? where id = ?`
            let [results] = await msc.query(sql, [pwBaru, id])
            console.log(results);
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    }
}
