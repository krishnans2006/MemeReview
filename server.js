const express = require("express");
const app = express();
const request = require("request");
const fs = require("fs");
const socket = require("socket.io");
app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
var Snoopper = require("reddit-snooper");
let reddit = new Snoopper({
  automatic_retries: true,
  api_requests_per_minute: 60
});
let items = [];
const io = socket(listener);
//grab images from the subreddit and put it into the items array
async function getImages(subreddit) {
  console.log("Scraping from reddit...");
  reddit.watcher
    .getListingWatcher(subreddit, {
      listing: "top_all",
      limit: 50
    })
    .on("item", function(post) {
      //check if image is real
      if (post.data.url && post.data.url.match(".([a-zA-Z]+$)")) {
        var magic = {
          jpg: "ffd8ffe0",
          png: "89504e47",
          gif: "47494638"
        };
        var options = {
          method: "GET",
          url: post.data.url,
          encoding: null // keeps the body as buffer
        };

        request(options, function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var magigNumberInBody = body.toString("hex", 0, 4);
            if (
              magigNumberInBody == magic.jpg ||
              magigNumberInBody == magic.png ||
              magigNumberInBody == magic.gif
            ) {
              if (items["memes"]) {
                items["memes"].images.push(post.data.url);
              } else {
                items["memes"] = { images: [post.data.url] };
              }
            }
          }
        });
      }
    });
}
let users = [];
let votes = [];
let qnum = 0;
let gameon = false;

getImages("funny");
getImages("cleanmemes");
getImages("gifs");

setTimeout(pring => {
  console.log(items.memes.images.length + " items loaded");
}, 60000);
io.on("connection", function(socket) {
  console.log("User Connected!");
  //add a user to the user object when they submit their username
  socket.on("adduser", data => {
    console.log("added user " + data.username);
    users.push({ socketid: socket.id, points: 0, username: data.username });
    io.emit("players", users.length);
    //start the game if we have 3 people
    if (users.length == 3) {
      io.emit("message", {
        type: "info",
        text: "reached 3 players, starting the game in 30 seconds..."
      });
      io.emit("message", {
        type: "info",
        text: "30 seconds left till start"
      });
      io.emit("timer", 30);
      console.log(users); 
      setTimeout(startGame,30*1000)
    }
  });
  //vote handler
  socket.on("vote", data => {
    //if the game is currently on (able to play)
    if (gameon) {
      let found = false;
      votes.forEach(vote => {
        if (vote.socketid == socket.id) {
          found = true;
        }
      });
      //if this is the user's first vote we add their vote to the votes array

      if (!found) {
        votes.push({ socketid: socket.id, vote: data.vote });
        socket.emit("message", {
          type: "success",
          text: "Voted!"
        });
      }
      //if this is not the user's first vote we change their vote and modify it in the votes array
      else {
        for (let i = 0; i < votes.length; i++) {
          if (socket.id == votes[i].socketid) {
            votes[i].vote = data.vote;
            socket.emit("message", {
              type: "success",
              text: "Changed Vote!"
            });
          }
        }
      }
    }
  });
  //remove user object if a user disconnects from the game (so they are out of the running/can't win)
  socket.on("disconnect", () => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].socketid == socket.id) {
        users.splice(i, 1);
        i--;
      }
    }
    io.emit("players", users.length);

    console.log("User Disconnected!");
    console.log(users);
  });
});
//start a game and run new questions
function startGame() {
  if (users.length < 3) {
    io.emit("message", {
      type: "info",
      text: "Not enough players to start the game, restarting 5 sec Q"
    });
    startGame();
  } else {
    newq();
  }
}
function newq() {
  //if our question number is less than 3 we pull up a new q. otherwise end the game and pick a winner
  if (qnum < 3) {
    //clear vote data from last question
    votes = [];
    var item1index = Math.floor(Math.random() * items.memes.images.length);
    var item1 = items.memes.images[item1index];
    items.memes.images.splice(item1index, 1);
    var item2index = Math.floor(Math.random() * items.memes.images.length);
    var item2 = items.memes.images[item2index];
    items.memes.images.splice(item2index, 1);
    console.log(item1);
    console.log(item2);
    //emit our gifs;
    io.emit("newq", {
      item1: item1,
      item2: item2
    });
    gameon = true;
    io.emit("timer", 20);

    setTimeout(countvotes, 20000);
    qnum++;
  } else {
    //end the game
    io.emit("message", {
      type: "info",
      text: "The game has ended!"
    });

    let maxindex = -1;
    let maxpoints = -1;
    //find winner;
    for (let i = 0; i < users.length; i++) {
      if (users[i].points > maxpoints) {
        maxpoints = users[i].points;
        maxindex = i;
      }
    }
    io.emit("message", {
      type: "success",
      text: "The winner is " + users[maxindex].username
    });
    setTimeout(restartround=>{
          endprogram;
    },15000)
  }

  function countvotes() {
    //determine who gets a point and who doesn't
    gameon = false;
    console.log("counting votes...");
    let count1 = 0;
    let count2 = 0;
    votes.forEach(vote => {
      if (vote.vote == 1) {
        count1++;
      } else {
        count2++;
      }
    });
    if (count1 > count2) {
      console.log("Maj 1");
      for (let i = 0; i < votes.length; i++) {
        for (let x = 0; x < users.length; x++) {
          if (votes[i].socketid == users[x].socketid) {
            if (votes[i].vote == 1) {
              users[x].points++;
              io.to(users[x].socketid).emit("message", {
                type: "success",
                text: "You got a point!!!"
              });
            } else {
              io.to(users[x].socketid).emit("message", {
                type: "info",
                text: "You lost this round :("
              });
            }
          }
        }
      }
    } else if (count2 > count1) {
      console.log("Maj 2");

      for (let i = 0; i < votes.length; i++) {
        for (let x = 0; x < users.length; x++) {
          if (votes[i].socketid == users[x].socketid) {
            if (votes[i].vote == 2) {
              users[x].points++;
              io.to(users[x].socketid).emit("message", {
                type: "success",
                text: "You got a point!!!"
              });
            } else {
              io.to(users[x].socketid).emit("message", {
                type: "info",
                text: "You lost this round :("
              });
            }
          }
        }
      }
    }
    users.forEach(user => {
      io.to(user.socketid).emit("points", user.points);
    });
    //calculate rankings
    users.sort((a, b) => (a.points > b.points ? 1 : -1));
    let x = 1;
    for (let i = users.length - 1; i >= 0; i--) {
      io.to(users[i].socketid).emit("ranking", x);
      x++;
    }
    newq();
  }
}
