import * as THREE from 'three';
import {Quaternion, Vector3} from 'three';

export interface TurnInstruction {
  rotationTarget: Vector3;
  timeLeft: number;
}
export interface PhysicsObject {
  mesh: THREE.Mesh;
  boundingBox: THREE.Box3;
  boundingSphere: THREE.Sphere;
  velocity: Vector3;
  rotationalAxis: Vector3;
  rotationalVelocity: number;
  elasticity: number; // 0 to 1
  rotationalDragFactor: number;
  dragFactor: number;
  instructions: TurnInstruction;
}

export class PhysicsEngine {
  constructor() { }

  gravity = 98.1; // units/dsec^2, 100 units = 1m, 1 dsec = 0.1 sec
  rotationDrag = 0.001; // 1/unit Area/Volume
  drag = 0.025;

  physicsObjects: PhysicsObject[] = [];
  lastUpdate: number;

  private handleCollision(obj: PhysicsObject) {
    // TODO check for actual collisions
    // TODO fix rotation
    const bottomToCenter = obj.boundingSphere.radius;

    const deltaS = obj.mesh.position.y - bottomToCenter;
    const pq1 = Math.sqrt(obj.velocity.y * obj.velocity.y + 2 * deltaS * this.gravity) / this.gravity;
    const deltaT1 = - obj.velocity.y / (this.gravity) + pq1;
    const deltaT2 = - obj.velocity.y / (this.gravity) - pq1;

    let deltaT: number;
    if (Math.min(deltaT1, deltaT2) < 0) {
      deltaT = Math.max(deltaT1, deltaT2);
    } else {
      deltaT = Math.min(deltaT1, deltaT2);
    }

    obj.mesh.position.y = bottomToCenter - obj.velocity.y * deltaT * obj.elasticity - 1.5 * this.gravity * deltaT * deltaT;
    if ( obj.mesh.position.y ) {
      obj.mesh.position.y = bottomToCenter;
    }
    obj.velocity.y = -obj.velocity.y * obj.elasticity - 2 * this.gravity * deltaT;
    if (Number.isNaN(obj.velocity.y)) {
      obj.velocity.y = 0;
    }
    if (Number.isNaN(obj.mesh.position.y)) {
      obj.mesh.position.y = bottomToCenter;
    }
    // console.log('got Collision', obj.mesh.position.y, obj.velocity.y, deltaT1, deltaT2);
  }

  private updatePhysicsObject(obj: PhysicsObject, delta: number) {
    if (Number.isNaN(obj.velocity.y)) {
      obj.velocity.y = 0;
    }
    if (Number.isNaN(obj.mesh.position.y)) {
      obj.mesh.position.y = 0;
    }
    const gravityAccel = new Vector3(0, -this.gravity * delta, 0);

    // update position
    obj.mesh.position.add(obj.velocity.clone().multiplyScalar(delta));
    obj.mesh.position.add(gravityAccel.clone().multiplyScalar(0.5 * delta));

    // update speed
    const testSpd = obj.velocity.y;
    obj.velocity.add(gravityAccel);

    const dragAccel = obj.velocity.clone().dot(obj.velocity.clone()) * this.drag;
    obj.velocity.add(obj.velocity.clone().normalize().multiplyScalar(-dragAccel * obj.dragFactor * delta).setY(0));

    /*if (testSpd > 0 && obj.velocity.y < 0) {
      console.log('apoapsis: ', obj.mesh.position.y);
    }*/
    // console.log('velocity: ', obj.velocity.y);

    // update rotation
    obj.mesh.rotateOnAxis(obj.rotationalAxis, obj.rotationalVelocity * delta);
    obj.rotationalVelocity -= (obj.rotationalVelocity * obj.rotationalVelocity) * this.rotationDrag * obj.rotationalDragFactor * delta;

    if (obj.mesh.position.y - obj.boundingSphere.radius < 0 && obj.velocity.y < 0) {
      this.handleCollision(obj);
    }
  }

  update() {
    if (this.lastUpdate === undefined) {
      this.lastUpdate = Date.now();
    }
    let delta = (Date.now() - this.lastUpdate) / 1000;
    if (Number.isNaN(delta)) {
      console.log('delta is NaN');
      delta = 0.01;
    }
    this.lastUpdate = Date.now();

    for (const key in this.physicsObjects) {
      if (key in this.physicsObjects) {
        this.updatePhysicsObject(this.physicsObjects[key], delta);
      }
    }
  }

  addObject(mesh: THREE.Mesh, elasticity?: number, rotationalDragFactor?: number): PhysicsObject {
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    const physObj: PhysicsObject = {
      mesh: mesh,
      boundingBox: mesh.geometry.boundingBox,
      boundingSphere: mesh.geometry.boundingSphere,
      elasticity: elasticity || 0.5,
      velocity: new Vector3(),
      rotationalVelocity: 0,
      rotationalDragFactor: rotationalDragFactor || 1,
      rotationalAxis: new Vector3(0, 1, 0),
      dragFactor: 1,
      instructions: undefined
    };
    this.physicsObjects.push(physObj);
    console.log('now simulating ' + this.physicsObjects.length + ' Objects');
    return physObj;
  }
}
