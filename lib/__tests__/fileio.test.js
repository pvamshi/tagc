"use strict";
// WARNING: These tests are specific to my system
Object.defineProperty(exports, "__esModule", { value: true });
var fileio_1 = require("../fileio");
describe("file io", function () {
    test("get file data", function () {
        fileio_1.getText("test.md", function (data) { return expect(data).toBe("# Test file\n"); });
    });
    test("write file data", function () {
        var text = String(new Date().getTime());
        fileio_1.writeText("test-write.md", text, function (err) {
            expect(err).toBeUndefined();
            fileio_1.getText("test-write.md", function (data) { return expect(data).toBe(text); });
            //restore back
        });
    });
});
