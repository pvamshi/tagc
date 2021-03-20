"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTags = void 0;
var lokijs_1 = __importDefault(require("lokijs"));
var db = new lokijs_1.default("tagc.db");
var fileDatas = db.addCollection("fileData");
function saveTags(file, blocks) {
  var fileData = { name: file, tags: blocks };
  fileDatas.insert(fileData);
}
exports.saveTags = saveTags;
