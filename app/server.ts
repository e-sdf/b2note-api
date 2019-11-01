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
  console.log("B2NOTE server listening on " + bind);
}

// Setup and go

var port = 3050
app.set("port", port);

var server = http.createServer(app);

server.listen(port);
server.on("listening", onListening);



