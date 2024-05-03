import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import stun from 'stun';

// Known peers addresses
const bootstrapMultiaddrs = [
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
];

const STUN_SERVER = 'stun.l.google.com:19302';

// Function to initialize libp2p
async function initLibp2p() {
  // Get public IP and port using STUN
  const response = await stun.request(STUN_SERVER);
  const { address, port } = response.getXorAddress();

  console.log(`Public IP: ${address}, Public Port: ${port}`);

  const node = await createLibp2p({
    transports: [webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: bootstrapMultiaddrs, // provide array of multiaddrs
      })
    ],
    addresses: {
      listen: [`/ip4/${address}/tcp/${port}/ws`]
    }
  });

  node.addEventListener('peer:discovery', (evt) => {
    console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
  })
  
  node.addEventListener('peer:connect', (evt) => {
    console.log('Connected to %s', evt.detail.toString()) // Log connected peer
  })
  
  await node.start();
  console.log('Node started.');
  console.log('Your Peer ID is:', node.peerId);
}

initLibp2p().catch((err) => {
  console.error('Error starting libp2p:', err);
});
