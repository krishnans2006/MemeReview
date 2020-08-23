var socket = io.connect("");
socket.on("connect", () => {
  console.log("connected");
  Swal.fire({
    title: "Please enter a username for the game",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: false,
    confirmButtonText: "Let's Play!",
    showLoaderOnConfirm: true
  }).then(result => {
    if (result.value) {
        //play coffin dance on connect
      sound("https://cdn.glitch.com/05042400-6fe0-4cb0-b587-cc229e4c26ea%2FCoffin%20Dance%201%20hour.mp3?v=1598198455988")
      console.log(result.value);
      socket.emit("adduser", { username: result.value });
      document.getElementById("welcome").innerHTML = "";
      document.getElementById("welcome").innerHTML +=
        "Welcome " + result.value + "!";
      sendSuccessMessage("Logged in as " + result.value);
      sendSuccessMessage("Game will start once 3 players enter matchmaking");
    }
  });
});
socket.on("players", players => {
  document.getElementById("players").innerHTML = players;
  console.log(players);
});

socket.on("message", data => {
  if (data.type == "success") {
    sendSuccessMessage(data.text);
  }
  if (data.type == "info") {
    sendInfoMessage(data.text);
  }
  if (data.type == "warning") {
    sendWarningMessage(data.text);
  }
});
socket.on("timer", time => {
  let i = time;
  let intie = setInterval(timer => {
    i--;
    document.getElementById("title").innerHTML = i;
    document.getElementById("title").style.fontWeight = "bolder";
    document.getElementById("title").style.fontSize = "200%";
    if (i <= 3 && i >= 0) {
      document.getElementById("title").style.color = "red";
      document.getElementById("title").style.fontSize = "400%";
    }
    if (i == 0) {
      document.getElementById("title").style.color = "white";
      document.getElementById("title").style.fontWeight = "normal";

      clearInterval(intie);
      document.getElementById("title").innerHTML = "Meme Review";
    }
  }, 1000);
});
socket.on("newq", data => {
  sendInfoMessage(
    "You have 15 seconds to pick a meme! Click an image to pick it."
  );
  document.getElementById("img1").src = data.item1;
  document.getElementById("img2").src = data.item2;
  let currval = parseInt(document.getElementById("qnum").innerHTML);
  document.getElementById("qnum").innerHTML = currval + 1;
});

function sendSuccessMessage(message) {
  new Noty({
    text: message,
    theme: "sunset",
    type: "success",
    timeout: 5000, // [integer|boolean] delay for closing event in milliseconds. Set false for sticky notifications
    progressBar: true, // [boolean] - displays a progress bar
    animation: {
      open: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 450, y: 0 },
            to: { x: 0, y: 0 },
            easing: "bounce",
            duration: 1000,
            bounces: 4,
            stiffness: 3
          })
          .scale({
            from: { x: 1.2, y: 1 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 4,
            stiffness: 1
          })
          .scale({
            from: { x: 1, y: 1.2 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 6,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      },
      close: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 0, y: 0 },
            to: { x: 450, y: 0 },
            easing: "bounce",
            duration: 500,
            bounces: 4,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      }
    }
  }).show();
}
function sendErrorMessage(message) {
  new Noty({
    text: message,
    theme: "sunset",
    type: "error",
    timeout: 5000, // [integer|boolean] delay for closing event in milliseconds. Set false for sticky notifications
    progressBar: true, // [boolean] - displays a progress bar
    animation: {
      open: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 450, y: 0 },
            to: { x: 0, y: 0 },
            easing: "bounce",
            duration: 1000,
            bounces: 4,
            stiffness: 3
          })
          .scale({
            from: { x: 1.2, y: 1 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 4,
            stiffness: 1
          })
          .scale({
            from: { x: 1, y: 1.2 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 6,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      },
      close: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 0, y: 0 },
            to: { x: 450, y: 0 },
            easing: "bounce",
            duration: 500,
            bounces: 4,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      }
    }
  }).show();
}
function sendWarningMessage(message) {
  new Noty({
    text: message,
    theme: "sunset",
    type: "warning",
    timeout: 5000, // [integer|boolean] delay for closing event in milliseconds. Set false for sticky notifications
    progressBar: true, // [boolean] - displays a progress bar
    animation: {
      open: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 450, y: 0 },
            to: { x: 0, y: 0 },
            easing: "bounce",
            duration: 1000,
            bounces: 4,
            stiffness: 3
          })
          .scale({
            from: { x: 1.2, y: 1 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 4,
            stiffness: 1
          })
          .scale({
            from: { x: 1, y: 1.2 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 6,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      },
      close: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 0, y: 0 },
            to: { x: 450, y: 0 },
            easing: "bounce",
            duration: 500,
            bounces: 4,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      }
    }
  }).show();
}
function sendInfoMessage(message) {
  new Noty({
    text: message,
    theme: "sunset",
    type: "info",
    timeout: 5000, // [integer|boolean] delay for closing event in milliseconds. Set false for sticky notifications
    progressBar: true, // [boolean] - displays a progress bar
    animation: {
      open: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 450, y: 0 },
            to: { x: 0, y: 0 },
            easing: "bounce",
            duration: 1000,
            bounces: 4,
            stiffness: 3
          })
          .scale({
            from: { x: 1.2, y: 1 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 4,
            stiffness: 1
          })
          .scale({
            from: { x: 1, y: 1.2 },
            to: { x: 1, y: 1 },
            easing: "bounce",
            duration: 1000,
            delay: 100,
            bounces: 6,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      },
      close: function(promise) {
        var n = this;
        new Bounce()
          .translate({
            from: { x: 0, y: 0 },
            to: { x: 450, y: 0 },
            easing: "bounce",
            duration: 500,
            bounces: 4,
            stiffness: 1
          })
          .applyTo(n.barDom, {
            onComplete: function() {
              promise(function(resolve) {
                resolve();
              });
            }
          });
      }
    }
  }).show();
}

/*Mobile Development Code*/
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  //Shrinks the images by 45%
  document.getElementById("img1").style.height = "45%";
  document.getElementById("img1").style.width = "45%";
  document.getElementById("img2").style.height = "45%";
  document.getElementById("img2").style.width = "45%";

  //Puts images in display style block
  document.getElementById("images").style.display = "block";

  //Changes the title size of Gif 1/2 text
  document.getElementByClassName("imagetitle").style.height = "25%";
  document.getElementByClassName("imagetitle").style.width = "25%";

  //Changes the left bar size of Gif 1/2 text
  document.getElementByClassName("onlyimage").style.height = "25%";
  document.getElementByClassName("onlyimage").style.width = "25%";
}

function vote(num) {
  sound('https://cdn.glitch.com/05042400-6fe0-4cb0-b587-cc229e4c26ea%2Fsuccess.mp3?v=1598197361509')
  socket.emit("vote", { vote: num });
}
socket.on("points", points => {
  console.log("Points: " + points);
  document.getElementById("payout").innerHTML = points;
});
socket.on("ranking", ranking => {
  console.log("ranking: " + ranking);
  document.getElementById("eliminated").innerHTML = ranking;
});
function sound(src) {
var audio = new Audio(src);
audio.play();

}
