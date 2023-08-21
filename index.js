const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(express.json())
app.use(cors())


const name = process.env.MONGO_USER
const password = process.env.MONGP_PASS
const uri = `mongodb+srv://${name}:${password}@cluster0.oqkryfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const locationCollection = client.db('task').collection('location')
async function run() {
    try {
        await client.connect();

        app.post('/location', async (req, res) => {
            const data = await locationCollection.insertOne(req.body)
            res.send(data)
        })

        app.patch('/location/:id', async (req, res) => {
            const data = req.body 
            const id = { _id: new ObjectId(req.params.id) }
            const option = { upsert: true }
            let updateDoc ={}
           
            if (data.itemType) {
                 updateDoc = {
                    $set: {item: data.itemType},
                };
            }
            
            if (data.weight) {
                updateDoc = {
                    $set: {weight: data.weight},
                };
            }

            if (data.quantity) {
                updateDoc = {
                    $set: {quantity: data.quantity},
                };
            }
           
           
            const final = await locationCollection.updateOne(id, updateDoc, option)
            res.send(final)
        })

        app.get('/location/:email', async (req, res) => {
            const query = { senderEmail : req.params.email }
            const data = await locationCollection.findOne(query)
            res.send(data)
        })
    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log('server run on 5000 port')
})