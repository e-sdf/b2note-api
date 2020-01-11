import * as http  from "http";
import app from "./app";

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + (addr ? addr.port : "");
  console.log("B2NOTE server listening on " + bind);
}

const port = process.env.PORT || 3050;
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("listening", onListening);



