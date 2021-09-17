import { Component } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'peertest';

  

  constructor(public ws:WebsocketService){

    // this.ws.distributeFile()
    

  }

  fileSet(e:Event){
    const fileInput = e.target as HTMLInputElement
    if(!fileInput.files || !fileInput.files.length){
      return
    }
    const choosenFile = fileInput.files[0]

    

    this.ws.distributeFile(choosenFile)
    fileInput.value = ''

    

  }

}
