let readJson = function(filePath) {
  let fs = require("fs");
  var contents = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8")
    : "{}";
  try {
    return JSON.parse(contents);
  } catch (error) {
    return {};
  }
};
global.hostAPI = {
  imPluginVersion: readJson(`${__dirname}/../package.json`).version,
  sendToHost: (channel, ...args) => {
    require("electron").ipcRenderer.sendToHost(channel, args);
  }
};
