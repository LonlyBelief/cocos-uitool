"use strict";
const ipcMain = require("electron").ipcMain;
module.exports = {
  async load() {
    ipcMain.on("editor:ready", this.queryImInfo);
    Editor.User.on("logout", this.userLogout);
    require("./core/imIconHelper").updateIcon();
  },

  unload() {
    ipcMain.off("editor:ready", this.queryImInfo);
    Editor.User.removeListener("logout", this.userLogout);
  },

  userLogout() {
    Editor.Panel.close("im-plugin");
  },

  queryImInfo() {
    require("./core/imIconHelper").updateIcon();
  },

  messages: {
    open(event) {
      Editor.Panel.open("im-plugin");
    },
    close(event) {
      Editor.Panel.close("im-plugin");
    }
  }
};
