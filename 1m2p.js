
(function () {

    window.mouseToMultiPointer = function () {

        var initEvent;
        var DEFAULT_OFFSET = 100;

        document.body.addEventListener('mousedown', function (event) {
            initEvent = event;
            moveHandler(event);
        }, true);

        document.body.addEventListener('mousemove', moveHandler, true);
        document.body.addEventListener('mouseup', function (event) {
            moveHandler(event);
            initEvent = null;
        }, true);

        function moveHandler(event) {
            if (initEvent) {
                event.preventDefault();

                var offset = event.pageY - initEvent.pageY + DEFAULT_OFFSET;
                offset = Math.max(10, offset);
                offset = Math.min(offset, 200);
                createPointer(event, 998, initEvent.clientX, initEvent.clientY, offset * -1);
                createPointer(event, 999, initEvent.clientX, initEvent.clientY, offset);
            }
        }
    };

    function createPointer(event, pointerId, x, y, offset) {
        x = Math.max(1, x + offset);
        y = Math.max(1, y + offset);

        var elem = document.elementFromPoint(x, y);

        if (elem) {
            elem.dispatchEvent(new PointerEvent(
                event.type.replace('mouse', 'pointer'), {
                    pointerId: pointerId,
                    bubbles: true,
                    cancelable: true,
                    pointerType: 'touch',
                    width: 5,
                    height: 5,
                    clientX: x,
                    clientY: y,
                    isPrimary: false
                })
            );
        }
    }

})();
