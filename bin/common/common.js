var ENUM_COOKIE_PATH = {
    // download_copy
    SEARCH: "SEARCH",
    // 
    CONVERT: "CONVERT"
};

var Common = {
    /**
     * 解密
     * @param  {字符串} content 内容
     * @param  {字符串} key     密钥
     * @return {字符串}         解密后的内容
     */
    decrypt: function(content, key) {
        var bytes = CryptoJS.AES.decrypt(content, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });

        return CryptoJS.enc.Utf8.stringify(bytes).toString();
    },
    /**
     * 下载文件
     * @param  {字符串} url  地址
     */
    downloadFile: function(url) {
        var $downloadForm = $("<form method='get'></form>");

        $downloadForm.attr("action", url);

        $(document.body).append($downloadForm);

        //提交表单，实现下载
        $downloadForm.submit();

        // 提交后，移除
        $downloadForm.remove();
    },
    /**
     * 计算文件大小
     * @param  {数字} value 文件长度
     * @return {字符串}       含有合适单位的魏就大小
     */
    renderSize: function(value) {
        if (null == value || value == '') {
            return "0 Bytes";
        }
        var unitArr = new Array("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
        var index = 0;
        var srcsize = parseFloat(value);
        index = Math.floor(Math.log(srcsize) / Math.log(1024));
        var size = srcsize / Math.pow(1024, index);
        size = size.toFixed(2); //保留的小数位数
        return size + unitArr[index];
    },
    /**
     * 移除后缀
     * @param  {字符串} value 文件名（有后缀）
     * @return {字符串}       文件名（无后缀）
     */
    removePostfix: function(value) {
        var index = value.lastIndexOf(".");

        if (index > 0) {
            value = value.substring(0, index);
        }

        return value;
    },
    /**
     * 拷贝内容至剪贴板
     * @param  {字符串容} text  内容
     * @param  {对象} event 事件
     */
    clipboard: function(text, event) {
        var cb = new ClipboardJS('.t', {
            text: function() { return text; }
        });
        cb.onClick(event);
        cb.destroy();
    },
    /**
     * 修复表格高度
     * 
     * @param  {jq对象} $table 表格
     */
    fixTableHeight: function($table) {

        var $table_container = $table.parents(".fixed-table-container");

        $table.on('post-header.bs.table page-change.bs.table reset-view.bs.table', function() {

            $table_container.height($table.height() - 35);
        });
    },
    /**
     * 初始化Bootstrap提示层
     */
    initTooltip: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },
    /**
     * 读取cookie
     * 
     * @param  {字符串} path  路径
     * @return {对象}         json对象
     */
    readCookie: function(path) {
        return $.cookie(path);
    },
    /**
     * 写入cookie
     * 
     * @param  {字符串} path  路径
     * @param  {对象  } obj   对象
     */
    writeCookie: function(path, obj) {
        $.cookie(path, obj, { expires: 9999 });
    },
    /**
     * 处理cookie，如果存在
     * @param  {字符串} path  路径
     * @param  {方法} handle 存在时调用
     */
    cookieIfPresent: function(path, handle) {

        var cookie = Common.readCookie(path);

        if (cookie) {
            handle(cookie);
        }
    }
};

$(function() {

    // 开启json化对象储存
    $.cookie.json = true;

    // 默认显示关闭按钮
    toastr.options.closeButton = true;
});