const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://root:pUJ5vKafIGkvbH9PckxixcOf@robin.iran.liara.ir:33846/my-app?authSource=admin";

(async () => {
  const client = new MongoClient(uri);
  await client.connect();

  const users = client.db("ShahDB").collection("orders");

  // Read JSONL file (one JSON object per line)
  const lines = fs.readFileSync("users.json", "utf8").trim().split("\n");

  const data = lines.map((line) => {
    const obj = JSON.parse(line);

    // Convert $oid → ObjectId
    if (obj._id && obj._id.$oid) {
      obj._id = new ObjectId(obj._id.$oid);
    }

    return obj;
  });
//  console.log("Updated:", data);

  const bulk = data.map((u) => ({
    updateOne: {
      filter: { zipCode: u.zipCode },
      update: { $set: { province: u.province } },
    },
  }));

  const result = await users.bulkWrite(bulk);

  console.log("Updated:", result.modifiedCount);

  await client.close();
})();
