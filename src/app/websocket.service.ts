
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum wsMessages {
  ID = 'myid',
  MSG = 'msg',
  HANDSHAKE = 'handshake',
  ALLFILES = 'files',
  FILEREQUEST = 'filereq',
  FILESEND = 'filesend', 
  CANCEL = 'filecancel',
  P2PSTART = 'p2pstart'
}

interface wsGenericMsg {
  type: wsMessages;
  data: any;
}
export interface wsDirectMsg extends wsGenericMsg {
  to: string;
  from: string;
  message: any;
}


export interface wsHandshakeMsg extends Omit<wsDirectMsg, 'message'> {
  message: {
    stage: number;
    data: string | null
  }
}


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private _ws: WebSocket = new WebSocket("ws://77.54.205.151/", ['json']);
  private _myId: string = '';
  private _messageSubject:Subject<wsDirectMsg> = new Subject<wsDirectMsg>();

  constructor() {
    this._ws.onmessage = this.receviedMessages.bind(this)
    this._ws.onclose = this.wsClosed.bind(this)
  }

  get myId() {
    return this._myId
  }

  get messages() {
    return this._messageSubject;
  }

  private wsClosed() {
    console.error('OMG Joao o que e que fizeste ao servidor ...!!!')
  }

  private receviedMessages(message: MessageEvent) {

    let parsed = JSON.parse(message.data) as wsGenericMsg

    if(parsed.type == wsMessages.ID) {
      this._myId = parsed.data
    
    }else{
      this._messageSubject.next(parsed as wsDirectMsg)
    }
  }

  private send(data: any) {
    this._ws.send(JSON.stringify(data))
  }

  sendFileOffering(fileId: string, fileName: string, fileSize: number, fileType: string) {
    const fileOfferMsg: wsGenericMsg = {
      type: wsMessages.FILESEND,
      data: {
        owner: this._myId,
        type: fileType,
        size: fileSize,
        name: fileName,
        id: fileId
      }
    }
    this.send(fileOfferMsg)
  }

  revoqueFileOffering(fileId: string){
    const fileCancel: wsGenericMsg = {
      type: wsMessages.CANCEL,
      data: fileId
    }
    this.send(fileCancel)
  }

  sendHandshake(to: string, stage: number = 0, data: any | null = null) {
    const request = {
      type: wsMessages.HANDSHAKE,
      to: to,
      from: this._myId,
      message: {
        stage: stage,
        data: data
      }
    }
    this.send(request)
  }


  sendPeerOrder(to: string ){
    const request = {
      type : wsMessages.P2PSTART,
      to: to,
      from: this._myId
    }
    this.send(request)
  }

}

