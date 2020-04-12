import * as THREE from 'three';
import {Quaternion, Vector3} from 'three';

export interface PhysicsObject {
  mesh: THREE.Mesh;
  boundingBox: THREE.Box3;
  boundingSphere: THREE.Sphere;
  velocity: Vector3;
  acceleration: Vector3;
  rotationalVelocity: Quaternion;
  rotationalAcceleration: Quaternion;
  elasticity: number; // 0 to 1
  dragFactor: number;
  rotationalDragFactor: number;
}

export class PhysicsEngine {
  constructor() { }

  gravity = 0.0981; // units/sec^2, 100 units = 1m
  drag = 0.001; // units/sec^2

  physicsObjects: PhysicsObject[];

  private handleCollision(obj: PhysicsObject) {

  }

  private updatePhysicsObject(obj: PhysicsObject) {
    this.handleCollision(obj);

    obj.acceleration.add(new Vector3(0, this.gravity, 0));
    obj.acceleration.multiplyVectors()
  }

  update() {
    for (const key in this.physicsObjects) {
      if (key in this.physicsObjects) {
        this.updatePhysicsObject(this.physicsObjects[key]);
      }
    }
  }

  addObject(mesh: THREE.Mesh, elasticity?: number, dragFactor?: number, rotationalDragFactor?: number): PhysicsObject {
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    const physObj: PhysicsObject = {
      mesh: mesh,
      boundingBox: mesh.geometry.boundingBox,
      boundingSphere: mesh.geometry.boundingSphere,
      elasticity: elasticity || 0.5,
      velocity: new Vector3(),
      acceleration: new Vector3(),
      dragFactor: dragFactor || 1,
      rotationalVelocity: new Quaternion(0, 0, 0, 1),
      rotationalAcceleration: new Quaternion(0, 0, 0, 1),
      rotationalDragFactor: rotationalDragFactor || 1,
    };
    return physObj;
  }
}
