import colormap from 'colormap';
import { getArea } from 'ol/sphere';
import { Style, Fill, Stroke } from 'ol/style';

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

export function colorfulAreasStyle(feature) {
    return new Style({
        fill: new Fill({
            color: getColor(feature),
        }),
        stroke: new Stroke({
            color: 'rgba(255,255,255,0.8)',
        }),
    });
}
export const onlyBoundsStyle = new Style({
    fill: new Fill({
        color: 'rgba(255,255,255,0.2)',
    }),
    stroke: new Stroke({
        color: 'blue',
    }),
});
