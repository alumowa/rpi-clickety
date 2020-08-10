
# rpi-clickety

A node library that can receive, decode, and transmit 433Mhz remote controlled outlet signals using your raspberry pi. Inpired by [rc-switch](https://github.com/sui77/rc-switch). I made this to control the switches I have at home (HS2260A chip).

## Features

* Sniff transmissions and output decoded values
* Output raw pulse timing data (as base64)
* Code based transmit
* Can also transmit based on raw pulse timing data

## Installation

This module depends on the JS [pigpio](https://github.com/fivdi/pigpio) library for high-speed gpio twiddling so follow the [installation instructions](https://github.com/fivdi/pigpio#installation) there.

## Usage

Note: I used the cheapo 433Mhz transmitter/receiver modules that can be obtained for under $5. All testing was done on a Rpi Zero WH.

⚠ Note on pin numbering: The underlying pigpio library uses the [Broadcom GPIO numbers](https://elinux.org/RPi_Low-level_peripherals#General_Purpose_Input.2FOutput_.28GPIO.29) so make sure you are using the correct numbers.


## Receiving

Setup:

* Pi pin 1 (3v3) <-> Receiver Vcc
* Pi pin 6 (GND) <-> Receiver GND
* Pi pin 13 (GPIO27) <-> Receiver DATA

```js

//Note we are passing 27 not 13 for pin param
const receiver = new Receiver(27);

//receiver is an event emitter that will emit received codes
//along with other useful info.
receiver.on('code', (data) => {

  console.log(data.code); //Print decimal code
});

receiver.listenStart();

```

## Transmit

Setup:

* Pi pin 2 (5V) <-> Transmitter Vcc
* Pi pin 6 (GND) <-> Transmitter GND
* Pi pin 11 (GPIO17) <-> Transmitter DATA

```js

const tx = new Transmitter(17);
tx.transmit(1406220); //Send decimal code
```

