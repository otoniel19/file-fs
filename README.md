# file-fs

- usage

```js
 const express = require("express")
 const { engine } = require("express-handlebars")
 const bodyParser = require("body-parser")
 const fileFs = require("file-fs")
 const hdbs = require("handlebars")
 const hdbsHelpers = require("handlebars-helpers")({ handlebars: hdbs })

 const app = express()

 app.set("views","./node_modules/file-fs/views")
 app.set("view engine","handlebars")
 app.engine("handlebars",engine({ defaultLayout: "main" }))

 app.use(bodyParser.json())
 app.use(bodyParser.urlencoded({ extended: false }))


 fileFs.config(dir: string,rootDir: string,showHiddenFiles: boolean,lockRootDir: boolean,url: string)

 fileFs.config("../foo","../foo/",false,true,"/files")

 app.use("/files",fileFs.router)
 app.listen(3000)

```

- new file-fs select mod!

```js
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const fsSl = require("file-fs/file-fs-select");
const hdbs = require("handlebars");

const app = express();

app.set("views", "./node_modules/file-fs/views");
app.set("view engine", "handlebars");
app.engine("handlebars", engine({ defaultLayout: "main" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

fsSl.config("../foo", false, "/files", "/");

app.use("/files", fsSl.router);
app.get("/", (req, res) => {
  fsSl.fs.on("done", (filesSelectedArray) => {
    console.log("done!");
  });
});

app.listen(3000);
```
