# Conway's game of life  

This is the demo program to show the logic of [Conway's game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)  

### Technology Used   
1. Nodejs  
2. SocketCluster (Ref: [http://socketcluster.io](http://socketcluster.io))  
3. Expressjs (Ref: [http://expressjs.com/](http://expressjs.com/))
4. Vuejs (Ref: [https://vuejs.org/](https://vuejs.org/))  
5. bower (Ref: [https://vuejs.org/](https://vuejs.org/))  

## How to start 
### Pre-requisite  
1. Nodejs v6.10.3 or above  
2. bower  

### Install dependency  
Go to the project folder and run  
`$ npm install`  
`$ bower install`

### Run the program  
`$ node server`  

### To connect to the server
`http://localhost:8000`  

## Architecture  
The demo project is mainly rely on the structure of the SocketCluster. It can provide Http server as well as the Socket server.
For a demo purpose, it only uses 1 worker to serve all the jobs (e.g. Gaming logic, Http Server, Socket Server, Timer Server, etc...). The Http server will serve the static content (i.e. html, js, css, etc...) to the client.   
In the client side, every action by the client will be send to the server through the web socket. The Socket server will send the request to the gaming core for calculating and checking.  
After validating and checking, any valid action done by the clients user will be populate to the others through the Socket server.
The Timer server will trigger the gaming core to calcualte the next state in every second. The result will populate to the clients thorugh the Socket server immediately.  

## Scalability  
Techology wise all the tools can be used in both verticle and horizontal scaling. But it will make the program become complicated. For demo purpose only, it won't support the scaling.   
To support scaling, the gaming logic and the web server may need to separate into 2 different servers and using some messaging system like MQ (e.g. kafka) to connect them.

## Security 
SocketCluster can support https connection. For demo purpose only, it will not include in this project.  

## Future Improvement   
Gaming core server should be separated to handle all the change of the game world and using the messaging system to connect all the socket servers.   
In more advance case, a scheduler server can be setup to trigger the calculation of the change of the world in every second.  
To support horizontal scalablility, there should have a load balancer in front of the socket servers, so that more user client can be supported to connect.