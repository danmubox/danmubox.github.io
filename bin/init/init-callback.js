$(function() {

    var item = getScriptParameter("item");

    function baiduTongJi() {
        var _hmt = _hmt || [];
        (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?42446a017c3dbeb48c424d2d7bdb3482";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        })();
    }

    $(".container.center").load("bin/" + item + "/" + item + ".html", function() {

        // 初始化提示层
        Common.initTooltip();

        if (item != "message") {
            baiduTongJi();
        }
    });
});