$(function() {
    'use strict';

    new WOW().init();

    var hoverClass = "border-info";
    var hoverInColor = "#2599db";
    var hoverOutColor = "#25c0db";

    $(".card-menu").hover(function() {

        var $this = $(this);

        $this.addClass(hoverClass);
        $this.find("svg path").attr("fill", hoverInColor);

    }, function() {

        var $this = $(this);

        $this.removeClass(hoverClass);
        $this.find("svg path").attr("fill", hoverOutColor);
    });
});