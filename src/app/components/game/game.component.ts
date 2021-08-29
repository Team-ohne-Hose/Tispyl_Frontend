import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UserInteractionController } from './viewport/helpers/UserInteractionController';
import { Router } from '@angular/router';
import { ColyseusClientService } from '../../services/colyseus-client.service';
import { ViewportComponent } from './viewport/viewport.component';
import { GameAction, GameActionType, MessageType } from '../../model/WsData';
import { GameInitialisationService } from '../../services/game-initialisation.service';
import { InterfaceComponent } from './interface/interface.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShowAttribComponent } from './show-attrib/show-attrib.component';
import { CommandService } from '../../services/command.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('viewRef') viewRef: ViewportComponent;
  @ViewChild('interfaceRef') interfaceRef: InterfaceComponent;
  @ViewChild('loadingRef') loadingScreenRef: LoadingScreenComponent;

  userInteraction: UserInteractionController;
  loadGame = true;
  loadingScreenVisible = true;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private colyseus: ColyseusClientService,
    private gameInit: GameInitialisationService,
    private commandService: CommandService
  ) {
    commandService.registerGame(this);
  }

  ngOnInit(): void {
    this.colyseus.getActiveRoom().subscribe(
      (myRoom) => {
        if (myRoom === undefined) {
          this.router.navigateByUrl('/lobby');
          this.loadGame = false;
        } else {
          const msg: GameAction = {
            type: MessageType.GAME_MESSAGE,
            action: GameActionType.refreshData, // send triggerAll() to all participants
          };
          myRoom.send(MessageType.GAME_MESSAGE, msg);
        }
      },
      (errRoom) => {
        console.log('ErrorRoom is', errRoom);
        this.router.navigateByUrl('');
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.loadGame) {
      this.interfaceRef.gameComponent = this;
      this.gameInit.startInitialisation(this);
      this.userInteraction = this.viewRef.userInteractionController;
    }
  }

  showAttribution(): void {
    const dialogRef: MatDialogRef<
      ShowAttribComponent,
      { roomName: string; skinName: string; randomizeTiles: boolean }
    > = this.dialog.open(ShowAttribComponent, {
      width: '80%',
      maxWidth: '900px',
      height: '70%',
      maxHeight: '750px',
      data: {},
      panelClass: 'modalbox-base',
    });
  }
}
