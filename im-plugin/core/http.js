let request = require("request");
let fs = require("fs");
const agentOptions = {
  /* 需要加这两个参数，解决问题 throwing EPROTO error */
  ciphers: "ALL",
  secureProtocol: "TLSv1_method"
};

let creatorVersion = Editor.isMainProcess
  ? Editor.versions
    ? Editor.versions.CocosCreator
    : Editor.App.version
  : Editor.remote.versions
  ? Editor.remote.versions.CocosCreator
  : Editor.remote.App.version;

/**
 * 对象排序
 * @param {Object} obj 待排序的对象
 * @returns {Object} 排序好的对象
 */
let objectSortByKey = function(obj) {
  var newkey = Object.keys(obj).sort();
  var newObj = {};
  for (var i = 0; i < newkey.length; i++) newObj[newkey[i]] = obj[newkey[i]];
  return newObj;
};
/**
 * 对象转URL参数列表
 * @param {String} param 参数对象
 * @param {String} key 参数key
 * @param {String} encode 编码方式
 * @returns {String} 格式化完成参数列表
 */
let parameterEncode = function(param, key, encode) {
  if (param == null) return "";
  var paramStr = "";
  var t = typeof param;
  if (t == "string" || t == "number" || t == "boolean") {
    paramStr += "&" + key + "=" + (encode ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k =
        key == null
          ? i
          : key + (param instanceof Array ? "[" + i + "]" : "." + i);
      paramStr += parameterEncode(param[i], k, encode);
    }
  }
  return paramStr;
};

/**
 * 请求参数MD5签名
 * @param {Object} param 配置参数
 * @return {Object} 附加签名的请求对象
 */
let parseParameter = function(param) {
  var md5 = require("md5");
  var body = param;
  var plugin_id = "1026";
  var plugin_secret = "fc81d0f39ca8157f9fb6324912aa2cf3573a5a41";
  body.plugin_id = plugin_id;
  body.lang = Editor.lang;
  body.client_type = 1;
  body.version = creatorVersion;
  body = objectSortByKey(body);
  var sign = parameterEncode(body) + "&" + plugin_secret;
  body.sign = md5(sign.substr(1));
  return body;
};

/**
 * 读取 JSON 文件
 * @param {String} filePath JSON 文件路径
 * @returns {Object} JSON 对象
 */
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

/**
 * 写入对象到 JSON 文件
 * @param {String} filePath 要写入的地址
 * @param {Object} data     要写入的数据
 */
let saveJson = function(filePath, data) {
  require("fs").writeFileSync(filePath, JSON.stringify(data, null, "\t"));
};

let getUserData = function() {
  if (
    Editor.User &&
    Editor.User.getUserData &&
    typeof Editor.User.getUserData === "function"
  )
    return Editor.User.getUserData();
  let homePath = Editor.isMainProcess
    ? Editor.App.home
    : Editor.remote.App.home;
  var tokenPath = `${homePath}${
    creatorVersion >= "2.2.0" ? "/profiles" : ""
  }/user_token.json`;
  return readJson(tokenPath);
};

module.exports = {
  parseParameter: parseParameter,
  post(url, param) {
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: url,
          json: true,
          form: param,
          agentOptions: agentOptions
        },
        (err, res, body) => {
          if (!err && res.statusCode == 200) {
            if (body.status === 0 || body.error_code === "success") {
              resolve(body);
            } else {
              reject({
                status: body.status ? body.status : body.err_code,
                msg: body.status ? body.msg : body.error_msg
              });
            }
          } else {
            reject({
              status: res.statusCode,
              msg: err
            });
          }
        }
      );
    });
  },
  async getSessionCode() {
    var url = "https://creator-api.cocos.com/api/session/code";
    var param = {
      session_id: this.userInfo.session_id
    };
    var data = await this.post(url, this.parseParameter(param));
    return data;
  },
  async getSessionToken() {
    var url = "https://creator-api.cocos.com/api/session/token";
    var param = {
      session_code: this.userInfo.session_code
    };
    var data = await this.post(url, this.parseParameter(param));
    return data;
  },
  async getIMSettings() {
    var url = "https://creator-api.cocos.com/api/service/get_im_setting";
    var param = {
      session_token: this.userInfo.session_token
    };
    var data = await this.post(url, this.parseParameter(param));
    return data;
  },
  async getUserInfo() {
    var url = "https://creator-api.cocos.com/api/user/info";
    var param = {
      session_token: this.userInfo.session_token
    };
    var data = await this.post(url, this.parseParameter(param));
    return data;
  },
  async init(reload = false) {
    if (this.inited && !reload) return;
    this.userInfo = await getUserData();
    var sessionCodeInfo = await this.getSessionCode(this.userInfo.session_id);
    this.userInfo.session_code = sessionCodeInfo.data.session_code;
    var sessionTokenInfo = await this.getSessionToken(
      this.userInfo.session_code
    );
    this.userInfo.session_token = sessionTokenInfo.data.session_token;
    var userDataInfo = await this.getUserInfo();
    for (var p in userDataInfo.data) this.userInfo[p] = userDataInfo.data[p];
    this.userInfo = objectSortByKey(this.userInfo);
    this.inited = true;
  }
};
