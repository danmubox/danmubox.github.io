$(function() {

    var item = getScriptParameter("item");

    $(".container.center").load("bin/" + item + "/" + item + ".html");
});