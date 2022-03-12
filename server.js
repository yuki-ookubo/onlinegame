var fs = require('fs');
var http = require('http');
var server = http.createServer();
var cliants = [];

server.on('request', function(req, res) {
  var stream = fs.createReadStream('index.html');
  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});
var io = require('socket.io').listen(server);
server.listen(8000);

io.sockets.on('connection', function(socket) {
  cliants.push(new Cliant(socket.id));
  console.log(socket.id);
  socket.on('setUserName',function(userName){
    if(!userName) userName = '名無しさん';
    console.log("welcome");
    cliants.filter(e => e.id == socket.id)[0].setName(userName);
    socket.userName = userName;
  });
  socket.on("sDetails",function(data){
    if(cliants.filter(e => e.id == socket.id) == []) return;
    cliants.filter(e => e.id == socket.id)[0].setDetails(data);
    if(data.arrow){
      io.sockets.emit("bornArrow",data.arrow);
    }
    if(data.die){
      cliants = cliants.filter(e => e.id != socket.id);
    }
    socket.emit("sCliants",cliants);
  });
  socket.on("disconnect",function(){
    cliants = cliants.filter(e => e.id != socket.id);
  });
});
class Cliant{
  constructor(id){
    this.userName = "undefined";
    this.x = 0;
    this.y = 0;
    this.id = id;
    this.max_hp = 0;
    this.hp = 0;
  }
  setName(name){
    this.userName = name;
  }
  setDetails(data){
    this.x = data.x;
    this.y = data.y;
    if(data.max_hp)this.max_hp = data.max_hp;
    if(data.hp)this.hp = data.hp;
  }
}
