import { WebsocketService, wsMessages } from './websocket.service';

import { Injectable } from '@angular/core';
import { Peer2peerService } from './peer2peer.service';
import { availableFile } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  fileOffers: availableFile[] = []

  allFiles:availableFile[] = []

  constructor(private ws:WebsocketService, private p2p:Peer2peerService) { 

    this.ws.messages.subscribe((wsMessage) => {
      if (wsMessage.type == wsMessages.ALLFILES) {
        this.fileOffers = wsMessage.data as availableFile[]
      }

    })

  }


  fileOffer(file: File) {

    this.ws.sendFileOffering(`F${file.lastModified}`, file.name, file.size, file.type)

  }


  async download(owner:string, fileId: string){

    // let myPeer=this.p2p.getMofoConnection(owner)

    // let dataChannel = myPeer.openDataChannel(fileId)

    // dataChannel.onopen = () =>{ 
    //   // dataChannel.onmessage
    //   dataChannel.send('hello') 
    // }
    
    const channel = await this.p2p.giveMeAChannel(owner,fileId);

    console.log(`%c Got the channel "${fileId}"!`, "background: pink;padding: 10px; color:white;");
    console.log(channel)
  }

  deleteFile(fileId: string) {

    this.ws.revoqueFileOffering(fileId)

  }

  get myId() {
    return this.ws.myId
  }
  
  

  
}
