import { Peer2peerService } from './peer2peer.service';
import { Component, OnDestroy } from '@angular/core';
import { WebsocketService, wsMessages } from './websocket.service';
import { Subscription } from 'rxjs';

interface FileOffer {
  file: availableFile
  peer2peer: Peer2peerService
}

// interface wsFileListMsg extends wsGenericMsg {
//   data: availableFile[]
// }

export interface availableFile {
  owner: string;
  type: string;
  size: number;
  name: string;
  id: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'peertest';

  fileOffers: availableFile[] = []
  fillOffersSubscription: Subscription;

  constructor(public ws: WebsocketService) {
    this.fillOffersSubscription = this.ws.messages.subscribe((wsMessage) => {
      if (wsMessage.type == wsMessages.ALLFILES) {
        this.fileOffers = wsMessage.data as availableFile[]
      }
    })
  }

  fileSet(e: Event) {
    const fileInput = e.target as HTMLInputElement
    if (!fileInput.files || !fileInput.files.length) {
      return
    }
    const choosenFile = fileInput.files[0]
    choosenFile.lastModified

    this.ws.sendFileOffering(`F${choosenFile.lastModified}`, choosenFile.name, choosenFile.size, choosenFile.type)
    fileInput.value = ''

  }

  download() {

  }

  deleteFile(fileId: string) {

    this.ws.revoqueFileOffering(fileId)

  }

  ngOnDestroy() {
    this.fillOffersSubscription.unsubscribe()
  }

}
