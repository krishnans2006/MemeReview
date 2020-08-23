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

async function getImages(subreddit) {
  reddit.watcher
    .getListingWatcher(subreddit, {
      listing: "top_day",
      limit: 25
    })
    .on("item", function(post) {
      if (post.data.url) {
        if (items[subreddit]) {
          items[subreddit].images.push(post.data.url);
        } else {
          items[subreddit] = { images: [post.data.url] };
        }
      }
    });
}
let users = [];
let votes = [];
let qnum = 0;
let gameon = false;

getImages("memes");
io.on("connection", function(socket) {
  console.log("User Connected!");
  socket.on("adduser", data => {
    console.log("added user " + data.username);
    users.push({ socketid: socket.id, points: 0, username: data.username });
    io.emit("players", users.length);
    if (users.length == 3) {
      io.emit("message", {
        type: "info",
        text: "reached 3 players, starting the game in 30 seconds..."
      });
      setTimeout(startGame, 5);
    }
    console.log(users);
  });
  socket.on("vote", data => {
    if (gameon) {
      let found = false;

      votes.forEach(vote => {
        if (vote.socketid == socket.id) {
          found = true;
        }
      });
      if (!found) {
        votes.push({ socketid: socket.id, vote: data.vote });
        socket.emit("message", {
          type: "success",
          text: "Voted!"
        });
      } else {
        for (let i = 0; i < votes.length; i++) {
          votes[i].vote = data.vote;
          socket.emit("message", {
            type: "success",
            text: "Changed Vote!"
          });
        }
      }
    }
  });
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
function startGame() {
  if (users.length < 3) {
    io.emit("message", {
      type: "info",
      text: "Not enough players to start the game, restarting 30 sec Q"
    });
    startGame();
  } else {
    newq();
  }
}
function newq() {
  if(qnum<3){
    votes = []
      var item1index = Math.floor(Math.random() * items.memes.images.length);
  var item1 = items.memes.images[item1index];
  items.memes.images.splice(item1index, 1);
  var item2index = Math.floor(Math.random() * items.memes.images.length);
  var item2 = items.memes.images[item2index];
  items.memes.images.splice(item2index, 1);
  console.log(item1);
  console.log(item2);
  io.emit("newq", {
    item1: item1,
    item2: item2
  });
  gameon = true;

  setTimeout(countvotes, 20000);
      qnum++

  }else{
        io.emit("message", {
      type: "info",
      text: "The game has ended!"
    });
    let maxindex = -1;
    let maxpoints = -1;
    for(let i = 0;i<users.length;i++){
      if(users[i].points > maxpoints){
        maxpoints = users[i].points
        maxindex = i
      }
    }
            io.emit("message", {
      type: "success",
      text: "The winner is "+users[maxindex].username
    });
  }

}
function countvotes() {
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
    console.log("Maj 1")
    for (let i = 0; i < votes.length; i++) {
      for (let x = 0; x < users.length; x++) {
        if (votes[i].socketid == users[x].socketid) {
          if (votes[i].vote == 1) {
            users[x].points++;
          }
        } 
      } 
    }
  } else if (count2 > count1) {
        console.log("Maj 2")

    for (let i = 0; i < votes.length; i++) {
      for (let x = 0; x < users.length; x++) {
        if (votes[i].socketid == users[x].socketid) {
          if (votes[i].vote == 2) {
            users[x].points++;
          } 
        }
      }
    }
  }
  users.forEach(user=>{
    io.to(user.socketid).emit("points",user.points)
  })
  
    newq()

} 
