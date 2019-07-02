/*jshint esversion: 6 */

class DanMu {

    constructor(file) {

        this.file = file;

        const name = Common.removePostfix(file.name);

        this.name = name;
        this.length = file.size;

        this.state = 0;
    }
}

class DanMuItem {

    constructor(content,
        playTime, type, size, color, createTime, pool, uid, historyId) {

        this.content = content;

        this.playTime = parseFloat(playTime);
        this.type = parseInt(type);
        this.size = parseInt(size);
        this.color = parseInt(color);
        
        this.createTime = createTime;
        this.pool = pool;
        this.uid = uid;
        this.historyId = historyId;
    }
}