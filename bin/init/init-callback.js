$(function() {

    var item = getScriptParameter("item");

    $(".container.center").load("bin/" + item + "/" + item + ".html", function() {
    	
        // 初始化提示层
        Common.initTooltip();
    });
});