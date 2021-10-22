const { connection } = require('../connections');

module.exports = {
    get: async (req, res) => {
        const { username, password } = req.query
        let inputQuery = []
        let sql = `select * from user `
        let msc = connection.promise()
        try {
            if (username) {
                inputQuery[0] = username
                sql += `where username = ? `
            }
            if (password) {
                inputQuery[1] = password
                sql += `and password = ?`
            }
            let [results] = await msc.query(sql, inputQuery)
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    getbyid: async (req, res) => {
        const { id } = req.params
        let sql = `select * from user where id = ?`
        let msc = connection.promise()
        try {
            let [results] = await msc.query(sql, [id])
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    post: async (req, res) => {
        const { username, password, address } = req.body
        if (!username || !password || !address) {
            return res.status(400).send({ message: `tidak valid` })
        }
        let sql = `insert into user set ?`
        let msc = connection.promise()
        try {
            let postData = {
                username,
                password,
                address
            }
            await msc.query(sql, postData)
            sql = `select * from user`
            let [results] = await msc.query(sql)
            return res.status(200).send(results)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    put: async (req, res) => {
        const { username, password, address } = req.body
        const { id } = req.params
        let sql = `select * from user where id = ?`
        let msc = connection.promise()
        try {
            let [results] = await msc.query(sql, [id])
            if (results.length == 0) {
                return res.status(400).send({ message: "data tidak ditemukan" })
            }
            let putData = {
                username,
                password,
                address
            }
            sql = `update user set ? where id = ?`
            await msc.query(sql, [putData, id])
            sql = `select * from user`
            let [results2] = await msc.query(sql)
            return res.status(200).send(results2)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    },
    deleteuser: async (req, res) => {
        const { id } = req.params
        let sql = `select * from user where id = ?`
        let msc = connection.promise()
        try {
            let [results] = await msc.query(sql, [id])
            if (!results.length) {
                return res.status(400).send({ message: "data tidak ada" })
            }
            sql = `delete from user where id = ?`
            await msc.query(sql, [id])
            sql = `select * from user`
            let [results2] = msc.query(sql)
            return res.status(200).send(results2)
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    }
};
