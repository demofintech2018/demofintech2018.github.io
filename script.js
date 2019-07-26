// Generate random room name if needed
if (!location.hash) {
    //location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    location.hash = 'demoFintech';
}
//const roomHash = location.hash.substring(1);
const roomHash = 'demoFintech';
console.log(roomHash);

// TODO: Replace with your own channel ID
const drone = new ScaleDrone('qMhbbMdtVrkhpIai');
// Room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + roomHash;
console.log(roomName);
const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};
let room;
let pc;
var myStream;
var reStream;

function onSuccess() {};

function onError(error) {
    console.error(error);
};

drone.on('open', error => {
    console.log("opening drone");
    if (error) {
        return console.error(error);
    }
    room = drone.subscribe(roomName);
    room.on('open', error => {
        if (error) {
            onError(error);
        }
    });
    // We're connected to the room and received an array of 'members'
    // connected to the room (including us). Signaling server is ready.
    room.on('members', members => {
        console.log("member connecting");
        console.log('MEMBERS', members);
        // If we are the second user to connect to the room we will be creating the offer
        const isOfferer = members.length === 2;
        console.log("isOfferer?" + isOfferer);
        startWebRTC(isOfferer);
    });
});

// Send signaling data via Scaledrone
function sendMessage(message) {
    drone.publish({
        room: roomName,
        message
    });
}

function startWebRTC(isOfferer) {
    console.log("webrtc starting");
    console.log("webrtc starting isOfferer? :" + isOfferer);
    pc = new RTCPeerConnection(configuration);

    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
    // message to the other peer through the signaling server
    pc.onicecandidate = event => {
        console.log("pc.onicecandidate");
        if (event.candidate) {
            sendMessage({
                'candidate': event.candidate
            });
        }
    };

    // If user is offerer let the 'negotiationneeded' event create the offer
    if (isOfferer) {
        console.log("isOfferer? Yes");
        pc.onnegotiationneeded = () => {

            var canvasLocal = document.getElementById('canvasOutputLocal');
            var ctxLocal = canvasLocal.getContext('2d');
            var videoLocal = document.getElementById('localVideo');

            videoLocal.addEventListener('play', function() {
                var $this = this; //cache
                (function loop() {
                    if (!$this.paused && !$this.ended) {
                        ctxLocal.drawImage($this, 0, 0);
                        setTimeout(loop, 1000 / 30); // drawing at 30fps
                    }
                })();
            }, 0);
            canvasOutputLocal.setAttribute("style", "display:;position:absolute;top:610;left:918;width:300;height:200;");
            remoteVideo.setAttribute("style", "width: 140%;height: auto;position: absolute;top: 0;left: 0;");
            localVideo.setAttribute("style", "display: ;");
            canvasOutputLocal.setAttribute("style", "display: ;");
            hangup.setAttribute("style","position:absolute;left:555;top:773;border-radius:50px;");
            pc.createOffer().then(localDescCreated).catch(onError);
        }
    }else{
		var canvasLocal = document.getElementById('canvasOutputLocal');
            var ctxLocal = canvasLocal.getContext('2d');
            var videoLocal = document.getElementById('localVideo');

            videoLocal.addEventListener('play', function() {
                var $this = this; //cache
                (function loop() {
                    if (!$this.paused && !$this.ended) {
                        ctxLocal.drawImage($this, 0, 0);
                        setTimeout(loop, 1000 / 30); // drawing at 30fps
                    }
                })();
            }, 0);
	}

    // When a remote stream arrives display it in the #remoteVideo element
    pc.ontrack = event => {
        console.log("setting remote stream");
        const stream = event.streams[0];
        if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            console.log("remote stream set!");
            remoteVideo.srcObject = stream;
			reStream = stream;
            localVideo.setAttribute("style", "display: none;");
            setTimeout(callRestApi, 5000);
            if (!isOfferer) {
            } else {
body.setAttribute("style","position:;");
                remoteVideo.setAttribute("style", "width: 140%;height: auto;position: absolute;top: 0;left: 0;");
                localVideo.setAttribute("style", "display: ;");
                canvasOutputLocal.setAttribute("style", "display:;position:absolute;top:610;left:918;width:257;height:193");

                var canvasLocal = document.getElementById('canvasOutputLocal');
                var ctxLocal = canvasLocal.getContext('2d');
                var videoLocal = document.getElementById('localVideo');
                videoLocal.addEventListener('play', function() {
                    var $this = this; //cache
                    (function loop() {
                        if (!$this.paused && !$this.ended) {
                            ctxLocal.drawImage($this, 0, 0);
                            setTimeout(loop, 1000 / 30); // drawing at 30fps
                        }
                    })();
                }, 0);

            }

        } else {
            localVideo.setAttribute("style", "display: none;");
            if (!isOfferer) {
            } else {
body.setAttribute("style","position:;");
                remoteVideo.setAttribute("style", "width: 140%;height: auto;position: absolute;top: 0;left: 0;");
                localVideo.setAttribute("style", "display: ;");
                canvasOutputLocal.setAttribute("style", "display:;position:absolute;top:610;left:918;width:257;height:193");

                var canvasLocal = document.getElementById('canvasOutputLocal');
                var ctxLocal = canvasLocal.getContext('2d');
                var videoLocal = document.getElementById('localVideo');
                videoLocal.addEventListener('play', function() {
                    var $this = this; //cache
                    (function loop() {
                        if (!$this.paused && !$this.ended) {
                            ctxLocal.drawImage($this, 0, 0);
                            setTimeout(loop, 1000 / 30); // drawing at 30fps
                        }
                    })();
                }, 0);

            }

        }
    };

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
		myStream = stream;
        // Add your stream to be sent to the conneting peer
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }, onError);

    // Listen to signaling data from Scaledrone
    room.on('data', (message, client) => {
        // Message was sent by us
        if (client.id === drone.clientId) {
            return;
        }

        if (message.sdp) {
            console.log("message.sdp: " + message.sdp);
            // This is called after receiving an offer or answer from another peer
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                console.log("setRemoteDescription");
                // When receiving an offer lets answer it
                if (pc.remoteDescription.type === 'offer') {
                    pc.createAnswer().then(localDescCreated).catch(onError);
                }
            }, onError);
        } else if (message.candidate) {
            // Add the new ICE candidate to our connections remote description
            pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), onSuccess, onError
            );
        }
    });
}

function localDescCreated(desc) {
    pc.setLocalDescription(
        desc,
        () => sendMessage({
            'sdp': pc.localDescription
        }),
        onError
    );
}

function stopLocalStream(){
					console.log("stop local stream");
					//console.log(myStream);
					//pc.removeStream(myStream);
					//pc.removeStream(reStream);
					//pc.close();
					//var local = document.getElementById("localVideo");
					//video.pause();
					//video.srcObject = null;
					//console.log(myStream);
					console.log("before");
					console.log(pc);
					var remoteVideo = document.getElementById("remoteVideo");
  var localVideo = document.getElementById("localVideo");

  if (pc) {
	  console.log("pc = true");
    pc.ontrack = null;
    pc.onremovetrack = null;
    pc.onremovestream = null;
    pc.onnicecandidate = null;
    pc.oniceconnectionstatechange = null;
    pc.onsignalingstatechange = null;
    pc.onicegatheringstatechange = null;
    pc.onnotificationneeded = null;

    if (remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    pc.close();
    pc = null;
  }
  console.log("after");
 console.log(pc);
  remoteVideo.removeAttribute("src");
  remoteVideo.removeAttribute("srcObject");
  localVideo.removeAttribute("src");
  remoteVideo.removeAttribute("srcObject");
				}
				
				setInterval(function() {
				if(pc.iceConnectionState != null)		
					console.log(pc.iceConnectionState);
					if(pc.iceConnectionState == "disconnected"){
						console.log("sudah disconnected");
remoteVideo.setAttribute("style","visibility:hidden;");
canvasOutputLocal.setAttribute("style","visibility:hidden;");
localVideo.setAttribute("style","visibility:hidden;");
imgUsed.setAttribute("style","visibility:hidden;");
hangup.setAttribute("style","visibility:hidden;");
}
			if(pc.iceConnectionState == null)
						console.log("sudah null");
                    }, 1000);
				
