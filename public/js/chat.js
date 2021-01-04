const socket = io();

// DOM Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search , { ignoreQueryPrefix: true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of new message 
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    // Container Height
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// Event List

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('sendLocationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
})

// Emitted events
socket.emit('join', username, room, (error) => {

    if(error)
    {
        alert(`Error: ${error}`);
        location.href = '/';
    }
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable the button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.text.value ;
    socket.emit('sendMessage', message, (error) => {
        // Enable the button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error)
        {
            return console.log(error);
        }
        console.log('Message delivered');
    });
})

$locationButton.addEventListener('click', () => {
    // Disable the location button
    $locationButton.setAttribute('disabled', 'disabled');

    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported in your browser.');
    }

    navigator.geolocation.getCurrentPosition( (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        socket.emit('sendLocation', location, (status) => {
            // Enable the button
            $locationButton.removeAttribute('disabled');
            console.log(status);
        });
    }, (error) => {
        console.log(error);
    })
})
