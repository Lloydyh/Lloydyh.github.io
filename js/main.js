const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');

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

var bluetoothDevice;

connectButton.onclick = async () => {
  let options = {filters: []};

  /*
  let filterService = document.querySelector('#service').value;
  if (filterService.startsWith('0x')) {
    filterService = parseInt(filterService);
  }
  if (filterService) {
    options.filters.push({services: [filterService]});
  }

  let filterName = document.querySelector('#name').value;
  if (filterName) {
    options.filters.push({name: filterName});
  }

  let filterNamePrefix = document.querySelector('#namePrefix').value;
  if (filterNamePrefix) {
    options.filters.push({namePrefix: filterNamePrefix});
  }*/

  options.filters.push({name: "BramwellBrown"});

  bluetoothDevice = null;
  try {
    console.log('Requesting Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice(options);
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
    connect();
  } catch(error) {
    console.log('Argh! ' + error);
  }
};

async function connect() {
  console.log('Connecting to Bluetooth Device...');
  //await bluetoothDevice.gatt.connect();

  await bluetoothDevice.gatt.connect();
  //const service = await server.getPrimaryService(primaryServiceUuid);
  //sendCharacteristic = await service.getCharacteristic(sendCharUuid);

  console.log('> Bluetooth Device connected');
  connected.style.display = 'block';
  connectButton.style.display = 'none';
  disconnectButton.style.display = 'initial';
}

/*
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
*/
/*
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
