"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const results_1 = require("./results");
var router = express_1.Router();
router.post("/annotations", (req, res) => {
    results_1.okRes(res, { result: req.body });
});
exports.default = router;
