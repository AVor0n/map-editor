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
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';

const osmSource = new OSM();
const osmLayer = new TileLayer({
    source: osmSource,
});

const customSource = new VectorSource({
    format: new GeoJSON(),
    url: './countries.json',
});

const customLayer = new VectorLayer({
    source: customSource,
});

const map = new Map({
    target: 'map-container',
    layers: [],
    view: new View({
        center: [0, 0],
        zoom: 2,
    }),
});

const showOsmLayerToggle = document.getElementById('osmToggle');
showOsmLayerToggle.addEventListener('change', function (e) {
    const showOsm = e.target.checked;
    osmLayer.setVisible(showOsm);
});

const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
const download = document.getElementById('download');
customSource.on('change', function () {
    const features = customSource.getFeatures();
    const json = format.writeFeatures(features);
    download.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
});

map.addLayer(osmLayer);
map.addLayer(customLayer);

// сохраняет положение карты при перезагрузке окна
map.addInteraction(new Link());
// позволяет загружать карту через Drag-n-Drop
map.addInteraction(
    new DragAndDrop({
        source: customSource,
        formatConstructors: [GeoJSON],
    }),
);
// позволяет править линии на карте
map.addInteraction(
    new Modify({
        source: customSource,
    }),
);
// позволяет рисовать новые линии
map.addInteraction(
    new Draw({
        type: 'Polygon',
        source: customSource,
    }),
);
// привязывает точки к ближайшей при редактировании, чтоб избежать неточных границ
map.addInteraction(
    new Snap({
        source: customSource,
    }),
);
