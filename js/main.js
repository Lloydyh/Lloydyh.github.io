const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const sendButton = document.getElementById('sendButton');
const connected = document.getElementById('connected');
const debugDiv = document.getElementById('debug_div');

let device;
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
          document.getElementById("debug_ssid").innerHTML = 'Char 1: ' + characteristic.uuid;
          break;

        case pwdUuid:
          bDevice = characteristic;
          console.log('Found Characteristic: ' + characteristic.uuid);
          document.getElementById("debug_pwd").innerHTML = 'Char 2: ' + characteristic.uuid;
          break;

        default:
          console.log('> Unknown Characteristic: ' + characteristic.uuid);
      }
    })
    return queue;
  })
  .then(_ => {
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

  /*aDevice.writeValue(ssidEncode)
  .then(_ => {
    return bDevice.writeValue(pwdEncode)
  })*/

  aDevice.startNotifications(
  .then(_ => {
    return aDevice.writeValue(ssidEncode)
  })
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

function handleNotifications(event) {
  console.log('Notification Recived');
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));
}

function Decodeuint8arr(uint8array){
  return new TextDecoder("utf-8").decode(uint8array);
}
