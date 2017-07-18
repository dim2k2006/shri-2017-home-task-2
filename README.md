# ШРИ 2017, Домашнее задание 2

## Содержание

- [Установка](#Установка)
- [Задача](#Задача)
- [Решение](#Решение)

## Установка

1. git clone git@github.com:dim2k2006/shri-2017-home-task-2.git

2. cd shri-2017-home-task-2

3. npm install

4. npm run watch

## Задача:

- Необходимо поддержать в EventManager события спецификации Pointer Events
- Необходимо поддержать в EventManager события "колесико мышки"
- Необходимо придумать и реализовать поведение "OneTouchZoom" (down, up, down, move ↑↓). Изменение масштаба одним пальцем. Это поведение должно работать только с пальцами (!), не с мышкой. Изображение должно зумироваться в точку тапа.
- Пишем на Vanilla JS. Не используем полифилы.
- Поддерживаемые браузеры: IE11, Edge, Chrome (+ Android Chrome), Firefox, iOS Safari, Safari
- Соблюдение текущей архитектуры приложения
- Учесть различия между Pointer Events и Touch Events
- Учесть, что в одном браузере может быть поддержка нескольких спецификаций
- Учесть работу событий за пределами элемента
- Учесть стандартное поведение браузера

## Решение

1. Необходимо поддержать в EventManager события спецификации Pointer Events.

> Для поддержки спецификации Pointer Events в EventManager была добавлена прослушка событий данной спецификации. Данная прослушка будет активирована в том случае, если объект window содержит свойство PointerEvent.

2. Необходимо поддержать в EventManager события "колесико мышки".

> Для реализации данного пункта в EventManger была добавлена прослушка события "wheel". Событие "wheel" поддерживается в Chrome 31+, IE9+, Firefox 17+, что отвечает требованиям проекта.

3. Необходимо придумать и реализовать поведение "OneTouchZoom" (down, up, down, move ↑↓). Изменение масштаба одним пальцем. Это поведение должно работать только с пальцами (!), не с мышкой. Изображение должно зумироваться в точку тапа.

> Реализация данного жеста схожа с реализацией жеста "double tap". Для определния пальца в EventManager было добавлено свойство isTouch, которое передается в GestureController.

4. Пишем на Vanilla JS. Не используем полифилы.

> Полифилы в проекте не используются.

5. Поддерживаемые браузеры: IE11, Edge, Chrome (+ Android Chrome), Firefox, iOS Safari, Safari.

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE11, Edge| last 5 versions| last 5 versions| last 3 versions| last 5 versions| last 2 versions| last 2 versions

> Тестировал при помощи сервиса "Browserstack". Для тестирования мультитач Pointer Events использовал библиотеку [mouseToMultiPointer](https://github.com/vsesh/mouseToMultiPointer).

6. Соблюдение текущей архитектуры приложения.

> Работа с событиями ведется в EventManager, работа с жестами в GestureController.

7. Учесть различия между Pointer Events и Touch Events.

> В качестве основного различия можно выделить тот факт, что при Touch Events собтия приходят сразу на все пальцы, а при Pointer Events соыбытия приходят отдельно на каждый pointer. Соответствующая обработка подобного поведения реализована в EventManger.

8. Учесть, что в одном браузере может быть поддержка нескольких спецификаций.

> Для учета подобного случая используется проверка на поддержку той или иной спецификации браузером.

9. Учесть работу событий за пределами элемента.

> Touch Events по умолчанию реализуют такой функционал. Для Pointer Events используется схожая с Mouse Events реализация прослушки событий.

10. Учесть стандартное поведение браузера.

> Для предотвращения стандартного поведения браузера используется стандартный метод event.preventDefault(). Также к корневому контейнеру (#holder) применено css свойство touch-action: none.