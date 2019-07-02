/*jshint esversion: 6 */

class ConvertOption {

    /**
     * 默认字体大小
     */
    static get defaultFontSize() { return 25; }

    /**
     * 默认颜色
     */
    static get defaultColor() { return 16777215; }

    /**
     * 构造函数
     * 
     * @param  {整型}   videoWidth    视频宽度
     * @param  {整型}   videoHeight   视频高度
     * @param  {字符串} fontFamily    字体
     * @param  {布尔}   bold          是否加粗
     * @param  {精度值} fontScale     文字缩放
     * @param  {精度值} alpha         透明度
     * @param  {精度值} rangeScale    字幕范围
     * @param  {整型}   rollStayTime  滚动停留时间
     * @param  {整型}   fixedStayTime 顶底停留时间
     * @param  {整型}   outputType    输出方式[0：打包；1：逐个]
     */
    constructor(videoWidth, videoHeight,
        fontFamily, bold, fontScale, alpha,
        rangeScale, rollStayTime, fixedStayTime,
        outputType) {

        this.videoWidth = videoWidth;
        this.videoHeight = videoHeight;

        this.fontFamily = fontFamily;
        this.bold = bold;

        this.fontScale = fontScale;
        this.alpha = alpha;

        this.rangeScale = rangeScale;
        this.rollStayTime = rollStayTime;
        this.fixedStayTime = fixedStayTime;

        this.outputType = outputType;
    }
}

class DanMuItemGroup {

    constructor(maxCount) {

        this.rolls = new Array(maxCount);
        this.tops = new Array(maxCount);
        this.bottoms = new Array(maxCount);
    }
}

const ENUM_EFFECT_TYPE = {
    ROLL: 0,
    TOP: 1,
    BOTTOM: 2
};

const ENUM_OUTPUT_TYPE = {
    PACKAGE: 0,
    EACH: 1
};

/**
 * 弹幕转换器
 */
const DanMuConvert = {
    assTamplate: (() => {

        const template = $("#ass-template").html().trim();

        Mustache.parse(template);

        return template;
    })(),
    /**
     * 转换
     * 
     * @param {数组} danMus 弹幕数组
     * @param {对象} option 参数
     * @param {方法} updateData 数据更新回调
     * @param {方法} convertComplate 转换完毕回调
     * 
     */
    convert: (danMus, option, updateData, convertComplate) => {

        // 输出方式为打包，并且 队列数大于1
        if (option.outputType == ENUM_OUTPUT_TYPE.PACKAGE && danMus.length > 1) {

            option.zip = new JSZip();
        }

        DanMuConvert.doConvert(danMus, option, 0, 0, updateData, convertComplate);
    },
    /**
     * 去转换
     * 
     * @param {数组} danMus 弹幕数组
     * @param {对象} option 参数
     * @param {整数} index  下标
     * @param {整数} number 已完成
     * @param {方法} updateData 数据更新回调
     * @param {方法} convertComplate 转换完毕回调
     * 
     */
    doConvert: (danMus, option, index, number, updateData, convertComplate) =>
        DanMuResolver.read(danMus[index],
            (danMu, $xml) => DanMuConvert.readComplate(danMus, option, index, number, updateData, convertComplate, danMu, $xml)),
    /**
     * 读取完毕
     *
     * @param  {数组} danMus 弹幕数组
     * @param  {对象} option 参数
     * @param  {整数} index  下标
     * @param  {整数} number 已完成
     * @param  {方法} updateData 数据更新回调
     * @param  {方法} convertComplate 转换完毕回调
     * 
     * @param  {对象}  danMu  弹幕
     * @param  {$对象} $xml   弹幕内容对象
     */
    readComplate: (danMus, option, index, number, updateData, convertComplate, danMu, $xml) => {

        // 处理中
        danMu.state = ENUM_TASK_STATE.HANDLEING;
        updateData(danMu);

        let state = ENUM_TASK_STATE.HANDLE_SUCCESS;

        try {

            DanMuConvert.execConvert(option, danMu, $xml);

        } catch (e) {

            state = ENUM_TASK_STATE.HANDLE_FAIL;

            console.error(e);

            toastr.error(`${danMu.name}，转换失败！`);
        }

        // 转换成功 || 转换失败
        danMu.state = state;
        updateData(danMu);

        number++;

        // 全部转换完成
        if (number == danMus.length) {

            // 打包
            if (option.zip) {

                toastr.info("正在打包，请稍后...");

                option.zip.generateAsync({ type: "blob" }).then((content) => {

                    toastr.success("打包完成，即将开始下载！");

                    const ts = Math.round(new Date().getTime() / 1000).toString();

                    saveAs(content, `ASS包-${ts}.zip`);

                    convertComplate();
                });

            } else {

                convertComplate();
            }

        } else {

            DanMuConvert.doConvert(danMus, option, index + 1, number, updateData, convertComplate);
        }
    },
    /**
     * 执行转换
     *
     * @param  {对象} option 参数
     * 
     * @param  {对象}  danMu  弹幕
     * @param  {$对象} $xml   弹幕内容对象
     */
    execConvert: (option, danMu, $xml) => {

        DanMuResolver.loadExtend(danMu, $xml);

        const script = new Script(danMu.name, danMu.chatserver, danMu.chatid,
            option.videoWidth, option.videoHeight);

        const alpha = parseInt(255 * (1 - option.alpha)).toString(16);

        const style = new Style(option.fontFamily,
            ConvertOption.defaultFontSize, DanMuConvert.rgb10ToBgr16(ConvertOption.defaultColor),
            alpha, option.bold);

        // 屏幕最大显示行数
        const maxCount = parseInt(option.videoHeight / style.fontSize * option.rangeScale);

        const danMuItems = danMu.danMuItems;

        const group = new DanMuItemGroup(maxCount);
        const events = [];

        // 排序
        danMuItems.sort((a, b) => a.playTime - b.playTime);

        for (let i = 0; i < danMuItems.length; i++) {

            const danMuItem = danMuItems[i];

            DanMuConvert.addIfPass(danMuItem, events, group, option, style);
        }

        const ass = new Ass(script, style, events);

        const assContent = DanMuConvert.bornAss(ass);

        // 打包
        if (option.zip) {

            option.zip.file(`${danMu.name}.ass`, assContent);

        } else { // 直接下载

            const blob = new Blob([assContent], { type: "text/plain;charset=utf-8" });

            saveAs(blob, `${danMu.name}.ass`);
        }
    },
    /**
     * 生成ASS字符串
     * @return {字符串} ass
     */
    bornAss: (ass) => Mustache.render(DanMuConvert.assTamplate, ass),
    /**
     * 合适则添加
     */
    addIfPass: (danMuItem, events, group, option, style) => {

        const fontSize = danMuItem.size * option.fontScale;

        const effectType = DanMuConvert.getEffectType(danMuItem);

        if (effectType == ENUM_EFFECT_TYPE.TOP) {

            DanMuConvert.addPosIfPass(group.tops, events, style, option, danMuItem, fontSize, effectType);

        } else if (effectType == ENUM_EFFECT_TYPE.BOTTOM) {

            DanMuConvert.addPosIfPass(group.bottoms, events, style, option, danMuItem, fontSize, effectType);

        } else {

            DanMuConvert.addMoveIfPass(group.rolls, events, style, option, danMuItem, fontSize);
        }
    },
    addPosIfPass: (items, events, style, option, danMuItem, fontSize, type) => {

        for (let i = 0; i < items.length; i++) {

            const curDanMuItem = items[i];

            if (curDanMuItem == null) { // 弹幕未被填满

                DanMuConvert.addPosEvent(items, events,
                    style, i,
                    option, danMuItem, fontSize,
                    type);

                break;

            } else { // 弹幕已填满

                const curStart = curDanMuItem.playTime;

                // 传入的开始时间>当前的开始时间+停留时间
                if (danMuItem.playTime - curStart >= option.fixedStayTime) {

                    DanMuConvert.addPosEvent(items, events,
                        style, i,
                        option, danMuItem, fontSize,
                        type);

                    break;
                }
            }
        }
    },
    /**
     * 添加一个固定位置的Event
     */
    addPosEvent: (items, events, style, index, option, danMuItem, fontSize, type) => {

        items[index] = danMuItem;

        const x = option.videoWidth / 2;

        let y;

        if (type == ENUM_EFFECT_TYPE.TOP) {

            y = index * fontSize;

        } else {

            y = option.videoHeight - (index - 1) * fontSize;
        }

        const effect = new PosEffect(x, y);

        DanMuConvert.handleEffect(effect, style, fontSize, danMuItem.color);

        events.push(new Event(
            0,
            DanMuConvert.second2Date24H(danMuItem.playTime),
            DanMuConvert.second2Date24H(danMuItem.playTime + option.fixedStayTime),
            effect,
            danMuItem.content
        ));
    },
    addMoveIfPass: (items, events, style, option, danMuItem, fontSize) => {

        for (let i = 0; i < items.length; i++) {

            const curDanMuItem = items[i];

            // 滚动弹幕集未被填满时
            if (!curDanMuItem) {

                DanMuConvert.addMoveEvent(items, events,
                    style, i,
                    option, danMuItem, fontSize);
                break;

            } else { // 滚动弹幕集已被填满

                const curStart = curDanMuItem.playTime;

                // 当前弹幕字体尺寸
                const curFontSize = curDanMuItem.size * option.fontScale;

                // 当前弹幕长度
                const curDanMuLength = curDanMuItem.content.length * curFontSize;

                // 当前弹幕首次完全显示在屏幕的时间
                const timeFullShow = curStart + option.rollStayTime * curDanMuLength / (option.videoWidth + curDanMuLength);

                // 当前弹幕完全消失在屏幕的时间
                const timeFullHide = curStart + option.rollStayTime;

                // 传入弹幕的长度
                const danMuLength = danMuItem.content.length * fontSize;

                // 传入弹幕最后一刻完全显示在屏幕的时间
                const time3 = danMuItem.playTime + option.rollStayTime * option.videoWidth / (option.videoWidth + danMuLength);

                if (danMuItem.playTime >= timeFullShow && time3 >= timeFullHide) {

                    DanMuConvert.addMoveEvent(items, events,
                        style, i,
                        option, danMuItem, fontSize);
                    break;
                }

            }
        }
    },
    /**
     * 添加一个移动的Event
     */
    addMoveEvent: (items, events, style, index, option, danMuItem, fontSize) => {

        items[index] = danMuItem;

        const layoutY = fontSize * index;
        const startX = option.videoWidth + danMuItem.content.length * fontSize / 2;
        const endX = 0 - danMuItem.content.length * fontSize / 2;

        const effect = new MoveEffect(startX, layoutY, endX, layoutY);

        DanMuConvert.handleEffect(effect, style, fontSize, danMuItem.color);

        events.push(new Event(
            0,
            DanMuConvert.second2Date24H(danMuItem.playTime),
            DanMuConvert.second2Date24H(danMuItem.playTime + option.rollStayTime),
            effect,
            danMuItem.content
        ));
    },
    /**
     * 得到字幕效果类型
     */
    getEffectType: (danMuItem) => {

        let effectType = ENUM_EFFECT_TYPE.ROLL;

        if (danMuItem.type == 4) {
            effectType = ENUM_EFFECT_TYPE.BOTTOM;
        } else if (danMuItem.type == 5) {
            effectType = ENUM_EFFECT_TYPE.TOP;
        }

        return effectType;
    },
    /**
     * 处理效果
     *
     * @param fontColor10 字体颜色，10进制
     */
    handleEffect: (effect, style, fontSize, fontColor10) => {

        // 当前弹幕的字体大小，与style一致，则为null，不一致则指定
        if (fontSize != style.fontSize) {
            effect.fontSize = fontSize;
        }

        const fontColor = DanMuConvert.rgb10ToBgr16(fontColor10);

        // 当前弹幕的字体颜色，与style一致，则为null，不一致则指定
        if (fontColor != style.fontColor) {
            effect.fontColor = fontColor;
        }
    },
    /**
     * 颜色转换
     * 十进制的RGB -> 16进制的BGR
     */
    rgb10ToBgr16: (value) => {

        const fontColor16 = parseInt(value).toString(16);

        // 一种意料之外的颜色，使用白色替换
        if (fontColor16.length != 6) return "ffffff";

        const fontColor16s = fontColor16.split('');

        const r = fontColor16s[0] + fontColor16s[1];
        const g = fontColor16s[2] + fontColor16s[3];
        const b = fontColor16s[4] + fontColor16s[5];

        return `${b}${g}${r}`;
    },
    /**
     * 秒数转24H制展示
     * 02:11:23.12
     */
    second2Date24H: (second) => {

        let hh = parseInt(second / 3600);
        if (hh < 10) hh = "0" + hh;

        let mm = parseInt((second - hh * 3600) / 60);
        if (mm < 10) mm = "0" + mm;


        let ss = parseInt((second - hh * 3600) % 60);
        if (ss < 10) ss = "0" + ss;

        let dot = parseInt((second - parseInt(second)) * 100);
        if (dot == 0) dot = "00";

        return `${hh}:${mm}:${ss}.${dot}`;
    }
};