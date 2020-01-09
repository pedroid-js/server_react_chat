let users: User [] = []

export interface User {
    id: number,
    name: string,
    room: string
}

export interface Error {
    error: string
}

export const addUser = async (
    { id, name, room } : 
    { id: number, name: string, room: string }
): Promise<string> => 
{
    name = name.trim().toLowerCase()
    room = room.trim().toLocaleLowerCase()

    const existingUser = users.find((user: User) => user.room === room && user.name === name)
    
    if (existingUser) {
        return JSON.stringify({ error: "username is taken" })
    }

    const user:User = { id, name, room }

    users.push(user)
    
    return JSON.stringify({ user }) 
}

export const removeUser = (id: number) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

export const getUsers = () : Array<User> => {
    return users
}

export const getUser = (id: number): string => {
    return JSON.stringify(users.find((user) => user.id === id))
}

export const getUsersInRoom = (room: string) : Array<User> => {
    return users.filter((user) => user.room === room)
}

// module.exports = { addUser, removeUser, getUser, getUsersInRoom }

