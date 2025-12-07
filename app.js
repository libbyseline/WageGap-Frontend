"use strict"; // From Spetrus template
const http = require("http"); // From Spetrus template
var assert = require("assert"); // From Spetrus template
require("dotenv").config(); // From Spetrus template
const express = require("express"); // From Spetrus template
const app = express(); // From Spetrus template
const mustache = require("mustache"); // From Spetrus template
const filesystem = require("fs"); // From Spetrus template
const url = new URL(process.argv[3]); // From Spetrus template
const hbase = require("hbase"); // From Spetrus template
const port = Number(process.argv[2]); // From Spetrus template

var hclient = hbase({
  // Variable is from Spetrus template
  host: url.hostname,
  path: url.pathname ?? "/",
  port: url.port, // http or https defaults
  protocol: url.protocol.slice(0, -1), // Don't want the colon
  encoding: "latin1",
  auth: process.env.HBASE_AUTH,
});

function counterToNumber(c) {
  // Function is from Spetrus template
  return Number(Buffer.from(c).readBigInt64BE());
}
function rowToMap(row) {
  // Function is from Spetrus template
  var stats = {};
  row.forEach(function (item) {
    stats[item["column"]] = counterToNumber(item["$"]);
  });
  return stats;
}

// SECTION 00: Variables & base functions to load data

const tbl_bv_sex = "eseline_bv_sex";
const scan_bv_sex = hbase({}).getTable("tbl_bv_sex").scan();
const rows_bv_sex = [];

function scan_and_iter(scanner) {
  /*
AI DISCLOSURE: 
    Searched Google: "node.js hbase grab whole table iterate through rows"
*/
  all_rows = [];
  scanner.on("readable", function () {
    let chunk;
    while ((chunk = table.read())) {
      chunk.forEach((row) => {
        row_stats = rowToMap(row);
        all_rows.push(row_stats);
      });
      // IF I decide to do a graph where I map out each point one by one
      // I'd have to add some kind of function here to do that
      /*
      To process each row -- you'd do something like:
      row_stats.forEach(cell => {
        const value = cell.$;
        const column = cell.column;
        console.log(`- Column: ${column}, Value: ${value}`)

      */
    }
  });
  scanner.on("error", function (err) {
    console.error("Scan error:", err);
  });

  scanner.on("end", function () {
    console.log("Finished scanning table. Total rows retrieved:", rows.length);
  });
  return all_rows; // Change if not doing all_rows
}

app.use(express.static("public")); // From Spetrus template
app.get("/delays.html", function (req, res) {
  // From Spetrus template
  // TODO: replace next two lines with variables of input
  const route = req.query["origin"] + req.query["dest"];
  console.log(route);
  rows_bv_sex = scan_and_iter(scan_bv_sex);
});

const { Kafka } = require("kafkajs");

const kafkajsClient = new Kafka({
  clientId: "test-client",
  brokers: [
    "boot-public-byg.mpcs53014kafka.2siu49.c2.kafka.us-east-1.amazonaws.com:9196",
  ],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-512",
    username: "mpcs53014-2025",
    password: "Kafka password here",
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
});

const testConnection = async () => {
  try {
    const admin = kafkajsClient.admin();
    await admin.connect();
    console.log("✅ KafkaJS connection successful!");

    const topics = await admin.listTopics();
    console.log("Available topics:", topics);

    await admin.disconnect();
  } catch (error) {
    console.error("❌ KafkaJS connection error:", error);
  }
};
const producer = kafkajsClient.producer();
producer.connect();
testConnection();

app.get("/weather.html", function (req, res) {
  var station_val = req.query["station"];
  var fog_val = req.query["fog"] ? true : false;
  var rain_val = req.query["rain"] ? true : false;
  var snow_val = req.query["snow"] ? true : false;
  var hail_val = req.query["hail"] ? true : false;
  var thunder_val = req.query["thunder"] ? true : false;
  var tornado_val = req.query["tornado"] ? true : false;
  var report = {
    station: station_val,
    clear:
      !fog_val &&
      !rain_val &&
      !snow_val &&
      !hail_val &&
      !thunder_val &&
      !tornado_val,
    fog: fog_val,
    rain: rain_val,
    snow: snow_val,
    hail: hail_val,
    thunder: thunder_val,
    tornado: tornado_val,
  };

  producer
    .send({
      topic: "weather-reports",
      messages: [{ value: JSON.stringify(report) }],
    })
    .then((_) => res.redirect("submit-weather.html"))
    .catch((e) => {
      console.error(`[example/producer] ${e.message}`, e);
      res.redirect("submit-weather.html");
    });
});

app.listen(port);
