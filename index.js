const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()

const port = process.env.PORT;
const uri = process.env.MONGODB_URL;


app.use(express.json())
app.use(cors())


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const myDB = client.db("docAppoint");
    const doctorsCollection = myDB.collection("doctorsdata");
    // const patientCollention = myDB.collection("patien");

    // Get all doctors data from mongoDB.
    app.get("/doctors", async (req, res) => {
        const result = await doctorsCollection.find().toArray();
        res.send(result);
    })

    // Get all doctors data from mongoDB.
    app.get("/doctors/:id", async (req, res) => {
        const {id} = req.params;
        const result = await doctorsCollection.findOne({_id: new ObjectId(id)});
        res.send(result);
    })

    // Get top 3 doctors data based on their 'RATING' form mongoDB.
    app.get("/topDoctors", async (req, res) => {
        const result = await doctorsCollection.find().sort({rating: -1}).limit(3).toArray();
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server is running successfully. Welcome to "PH-ASSIGNMENT-09"');
})

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`)
})
