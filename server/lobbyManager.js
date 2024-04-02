const {DeckManager} = require("./DeckManager");

class Client {
    constructor(id, nickname){
        this.id = id;
        this.nickname = nickname;
        this.turnNumber = 0;
        this.isYourTurn = false;
        this.chipAmount = 1000;
        this.currentBet = "";
        this.status = 'ready';
        this.actionChose = "";
        this.role = "";
    }
}

class Lobby
{
    constructor(name, host){
        this.name = name;
        this.host = host;
        this.clients = [];
        this.deck = new DeckManager();
        this.locked = false;
        this.playerNames = ["Milo", "Joel", "Steve", "Hossain", "Matthew", "Dylan", "Zach", "Jesse", "Seth"];
    }

    addClient(clientID){
        this.clients.push(new Client(clientID, this.chooseRandomName()));
    }

    removeClient(client){
        const index = this.clients.indexOf(client);
        if (index !== -1)
            this.clients.splice(index, 1);
    }

    getClientsCount(){
        return this.clients.length;
    }

    findClient(clientID){
        for (let client of this.clients)
        {
            if (clientID == client.id)
                return client;
        }
    }

    chooseRandomName(){
        // Generate a random index
        const randomIndex = Math.floor(Math.random() * this.playerNames.length);

        // Retrieve the element at the random index
        const randomName = this.playerNames[randomIndex];

        // Remove the element from the array
        this.playerNames.splice(randomIndex, 1);

        return randomName;
    }

    switchRoles() {
        // Loops 3 times individually so that roles aren't ovewritten, and it shifts big blind, then small blind, then dealer over one.
        // If it is a 2 player game, the roles should switch at the same time.
        let clientsCount = this.clients.length;

        let roles = {0: "Big Blind", 1: "Small Blind", 2: "Dealer"};

        if (clientsCount > 2)
        {
            for (let r = 0; r < 3; r++)
            {
                for (let i = 0; i < clientsCount; i++)
                {
                    if (this.clients[i].role == roles[r])
                    {
                        // Make sure not to go out of bounds
                        let roleswitch = i + 1;
                        if (roleswitch > clientsCount)
                            roleswitch = 0;
                        this.clients[roleswitch].role = this.clients[i].role;
                        this.clients[i].role = "";
                    }
                }
            }
        }
        // Switch roles for a two player game
        else {
            let temp = this.clients[0].role;
            this.clients[0].role = this.clients[1].role;
            this.clients[1].role = temp;
        }
        // Update actionChose back to their role
        for (let client of this.clients)
            client.actionChose = client.role;
    }
}

class LobbyManager
{
    constructor(){
        this.lobbies = {};
    }

    createLobby(lobbyName, host)
    {
        if (!this.lobbies[lobbyName])
        {
            console.log("Added lobby: " + lobbyName);
            this.lobbies[lobbyName] = new Lobby(lobbyName, host);
            this.lobbies[lobbyName].addClient(host);
            console.log("Host: " + this.lobbies[lobbyName].clients[0].nickname);

            return true;
        }
        else{
            return false; // Lobby already exists
        }
    }

    joinLobby(lobbyName, clientID)
    {
        const lobby = this.lobbies[lobbyName];
        if (!lobby)
        {
            return { status: false, reason: 'Lobby does not exist' };
        }
        else if (lobby.getClientsCount() == 5)
        {
            return { status: false, reason: 'Lobby is full' };
        }
        else if (lobby.locked)
        {
            return {status: false, reason: "Lobby has already started"}
        }
        else
        {
            lobby.addClient(clientID);
            console.log(this.lobbies[lobbyName].clients);
            return { status: true }; // Joined lobby successfully
        }
    }

    leaveLobby(lobbyName, client)
    {
        const lobby = this.lobbies[lobbyName];
        if (lobby)
        {
            // Add this clients nickname back into nickname pool
            lobby.playerNames.push(client.nickname);

            // Remove the client
            lobby.removeClient(client);

            // Delete the lobby once lobby is empty
            if (lobby.getClientsCount() === 0)
            {
                delete this.lobbies[lobbyName];
            }
            return true; // Left lobby successfully
        }
        return false; // Lobby doesn't exist
    }

    getLobby(lobbyName)
    {
        const lobby = this.lobbies[lobbyName];
        if (lobby)
            return lobby;
        else
            return false;
    }

    // Returns an array of the names of all lobbies that are currrently joinable
    getAllLobbyNames()
    {
        let unlockedLobbies = [];
        for (let lobbyName in this.lobbies)
        {
            let lobby = lobbyManager.getLobby(lobbyName);
            if (!lobby.locked)
            {
                unlockedLobbies.push(lobby.name);
            }
                

        }
        return unlockedLobbies; // Returns an array of lobby names
    }
}

const lobbyManager = new LobbyManager();

module.exports = lobbyManager;