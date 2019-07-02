$(function() {
    'use strict';

    var $main_form = $("#main-form");

    var $txt_video_width = $("#txt-video-width");
    var $txt_video_height = $("#txt-video-height");

    var $slt_font = $("#slt-font");
    var $ckb_font_bold = $("#ckb-font-bold");

    var $rge_font_scale = $("#rge-font-scale");
    var $rge_font_opacity = $("#rge-font-opacity");

    var $rge_range_scale = $("#rge-range-scale");
    var $rge_roll_stay = $("#rge-roll-stay");
    var $rge_fixed_stay = $("#rge-fixed-stay");

    var $font_example = $("#font-example");

    var danMuTable = new DanMuTable("#table",
        "#file-input", "#btn-remove", "#btn-clear",
        "#btn-convert", "#modal-drag", "#main-form",
        function() {

            // 得到输出方式[0：打包；1：逐个]
            var outPutType = $('input:radio[name="outPutType"]:checked').val();

            var danMus = danMuTable.$table.bootstrapTable('getData');

            var option = new ConvertOption(
                parseInt($txt_video_width.val()),
                parseInt($txt_video_height.val()),
                $slt_font.find(':selected').text(),
                $ckb_font_bold.is(":checked"),
                $rge_font_scale.val() / 100,
                $rge_font_opacity.val() / 100,
                $rge_range_scale.val() / 100,
                parseInt($rge_roll_stay.val()),
                parseInt($rge_fixed_stay.val()),
                outPutType);

            Common.writeCookie(ENUM_COOKIE_PATH.CONVERT, option);

            var updateData = danMuTable.updateData.bind(danMuTable);
            var convertComplate = danMuTable.executeComplate.bind(danMuTable);

            DanMuConvert.convert(danMus, option, updateData, convertComplate);
        });

    /**
     * 重置字体样例
     */
    function resetFontExample() {

        var fontFamily = $slt_font.find(':selected').text();
        var fontScale = $rge_font_scale.val();
        var fontOpacity = $rge_font_opacity.val();
        var isBold = $ckb_font_bold.is(":checked") ? "bold" : "normal";

        var newFontSize = parseInt(ConvertOption.defaultFontSize * (fontScale / 100));

        $font_example.css("font-family", fontFamily);
        $font_example.css("font-size", newFontSize + "pt");
        $font_example.css("opacity", fontOpacity / 100);
        $font_example.css("font-weight", isBold);
    }

    /**
     * 绑定滑块
     * @param  {$对象}  $item   滑块控件
     * @param  {布尔}   isReset 滑动此滑块，是否重置字体样例
     */
    function bindSlide($item, isReset) {

        var $itemValue = $item.parent().find("d");

        $item.bind("input propertychange", function() {

            $itemValue.text($item.val());

            if (isReset) {
                resetFontExample();
            }
        });
    }

    $slt_font.change(function() {
        resetFontExample();
    });

    $ckb_font_bold.change(function() {
        resetFontExample();
    });

    bindSlide($rge_font_scale, true);
    bindSlide($rge_font_opacity, true);

    bindSlide($rge_range_scale, false);
    bindSlide($rge_roll_stay, false);
    bindSlide($rge_fixed_stay, false);

    $("#input").on("shown.bs.collapse", function(e) {

        danMuTable.$table.bootstrapTable('resetView');
    });


    // 初始化提示层
    Common.initTooltip();

    // 初始化字体
    for (var i = 0; i < fontDatas.length; i++) {
        var font = fontDatas[i];
        $slt_font.append('<option text="' + font + '">' + font + '</option>');
    }

    Common.cookieIfPresent(ENUM_COOKIE_PATH.CONVERT, function(cookie) {

        $txt_video_width.val(cookie.videoWidth);
        $txt_video_height.val(cookie.videoHeight);

        $slt_font.find("option[text='" + cookie.fontFamily + "']").attr("selected", true);
        $ckb_font_bold.attr("checked", cookie.bold);

        $rge_font_scale.val(cookie.fontScale * 100);
        $rge_font_opacity.val(cookie.alpha * 100);

        $rge_range_scale.val(cookie.rangeScale * 100);
        $rge_roll_stay.val(cookie.rollStayTime);
        $rge_fixed_stay.val(cookie.fixedStayTime);

        $([$rge_font_scale[0], $rge_font_opacity[0],
            $rge_range_scale[0], $rge_roll_stay[0], $rge_fixed_stay[0]
        ]).trigger("input");

        $("input:radio[name=outPutType][value=" + cookie.outputType + "]").attr("checked", true);
    });

    resetFontExample();
});