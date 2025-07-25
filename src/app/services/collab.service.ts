import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
// import { RxCoreService } from './rxcore.service';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { TooltipService } from 'src/app/components/tooltip/tooltip.service';
import { AnnotationStorageService } from './annotation-storage.service';

const MessageId = {
  JoinRoom: "JoinRoom",
  LeaveRoom: "LeaveRoom",
  CreateRoom: "CreateRoom",
  DeleteRoom: "DeleteRoom",
  GetAllRooms: "GetAllRooms",
  GetRoomsByDocId: "GetRoomsByDocId",
  GetRoomParticipants: "GetRoomParticipants",
  ChatMessage: "ChatMessage",
  HasMarkupForRoom: "HasMarkupForRoom",
  DeleteMarkupsForRoom: "DeleteMarkupsForRoom",
  AddMarkup: "AddMarkup",
  UpdateMarkup: "UpdateMarkup",
  DeleteMarkup: "DeleteMarkup",
  // Markup added by non-collaboration users
  NotifyAddingMarkup: "NotifyAddingMarkup",
};

export interface CollabMessage {
  id: string;
  // Used by doc relative message, CreateRoom, GetRoomsByDocId, etc.
  docId?: string;
  // Used by room relative message, LeaveRoom, GetRoomParticipants, etc.
  roomId?: string;
  body: {
    result?:boolean;
    senderSocketId?: string;
    senderUsername?: string;
    senderDisplayName?: string;
    participants?: Participant[];
    text?: string;
    annotation?: any;
    operation?: any;
    data?: any;
  };
}

export interface Participant {
  socketId: string;
  username: string;
  displayName: string;
}

export interface RoomParticipants {
  roomId?: string;
  participants?: Participant[];
}

@Injectable({
  providedIn: 'root'
})
export class CollabService {
  private apiUrl =  RXCore.Config.apiBaseURL;
  private ROOM_MESSAGE = "roomMessage";
  private ROOM_MESSAGE_ACK = "roomMessageWithAck";

  private roomId: string = ''; // Current room id, used to send messages to the current room
  private triggerSync = true; // setUniqueMarkupfromJSON will trigger sync if this is true, otherwise it won't sync the markup to the server
  private triggerMeasureScaleSync = true; // setMeasureScale will trigger sync if this is true, otherwise it won't sync the measure scale to the server

  private socket: Socket;
  private username: string;
  private displayName: string;

  // used to avoid re-entry
  private initPromise: Promise<boolean> | undefined = undefined;
  // private _isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public isCollabActive$: Observable<boolean> = this._isActive.asObservable();
  // room created event
  private _roomCreate: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public roomCreate$: Observable<string> = this._roomCreate.asObservable();

  private _roomDelete: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public roomDelete$: Observable<string> = this._roomDelete.asObservable();

  private _documentRoomsChange: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public documentRoomsChange$: Observable<string[]> = this._documentRoomsChange.asObservable();

  private _roomParticipantsChange: BehaviorSubject<RoomParticipants> = new BehaviorSubject<RoomParticipants>({});
  public roomParticipantsChange$: Observable<RoomParticipants> = this._roomParticipantsChange.asObservable();

  private _chatMessageChange: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public chatMessageChange$: Observable<any> = this._chatMessageChange.asObservable();

  constructor(private readonly tooltipService: TooltipService,
              private readonly annotationStorageService: AnnotationStorageService
  ) {
  }

  private async init(): Promise<boolean> {
    // avoid re-entry
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.socket && this.socket.connected) {
      return Promise.resolve(true);
    }

    const socket = io(this.apiUrl, {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000 // 1 second
    });
    this.socket = socket;

    this.initPromise = new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log(`[Collab] ${this.username} connected`);
        resolve(true);
        this.initPromise = undefined;
      });
      socket.on('connect_timeout', (timeout) => {
        console.error(`[Collab] Connection timed out after ${timeout}ms`);
        reject(new Error('Connection timed out'));
        this.initPromise = undefined;
      });
      socket.on('error', (error) => {
        console.error(`[Collab] An error occurred: ${error.message}`);
        reject(error);
        this.initPromise = undefined;
      });
      socket.on('connect_error', (error) => {
        console.error(`[Collab] Connection failed: ${error.message}`);
        reject(error);
        this.initPromise = undefined;
      });
      socket.on('disconnect', () => {
        console.log(`[Collab] ${this.username} disconnected`);
      });
      socket.on(this.ROOM_MESSAGE, (msg) => {
        console.log(`[Collab] ${this.username} received message:`, msg);
        this.handleMessage(msg);
      });
      socket.on(this.ROOM_MESSAGE_ACK, (msg, callback) => {
        console.log(`[Collab] ${this.username} received message with ack:`, msg);
        console.warn('[Collab] Message with ack is not implemented yet!');
        this.handleMessage(msg);
      });
    });

    return this.initPromise;
  }

  setUsername(username: string, displayName = '') {
    this.username = username;
    this.displayName = displayName;
  }

  getRoomId(): string {
    return this.roomId;
  }

  resetRoomId() {
    this.roomId = '';
  }

  getDocId(): string {
    const path = RXCore.getOriginalPath();
    return path;
  }

  getDefaultRoomId(docId: string): string {
    return `${docId}_default_room`;
  }

  async getAnnotationsFromDb(roomId?:string) {
      const docId = this.getDocId();
      if (!docId) {
        return [];
      }
      const annotations = await this.annotationStorageService.getAnnotations(1, docId, roomId);
      return annotations;
  }
  
  async removeAnnotationsFromViewport(roomId?:string) {
    const annotations = await this.getAnnotationsFromDb(roomId);
    this.triggerSync = false;
    annotations.forEach((annotation)=>{
      if (!annotation || !annotation.data) {
        return;
      }
      const markupObj = JSON.parse(annotation.data);
      const markupUniqueID = !markupObj.Entity.UniqueID ? null : markupObj.Entity.UniqueID;
      if (!markupUniqueID) {
        console.warn('[Collab] Annotation does not have a UniqueID:', annotation);
        return;
      }
      RXCore.deleteMarkupbyGUID(markupUniqueID);
    });
    this.triggerSync = true;
  }

  /**
   * Adds annotations to viewport.
   * If no roomId is passed in, will get annotations doesn't belong to any room.
   */
  async addAnnotationsToViewport(roomId?:string) {
    const annotations = await this.getAnnotationsFromDb(roomId);
    this.triggerSync = false;
    annotations.forEach((annotation)=>{

      if (RXCore.setUniqueMarkupfromJSON) {
        RXCore.setUniqueMarkupfromJSON(annotation.data, null);
      }
      const markupObj = JSON.parse(annotation.data);
      const markupUniqueID = !markupObj.Entity.UniqueID ? null : markupObj.Entity.UniqueID;

      let lastMarkup;
      if (markupUniqueID) {
        lastMarkup = RXCore.getmarkupobjByGUID(markupUniqueID);
      } else {
        lastMarkup = RXCore.getLastMarkup();
      }

      if (lastMarkup && lastMarkup != -1) {
        const markup = lastMarkup as any;
        markup.dbUniqueID = annotation.id;

        if (markup.bhasArrow && markup.markupArrowConnected) {
          markup.markupArrowConnected.dbUniqueID = annotation.id;
        } else if (markup.bisTextArrow && markup.textBoxConnected) {
          markup.textBoxConnected.dbUniqueID = annotation.id;
        }
      }
    });
    this.triggerSync = true;
  }

  get socketId() {
    return this.socket?.id || '';
  }

  needSync() {
    return this.triggerSync;
  }

  needMeasureScaleSync() {
    return this.triggerMeasureScaleSync;
  }

  setTriggerMeasureScaleSync(value: boolean) {
    this.triggerMeasureScaleSync = value;
  }


  private async sendMessage(msg: CollabMessage): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      await this.init();
    }
    if (this.socket.connected) {
      msg.body.senderSocketId = this.socket.id;
      msg.body.senderUsername = this.username;
      msg.body.senderDisplayName = this.displayName;
      this.socket.emit(this.ROOM_MESSAGE, msg);
    }
  }

  private async sendMessageWithAck(msg: CollabMessage): Promise<any> {
    if (!this.socket || !this.socket.connected) {
      await this.init();
    }
    if (this.socket.connected) {
      msg.body.senderSocketId = this.socket.id;
      msg.body.senderUsername = this.username;
      msg.body.senderDisplayName = this.displayName;
      return this.socket.emitWithAck(this.ROOM_MESSAGE_ACK, msg);
    }
  }

  private handleMessage(message: CollabMessage, callback?: (response: any) => void): void {
    const msgId = message.id;
    const msgBody = message.body;

    if (msgId === MessageId.JoinRoom) {
      const roomParticipants = {
        roomId: message.roomId,
        participants: msgBody.participants,
      }
      this._roomParticipantsChange.next(roomParticipants);
    } else if (msgId === MessageId.LeaveRoom) {
      const roomParticipants = {
        roomId: message.roomId,
        participants: msgBody.participants,
      }
      this._roomParticipantsChange.next(roomParticipants);
    } else if (msgId === MessageId.CreateRoom) {
      // When a new room is created, the backend should fill in the roomId
      this._roomCreate.next(message.roomId as string);
    } else if (msgId === MessageId.DeleteRoom) {
      this._roomDelete.next(message.roomId as string);
    } else if (msgId === MessageId.GetAllRooms) {
      // GetAllRooms shouldn't be called by the client, but by the admin user
      // to debug the backend. So we just log it.
      console.log('[Collab] GetAllRooms:', (msgBody as any).rooms);
    } else if (msgId === MessageId.GetRoomsByDocId) {
      console.log('[Collab] GetRoomsByDocId:', (msgBody as any).rooms);
    } else if (msgId === MessageId.GetRoomParticipants) {
      // console.log(`[Collab] GetRoomParticipants: ${msgBody.participants}`)
      const roomParticipants = {
        roomId: message.roomId,
        participants: msgBody.participants,
      }
      this._roomParticipantsChange.next(roomParticipants);
    } else if (msgId === MessageId.ChatMessage) {
      console.log(`[Collab] ChatMessage: ${msgBody}`);
      this._chatMessageChange.next(msgBody);
    } else if (msgId === MessageId.HasMarkupForRoom) {
      // do nothing
    } else if (msgId === MessageId.DeleteMarkupsForRoom) {
      // Fistly, clear all annotations (including ones doesn't belong to any room and ones beong to active room)
      RXCore.clearMarkup();
      // Add back annotations doesn't belong to any room
      this.addAnnotationsToViewport("");
    } else if (
      msgId === MessageId.AddMarkup ||
      msgId === MessageId.UpdateMarkup ||
      msgId === MessageId.DeleteMarkup
    ) {
      const annotation = msgBody.annotation;
      const operation = msgBody.operation;
      if (annotation && operation) {
        // Need to parse string to json, then check its 'operation' field and set a proper value
        const annoJson = JSON.parse(annotation);
        if (!annoJson.operation) {
          // Why operation can be null?
          //annoJson.operation = operation;
          //annotation = JSON.stringify(annoJson);
        }
        this.triggerSync = false;
        // It's possible that another user doesn't initialize RXCore yet, so we need to check
        if (RXCore.setUniqueMarkupfromJSON) {
          RXCore.setUniqueMarkupfromJSON(annotation, null);
        }
        this.triggerSync = true;

        if (msgId === MessageId.AddMarkup) {
          this.ShowTooltip(msgBody);
        }
      }
    } else if (msgId === MessageId.NotifyAddingMarkup) {
        const data = msgBody.data;
        if (!data || data.room_id != '') { // Ignore if room_id is not empty
          return;
        }
        this.triggerSync = false;
        if (RXCore.setUniqueMarkupfromJSON && data.data) {
          RXCore.setUniqueMarkupfromJSON(data.data, null);
        }
        this.triggerSync = true;
    }
  }

  private ShowTooltip(message: any) {
    this.tooltipService.tooltip({
      title: 'Add Annotation',
      message: `UserName: ${message.senderUsername}`,
      duration: 3000,
      position: [window.innerWidth / 2.0, 0],
    });
  }

  public async joinRoom(roomId: string): Promise<boolean> {
    if (this.roomId === roomId) {
      return Promise.resolve(true);
    }

    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }

    if (this.roomId) {
      await this.removeAnnotationsFromViewport(this.roomId);
    }

    if (roomId) {
      await this.addAnnotationsToViewport(roomId);
    }
    this.roomId = roomId;

    this.sendMessage({ id: MessageId.JoinRoom, roomId, body: { }});
    return Promise.resolve(true);
  }

  public async leaveRoom(roomId: string): Promise<boolean> {
    if (this.roomId !== roomId) {
      console.warn(`[Collab] Cannot leave room ${roomId}, not currently joined.`);
      return Promise.resolve(false);
    }
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }

    if (this.roomId) {
      await this.removeAnnotationsFromViewport(this.roomId);
    }
    this.roomId = "";

    this.sendMessage({ id: MessageId.LeaveRoom, roomId, body: { }});
    return Promise.resolve(true);
  }

  /**
   * Creates a new room for the given docId.
   * The backend should create a room with a unique name and send a message back to frontend.
   * The frontend should listen to the roomCreate$ observable to get the room id.
   */
  public async createRoom(docId: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.CreateRoom, docId, body: { }});
    return Promise.resolve(true);
  }

  /**
   * Deletes a room.
   * Caller should make sure that the roomId exists.
   */
  public async deleteRoom(roomId: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.DeleteRoom, docId: this.getDocId(), roomId, body: { }});
    return Promise.resolve(true);
  }

  public async hasMarkupForRoom(roomId: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    const res = await this.sendMessageWithAck({ id: MessageId.HasMarkupForRoom, roomId, body: { }});
    return res.body?.result || false;
  }

  public async deleteMarkupsForRoom(roomId: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.DeleteMarkupsForRoom, roomId, body: { }});
    return Promise.resolve(true);
  }

  /**
   * Gets all rooms of all documents. This can be used by admin user to debug backend
   */
  public async getAllRooms(): Promise<any> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    const res = await this.sendMessageWithAck({ id: MessageId.GetAllRooms, body: { }});
    return res.body?.rooms || [];
  }

  /**
   * Gets rooms relative to this document.
   */
  public async GetRoomsByDocId(docId: string): Promise<any> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    const res = await this.sendMessageWithAck({ id: MessageId.GetRoomsByDocId, docId, body: { }});
    return res.body?.rooms || [];
  }

  public async getRoomParticipants(roomId: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.GetRoomParticipants, roomId, body: { }});
    return Promise.resolve(true);
  }

  /*private sendChatMessage(roomId: string, text: string) {
    this.sendMessage({ id: MessageId.ChatMessage, roomId, body: { text }});
  }*/

  public sendChatMessage(roomId: string, body: any) {
    this.sendMessage({ id: MessageId.ChatMessage, roomId, body});
  }


  public sendMarkupMessage(roomId: string, annotation: any, operation: any) {
    let id = '';
    if (operation.created) {
      id = MessageId.AddMarkup;
    } else if (operation.deleted) {
      id = MessageId.DeleteMarkup;
    } else if (operation.modified) {
      id = MessageId.UpdateMarkup;
    } else {
      console.warn(`[Collab] Unknown operation:`, operation);
      return;
    }
    this.sendMessage({ id, roomId, body: { annotation, operation }});
  }
}
