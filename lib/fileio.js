"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeText = exports.getText = exports.fullPath = void 0;
var fs_1 = __importDefault(require("fs"));
var BASE_PATH = "/Users/vamshi/Dropbox";
var fullPath = function (path) { return BASE_PATH + "/" + path; };
exports.fullPath = fullPath;
function getText(file, onSuccess) {
    fs_1.default.readFile(exports.fullPath(file), "utf8", function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        onSuccess(data);
    });
}
exports.getText = getText;
function writeText(file, content, onDone) {
    fs_1.default.writeFile(exports.fullPath(file), content, function (err) {
        if (err) {
            console.error(err);
            onDone(err);
        }
        onDone();
    });
}
exports.writeText = writeText;
