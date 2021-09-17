import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

export class P2PTransfer{

  constructor() {


  }
   
}

@Injectable({
  providedIn: 'root'
})

export class Peer2peerService {

  peerConfig = {
    "iceServers": [{
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
     },] 
  }

  locals:RTCPeerConnection[] | undefined
  localChannel:RTCDataChannel | undefined ;


  constructor( private ws:WebsocketService ) { }




    
}

