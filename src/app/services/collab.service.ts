import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
// import { RxCoreService } from './rxcore.service';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

const MessageId = {
  JoinRoom: "JoinRoom",
  LeaveRoom: "LeaveRoom",
  ChatMessage: "ChatMessage",
  AddMarkup: "AddMarkup",
  UpdateMarkup: "UpdateMarkup",
  DeleteMarkup: "DeleteMarkup",
};

export interface CollabMessage {
  id: string;
  body: any;
}

@Injectable({
  providedIn: 'root'
})
export class CollabService {
  private apiUrl =  RXCore.Config.apiBaseURL;
  private ROOM_MESSAGE = "roomMessage";

  private socket: Socket;
  // a user can only join one room now!
  private roomName: string;
  private username: string;

  private _isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isCollabActive$: Observable<boolean> = this._isActive.asObservable();


  constructor() {
  }

  //constructor(roomName: string, username?: string) {
    
  public connect(roomName: string, username?: string){    
    const socket = io(this.apiUrl);
    this.socket = socket;
    this.roomName = roomName;
    this.username = username || '';



    socket.on('connect', () => {
      this.joinRoom();
    });
    socket.on('disconnect', () => {
      console.log(`[Collab] ${this.username} disconnected`);
    });
    socket.on(this.ROOM_MESSAGE, (msg) => {
      console.log(`[Collab] ${this.username} received message:`, msg);
      this.handleMessage(msg);
    });

    this._isActive.next(true);
  }

  setUsername(username: string) {
    this.username = username;
  }

  private sendMessage(msg: CollabMessage) {
    if (this.socket.connected) {
      this.socket.emit(this.ROOM_MESSAGE, this.roomName, msg);
    }
  }

  private handleMessage(message: CollabMessage) {
    const msgId = message.id;
    const msgBody = message.body;

    if (msgId === MessageId.ChatMessage) {
        console.log(`[Collab] ChatMessage: ${msgBody.text}`);
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
          annoJson.operation = operation;
          annotation = JSON.stringify(annoJson);
        }
        // It's possible that another user doesn't initialize RXCore yet, so we need to check
        if (RXCore.setUniqueMarkupfromJSON) {
          RXCore.setUniqueMarkupfromJSON(annotation, null);
        }
      }
    }
  }

  private joinRoom() {
    const senderSocketId = this.socket.id;
    this.sendMessage({ id: MessageId.JoinRoom, body: { senderSocketId }});
  }

  private leaveRoom() {
    const senderSocketId = this.socket.id;
    this.sendMessage({ id: MessageId.LeaveRoom, body: { senderSocketId }});
  }

  private sendChatMessage(text: string) {
    const senderSocketId = this.socket.id;
    this.sendMessage({ id: MessageId.ChatMessage, body: { senderSocketId, text }});
  }

  public sendMarkupMessage(annotation: any, operation: any) {
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
    this.sendMessage({ id, body: { annotation, operation }});
  }
}
