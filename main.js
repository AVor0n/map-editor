import DragAndDrop from 'ol/interaction/DragAndDrop';
import GeoJSON from 'ol/format/GeoJSON';
import Link from 'ol/interaction/Link';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';

const source = new VectorSource({
    format: new GeoJSON(),
    url: './countries.json',
});

const layer = new VectorLayer({
    source,
});

const map = new Map({
    target: 'map-container',
    layers: [],
    view: new View({
        center: [0, 0],
        zoom: 2,
    }),
});

const clear = document.getElementById('clear');
clear.addEventListener('click', function () {
    source.clear();
});

const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
const download = document.getElementById('download');
source.on('change', function () {
    const features = source.getFeatures();
    const json = format.writeFeatures(features);
    download.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
});


map.addLayer(layer);

// сохраняет положение карты при перезагрузке окна
map.addInteraction(new Link());
// позволяет загружать карту через Drag-n-Drop
map.addInteraction(
    new DragAndDrop({
        source,
        formatConstructors: [GeoJSON],
    }),
);
// позволяет править линии на карте
map.addInteraction(
    new Modify({
        source,
    }),
);
// позволяет рисовать новые линии
map.addInteraction(
    new Draw({
        type: 'Polygon',
        source,
    }),
);
// привязывает точки к ближайшей при редактировании, чтоб избежать неточных границ
map.addInteraction(
    new Snap({
        source: source,
    }),
);
