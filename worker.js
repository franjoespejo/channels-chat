var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var crypto = require('crypto');
var mysql      = require('mysql');

// Connection for authentication 
var connection = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'guud_db'
});

// Connection for Presence module
var connection2 = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'SCPresence'
});

//options for Presence module
var options=
{

  scpGcWorkerId               : 0,
  scpGcInterval               : 60, 
  scpGcThreshold              : 120,
  scpBlockUsercountThreshold  : 60,
  scpSCPingsPerUpdate         : 6,  
  scpUsercountChannel         : "USERCOUNT",
  scpUsercountType            : "USERS",
  scpPresenceChannel          : "_SCPRESENCE",
  scpDbhost                   : "localhost",
  scpDbname                   : "SCPresence",
  scpDbTablename              : "SCPresence_users",
  scpDbuser                   : "SCP_user",
  scpDbpassword               : "putyourpasswordhere",        
  scpConnectUpdateDelay       : 3000,
  scpUserIdField              : "user_id"
};

// WORKER RUNNING CODE - EXPORTED TO BE ABLE TO WORK ACROSS MANY WORKERS-SERVERS
module.exports.run = function (worker) {

  require('sc-presence').attach(worker, options);

  var app = require('express')();
  var httpServer = worker.httpServer;
  var scServer = worker.scServer;

  app.use(serveStatic(path.resolve(__dirname, 'public')));
  httpServer.on('request', app);
  console.log('   >> Worker PID:', process.pid);
    
  var count = 0;
  var socketid=null;
  

/**
  MIDDLEWARES 
**/

  scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_OUT,
    function (socket, channel, data, next) {
      // ...
      var authToken = socket.getAuthToken();
      console.log(authToken);

      if (data.socketid!== socket.id) {
        next() // Allow
      } else {
        next('Blocked publishing message out to the very socket sender: ' + socket.id); // Block with notice
      }
    }
  );

  scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH,
    function (socket, channel, data, next) {
      
      var authToken = socket.getAuthToken();

      if (channel=="canal1" && !authToken) {
        next('You are not allowed to publish in canal1') // Not allow
      } else {
        next(); // Allow
      }
    }
  );
 
    
/*
 In here we handle our incoming realtime connections and listen for events.
*/

  scServer.on('connection', function (socket) {
    
    var authToken = socket.getAuthToken();
   
    socket.on('disconnect', function () {
      console.log('User disconnected');
    });

    socket.on('login', function (credentials, respond) {
      var passwordHash= crypto.createHash('sha256').update('guud').digest('base64');
      process.nextTick(function () {
        //Check whether the User exists or not using profile.id
        console.log(passwordHash);
        connection.query("SELECT * from users where email='"+credentials.email+"' and password='"+passwordHash+"';",function(err,rows,fields){
          if(err) throw err;
          if(rows.length===0)
          {
            console.log("There is no such user");
            respond('Login failed');
          }
          else
          {
            respond();
            // This will give the client a token so that they won't
            // have to login again if they lose their connection
            // or revisit the app at a later time.
            socket.setAuthToken({email: credentials.email});
          }
        });

        return 0;
      });  
    });


/*
  Presence module code for admin panel (admin.html)     
  */

    var total=0;
    var canal1=0;
    var canal2=0;
    var todos=new Array();
    socket.on('admin_out',function(data){

      process.nextTick(function () {
        connection2.query("SELECT * from SCPresence_users WHERE SCP_channel='_SCPRESENCE';",function(err,rows,fields){
          if(err) throw err;
          if(rows.length===0)
          {
            console.log("No hay usuarios conectados");
          }
          else
          {
            total= rows.length;
          }
        });

        connection2.query("SELECT * from SCPresence_users WHERE SCP_channel='canal1';",function(err,rows,fields){
          if(err) throw err;
          if(rows.length===0)
          {
            console.log("No hay usuarios conectados");
          }
          else
          {
            canal1= rows.length;
          }
        });

        connection2.query("SELECT * from SCPresence_users WHERE SCP_channel='canal2';",function(err,rows,fields){
          if(err) throw err;
          if(rows.length===0)
          {
            console.log("No hay usuarios conectados");
          }
          else
          {
            canal2= rows.length;
          }
        });

        connection2.query("SELECT * from SCPresence_users WHERE SCP_authToken IS NOT NULL;",function(err,rows,fields){
          if(err) throw err;
          if(rows.length===0)
          {
            console.log("No hay usuarios conectados");
          }
          else
          {
            todos=rows;
            for (i in rows) {
              console.log(rows[i]);
            }
          }
        });
        socket.emit('admin_in',{total : total, canal1: canal1, canal2: canal2, todos: todos});
      });
    });

/*
  Here we handle the data within the channels
  */

    socket.on('canal1',function(data){
      console.log('canal1', data);
      scServer.exchange.publish('canal1', data);
    });

    socket.on('canal2',function(data){
      console.log('canal2', data);
      scServer.exchange.publish('canal2', data);
    });

    socket.on('canal3',function(data){
      console.log('canal3', data);
    });    
  
  });

};