# file-fs

- usage

```js
 const express = require("express")
 const { engine } = require("express-handlebars")
 const bodyParser = require("body-parser")
 const fileFs = require("file-fs")

 const app = express()

 app.set("views","./node_modules/file-fs/views")
 app.set("view engine","handlebars")
 app.engine("handlebars",engine({ defaultLayout: "main" }))
 app.use(bodyParser.json())
 app.use(bodyParser.urlencoded({ extended: false }))


 fileFs.config(dir: string,rootDir: string,showHiddenFiles: boolean,lockRootDir: boolean,route: string)

 fileFs.config("../foo","../foo/",false,true,"/files")

 app.use("/files",fileFs.router)
 app.listen(3000)

```
