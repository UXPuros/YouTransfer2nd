
import { Injectable } from '@angular/core';
import { P2PConnection } from './p2pconnection.class';
import { WebsocketService, wsMessages, wsDirectMsg } from './websocket.service';



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

    this.websocket.messages.subscribe(
      (wsMessage) => {
        this.handleIncomingMessages(wsMessage)
      }

    )

  }

  handleIncomingMessages(wsMessage: wsDirectMsg) {
    if (wsMessage.type != wsMessages.HANDSHAKE)
      return;


    const targetConnection = wsMessage.from;
    if (typeof this.MoFosConnections[targetConnection] == 'undefined') {

      if (wsMessage.message.stage == 0)
        this.MoFosConnections[targetConnection] = new P2PConnection(wsMessage.from, this.websocket, wsMessage.message.data);
    } else {
      this.MoFosConnections[targetConnection].messageForMe(wsMessage)
    }
  }

   giveMeAChannel(owner: string, fileId: string): Promise<RTCDataChannel | null> {
    const connection = this.getMofoConnection(owner);
    console.log('I finally have a connection')


    return new Promise((resolve, reject) => {
      connection.getChannel(fileId, (channel:RTCDataChannel) => {
        resolve(channel);
      });
    })
  }

   getMofoConnection(remoteID: string): P2PConnection {
    if (typeof this.MoFosConnections[remoteID] != 'undefined')
      return this.MoFosConnections[remoteID];

    console.log('Corri #1')
    const newP2PC = new P2PConnection(remoteID, this.websocket);
    return newP2PC
  
  }

}