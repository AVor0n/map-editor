import DragAndDrop from 'ol/interaction/DragAndDrop';
import GeoJSON from 'ol/format/GeoJSON';
import Link from 'ol/interaction/Link';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import colormap from 'colormap';
import { getArea } from 'ol/sphere';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { detectIntersections } from './detectIntersection';

let showIntersect = false;
const osmSource = new OSM();
const osmLayer = new TileLayer({
    source: osmSource,
});

const min = 1e8; // the smallest area
const max = 2e13; // the biggest area
const steps = 50;
const ramp = colormap({
    colormap: 'blackbody',
    nshades: steps,
});

function clamp(value, low, high) {
    return Math.max(low, Math.min(value, high));
}

function getColor(feature) {
    const area = getArea(feature.getGeometry());
    const f = Math.pow(clamp((area - min) / (max - min), 0, 1), 1 / 2);
    const index = Math.round(f * (steps - 1));
    const opacity = '99';
    return `${ramp[index]}${opacity}`;
}

function colorfulAreasStyle(feature) {
    return new Style({
        fill: new Fill({
            color: getColor(feature),
        }),
        stroke: new Stroke({
            color: 'rgba(255,255,255,0.8)',
        }),
    });
}
const onlyBoundsStyle = new Style({
    fill: new Fill({
        color: 'rgba(255,255,255,0.2)',
    }),
    stroke: new Stroke({
        color: 'blue',
    }),
});

const intersectionSource = new VectorSource();
const intersectionLayer = new VectorLayer({
    source: intersectionSource,
    style: new Style({
        image: new Circle({
            radius: 3,
            fill: new Fill({ color: '#ff000050' }),
            stroke: new Stroke({ color: 'red' }),
        }),
    }),
});

const customSource = new VectorSource({
    format: new GeoJSON(),
    url: './map-data (1).json',
});

const customLayer = new VectorLayer({
    source: customSource,
    style: onlyBoundsStyle,
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
showOsmLayerToggle?.addEventListener('change', function (e) {
    const showOsm = e.target?.checked;
    osmLayer.setVisible(showOsm);
});

const colorizeToggle = document.getElementById('colorizeToggle');
colorizeToggle?.addEventListener('change', function (e) {
    const needColors = e.target?.checked;
    customLayer.setStyle(needColors ? colorfulAreasStyle : onlyBoundsStyle);
});

const intersectionToggle = document.getElementById('intersectionToggle');
intersectionToggle?.addEventListener('change', function (e) {
    showIntersect = e.target?.checked;
    if (showIntersect) {
        detectIntersections(customSource, intersectionSource);
    } else {
        intersectionLayer?.getSource()?.clear();
    }
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
map.addLayer(intersectionLayer);

// сохраняет положение карты при перезагрузке окна
map.addInteraction(new Link());
// позволяет загружать карту через Drag-n-Drop
map.addInteraction(
    new DragAndDrop({
        source: customSource,
        formatConstructors: [GeoJSON],
    }),
);
const modify = new Modify({
    source: customSource,
});
// позволяет править линии на карте
map.addInteraction(modify);
// привязывает точки к ближайшей при редактировании, чтоб избежать неточных границ
map.addInteraction(
    new Snap({
        source: customSource,
    }),
);

customSource.once('change', function () {
    if (showIntersect && customSource.getState() === 'ready') {
        detectIntersections(customSource, intersectionSource);
    }
});
modify.on('modifystart', () => {
    // Очистка слоя с пересечениями
    intersectionLayer?.getSource()?.clear();
});
modify.on('modifyend', () => {
    if (showIntersect) {
        detectIntersections(customSource, intersectionSource);
    }
});
