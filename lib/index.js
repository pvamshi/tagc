"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fileio_1 = require("./fileio");
var parser_1 = require("./parser");
var file = "test-lists.md";
fileio_1.getText(file, function (data) {
    var tagBlocks = parser_1.getBlocks(data);
    // saveTags(file, tagBlocks);
});
