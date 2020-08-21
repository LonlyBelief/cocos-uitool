// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    // css style for panel
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

    // html template for panel
    template: `
    <h2>change_altas</h2>
    <hr />
    <div>input aim finder: </div>
    <div><ui-input id="input_str" placeholder="CNBundle"></ui-input></div>
    <hr />
    <h3>原始图集</h3>
    <ui-asset class="flex-1" type="cc.Asset" droppable="asset" id="altas" value=""></ui-asset> <ui-button id="btn_creat1">获取数据</ui-button>
    <h3>新图集</h3>
    <ui-asset class="flex-1" type="cc.Asset" droppable="asset" id="new_altas" value=""></ui-asset><ui-button id="btn_creat2">获取数据</ui-button>
    <hr><ui-button id="btn">Send To Main</ui-button></hr>
  `,

    // element and variable binding
    $: {
        btn: "#btn",
        input_str: "#input_str",
        altas: "#altas",
        new_altas: "#new_altas",
        btn_creat1: "#btn_creat1",
        btn_creat2: "#btn_creat2",
    },

    ready() {
        let orData
        let newData
        this.$btn.addEventListener("confirm", () => {
            Editor.log("======sendData")
            Editor.Ipc.sendToMain("change_altas:clicked", this.$input_str.value, orData, newData)
        })
        this.$btn_creat1.addEventListener("confirm", () => {
            Editor.assetdb.queryMetaInfoByUuid(this.$altas.value, function (err, info) {
                orData = JSON.parse(info.json)
                Editor.log("=====meta1:" + JSON.stringify(orData))
            })
        })
        this.$btn_creat2.addEventListener("confirm", () => {
            Editor.assetdb.queryMetaInfoByUuid(this.$new_altas.value, function (err, info) {
                newData = JSON.parse(info.json)
                Editor.log("=====meta2:" + JSON.stringify(newData))
            })
        })
    },

    // register your ipc messages here
    messages: {
        "change_altas:hello"(event) {
            this.$label.innerText = "Hello!"
        },
    },
})
