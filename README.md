Channels-chat
======


## Introduction

Channels-chat is a is a fast, highly scalable HTTP + realtime solution which is ready to work with multi-process
realtime servers that make use of all CPU cores on a machine/instance.
Thanks to Socketcluster, it removes the limitations of having to run your Node.js server as a single thread and makes your backend resilient by automatically recovering from worker crashes and aggregating errors into a central log.
It is ready to be vertical-horizontally scalable, it uses redis platform for communication between machines/instances, so with no more configuration than setting a IP:PORT we can scale the system with other machines.

It is absoulutely following the principles of SOA, therefore there is an complete ubound between client and server. This offers the flexibility to use the services from other clients behind the web, if desired.

You can run the system as:
- Invitado, this is the guest mode
- Usuario, this is the authentified mode

Channels-chat releases two channels to chat.

- Canal1 , it is a name of a channel, which will not let you to publish until you are sucesfully authentified
- Canal2, you can subscribe and publish in this channel without restrictions


## Installation

You must be in a linux machine with apt-get packet management system. 
I assume:
- You have set-up your permisions for the system/folder you are working in
- You have node and npm 


Setup the socketcluster command:
```bash
npm install -g socketcluster
```

Then, Create Databases:
```sql

CREATE DATABASE IF NOT EXISTS `guud_db`;
USE guud_db;

CREATE TABLE IF NOT EXISTS `users` (
  email VARCHAR(20) NOT NULL,
  password VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (email)
)
ENGINE = INNODB;

CREATE DATABASE IF NOT EXISTS `SCPresence`;
USE SCPresence;

CREATE TABLE IF NOT EXISTS `SCPresence_users` (
  SCP_id INT(11) NOT NULL AUTO_INCREMENT,
  SCP_socket_id VARCHAR(255) DEFAULT NULL,
  SCP_user_id INT(11) DEFAULT NULL,
  SCP_channel VARCHAR(255) DEFAULT NULL,
  SCP_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  SCP_authToken VARCHAR(2048) DEFAULT NULL,  
  SCP_ip VARCHAR(255) DEFAULT NULL,
  SCP_origin VARCHAR(1024) DEFAULT NULL,
  PRIMARY KEY (SCP_id),
  UNIQUE INDEX IX_unique_user_channel_socket (SCP_user_id, SCP_channel, SCP_socket_id)
)
ENGINE = INNODB;
```

Now, just get the code
```bash
git clone git@github.com:franjoespejo/channels-chat.git
```

Finally install all the dependences
```bash
cd channels-chat
npm install
``` 

It's all

## Use

Once in the folder: 

```bash
node server
```

### Access at URL http://localhost:8000/
You will see a nice web.
In the window of each channel at the right-top corner you will be able to sub/unsub, the chat is very straight-forward

### Access at URL http://localhost:8000/admin.html 
It is a panel where you can see the information about the users presence.



## Alternative Configuration


Since the project it is using socketcluster.io, it has all the benefit associated with this framework.
To use it with different machines, we'll just need to run a redis-server and set our machines to redis's IP:PORT.

We can also use the loadbalancer that socketcluster has, or any other solution as nginx. 
Bellow an example of config, that runs over HTTPS, and uses 3 workers pararelly.


In order to run it over HTTPS, all you need to do is set the protocol to 'https' and
provide your private key and certificate as a start option when you instantiate SocketCluster - Example:

```js
var socketCluster = new SocketCluster({
  workers: 3,
  brokers: 3,
  port: 8000,
  appName: 'myapp',
  workerController: 'worker.js',
  protocol: 'https',
  protocolOptions: {
    key: fs.readFileSync(__dirname + '/keys/enc_key.pem', 'utf8'),
    cert: fs.readFileSync(__dirname + '/keys/cert.pem', 'utf8'),
    passphrase: 'passphase4privkey'
  }
});
```


## Thanks to:

[![SocketCluster logo](https://raw.github.com/SocketCluster/socketcluster/master/assets/logo.png)](http://socketcluster.io/)


## License
@author is @franjoespejo, franjoespejo@gmail.com

(The MIT License)

Copyright (c) 2015 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
