// parts
// import { leaderboard } from "./leaderboard.js"
// import { setting } from "./setting.js"
// import { better } from "./better.js"
import { wheel } from "./wheel.js"
import { Player } from "./players.js"

// TODO: eliminare questi
import { bonus } from "./bonus.js"
import { listener } from "./listener.js"

// parts setting
const PARTS = new Map([["1", 21], ["2", 13], ["5", 7], ["10", 4], ["crazyTime", 1], ["coinFlip", 4], ["cashHunt", 2], ["pachinco", 2]])
const PARTS_LOADOUT = ["crazyTime", "1", "2", "5", "1", "2", "pachinco", "1", "5", "1", "2", "1", "coinFlip", "1", "2", "1", "10", "2", "cashHunt", "1", "2", "1", "5", "1", "coinFlip", "1", "5", "2", "10", "1", "pachinco", "1", "2", "5", "1", "2", "coinFlip", "1", "10", "1", "5", "1", "cashHunt", "1", "2", "5", "1", "2", "coinFlip", "2", "1", "10", "2", "1"]
const COLORS = new Map([["1", "lightblue"], ["2", "yellow"], ["5", "pink"], ["10", "black"], ["crazyTime", "red"], ["coinFlip", "blue"], ["cashHunt", "green"], ["pachinco", "purple"]])
const POSSIBLE_BET = ["1", "2", "5", "10", "coinFlip", "pachinco", "cashHunt", "crazyTime"]
const VALUES = new Map([["1", 1], ["2", 2], ["5", 5], ["10", 10], ["crazyTime", -1], ["coinFlip", -1], ["cashHunt", -1], ["pachinco", -1]])
const MAXES = new Map([["1", 100], ["2", 100], ["5", 100], ["10", 100], ["crazyTime", 100], ["coinFlip", 100], ["cashHunt", 100], ["pachinco", 100]])

// wheel settings
const RADIUS = 350 // px
const T_SPIN = 10 // s
const VEL = {
    min: 65,
    max: 115
}
const SIZE_POINTER = 25 // px

// fish
const FISHES_AMMOUNT = [.1, 1, 10, 100, 1000]    

// settings
const SETTINGS_NAMES = ["Player settings"]
const SETTINGS_TYPE = new Map([["Player settings", true]])
const START_AMMOUNT = 100 // $

// bonus
const BONUS_SETTING = {
    coin_flip: {
        COIN_FLIP_MULTIPLIER: {value: [2, 5, 10], percentage: [50, 30, 20]},
        PSEUDOWHEEL_T: 10, // s
        PSEUDOWHEEL_G: 12, // spin
        COIN_T: 10, // s
        COIN_SPEED: {min: 8, max: 13},
        WAIT: {
            start: 1, // s
            end: 4, // s
        },
    },
    pachinco: {},
    cash_hunt: {},
    crazy_time: {
        PARTS_LOADOUT: ["x2", "x1", "x2", "x1", "x2", "x1", "x2", "x1"],
        PARTS: new Map([["x1", 4], ["x2", 4]]),
        RADIUS: 350,
        COLORS: new Map([["x1", "yellow"], ["x2", "red"]]),
        T_SPIN: 10,
        SPEED: {min: 65, max: 115},
        SIZE_POINTER: 25,
    },

    waiting_time: 2, // s
}

class App {
    constructor() {
        let start_player = new Player("Player1", START_AMMOUNT, "black", 0)
        const {pachinco, cash_hunt, crazy_time} = bonus

        crazy_time.set(BONUS_SETTING.crazy_time.PARTS_LOADOUT, BONUS_SETTING.crazy_time.PARTS, BONUS_SETTING.crazy_time.RADIUS, 
            BONUS_SETTING.crazy_time.COLORS, BONUS_SETTING.crazy_time.T_SPIN, BONUS_SETTING.crazy_time.SPEED, BONUS_SETTING.crazy_time.SIZE_POINTER)

        listener.set_listener({name: "ArrowUp", func: crazy_time.attach})
        // better.set(POSSIBLE_BET, VALUES, COLORS, MAXES, FISHES_AMMOUNT, start_player)
        // setting.set(SETTINGS_NAMES, SETTINGS_TYPE, START_AMMOUNT, start_player)
        // leaderboard.set(start_player)
        // wheel.set(["coinFlip", "1", "coinFlip"], new Map([["coinFlip", 2]]), RADIUS, COLORS, 2, VEL, 200, BONUS_SETTING)
    }

    start() {
        // wheel.start()
    }

    add_player() {
    }
}

const app = new App()
app.start()