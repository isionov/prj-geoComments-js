import {getParentByClass} from "./support.js";
import getUserComment from "./getUserComment.js"

export default function getSlider(left, top, clusterArr, map, clusterer) {
    let out = [];
    let wrapUl = document.querySelector(".slider-list");
    let templateSlider = require('../templateSlider.hbs');
    let slider = document.querySelector(".slider");
    let divClose = document.querySelector('.slider-close');

    // Перемещвем пагинатор в указанную точку
    slider.style.left = left + 'px';
    slider.style.top = top + 'px';
    // Складываем все данные в массив
    clusterArr.forEach((element, i) => {
        out.push(element.properties.get('markInfo'));
        out[i].number = (i + 1);
    });

    wrapUl.innerHTML = templateSlider({ items: out });

    let list = document.querySelector(".slider-list");
    let listElem = document.querySelectorAll(".slider-list .list-elem");
    
    // Цикл для развешивания модификатора на пагинатор слайдера. Т.к. не сделал 1 пагинатор на все отзывы.
    for (let index = 0; index < listElem.length; index++) {
        let paginators = listElem[index].querySelectorAll(".paginator-elem");
        let currentPaginator = paginators[index];
        currentPaginator.classList.add("paginator--current");
    }

    function sliderHandler(e) {
        e.preventDefault();
        let elemBack = getParentByClass(e.target, 'back');
        let elemForward = getParentByClass(e.target, 'forward');
        let elemPaginator = getParentByClass(e.target, 'paginator-elem');
        let elemClose = getParentByClass(e.target, 'slider-close');
        let elemAdr = getParentByClass(e.target, 'slider-adr');
        let leftPosiyion = parseInt(list.style.left, 10);

        if (elemBack) {
            if (leftPosiyion < 0) {
                list.style.left = (leftPosiyion + 100) + '%';
            }
        }
        if (elemForward) {
            if (leftPosiyion > (-(out.length - 1) * 100)) {
                list.style.left = (leftPosiyion - 100) + '%';
            }
        }
        if (elemPaginator) {
            list.style.left = (-(+elemPaginator.dataset.paginator - 1) * 100) + '%';
        }
        if (elemClose) {
            slider.style.left = '-9999px';
            list.style.left = (0) + '%';
            slider.removeEventListener("click", sliderHandler);
        }

        if (elemAdr) {
            let arrToGetUserComments = [];
            let parent = getParentByClass(elemAdr, 'list-elem');
            let adr = out[(+parent.dataset.id) - 1].adr;
            let currentCoords = clusterArr[(+parent.dataset.id) - 1].geometry.getCoordinates();

            clusterArr.forEach(element => {
                if (adr === element.properties.get('markInfo').adr && currentCoords === element.geometry.getCoordinates()) {
                    arrToGetUserComments.push(element);
                }
            });
            getUserComment("900px", "0px", arrToGetUserComments, map, clusterer);
            let event = new Event("click", { bubbles: true, cancelable: true });
            divClose.dispatchEvent(event);
        }
    }

    slider.addEventListener("click", sliderHandler);
}

