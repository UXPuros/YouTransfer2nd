
import { WebsocketService, wsHandshakeMsg } from './websocket.service';

export class P2PConnection {

    connected = false;
    peerConfig: RTCConfiguration = {
        iceServers: [
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },

        ],
    }

    defaultChannel?: RTCDataChannel;
    dataChannels: RTCDataChannel[] = [];
    peerConn: RTCPeerConnection = new RTCPeerConnection(this.peerConfig)

    peepzWaiting: Function[] = [];

    constructor(private remoteID: string, private ws: WebsocketService, offer: any = null) {



        this.peerConn.onicecandidate = (e) => {
            if (e.candidate)
                this.conjureIceCandidate(e.candidate)
        }
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


    async conjureOffer() {

        this.defaultChannel = this.peerConn?.createDataChannel('default');
        const offer = await this.peerConn?.createOffer()
        await this.peerConn.setLocalDescription(offer)

        // console.log(`Sending offer to ${this.remoteID}`)

        this.ws.sendHandshake(this.remoteID, 0, this.peerConn?.localDescription)
    }

    async computeOffer(offer: any) {
        // console.log(`Computing offer from ${this.remoteID}`)
        try {
            await this.peerConn.setRemoteDescription(offer)
            this.conjureAwswer();
        } catch (e) {
            console.error('Offer de merda!')
        }
    }

    async conjureAwswer() {
        // console.log(`Sending answer to ${this.remoteID}`)

        const answer = await this.peerConn?.createAnswer()
        await this.peerConn.setLocalDescription(answer)
        this.ws.sendHandshake(this.remoteID, 1, this.peerConn?.localDescription)
    }

    async computeAnswer(answer: any) {
        // console.log(`Computing answer from ${this.remoteID}`)
        await this.peerConn.setRemoteDescription(answer as RTCSessionDescriptionInit)

    }


    conjureIceCandidate(candidate: RTCIceCandidate) {
        // console.log(`Sending ICE to ${this.remoteID}`)
        this.ws.sendHandshake(this.remoteID, 2, candidate)
    }

    async computeIceCandidate(candidate: any) {
        // console.log(`Computing ICE from ${this.remoteID}`)
        try {
            await this.peerConn.addIceCandidate(candidate as RTCIceCandidate)
        } catch (e) {
            // console.error('FDX joao!!!!', this.peerConn)
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

    openDataChannel(fileId: string) {
        this.defaultChannel = this.peerConn?.createDataChannel(fileId);
        console.log('datachannel', this.defaultChannel)

        this.defaultChannel.onopen = function () {
            console.log("we in");
        };

        this.defaultChannel.onerror = function (error: any) {
            console.log("Error:", error);
        };



    }




    // terminated() {

    //   this.myPeer?.close();

    // }

}