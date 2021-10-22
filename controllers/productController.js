const connection = require("../connections/mysqldb");
const { uploader } = require("../helpers");
const fs = require('fs');

module.exports = {
    getProducts: async (req, res) => {
        let sql = `select * from products`
        const msc = connection.promise()
        try {
            let [results] = await msc.query(sql)
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    addProduct: async (req, res) => {
        let path = "/products"
        const { image } = req.files
        const data = JSON.parse(req.body.data)
        let imagePath = image ? `${path}/${image[0].filename}` : null
        const { name, price } = data
        if (!name || !price) {
            if (imagePath) {
                fs.unlinkSync("./public" + imagePath);
            }
            return res.status(400).send({ message: `tidak valid` })
        }
        let sql = `insert into products set ?`
        const msc = connection.promise()
        try {
            let addProduct = {
                name,
                price,
                image: imagePath
            }
            await msc.query(sql, addProduct)
            sql = `select * from products`
            let [results] = await msc.query(sql)
            return res.status(200).send(results)
        } catch (error) {
            if (imagePath) {
                fs.unlinkSync("./public" + imagePath);
            }
            return res.status(500).send({ message: error.message })
        }
    },
    deleteproduct: async (req, res) => {
        const { id } = req.params
        const msc = connection.promise()
        let sql = `select * from products where id = ?`
        try {
            let [results] = await msc.query(sql, id)
            if (!results.length) {
                return res.status(400).send({ message: `tidak ada produk` })
            }
            sql = `delete from products where id = ?`
            await msc.query(sql, id)
            if (results[0].image) {
                if (fs.existsSync("./public" + results[0].image)) {
                    fs.unlinkSync("./public" + results[0].image)
                }
            }
            sql = `select * from products`
            let [results2] = await msc.query(sql)
            return res.status(200).send(results2)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    editproduct: async (req, res) => {
        let path = "/products"
        const { id } = req.params
        const { image } = req.files
        const data = JSON.parse(req.body.data)
        let imagePath = image ? `${path}/${image[0].filename}` : null
        const msc = connection.promise()
        try {
            let sql = `select id, image from products id = ?`
            let [productlist] = await msc.query(sql, id)
            if (!productlist.length) {
                return res.status(400).send({ message: `tidak ada produk` })
            }
            let dataedit = {
                name: data.name,
                price: data.price
            }
            if (imagePath) {
                dataedit.image = imagePath
            }
            sql = `update products set ? where id = ?`
            await msc.query(sql, [dataedit, id])
            if (imagePath) {
                if (dataedit[0].image) {
                    fs.unlinkSync("./public" + dataedit[0].image)
                }
            }
            sql = `select * from products`
            let [results] = await msc.query(sql)
            return res.status(200).send(results)
        } catch (error) {
            if (imagePath) {
                // hapus filenya jika error
                fs.unlinkSync("./public" + imagePath);
            }
            return res.status(500).send({ message: error.message })
        }
    },
    tesUpload: (req, res) => {
        console.log("isi req file :", req.files); //dapetin data file
        console.log("isi req body :", req.body); // dapetin data text
        return res.status(200).send({
            message: "berhasil",
            isireqfile: req.files
        })
    }
};
