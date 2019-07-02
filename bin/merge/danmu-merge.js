/*jshint esversion: 6 */

const DanMuMerge = {
    danMuTamplate: (() => {

        const template = $("#danmu-template").html().trim();

        Mustache.parse(template);

        return template;
    })(),
    /**
     * 合并
     * 
     * @param {数组} danMus 弹幕数组
     * @param {对象} option 参数
     * @param {方法} convertComplate 合并完毕回调
     */
    merge: (danMus, updateData, mergeComplate) => {

        // 冗余合并后的cid
        const chatids = danMus.map((it, i) => it.chatid).join(",");

        const danMu = danMus[0];

        const mergeDanMu = new DanMu(danMu.file);
        mergeDanMu.chatserver = danMu.chatserver;
        mergeDanMu.chatid = danMu.chatid;
        mergeDanMu.chatids = chatids;
        mergeDanMu.danMuItems = [];

        DanMuMerge.doMerge(mergeDanMu, danMus, updateData, mergeComplate, 0, 0, 0);
    },
    doMerge: (mergeDanMu, danMus, updateData, mergeComplate, index, number, max) =>
        DanMuResolver.read(danMus[index], (danMu, $xml) =>
            DanMuMerge.readComplate(mergeDanMu, danMus, updateData, mergeComplate, index, number, danMu, $xml, max)),
    readComplate: (mergeDanMu, danMus, updateData, mergeComplate, index, number, danMu, $xml, max) => {

        // 处理中
        danMu.state = ENUM_TASK_STATE.HANDLEING;
        updateData(danMu);

        try {

            max = DanMuMerge.execMerge(mergeDanMu, danMu, $xml, max);

        } catch (e) {

            console.log(e);

            toastr.error(`${danMu.name}，文件处理失败！`);

            mergeComplate();

            return;
        }

        // 转换成功
        danMu.state = ENUM_TASK_STATE.HANDLE_SUCCESS;
        updateData(danMu);

        number++;

        // 全部转换完成
        if (number == danMus.length) {

            const danMuContent = DanMuMerge.bornDanMu(mergeDanMu);

            const blob = new Blob([danMuContent], { type: "text/plain;charset=utf-8" });

            const ts = Math.round(new Date().getTime() / 1000).toString();

            saveAs(blob, `合并-${ts}.xml`);

            mergeComplate();

        } else {

            DanMuMerge.doMerge(mergeDanMu, danMus, updateData, mergeComplate, index + 1, number, max);
        }
    },
    execMerge: (mergeDanMu, danMu, $xml, max) => {

        DanMuResolver.loadExtend(danMu, $xml);

        danMu.danMuItems.each((i, it) => it.playTime += max);

        mergeDanMu.danMuItems = mergeDanMu.danMuItems.concat($.makeArray(danMu.danMuItems));

        const playTimes = danMu.danMuItems.map((i, it) => it.playTime);

        return Math.max.apply(null, playTimes);
    },
    bornDanMu: (mergeDanMu) => Mustache.render(DanMuMerge.danMuTamplate, mergeDanMu)
};