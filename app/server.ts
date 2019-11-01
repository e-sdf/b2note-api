import * as http  from "http";
import app from "./app";

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + (addr ? addr.port : "");
  console.log("Listening on " + bind);
}

// Setup and go

var port = 3050
app.set("port", port);

var server = http.createServer(app);

server.listen(port);
console.log("B2Note server running on " + port);
server.on("listening", onListening);



