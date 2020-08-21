// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    // css style for panel
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

    // html template for panel
    template: `
    <h2>font_change</h2>
    <hr />
    <h3>要使用的font</h3>
    <ui-asset class="flex-1" type="cc.Font" droppable="asset" id="file" value=""></ui-asset>
    <h3>要替换的font</h3>
    <ui-asset class="flex-1" type="cc.Font" droppable="asset" id="change" value=""></ui-asset>
    <br />
    <br />
    <ui-button id="btn">确认</ui-button>
    <ui-button id="delete">删除</ui-button>
  `,

    // element and variable binding
    $: {
        btn: "#btn",
        file: "#file",
        change: "#change",
        delete: "#delete"
    },
    // method executed when template and styles are successfully loaded and initialized
    ready() {
        this.$btn.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("font_change:clicked")
        })
        this.$file.addEventListener("confirm", param => {
            let params = {
                delete: this.$change.value,
                change: this.$file.value
            }
            Editor.Ipc.sendToMain("font_change:onClickOpenFile", params)
        })
        this.$change.addEventListener("confirm", param => {
            let params = {
                delete: this.$change.value,
                change: this.$file.value
            }
            Editor.Ipc.sendToMain("font_change:onClickOpenFile", params)
        })
        this.$delete.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("font_change:deleteAimFont")
        })
    },

    // register your ipc messages here
    messages: {
        "font_change:hello"(event) {
            this.$label.innerText = "Hello!"
        }
    }
})
