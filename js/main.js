const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendButton = document.getElementById('sendButton');
const connected = document.getElementById('connected');

let device, sendCharacteristic, receiveCharacteristic;
let bDevice;

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
  navigator.bluetooth.requestDevice(
    {
      filters: [
        { name: "BramwellBrown" },
        { services: [primaryServiceUuid] }
      ]
    }
  )
  .then(device => {
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => server.getPrimaryService(primaryServiceUuid))
  .then(service => service.getCharacteristic(sendCharUuid))
  .then(characteristic => {
    // Writing 1 is the signal to reset energy expended.
    bDevice = characteristic;
    console.log('Connected');
    connected.style.display = 'block';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
  })
  .catch(
    error => {
      console.log('No clocks found - ERROR' + error);
      document.getElementById("error-msg").innerHTML = "No Bramwell Brown clocks were found, please put your clock into bluetooth mode and press the connect button again, thank you.";
    }
  );
}

disconnectButton.onclick = async () => {
  connected.style.display = 'none';
  connectButton.style.display = 'display';
  disconnectButton.style.display = 'none';
  if (!device) {
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  if (device.gatt.connected) {
    device.gatt.disconnect();
  } else {
    console.log('> Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  let device = event.target;
  document.getElementById("error-msg").innerHTML = 'Device ' + device.name + ' is disconnected.';
  console.log('Device ' + device.name + ' is disconnected.');
}

sendButton.onclick = async () => {
  let ssid = document.getElementById("ssid").value;
  let pwd = document.getElementById("pwd").value;

  let encoder = new TextEncoder('utf-8');
  let sendMsg = encoder.encode(ssid + ":" + pwd);

  console.log(sendMsg);
  bDevice.writeValue(sendMsg);
}
