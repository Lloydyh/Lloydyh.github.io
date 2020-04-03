const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendDataButton = document.getElementById('sendDataButton');
const connected = document.getElementById('connected');

let device, sendCharacteristic, receiveCharacteristic;


const primaryServiceUuid = '136b6c37-4561-47d9-8719-31c8c06a6930';
const sendCharUuid = '950c5147-555f-41c0-ab03-6225c489b9db';

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./serviceworker.js');
  }
}

connectButton.onclick = async () => {
  navigator.bluetooth.requestDevice({ filters: [{ name: "BramwellBrown" }] })
  .then(device => device.gatt.connect())
  .then(_ => {
    console.log('Energy expended has been reset.');
    connected.style.display = 'block';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
  })
  .catch(error => { console.log(error); });
}

/*

.then(
  server => server.getPrimaryService(primaryServiceUuid)
).then(
  //service => service.getCharacteristic('heart_rate_control_point')
  connected.style.display = 'block';
  connectButton.style.display = 'none';
  disconnectButton.style.display = 'initial';
).then(characteristic => {
  // Writing 1 is the signal to reset energy expended.
  var resetEnergyExpended = Uint8Array.of(1);
  return characteristic.writeValue(resetEnergyExpended);
})
*/

/*
var bluetoothDevice;

connectButton.onclick = async () => {
  let options = {filters: []};

  options.filters.push({name: "BramwellBrown"});

  bluetoothDevice = null;
  try {
    console.log('Requesting Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice(options);
    //bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
    connect();
  } catch(error) {
    console.log('Argh! ' + error);
  }
};
*/
/*
async function connect() {
  console.log('Connecting to Bluetooth Device...');
  //await bluetoothDevice.gatt.connect();

  const server = await bluetoothDevice.gatt.connect();
  //const service = await server.getPrimaryService(primaryServiceUuid);
  //sendCharacteristic = await service.getCharacteristic(sendCharUuid);

  console.log('> Bluetooth Device connected');
  connected.style.display = 'block';
  connectButton.style.display = 'none';
  disconnectButton.style.display = 'initial';
}

disconnectButton.onclick = async () => {
  onDisconnectButtonClick();
}

function onDisconnectButtonClick() {
  if (!bluetoothDevice) {
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
    connected.style.display = 'none';
    connectButton.style.display = 'initial';
    disconnectButton.style.display = 'none';
  } else {
    console.log('> Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  log('> Bluetooth Device disconnected');
}
*/
/*
function onReconnectButtonClick() {
  if (!bluetoothDevice) {
    return;
  }
  if (bluetoothDevice.gatt.connected) {
    console.log('> Bluetooth Device is already connected');
    return;
  }
  try {
    connect();
  } catch(error) {
    console.log('Argh! ' + error);
  }
}

sendDataButton.onclick = async () => {
  const data = new Uint8Array("Hello");
  sendCharacteristic.writeValue(data);
};


connectButton.onclick = async () => {
  console.log("connected");
  device = await navigator.bluetooth
             .requestDevice({
                filters: [{
                  name: "BramwellBrown"
                }]
             });
  const server = await device.gatt.connect();
  /*const service = await server.getPrimaryService(primaryServiceUuid);
  receiveCharacteristic = await service.getCharacteristic(receiveCharUuid);
  sendCharacteristic = await service.getCharacteristic(sendCharUuid);

  device.ongattserverdisconnected = disconnect;
  connected.style.display = 'block';
  connectButton.style.display = 'none';
  disconnectButton.style.display = 'initial';
};*/
