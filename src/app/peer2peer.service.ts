import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';


class P2PConnection{

  private RTCPC? : RTCPeerConnection
  
  constructor(private remoteID : string, private ws: WebsocketService){

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

  peerConfig = {
    "iceServers": [{
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
     },] 
  }


  locals:RTCPeerConnection[] | undefined
  localChannel:RTCDataChannel | undefined ;

  myPeer?:RTCPeerConnection

  target:string=''
  from:string=''

  constructor(private websock:WebsocketService) {  
    
    this.from = websock.myId
  }


  startPeer(to: string){
    this.myPeer = this.createPeer(this.target)
    this.websock.sendHandshake(to)
  }


  private createPeer(target:string){
    let myPeer = new RTCPeerConnection(this.peerConfig) 
    myPeer.onicecandidate = (event) => {
      if (event.candidate) {
          // storesIceCandidate
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
    const request = {
        type: 'msg',
        to: to,
        from: from,
        message: {
            stage: 4,
            data: candidate
        }
    }

    // this.ws.send(JSON.stringify(request))
  }
    
  // async processMsg(msg:message) {

  //   if (typeof msg.message.stage != 'number')
  //       return


  //   let request
  //   switch (msg.message.stage) {
  //       case 0:
  //           request = {
  //               type: 'msg',
  //               to: msg.from,
  //               from: this.from,
  //               message: {
  //                   stage: 1,
  //                   data: null
  //               }
  //           }

  //           this.myPeer = this.createPeer(this.from)
  //           this.websock.send(JSON.stringify(request))

  //       break;
  //       case 1:
  //           const offer = await this.myPeer?.createOffer()
  //           await this.myPeer?.setLocalDescription(offer)

  //           request = {
  //               type: 'msg',
  //               to: msg.from,
  //               from: this.from,
  //               message: {
  //                   stage: 2,
  //                   data: this.myPeer?.localDescription
  //               }
  //           }

  //           this.websock.send(JSON.stringify(request))
  //           break;

  //       case 2:
  //           await this.myPeer?.setRemoteDescription(msg.message.data)
  //           const answer = await this.myPeer?.createAnswer()
  //           await this.myPeer?.setLocalDescription(answer)
  //           request = {
  //               type: 'msg',
  //               to: msg.from,
  //               from: this.from,
  //               message: {
  //                   stage: 3,
  //                   data: this.myPeer?.localDescription
  //               }
  //           }

  //           this.websock.send(JSON.stringify(request))
  //           break;

  //       case 3:
  //           await this.myPeer?.setRemoteDescription(msg.message.data)
  //           break;

  //       default:
  //           this.myPeer?.addIceCandidate(msg.message.data)
  //           break;
  //   }
  //   console.log('minha pera',this.myPeer)
  // }
}