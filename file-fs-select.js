const { log } = require("console");
const express = require("express");
const exphdbs = require("express-handlebars");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const hdbs = require("handlebars");
const EventEmitter = require("events").EventEmitter;

var showHidden = false;
var dir = "";
var url = "";
var target = "";
var navObj = [];
var selectedFiles = [];
var emiter = new EventEmitter();

router.use(express.static(path.join(__dirname, "static"), { index: false }));

exports.config = function (showHiddenFile, dirName, urlPath, targetUrl) {
  showHidden = Boolean(showHiddenFile);
  dir = dirName;
  url = urlPath;
  target = targetUrl;
};

async function cd() {
  navObj = [];
  var dirRead;
  if (showHidden) dirRead = fs.readdirSync(dir);
  else dirRead = fs.readdirSync(dir).filter((o) => !o.startsWith("."));

  var stat = fs.statSync;

  dirRead.forEach((name) => {
    if (stat(`${dir}/${name}`).isFile())
      navObj.push({
        select: true,
        name: name,
        icon: "fa-file",
        file: true
      });
    else
      navObj.push({
        select: false,
        name: name,
        icon: "fa-folder",
        file: false
      });
  });
}

router.use(async (req, res, next) => {
  await cd();
  global.pathUrl = url;
  global.targetUrl = target;
  hdbs.registerHelper("url", function () {
    return new hdbs.SafeString(url);
  });
  hdbs.registerHelper("href", function (url, ctx) {
    var str = `<a href="${url}">${ctx}</a>`;
    return new hdbs.SafeString(str);
  });
  await next();
});

router.get("/", (req, res) => {
  res.render("selector/file-selector", {
    dir: navObj,
    total: selectedFiles.length,
    files: selectedFiles.join(",")
  });
});

router.post("/new", (req, res) => {
  const { name } = req.body;
  //let newFiles = [...new Set(selectedFiles)];
  selectedFiles.push(`${dir}${name}`);
  let newFiles = [...new Set(selectedFiles)];
  selectedFiles = newFiles;
  res.redirect(global.pathUrl);
});

router.post("/cd", async (req, res) => {
  const { name } = req.body;
  dir = `${dir}/${name}`;
  res.redirect(global.pathUrl);
});

router.post("/upDir", (req, res) => {
  dir = `${dir}/../`;
  res.redirect(global.pathUrl);
});

var done = false;

router.get("/save", (req, res) => {
  done = true;
  res.redirect(global.targetUrl);
});

setInterval(() => {
  if (done) {
    emiter.emit("done", selectedFiles);
    done = false;
  }
}, 0);

exports.router = router;
exports.fs = emiter;
