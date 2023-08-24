const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const stripe = require('stripe')("sk_test_51NFaHHHYxG7WJPCTo6DyF8n9Ty7LHso58T2LKEWbMN1RnwDs6Vdb8c1AIEk6ywGP4JAayNmD8PMlNtmwQBIsvcjK00SvyfXze0")
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
const districCollection = client.db('task').collection('districAndKm')
const orderHisCollection = client.db('task').collection('history')

async function run() {
    try {
        await client.connect();

        app.get('/distric', async (req, res) => {
            const data = await districCollection.find().toArray()
            res.send(data)
        })

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
            if (data.image) {
                updateDoc = {
                    $set: { image: data.image },
                };
            }

            if (data.date) {
                updateDoc = {
                    $set: { date: data.date },
                };
            }

            if (data.floor) {
                updateDoc = {
                    $set: { floor: data.floor },
                };
            }
           
           
            const final = await locationCollection.updateOne(id, updateDoc, option)
            res.send(final)
        })

        app.get('/location/:id', async (req, res) => {
            const query = { _id : new ObjectId(req.params.id) }
            const data = await locationCollection.findOne(query)
            res.send(data)
        })



        app.post("/create-payment-intent", async (req, res) => {
            const { subTotal } = req.body;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: subTotal * 100,
                currency: "bdt",
                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });





        app.post("/summery", async (req, res) => {
            const data = req.body;

            //const updatedClass = await panndingCollaction.updateOne(classId, updateDoc, options);
            const result = await orderHisCollection.insertOne(data);
            //const deleted = await classSelectCollaction.deleteOne(id);
            res.send(result);
        });
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