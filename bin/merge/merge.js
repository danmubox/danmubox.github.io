$(function() {
    'use strict';

    var danMuTable = new DanMuTable("#table",
        "#file-input", "#btn-remove", "#btn-clear",
        "#btn-merge", "#modal-drag", "#main-form",
        function() {

            // 得到弹幕数组
            var danMus = danMuTable.$table.bootstrapTable('getData');

            if (danMus.length < 2) {

                toastr.warning("合并弹幕文件数量少于2个");

                danMuTable.executeComplate();

                return;
            }

            var updateData = danMuTable.updateData.bind(danMuTable);
            var mergeComplate = danMuTable.executeComplate.bind(danMuTable);

            DanMuMerge.merge(danMus, updateData, mergeComplate);
        });
});