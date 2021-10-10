const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    setTimeout(() => {
      connectToNewUser(userId, stream)
    }, 1000)
  })

  let text = document.querySelector("input");
  // when press enter send message
  document.querySelector('html').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && text.value.length !== 0) {
      socket.emit('message', text.value);
      text.value = ''
    }
  });
  socket.on("createMessage", message => {
    const ul = document.querySelector('ul');

    const li = document.createElement('li');
    li.classList.add('message');
    const b = document.createElement('b');
    b.append('user');
    const br = document.createElement('br');
    const text = document.createTextNode(`${message}`);
    li.append(b);
    li.append(br);
    li.append(text);
    ul.append(li);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = document.querySelector('.main__chat_window');
  d.scrollTop = d.scrollHeight;
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `<i class= "fas fa-microphone">`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `<i class= "unmute fas fa-microphone-slash" >`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `<i class= "fas fa-video">`;
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = ` <i class= "stop fas fa-video-slash">`;
  document.querySelector('.main__video_button').innerHTML = html;
}
