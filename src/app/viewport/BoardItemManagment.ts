import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';


export class BoardItemManagment {

  myView: ViewportComponent;
  markerGeo = new THREE.ConeGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);

  constructor( view: ViewportComponent) {
    this.myView = view;
  }

  addMarker(x: number, y: number, z: number, col: number): void {
    const markerMat = new THREE.MeshPhysicalMaterial({color: col});
    const marker = new THREE.Mesh(this.markerGeo, markerMat);
    marker.castShadow = true;
    marker.receiveShadow = true;
    marker.position.x = x;
    marker.position.y = y + this.markerGeo.parameters.height / 2;
    marker.position.z = z;
    console.log('new Marker at: ', x, y, marker.position.z);
    marker.rotateX(Math.PI);
    this.myView.scene.add(marker);
  }
}
