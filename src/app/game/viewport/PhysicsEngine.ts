import * as THREE from 'three';
import {BufferGeometry, Object3D, Quaternion, Vector3} from 'three';
import Ammo from 'ammojs-typed';
import btVector3 = Ammo.btVector3;
import btCollisionShape = Ammo.btCollisionShape;

export interface PhysicsUserdata {
  physicsBody: Ammo.btRigidBody;
  collided: boolean;
  objectType: ObjectType;
  onDelete: (obj: THREE.Object3D) => boolean;
}
export enum ObjectType {
  Object3D,
  Mesh,
  Group
}
export enum CollisionGroups {
  All = 15,
  Other = 1,
  Plane = 2,
  Figures = 4,
  Dice = 8
}
export enum FLAGS {
  CF_KINEMATIC_OBJECT = 2
}
export enum STATE {
  DISABLE_DEACTIVATION = 4
}
export interface RigidBodyParams {
  object: THREE.Object3D;
  shape: btCollisionShape;
  mass: number;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  colGroup: number;
  colMask: number;
}
export class PhysicsEngine {
  constructor() {
    this.init();
  }
  static FLAGS = { CF_KINEMATIC_OBJECT: 2 };

  physicsWorld: Ammo.btDiscreteDynamicsWorld;
  clock: THREE.Clock;
  tmpVec3: Ammo.btVector3;
  tmpTrans: Ammo.btTransform;
  tmpQuat: Ammo.btQuaternion;
  rigidBodies: THREE.Object3D[] = [];
  margin = 0.05;

  private static isUserdataPhysics(userDataPhysics: PhysicsUserdata | any): userDataPhysics is PhysicsUserdata {
    return (userDataPhysics as PhysicsUserdata).physicsBody !== undefined;
  }
  static getPhys(object: THREE.Object3D): PhysicsUserdata {
    const phys = object.userData.physics;
    if (this.isUserdataPhysics(phys)) {
      return phys;
    }
    return undefined;
  }

  setupPhysicsWorld() {
    const collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache    = new Ammo.btDbvtBroadphase();
    const solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    this.physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -100, 0));
  }

  init() {
    Ammo(Ammo).then(() => {
      this.tmpTrans = new Ammo.btTransform();
      this.tmpVec3 = new Ammo.btVector3();
      this.tmpQuat = new Ammo.btQuaternion(0, 0, 0 , 1);
      this.clock = new THREE.Clock();
      this.setupPhysicsWorld();
    });
  }

  updatePhysics() {
    const deltaTime = this.clock.getDelta();
    this.physicsWorld.stepSimulation( deltaTime, 10 );
    for (const body in this.rigidBodies) {
      if (body in this.rigidBodies) {
        const phys = this.rigidBodies[body].userData.physics;
        if (PhysicsEngine.isUserdataPhysics(phys)) {
          const pBody: Ammo.btRigidBody = phys.physicsBody;
          const ms: Ammo.btMotionState = pBody.getMotionState();
          if (ms) {
            ms.getWorldTransform(this.tmpTrans);
            const p = this.tmpTrans.getOrigin();
            const q = this.tmpTrans.getRotation();
            this.rigidBodies[body].position.set(p.x(), p.y(), p.z());
            this.rigidBodies[body].quaternion.set(q.x(), q.y(), q.z(), q.w());
          }
        }
      }
    }
  }
  listBodies() {
    for (const body in this.rigidBodies) {
      if (body in this.rigidBodies) {
        console.log('Body: ', this.rigidBodies[body]);
      }
    }
  }
  setKinematic(obj: Object3D, kinematic: boolean) {
    if (kinematic) {
      const body = PhysicsEngine.getPhys(obj).physicsBody;
      body.setActivationState( STATE.DISABLE_DEACTIVATION );
      body.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
    } else {
      const body = PhysicsEngine.getPhys(obj).physicsBody;
      body.setActivationState(0);
      body.setCollisionFlags(0);
    }
  }
  setPosition(obj: Object3D, x: number, y: number, z: number) {
    const pBody = PhysicsEngine.getPhys(obj).physicsBody;
    const ms = pBody.getMotionState();
    if ( ms ) {
      this.tmpVec3.setValue(x, y, z);
      this.tmpTrans.setIdentity();
      this.tmpTrans.setOrigin(this.tmpVec3);
      ms.setWorldTransform(this.tmpTrans);
      pBody.setWorldTransform(this.tmpTrans);

      obj.position.set(x, y, z);
    }
  }
  setRotation(obj: Object3D, x: number, y: number, z: number) {
    const ms = PhysicsEngine.getPhys(obj).physicsBody.getMotionState();
    if ( ms ) {
      this.tmpQuat.setEulerZYX(z, y, x);
      this.tmpTrans.setIdentity();
      this.tmpTrans.setRotation(this.tmpQuat);
      ms.setWorldTransform(this.tmpTrans);

      obj.rotation.x = x;
      obj.rotation.y = y;
      obj.rotation.z = z;
    }
  }
  setRotationQuat(obj: Object3D, x: number, y: number, z: number, w: number) {
    const ms = PhysicsEngine.getPhys(obj).physicsBody.getMotionState();
    if ( ms ) {
      this.tmpQuat.setValue(x, y, z, w);
      this.tmpTrans.setIdentity();
      this.tmpTrans.setRotation(this.tmpQuat);
      ms.setWorldTransform(this.tmpTrans);

      obj.rotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w));
    }
  }

  private createRigidBody(params: RigidBodyParams) {
    if ( params.pos ) {
      params.object.position.copy( params.pos );
    } else {
      params.pos = params.object.position;
    }
    if ( params.quat ) {
      params.object.quaternion.copy( params.quat );
    } else {
      params.quat = params.object.quaternion;
    }
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( params.pos.x, params.pos.y, params.pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( params.quat.x, params.quat.y, params.quat.z, params.quat.w ) );
    const motionState = new Ammo.btDefaultMotionState( transform );
    const localInertia = new Ammo.btVector3( 0, 0, 0 );
    params.shape.calculateLocalInertia( params.mass, localInertia );

    const rbInfo = new Ammo.btRigidBodyConstructionInfo( params.mass, motionState, params.shape, localInertia );
    const body = new Ammo.btRigidBody( rbInfo );

    body.setFriction( 0.5 );

    params.object.userData.physics.physicsBody = body;
    params.object.userData.physics.collided = false;
    if ( params.mass > 0 ) {
      this.rigidBodies.push( params.object );
      // Disable deactivation
      body.setActivationState(4);
    }
    this.physicsWorld.addRigidBody(body, params.colGroup, params.colMask);
    return body;
  }
  private createConvexHullPhysicsShape(points: ArrayLike<number>) {
    const shape = new Ammo.btConvexHullShape();
    for ( let i = 0, il = points.length; i < il; i += 3 ) {
      this.tmpVec3.setValue( points[ i ], points[ i + 1 ], points[ i + 2 ] );
      const lastOne = ( i >= ( il - 3 ) );
      shape.addPoint( this.tmpVec3, lastOne );
    }
    return shape;
  }

  private addShape(geo: BufferGeometry, obj: THREE.Object3D, mass: number, colGroup: number, colMask: number) {
    const shape = this.createConvexHullPhysicsShape(geo.getAttribute('position').array);
    shape.setMargin(this.margin);
    const rigidBodyParams: RigidBodyParams = {
      object: obj,
      shape: shape,
      mass: mass,
      pos: obj.position,
      quat: obj.quaternion,
      colGroup: colGroup,
      colMask: colMask
    };
    const body = this.createRigidBody(rigidBodyParams);
  }
  addGroup(group: THREE.Group, mass: number, collisionGroup?: number, collisionMask?: number) {
    // TODO make work with groups
    // TODO create geometry by merging geometries
    group.userData.objectType = ObjectType.Group;
  }
  addMesh(mesh: THREE.Mesh, mass: number, onDelete?: (obj: THREE.Object3D) => boolean, collisionGroup?: number, collisionMask?: number) {
    mesh.userData.physics = mesh.userData.physics || {};
    mesh.userData.physics.objectType = ObjectType.Mesh;
    mesh.userData.physics.onDelete = onDelete;
    const colGroup = collisionGroup || CollisionGroups.Other;
    const colMask = collisionMask || CollisionGroups.All;
    let geo = mesh.geometry.clone();
    geo = geo instanceof THREE.BufferGeometry ? geo : new THREE.BufferGeometry().fromGeometry(geo);
    this.addShape(geo , mesh, mass, colGroup, colMask);
  }
}
