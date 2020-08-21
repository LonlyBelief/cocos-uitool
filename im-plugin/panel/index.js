const fs = require("fire-fs");
const imIconHelper = Editor.require(
  "packages://im-plugin/core/imIconHelper.js"
);
const http = Editor.require("packages://im-plugin/core/http.js");
Editor.Panel.extend({
  listeners: {},
  template: fs.readFileSync(
    Editor.url("packages://im-plugin/panel/index.html"),
    "utf-8"
  ),
  messages: {},

  $: {
    im_webview: "#im-webview"
  },

  async run() {
    var isLogin = await Editor.User.isLoggedIn();
    console.log(isLogin);
    if (!isLogin) {
      var id1 = Editor.Dialog.messageBox({
        title: "提示",
        message: "您尚未登录账号，如需使用请先登录。是否前往登录？",
        buttons: ["确定", "取消"],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      });
      if (id1 === 0) {
      }
      Editor.Ipc.sendToMain("im-plugin:close");
    }
    imIconHelper.updateIcon();
  },

  async ready() {
    !window._Scene && (document.title = Editor.T("im-plugin.title"));
    // 注入 ipcRenderer 的 sendToHost 接口，提供给 webview 内嵌页面使用
    this.$im_webview.setAttribute(
      "preload",
      `file://${Editor.url("packages://im-plugin/panel/preload.js")}`
    );
    // 打开 webview 内嵌页面的开发者工具
    // this.$im_webview.addEventListener("dom-ready", () =>
    //   this.$im_webview.openDevTools()
    // );
    // 清空webview缓存
    var webContents = this.$im_webview.getWebContents();
    typeof webContents !== "undefined" &&
      webContents.session.clearStorageData([
        "appcache",
        "cookies",
        "filesystem",
        "indexdb",
        "localstorage",
        "shadercache",
        "websql",
        "serviceworkers",
        "cachestorage"
      ]);
    // 注册 ipc 消息
    this.$im_webview.addEventListener(
      "ipc-message",
      event => event.channel === "new-msg" && imIconHelper.updateIcon(true)
    );
    this.$im_webview.addEventListener("new-window", event => {
      require("electron").shell.openExternal(event.url);
    });
    await http.init();
    var imSettings = await http.getIMSettings();
    this.openUrl = `https://creator-api.cocos.com/api/account/client_signin?session_id=${
      http.userInfo.session_id
    }&redirect_url=${encodeURIComponent(imSettings.data.entry_url)}%3flang%3d${
      Editor.lang
    }`;
    this.$im_webview.src = this.openUrl;
  }
});
