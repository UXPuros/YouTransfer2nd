
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

<<<<<<< Updated upstream


  }

  getMofoConnection(remoteID: string,): P2PConnection {
=======
  async giveMeAChannel(owner: string, fileId: string): Promise<RTCDataChannel> {
    const connection = await this.getMofoConnection(owner);
    console.log('I finally have a connection')


    const channel = await new Promise<RTCDataChannel>((resolve, reject) => {
      connection.getChannel(fileId, (channel: RTCDataChannel) => {
        resolve(channel);
      });
    })

    console.log('I finally have the channel')

    return channel;
  }

  async getMofoConnection(remoteID: string): Promise<P2PConnection> {
>>>>>>> Stashed changes
    if (typeof this.MoFosConnections[remoteID] != 'undefined')
      return this.MoFosConnections[remoteID];

    const newP2PC = new P2PConnection(remoteID, this.websocket);
<<<<<<< Updated upstream
=======
    this.MoFosConnections[remoteID] = newP2PC;

    await new Promise<void>((resolve, reject) => {
      newP2PC.onConnected(() => {

        resolve();
      })
    })


    return newP2PC;


  }

  getMofoConnection2(remoteID: string): P2PConnection {
    if (typeof this.MoFosConnections[remoteID] != 'undefined')
      return this.MoFosConnections[remoteID];

    const newP2PC = new P2PConnection(remoteID, this.websocket);
>>>>>>> Stashed changes

    this.MoFosConnections[remoteID] = newP2PC;
    return newP2PC;

  }

}