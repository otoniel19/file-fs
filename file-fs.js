const express = require("express");
//const hdbs = require("handlebars");
const fs = require("fs");
//const hdbsHelp = require("handlebars-helpers")({ handlebars: hdbs });
const router = express.Router();
const logger = require("@otoniel19/logger");

router.use(
  express.static(require("path").join(__dirname, "static"), { index: false })
);

//initial directory
var dir = "";
//root directory
var rootDir = "";
//show hidden files
var showHiddenFiles = false;
//lock root dir navigation
var lockRootDir = true;
var pathUrl = "/";
var dirObj = [];

/*
 * @param {String} directory the initial directory to start
 * @param {String} root the root directory
 * @param {Boolean} hidden showHiddenFiles
 * @param {Boolean} lock lock root file directory to not pass root
 * @param {String} url the url to redirect
 */
exports.config = function (directory, root, hidden, lock, url) {
  dir = directory;
  rootDir = root;
  showHiddenFiles = Boolean(hidden);
  lockRootDir = Boolean(lock);
  pathUrl = url;
};

//get file icon
function getFileType(name) {
  if (name.includes(".mp3"))
    return { type: "fa-file-audio", mime: "audio/mp3" };
  else if (name.includes(".mp4"))
    return { type: "fa-file-video", mime: "video/mp4" };
  else if (name.includes(".txt"))
    return { type: "fa-file-alt", mime: "plain/text" };
  else if (
    name.includes(".png") ||
    name.includes(".jpg") ||
    name.includes(".jpeg")
  )
    return { type: "fa-file-image", mime: "image" };
  else return { type: "fa-file", mime: "plain/text" };
}

//change directory
async function cd() {
  dirObj = [];
  var pathDir;

  if (showHiddenFiles) pathDir = fs.readdirSync(dir);
  else pathDir = fs.readdirSync(dir).filter((o) => !o.startsWith("."));

  //scan dir
  pathDir.forEach((Name) => {
    if (fs.statSync(`${dir}/${Name}`).isFile()) {
      var fileType = getFileType(Name);
      dirObj.push({
        fileType: fileType.type,
        mime: fileType.mime,
        fs: Name,
        url: pathUrl,
        type: "file"
      });
    } else {
      var iconFolder = "";
      //check if dir have contents
      if (fs.readdirSync(`${dir}/${Name}`).length == 0)
        iconFolder = "fa-folder";
      else iconFolder = "fa-folder-open";

      dirObj.push({ icon: iconFolder, fs: Name, url: pathUrl, type: "folder" });
    }
  });
  return fs.readdirSync(dir);
}

setInterval(async () => {
  if (lockRootDir) {
    //scan dir
    const absDir = fs.readdirSync(dir).forEach((name) => {
      //check if is passing root dir
      if (rootDir.split(".").join("").split("/").join("") == name) {
        logger.warn("cannot close rootDir");
        dir = rootDir;
      }
    });
  }
}, 0);

router.use(async (req, res, next) => {
  await cd();
  //root path url
  global.pathUrl = pathUrl;
  await next();
});

router.get("/", async (req, res) => {
  global.fullUrl = req.protocol + "://" + req.get("host") + pathUrl;
  //fs nav file
  res.render("fs", { dir: dirObj, url: global.pathUrl });
});

router.get("/upDir", (req, res) => {
  //up one dir
  dir = `${dir}/../`;
  res.redirect(global.pathUrl);
});

router.get("/action=:type&:name&:action", async (req, res) => {
  var fullUrl = global.pathUrl;

  const { type, name, action } = req.params;
  if (action == "open") {
    //open dir
    dir = `${dir}/${name}`;
    res.redirect(global.pathUrl);
  } else if (action == "openFile") {
    //open file
    res.render("actions", {
      size: fs.readFileSync(`${dir}/${name}`).toString().length,
      fileName: name,
      url: global.pathUrl,
      type: "read",
      content: fs.readFileSync(`${dir}/${name}`).toString()
    });
  } else if (action == "openConfig") {
    var fType = "";
    if (fs.statSync(`${dir}/${name}`).isFile()) fType = "file";
    else fType = "folder";
    //open config
    res.render("actions", {
      type: "config",
      fType: fType,
      name: name,
      url: global.pathUrl
    });
  }
});

router.get("/create=:type&:name", (req, res) => {
  const { type, name } = req.params;
  //create dir
  if (type == "dir")
    fs.mkdirSync(`${dir}/${name}`, { force: true, recursive: true });
  //create file
  else fs.writeFileSync(`${dir}/${name}`, "", { force: true, recursive: true });
  res.redirect(global.pathUrl);
});

router.post("/apply=:action&:name&:type", (req, res) => {
  const { action, name, type } = req.params;
  var content;
  if (req.body.content) content = req.body.content;
  //write to file
  if (action == "write") {
    fs.writeFileSync(`${dir}/${name}`, content);
    res.redirect(global.fullUrl);
  } else if (action == "delete") {
    //delete dir or file
    if (type == "file") fs.rmSync(`${dir}/${name}`);
    else fs.rmdirSync(`${dir}/${name}`);
    //if is folder then remove folder from dir path nav
    if (type == "folder") dir = dir.split(name).join("");
    res.redirect(global.pathUrl);
  } else if (action == "rename") {
    res.render("actions", {
      type: "rename",
      old: name,
      type: type,
      url: global.pathUrl
    });
  }
});

router.post("/rename", (req, res) => {
  const { type, old, newName } = req.body;
  fs.renameSync(`${dir}/${old}`, `${dir}/${newName}`);
  //replace old folder name
  if (type == "folder") dir = dir.replace(old, newName);
  res.redirect(global.pathUrl);
});

//get info
exports.getInfo = function () {
  return {
    url: global.pathUrl,
    dirObj: dirObj,
    cd: cd,
    root: rootDir,
    currentDir: dir,
    lockRootDir: lockRootDir,
    showHiddenFiles: showHiddenFiles
  };
};

exports.router = router;
