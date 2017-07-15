ym.modules.define('shri2017.imageViewer.GestureController', [
    'shri2017.imageViewer.EventManager'
], function (provide, EventManager) {

    var OPTIONS = {
        DBL_TAB_STEP: 0.2,
        SCALE_MAX: 2.5,
        SCALE_MIN: 0.04,
        SCALE_STEP: 0.01
    };

    var Controller = function (view) {
        this._view = view;
        this._eventManager = new EventManager(
            this._view.getElement(),
            this._eventHandler.bind(this)
        );
        this._lastEventTypes = '';
        this._oneTouchZoomInAction = false;
        this._prevY = 0;
        this._initialTargetpoint = false;
    };

    Object.assign(Controller.prototype, {
        destroy: function () {
            this._eventManager.destroy();
        },

        _eventHandler: function (event) {
            var state = this._view.getState();

            // dblclick
            if (!this._lastEventTypes) {
                setTimeout(function () {
                    this._lastEventTypes = '';
                }.bind(this), 500);
            }
            this._lastEventTypes += ' ' + event.type;

            if (this._lastEventTypes.indexOf('start end start end') > -1) {
                this._lastEventTypes = '';
                this._processDbltab(event);
                return;
            }

            // OneTouchZoom
            if (this._lastEventTypes.indexOf('end') > -1) {

                if (this._oneTouchZoomInAction) {

                    this._oneTouchZoomInAction = false;

                }

                if (this._initialTargetpoint) {

                    this._initialTargetpoint = false;

                }

            }

            if (this._lastEventTypes.indexOf('start end start move') > -1 && event.isTouch || this._oneTouchZoomInAction && event.isTouch) {

                this._lastEventTypes = '';
                this._initialTargetpoint = this._initialTargetpoint ? this._initialTargetpoint : event.targetPoint;
                this._processOneTouchZoom(event);
                return;

            }

            // multi touch & drag
            if (event.type === 'move') {
                if (event.distance > 1 && event.distance !== this._initEvent.distance) {
                    this._processMultitouch(event);
                } else {
                    this._processDrag(event);
                }
            } else {
                this._initState = this._view.getState();
                this._initEvent = event;
            }

            // wheel
            if (event.type === 'wheel') {
                this._processWheel(event);
            }
        },

        _processDrag: function (event) {
            console.log('drag');

            this._view.setState({
                positionX: this._initState.positionX + (event.targetPoint.x - this._initEvent.targetPoint.x),
                positionY: this._initState.positionY + (event.targetPoint.y - this._initEvent.targetPoint.y)
            });
        },

        _processWheel: function(event) {
            console.log('wheel');

            var state = this._view.getState();

            state.scale += event.scaleDirection > 0 ? OPTIONS.SCALE_STEP : OPTIONS.SCALE_STEP * (-1);

            this._scale(
                event.targetPoint,
                state.scale
            );
        },

        _processMultitouch: function (event) {
            console.log('multi touch');

            this._scale(
                event.targetPoint,
                this._initState.scale * (event.distance / this._initEvent.distance)
            );
        },

        _processDbltab: function (event) {
            console.log('double tab');

            var state = this._view.getState();
            this._scale(
                event.targetPoint,
                state.scale + OPTIONS.DBL_TAB_STEP
            );
        },

        _processOneTouchZoom: function(event) {
            console.log('one touch zoom');

            if (!this._oneTouchZoomInAction) {this._oneTouchZoomInAction = true;}

            var state = this._view.getState();
            var step = 0;

            if (event.targetPoint.y > this._prevY) {

                step = OPTIONS.SCALE_STEP;

            } else if (event.targetPoint.y < this._prevY) {

                step = OPTIONS.SCALE_STEP * (-1);

            }

            state.scale += step;

            this._scale(
                this._initialTargetpoint,
                state.scale
            );

            this._prevY = event.targetPoint.y;
        },

        _scale: function (targetPoint, newScale) {
            var imageSize = this._view.getImageSize();
            var state = this._view.getState();
            // Ограничение зумирования
            newScale = Math.min(OPTIONS.SCALE_MAX, newScale);
            newScale = Math.max(OPTIONS.SCALE_MIN, newScale);
            // Позиция прикосновения на изображении на текущем уровне масштаба
            var originX = targetPoint.x - state.positionX;
            var originY = targetPoint.y - state.positionY;
            // Размер изображения на текущем уровне масштаба
            var currentImageWidth = imageSize.width * state.scale;
            var currentImageHeight = imageSize.height * state.scale;
            // Относительное положение прикосновения на изображении
            var mx = originX / currentImageWidth;
            var my = originY / currentImageHeight;
            // Размер изображения с учетом нового уровня масштаба
            var newImageWidth = imageSize.width * newScale;
            var newImageHeight = imageSize.height * newScale;
            // Рассчитываем новую позицию с учетом уровня масштаба
            // и относительного положения прикосновения
            state.positionX += originX - (newImageWidth * mx);
            state.positionY += originY - (newImageHeight * my);
            // Устанавливаем текущее положение мышки как "стержневое"
            state.pivotPointX = targetPoint.x;
            state.pivotPointY = targetPoint.y;
            // Устанавливаем масштаб и угол наклона
            state.scale = newScale;
            this._view.setState(state);
        }
    });

    provide(Controller);
});
