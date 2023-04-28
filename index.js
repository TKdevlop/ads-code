const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const csvtojsonV2 = require("csvtojson");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());
// generally comes from env
const uri =
  "mongodb+srv://tushark:vrQvrNWVSvogV1vk@ads.jugzgvl.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
(async function () {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("ads");
    // can imporve this by using express router & refactor that to separate file
    app.get("/populate", async function (req, res) {
      const jsonDataRes = await fetch(
        "https://jsonplaceholder.typicode.com/comments"
      );
      const jsonData = await jsonDataRes.json();

      const csvDataRes = await fetch(
        // "http://console.mbwebportal.com/deepak/bigcsvdata.csv"  //enableing large upload will take around 10 mins can imporve by using better libray & by processing in chunck/pipe to ease the work load
        "http://console.mbwebportal.com/deepak/csvdata.csv"
      );
      const csvDataText = await csvDataRes.text();
      const csvDataJSON = await csvtojsonV2().fromString(csvDataText);

      db.collection("posts").insertMany([...jsonData, ...csvDataJSON]);
      res.json({ success: true });
    });

    app.post("/search", async function (req, res) {
      const { skip, limit, sortKey, sortValue } = req.query;
      //can imporve this by only allowing certain keys(name, email, body) & reject the request if something unexpected is received
      const filter = req.body;
      const data = await db
        .collection("posts")
        .find(filter)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({
          [sortKey]: parseInt(sortValue),
        })
        .toArray();
      res.json(data);
    });

    app.listen(3000, () => {
      console.log("Server running at 3000");
    });
  } catch (e) {
    console.log("Some error occur", e);
    process.exit();
  }
})();
