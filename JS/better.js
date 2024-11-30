import { leaderboard } from "./leaderboard.js"
import { listener } from "./utils/listener.js"
import { wheel } from "./wheel.js" 

let betting_player

class Better {
    constructor() {
        this.possible_bet = []

        this.html_elements = {
            container: document.querySelector("div.container.better"),
            btn: document.querySelector("button.open.better.display"),
            popUp: document.querySelector("div.popUp.better.hidden"),
            closeBtn: document.querySelector("button.close.better"),
            bets: [],
            fish_selector: {
                container: document.createElement("div"),
                btn: document.createElement("button"),
                popUp: document.createElement("div"),
                fishes: []
            }
        }

        listener.set_listener({ name: "Space", func: this.close })
    }

    set(possible_bet, values, colors, maxes, fishes_ammount, player) {
        this.values = values
        this.colors = colors
        this.maxes = maxes
        betting_player = player

        this.create_bet(possible_bet)
        this.set_htmlElements(possible_bet, fishes_ammount)

        this.set_single_bet_ammount(1)
    }

    set_htmlElements(possible_bet, fishes_ammount) {
        let n_bet = possible_bet.length

        this.html_elements.popUp.style.gridTemplateRows = `80px repeat(${n_bet / 2}, 17%) 50px`

        this.html_elements.fish_selector.container.classList.add("container", "better", "fishes")
        this.html_elements.fish_selector.btn.classList.add("better", "fishes")
        this.html_elements.fish_selector.popUp.classList.add("better", "fishes", "hidden")

        this.html_elements.bets.forEach((e, idx) => {
            e.classList.add("better", "bet")
            e.onmousedown = this.possible_bet[idx].manage_bet
            e.oncontextmenu = e => { return false }

            this.html_elements.popUp.appendChild(e)
        })

        fishes_ammount.forEach(ammount => {
            let fish = document.createElement("button")

            fish.classList.add("fish", "better")
            fish.textContent = ammount

            if (ammount == 1) {
                fish.classList.add("selected")
            }

            fish.onclick = this.set_single_bet_ammount

            this.html_elements.fish_selector.popUp.appendChild(fish)
            this.html_elements.fish_selector.fishes.push(fish)
        })

        this.prev_fish_selected = this.html_elements.fish_selector.fishes[0]

        this.html_elements.fish_selector.container.appendChild(this.html_elements.fish_selector.btn)
        this.html_elements.fish_selector.container.appendChild(this.html_elements.fish_selector.popUp)
        this.html_elements.popUp.appendChild(this.html_elements.fish_selector.container)

        this.html_elements.btn.onclick = this.open
        this.html_elements.closeBtn.onclick = this.close
        this.html_elements.fish_selector.btn.onclick = this.toggle
    }

    create_bet(possible_bet) {
        let column = 2, row = 2
        possible_bet.forEach(e => {
            let bet = new Bet(e, this.values.get(e), this.colors.get(e), this.maxes.get(e), { c: column, r: row })
            this.possible_bet.push(bet)
            this.html_elements.bets.push(bet.get_html_element())

            column = (column + 2)
            if (column >= 5) {
                row++
                column = 2
            }
        })
    }

    open = (i) => {
        if (i === 1) {
            this.html_elements.fish_selector.popUp.classList.add("display")
            this.html_elements.fish_selector.popUp.classList.remove("hidden")

            this.html_elements.fish_selector.container.style.height = "180px"
        } else {
            this.html_elements.popUp.classList.add("display")
            this.html_elements.popUp.classList.remove("hidden")

            this.html_elements.container.style.width = "30vw"
        }
    }

    close = (i) => {
        if (i === 1) {
            this.html_elements.fish_selector.popUp.classList.add("hidden")
            this.html_elements.fish_selector.popUp.classList.remove("display")

            this.html_elements.fish_selector.container.style.height = "100px"
        } else {
            this.html_elements.popUp.classList.add("hidden")
            this.html_elements.popUp.classList.remove("display")

            this.html_elements.container.style.width = "150px"
        }
    }

    toggle = () => {
        if (this.html_elements.fish_selector.popUp.classList.contains("display")) {
            this.close(1)
        } else {
            this.open(1)
        }
    }

    set_single_bet_ammount = (e) => {
        this.possible_bet.forEach(bet => {
            if (e === 1) {
                bet.single_bet_ammount = e
            } else {
                bet.single_bet_ammount = Number(e.target.textContent)
            }
        })

        if (e !== 1) {
            if (e.target !== this.prev_fish_selected) {
                e.target.classList.add("selected")
                this.prev_fish_selected.classList.remove("selected")
                this.prev_fish_selected = e.target
            }
        }
    }

    // TODO: modificare la funzione
    set_player = (player) => {
        betting_player = player
    }

    pay_bet(winner) {
        this.possible_bet.forEach(bet => {
            if (bet.name === winner) {
                bet.pay_bet(winner)
            }
            bet.reset()
        })

        leaderboard.order_list()
    }
}

class Bet {
    constructor(name, value, color, max, pos, start_ammount) {
        this.html_element = document.createElement("button")
        this.html_element.classList.add("better", "bet")
        this.html_element.style.backgroundColor = color
        // this.html_element.dataset.betting_players = ""
        this.html_element.style.gridColumn = `${pos.c}`
        this.html_element.style.gridRow = `${pos.r}`

        this.single_bet_ammount = start_ammount
        this.name = name
        this.max = max

        this.players = []
        this.ammount = []
        this.fishes = []

        this.value = value
    }

    manage_bet = (e) => {
        e = e.button
        if (e == 0) {
            this.bet()
        } else if (e == 2) {
            this.remove_fish()
        }
    }

    bet() {
        if (betting_player.ammount === 0 || wheel.blockSpin) {
            return
        }

        if (this.players.indexOf(betting_player) == -1) {
            this.players.push(betting_player)

            if (this.single_bet_ammount <= Math.min(this.max, betting_player.ammount)) {
                this.ammount.push(this.single_bet_ammount)
                betting_player.ammount -= this.single_bet_ammount
            } else {
                this.ammount.push(Math.min(this.max, betting_player.ammount))
                betting_player.ammount -= Math.min(this.max, betting_player.ammount)
            }


            this.add_fish()
            
            // conntrollare se usato
            // let old_data = this.html_element.dataset.betting_players
            // this.html_element.dataset.betting_players = old_data + " " + betting_player
        } else {
            let idx = this.players.indexOf(betting_player)

            if (this.single_bet_ammount + this.ammount[idx] <= Math.min(this.max, betting_player.ammount)) {
                this.ammount[idx] += this.single_bet_ammount
                betting_player.ammount -= this.single_bet_ammount
            } else {
                if (this.max < betting_player.ammount) {
                    betting_player.ammount -= Math.abs(this.ammount[idx] - this.max)
                    this.ammount[idx] = this.max
                } else {
                    this.ammount[idx] += betting_player.ammount
                    betting_player.ammount -= betting_player.ammount
                }
            }

            this.mod_fish()
        }

        leaderboard.update_player(betting_player)
    }

    add_fish() {
        let fish = document.createElement("div"), idx = this.players.indexOf(betting_player)

        fish.classList.add("better", "fish")
        fish.style.borderColor = this.players[idx].color

        if (fish.textContent % 1 !== 0) {
            fish.textContent = this.ammount[idx].toFixed(1)
        } else {
            fish.textContent = this.ammount[idx]
        }

        this.fishes.push(fish)

        this.html_element.appendChild(fish)
    }

    remove_fish() {
        let idx = this.players.indexOf(betting_player)

        if (this.ammount[idx] > 0) {
            if (this.ammount[idx] - this.single_bet_ammount > 0) {
                this.ammount[idx] -= this.single_bet_ammount
                betting_player.ammount += this.single_bet_ammount
            } else {
                betting_player.ammount += this.ammount[idx]
                this.ammount[idx] = 0
            }

        }
        if (this.fishes.length != 0) {
            if (this.ammount[idx] % 1 !== 0) {
                this.fishes[idx].textContent = this.ammount[idx].toFixed(1)
            } else {
                this.fishes[idx].textContent = this.ammount[idx]
            }
        }

        if (this.ammount[idx] <= 0) {
            this.html_element.removeChild(this.fishes[idx])
            this.players.splice(idx, 1)
            this.ammount.splice(idx, 1)
            this.fishes.splice(idx, 1)
        }

        leaderboard.update_player(betting_player)
    }

    mod_fish() {
        let idx = this.players.indexOf(betting_player)

        if (this.ammount[idx] % 1 !== 0) {
            this.fishes[idx].textContent = this.ammount[idx].toFixed(1)
        } else {
            this.fishes[idx].textContent = this.ammount[idx]
        }
    }

    get_html_element() {
        return this.html_element
    }

    reset() {
        this.players = []
        this.ammount = []

        this.fishes.forEach(fish => {
            this.html_element.removeChild(fish)
        })

        this.fishes = []
    }

    pay_bet = (winner) => {
        // if (winner !== this.name) {
        //     return
        // }
        console.log(`Log: paying bet for ${winner}.`)

        if (!isNaN(this.value)) {
            this.players.forEach((p, idx) => {
                p.ammount += (this.ammount[idx] * this.value) + this.ammount[idx]
                leaderboard.update_player(p)
            })
        } else {
            this.players.forEach((p, idx) => {
                let value
                this.value.forEach(e => {
                    if (e.players.indexOf(p.id) != -1) {
                        value = e.value
                    }
                })

                p.ammount += (this.ammount[idx] * value) + this.ammount[idx]
                
                leaderboard.update_player(p)
            })
        }
    }
}

export const better = new Better()