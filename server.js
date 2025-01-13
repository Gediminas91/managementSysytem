const express = require("express");
const cors = require("cors");
const port = 3000;

const app = express();

app.use(express.json());

app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://gediminaslatonas91:SXPRtK3MFvdPpbTE@cluster0.pjsm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.get("/memberships", async (req, res) => {
  const con = await client.connect();
  const data = await con
    .db("management")
    .collection("services")
    .find()
    .toArray();
  await con.close();
  return res.json(data);
});

app.get("/users", async (req, res) => {
  console.log("ok");
  try {
    const con = await client.connect();

    const data = await con
      .db("management")
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "services",
            localField: "service_id",
            foreignField: "_id",
            as: "membership",
          },
        },
        {
          $unwind: "$membership",
        },
        {
          $project: {
            name: 1,
            surname: 1,
            email: 1,
            membership: "$membership.name",
          },
        },
      ])
      .toArray();
    await con.close();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/memberships", async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
      return res
        .status(400)
        .send({ error: "Name, price, and description are required." });
    }

    const con = await client.connect();
    const dbRes = await con
      .db("management")
      .collection("services")
      .insertOne({ name, price, description });
    await con.close();
    return res.send(dbRes);
  } catch (err) {
    console.error(err);
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, surname, email, service_id } = req.body;

    if (!name || !surname || !email || !service_id) {
      return res.status(400).send({ error: "All fields are required." });
    }

    const con = await client.connect();
    const dbRes = await con
      .db("management")
      .collection("services")
      .aggregate([
        {
          $match: { _id: new ObjectId(service_id) },
        },
        {
          $project: {
            userData: {
              name,
              surname,
              email,
              service_id: "$_id",
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$userData",
          },
        },
        {
          $merge: {
            into: "users",
            whenMatched: "fail",
            whenNotMatched: "insert",
          },
        },
      ]);
    await con.close();

    if (dbRes.length === 0) {
      return res.status(404).send({ error: "Membership not found." });
    }

    return res.send(dbRes);
  } catch (err) {
    console.error(err);
  }
});

app.delete("/memberships/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const con = await client.connect();
    const data = await con
      .db("management")
      .collection("services")
      .deleteOne({ _id: new ObjectId(id) });
    await con.close();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
