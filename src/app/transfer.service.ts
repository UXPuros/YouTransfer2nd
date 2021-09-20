
import { Injectable } from '@angular/core';
import { Peer2peerService } from './peer2peer.service';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  // allFiles:availableFile

  constructor(private p2p:Peer2peerService) { 

  }

  
}
