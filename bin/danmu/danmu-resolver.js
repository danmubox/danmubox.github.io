/*jshint esversion: 6 */

/**
 * 任务状态
 * 0：待解析，1：待处理，2：处理中，3：处理完成，-1：处理失败
 */
const ENUM_TASK_STATE = {
    WAIT_PARSE: 0,
    WAIT_HANDLE: 1,
    HANDLEING: 2,
    HANDLE_SUCCESS: 3,
    HANDLE_FAIL: -1
};

/**
 * 弹幕解析器
 * 
 */
var DanMuResolver = {
    /**
     * 解析文件集
     * 
     * @param {文件数组} files 弹幕文件集
     * @param {函数} addSuccess 添加成功回调(danMu)
     * @param {函数} readSuccess 读取成功回调(danMu,$xml)
     * 
     */
    resolveFiles: (files, addSuccess, readSuccess) => {

        const len = files.length;

        for (let i = 0; i < len; i++) {
            DanMuResolver.resolveFile(files[i], addSuccess, readSuccess);
        }
    },
    /**
     * 解析文件
     * 
     * @param {文件对象} file 弹幕文件
     * @param {函数} addSuccess 添加成功回调(danMu)
     * @param {函数} readSuccess 读取成功回调(danMu,$xml)
     * 
     */
    resolveFile: (file, addSuccess, readSuccess) => {

        if (file.type != "text/xml") {

            toastr.error(`文件：${file.name}，不是一个弹幕文件！`);
            return;
        }

        const danMu = new DanMu(file);

        addSuccess(danMu);

        DanMuResolver.read(danMu, readSuccess);
    },
    /**
     * 解析
     * 异步
     * @param  {文件对象} file 弹幕文件
     * @param  {字符串} name 文件名（不含后缀）
     * @param {函数} readSuccess 解析成功
     */
    read: (danMu, readSuccess) => {

        const reader = new FileReader();

        // 注册加载完成监听，此处不可以=>
        reader.onload = function() {
            readSuccess(danMu, $($.parseXML(this.result)));
        };

        // 开始读取
        reader.readAsText(danMu.file, "UTF-8");
    },
    /**
     * 读取完毕的回调
     * 
     * @param  {对象} danMu       弹幕
     * @param  {$对象} $xml 弹幕内容对象
     */
    loadBase: (danMu, $xml) => {

        // 弹幕服务器，可通过判断此值，得到来源
        const chatserver = $xml.find('chatserver:first').text();

        // 弹幕ID，俗称：cid
        const chatid = $xml.find('chatid:first').text();

        const $ds = $xml.find("d");

        danMu.chatserver = chatserver;
        danMu.chatid = chatid;
        danMu.num = $ds.length;
        danMu.state = 1;
    },
    /**
     * 加载扩展
     *
     * @param  {对象} danMu       弹幕
     * @param  {$对象} $xml 弹幕内容对象
     */
    loadExtend: (danMu, $xml) => {

        const $ds = $xml.find("d");

        // 具体弹幕集
        const danMuItems = $ds.map((i, it) => {

            const $it = $(it);

            const ps = $it.attr("p").split(",");

            return new DanMuItem($it.text(),
                ps[0], ps[1], ps[2], ps[3], ps[4], ps[5], ps[6], ps[7]);
        });

        danMu.danMuItems = danMuItems;
    },
    /**
     * 状态解析
     * 0：待解析；1：待处理；2：处理中；3：处理完成；-1：处理失败
     * 
     * @param  {数字} value 状态值
     * @return {字符串}       状态文本
     */
    stateParse: (value) => {

        let text;

        if (value == ENUM_TASK_STATE.WAIT_PARSE) {

            text = "待解析";

        } else if (value == ENUM_TASK_STATE.WAIT_HANDLE) {

            text = "待处理";

        } else if (value == ENUM_TASK_STATE.HANDLEING) {

            text = "处理中";

        } else if (value == ENUM_TASK_STATE.HANDLE_SUCCESS) {

            text = "处理完成";

        } else if (value == ENUM_TASK_STATE.HANDLE_FAIL) {

            text = "处理失败";

        } else {

            throw new Error(`未知的任务状态：${value}`);
        }

        return text;
    },
    /**
     * 弹幕来源解析
     * @param  {字符串} value 弹幕服务器
     * @return {字符串}       弹幕来源
     */
    danmuFromResolve: (value) => {

        var from = "未知";

        if (value == undefined) {
            from = "-";
        } else if (value == "danmu.aixifan.com") {
            from = "acFun";
        } else if (value == "chat.bilibili.com") {
            from = "bilibili";
        } else if (value == "api.diyidan.net") {
            from = "第一弹";
        } else if (value == "cmts.iqiyi.com") {
            from = "爱奇艺";
        } else if (value == "mfm.video.qq.com") {
            from = "腾讯";
        } else if (value == "service.danmu.youku.com") {
            from = "优酷";
        } else if (value == "ani.gamer.com.tw") {
            from = "动画疯";
        }

        return from;
    }
};