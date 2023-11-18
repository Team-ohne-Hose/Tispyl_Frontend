import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AmbientLight, CubeTexture, DirectionalLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { ObjectLoaderService } from '../../services/object-loader/object-loader.service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Findings
 *
 *  -   having a shadowMap enabled will always keep one internal texture loaded
 *  -   having loaded a cubeMap once will keep 1 internal geometry but no triangles
 *
 *  -   Disposing a cube map -> scene.background = null; cubeTexture.dispose()
 *      The texture should not be referenced by anything to successfully dispose it
 *
 *
 *
 *
 *
 *
 *
 */

@Component({
  selector: 'app-render-test',
  templateUrl: './render-test.component.html',
  styleUrls: ['./render-test.component.css'],
})
export class RenderTestComponent implements AfterViewInit {
  @ViewChild('view') view: ElementRef;
  private sceneTree: Scene;
  private camera: PerspectiveCamera;
  protected renderer: WebGLRenderer;
  protected info = {};
  private stats: Stats = Stats();
  public t0: DOMHighResTimeStamp = -1;
  public t1: DOMHighResTimeStamp = -1;
  public dt: DOMHighResTimeStamp = -1;
  public fps: number;
  private controls;
  private bcapRef;
  private ct: CubeTexture;

  constructor(private ols: ObjectLoaderService) {
    document.body.appendChild(this.stats.dom);
  }

  private _make_camera(w: number, h: number): PerspectiveCamera {
    const cam = new PerspectiveCamera();
    cam.fov = 75;
    cam.aspect = w / h;
    cam.near = 0.1;
    cam.far = 5000;
    cam.position.set(0, 70, -30);
    cam.updateProjectionMatrix();
    return cam;
  }

  private _make_light() {
    /** Lighting - NOTE: this setup is tailored specifically to the current object materials and is far off from any physical model */
    const ambient = new AmbientLight(0xb1e1ff, 0.8); // soft blue-ish ambient light
    ambient.name = 'ambient light';
    const sun = new DirectionalLight(0xf7eee4, 4.5); // warm yellow-ish sun light
    sun.name = 'sun';
    const sunTarget = new Object3D().translateY(5);
    sun.position.set(20, 100, 90);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.bias = -0.00015;
    sun.target = sunTarget;
    sun.castShadow = true;
    return [ambient, sun];
  }

  ngAfterViewInit(): void {
    /** Construct an empty scene */
    const width: number = this.view.nativeElement.offsetWidth;
    const height: number = this.view.nativeElement.offsetHeight;

    this.sceneTree = new Scene();
    this.camera = this._make_camera(width, height);
    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = false;
    this.view.nativeElement.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this._make_light().forEach((l) => this.sceneTree.add(l));

    console.debug('THREE.js "empty" viewport constructed');

    this.ols.getCubeMap(1).subscribe((ct) => {
      this.ct = ct;
      this.sceneTree.background = ct;
    });
    //this.ols.getNewObject(1).subscribe(bcap => {
    //  this.bcapRef = bcap
    //  this.sceneTree.add(bcap)
    //});

    this.info = this.renderer.info;
    console.log(this.sceneTree);
  }

  startRendering(): void {
    console.debug('THREE.js rendering started');
    // The XRFrame contains VR and AR pose information and can be ignored
    this.renderer.setAnimationLoop((ts: DOMHighResTimeStamp, _: XRFrame) => {
      this.t1 = ts;
      this.dt = this.t1 - this.t0;
      this.fps = 1000 / this.dt;
      this.stats.update();
      this.renderer.render(this.sceneTree, this.camera);
      this.t0 = this.t1;
    });
  }

  stopRendering() {
    this.renderer.setAnimationLoop(null);
  }

  remove() {
    this.ols.disassembleScene(this.sceneTree);
    console.log(this.sceneTree);
  }

  add() {
    this.ols.getNewObject(1).subscribe((bcap) => {
      this.sceneTree.add(bcap);
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());

      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
      this.sceneTree.add(bcap.clone());
    });
  }
}
