let express = require('express');
let cors = require('cors');
const app = express()
const PORT = process.env.PORT || 5700
const { authRoute, userRoute, productsRoute } = require('./routes');
const bearerToken = require('express-bearer-token');
const http = require('http');
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: "*"
});
// xulqgkepfnoeafbh

// GATAU NAMA
app.use(express.json())
app.use(cors())
app.use(bearerToken())

app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))

// API
app.use("/auth", authRoute)
app.use("/users", userRoute)
app.use("/products", productsRoute)


// MongoDB
const { MongoClient, ObjectId, ISODate } = require('mongodb');
const uri = "mongodb+srv://hilmawanz:curlie@cluster0.rzldk.mongodb.net/sandbox?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect().then(() => {
    console.log("mongoDB connected");
}).catch((error) => {
    console.log(error);
})

app.get("/initdata", async (req, res) => {
    const collection = client.db("sandbox").collection("movies")
    await collection.insertMany([
        {
            title: 'Titanic',
            year: 1997,
            genres: ['Drama', 'Romance'],
            rated: 'PG-13',
            languages: ['English', 'French', 'German', 'Swedish', 'Italian', 'Russian'],
            released: new Date("1997-12-19T00:00:00.000Z"),
            awards: {
                wins: 127,
                nominations: 63,
                text: 'Won 11 Oscars. Another 116 wins & 63 nominations.'
            },
            cast: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane', 'Kathy Bates'],
            directors: ['James Cameron']
        },
        {
            title: 'The Dark Knight',
            year: 2008,
            genres: ['Action', 'Crime', 'Drama'],
            rated: 'PG-13',
            languages: ['English', 'Mandarin'],
            released: new Date("2008-07-18T00:00:00.000Z"),
            awards: {
                wins: 144,
                nominations: 106,
                text: 'Won 2 Oscars. Another 142 wins & 106 nominations.'
            },
            cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
            directors: ['Christopher Nolan']
        },
        {
            title: 'Spirited Away',
            year: 2001,
            genres: ['Animation', 'Adventure', 'Family'],
            rated: 'PG',
            languages: ['Japanese'],
            released: new Date("2003-03-28T00:00:00.000Z"),
            awards: {
                wins: 52,
                nominations: 22,
                text: 'Won 1 Oscar. Another 51 wins & 22 nominations.'
            },
            cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naitè'],
            directors: ['Hayao Miyazaki']
        },
        {
            title: 'Casablanca',
            genres: ['Drama', 'Romance', 'War'],
            rated: 'PG',
            cast: ['Humphrey Bogart', 'Ingrid Bergman', 'Paul Henreid', 'Claude Rains'],
            languages: ['English', 'French', 'German', 'Italian'],
            released: new Date("1943-01-23T00:00:00.000Z"),
            directors: ['Michael Curtiz'],
            awards: {
                wins: 9,
                nominations: 6,
                text: 'Won 3 Oscars. Another 6 wins & 6 nominations.'
            },
            lastupdated: '2015-09-04 00:22:54.600000000',
            year: 1942
        }
    ])
    return res.status(200).send({ message: "berhasil insert" })
})

app.post("/movies", async (req, res) => {
    const collection = client.db("sandbox").collection("movies")
    if (Array.isArray(req.body.data)) {
        let data = req.body.data
        try {
            await collection.insertMany([...data])
            return res.status(200).send({ message: "berhasil" })
        } catch (error) {
            return res.status(400).send({ message: error.message })
        }
    } else {
        return res.status(400).send("bad request: type data has to be array")
    }
})

// API NOT FOUND
app.all("*", (req, res) => {
    return res.status(404).send({ message: "not found" });
});

// Socket.io
let messages = []

app.get("/mess", (req, res) => {
    return res.status(200).send(messages)
})

app.post("/sendmess", (req, res) => {
    messages.push(req.body)
    console.log(messages);
    io.emit("pesan", messages)
    return res.status(200).send({ messages: "berhasil kirim pesan" })
})

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('a user connected');
    socket.on("bebas", (data) => {
        io.emit("balas", `${data.name} telah join chat`)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

server.listen(PORT, () => {
    console.log(`Server Jalan di Port ${PORT}`);
})