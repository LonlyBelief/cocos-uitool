const laytpl = require("./laytpl");
const http = require("./http.js");
module.exports = {
  updateIcon: async function(hasNewMsg = false) {
    var tpl = laytpl(
      require("fs").readFileSync(
        Editor.url("packages://im-plugin/res/imTpl.html"),
        "utf-8"
      )
    );
    await http.init();
    var imSettings = await http.getIMSettings();
    if (
      imSettings.data.show_entrance === null ||
      imSettings.data.show_entrance === 0
    )
      return;
    var isVip =
      imSettings.data.user_licnese && imSettings.data.user_licnese !== 0;
    let html = tpl.render({
      title: imSettings.data.button_title,
      normal_icon: Editor.url(
        `packages://im-plugin/res/${isVip ? "" : "no-"}vip-normal.png`
      ).replace(/\\/g, "\\\\"),
      hover_icon: Editor.url(
        `packages://im-plugin/res/${isVip ? "" : "no-"}vip-click.png`
      ).replace(/\\/g, "\\\\"),
      hint_icon: Editor.url(`packages://im-plugin/res/red-point.png`).replace(
        /\\/g,
        "\\\\"
      ),
      hasNewMsg: hasNewMsg
    });
    Editor.Ipc.sendToAll("im-plugin:update-im-html", html);
  }
};
