import { getParentByClass, getParentById } from "./support.js";

export default function getUserComment(left, top, marker, map, cluster) {
    // Установим центр карты в точку клика
    let out = [];
    let coords;
    if (Array.isArray(marker)) {
        console.log('array');
        marker.forEach((elem) => {
            coords = elem.geometry.getCoordinates();
            out.push(elem.properties.get('markInfo'));
        });
        // console.log(out);

    } else if (marker.get('target').properties !== undefined) {
        coords = marker.get('target').geometry.getCoordinates();
        out.push(marker.get('target').properties.get('markInfo'));
    }
    else {
        coords = marker.get('coords');
    }
    map.setCenter(coords);
    // Вернём результат выполнения функции geocode, т.к. это промис и нужно дождаться когда он отработает
    // return ymaps.geocode(marker.get('coords'),{results:"20"})
    return ymaps.geocode(coords, { results: "20" })
        .then(function (res) {
            let wrapper = document.querySelector('.wrapper');              // обертка для формы ввода данных
            let addr = document.querySelector('.adress');                  // div, в который мы запишем адрес, полученный с пом. метода geocode
            let list = document.querySelector('.list-comments');           // обертка для списка отзывов по объекту в форме ввода данных
            let template = require('../template.hbs');                     // подгружаем шаблон отзыва
            let nameElem = document.querySelector('#input-name');          // поле ввода имени
            let placeElem = document.querySelector('#input-place');        // поле ввода названия места
            let commentElem = document.querySelector('#input-comment');    // поле ввода комментария
            let geoObj = res.geoObjects.get(0);                            // первый в списке результатов геообъект, который вернула ф-ция geocode
            // массив для хранения введенных данных 
            list.innerHTML = template({ items: out });

            addr.textContent = "" + geoObj.getAddressLine();              // записали в форму адрес места клика
            wrapper.style.left = left;                                     // смещаем форму в определенное место для досупа пользователя
            wrapper.style.top = top;                                       // смещаем форму в определенное место для досупа пользователя

            // Вернём "промис", т.к. работа с пользователем - асинхронный процесс
            return new Promise((resolve) => {
                function eHandler(e) {
                    e.preventDefault();                                    // отключаем действие по умолчанию, чтобы не перезагружалась страница
                    event.stopPropagation();                               // останавливае продвижение, чтобы не первый сработал обработчик на карте. Событие ловится на фазе захвата

                    let close = getParentByClass(e.target, "svg-close");   // определяем: цель клика - это элемент закрывания формы или нет
                    let mapTag = getParentById(e.target, "map");           // определяем: цель клика - это элемент карты, который тоже приведёт к закрытию формы или нет
                    let btn = getParentByClass(e.target, "add");           // определяем: цель клика - это элемент добавления отзыва или нет
                    let commentInfo = {};                                  // объект для хранения имени-места-отзыва

                    // Если цель клика - это элемент добавления отзыва, то выполняем код ниже
                    if (btn) {
                        let inputName = nameElem.value;                   // получаем введённое пользователем имя
                        let inputPlace = placeElem.value;                 // получаем введённое пользователем место
                        let inputComment = commentElem.value;             // получаем введённый пользователем комментарий

                        // Если все поля заполнены
                        if (inputName && inputPlace && inputComment) {
                            let mark = new ymaps.Placemark(coords, {}, {
                                preset: 'islands#violetIcon'
                            });                                           // создаем геообъект маркер
                            let now = new Date();
                            var options = {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            };

                            commentInfo = {
                                "name": inputName,
                                "place": inputPlace,
                                "comment": inputComment,
                                "adr": addr.textContent,
                                "coords": coords,
                                "date": now.toLocaleString("ru", options)
                            };                                            // заполняем объект для хранения имени-места-отзыва введенными данными
                            mark.properties.set('markInfo', commentInfo); // добавляем объект для хранения имени-места-отзыва в свойства маркера 
                            cluster.add(mark);                            // добавляем маркер в кластер
                            map.geoObjects.add(cluster);                  // добавляем кластер на карту
                            let clusterArr = cluster.getGeoObjects();     // получаем массив объектов в кластере
                        }

                        out.push(commentInfo)
                        list.innerHTML = template({ items: out });
                        nameElem.value = "";
                        placeElem.value = "";
                        commentElem.value = ""
                    }
                    if (close || mapTag) {
                        wrapper.style.left = "-10000px";
                        resolve();
                        list.innerHTML = "";
                        nameElem.value = "";
                        placeElem.value = "";
                        commentElem.value = "";
                        document.removeEventListener('click', eHandler, true);
                    }
                }

                document.addEventListener('click', eHandler, true);

            });
        });
}