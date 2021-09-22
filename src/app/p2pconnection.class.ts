
import { Subscription } from 'rxjs';
import { WebsocketService, wsDirectMsg, wsMessages, wsHandshakeMsg } from './websocket.service';

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
    peerConn?: RTCPeerConnection


    constructor(private remoteID: string, private ws: WebsocketService, private offer: any = null) {
        console.log(this.offer ? 'incomming connection request' : 'outgoing connectiong request')

        this.peerConn = new RTCPeerConnection(this.peerConfig)

        this.peerConn.onicecandidate = (e) => {
                console.log('cheguei')
                if (e.candidate) {
                  this.ws.sendHandshake(remoteID, 4, e.candidate)
                }
              }

        if (!this.offer)
            this.computeOffer()

        else {
            this.computeAwswer()
        }
    }

    async computeOffer() {



        const offer = await this.peerConn?.createOffer()
        await this.peerConn?.setLocalDescription(offer)

        console.log('sending offer', offer)

        this.ws.sendHandshake(this.remoteID, 0, this.peerConn?.localDescription)
    }

    async computeAwswer() {

        await this.peerConn?.setRemoteDescription(this.offer)
        const answer = await this.peerConn?.createAnswer()
        await this.peerConn?.setLocalDescription(answer)
        console.log('sending awswer', answer)
        this.ws.sendHandshake(this.remoteID, 1, this.peerConn?.localDescription)

    }

    // async receiveAwswer() {

    //     await this.peerConn?.setRemoteDescription(this.peerConn?.localDescription)
    // }




    // startPeer() {
    //   this.myPeer = this.createPeer(this.remoteID)
    //   this.openDataChannel()
    //   this.ws.sendHandshake(this.remoteID)


    // }


    private createPeer(target: string) {
        let myPeer = new RTCPeerConnection(this.peerConfig)


        myPeer.ondatachannel = (event) => {
            const dataChannel = event.channel

            dataChannel.onmessage = async (message) => {
                console.log('received message', message)
            }
        }

        //   myPeer.onicecandidate = (event) => {
        //     console.log('cheguei')
        //     if (event.candidate) {
        //       this.sendIceCandidate(target, event.candidate)
        //     }
        //   }

        return myPeer
    }

    // openDataChannel() {
    //   this.localChannel = this.myPeer?.createDataChannel("myDataChannel");

    //   this.localChannel.onopen = function () {
    //     console.log("we in");
    //   };

    //   this.localChannel.onerror = function (error: any) {
    //     console.log("Error:", error);
    //   };

    //   this.localChannel.onmessage = function (event: { data: any; }) {
    //     console.log("Got message:", event.data);
    //   };
    // }


    // sendIceCandidate(target: string,  candidate: RTCIceCandidate) {
    //   this.ws.sendHandshake(target, 4, candidate)

    // }

    // async connectionSteeps(wsMessage: wsDirectMsg) {
    //   if (wsMessage.type == wsMessages.HANDSHAKE) {
    //     console.log('got message--->', wsMessage)

    //     switch (wsMessage.message.stage) {
    //       case 0:
    //         this.myPeer = this.createPeer(wsMessage.from)


    //         this.openDataChannel()
    //         this.ws.sendHandshake(wsMessage.from, 1)
    //         break;
    //       case 1:

    //         const offer = await this.myPeer?.createOffer()
    //         await this.myPeer?.setLocalDescription(offer)

    //         this.ws.sendHandshake(wsMessage.from, 2, this.myPeer?.localDescription)

    //         break;

    //       case 2:

    //         await this.myPeer?.setRemoteDescription(wsMessage.message.data)
    //         const answer = await this.myPeer?.createAnswer()
    //         await this.myPeer?.setLocalDescription(answer)

    //         this.ws.sendHandshake(wsMessage.from, 3, this.myPeer?.localDescription)

    //         break;

    //       case 3:

    //         await this.myPeer?.setRemoteDescription(wsMessage.message.data)
    //         break;

    //       default:
    //         this.myPeer?.addIceCandidate(wsMessage.message.data)
    //         break;

    //     }
    //   }
    // }

    async messageForMe(message: wsHandshakeMsg) {

        if (message.message.stage == 1) {

            await this.peerConn?.setRemoteDescription(message.message.data as unknown as RTCSessionDescriptionInit)
            console.log(this.peerConn)
        }

        if( message.message.stage == 4) {
            this.peerConn?.addIceCandidate(message.message.data as RTCIceCandidateInit )
        }

    }


    // terminated() {

    //   this.myPeer?.close();

    // }

}