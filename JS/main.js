// parts
import { leaderboard } from "./leaderboard.js"
import { setting } from "./setting.js"
import { better } from "./better.js"
import { wheel } from "./wheel.js"
import { Player } from "./players.js"

// TODO: eliminare questi
import { bonus } from "./bonus.js"
import { listener } from "./utils/listener.js"

// parts setting
const PARTS = new Map([["1", 21], ["2", 13], ["5", 7], ["10", 4], ["crazyTime", 1], ["coinFlip", 4], ["cashHunt", 2], ["pachinko", 2]])
const PARTS_LOADOUT = ["crazyTime", "1", "2", "5", "1", "2", "pachinko", "1", "5", "1", "2", "1", "coinFlip", "1", "2", "1", "10", "2", "cashHunt", "1", "2", "1", "5", "1", "coinFlip", "1", "5", "2", "10", "1", "pachinko", "1", "2", "5", "1", "2", "coinFlip", "1", "10", "1", "5", "1", "cashHunt", "1", "2", "5", "1", "2", "coinFlip", "2", "1", "10", "2", "1"]
const COLORS = new Map([["1", "#00a3d4"], ["2", "#d69e02"], ["5", "#d47dca"], ["10", "#5811c2"], ["crazyTime", "#d6040b"], ["coinFlip", "#1103a3"], ["cashHunt", "#156315"], ["pachinko", "#9e40c9"]])
const POSSIBLE_BET = ["1", "2", "5", "10", "coinFlip", "pachinko", "cashHunt", "crazyTime"]
const VALUES = new Map([["1", 1], ["2", 2], ["5", 5], ["10", 10], ["crazyTime", -1], ["coinFlip", -1], ["cashHunt", -1], ["pachinko", -1]])
const MAXES = new Map([["1", 1000], ["2", 1000], ["5", 750], ["10", 500], ["crazyTime", 100], ["coinFlip", 250], ["cashHunt", 200], ["pachinko", 200]])

// wheel settings
const RADIUS = 350 // px
const T_SPIN = 10 // s
const VEL = {
    min: 65.345,
    max: 115.611
}
const SIZE_POINTER = 25 // px

// fish
const FISHES_AMMOUNT = [1, 5, 25, 100, 500, 1000]

// settings
const SETTINGS_NAMES = ["Player settings"]
const SETTINGS_TYPE = new Map([["Player settings", true]])
const START_AMMOUNT = 10000 // $

// bonus
const BONUS_SETTING = {
    coin_flip: {
        COIN_FLIP_MULTIPLIER: { value: [2, 5, 10, 20, 50, 100], percentage: [30, 21, 19, 13, 10, 7] },
        PSEUDOWHEEL_T: 10, // s
        PSEUDOWHEEL_G: 12, // spin
        COIN_T: 10, // s
        COIN_SPEED: { min: 8, max: 13 },
        WAIT: {
            start: 1, // s
            end: 4, // s
        },
    },
    pachinko: {
        POSSIBLE_MULTIPLIER: {values: ["x5", "x7", "x10", "x15", "double", "x20", "x50", "x100"], percentages: [22, 18, 14, 12, 11, 10, 8, 5], length: 15},
        // LOADOUT: ["x5", "x7", "x10", "x15", "x20", "double", "x50", "x100", "x50", "double", "x20", "x15", "x10", "x7", "x5"],
        SIZE: { width: 600, height: -1 }, // px
        COLORS: { background: "#9607ba", splitter: "gold", text: "white" },
        ZONE: { height: 50, width: -1, splitter: { height: -1, width: 3 } }, // px
        OBSTACLES: {
            horizontal: {
                even: 13,
                odd: 14,
            },
            vertical: 10,
            size: 4, // px(radius)
            color: "#dbb32e", // px
        },
        BALL: {
            color: "white",
            radius: 7, // px
        },
        GRID_SUBDIVISION: {
            v: 15,
            h: 10,
        },
        RANDOMIZER: 5, // px
        WAIT: {
            start: 3, // s
            end: 4, // s
        },
    },
    cash_hunt: {
        POSSIBLE_MULTIPLIER: {values: ["x5", "x7", "x10", "x15", "x20", "x50", "x75","x100"], percentages: [25, 20, 14, 12, 11, 10, 5, 3], length: undefined},
        POSSIBLE_COVERS: ["apple", "hat", "iceCream", "rabbit", "cactus", "present", "target", "star"],
        N_MULTIPLIER: {
            r: 12,
            c: 9,
        },
        PSEUDOWHEEL_T: 10, // s
        PSEUDOWHEEL_G: 12, // spin

        WAIT: {
            start: 3, // s
            end: 4, // s
        },
    },
    crazy_time: {
        PARTS_LOADOUT: ["x100", "x20", "x25", "x15", "double", "x25", "x35", "x25",
            "double", "x20", "x15", "x25", "x50", "x15", "x35", "x15", "double", "x25",
            "x50", "x20", "double", "x25", "x15", "x25", "double", "x20", "x35", "x25",
            "x100", "x15", "x25", "x20", "double", "x25", "x35", "x20", "x50", "x25",
            "x20", "x15", "double", "x25", "x50", "x25", "double", "x15", "x25", "x20",
            "x50", "x15", "x35", "x25", "double", "x20", "x25", "x15", "double", "x25",
            "x50", "x20", "double", "x25", "x35", "x15"
        ],
        PARTS: null,
        RADIUS: 350,
        COLORS: new Map([["x100", "pink"], ["x50", "#00a3d4"], ["x35", "darkgreen"], ["x25", "orange"], ["x20", "red"], ["x15", "purple"], ["double", "grey"]]),
        T_SPIN: 10,
        SPEED: { min: 65.345, max: 115.611 },
        POINTER_COLORS: ["green", "blue", "#d1bd04"],
        SIZE_POINTER: 25,
        D_ANG: Math.PI / 6,
        WAIT: {
            start: 3, // s
            end: 4, // s
        },
    },

    waiting_time: 2, // s
}

class App {
    constructor() {
        let start_player = new Player("Player1", START_AMMOUNT, "black", 0)

        wheel.set(["cashHunt", "crazyTime", "coinFlip", "pachinko","cashHunt", "crazyTime", "coinFlip", "pachinko","cashHunt", "crazyTime", "coinFlip", "pachinko"], PARTS, RADIUS, COLORS, 2, VEL, 100, BONUS_SETTING)
        better.set(POSSIBLE_BET, VALUES, COLORS, MAXES, FISHES_AMMOUNT, start_player)
        setting.set(SETTINGS_NAMES, SETTINGS_TYPE, START_AMMOUNT, start_player)
        leaderboard.set(start_player)
        // wheel.set(PARTS_LOADOUT, PARTS, RADIUS, COLORS, T_SPIN, VEL, SIZE_POINTER, BONUS_SETTING)
    }

    start() {
        wheel.start()
    }

    add_player() {
    }
}

const app = new App()
app.start()