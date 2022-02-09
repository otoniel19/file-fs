# file-fs

- usage

```js
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const fileFs = require("file-fs");
const hdbs = require("handlebars");
const hdbsHelpers = require("handlebars-helpers")({ handlebars: hdbs });

const app = express();

app.set("views", "./node_modules/file-fs/views");
app.set("view engine", "handlebars");
app.engine("handlebars", engine({ defaultLayout: "main" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

fileFs.config("../foo", "../foo/", false, true, "/files");

app.use("/files", fileFs.router);
app.listen(3000);
```
