require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const port = process.env.PORT || 8000;
const uri = process.env.MONGODB_URL;

app.use(express.json());
app.use(cors());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Verify the Token
const varifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }

  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
  );

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log("from backend payload data - ", payload);
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const myDB = client.db("docAppoint");
    const doctorsCollection = myDB.collection("doctorsdata");
    const AppointmentsCollention = myDB.collection("appointments");

    // // Get all doctors data from mongoDB.
    // app.get("/doctors", async (req, res) => {
    //     const result = await doctorsCollection.find().toArray();
    //     res.send(result);
    // })

    // ----------------------------------------------------------------------

    app.get("/doctors", async (req, res) => {
      const { search } = req.query;
      let query = {};

      if (!search) {
        query = doctorsCollection.find();
      } else {
          query = doctorsCollection.find({
            $or: [
              { name: { $regex: search, $options: "i" } },  // 'i' - handle case insensitive
              { specialty: { $regex: search, $options: "i" } },
            ],
        });
      }

      const result = await query.toArray();
      
      
      console.log('search result access from backend - ', result)
      

      res.send(result);
    });

    // ----------------------------------------------------------------------

    // Get indivisual doctors data from mongoDB.
    app.get("/doctors/:id", varifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Get top 3 doctors data based on their 'RATING' form mongoDB.
    app.get("/topDoctors", async (req, res) => {
      const result = await doctorsCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // Get doctor appointments based on patientId
    app.get("/appointments/:patientId", varifyToken, async (req, res) => {
      const { patientId } = req.params;
      const result = await AppointmentsCollention.find({ patientId }).toArray();
      res.send(result);
    });

    // Add Appointments at mongoDB
    app.post("/appointments", varifyToken, async (req, res) => {
      const appointments = req.body;
      const result = await AppointmentsCollention.insertOne(appointments);
      res.send(result);
    });

    // Update Appointment Data
    app.patch("/appointments/:id", varifyToken, async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const result = await AppointmentsCollention.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
      );
      res.send(result);
    });

    // Delete Appointments based on individual patient on their appointment
    app.delete("/appointments/:id", varifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await AppointmentsCollention.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send('Server is running successfully. Welcome to "PH-ASSIGNMENT-09"');
});

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`);
});
