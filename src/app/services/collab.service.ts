import { Injectable } from '@angular/core';
import { RXCore } from 'src/rxcore';
// import { RxCoreService } from './rxcore.service';
import { io, Socket } from 'socket.io-client';

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
  private apiUrl = 'http://viewserver.rasterex.com:8080/';
  //private apiUrl = 'http://localhost:8080/';
  private ROOM_MESSAGE = "roomMessage";

  private socket: Socket;
  // a user can only join one room now!
  private roomName: string;

  constructor(roomName: string, userName?: string) {
    console.log(`[Collab] userName: ${userName}, roomName: ${roomName}`);

    const socket = io(this.apiUrl);
    this.socket = socket;
    this.roomName = roomName;

    socket.on('connect', () => {
      this.joinRoom();
    });
    socket.on('disconnect', () => {
      console.log(`[Collab] ${userName} disconnected`);
    });
    socket.on(this.ROOM_MESSAGE, (msg) => {
      console.log(`[Collab] ${userName} received message:`, msg);
      this.handleMessage(msg);
    });
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
        if (RXCore.setMarkupfromJSON) {
          RXCore.setMarkupfromJSON(annotation);
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
