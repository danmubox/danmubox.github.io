/*jshint esversion: 6 */

class Script {

    constructor(title, chatServer, chatId, playResX, playResY) {
        this.title = title;
        this.chatServer = chatServer;
        this.chatId = chatId;
        this.playResX = playResX;
        this.playResY = playResY;
    }
}

class Style {

    constructor(fontName, fontSize, fontColor, alpha, bold) {

        this.name = "DanMu";

        this.fontName = fontName;
        this.fontSize = fontSize;
        this.fontColor = fontColor;
        this.alpha = alpha;
        this.bold = bold;
    }
}

class Effect {

    // property fontSize
    // property fontColor
}

class PosEffect extends Effect {

    constructor(x, y) {

        super();

        this.value = `pos(${x},${y})`;
    }
}

class MoveEffect extends Effect {

    constructor(startX, startY, endX, endY) {

        super();

        this.value = `move(${startX},${startY},${endX},${endY})`;
    }
}

class Event {

    constructor(layer, start, end, effect, text) {

        this.layer = layer;
        this.start = start;
        this.end = end;
        this.effect = effect;
        this.text = text;
    }
}

class Ass {

    constructor(script, style, events) {

        this.script = script;
        this.style = style;
        this.events = events;
    }
}