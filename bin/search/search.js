$(function() {
    'use strict';

    // 文本框
    var $txt_keyword = $("#txt-keyword");

    var $table = $('#table');
    var $ckb_copy = $("#ckb-copy");

    var key;
    var list; // 数组
    var repoMap = new Map(); //<仓库字符串,array<array<3>>>
    var fromEnums = ["bilibili", "优酷", "爱奇艺", "腾讯", "第一弹", "动画疯", "acfun"];

    Common.cookieIfPresent(ENUM_COOKIE_PATH.SEARCH, function(cookie) {
        $ckb_copy.attr("checked", cookie.download_copy);
    });

    $ckb_copy.change(function() {

        var isChecked = $(this).is(':checked');

        Common.writeCookie(ENUM_COOKIE_PATH.SEARCH, { download_copy: isChecked });
    });

    $("#btn-search").click(function() {

        $table.bootstrapTable('removeAll');

        var keyword = $txt_keyword.val().trim();

        if (keyword.length > 0) {

            $table.bootstrapTable('showLoading');

            search1(keyword.toLowerCase());
        }
    });

    // 尝试获取key
    function search1(keyword) {

        if (key) {

            search2(keyword);

        } else {

            $.get('data/key', function(data) {

                key = CryptoJS.enc.Utf8.parse(data);

                search2(keyword);
            });
        }
    }

    // 尝试获取list
    function search2(keyword) {

        if (list) {

            search3(keyword);

        } else {

            $.get('data/list', function(data) {

                list = Common.decrypt(data, key).split(",");

                search3(keyword);
            });
        }
    }

    function search3(keyword) {

        var end = list.length;
        var num = 0;

        list.forEach(function(repo) {

            // 映射中存在
            if (repoMap.has(repo)) {

                var repoData = repoMap.get(repo);

                doSearch(keyword, repo, repoData);

                doComplate(++num, end);

            } else {

                $.ajax({
                        url: 'https://raw.githubusercontent.com/' + repo + '/master/index'
                    })
                    .done(function(data) {

                        var index = Common.decrypt(data, key);

                        var repoData = index.split(";").map(function(it, i) {
                            return it.split(",");
                        });

                        repoMap.set(repo, repoData);

                        doSearch(keyword, repo, repoData);
                    })
                    .fail(function(e) {

                        toastr.error('请求弹幕仓库：' + repo + ' 时，发生错误！');

                        console.error(e);
                    })
                    .always(function() {

                        doComplate(++num, end);
                    });
            }
        });
    }

    function doComplate(num, total) {

        if (num == total) {
            $table.bootstrapTable('hideLoading');
        }
    }

    function doSearch(keyword, repo, repoData) {

        var rows = [];

        for (var i = repoData.length - 1; i >= 0; i--) {

            var cur = repoData[i];

            // 将其转换为小写再进行比较
            if (cur[0].toLowerCase().indexOf(keyword) > -1) {

                // 原始下载地址
                var url = "https://raw.githubusercontent.com/" + repo + "/master/" + cur[3] + ".7z";

                rows.push({
                    name: cur[0],
                    from: fromEnums[cur[2]],
                    length: cur[1],
                    operate: '<div class="btn-group"><button class="btn btn-success download">下载</button><button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"><span class="caret"></span></button><div class="dropdown-menu"><button class="dropdown-item btn download xl-download">迅雷下载</button></div></div>',
                    url: url
                });
            }
        }

        // 从此仓库中找到匹配的内容
        if (rows.length > 0) {
            $table.bootstrapTable('append', rows);
            $table.bootstrapTable('hideLoading');
        }
    }

    Common.fixTableHeight($table);
});

window.operateEvents = {
    'click .download': function(e, value, row, index) {

        // 是否需要拷贝名称
        if ($("#ckb-copy").is(':checked')) {
            Common.clipboard(row.name, e);
        }

        // 当前触发按钮
        var $target = $(e.target);

        var url = row.url;

        // 是否为迅雷下载
        if ($target.hasClass('xl-download')) {

            // 迅雷下载地址
            url = "thunder://" + btoa("AA" + url + "ZZ");
        }

        Common.downloadFile(url);
    }
};