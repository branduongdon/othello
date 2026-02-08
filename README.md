# othello
hello ollo othello

## Othello WebSocket Server (WIP)
To run the server, you will need the [Deno](https://docs.deno.com/runtime/) JavaScript runtime. Once installed:
1. Clone the repository.

`git clone https://github.com/branduongdon/othello`

2. Navigate to `root/backend/src` and then run

`deno run server.ts`

The server runs on port 80 by default. Note that you will need to grant network and file permissions to Deno when prompted.

3. Open your browser and navigate to [127.0.0.1](http://127.0.0.1) to start the game for the **black** player.

4. Open an incognito tab and navigate to the same location as in step 3 to start the game for the **white** player.

5. Enjoy playing Othello over the network!

## Features and Limitations
### Features
- WebSocket API for real-time updates.
- Built in score tracker.
- Legal move highlighting and last piece marking.
### Current Limitations
- No networking capability yet (local play only).
- The server needs to be restarted after every game.
- The interface needs a lot of work.
    - ...no visibility for current player's turn.
- There is no way to choose which color to play (currently, the first player to connect to a session becomes the black player).
- There is no "undo move" button.
### Bugs
- N/A