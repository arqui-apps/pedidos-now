const express = require("express");
const router = express.Router();
const { handleBrokerRequest } = require("../controllers/brokerController");

router.post("/request", handleBrokerRequest);

module.exports = router;
