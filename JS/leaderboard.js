import { better } from "./better.js"
import { setting } from "./setting.js"

function find_p_by_id(players, id) {
    let p = null
    players.forEach(player => {
        if (player.id === id) {
            p = player
        }
    })

    return p
}

function find_idx_by_id(players, id) {
    let idx = -1
    players.forEach((player, i) => {
        if (player.id === id) {
            idx = i
        }
    })

    return idx
}


// let id = e.target.getAttribute("playerId")

// find_by_id(this.players, id)

// better.set_player()


class LeaderBoard {
    constructor() {
        this.html_element = {
            container: document.querySelector("div.leaderboard.container"),
            players: [{
                container: document.querySelector("button.leaderboard.player"),
                name: document.querySelector("button.leaderboard.player p.leaderboard.player.name"),
                color: document.querySelector("button.leaderboard.player span.leaderboard.player.color"),
                ammount: document.querySelector("button.leaderboard.player p.leaderboard.player.ammount")
            }]
        }
    }

    set(start_player) {
        this.players = [start_player]

        this.html_element.players[0].name.textContent = this.players[0].name
        this.html_element.players[0].ammount.textContent = this.players[0].ammount
        this.html_element.players[0].color.style.backgroundColor = this.players[0].color

        this.html_element.players[0].container.setAttribute("playerId", "0")
        this.html_element.players[0].container.onclick = () => { better.set_player(this.players[0]) }

        // update_player = this.update_player
    }

    update_leaderboard(players, removed_players) {
        if (players.length != this.html_element.players.length) {
            while (players.length > this.html_element.players.length) {
                this.html_element.players.push({
                    container: document.createElement("button"),
                    name: document.createElement("p"),
                    color: document.createElement("span"),
                    ammount: document.createElement("p")
                })
                let idx = this.html_element.players.length - 1

                this.html_element.players[idx].container.onclick = () => { better.set_player(players[idx]) }

                this.html_element.players[idx].container.classList.add("leaderboard", "player")
                this.html_element.players[idx].name.classList.add("leaderboard", "player", "name")
                this.html_element.players[idx].color.classList.add("leaderboard", "player", "color")
                this.html_element.players[idx].ammount.classList.add("leaderboard", "player", "ammount")

                this.html_element.players[idx].container.appendChild(this.html_element.players[idx].color)
                this.html_element.players[idx].container.appendChild(this.html_element.players[idx].name)
                this.html_element.players[idx].container.appendChild(this.html_element.players[idx].ammount)
                this.html_element.container.appendChild(this.html_element.players[idx].container)
            }

            if (removed_players.length !== 0) {
                for (let i = 0; i < removed_players.length; i++) {
                    this.html_element.container.removeChild(this.html_element.players[removed_players[i]].container)
                    this.html_element.players.splice(removed_players[i], 1)
                }
            }
        }

        players.forEach((player, idx) => {
            this.html_element.players[idx].name.textContent = player.name
            this.html_element.players[idx].ammount.textContent = player.ammount
            this.html_element.players[idx].color.style.backgroundColor = player.color
        })

        this.players = players

        // console.log(this.players)
    }

    update_player(player) {
        let idx = find_idx_by_id(this.players, player.id)

        if (idx === -1) {
            throw new Error("Cannot find player by id.")
        }
        
        this.players[idx] = player

        if (player.ammount % 1 !== 0) {
            this.html_element.players[idx].ammount.textContent = player.ammount.toFixed(1)
        } else {
            this.html_element.players[idx].ammount.textContent = player.ammount

        }

    }

    order_list() {
        for(let i = 0; i < this.players.length; i++) {
            let min = {val: this.players[i].ammount, pos: i}
            for (let j = i+1; j < this.players.length; j++) {
                if (this.players[j].ammount > min.val) {
                    min.val = this.players[j].ammount
                    min.pos = j
                }
            }

            let t = this.players[i]
            this.players[i] = this.players[min.pos]
            this.players[min.pos] = t
        }

        setting.enabled_settings[0].players = this.players
        this.update_leaderboard(this.players, [])
    }
}

export const leaderboard = new LeaderBoard()