import Vector from 'ol/layer/Vector';
import Heatmap from 'ol/layer/Heatmap';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature'; //  feature（要素），即地图上的几何对象geometry ↓
import { Point, LineString, Polygon } from 'ol/geom'; // ↑ 包括点（Point），线（LineString）,多边形（Polygon），圆（Circle） 区别在于Polygon和LineString一个会连接第一和最后一个点, 一个不会. LineString 二维数组   Polygon三位数组
import * as olProj from 'ol/proj'; // 坐标转换
import { Icon, Style, Fill, Stroke, Circle, Text } from 'ol/style'; // 样式
import GeoJSON from 'ol/format/GeoJSON';

import coordinatePng from './img/coordinate.png';
import coordinateStartPng from './img/coordinate-start.png';
import coordinateEndPng from './img/coordinate-end.png';

let map;
let view;
function injectMap(m, v) {
  map = m;
  view = v;
}

/**
 *  设置zoom和中心点
 *  center - [lng, lat]
 *  zoom 1~19
 */
function setViewZoom(center, zoom) {
  view.setCenter(olProj.transform(center, 'EPSG:4326', 'EPSG:3857'));
  view.setZoom(zoom);
}

/**
 * 添加图标
 * coordinate -[lng, lat]
 * id - 唯一标识
 * icon 添加图标
 * callback 回调
 */
function addMark(coordinate, id, icon = coordinatePng, callback) {
  const vectorMark = new Vector({
    // 新建矢量图层
    layerName: 'point',
    source: new VectorSource(),
  });
  const feature = new Feature({
    // 新建要素
    // 坐标转换 默认3857
    geometry: new Point(olProj.transform(coordinate, 'EPSG:4326', 'EPSG:3857')),
  });
  const iconStyle = new Style({
    // 设置样式
    image: new Icon({
      anchor: [0.5, 180],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: icon,
      scale: 0.15,
      // offsetOrigin:'top-left',
    }),
  });
  feature.setId(id); // 要素设置id用作标识
  feature.setStyle(iconStyle); // 要素设置样式

  vectorMark.getSource().addFeature(feature); // 将要素添加到图层
  map.addLayer(vectorMark);

  if (callback) callback(vectorMark);
}

/**
 * 连线
 * coordinates - [[lng, lat], [lng, lat], ...]
 */
function drawLine(coordinates, id, callback) {
  // 声明一个新的数组
  const coordinatesLine = [];
  // 循环遍历将经纬度转到"EPSG:4326"投影坐标系下, 获取转换后的数组
  for (let i = 0; i < coordinates.length; i += 1) {
    const pointTransform = olProj.transform(
      [coordinates[i][0], coordinates[i][1]],
      'EPSG:4326',
      'EPSG:3857',
    );
    // console.log("开始转换坐标", coordinates[i], pointTransform);
    coordinatesLine.push(pointTransform);
  }

  const vectorSource = new VectorSource();
  // 矢量图层
  const vectorLine = new Vector({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.1)',
      }),
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
      image: new Circle({
        radius: 2,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  });

  const line = new LineString(coordinatesLine); // LineString 二维数组   Polygon三维数组
  // const plygon = new Polygon([coordinatesLine]) // 设置为区域
  const feature = new Feature({
    type: 'route',
    geometry: line,
  });
  // const feature = new Feature(new LineString(coordinatesLine))
  feature.setId(id);
  vectorSource.addFeature(feature); // 同理vectorLine.getSource().addFeature(feature);
  map.addLayer(vectorLine);

  if (callback) callback(vectorLine);
}

/**
 * 线路设置-高德地图数据封装  基于高德返回的json数据
 */
function drawRoadByGaoDeJson(json, id, callback) {
  const startC = olProj.transform(
    [json.start.location.lng, json.start.location.lat],
    'EPSG:4326',
    'EPSG:3857',
  );
  const endC = olProj.transform(
    [json.end.location.lng, json.end.location.lat],
    'EPSG:4326',
    'EPSG:3857',
  );
  const startF = new Feature({ geometry: new Point(startC) });
  startF.name = '起点' || json.start.name;
  const endF = new Feature({ geometry: new Point(endC) });
  endF.name = '终点' || json.end.name;
  const features = [startF, endF];
  const { routes } = json;
  for (let i = 0; i < routes.length; i += 1) {
    const eachRoute = routes[i];
    const { steps } = eachRoute;
    for (let j = 0; j < steps.length; j += 1) {
      const eachStep = steps[j];
      const { tmcsPaths } = eachStep;
      for (let m = 0; m < tmcsPaths.length; m += 1) {
        const coord = [];
        const { path } = tmcsPaths[m];
        for (let k = 0; k < path.length; k += 1) {
          const eachPath = path[k];
          const point = olProj.transform(
            [eachPath.lng, eachPath.lat],
            'EPSG:4326',
            'EPSG:3857',
          );
          coord.push(point);
        }
        const pathF = new Feature(new LineString(coord));
        pathF.status = tmcsPaths[m].status;
        features.push(pathF);
      }
    }
  }

  const vectorSource = new VectorSource({
    features,
  });
  const vector = new Vector({
    source: vectorSource,
    style: feature => {
      const name = feature.name ? '' : '';
      const { status } = feature;

      let strokeColor = '#ff7324';
      if (status === '拥堵') strokeColor = '#e20000';
      else if (status === '缓行') strokeColor = '#ff7324';
      else if (status === '畅通') strokeColor = '#00b514';

      return new Style({
        // image: new Circle({
        //   radius: 15,
        //   fill: new Fill({
        //     color: pointerColor,
        //   })
        // }),
        image: new Icon({
          anchor: [0.5, 180],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: feature.name === '终点' ? coordinateEndPng : coordinateStartPng,
          scale: 0.18,
        }),
        stroke: new Stroke({
          color: strokeColor,
          width: 5,
          // lineDash:[10, 8]
        }),
        text: new Text({
          text: name,
          font: 'bold 15px 微软雅黑',
          fill: new Fill({
            color: 'white',
          }),
          textAlign: 'center',
          textBaseline: 'middle',
        }),
      });
    },
  });
  map.addLayer(vector);

  if (callback) callback(vector);
}

/**
 * 线路设置-  基于json坐标数据
 *   result {coordinates: [[lng, lat], [lng, lat], ...], ...}
 */
function drawRoadByCoordinates(result, id, callback) {
  // 实例一个数据源获取feature
  // 实例化一个矢量图层Vector作为绘制层
  const source = new VectorSource();
  // 实例一个线(标记点)的全局变量
  const coordinates = []; // 线,Point 点,Polygon 线
  // for (let i = 0; i < result.coordinates.length; i += 1) {
  //   const pointTransform = olProj.transform([result.coordinates[i][0], result.coordinates[i][1]], 'EPSG:4326', 'EPSG:3857');
  //   coordinates.push(pointTransform);
  // }
  const geometry = new LineString(coordinates);
  const LineStringFeature = new Feature(geometry); // 绘制线的数据
  // LineStringFeature.set("speed", result.speed);
  LineStringFeature.setId(id);
  // 将线添加到Vector绘制层上
  source.addFeature(LineStringFeature);

  const vectorLayer = new Vector({
    source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#00b514',
        width: 4,
      }),
      image: new Circle({
        radius: 2,
        fill: new Fill({
          color: '#00b514',
        }),
      }),
    }),
  });
  map.addLayer(vectorLayer); // 将绘制层添加到地图容器中
  let i = 0;
  const interval = setInterval(() => {
    const point = olProj.transform(
      result.coordinates[i],
      'EPSG:4326',
      'EPSG:3857',
    );
    geometry.appendCoordinate(point);
    i += 1;
    if (i === result.coordinates.length) {
      clearInterval(interval); // 停止循环
    }
  }, 500);

  if (callback) callback(vectorLayer);
}

/**
 * 添加遮罩区域 基于json数据
 */
function drawAreaShadeByJson(AreaJson, id, callback) {
  const geojsonObject = AreaJson; // geojson数据
  const vectorSource = new VectorSource({
    features: new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(
      geojsonObject,
    ),
    // 将EPSG:4326坐标系修改为EPSG:3857
  });

  const vectorLayer = new Vector({
    source: vectorSource,
    style: feature =>
      getStyle('rgba(137, 228, 232, 0.5)', feature.getProperties().name),
  });
  map.addLayer(vectorLayer);

  if (callback) callback(vectorLayer);
}

/**
 * 添加遮罩区域 基于左边数组
 * coordinates - [[lng, lat], [lng, lat], ...]
 */
function drawAreaShadeByCoordinates(
  coordinates,
  name,
  fillColor,
  id,
  callback,
) {
  const coordinatesPolygon = [];
  for (let i = 0; i < coordinates.length; i += 1) {
    const pointTransform = olProj.transform(
      [coordinates[i][0], coordinates[i][1]],
      'EPSG:4326',
      'EPSG:3857',
    );
    coordinatesPolygon.push(pointTransform);
  }
  const polygonFeature = new Feature({
    type: 'polygon',
    geometry: new Polygon([coordinatesPolygon]),
  });
  polygonFeature.setStyle(
    new Style({
      stroke: new Stroke({
        width: 2,
        color: '#4885eb',
      }),
      fill: new Fill({
        color: fillColor,
      }),
      text: new Text({
        text: name,
      }),
    }),
  );
  const polygonLayer = new Vector({
    source: new VectorSource({
      features: [polygonFeature],
    }),
  });
  map.addLayer(polygonLayer);

  if (callback) callback(polygonLayer);
}

function getStyle(fillColor, name) {
  return new Style({
    stroke: new Stroke({
      width: 2,
      color: '#4885eb',
    }),
    fill: new Fill({
      color: fillColor,
    }),
    text: new Text({
      text: name,
    }),
  });
}

/**
 *  热力图
 */
function drawHeatMap(heatData, id, callback) {
  // 矢量图层 获取geojson数据
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(heatData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }),
  });
  // Heatmap热力图
  const vector = new Heatmap({
    source: vectorSource,
    opacity: 0.8, // 透明度
    blur: 15, // 模糊大小（以像素为单位）,默认15
    radius: 12, // 半径大小（以像素为单位,默认8
    shadow: 250, // 阴影像素大小，默认250
  });
  map.addLayer(vector);

  if (callback) callback(vector);
}

export {
  injectMap,
  setViewZoom,
  addMark,
  drawLine,
  drawRoadByGaoDeJson,
  drawRoadByCoordinates,
  drawAreaShadeByJson,
  drawAreaShadeByCoordinates,
  drawHeatMap,
};
