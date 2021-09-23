import { TransferService } from './transfer.service';
import { Peer2peerService } from './peer2peer.service';
import { Component } from '@angular/core';

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
export class AppComponent {
  title = 'peertest';

  fileOffers: availableFile[] = []
  uploadedFiles: [] = []
  


  constructor(public ts: TransferService) {
    // console.log(ts.fileOffers)

  }

  fileSet(e: Event) {
    const fileInput = e.target as HTMLInputElement
    if (!fileInput.files || !fileInput.files.length) {
      return
    }
    const choosenFile = fileInput.files[0]
    this.ts.fileOffer(choosenFile)
    fileInput.value = ''

  }


  download(owner: string, fileId: string) {
    
    this.ts.download(owner, fileId)

    // let ownership : boolean = false
    // if(owner==this.ts.myId){
    //   console.log('owner', owner)
    //   console.log('this.ts.myId', this.ts.myId)
    // }

  }


  deleteFile(fileId:string) {
    this.ts.deleteFile(fileId)
  }

  iOwnThisFile(owner:string) : boolean{
    return !(this.ts.myId==owner) 
  }
  iDontOwnThisFile(owner:string) : boolean{
    return (this.ts.myId==owner) 
  }

}
