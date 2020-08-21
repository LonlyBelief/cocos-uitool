"use strict"
const fs = require("fs")
const path = require("path")

var font_uuid = ""
var delete_uuid = ""
module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },
    isJSON(str) {
        if (typeof str == "string") {
            try {
                let obj = JSON.parse(str)
                return str.indexOf("{") > -1
            } catch (e) {
                //console.log(e);
                return false
            }
        }
        return false
    },
    // register your ipc messages here
    messages: {
        open() {
            // open entry panel registered in package.json
            Editor.Panel.open("font_change")
        },
        "say-hello"() {
            Editor.log("Hello World!")
            // send ipc message to panel
            Editor.Ipc.sendToPanel("font_change", "font_change:hello")
        },
        clicked() {
            try {
                this.finPrefab(path.join(Editor.Project.path, "assets"))
                Editor.log("替换完成")
            } catch (e) {
                Editor.error("====:" + e)
            }
        },
        onClickOpenFile(event, param) {
            try {
                // let str = JSON.stringify(param)
                this.font_uuid = param.change
                this.delete_uuid = param.delete
            } catch (e) {
                Editor.error("====:" + e)
            }
        },
        deleteAimFont(event) {
            try {
                this.deleteFont(path.join(Editor.Project.path, "assets"))
                Editor.log("删除" + this.delete_uuid)
            } catch (e) {
                Editor.error("====:" + e)
            }
        }
    },
    finPrefab(path) {
        if (fs.statSync(path).isDirectory()) {
            let files = fs.readdirSync(path)
            files.forEach(element => {
                let newpath = path + "/" + element
                this.finPrefab(newpath)
            })
        } else {
            let regex = new RegExp("(.prefab|.fire)$")
            if (regex.test(path)) {
                // Editor.log(path)
                let data = fs.readFileSync(path)
                let jD = JSON.parse(data.toString())
                // Editor.log("======all:" + jD.length)
                for (var i = 0; i < jD.length; i++) {
                    let obj = jD[i]
                    if (obj["__type__"] == "cc.Label") {
                        if (obj["_N$file"] == null || (obj["_N$file"] && obj["_N$file"]["__uuid__"] == this.delete_uuid)) {
                            let data = {
                                __uuid__: this.font_uuid
                            }
                            obj["_N$file"] = data
                        }
                        obj["_isSystemFontUsed"] = false
                    }
                }
                fs.writeFileSync(path, JSON.stringify(jD, null, 2))
            }
        }
    },
    deleteFont(path) {
        if (fs.statSync(path).isDirectory()) {
            let files = fs.readdirSync(path)
            files.forEach(element => {
                let newpath = path + "/" + element
                this.finPrefab(newpath)
            })
        } else {
            let regex = new RegExp("(.prefab|.fire)$")
            if (regex.test(path)) {
                // Editor.log(path)
                let data = fs.readFileSync(path)
                let jD = JSON.parse(data.toString())
                // Editor.log("======all:" + jD.length)
                for (var i = 0; i < jD.length; i++) {
                    let obj = jD[i]
                    if (obj["__type__"] == "cc.Label") {
                        if (obj["_N$file"] && obj["_N$file"]["__uuid__"] == this.delete_uuid) {
                            obj["_N$file"] = null
                        }
                        obj["_isSystemFontUsed"] = true
                    }
                }
                fs.writeFileSync(path, JSON.stringify(jD, null, 2))
            }
        }
    }
}
