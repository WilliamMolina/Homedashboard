import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'widget-hello',
  template: `
  <div class="map" id="map"></div>
  `,
  styles: [`.map{
    position:absolute;
    top:50px;
    left:0%;
    bottom:0%;
    width:100%;
}`]
})
export class WidgetHelloComponent implements OnInit {
  map;
  style;
  lat;
  lng;
  constructor() { }

  ngOnInit() {
    this.style = 'http://192.168.0.8:8080/styles/klokantech-basic/style.json';
    this.lng = -75.5751;
    this.lat = 6.2359;
    this.initializeMap();
    this.map.addControl(new mapboxgl.FullscreenControl());
  }
  private initializeMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });    
  }
}
