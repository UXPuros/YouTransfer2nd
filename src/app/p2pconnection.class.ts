
import { WebsocketService, wsDirectMsg, wsMessages, wsHandshakeMsg } from './websocket.service';

export class P2PConnection {


    peerConfig:RTCConfiguration = {
        iceServers: [
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            // {
            //     urls: [
            //         'stun:stun1.l.google.com:19302',
            //         'stun:stun2.l.google.com:19302',
            //         'stun:stun3.l.google.com:19302',
            //         'stun:stun4.l.google.com:19302',
            //     ]
            // }
        ],
        // bundlePolicy: 'max-bundle'
    }

    localChannel: any
    dataChannels: RTCDataChannel[] = [];
    peerConn: RTCPeerConnection = new RTCPeerConnection(this.peerConfig)

<<<<<<< Updated upstream
=======
    peepzWaiting: Function[] = [];
>>>>>>> Stashed changes

    constructor(private remoteID: string, private ws: WebsocketService, offer: any = null) {


<<<<<<< Updated upstream
        let theMotherChannel = this.peerConn.createDataChannel('MotherChannel');
        theMotherChannel.onopen = () => {
            console.log(`%c MotherChannel Open!`, "background: lime;padding: 20px; color:white;");
            for (let index = 0; index < 10; index++) {
                let i = index;
                setTimeout(() => {
                    this.peerConn.createDataChannel(`Channel${i}`)
                }, 1000 * i);
                
            }
            setTimeout
        }
=======

>>>>>>> Stashed changes
        this.peerConn.onicecandidate = (e) => {
            if (e.candidate)
                this.conjureIceCandidate(e.candidate)
        }
<<<<<<< Updated upstream
        this.peerConn.ondatachannel = (something:RTCDataChannelEvent) => {
            console.log(`%c Got a channel!`, "background: red;padding: 20px; color:white;");
        };
=======
        // this.openDataChannel('default')

        this.peerConn.onconnectionstatechange = (x) => {
            console.log(`%c Connection State: ${this.peerConn.connectionState}`, "background: blue;padding: 20px; color:white;");
            if (this.peerConn.connectionState == 'connected') {
                this.connected = true;
                this.peepzWaiting.forEach(cb => {
                    cb();
                });
                this.peepzWaiting = [];
            }

        }

        this.peerConn.ondatachannel = (ChannelEvent: RTCDataChannelEvent) => {

            console.log(`%c Got a channel (${ChannelEvent.channel.label})!`, "background: cyan;padding: 20px; color:blue;");

            const channel = ChannelEvent.channel;
            const fileId = channel.label;
            this.dataChannels.push(channel);

            
            const data = new Uint8Array([0b01011001,0b01101111,0b01110101,0b01110011,0b01110101,0b01100011,0b01101011,0b00100001])
            channel.send(data)
            

            if (!this.defaultChannel)
                this.defaultChannel = ChannelEvent.channel;
        }
        // console.log(`%c Got a channel!`, "background: red;padding: 20px; color:white;");
        // console.log(ChannelEvent)

>>>>>>> Stashed changes


        // this.peerConn.onicegatheringstatechange = evt => {
        //     console.log(`%c onicegatheringstatechange`, "background: red;padding: 20px; color:white;");
        // };

        // this.peerConn.onnegotiationneeded = evt => {
        //     console.log(`%c onnegotiationneeded`, "background: lime;padding: 20px; color:red;");
        // };

        // this.peerConn.onicecandidateerror = evt => {
        //     console.log(`%c icecandidateerror`, "background: black;padding: 20px; color:red;");
        // };

        // this.peerConn.oniceconnectionstatechange = evt => {
        //     console.log(`%c Connection State: ${this.peerConn.connectionState}`, "background: blue;padding: 20px; color:white;");
        //     // if(this.peerConn.connectionState =='connected') {

        //     // }

        // };

        if (!offer)
            this.conjureOffer()

        else {
            this.computeOffer(offer)
        }
    }

<<<<<<< Updated upstream
=======
    onConnected(cb: Function) {
        this.peepzWaiting.push(cb);
    }

    getChannel(fileId: string, cb: Function) {
        const newChannel = this.peerConn?.createDataChannel(fileId);
        newChannel.onopen = () => {
            this.dataChannels.push(newChannel);
            newChannel.onmessage = (me:MessageEvent) => {
                console.log(`Incoming file data:`, new TextDecoder().decode(me.data))
            
            }
            cb(newChannel)
        }  
    }


>>>>>>> Stashed changes
    async conjureOffer() {

        this.defaultChannel = this.peerConn?.createDataChannel('default');
        const offer = await this.peerConn?.createOffer()
        await this.peerConn.setLocalDescription(offer)

        console.log(`Sending offer to ${this.remoteID}`)

        this.ws.sendHandshake(this.remoteID, 0, this.peerConn?.localDescription)
    }

    async computeOffer(offer: any) {
        console.log(`Computing offer from ${this.remoteID}`)
        try {
            await this.peerConn.setRemoteDescription(offer)
            this.conjureAwswer();
        } catch (e) {
            console.error('Offer de merda!')
        }
    }

    async conjureAwswer() {
        console.log(`Sending answer to ${this.remoteID}`)

        const answer = await this.peerConn?.createAnswer()
        await this.peerConn.setLocalDescription(answer)
        this.ws.sendHandshake(this.remoteID, 1, this.peerConn?.localDescription)
    }

    async computeAnswer(answer: any) {
        console.log(`Computing answer from ${this.remoteID}`)
        await this.peerConn.setRemoteDescription(answer as RTCSessionDescriptionInit)

    }


    conjureIceCandidate(candidate: RTCIceCandidate) {
        console.log(`Sending ICE to ${this.remoteID}`)
        this.ws.sendHandshake(this.remoteID, 2, candidate)
    }

    async computeIceCandidate(candidate: any) {
        console.log(`Computing ICE from ${this.remoteID}`)
        try {
            await this.peerConn.addIceCandidate(candidate as RTCIceCandidate)
        }catch(e) {
            console.error('FDX joao!!!!', this.peerConn)
        }

    }

    async messageForMe(hsMsg: wsHandshakeMsg) {
        if (!hsMsg.message.stage)
            return;

        if (hsMsg.message.stage == 1) {

            await this.computeAnswer(hsMsg.message.data)

        }

        if (hsMsg.message.stage == 2) {
            this.computeIceCandidate(hsMsg.message.data)
        }

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

    openDataChannel(fileId: string) {
        this.localChannel = this.peerConn?.createDataChannel(fileId);
        console.log('datachannel', this.localChannel)

        this.localChannel.onopen = function () {
            console.log("we in");
        };

        this.localChannel.onerror = function (error: any) {
            console.log("Error:", error);
        };

<<<<<<< Updated upstream
        this.localChannel.onmessage = function (event: { data: any; }) {
            console.log("Got message:", event.data);
        };
=======


>>>>>>> Stashed changes
    }


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




    // terminated() {

    //   this.myPeer?.close();

    // }

}