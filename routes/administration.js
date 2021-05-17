const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
	res.render("administration/index");
});

 module.exports = router;
