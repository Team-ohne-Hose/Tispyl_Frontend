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
  dragFactor: number;
  rotationalDragFactor: number;
  instructions: TurnInstruction;
}

export class PhysicsEngine {
  constructor() { }

  gravity = 98.1; // units/dsec^2, 100 units = 1m, 1 dsec = 0.1 sec
  drag = 0.001; // 1/unit, Area/Volume
  rotationDrag = 0.001; // 1/unit Area/Volume

  physicsObjects: PhysicsObject[] = [];
  lastUpdate: number;

  private handleCollision(obj: PhysicsObject) {
    // TODO check for actual collisions
    // TODO fix rotation
    console.log('got Collision', obj.mesh.position.y, obj.velocity.y);

    const deltaS = obj.mesh.position.y - 2;


    const pq1 = Math.sqrt(obj.velocity.y * obj.velocity.y + 2 * deltaS * this.gravity) / this.gravity;
    const deltaT1 = - obj.velocity.y / (this.gravity) + pq1;
    const deltaT2 = - obj.velocity.y / (this.gravity) - pq1;


    let deltaT: number;
    if (Math.min(deltaT1, deltaT2) < 0) {
      deltaT = Math.max(deltaT1, deltaT2);
    } else {
      deltaT = Math.min(deltaT1, deltaT2);
    }
    // console.log('got Collision', obj.velocity.y, obj.mesh.position.y, deltaT);


    obj.mesh.position.y = 2 - obj.velocity.y * deltaT - 1.5 * this.gravity * deltaT * deltaT;
    obj.velocity.y = -obj.velocity.y - 2 * this.gravity * deltaT;
    // obj.velocity.y = -obj.velocity.y; // * obj.elasticity;
    // obj.mesh.position.y = 4 - obj.mesh.position.y;
    console.log('got Collision', obj.mesh.position.y, obj.velocity.y, deltaT1, deltaT2);
  }

  private updatePhysicsObject(obj: PhysicsObject, delta: number) {
    console.log(obj.mesh.position.y, obj.velocity.y, delta);
    const oldSpeed = obj.velocity.clone();
    const gravityAccel = new Vector3(0, -this.gravity * delta, 0);

    // update position
    obj.mesh.position.add(obj.velocity.clone().multiplyScalar(delta));
    obj.mesh.position.add(gravityAccel.clone().multiplyScalar(0.5 * delta));


    console.log(obj.mesh.position.y, obj.velocity.y, delta, gravityAccel.y);
    // update speed
    const testSpd = obj.velocity.y;
    obj.velocity.add(gravityAccel);

    if (testSpd > 0 && obj.velocity.y < 0) {
      console.log('apoapsis: ', obj.mesh.position.y);
    }
    // const dragAccel = obj.velocity.clone().dot(obj.velocity.clone()) * this.drag;
    // obj.velocity.add(obj.velocity.clone().normalize().multiplyScalar(-dragAccel * obj.dragFactor * delta));

    // update rotation
    // obj.mesh.rotateOnAxis(obj.rotationalAxis, obj.rotationalVelocity * delta);
    // obj.rotationalVelocity -= (obj.rotationalVelocity * obj.rotationalVelocity) * this.rotationDrag * obj.rotationalDragFactor * delta;

    console.log(obj.mesh.position.y, obj.velocity.y, delta);
    if (obj.mesh.position.y - obj.boundingSphere.radius < 0 && obj.velocity.y < 0) {
      console.log(delta);
      this.handleCollision(obj);
    }
  }

  update() {
    if (this.lastUpdate === undefined) {
      this.lastUpdate = Date.now();
    }
    const delta = (Date.now() - this.lastUpdate) / 1000;
    this.lastUpdate = Date.now();

    for (const key in this.physicsObjects) {
      if (key in this.physicsObjects) {
        this.updatePhysicsObject(this.physicsObjects[key], delta);
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
      dragFactor: dragFactor || 1,
      rotationalVelocity: 0,
      rotationalDragFactor: rotationalDragFactor || 1,
      rotationalAxis: new Vector3(0, 1, 0),
      instructions: undefined
    };
    this.physicsObjects.push(physObj);
    return physObj;
  }
}
