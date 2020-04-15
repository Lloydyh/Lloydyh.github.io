const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendButton = document.getElementById('sendButton');
const connected = document.getElementById('connected');

let device, sendCharacteristic, receiveCharacteristic;
let aDevice, bDevice;

const primaryServiceUuid = '136b6c37-4561-47d9-8719-31c8c06a6930';
const ssidUuid = '950c5147-555f-41c0-ab03-6225c489b9db';
const pwdUuid = '8752d073-7490-455e-a65c-7614636f330e';

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./serviceworker.js');
  }
}

connectButton.onclick = async () => {
  document.getElementById("error-msg").innerHTML = "";
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
  .then(service1 => service1.getCharacteristic(ssidUuid))
  .then(characteristic1 => {
    aDevice = characteristic1;
  })
  .then(service2 => service2.getCharacteristic(pwdUuid))
  .then(characteristic2 => {
    bDevice = characteristic2;
    console.log('Connected');
    connected.style.display = 'block';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'initial';
  })
  .catch(
    error => {
      console.log('No clocks found - ERROR' + error);
      document.getElementById("error-msg").innerHTML = "No Bramwell Brown clocks were found, please put your clock into bluetooth mode and press the connect button again.";
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

  connected.style.display = 'none';
  connectButton.style.display = 'initial';
  disconnectButton.style.display = 'none';
  document.getElementById("error-msg").innerHTML = 'Device ' + device.name + ' is disconnected.';
  console.log('Device ' + device.name + ' is disconnected.');
}

sendButton.onclick = async () => {
  let ssid = document.getElementById("ssid").value;
  let pwd = document.getElementById("pwd").value;

  let encoder = new TextEncoder('utf-8');
  let ssidEncode = encoder.encode(ssid);
  let pwdEncode = encoder.encode(pwd);

  //console.log(sendMsg);
  //console.log(Decodeuint8arr(sendMsg));

  aDevice.writeValue(ssidEncode)
  .then(sendPwd = bDevice.writeValue(pwdEncode))
  .then(_ => {
    console.log('Details sent');
    document.getElementById("error-msg").innerHTML = "No Bramwell Brown clocks were found, please put your clock into bluetooth mode and press the connect button again.";
  })
  .catch(
    error => {
      console.log('There was an error sending details, please try again ' + error);
      document.getElementById("error-msg").innerHTML = "No Bramwell Brown clocks were found, please put your clock into bluetooth mode and press the connect button again.";
    }
  );
}

function Decodeuint8arr(uint8array){
  return new TextDecoder("utf-8").decode(uint8array);
}
