ym.modules.define('shri2017.imageViewer.EventManager', [
], function (provide) {

    var EVENTS = {
        mousedown: 'start',
        mousemove: 'move',
        mouseup: 'end',
        touchstart: 'start',
        touchmove: 'move',
        touchend: 'end',
        touchcancel: 'end',
        wheel: 'wheel'
    };

    function EventManager(elem, callback) {
        this._elem = elem;
        this._callback = callback;
        this._setupListeners();
    }

    Object.assign(EventManager.prototype, {
        destroy: function () {
            this._teardownListeners();
        },

        _setupListeners: function () {
            this._mouseListener = this._mouseEventHandler.bind(this);
            this._wheelListener = this._wheelEventHandler.bind(this);
            this._touchListener = this._touchEventHandler.bind(this);
            this._addEventListeners('mousedown', this._elem, this._mouseListener);
            this._addEventListeners('wheel', this._elem, this._wheelListener);
            this._addEventListeners('touchstart touchmove touchend touchcancel', this._elem, this._touchListener);
        },

        _teardownListeners: function () {
            this._removeEventListeners('mousedown', this._elem, this._mouseListener);
            this._removeEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            this._removeEventListeners('touchstart touchmove touchend touchcancel', this._elem, this._touchListener);
        },

        _addEventListeners: function (types, elem, callback) {
            types.split(' ').forEach(function (type) {
                elem.addEventListener(type, callback);
            }, this);
        },

        _removeEventListeners: function (types, elem, callback) {
            types.split(' ').forEach(function (type) {
                elem.removeEventListener(type, callback);
            }, this);
        },

        _mouseEventHandler: function (event) {
            event.preventDefault();

            // Такая подписка нужна в целях оптимизации производительности
            // Например, если будет 100 элементов imageViewer, то они все будут слушать событие mousemove, в случае использования метода с флагом
            if (event.type === 'mousedown') {
                this._addEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            } else if (event.type === 'mouseup') {
                this._removeEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            }

            var elemOffset = this._calculateElementPreset(this._elem);

            this._callback({
                type: EVENTS[event.type],
                targetPoint: {
                    x: event.pageX - elemOffset.x,
                    y: event.pageY - elemOffset.y
                }
            });
        },

        _wheelEventHandler: function(event) {
            event.preventDefault();

            var delta = event.deltaY;
            var scale = delta > 0 ? +0.01 : -0.01;

            this._callback({
                type: EVENTS[event.type],
                scale: scale
            });
        },

        _touchEventHandler: function (event) {
            // Отменяем стандартное поведение (последующие события мышки)
            event.preventDefault();

            var touches = event.touches;
            // touchend/touchcancel
            if (touches.length === 0) {
                touches = event.changedTouches;
            }

            var elemOffset = this._calculateElementPreset(this._elem);

            var targetPoint = {
                x: touches[0].pageX - elemOffset.x,
                y: touches[0].pageY - elemOffset.y
            };

            this._callback({
                type: EVENTS[event.type],
                targetPoint: targetPoint
            });
        },

        _calculateElementPreset: function (elem) {
            // Получаем смещение элемента #holder относительно левого верхнего угла страницы
            var result = {
                x: 0,
                y: 0
            };
            while (elem) {
                result.x += elem.offsetLeft;
                result.y += elem.offsetTop;
                elem = elem.offsetParent;
            }

            return result;
        }
    });

    provide(EventManager);
});
