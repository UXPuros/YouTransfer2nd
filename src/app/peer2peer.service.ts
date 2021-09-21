import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService, wsMessages, wsDirectMsg } from './websocket.service';


export class P2PConnection {


  peerConfig = {
    "iceServers": [{
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    },]
  }

  localChannel: any
  dataChannels: RTCDataChannel[] = [];
  receivedAnswers: Subscription | undefined
  myPeer?: RTCPeerConnection

  from: string = ''

  constructor(private remoteID: string, private ws: WebsocketService) {

    this.from = ws.myId

  }


  startPeer() {
    this.myPeer = this.createPeer(this.remoteID)
    this.openDataChannel()
    this.ws.sendHandshake(this.remoteID)


  }


  private createPeer(target: string) {
    let myPeer = new RTCPeerConnection(this.peerConfig)
    myPeer.onicecandidate = (event) => {
      console.log('cheguei')
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

  openDataChannel() {
    this.localChannel = this.myPeer?.createDataChannel("myDataChannel");

    this.localChannel.onopen = function () {
      console.log("we in");
    };

    this.localChannel.onerror = function (error: any) {
      console.log("Error:", error);
    };

    this.localChannel.onmessage = function (event: { data: any; }) {
      console.log("Got message:", event.data);
    };
  }


  sendIceCandidate(to: string, from: string, candidate: RTCIceCandidate) {
    this.ws.sendHandshake(from, 4, candidate)

  }


  connect() {

    this.receivedAnswers = this.ws.messages.subscribe((wsMessage) => {
      // console.log('Got Message', wsMessage)

      this.connectionSteeps(wsMessage)
      console.log('got it')
    })

  }

  async connectionSteeps(wsMessage: wsDirectMsg) {
    if (wsMessage.type == wsMessages.HANDSHAKE) {

      switch (wsMessage.message.stage) {
        case 0:
          console.log('case 0')
          this.myPeer = this.createPeer(wsMessage.from)


          this.openDataChannel()
          this.ws.sendHandshake(wsMessage.from, 1)
          break;
        case 1:
          if(!this.myPeer){
            console.log('breakei')
            break
          }
          console.log('case 1')

          if(!this.myPeer){
          console.log('breakei')
          break}

          const offer = await this.myPeer?.createOffer()
          await this.myPeer?.setLocalDescription(offer)

          this.ws.sendHandshake(wsMessage.from, 2, this.myPeer?.localDescription)

          break;

        case 2:
          if(!this.myPeer){
            console.log('breakei')
            break
          }
          console.log('case 2')

          await this.myPeer?.setRemoteDescription(wsMessage.message.data)
          const answer = await this.myPeer?.createAnswer()
          await this.myPeer?.setLocalDescription(answer)
          // console.log('answer', answer)

          this.ws.sendHandshake(wsMessage.from, 3, this.myPeer?.localDescription)

          break;

        case 3:
          if(!this.myPeer){
            console.log('breakei')
            break
          }
          console.log('case 3')
          await this.myPeer?.setRemoteDescription(wsMessage.message.data)
          break;

        default:
          if(!this.myPeer){
            console.log('breakei')
            break
          }

        try{

          this.myPeer?.addIceCandidate(wsMessage.message.data)}
          catch{
            console.error('stfu')
          }
          console.log('ice', wsMessage.message.data)
          break;

      }
      console.log('mypeerfinal', this.myPeer)
      // console.log(wsMessage.message.data)
    }
  }


  terminated() {

    this.myPeer?.close();

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


  async getMofoConnection(mofoID: string, usertype: string): Promise<P2PConnection> {
    if (typeof this.MoFosConnections[mofoID] != 'undefined')
      return this.MoFosConnections[mofoID];

    const newP2PC = new P2PConnection(mofoID, this.websocket);


    if (usertype == 'local') {
      newP2PC.startPeer()
    }


    try {
      await newP2PC.connect();

      // newP2PC.terminated = (newP2PC.from) => {
      //   delete this.MoFosConnections[newP2PC.from];
      // }
      this.MoFosConnections[mofoID] = newP2PC;
      return newP2PC;
    } catch (e) {
      throw new Error('fodeu mane');
    }

  }

}
