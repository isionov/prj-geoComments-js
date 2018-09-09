import getSlider from "./getSlider.js"
import getUserComment from "./getUserComment.js"
const init = () => {
    const map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        controls: [],
        zoom: 7
    });
    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: true,
        hasBalloon: false
    });



    clusterer.events.add('click', function (e) {
        e.preventDefault();
        if (e.get('target').properties.get('markInfo')) {
            getUserComment("900px", "0px", e, map, clusterer);
        } else {
            let clusterArr = e.get('target').getGeoObjects();
            getSlider(...e.get('position'), clusterArr, map, clusterer);
        }
    });

    map.events.add('click', function (e) {
        event.stopPropagation();
        getUserComment("900px", "0px", e, map, clusterer)
            .then((data) => { });
    });
};

ymaps.ready(init);