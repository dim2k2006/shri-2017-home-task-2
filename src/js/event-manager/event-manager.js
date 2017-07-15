ym.modules.define('shri2017.imageViewer.EventManager', [
], function (provide) {

    var EVENTS = {
        mousedown: 'start',
        mousemove: 'move',
        mouseup: 'end',
        pointerdown: 'start',
        pointermove: 'move',
        pointerup: 'end',
        pointercancel: 'end',
        touchstart: 'start',
        touchmove: 'move',
        touchend: 'end',
        touchcancel: 'end',
        wheel: 'wheel'
    };

    var EVENTMAP = {
        touchstart: 'mousedown',
        touchmove: 'mousemove',
        touchend: 'mouseup',
        touchcancel: 'mouseup',
        pointerdown: 'mousedown',
        pointermove: 'mousemove',
        pointerup: 'mouseup',
        pointercancel: 'mouseup'
    };

    var eventCache = [];

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
            this._pointerListener = this._pointerEventHandler.bind(this);
            this._touchListener = this._touchEventHandler.bind(this);
            this._wheelListener = this._wheelEventHandler.bind(this);
            this._addEventListeners('mousedown', this._elem, this._mouseListener);
            this._addEventListeners('pointerdown', this._elem, this._pointerListener);
            this._addEventListeners('touchstart touchmove touchend touchcancel', this._elem, this._touchListener);
            this._addEventListeners('wheel', this._elem, this._wheelListener);
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

            console.log('mouse');

            // Такая подписка нужна в целях оптимизации производительности
            // Например, если будет 100 элементов imageViewer, то они все будут слушать событие mousemove, в случае использования метода с флагом
            if (event.type === 'mousedown') {
                this._addEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            } else if (event.type === 'mouseup') {
                this._removeEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            }

            var elemOffset = this._calculateElementOffset(this._elem);
            var targetPoint = event.targetPoint || {x: event.clientX - elemOffset.x, y: event.clientY - elemOffset.y};
            var distance = event.distance || 1;
            var isTouch = event.isTouch || false;

            this._callback({
                type: EVENTS[event.type],
                targetPoint: targetPoint,
                distance: distance,
                isTouch: isTouch
            });
        },

        _pointerEventHandler: function(event) {
            // TODO touch-action css ?
            // TODO test on real device

            console.log('pointer');

            // Добавим событие в коллекцию и добавим обработку событий pointermove pointerup pointercancel
            if (event.type === 'pointerdown') {

                // console.group('event type:', event.type);
                // console.log('eventCache length: ', eventCache.length);
                // console.groupEnd();

                this._pushEvent(event);
                this._addEventListeners('pointermove pointerup pointercancel', document.documentElement, this._pointerListener);

            // Обновим коллекцию
            } else if (event.type === 'pointermove') {

                // console.group('event type:',event.type);
                // console.log('eventCache length: ', eventCache.length);
                // console.groupEnd();

                this._updateEvent(event);

            }

            var targetPoint;
            var distance = 1;
            var screenX = 0;
            var screenY = 0;
            var clientX = 0;
            var clientY = 0;
            var elemOffset = this._calculateElementOffset(this._elem);

            if (eventCache.length === 1) {

                targetPoint = {
                    x: eventCache[0].clientX,
                    y: eventCache[0].clientY
                };

                screenX = eventCache[0].screenX;
                screenY = eventCache[0].screenY;

                clientX = eventCache[0].clientX;
                clientY = eventCache[0].clientY;

            } else {

                var firstTouch = eventCache[0];
                var secondTouch = eventCache[1];
                targetPoint = this._calculateTargetPoint(firstTouch, secondTouch);
                distance = this._calculateDistance(firstTouch, secondTouch);

            }

            targetPoint.x -= elemOffset.x;
            targetPoint.y -= elemOffset.y;

            var simulatedEvent = document.createEvent('MouseEvents');
            var simulatedType = EVENTMAP[event.type];

            simulatedEvent.initMouseEvent(
                simulatedType,    // type
                true,             // bubbles
                true,             // cancelable
                window,           // view
                1,                // detail
                screenX,          // screenX
                screenY,          // screenY
                clientX,          // clientX
                clientY,          // clientY
                false,            // ctrlKey
                false,            // altKey
                false,            // shiftKey
                false,            // metaKey
                0,                // button
                null              // relatedTarget,
            );

            simulatedEvent.targetPoint = targetPoint; // custom property targetPoint
            simulatedEvent.distance = distance;       // custom property distance
            simulatedEvent.isTouch = event.pointerType === 'touch';        // custom property distance

            this._elem.dispatchEvent(simulatedEvent);

            // Удалим событие из коллекции удалим подписку на события pointermove pointerup pointercancel
            if (event.type === 'pointerup' || event.type === 'pointercancel') {

                // console.group('event type:',event.type);
                // console.log('eventCache length: ', eventCache.length);
                // console.groupEnd();

                this._removeEvent(event);
                this._removeEventListeners('pointermove pointerup pointercancel', document.documentElement, this._pointerListener);

            }
        },

        _touchEventHandler: function (event) {
            console.log('touch');

            event.preventDefault();

            var touches = event.touches;

            // touchend/touchcancel
            if (touches.length === 0) {
                touches = event.changedTouches;
            }

            var targetPoint;
            var distance = 1;
            var screenX = 0;
            var screenY = 0;
            var clientX = 0;
            var clientY = 0;
            var elemOffset = this._calculateElementOffset(this._elem);

            if (touches.length === 1) {

                targetPoint = {
                    x: touches[0].clientX,
                    y: touches[0].clientY
                };

                screenX = touches[0].screenX;
                screenY = touches[0].screenY;

                clientX = touches[0].clientX;
                clientY = touches[0].clientY;

            } else {

                var firstTouch = touches[0];
                var secondTouch = touches[1];
                targetPoint = this._calculateTargetPoint(firstTouch, secondTouch);
                distance = this._calculateDistance(firstTouch, secondTouch);

            }

            targetPoint.x -= elemOffset.x;
            targetPoint.y -= elemOffset.y;

            var simulatedEvent = document.createEvent('MouseEvents');
            var simulatedType = EVENTMAP[event.type];

            simulatedEvent.initMouseEvent(
                simulatedType,    // type
                true,             // bubbles
                true,             // cancelable
                window,           // view
                1,                // detail
                screenX,          // screenX
                screenY,          // screenY
                clientX,          // clientX
                clientY,          // clientY
                false,            // ctrlKey
                false,            // altKey
                false,            // shiftKey
                false,            // metaKey
                0,                // button
                null              // relatedTarget,
            );

            simulatedEvent.targetPoint = targetPoint; // custom property targetPoint
            simulatedEvent.distance = distance;       // custom property distance
            simulatedEvent.isTouch = true;            // custom property isTouch

            this._elem.dispatchEvent(simulatedEvent);
        },

        _wheelEventHandler: function(event) {
            event.preventDefault();

            var elemOffset = this._calculateElementOffset(this._elem);

            this._callback({
                type: EVENTS[event.type],
                targetPoint: {
                    x: event.clientX - elemOffset.x,
                    y: event.clientY - elemOffset.y
                },
                scaleDirection: event.deltaY
            });
        },

        _calculateTargetPoint: function (firstTouch, secondTouch) {
            return {
                x: (secondTouch.clientX + firstTouch.clientX) / 2,
                y: (secondTouch.clientY + firstTouch.clientY) / 2
            };
        },

        _calculateDistance: function (firstTouch, secondTouch) {
            return Math.sqrt(
                Math.pow(secondTouch.clientX - firstTouch.clientX, 2) +
                Math.pow(secondTouch.clientY - firstTouch.clientY, 2)
            );
        },

        _calculateElementOffset: function (elem) {
            var bounds = elem.getBoundingClientRect();
            return {
                x: bounds.left,
                y: bounds.top
            };
        },

        _pushEvent: function (event) {
            // console.group('push pointer to eventCache list');
            // console.log('pointerId: ', event.pointerId);
            // console.groupEnd();

            eventCache.push(event);
        },

        _removeEvent: function(event) {
            // console.group('remove pointer from eventCache list');
            // console.log('pointerId: ', event.pointerId);
            // console.groupEnd();

            for (var i = 0; i < eventCache.length; i++) {

                if (eventCache[i].pointerId === event.pointerId) {

                    eventCache.splice(i, 1);

                    // console.group('eventCache');
                    // console.log(eventCache);
                    // console.groupEnd();

                    break;

                }

            }
        },

        _updateEvent: function(event) {
            eventCache = eventCache.map(function(eventCacheItem) {
                if (eventCacheItem.pointerId = event.pointerId) {

                    eventCacheItem = event;

                }

                return eventCacheItem;
            });
        }
    });

    provide(EventManager);
});