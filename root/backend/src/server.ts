import { Game, initBoard, makeMoveAt } from "./game.ts";


const BASE_PATH = "../../frontend/public";
type GameSession = {
  white_uuid: string;
  black_uuid: string;
  white_socket: WebSocket | null;
  black_socket: WebSocket | null;
  game: Game;
};
let session: GameSession = {
  white_uuid: "",
  white_socket: null,
  black_uuid: "",
  black_socket: null,
  game: {
    blackToMove: true,
    moveHistory: [],
    board: initBoard(),
  },
};

type ClientCommand = {
  id: string;
  command: string;
  parameter: number; // TODO: number or string?
};

type CommandReply = {
  ok: boolean;
  type: string;
  content: object;
};

Deno.serve({
  port: 80,
  async handler(request) {
    if (request.headers.get("upgrade") !== "websocket") {
      const url = new URL(request.url);
      const filePath = url.pathname === "/"
        ? `${BASE_PATH}/index.html`
        : `${BASE_PATH}${url.pathname}`;
      console.log(`debug: client is requesting ${url.pathname}`);

      try {
        const file = await Deno.open(filePath);
        return new Response(file.readable);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return new Response("404 Not Found", { status: 404 });
        }
        return new Response("500 Internal Server Error", { status: 500 });
      }
    }
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => {
      // Close the connection if a game is already happening,
      // the current server design only handles two players
      if (session.black_socket && session.white_socket) {
        socket.close(1000, "This server only supports two WebSocket connections. Sorry!")
        return;
      }
      const uuid = crypto.randomUUID();
      if (!session.black_socket) {
        session.black_uuid = uuid;
        session.black_socket = socket;
        console.log(`CONNECTED: Assigned black ${session.black_uuid}`);
      } else {
        session.white_uuid = uuid;
        session.white_socket = socket;
        console.log(`CONNECTED: Assigned white ${session.white_uuid}`);
      }
      const msg: CommandReply = {
        ok: true,
        type: session.black_uuid === uuid ? "black" : "white",
        content: Object(uuid),
      };
      const update: CommandReply = {
        ok: true,
        type: "update",
        content: session.game,
      }
      socket.send(JSON.stringify(msg));
      // The view will be the starting position upon connection,
      // so if a game is in progress, we need to update the client's view
      socket.send(JSON.stringify(update));
    };

    socket.onmessage = (event) => {
      const data: ClientCommand = JSON.parse(event.data);
      console.log(`RECEIVED: ${event.data}`);

      /*
      if (data.command && data.command === "fetch-id") {
        const msg: CommandReply = {
          ok: true,
          type: isBlack ? "black" : "white",
          content: Object(uuid),
        };
        socket.send(JSON.stringify(msg));
        console.log(`debug: assigned secret-id ${uuid}`);
        console.log(
          `debug: black is ${session.black_uuid}, white is ${session.white_uuid}`,
        );
      }
        */
      if (data.command && data.command === "move") {
        if (session.game.blackToMove && data.id === session.black_uuid) {
          session.game = makeMoveAt(session.game, Number(data.parameter));
        } else if (
          !session.game.blackToMove && data.id === session.white_uuid
        ) {
          session.game = makeMoveAt(session.game, Number(data.parameter));
        }
        const reply: CommandReply = {
          ok: true,
          type: "update",
          content: session.game,
        };
        console.log("debug " + session.game.moveHistory);
        if (session.black_socket) {
          session.black_socket.send(JSON.stringify(reply));
        }
        if (session.white_socket) {
          session.white_socket.send(JSON.stringify(reply));
        }
      } else {
        const reply: CommandReply = {
          ok: false,
          type: "unknown_command",
          content: Object("unknown command"),
        };
        if (session.black_socket) {
          session.black_socket.send(JSON.stringify(reply));
        }
        if (session.white_socket) {
          session.white_socket.send(JSON.stringify(reply));
        }
      }
    };

    socket.onclose = () => {
      console.log("DISCONNECTED");
      if (socket !== session.black_socket && socket !== session.white_socket) return;
      if (socket === session.black_socket) session.black_socket = null;
      else session.white_socket = null;

      // If both players disconnect, reset the game.
      if (!session.black_socket && !session.white_socket)
        session = {
          white_uuid: "",
          white_socket: null,
          black_uuid: "",
          black_socket: null,
          game: {
            blackToMove: true,
            moveHistory: [],
            board: initBoard(),
          },
        };
            };
    socket.onerror = (error) => console.error("ERROR: ", error);

    return response;
  },
});
