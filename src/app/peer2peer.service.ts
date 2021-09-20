import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService, wsMessages } from './websocket.service';


export class P2PConnection {

  private RTCPC?: RTCPeerConnection
  peerConfig = {
    "iceServers": [{
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    },]
  }


  connection: RTCPeerConnection | undefined
  dataChannels: RTCDataChannel[] = [];
  receivedAnswers: Subscription


  from: string = ''

  constructor(private remoteID: string, private ws: WebsocketService) {  
  
    this.from = ws.myId
    this.receivedAnswers = this.ws.messages.subscribe((wsMessage) => {
      if (wsMessage.type == wsMessages.HANDSHAKE) {

        // switch (msg.message.stage) {
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
        
      }
    })

  }

  startPeer() {
    this.RTCPC = this.createPeer(this.remoteID)
    this.ws.sendHandshake(this.remoteID)

  }



  private createPeer(target: string) {
    let myPeer = new RTCPeerConnection(this.peerConfig)
    myPeer.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(target, this.from, event.candidate)
      }
    }

    myPeer.ondatachannel = (event) => {
      const dataChannel = event.channel

      dataChannel.onmessage = async (message) => {
        console.log('received message', message)
      }
    }

    return myPeer
  }

  sendIceCandidate(to: string, from: string, candidate: RTCIceCandidate) {
    this.ws.sendHandshake(this.remoteID, 4, candidate)
  }

  connect(){

  }

  terminated(){
    
  }

}




export class P2PTransfer {



  constructor() {

  }

}

@Injectable({
  providedIn: 'root'
})

export class Peer2peerService {

  MoFosConnections: { [userid: string]: P2PConnection } = {}
  //hashmap ou dictionary


  constructor(private websocket: WebsocketService) {
  
  }

  async somemethod() {
    try {
      const novaconexao = await this.getMofoConnection('dfdfdfdfdf')
    }
    catch (e) {
      console.error('nao deu mesmo')
    }
  }

  async getMofoConnection(mofoID: string): Promise<P2PConnection> {
    if (typeof this.MoFosConnections[mofoID] != 'undefined')
      return this.MoFosConnections[mofoID];

    const newP2PC = new P2PConnection(mofoID, this.websocket);
    try {
      await newP2PC.connect();
      // newP2PC.terminated = (id) => {
      //   delete this.MoFosConnections[id];
      // }
      this.MoFosConnections[mofoID] = newP2PC;
      return newP2PC;
    } catch (e) {
      throw new Error('fodeu mane');
    }






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
