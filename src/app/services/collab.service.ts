import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
// import { RxCoreService } from './rxcore.service';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

const MessageId = {
  JoinRoom: "JoinRoom",
  LeaveRoom: "LeaveRoom",
  GetRoomParticipants: "GetRoomParticipants",
  ChatMessage: "ChatMessage",
  AddMarkup: "AddMarkup",
  UpdateMarkup: "UpdateMarkup",
  DeleteMarkup: "DeleteMarkup",
};

export interface CollabMessage {
  id: string;
  roomName: string;
  body: {
    senderSocketId?: string;
    senderUsername?: string;
    senderDisplayName?: string;
    participants?: Participant[];
    text?: string;
    annotation?: any;
    operation?: any;
  };
}

export interface Participant {
  socketId: string;
  username: string;
  displayName: string;
}

export interface RoomParticipants {
  roomName?: string;
  participants?: Participant[];
}

@Injectable({
  providedIn: 'root'
})
export class CollabService {
  private apiUrl =  RXCore.Config.apiBaseURL;
  private ROOM_MESSAGE = "roomMessage";

  private socket: Socket;
  private username: string;
  private displayName: string;

  // used to avoid re-entry
  private initPromise: Promise<boolean> | undefined = undefined;
  // private _isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public isCollabActive$: Observable<boolean> = this._isActive.asObservable();
  private _roomParticipantsChange: BehaviorSubject<RoomParticipants> = new BehaviorSubject<RoomParticipants>({});
  public roomParticipantsChange$: Observable<RoomParticipants> = this._roomParticipantsChange.asObservable();

  constructor() {
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
        // console.log(`[Collab] ${this.username} connected`);
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
        // console.log(`[Collab] ${this.username} disconnected`);
      });
      socket.on(this.ROOM_MESSAGE, (msg) => {
        // console.log(`[Collab] ${this.username} received message:`, msg);
        this.handleMessage(msg);
      });
    });

    return this.initPromise;
  }

  setUsername(username: string, displayName = '') {
    this.username = username;
    this.displayName = displayName;
  }

  get socketId() {
    return this.socket?.id || '';
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

  private handleMessage(message: CollabMessage) {
    const msgId = message.id;
    const msgBody = message.body;

    if (msgId === MessageId.GetRoomParticipants) {
      // console.log(`[Collab] GetRoomParticipants: ${msgBody.participants}`)
      const roomParticipants = {
        roomName: message.roomName,
        participants: msgBody.participants,
      }
      this._roomParticipantsChange.next(roomParticipants);
    } else if (msgId === MessageId.ChatMessage) {
      // console.log(`[Collab] ChatMessage: ${msgBody.text}`);
    } else if (
      msgId === MessageId.AddMarkup ||
      msgId === MessageId.UpdateMarkup ||
      msgId === MessageId.DeleteMarkup
    ) {
      let annotation = msgBody.annotation;
      const operation = msgBody.operation;
      if (annotation && operation) {
        // Need to parse string to json, then check its 'operation' field and set a proper value
        const annoJson = JSON.parse(annotation);
        if (!annoJson.operation) {
          // Why operation can be null?
          //annoJson.operation = operation;
          //annotation = JSON.stringify(annoJson);
        }
        // It's possible that another user doesn't initialize RXCore yet, so we need to check
        if (RXCore.setUniqueMarkupfromJSON) {
          RXCore.setUniqueMarkupfromJSON(annotation, null);
        }
      }
    }
  }

  public async joinRoom(roomName: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.JoinRoom, roomName, body: { }});
    return Promise.resolve(true);
  }

  public async leaveRoom(roomName: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.LeaveRoom, roomName, body: { }});
    return Promise.resolve(true);
  }

  public async getRoomParticipants(roomName: string): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      const result = await this.init();
      if (!result) {
        return Promise.resolve(false);
      }
    }
    this.sendMessage({ id: MessageId.GetRoomParticipants, roomName, body: { }});
    return Promise.resolve(true);
  }

  private sendChatMessage(roomName: string, text: string) {
    this.sendMessage({ id: MessageId.ChatMessage, roomName, body: { text }});
  }

  public sendMarkupMessage(roomName: string, annotation: any, operation: any) {
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
    this.sendMessage({ id, roomName, body: { annotation, operation }});
  }
}
