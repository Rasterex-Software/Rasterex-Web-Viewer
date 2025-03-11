import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { User, UserService } from '../user/user.service';
import { CollabService, Participant, RoomParticipants } from 'src/app/services/collab.service';

interface RoomInfo {
  docId: string;
  roomName: string;
  joinedRoom: boolean;
  participants: Participant[];
}

@Component({
  selector: 'rx-room-panel',
  templateUrl: './room-panel.component.html',
  styleUrls: ['./room-panel.component.scss']
})
export class RoomPanelComponent implements OnInit {
  canCollaborate: boolean = false;
  // isCollabActive: boolean = false;
  @Input() visible = true;
  @Output() visibleChange = new EventEmitter<boolean>();
  guiConfig$ = this.rxCoreService.guiConfig$;
  guiConfig: IGuiConfig | undefined;

  // A user can join more than one rooms if he opened more than one documents.
  // For each document, we need to save some informations.
  roomInfoArray: Array<RoomInfo> = [];
  activeDocId: string = '';
  user: User | null = null;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly userService: UserService,
    private readonly collabService: CollabService,
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit(): void {
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;

      this.canCollaborate = !!this.guiConfig.canCollaborate;
    });

    this.rxCoreService.guiState$.subscribe(state => {
      this.updateRoomByCurrentFile();
    });

    this.userService.currentUser$.subscribe((user) => {
      const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
      // If user changed or logout, leave room first
      if (roomInfo && roomInfo.joinedRoom) {
        this.leaveRoom();
        roomInfo.joinedRoom = false;
        roomInfo.participants = [];
      }
      this.user = user;
      this.collabService.setUsername(user?.username || '', user?.displayName || '');
    });

    this.collabService.roomParticipantsChange$.subscribe((roomParticipants: RoomParticipants) => {
      // if the change is for active doc, then handle it. Otherwise, ignore it.
      const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
      if (roomInfo) {
        if (roomInfo.roomName === roomParticipants.roomName) {
          roomInfo.participants = roomParticipants.participants || [];
          roomInfo.participants.sort((a, b) => {
            return a.displayName.toLowerCase() >= b.displayName.toLowerCase() ? 1: -1
          });
        }
      }
    })

    this.rxCoreService.guiFileLoadComplete$.subscribe(() => {
      this.updateRoomByCurrentFile();
    });
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  ngOnDestroy(): void {
  }

  // @HostListener('document:mousedown', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  // }

  joinRoom() {
    const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (!roomInfo) {
      console.warn('Failed to find active doc!');
      return;
    }
    this.collabService.joinRoom(roomInfo.roomName).then(ret => {
      roomInfo.joinedRoom = ret;
      this.updateParticipants();
    });
  }

  leaveRoom() {
    const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (!roomInfo) {
      console.warn('Failed to find active doc!');
      return;
    }
    this.collabService.leaveRoom(roomInfo.roomName).then(ret => {
      if (ret) {
        roomInfo.joinedRoom = false;
        roomInfo.participants = [];
        this.updateParticipants();
      } else {
        console.warn('Failed to leave room!');
      }
    });
  }

  get joinedRoom(): boolean {
    const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (!roomInfo) {
      return false;
    }
    return roomInfo.joinedRoom;
  }

  get participants(): Participant[] {
    const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (roomInfo) {
      return roomInfo.participants || [];
    }
    return [];
  }

  get socketId() {
    return this.collabService.socketId;
  }

  updateRoomByCurrentFile() {
    let fileInfo = RXCore.getCurrentFileInfo();
    let roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (!roomInfo) {
      roomInfo = {
        docId: fileInfo.name,
        roomName: fileInfo.name,
        joinedRoom: false,
        participants: [],
      };
      this.roomInfoArray.push(roomInfo);
    }
    // There is no docId, let's use filename for now
    this.activeDocId = fileInfo.name;
    // Need to refresh participants, because participants may change while this doc is inactive
    this.updateParticipants();
  }

  updateParticipants() {
    const roomInfo = this.roomInfoArray.find(info => info.docId === this.activeDocId);
    if (!roomInfo) {
      return;
    }
    this.collabService.getRoomParticipants(roomInfo.roomName);
  }
}
