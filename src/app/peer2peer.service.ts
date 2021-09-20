import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';


export class P2PConnection{

  private RTCPC? : RTCPeerConnection
  peerConfig = {
    "iceServers": [{
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
     },] 
  }


  connection:RTCPeerConnection | undefined
  dataChannels:RTCDataChannel[] = [];


  from:string=''
  
  constructor(private remoteID : string, private ws: WebsocketService){
    this.from = ws.myId

  }

  startPeer(){
    this.RTCPC = this.createPeer(this.remoteID)
    this.ws.sendHandshake(this.remoteID)

  }

   

  private createPeer(target:string){
    let myPeer = new RTCPeerConnection(this.peerConfig) 
    myPeer.onicecandidate = (event) => {
      if (event.candidate) {
          this.sendIceCandidate(target,this.from, event.candidate)
      }
    }

    myPeer.ondatachannel = (event)=>{
      const dataChannel = event.channel

      dataChannel.onmessage = async (message)=>{
        console.log('received message', message)
      }
    }

    return myPeer
  }

  sendIceCandidate(to:string, from:string ,candidate:RTCIceCandidate) {
    this.ws.sendHandshake(this.remoteID, 4, candidate)
  }

}




export class P2PTransfer{



  constructor() {

  }
   
}

@Injectable({
  providedIn:'root'
})

export class Peer2peerService {

  

  constructor(private websock:WebsocketService) {  
    
    
  }


  // startPeer(to: string){
  //   this.myPeer = this.createPeer(this.target)
  //   this.websock.sendHandshake(to)
  // }


  // private createPeer(target:string){
  //   let myPeer = new RTCPeerConnection(this.peerConfig) 
  //   myPeer.onicecandidate = (event) => {
  //     if (event.candidate) {
  //         // storesIceCandidate
  //         this.sendIceCandidate(target,this.from, event.candidate)
  //     }
  //   }

  //   myPeer.ondatachannel = (event)=>{
  //     const dataChannel = event.channel

  //     dataChannel.onmessage = async (message)=>{
  //       console.log('received message', message)
  //     }
  //   }

  //   return myPeer
  // }

  // sendIceCandidate(to:string, from:string ,candidate:RTCIceCandidate) {
  //   const request = {
  //       type: 'msg',
  //       to: to,
  //       from: from,
  //       message: {
  //           stage: 4,
  //           data: candidate
  //       }
  //   }

  //   // this.ws.send(JSON.stringify(request))
  // }
    
  
}
