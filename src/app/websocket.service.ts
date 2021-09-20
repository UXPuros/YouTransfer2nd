import { Injectable } from '@angular/core';

enum wsMessages {
  ID = 'myid',
  MSG = 'msg',
  HANDSHAKE = 'handshake',
  ALLFILES = 'files',
  FILEREQUEST = 'filereq',
  FILESEND = 'filesend', 
  CANCEL = 'filecancel'
}

interface wsGenericMsg {
  type: wsMessages;
  data: any;
}
interface wsDirectMsg extends wsGenericMsg {
  to: string;
  from: string;
  message: string;
}
export interface wsHandshakeMsg extends Omit<wsDirectMsg, 'message'> {
  message: {
    stage: number;
    data: string | null
  }
}
interface wsFileListMsg extends wsGenericMsg {
  data: availableFile[]
}

export interface availableFile {
  owner: string;
  type: string;
  size: number;
  name: string;
  id: string;
}


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private _ws: WebSocket = new WebSocket("ws://77.54.205.151/", ['json']);
  private _myId: string = '';
  allFiles: availableFile[] = []

  constructor() {

    this.ws.onmessage = this.receviedMessages.bind(this)
  }

  send(data: any) {
    this._ws.send(JSON.stringify(data))

  }

  requestFile(file: availableFile) {
    console.log(`give me "${file.name}"`)

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

  distributeFile(file: File) {
    console.log(`making "${file.name}" available`)

  }

  private receviedMessages(message: MessageEvent) {

    let parsed = JSON.parse(message.data) as wsGenericMsg
    // console.log(messagecount, message.data, parsed)

    switch (parsed.type) {
      case wsMessages.ID:
        this.processMyId(parsed)

        break;

      case wsMessages.MSG:
        this.processMsg(parsed as wsDirectMsg)

        break;

      case wsMessages.HANDSHAKE:
        this.processHandshakes(parsed as wsHandshakeMsg)

        break;

      case wsMessages.ALLFILES:
        this.processAllFiles(parsed as wsFileListMsg)

        break;

      default:
      // console.log(parsed);
    }

  }

  private processMyId(message: wsGenericMsg) {

    this._myId = message.data

    console.log(this.myId)


  }

  private processMsg(message: wsDirectMsg) {

  }

  private processHandshakes(message: wsHandshakeMsg) {


  }

  private processAllFiles(message: wsFileListMsg) {
    this.allFiles = message.data;
    console.log(this.allFiles)
  }

  get myId() {
    return this._myId
  }

  get ws() {
    return this._ws
  }

  getAllFiles() {
    return this.allFiles
  }

  sendHandshake(to: string, stage: number = 0, data: string | null = null) {

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

}

