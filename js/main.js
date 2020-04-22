const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendButton = document.getElementById('sendButton');
const connected = document.getElementById('connected');
const debugDiv = document.getElementById('debug_div');

const primaryServiceUuid = '136b6c37-4561-47d9-8719-31c8c06a6930';
const ssidUuid = '950c5147-555f-41c0-ab03-6225c489b9db';
const pwdUuid = '8752d073-7490-455e-a65c-7614636f330e';

const SSID_STORED = '1';
const PASSWORD_STORED = '2';
const NETWORK_CONNECTED = '3';
const NETWORK_NOT_CONNECTED = '4';

let device, aDevice, bDevice;
let network_success = false;

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./serviceworker.js');
  }
}

connectButton.onclick = async () => {
  network_success = false;
  let msg = "Available chracteristics";
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
  .then(server => {
    return server.getPrimaryService(primaryServiceUuid)
  })
  .then(service => {
    return service.getCharacteristics()
  })
  .then(characteristics => {
    let queue = Promise.resolve();
    characteristics.forEach(characteristic => {
      switch (characteristic.uuid) {

        case ssidUuid:
          aDevice = characteristic;
          aDevice.addEventListener('characteristicvaluechanged', handleNotifications);
          console.log('Found Characteristic: ' + characteristic.uuid);
          console.log('> Characteristic UUID:  ' + characteristic.uuid);
          console.log('> Broadcast:            ' + characteristic.properties.broadcast);
          console.log('> Read:                 ' + characteristic.properties.read);
          console.log('> Write:                ' + characteristic.properties.write);
          console.log('> Notify:               ' + characteristic.properties.notify);
          msg = msg + "\n Char 1: " + characteristic.uuid;
          break;

        case pwdUuid:
          bDevice = characteristic;
          bDevice.addEventListener('characteristicvaluechanged', handleNotifications);
          console.log('Found Characteristic: ' + characteristic.uuid);
          console.log('> Characteristic UUID:  ' + characteristic.uuid);
          console.log('> Broadcast:            ' + characteristic.properties.broadcast);
          console.log('> Read:                 ' + characteristic.properties.read);
          console.log('> Write:                ' + characteristic.properties.write);
          console.log('> Notify:               ' + characteristic.properties.notify);
          msg = msg + "\n Char 2: " + characteristic.uuid;
          break;

        default:
          console.log('> Unknown Characteristic: ' + characteristic.uuid);
      }
    })
    return queue;
  })
  .then(_ => {
    document.getElementById("debug_msg").innerHTML = msg;
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
  document.getElementById("error-msg").innerHTML = 'Disconnecting from Bluetooth Device...';
  if (device.gatt.connected) {
    device.gatt.disconnect();
  } else {
    console.log('> Bluetooth Device is already disconnected');
    document.getElementById("error-msg").innerHTML = '> Bluetooth Device is already disconnected';
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
  let encoder = new TextEncoder('utf-8');
  let ssidEncode = encoder.encode(ssid);

  aDevice.startNotifications()
  .then(_ => {
    return aDevice.writeValue(ssidEncode)
  })
  .then(_ => {
    console.log('Details sent');
    document.getElementById("error-msg").innerHTML = "SSID successfully sent";
  })
  .catch(
    error => {
      console.log('There was an error sending details, please try again ' + error);
      document.getElementById("error-msg").innerHTML = "There was an error sending details, please try again.";
    }
  );
}

function sendPassword(){

  let pwd = document.getElementById("pwd").value;
  let encoder = new TextEncoder('utf-8');
  let pwdEncode = encoder.encode(pwd);

  bDevice.startNotifications()
  .then(_ => {
    return bDevice.writeValue(pwdEncode)
  })
  .then(_ => {
    console.log('Details sent');
    document.getElementById("error-msg").innerHTML = "Password successfully sent";
  })
  .catch(
    error => {
      console.log('There was an error sending details, please try again ' + error);
      document.getElementById("error-msg").innerHTML = "There was an error sending details, please try again";
    }
  );
}

function handleNotifications(event) {
  console.log('Notification Received');

  if (event.target.uuid == ssidUuid) {
    let value = event.target.value;
    value = Decodeuint8arr(value);
    if (value == SSID_STORED){
        console.log('> ' + value);
        sendPassword();
    }
  }

  if (event.target.uuid == pwdUuid) {
    let value = event.target.value;
    value = Decodeuint8arr(value);
    if (value == PASSWORD_STORED){
        console.log('Password recieved');
    }
    if (value == NETWORK_CONNECTED){
        network_success = true;
        document.getElementById("debug_msg").innerHTML = "Your Bramwell Brown clock is now connected to your network";
        console.log('Network connected');
    }
    if (value == NETWORK_NOT_CONNECTED){
        network_success = false;
        document.getElementById("debug_msg").innerHTML = "Clock NOT connected please try again";
        console.log('Network NOT connected');
    }
  }

}

function Decodeuint8arr(uint8array){
  return new TextDecoder("utf-8").decode(uint8array);
}
