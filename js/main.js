const connected = document.getElementById('connected');
const debugDiv = document.getElementById('debug_div');

const primaryServiceUuid = '136b6c37-4561-47d9-8719-31c8c06a6930';
const ssidUuid = '950c5147-555f-41c0-ab03-6225c489b9db';
const pwdUuid = '8752d073-7490-455e-a65c-7614636f330e';

const SSID_SENT = '1';
const SSID_STORED = '2';
const PASSWORD_SENT = '3';
const PASSWORD_STORED = '4';
const LAT_SENT = '5';
const LAT_STORED = '6';
const LONG_SENT = '7';
const LONG_STORED = '8';
const AUTH_TOKEN_SENT = '9';
const AUTH_TOKEN_STORED = '10';
const NETWORK_CONNECTED = '11';
const NETWORK_NOT_CONNECTED = '12';

let bb_url = 'https://bramwell-brown.herokuapp.com/';
//let bb_url = 'http://localhost:3000/';
let device, aDevice, bDevice;
let network_success = false;
let ssid;
let password;
let auth_token;
let location_obj;
let location_lat;
let location_long;

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./serviceworker.js');
  }
}

$(document).ready(function(){
  console.log("Document Ready");

  $("#get_started_button").click(function(){
    console.log("Turn Bluetooth On");
    $("#get_started").hide();
    $("#login").show();
  });

  $("#enter_password_button").click(function(){
    console.log("Login");
    let pwd = $("#user_password"). val();
    let login_url = bb_url + "login";

    var request = $.ajax({
      url: login_url,
      method: "POST",
      crossDomain: true,
      data: {firstName : "Bramwell", password : pwd},
      dataType: "json"
    });

    request.done(function( msg ) {
      console.log( msg );
      auth_token = msg.authToken;
      $("#login").hide();
      $("#turn_on_bluetooth").show();
    });

    request.fail(function( jqXHR, textStatus ) {
      console.log( "Request failed: " + textStatus );
      document.getElementById("debug_msg").innerHTML = "Request failed: " + textStatus;
    });

  });

  $("#goto_location_button").click(function(){
    console.log("Enter Location");
    $("#turn_on_bluetooth").hide();
    $("#enter_location").show();
  });

  $("#search_location_button").click(function(){

    $('#location_list ul').empty()

    let loc = $("#your_location"). val();
    let loc_url = bb_url + "location";

    var request = $.ajax({
      url: loc_url,
      method: "GET",
      data: { location : loc,
      auth_token: auth_token },
      crossDomain: true
    });

    request.done(function( res ) {
      console.log( res.Success );

      $.each(res.Success, function(key,value) {
        let city = value.city;
        let country = value.country;
        let state = value.state;
        loc = city + ", " + country + ", " + state;
        console.log(city + ", " + country + ", " + state);
        //let val = value.latitude.toString() + ',' + value.longitude.toString();
        location_obj = res.Success;
        $("#list_of_locations").append("<li value='" + key + "'><a href='javascript:void(0);' class='location_results'>" + loc +"</a></li>");
      });

      $("#location_list").show();

    });

    request.fail(function( jqXHR, textStatus ) {
      console.log( "Request failed: " + textStatus );
    });

  });

  $('#list_of_locations').on('click', 'li', function () {
    console.log($(this).val());
    let long_lat_val = $(this).val();

    let obj = location_obj[long_lat_val];
    let city = obj.city;
    let country = obj.country;
    let state = obj.state;
    let loc = city + ", " + country + ", " + state;

    console.log('Latitude: ', obj.latitude);
    console.log('Longitude: ', obj.longitude);

    location_lat = obj.latitude;
    location_long = obj.longitude;

    location_lat = location_lat.toFixed(6);
    location_long = location_long.toFixed(6);

    $('#connect h3').text(loc);

    $("#enter_location").hide();
    $("#location_list").hide();
    $("#connect").show();
  });

  $("#connect_button").click(function(){
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
      //document.getElementById("debug_msg").innerHTML = msg;
      console.log('Connected');
      connected.style.display = 'block';
      connect_button.style.display = 'none';
      disconnect_button.style.display = 'initial';
    })
    .catch(
      error => {
        console.log('No clocks found - ERROR' + error);
        document.getElementById("error-msg").innerHTML = "No Bramwell Brown clocks were found, please put your clock into bluetooth mode and press the connect button again.";
      }
    );
  });

  $("#disconnect_button").click(function(){
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
  });

  function onDisconnected(event) {
    let device = event.target;
    connected.style.display = 'none';
    connectButton.style.display = 'initial';
    disconnectButton.style.display = 'none';
    document.getElementById("error-msg").innerHTML = 'Device ' + device.name + ' is disconnected.';
    console.log('Device ' + device.name + ' is disconnected.');
  }

  $("#send_button").click(function(){
    ssid = document.getElementById("ssid").value;
    password = document.getElementById("pwd").value;

    //trim white space
    ssid.trim()
    password.trim()

    aDevice.startNotifications()
    .then(_ => {
      sendData(SSID_SENT);
    })
    .catch(
      error => {
        console.log('There was an error sending details, please try again ' + error);
        document.getElementById("error-msg").innerHTML = "There was an error sending details, please try again.";
      }
    );
  });

  function sendData(num){

    let data;
    let msg;

    if (num == SSID_SENT){
        data = SSID_SENT + "|" + ssid;
        msg = "SSID successfully sent: ", data;
    }

    if (num == PASSWORD_SENT){
        data = PASSWORD_SENT + "|" + password;
        msg = "Password successfully sent: ", data;
    }

    if (num == LAT_SENT){
        data = LAT_SENT + "|" + location_lat;
        msg = "Latitude successfully sent: ", data;
    }

    if (num == LONG_SENT){
        data = LONG_SENT + "|" + location_long;
        msg = "Longitude successfully sent: ", data;
    }

    if (num == AUTH_TOKEN_SENT){
        data = AUTH_TOKEN_SENT + "|" + auth_token;
        msg = "Auth token successfully sent: ", data;
    }

    let encoder = new TextEncoder('utf-8');
    let encodedData = encoder.encode(data);

    aDevice.writeValue(encodedData)
    .then(_ => {
      console.log('Data sent');
      document.getElementById("error-msg").innerHTML = msg;
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
          sendData(PASSWORD_SENT);
      }

      if (value == PASSWORD_STORED){
          console.log('Password recieved');
          sendData(LAT_SENT);
      }

      if (value == LAT_STORED){
          console.log('Latitude recieved');
          sendData(LONG_SENT);
      }

      if (value == LONG_STORED){
          console.log('Longitude recieved');
          sendData(AUTH_TOKEN_SENT);
      }

      if (value == AUTH_TOKEN_STORED){
          console.log('Auth token recieved');
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

});
