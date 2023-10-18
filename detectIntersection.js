import GeoJSON from 'ol/format/GeoJSON';
import { booleanPointOnLine, lineIntersect, lineOverlap } from '@turf/turf';

function removePointsOnLines(points, lines) {
    // Создайте пустой массив для хранения точек, не лежащих на линиях
    const filteredPoints = [];

    // Переберите каждую точку и проверьте, лежит ли она на какой-либо из линий
    points.forEach(point => {
        // Переберите каждую линию и проверьте, лежит ли точка на линии
        const isOnLine = lines.some(line => {
            return booleanPointOnLine(point, line, {
                epsilon: 0.1,
                ignoreEndVertices: false,
            });
        });

        // Если точка не лежит на линии, добавьте ее в отфильтрованный массив
        if (!isOnLine) {
            filteredPoints.push(point);
        }
    });

    return filteredPoints;
}
export async function detectIntersections(source, intersectionSource) {
    // Получение всех фичей из исходного слоя
    const features = source.getFeatures();
    const format = new GeoJSON();

    // Перебор всех фичей и проверка на пересечения
    for (let i = 0; i < features.length; i++) {
        await new Promise(res => setTimeout(res));
        for (let j = i + 1; j < features.length; j++) {
            const geojson1 = format.writeFeaturesObject([features[i]]);
            const geojson2 = format.writeFeaturesObject([features[j]]);
            // Проверка на пересечение
            const overlap = lineOverlap(geojson1, geojson2);
            const intersect = lineIntersect(geojson1, geojson2);

            const result = removePointsOnLines(intersect.features, overlap.features);
            if (!result.length) continue;

            result.forEach(res => {
                const points = format.readFeatures(res);
                if (points.length) {
                    intersectionSource.addFeatures(points);
                }
            });
        }
    }
}
