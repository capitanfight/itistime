import { leaderboard } from "./leaderboard.js"
import { Player } from "./players.js"

// TODO: implementare statistiche

// TODO: controllare se serve ancora
function find_by_id(e, id) {
    let idx = null
    e.forEach((e, i) => {
        if (e.name.getAttribute("id") === id) {
            idx = i
        }
    })

    return idx
}

class Settings {
    constructor() {
        this.html_elements = {
            container: document.querySelector("div.container.settings"),
            btn: document.querySelector(".container.settings > button.settings"),
            popUp: document.querySelector("div.popUp.settings"),
            closeBtn: document.querySelector(".popUp.settings > button.settings.close"),
            settings: document.querySelectorAll("div.popUp.settings button.setting")
        }

        this.html_elements.btn.onclick = this.open
        this.html_elements.closeBtn.onclick = this.close
    }

    set(names, settings_type, start_ammount, start_player) {
        this.t_enabled_settings = names
        this.settings_type = settings_type
        this.enabled_settings = []
        this.start_ammount = start_ammount

        let players = [start_player]

        this.create_settings(players)
    }

    create_settings(players) {
        this.t_enabled_settings.forEach((e, idx) => {
            let setting = new Setting(e, this.settings_type.get(e), this.html_elements.settings[idx], idx, players, this.start_ammount)
            this.enabled_settings.push(setting)
        })
    }

    open = () => {
        this.html_elements.container.style.width = "75vw"
        this.html_elements.container.style.height = "75vh"

        this.html_elements.popUp.classList.add("display")
        this.html_elements.popUp.classList.remove("hidden")

        this.html_elements.btn.classList.add("hidden")
        this.html_elements.btn.classList.remove("display")
    }

    close = () => {
        this.html_elements.container.style.width = "0px"
        this.html_elements.container.style.height = "0px"

        this.html_elements.popUp.classList.add("hidden")
        this.html_elements.popUp.classList.remove("display")

        this.html_elements.btn.classList.add("display")
        this.html_elements.btn.classList.remove("hidden")
    }
}

class Setting {
    constructor(name, isOpener, html_element, id, players, start_ammount) {
        this.name = name
        this.isOpener = isOpener
        this.start_ammount = start_ammount

        this.removed_players = []

        this.html_elements = {
            btn: html_element,
            popUp: document.querySelectorAll("form.setting")[id],
            closeBtn: document.querySelectorAll("form.setting > input.setting.close")[id],
            addBtn: document.querySelectorAll("form.setting input.setting.add")[id],
            content: [{
                container: document.querySelectorAll("form.setting div.setting.player")[id],
                name: document.querySelectorAll("form.setting input.setting.player.name")[id],
                color: document.querySelectorAll("form.setting input.setting.player.color")[id],
                remove: document.querySelectorAll("form.setting input.setting.player.remove")[id]
            }]
        }

        this.players = players

        if (isOpener) {
            this.html_elements.addBtn.onclick = this.add_field
            this.html_elements.content[0].remove.onclick = this.remove_field
            this.html_elements.btn.onclick = this.open
            this.html_elements.closeBtn.onclick = this.close
        }
    }

    add_field = () => {
        console.log("Log: Adding player")

        this.html_elements.content.push({ container: document.createElement("div"), name: document.createElement("input"), color: document.createElement("input"), remove: document.createElement("input") })

        let idx = this.html_elements.content.length - 1

        this.html_elements.content[idx].container.classList.add("setting", "player")
        this.html_elements.content[idx].name.classList.add("setting", "player", "name")
        this.html_elements.content[idx].color.classList.add("setting", "player", "color")
        this.html_elements.content[idx].remove.classList.add("setting", "player", "remove")

        this.html_elements.content[idx].name.setAttribute("type", "text")
        this.html_elements.content[idx].name.setAttribute("id", `${idx + 1}`)
        this.html_elements.content[idx].name.setAttribute("placeholder", `player${idx + 1}`)

        this.html_elements.content[idx].color.setAttribute("type", "color")
        this.html_elements.content[idx].color.setAttribute("value", `#${Math.floor(Math.random()*16777215).toString(16)}`)
        this.html_elements.content[idx].color.setAttribute("id", `${idx + 1}`)

        this.html_elements.content[idx].remove.setAttribute("type", "button")
        this.html_elements.content[idx].remove.setAttribute("id", `${idx + 1}`)
        this.html_elements.content[idx].remove.onclick = this.remove_field

        this.html_elements.content[idx].container.appendChild(this.html_elements.content[idx].color)
        this.html_elements.content[idx].container.appendChild(this.html_elements.content[idx].name)
        this.html_elements.content[idx].container.appendChild(this.html_elements.content[idx].remove)
        this.html_elements.popUp.appendChild(this.html_elements.content[idx].container)

        this.players.push(new Player(`player${idx + 1}`, this.start_ammount, "black", this.html_elements.content.length - 1))
    }

    remove_field = (e) => {
        console.log("Log: Removing player")
        if (this.players.length == 1) {
            return
        }

        let id = e.target.getAttribute("id")
        let idx = find_by_id(this.html_elements.content, id)

        this.removed_players.push(idx)

        this.players.splice(idx, 1)
        this.html_elements.popUp.removeChild(this.html_elements.content[idx].container)
        this.html_elements.content.splice(idx, 1)

        console.log(this.players)
    }

    open = () => {
        this.html_elements.popUp.classList.add("display")
        this.html_elements.popUp.classList.remove("hidden")
    }

    close = () => {
        this.html_elements.popUp.classList.add("hidden")
        this.html_elements.popUp.classList.remove("display")

        this.html_elements.content.forEach((e, idx) => {
            if (e.name.value != "") {
                this.players[idx].name = e.name.value
            }
            this.players[idx].color = e.color.value
        })

        leaderboard.update_leaderboard(this.players, this.removed_players)
        this.removed_players = []
    }

    // TODO: controllare se serve ancora
    index_from_object(id) {
        let idx = -1
        this.html_elements.content.forEach((e, i) => {
            if (e.color.getAttribute("name") == id) {
                idx = i
            }
        })

        return idx
    }
}

export const setting = new Settings()