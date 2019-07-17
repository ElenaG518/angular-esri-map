/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  // The <div> where we will place the map
  // mapViewEl imported from esri-loader
  // accessing native DOM element that have a template reference variable
  @ViewChild('mapViewNode', { static: false }) private mapViewEl: ElementRef;

  /**
   * _zoom sets map zoom
   * _center sets map center
   * _basemap sets type of map
   * _loaded provides map loaded status
   */
  private _zoom = 10;
  private _center: Array<number> = [0.1278, 51.5074];
  // basemap options: 'topo-vector', 'streets'
  private _basemap = 'topo-vector';
  private _loaded = false;

  get mapLoaded(): boolean {
    return this._loaded;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;

    console.log(basemap);
  }
  get basemap(): string {
    return this._basemap;
  }

  constructor() {}

  async initializeMap() {
    try {
      // this.basemap = 'streets';
      console.log(this.basemap);
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, GraphicsLayer, Graphic] = await loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/Graphic']);

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: this.basemap
      };

      const map: esri.Map = new EsriMap(mapProperties);

      // create image layers

      // Graphics layer property
      const imageTest = new Graphic({
        attributes: {
          name: 'image test'
        },
        geometry: {
          type: 'point', // autocasts as new Point()
          longitude: 54,
          latitude: 24
        },
        symbol: {
          type: 'picture-marker',
          // tslint:disable-next-line: max-line-length
          url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/0/images/e82f744ebb069bb35b234b3fea46deae'
        },
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: 'this title',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                {
                  fieldName: 'name',
                  label: 'Name',
                  visible: true
                }
              ]
            }
          ]
        }
      });

      const facilityLocationIcon = new GraphicsLayer({
        graphics: [imageTest]
      });

      map.layers.add(facilityLocationIcon);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map
      };

      return new EsriMapView(mapViewProperties);
    } catch (error) {
      console.log('EsriLoader: ', error);
    }
  }

  // Finalize a few things once the MapView has been loaded
  houseKeeping(mapView) {
    mapView.when(() => {
      console.log('mapView ready: ', mapView.ready);
      this._loaded = mapView.ready;
      this.mapLoadedEvent.emit(true);
    });
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      this.houseKeeping(mapView);
    });
  }
}
