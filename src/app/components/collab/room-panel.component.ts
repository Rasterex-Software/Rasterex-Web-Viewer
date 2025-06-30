import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { User, UserService } from '../user/user.service';
import { CollabService, Participant, RoomParticipants } from 'src/app/services/collab.service';
import { TopNavMenuService } from '../top-nav-menu/top-nav-menu.service';

interface RoomInfo {
  docId: string;
  roomId: string;
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

  // Each document may have multiple rooms. A user can only join one room for each document.
  // A user can only join one room at a time for all documents.
  // We need to save the room info for current document.
  roomInfoArray: Array<RoomInfo> = [];
  user: User | null = null;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly userService: UserService,
    private readonly collabService: CollabService,
    private readonly topNavMenuService: TopNavMenuService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit(): void {
    this.canCollaborate =  this.rxCoreService.IsCollaboration();
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;
    });

    this.rxCoreService.guiState$.subscribe(state => {
      //not sure if this should be re-instated.
    });

    this.userService.currentUser$.subscribe((user) => {

      if (!this.canCollaborate) {
        return;
      }

      const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
      // If user changed or logout, leave room first
      if (roomInfo) {
        this.leaveRoom();
        roomInfo.joinedRoom = false;
        roomInfo.participants = [];
      }
      this.user = user;
      this.collabService.setUsername(user?.username || '', user?.displayName || '');
    });

    this.collabService.roomParticipantsChange$.subscribe((roomParticipants: RoomParticipants) => {

      if (!this.canCollaborate) {
        return;
      }

      // if the change is for active room, then handle it. Otherwise, ignore it.
      const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
      if (roomInfo) {
        if (roomInfo.roomId === roomParticipants.roomId) {
          roomInfo.participants = roomParticipants.participants || [];
          roomInfo.participants.sort((a, b) => {
            return a.displayName.toLowerCase() >= b.displayName.toLowerCase() ? 1: -1
          });
        }
      }
    })

    this.topNavMenuService.activeFile$.subscribe((file) => {
      if (this.guiConfig?.localStoreAnnotation === false || this.canCollaborate) {
        // fistly, clear the current file's annotations
        RXCore.clearMarkup();
        // Add annotations int the empty room to the viewport when the file is loaded.
        this.collabService.addAnnotationsToViewport("");
      }

      if (!this.canCollaborate) {
        return;
      }
      this.roomInfoArray = [];

      if (this.rxCoreService.IsDocumentCollaboration()) {
        // this.updateRoomByCurrentFile();
        console.log('IsDocumentCollaboration');
      } else {
        this.updateRoomList().then(() => {
        //this.collabService.resetRoomId();
        this.joinRoom().then(() => {
          this.updateRoomList();
        });
      });
      }
    });

    this.collabService.roomCreate$.subscribe((roomId: string) => {
      const docId = this.collabService.getDocId();
      if (docId) {
        this.updateRoomList();
      }
    });
    this.collabService.roomDelete$.subscribe((roomId: string) => {
      const docId = this.collabService.getDocId();
      if (docId) {
        this.updateRoomList();
      }
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

  getDisplayRoomId(roomId: string): string {
    let text = roomId.substring(roomId.indexOf("_") + 1);
    text = text.replace(/_/g, ' ');
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text;
  }

  async getAllRooms() {
    const rooms = await this.collabService.getAllRooms();
    rooms.sort((a, b) => a.roomId.localeCompare(b.roomId));
    console.log(`All existing rooms:`, rooms);
  }

  async createRoom() {
    const docId = this.collabService.getDocId();
    if (!docId) {
      console.warn("Invalid docId!")
      return;
    }
    // pass in docId, the backend should create a room with unique name and
    // send message back to all participants of this document.
    await this.collabService.createRoom(docId);
    this.updateRoomList();
  }

  async deleteRoom(roomId: string) {
    await this.collabService.deleteRoom(roomId);
    this.updateRoomList();
  }

  async hasMarkupForRoom(roomId: string): Promise<boolean> {
    // We can't keep calling this from UI!
    // return this.collabService.hasMarkupForRoom(roomId);
    return true;
  }

  async deleteMarkupsForRoom(roomId: string) {
    await this.collabService.removeAnnotationsFromViewport(roomId);
    const result = await this.collabService.deleteMarkupsForRoom(roomId);
    console.log(`deleteMarkupsForRoom ${roomId} result: ${result}`);
  }

  async joinRoom(roomId?: string) {
    if (!this.canCollaborate) {
      return;
    }
    const docId = this.collabService.getDocId();
    if (!docId) {
      return;
    }

    let roomId2 = roomId;
    if (!roomId2) {
      roomId2 = this.collabService.getDefaultRoomId(docId);
    }

    // Firstly, leave the current room if any
    let roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
    if (roomInfo) {
      this.leaveRoom();
    }

    // Then, find or create the room info for the new room
    roomInfo = this.roomInfoArray.find(info => info.roomId === roomId2);
    if (!roomInfo) {
      roomInfo = {
        docId,
        roomId: roomId2,
        joinedRoom: false,
        participants: [],
      };
      this.roomInfoArray.push(roomInfo);
    }

    const ret = await this.collabService.joinRoom(roomInfo.roomId);
    roomInfo.joinedRoom = ret;
    this.updateParticipants(roomInfo.roomId);
  }

  async leaveRoom() {
    const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
    if (!roomInfo) {
      return;
    }
    const ret = await this.collabService.leaveRoom(roomInfo.roomId);
    if (ret) {
      roomInfo.joinedRoom = false;
      roomInfo.participants = [];
      this.updateParticipants(roomInfo.roomId);
    } else {
      console.warn('Failed to leave room!');
    }
  }

  get joinedRoom(): boolean {
    const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
    return !!(roomInfo && roomInfo.joinedRoom);
  }

  get participants(): Participant[] {
    const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
    if (roomInfo) {
      return roomInfo.participants || [];
    }
    return [];
  }

  get socketId() {
    return this.collabService.socketId;
  }

  get activeRoomId(): string {
    const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
    return roomInfo?.roomId || '';
  }

  isActiveRoom(roomId: string): boolean {
    return this.activeRoomId === roomId;
  }

  async updateRoomList() {
    if (!this.canCollaborate) {
      return;
    }

    const docId = this.collabService.getDocId();
    if (!docId) {
      console.warn("Invalid docId!")
      return;
    }
    const rooms = await this.collabService.GetRoomsByDocId(docId);
    console.log(`Rooms for doc '${docId}':`, rooms);
    // if there is no any room for this document, we should fill in a default room
    if (!rooms || rooms.length === 0) {
      console.log(`No rooms found for document ${docId}, adding a default room.`);
      rooms.push({ roomId: this.collabService.getDefaultRoomId(docId) });
    }
    const activeRoomId = this.roomInfoArray.find(info => info.joinedRoom)?.roomId || '';
    this.roomInfoArray = rooms.map(room => {
      return {
        docId,
        roomId: room.roomId,
        joinedRoom: activeRoomId && activeRoomId === room.roomId,
        participants: room.participants || [],
      };
    });
    this.roomInfoArray.sort((a, b) => {
      if (this.isDefaultRoom(a.roomId)) {
        return -1;
      } else if (this.isDefaultRoom(b.roomId)) {
        return 1;
      }
      return a.roomId.localeCompare(b.roomId);
    });
    const bExisted = rooms.find(room => {
      return room.roomId === activeRoomId;
    }) != undefined;
    if (activeRoomId && !bExisted) {
      // If the active room is not in the room list, we should reset the room id.
      this.collabService.resetRoomId();
      // fistly, clear the current file's annotations
      RXCore.clearMarkup();
      // Add annotations int the empty room to the viewport when the file is loaded.
      await this.collabService.addAnnotationsToViewport("");
    }

    this.updateParticipants(activeRoomId);
  }

  updateParticipants(roomId: string) {
    if (!roomId) {
      return;
    }
    this.collabService.getRoomParticipants(roomId);
  }

  public isAdmin() {
    return this.user && this.user.username === 'admin';
  }

  public isDefaultRoom(roomId: string): boolean {
    return roomId.endsWith("default_room");
  }
}
