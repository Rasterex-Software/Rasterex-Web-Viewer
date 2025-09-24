import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';
import { User, UserService } from '../user/user.service';
import { CollabService, Participant, RoomIdNamePair, RoomInfo, RoomParticipants } from 'src/app/services/collab.service';
import { TopNavMenuService } from '../top-nav-menu/top-nav-menu.service';

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
  presenterConfirmDialogOpen: boolean = false;

  user: User | null = null;

  // Room name editing properties
  editingRoomId: string | null = null;
  editingRoomName: string = '';

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

      let bBlockOperation = false;

      // if the change is for active room, then handle it. Otherwise, ignore it.
      const roomInfo = this.roomInfoArray.find(info => info.joinedRoom);
      if (roomInfo) {
        if (roomInfo.roomId === roomParticipants.roomId) {
          roomInfo.participants = roomParticipants.participants || [];
          roomInfo.participants.sort((a, b) => {
            return a.displayName.toLowerCase() >= b.displayName.toLowerCase() ? 1: -1
          });
              // This indicates that the presenter already exists.
              if (roomInfo.participants.find(p => p.isPresenter)) {
                bBlockOperation = true;
              }
              if (this.collabService.isCurrentUserRoomPresenter()) {
                bBlockOperation = false;
              }
        }
      }
      RXCore.setCollabBlock(bBlockOperation);
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
      
      // fistly, clear the current file's annotations
      RXCore.clearMarkup();
      // Add annotations int the empty room to the viewport when the file is loaded.
      this.collabService.addAnnotationsToViewport("");

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

    this.collabService.roomNameUpdate$.subscribe((idNamePair: RoomIdNamePair) => {
      // simply update room list rather than updating the specific room name.
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

  /**
   * If there is roomName, use it.
   * If not, parse roomId (in format of "<docId>_room_<n>") to get the name.
   */
  getRoomName(roomId: string): string {
    // Check if we have roomName from the backend in roomInfoArray
    const roomInfo = this.roomInfoArray.find(info => info.roomId === roomId);
    if (roomInfo && roomInfo.roomName) {
      return roomInfo.roomName;
    }

    return this.parseRoomNameFromId(roomId);
  }

  /**
   * Parses roomId (in format of "<docId>_room_<n>") to get the name.
   */
  parseRoomNameFromId(roomId: string): string {
    let text = roomId.substring(roomId.indexOf("_") + 1);
    text = text.replace(/_/g, ' ');
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text;
  }


  // Start editing room name on double click
  startEditingRoomName(roomId: string): void {
    // Check if room name can be edited
    if (!this.canEditRoomName(roomId)) {
      if (!this.user) {
        console.log('Cannot edit room name: User not logged in');
      } else if (this.isDefaultRoom(roomId)) {
        console.log('Cannot edit default room name');
      } else if (!this.isActiveRoom(roomId)) {
        console.log('Cannot edit room name: Room is not active. You can only edit the name of the room you are currently in.');
      } else if (!this.collabService.isCurrentUserRoomPresenter()) {
        console.log('Cannot edit room name: Only the room presenter can rename the room');
      }
      return;
    }

    this.editingRoomId = roomId;
    this.editingRoomName = this.getRoomName(roomId);

    // Focus the input field after a short delay to ensure it's rendered
    setTimeout(() => {
      const inputElement = document.querySelector('.room-name-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 50);
  }

  // Save the edited room name
  async saveRoomName(): Promise<void> {
    if (!this.editingRoomId || !this.editingRoomName.trim()) {
      this.cancelEditingRoomName();
      return;
    }

    const roomId = this.editingRoomId;
    const roomName = this.editingRoomName.trim();

    try {
      // Send room name update to backend, which will broadcast to all participants
      const success = await this.collabService.updateRoomName(roomId, roomName);

      if (success) {
        console.log(`Room name update sent to backend for ${roomId}: ${roomName}`);
        // The actual UI update will happen when we receive the broadcast message
      } else {
        console.error(`Failed to update room name for ${roomId}`);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error updating room name:', error);
    }

    // Clear editing state
    this.editingRoomId = null;
    this.editingRoomName = '';
  }

  // Cancel editing room name
  cancelEditingRoomName(): void {
    this.editingRoomId = null;
    this.editingRoomName = '';
  }

  // Handle key events in the input field
  onRoomNameKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveRoomName();
    } else if (event.key === 'Escape') {
      this.cancelEditingRoomName();
    }
  }

  // Check if a room is currently being edited
  isEditingRoom(roomId: string): boolean {
    return this.editingRoomId === roomId;
  }

  // Check if a room name can be edited
  canEditRoomName(roomId: string): boolean {
    // Must be logged in
    if (!this.user) {
      return false;
    }

    // Cannot edit default room names
    if (this.isDefaultRoom(roomId)) {
      return false;
    }

    // Must be the presenter of the current active room
    // return this.collabService.isCurrentUserRoomPresenter();

    return true;
  }

  /**
   * Gets the tooltip text for the room name display.
   * Since user can edit the room name, we need to show the original name in the tooltip.
   * So the tooltip will be in format of "Custom Name (System assigned original Name)"
   */
  getRoomNameTooltip(roomId: string): string {
    if (!this.user) {
      return "Login required to edit";
    }

    let tooltip = "";
    let customName = "";
    const roomInfo = this.roomInfoArray.find(info => info.roomId === roomId);
    if (roomInfo && roomInfo.roomName) {
      customName = roomInfo.roomName;
    }
    let originalRoomName = this.parseRoomNameFromId(roomId);
    if (customName) {
      tooltip = `${customName} (${originalRoomName})`;
    } else {
      tooltip = originalRoomName;
    }

    if (this.isDefaultRoom(roomId)) {
      return `${tooltip} - Cannot be renamed`;
    }

    return `${tooltip} - Double click to edit`;
  }

  // Get CSS class for room name display
  getRoomNameCssClass(roomId: string): string {
    if (this.isDefaultRoom(roomId)) {
      return 'room-name-display default-room';
    }

    if (this.canEditRoomName(roomId)) {
      return 'room-name-display editable';
    }

    return 'room-name-display non-editable';
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
      await this.leaveRoom();
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
    // After leaving the room, the corresponding messages cannot be received.

    const ret = await this.collabService.leaveRoom(roomInfo.roomId);
    if (ret) {
      RXCore.setCollabBlock(false);
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

  get roomInfoArray(): Array<RoomInfo> {
    return this.collabService.getRoomInfoArray();
  }

  set roomInfoArray(roomInfoArray: Array<RoomInfo>) {
    this.collabService.setRoomInfoArray(roomInfoArray);
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
      const defaultRoomId = this.collabService.getDefaultRoomId(docId);
      rooms.push({ roomId: defaultRoomId, roomName: 'Default Room' });
    }
    const activeRoomId = this.roomInfoArray.find(info => info.joinedRoom)?.roomId || '';
    this.roomInfoArray = rooms.map(room => {
      return {
        docId,
        roomId: room.roomId,
        roomName: room.roomName,
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

  async setRoomPresenter(roomId: string) {
    if (!roomId) {
      return;
    }
    await this.collabService.setRoomPresenter(roomId);
    this.updateParticipants(roomId);
  }

  async removeRoomPresenter(roomId: string) {
    if (!roomId) {
      return;
    }
    await this.collabService.removeRoomPresenter(roomId);
    this.updateParticipants(roomId);
  }

  openPresenterConfirmDialog() {
    this.presenterConfirmDialogOpen = true;
  }

  public isAdmin() {
    return this.user && this.user.username === 'admin';
  }

  public isDefaultRoom(roomId: string): boolean {
    //return roomId.endsWith("default_room");
    return this.collabService.isDefaultRoom(roomId);
  }
}
