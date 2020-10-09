import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {BoardItemManagement} from './viewport/BoardItemManagement';
import {AudioControl} from './viewport/AudioControl';
import {CameraControl} from './viewport/CameraControl';
import {Router} from '@angular/router';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {ViewportComponent} from './viewport/viewport.component';
import {GameAction, GameActionType, MessageType} from '../model/WsData';
import {GameInitialisationService} from '../services/game-initialisation.service';
import {InterfaceComponent} from './interface/interface.component';
import {BoardTilesService} from '../services/board-tiles.service';
import {LoadingScreenComponent} from './loading-screen/loading-screen.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ShowAttribComponent} from './show-attrib/show-attrib.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {

  constructor(private dialog: MatDialog,
              private router: Router,
              private colyseus: ColyseusClientService,
              private gameInit: GameInitialisationService,
              private boardTilesService: BoardTilesService) {
  }

  @ViewChild('viewRef') viewRef: ViewportComponent;
  @ViewChild('interfaceRef') interfaceRef: InterfaceComponent;
  @ViewChild('loadingRef') loadingScreenRef: LoadingScreenComponent;

  // might be obsolete in the future
  cameraControl: CameraControl;
  boardItemControl: BoardItemManagement;
  audioCtrl: AudioControl;
  loadGame = true;
  loadingScreenVisible = true;

  ngOnInit(): void {
      this.colyseus.getActiveRoom().subscribe((myRoom) => {
        if (myRoom === undefined) {
          this.router.navigateByUrl('/lobby');
          this.loadGame = false;
        } else {
          const msg: GameAction = {
            type: MessageType.GAME_MESSAGE,
            action: GameActionType.refreshData
          };
          myRoom.send(MessageType.GAME_MESSAGE, msg);
        }
      }, (errRoom) => {
        console.log('ErrorRoom is', errRoom);
        this.router.navigateByUrl('/lobby');
      });
  }

  ngAfterViewInit(): void {
    if (this.loadGame) {
      this.interfaceRef.gameComponent = this;
      this.gameInit.startInitialisation(this,
        this.viewRef,
        this.viewRef.boardItemManager,
        this.viewRef.physics,
        this.boardTilesService);
    }
  }

  registerViewport(tuple: [CameraControl, BoardItemManagement, AudioControl]) {
    this.cameraControl = tuple[0];
    this.boardItemControl = tuple[1];
    this.audioCtrl = tuple[2];
  }

  showAttribution() {
    const dialogRef: MatDialogRef<ShowAttribComponent, {roomName: string, skinName: string, randomizeTiles: boolean}> =
      this.dialog.open(ShowAttribComponent, {
        width: '80%',
        maxWidth: '900px',
        height: '70%',
        maxHeight: '750px',
        data: {},
        panelClass: 'modalbox-base'
      });
  }

}
