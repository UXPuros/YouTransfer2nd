import { WebsocketService, wsMessages } from './websocket.service';

import { Injectable } from '@angular/core';
import { Peer2peerService } from './peer2peer.service';
import { availableFile } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  fileOffers: availableFile[] = []

  // allFiles:availableFile

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


  download(owner:string){
    this.p2p.getMofoConnection(owner)
  }
  
  

  
}
