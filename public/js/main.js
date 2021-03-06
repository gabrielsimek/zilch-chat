const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


const socket = io();

//Join chatroom
socket.emit('joinRoom', {username, room})
socket.on('roll', data => {
    console.log(data);
})
// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users)
})

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message)

  // Scroll down
  chatMessages.scrollTop  = chatMessages.scrollHeight

 
});


// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value

    //Emit message to server (msg payload)
    socket.emit('chatMessage', msg)

    // Clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()


})

// Output message to DOM

function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to dom
function outputRoomName(room) {
    roomName.innerText = room

}

//  Add users to DOM
function outputUsers(users){
    console.log(users);
    // users.forEach(user => {
    //     const li = document.createElement('li')
    //     li.innerText = user.username
    //     userList.append(li)
    // })

    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
    

}