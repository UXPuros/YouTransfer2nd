import { Peer2peerService } from './peer2peer.service';
import { Component } from '@angular/core';
import { WebsocketService, availableFile } from './websocket.service';

interface FileOffer{
  file: availableFile
  peer2peer: Peer2peerService
  
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'peertest';

  fileOffers=[]  

  constructor(public ws:WebsocketService){

  }

  fileSet(e:Event){
    const fileInput = e.target as HTMLInputElement
    if(!fileInput.files || !fileInput.files.length){
      return
    }
    const choosenFile = fileInput.files[0]
    choosenFile.lastModified

    this.ws.sendFileOffering(`F${choosenFile.lastModified}`, choosenFile.name, choosenFile.size, choosenFile.type)
    fileInput.value = ''

  }

  upload(){

  }

  deleteFile(fileId: string){

    this.ws.revoqueFileOffering(fileId)

  }

}
