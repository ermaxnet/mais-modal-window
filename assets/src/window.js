import "babel-polyfill";
import $ from "jquery";
import _ from "underscore";
import "../css/window.css";
import windowTemplate from "../templates/window.tmp";

const defaultOptions = {
    width: "auto",
    height: "auto",
    "z-index": 10000,
    center: true,
    "window-position": "fixed",
    top: 100,
    left: 100,
    right: "auto",
    bottom: "auto",
    title: "",
    footer: "",
    content: "",
    contextSelector: "[data-role=\"context\"]",
    autoLoad: false,
    onRelease: null,
    onActivate: null,
    actions: null,
    modal: false
};

let actionTemplates = {
    "close": `<li class="window_action" role="close-action" title="Закрыть"><span>x</span></li>`
};

let setActionEvent = (actionName, actionsList, module) => {
    switch(actionName) {
        case "close": {
            let closeAction = actionsList.find("[role=\"close-action\"]");
            closeAction.off("click");
            closeAction.on("click", e => {
                module.close();
            });
            break;
        }
    }
};

export const configure = (templates, handler) => {
    if(_.isObject(templates)) {
        actionTemplates = templates;
    }
    if(_.isFunction(handler)) {
        setActionEvent = handler;
    }
};

const body = $(document.body);
const _createWindow = (module) => {
    const options = module.options;
    const zindex = parseInt(options["z-index"], 10);
    
    const windowWrapper = $("<div class=\"window-wrapper\" data-role=\"wrapper\"></div>")
        .css({
            "position": "fixed",
            "width": "100%",
            "height": "100%",
            "display": "none"
        })
        .appendTo(body);

    let windowOverlay = $("<div class=\"window-overlay\"></div>")
        .css({
            "position": "fixed",
            "width": "100%",
            "height": "100%",
            "z-index": zindex
        })
        .appendTo(windowWrapper);

    const windowHTML = windowTemplate({ 
        title: options.title,
        footer: options.footer
    });
    let window = $(windowHTML)
        .css({
            "position": options["window-position"],
            "width": options.width,
            "height": options.height,
            "z-index": zindex + 100
        })
        .appendTo(windowWrapper);

    if(_.isArray(options.actions) && options.actions.length) {
        _buildActions(options.actions, window, module);
    }

    if(options.modal) {
        _createModalWindow(window);
    }

    module.wrapper = windowWrapper;
    module.window = window;
    module.state = states.WND_CREATED;
};
const _createModalWindow = (window) => {

};
const _loadContent = async (module, context) => {
    var contentAJAX = module.options.content;
    if(_.isString(contentAJAX.fileName)) {
        contentAJAX = {
            type: "GET",
            url: contentAJAX.fileName,
            dataType: contentAJAX.mimeType || "html",
            cache: contentAJAX.cache || false
        };
    } else if(!_.isBoolean(contentAJAX.cache)) { contentAJAX.cache = false };
    return new Promise((resolve, reject) => {

        $.ajax(contentAJAX)
            .done((responseHTML) => {
                context.html(responseHTML);
                resolve();
            });

    });

};
const _buildActions = (actions, window, module) => {
    var actionsContainer = window.find(".header__actions");
    if(!actionsContainer.length) {
        actionsContainer = $(`<div class="header__actions"></div>`).prependTo(window);
    }
    var actionsList = $(`<ul class="header__actions-list"></ul>`).appendTo(actionsContainer);
    actions.forEach(actionName => {
        var actionTemplate = actionTemplates[actionName];
        if(!_.isString(actionTemplate)) { return; }
        actionsList.append(actionTemplate);
        setActionEvent(actionName, actionsList, module);
    });
};

const _animateIt = (element, className, callback) => {
    element.addClass(className).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", () => {
        element.removeClass(className);
        if(typeof callback === "function") {
            callback();
        }
    });
};

export const states = {
    WND_INITIALIZE: 100,
    WND_CREATED: 200,
    WND_LOADED: 300,
    WND_HIDDEN: 400,
    WND_VISIBLE: 500
};

export default class Window {

    constructor(options) {
        this.options = _.extend(defaultOptions, options);
        this.state = states.WND_INITIALIZE;
        _createWindow(this);

        if(this.options.autoLoad) {
            this.init().then(() => {
                if(_.isFunction(this.options.onRelease)) {
                    this.options.onRelease.call(this);
                }
            });
        }
    }

    async init() {
        await this.load();
        this.position();
        this.open();
    }

    open() {
        if(this.state < states.WND_LOADED) { return; }
        this.wrapper.show();
        _animateIt(this.window, "play-open-animation", () => {
            this.state = states.WND_VISIBLE;
        });
    }

    close() {
        if(this.state < states.WND_VISIBLE) { return; }
        _animateIt(this.window, "play-close-animation", () => {
            this.wrapper.hide();
            this.state = states.WND_HIDDEN;
        });
    }

    activate() {
        if(_.isFunction(this.options.onActivate)) {
            this.options.onActivate.call(this);
        }
    }

    async refresh() {
        const state = this.state;
        this.state = states.WND_CREATED;
        await this.load();
        this.state = state;
    }

    async load() {
        if(this.state < states.WND_CREATED) { return; }
        let context = this.window.find(this.options.contextSelector).eq(0);
        if(_.isString(this.options.content)) {
            context.html(this.options.content);
        } else {
            await _loadContent(this, context);
            this.state = states.WND_LOADED;
        }
        this.activate();
        this.state = states.WND_HIDDEN;
    }

    position() {
        if(this.state < states.WND_CREATED) { return; }
        if(this.options.center) {
            this.window.css({
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%, -50%)"
            });
        } else {
            this.window.css({
                "top": this.options.top,
                "left": this.options.left,
                "right": this.options.right,
                "bottom": this.options.bottom
            });
        }
    }

};