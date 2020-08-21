"use strict"
const fs = require("fs")
const path = require("path")

//读取cn下的main.plist.mate文件
//读取要修改的文件下的main.plist.mate文件
//读取预制、场景中图片的uuid
//根据uuid在cn中的mate文件找到名字，然后找到要修改文件下的uuid
//重写uuid，保存
module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        open() {
            // open entry panel registered in package.json
            Editor.Panel.open("change_altas")
        },
        "say-hello"() {
            Editor.log("Hello World!")
            // send ipc message to panel
            Editor.Ipc.sendToPanel("change_altas", "change_altas:hello")
        },
        clicked(event, finderName, metaUUID, newMetaUUID) {
            // Editor.log("======get Data")
            this.oldAltas = metaUUID
            this.newAltas = newMetaUUID
            this.uuidToName = {}
            // Editor.log("=====old :" + JSON.stringify(this.oldAltas.uuid))
            // Editor.log("=====new :" + JSON.stringify(this.newAltas.uuid))
            for (let item in this.oldAltas.subMetas) {
                let data = this.oldAltas.subMetas[item]
                let uuid = data["uuid"]
                this.uuidToName[uuid] = item
            }
            // Editor.log("=====save :" + JSON.stringify(this.uuidToName))
            // Editor.log("========path:" + Editor.Project.path)
            let newPath = path.join(Editor.Project.path, "assets/" + finderName)
            // Editor.log("========path:" + newPath)
            this.finPrefab(newPath)
            Editor.log("======替换完成")
        },
    },
    finPrefab(path) {
        if (fs.statSync(path).isDirectory()) {
            let files = fs.readdirSync(path)
            files.forEach((element) => {
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
                    if (obj["__type__"] == "cc.Sprite") {
                        if (obj["_atlas"] && obj["_atlas"]["__uuid__"]) {
                            // if (obj["_atlas"]["__uuid__"] == this.oldAltas.uuid) {
                            obj["_atlas"]["__uuid__"] = this.newAltas.uuid
                            if (obj["_spriteFrame"] && obj["_spriteFrame"]["__uuid__"]) {
                                let uuid = obj["_spriteFrame"]["__uuid__"]
                                // Editor.log("=======uuid:" + uuid)
                                let name = this.uuidToName[uuid]
                                // Editor.log("=======name:" + name)
                                let newNameData = this.newAltas.subMetas[name]
                                // Editor.log("=======namedata:" + newNameData)
                                if (newNameData) {
                                    // Editor.log("=======uuid:" + newNameData["uuid"])
                                    obj["_spriteFrame"]["__uuid__"] = newNameData["uuid"]
                                }
                            }
                            // }
                        }
                    }
                }
                fs.writeFileSync(path, JSON.stringify(jD, null, 2))
            }
        }
    },
}
