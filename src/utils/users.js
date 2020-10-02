const users = [];

const addUser = ({id, username, room}) => {
    // Clean the username and room data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate data
    if(!username || !room)
    {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    })
    if(existingUser)
    {
        return {
            error: 'User already exists. Try with a different username.'
        }
    }

    const user = {
        id,
        username,
        room
    };

    users.push(user);
    return {
        user
    };
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> {
        return user.id === id;
    })

    if(index === -1)
    {
        return {
            error: 'User not found!'
        }
    }

    const user = users.splice(index,1)[0];
    return {
        user
    };
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    })
    if(!user)
    {
        return {
            error: 'User not found'
        }
    }

    return { user };
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    })
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}