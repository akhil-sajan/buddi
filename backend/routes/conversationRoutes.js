const express = require("express");
const router = express.Router();

const { sendVoiceMessage } = require("../controllers/conversationController");

router.post("/:conversationId/message", sendVoiceMessage);

module.exports = router;
