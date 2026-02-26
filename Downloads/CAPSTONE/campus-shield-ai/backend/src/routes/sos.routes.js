const express = require("express");
const router = express.Router();

const { createSOS, getAllSOS } = require("../controllers/sos.controller");

router.post("/", createSOS);
router.get("/", getAllSOS);

module.exports = router;
