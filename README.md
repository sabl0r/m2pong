m²pong - Multi Mobile Pong
===

A small pong game I hacked for a party. The players control their paddles with their smartphones via wifi using full screen touch controls. The mobile client runs fully in a modern browser like Firefox or Chrome, no extra app needed.

Status
---
The game lacks the "multi" part of it's name at the moment. Only two players are supported. So it's just a classic pong with a mobile component.

This project was a quick hack for a party and I didn't have the time to complete all the features I had planed. Maybe I will add these in the future. But probably not ;)

Installation
---

The game logic of this game, the server, is implemented in [node.js](https://github.com/joyent/node).

### Prerequisites
* [node.js](https://github.com/joyent/node) (tested with v0.10.5 - lower versions might work)
* npm (bundled with node.js)

### Source
To fetch the latest source just do
```
git clone https://github.com/sabl0r/m2pong
```

### Dependencies
To run the server you have to install all needed dependencies using `npm`.

```
cd m2pong
npm install
```

Running
---
This game is consists of three components:

* Server: Game logic
* Display: Visualizes the current game state
* Client: Touch controller

### Server
```
node index.js
```

or just
```
./index.js
```

### Display

Point a browser to the IP of the machine your server is running on:
```
http://<ip>:8080/display
```

### Client

Point your mobile browser to the IP of the machine your server is running on:
```
http://<ip>:8080/
```

License
---
This code is published under the [MIT license](http://opensource.org/licenses/mit-license.php). Do whatever you want with it :)
