"use strict";
const http = require("http");
var assert = require("assert");
require("dotenv").config();
const express = require("express");
const app = express();
const mustache = require("mustache");
const filesystem = require("fs");
const hbase = require("hbase");

// Section 1A: Environment variables Needed
const port = Number(process.env.port);
const kafka_pass = process.env.KAFKA_PASS;
const hbase_auth = process.env.HBASE_AUTH;
const url = new URL(process.env.url);

var hclient = hbase({
  host: url.hostname,
  path: url.pathname ?? "/",
  port: url.port, // http or https defaults
  protocol: url.protocol.slice(0, -1), // Don't want the colon
  encoding: "latin1",
  auth: hbase_auth,
});

// Section 1B: Hbase functions
function counterToNumber(c) {
  return Number(Buffer.from(c).readBigInt64BE());
}
function rowToMap(row) {
  var stats = {};
  row.forEach(function (item) {
    stats[item["column"]] = counterToNumber(item["$"]);
  });
  return stats;
}

// SECTION 2: Scan prep

function scan_and_iter(scanner, done) {
  let all_rows = [];
  /*
AI DISCLOSURE: 
    Searched Google: "node.js hbase grab whole table iterate through rows"
    Gemini further suggested to do everythng on a 'data' event -- so I'm capturing \
    data as soon as it arrives and processing it asynchronously 
*/
  scanner.on("data", function (row) {
    try {
      let row_stats = rowToMap(row);
      all_rows.push(row_stats);
    } catch (e) {
      console.error("Error parsing row:", e);
    }
  });
  scanner.on("error", function (err) {
    console.error("Scan error:", err);
    done(err, null);
  });

  scanner.on("end", function () {
    console.log(
      "Finished scanning table. Total rows retrieved:",
      all_rows.length
    );
    done(null, all_rows);
  });
}

// Section 3: Start up Kafka Topic

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
    password: kafka_pass,
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

// SECTION 4: Enter data into speed layer

app.use(express.static("public"));
app.get("/loadRaceGraphs.html", function (req, res) {
  let name = req.query["name"];
  let income = req.query["income"];
  let sex = req.query["sex_dd"];
  let industry = req.query["industry_dd"];
  let race = req.query["race_dd"];
  let metro = req.query["metro_dd"];
  let report = {
    incwage: income,
    sex: sex,
    industry: industry,
    race_ethnc_gen: race,
    metro: metro,
  };
  if (name !== "Average Female in US") {
    producer
      .send({
        topic: "mpcs53014_eseline_speed",
        messages: [{ value: JSON.stringify(report) }],
      })
      .then((_) => res.redirect("interactive.html"))
      .catch((e) => {
        console.error(`[example/producer] ${e.message}`, e);
        res.redirect("interactive.html");
      });
  } else {
    res.redirect("interactive.html");
  }
});

/* SECTION 6:
AI DISCLAIMER: Because I am using a scrollytelling method, I should load the \
data at different times, thus, AI helped me switch to a fetch method
*/
app.get("/api/batch-data", function (req, res) {
  const scan_bv_race = hclient.getTable(tbl_bv_race).scan();
  // Reuse your scanner logic, but handle the response here
  scan_and_iter(scan_bv_race, function (err, data) {
    if (err) res.status(500).json({ error: err });
    else res.json(data); // Send data as JSON to the browser
  });
});

app.get("/api/user-stats", function (req, res) {
  const scan_stats = hclient.getTable(userstats).scan();
  // Uses the callback-based scan_and_iter function we fixed earlier
  scan_and_iter(scan_stats, function (err, data) {
    if (err) {
      console.error("Error fetching User Stats:", err);
      res.status(500).json({ error: "Failed to fetch user stats" });
    } else {
      // Send the rows back as JSON
      res.json(data);
    }
  });
});

/*
app.get("/api/speed-data", function (req, res) {
  scan_and_iter(scan_entries, function (err, data) {
    if (err) res.status(500).json({ error: err });
    else res.json(data);
  });
});
*/

app.listen(port);
