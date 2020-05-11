import * as THREE from 'three';
import {SceneBuilderService} from '../../services/scene-builder.service';
import {PhysicsCommands} from './PhysicsCommands';
import {GameActionType, GameSetTile, MessageType, WsData} from '../../model/WsData';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {Room} from 'colyseus.js';
import {GameState} from '../../model/state/GameState';
import {Color, ObjectLoaderService} from '../../services/object-loader.service';
import {MapSchema} from '@colyseus/schema';
import {Player} from '../../model/state/Player';

export interface FigureItem {
  mesh: THREE.Object3D;
  labelSprite: THREE.Sprite;
  name: string;
  isHidden: boolean;
  labelInScene: boolean;
}
export class BoardItemManagement {

  allFigures: FigureItem[];
  board: THREE.Mesh;
  scene: THREE.Scene;
  markerGeo = new THREE.ConeBufferGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);

  constructor(scene: THREE.Scene,
              private sceneBuilder: SceneBuilderService,
              private physics: PhysicsCommands,
              private colyseus: ColyseusClientService,
              private loader: ObjectLoaderService) {
    this.scene = scene;
    this.allFigures = [];
    this.physics.addPlayer = ((mesh: THREE.Object3D, name: string) => {
      this.allFigures.push({mesh: mesh, labelSprite: undefined, name: name, isHidden: false, labelInScene: false});
    }).bind(this);
    this.physics.isPlayerCached = ((physId: number) => {
      return this.allFigures.some((val: FigureItem, index: number) => {
        return val.mesh.userData.physicsId === physId;
      });
    }).bind(this);
    this.colyseus.getActiveRoom().subscribe((activeRoom: Room<GameState>) => {
      activeRoom.state.playerList.onChange = ((item: Player, key: string) => {
        const obj = PhysicsCommands.getObjectByPhysId(this.scene, item.figureId);
        if (obj !== undefined) {
          if (item.figureModel !== undefined) {
            console.log('loading new playerTex', item.figureModel);
            this.loader.switchTex(obj, item.figureModel);
          }
          obj.userData.displayName = item.displayName;
        }
        const figureItem = this.allFigures.find((val: FigureItem, index: number) => {
          return val.mesh.userData.physicsId === item.figureId;
        });
        if (item.hasLeft !== figureItem.isHidden) {
          console.error('changing hiddenState', item.hasLeft, figureItem.isHidden, this.allFigures);
          if (figureItem.isHidden) {
            this.scene.add(figureItem.mesh);
            figureItem.isHidden = false;
          } else {
            this.scene.remove(figureItem.mesh);
            figureItem.isHidden = true;
          }
        }
      }).bind(this);
      this.loadModels(activeRoom.state.playerList);
    });
  }

  loadModels(list: MapSchema<Player>) {
    for (const p in list) {
      if (p in list) {
        const player: Player = list[p];
        const obj = PhysicsCommands.getObjectByPhysId(this.scene, player.figureId);
        if (obj !== undefined) {
          if (player.figureModel !== undefined) {
            console.error('loading new Model');
            this.loader.switchTex(obj, player.figureModel);
          }
          obj.userData.displayName = player.displayName;
        }
      }
    }
  }

  throwDice() {
    if (this.colyseus.myLoginName === this.colyseus.activePlayerLogin) {
      console.log('throwing Dice', this.physics.dice, PhysicsCommands.getPhysId(this.physics.dice));
      if (this.physics.dice !== undefined) {
        const physIdDice = PhysicsCommands.getPhysId(this.physics.dice);
        this.physics.setPosition(physIdDice, 0, 40, 0);
        // this.physics.setRotation(physIdDice, 0, 0, 0, 1);

        const vel = new THREE.Vector3(Math.random() - 0.5, Math.random() / 10, Math.random() - 0.5);
        const rot = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        vel.normalize().multiplyScalar(Math.random() * 35);
        rot.multiplyScalar(Math.PI);
        this.physics.setVelocity(physIdDice, vel.x, vel.y, vel.z);
        this.physics.setAngularVelocity(physIdDice, rot.x, rot.y, rot.z);
      }
    } else {
      console.log('You are not the active Player!');
    }
  }

  updateSprites(hidden: boolean) {
    for (const f of this.allFigures) {
      if (f.labelSprite === undefined) {
        f.labelSprite = this.loader.createLabelSprite(f.name, 70, 'Roboto',
          new Color(1, 1, 1, 1),
          new Color(.24, .24, .24, .9),
          new Color(.1, .1, .1, 0), 0, 4);
      }
      f.labelSprite.position.set(f.mesh.position.x, f.mesh.position.y + 5, f.mesh.position.z);
      if (f.labelInScene !== !hidden) {
        if (hidden) {
          this.scene.remove(f.labelSprite);
          f.labelInScene = false;
        } else {
          this.scene.add(f.labelSprite);
          f.labelInScene = true;
        }
      }
    }
  }

  hoverGameFigure(object: THREE.Object3D, x: number, y: number) {
    // this.physics.setRotation(PhysicsCommands.getPhysId(object), 0, 0, 0, 1);
    this.physics.setPosition(PhysicsCommands.getPhysId(object), x, 10, y);
  }
  moveGameFigure(object: THREE.Object3D, fieldID: number) {
    console.log('move Figure to ', fieldID);
    this.colyseus.getActiveRoom().subscribe( room => {
      const userData = object.userData;
      let playerId: string;
      for (const key in room.state.playerList) {
        if (key in room.state.playerList) {
          const p: Player = room.state.playerList[key];
          if (p.figureId === userData.physicsId) {
            playerId = p.loginName;
            break;
          }
        }
      }
      const msg: GameSetTile = {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.setTile,
        figureId: userData.physicsId,
        playerId: playerId,
        tileId: fieldID};
      room.send(msg);
    });
  }

  addFlummi(x: number, y: number, z: number, color: number) {
    // const geometry = new THREE.SphereGeometry( 2, 32, 32 );
    const geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    const material = new THREE.MeshStandardMaterial( {color: color} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    // this.scene.add( sphere );
    // TODO rebuild Flummis, because important
    // this.physics.setVelocity(physId, (2 * Math.random() - 1) * 15, Math.random() * 15, (2 * Math.random() - 1) * 15);
  }
  addMarker(x: number, y: number, z: number, col: number): void {
    // TODO rebuild Marker, because important
    const markerMat = new THREE.MeshStandardMaterial({color: col});
    const marker = new THREE.Mesh(this.markerGeo, markerMat);
    marker.castShadow = true;
    marker.receiveShadow = true;
    marker.position.x = x;
    marker.position.y = y + this.markerGeo.parameters.height / 2;
    marker.position.z = z;
    console.log('new Marker at: ', x, y, marker.position.z);
    marker.rotateX(Math.PI);
    // this.scene.add(marker);
    // this.boardItems.push({mesh: marker, role: BoardItemRole.marker, removeBy: Date.now() + 10000});
  }
}
