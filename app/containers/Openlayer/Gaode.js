import React, { PureComponent } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';

import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

import { ZoomSlider } from 'ol/control';

export default class Gaode extends PureComponent {
  componentDidMount() {
    const map = new Map({
      layers: [
        new TileLayer({
          title: '高德地图',
          source: new XYZ({
            url:
              'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
            wrapX: false,
          }),
        }),
      ],
      view: new View({
        center: [12958752, 4848452],
        projection: 'EPSG:3857',
        zoom: 8,
        minZoom: 1,
        // center: [106.51, 29.55],
        // projection: 'EPSG:4326',
        // zoom: 10
      }),
      target: 'map',
    });
    const zoomslider = new ZoomSlider();
    map.addControl(zoomslider);
  }

  render() {
    return (
      <>
        <div style={{ width: '800px', height: '400px' }} id="map" />
      </>
    );
  }
}
