import { canvas } from "./utils/canvas.js"
import { Listener } from "./utils/listener.js"
import { better } from "./better.js"
import { leaderboard } from "./leaderboard.js"
import { bonus, end } from "./bonus.js"

const listener = new Listener()
const NAMES = new Map([["crazyTime", "crazy time"], ["coinFlip", "coin flip"], ["cashHunt", "cash hunt"], ["pachinko", "pachinko"]])
const { coin_flip, pachinko, cash_hunt } = bonus

function collide(v, p1, p2) {
    if (p1.x <= v.x && v.x <= p2.x &&
        (v.y >= p1.y || v.y >= p2.y)) {
        return true
    }

    return false
}

export class Wheel {
    constructor() {
        console.log("Log: Creating wheel.")

        this.movedAngle = 0

        this.c = {
            x: canvas.html_element.width / 2,
            y: canvas.html_element.height / 2
        }

        this.start_t = 0

        this.stop = true

        this.slices_array = []
        this.blockSpin = false
    }

    t_set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting) {
        this.bonus_setting = bonus_setting
        this.t_spin = t_spin
        this.speed = speed

        this.radius = radius
        this.colours = colors

        this.standard_slices_loadout = slices_loadout
        this.slices_loadout = slices_loadout

        this.slices = slices

        this.n_slices = this.standard_slices_loadout.length

        this.createSlices()

        this.pointer = {
            p1: {
                x: this.c.x,
                y: this.c.y - radius + size_pointer + 5
            },
            p2: {
                x: this.c.x - size_pointer,
                y: this.c.y - radius - size_pointer
            },
            p3: {
                x: this.c.x + size_pointer,
                y: this.c.y - radius - size_pointer
            },
            c: {
                x: this.c.x,
                y: this.c.y - radius,
            },
            isCenter: true,
        }

        this.create_pointer()
    }

    create_pointer() {
        canvas.draw_triangle("#cde03d", this.pointer.p1, this.pointer.p2, this.pointer.p3)
    }

    createSlices() {
        canvas.clear()

        let ang = (Math.PI * 2) / this.n_slices

        for (let i = 0; i < this.n_slices; i++) {
            if (this.slices_array.length != this.n_slices) {
                this.slices_array.push(new Slice(i, this.slices_loadout[i], ang, this.colours.get(this.slices_loadout[i])))
            }
            this.slices_array[i].createSlice(this.c, this.radius, this.movedAngle)
        }

        canvas.draw_circle(this.c, this.radius / 5, "red", true, "gold", 10)
        canvas.draw_text({ x: this.c.x, y: this.c.y - 20 }, "yellow", "Crazy", 0, "center", 20)
        canvas.draw_text({ x: this.c.x, y: this.c.y + 20 }, "yellow", "Time!", 0, "center", 20)
    }

    stop_spin = () => {
        console.log("Log: Stop spin")

        this.stop = true

        this.pay_bet()
    }

    spin = () => {
        if (!this.stop || this.blockSpin) {
            return
        }

        this.blockSpin = true

        console.log("Log: Start spin")

        let { min, max } = this.speed

        this.v_ini = (Math.random() * 100) % (max - min) + min
        this.a = -(this.v_ini / (this.t_spin))
        this.stop = false

        this.update()
    }

    update = (t) => {
        if (t === undefined) {
            this.firstFrame = true
            t = 0
        } else {
            if (this.firstFrame) {
                this.start_t = t * 10e-4
                this.firstFrame = false
            }
            t = (t * 10e-4) - this.start_t
        }

        this.v = this.v_ini + this.a * t

        this.movedAngle = ((1 / 2) * this.a * Math.pow(t, 2)) + (this.v_ini * t)

        if (this.v <= 0) {
            this.stop = true
            this.check_sliecs()
        }

        this.createSlices()
        this.create_pointer()

        if (!this.stop) {
            requestAnimationFrame(this.update)
        }
    }

    check_sliecs() {
        // prototype of function
    }

    start() {
        canvas.start()
    }
}

class Slice {
    constructor(id, name, ang, color) {
        this.id = id

        this.p1 = this.p2 = {}

        this.name = name
        this.color = color
        this.ang = ang
        this.isBonus = false

        this.dir = "o"
        if (isNaN(name)) {
            this.dir = "v"
            this.isBonus = (name.length == 1 || isNaN(name.slice(1)))
        }
    }

    createSlice(v, r, movedAngle) {
        let offset = (this.ang * this.id + movedAngle)

        this.p1 = {
            x: Math.cos(offset) * r + v.x,
            y: Math.sin(offset) * r + v.y
        }
        this.p2 = {
            x: Math.cos(offset + this.ang) * r + v.x,
            y: Math.sin(offset + this.ang) * r + v.y
        }

        canvas.draw_slice(this.color, v, this.p1, this.p2, this.ang, this.id, movedAngle)
        this.create_nameTag(movedAngle)
    }

    create_nameTag(movedAngle) {
        let rotAng = ((this.ang * this.id + (this.ang / 2) + movedAngle) + (Math.PI / 2)), pos = "center", has_background = true, name = this.name
        if (this.dir == "v") {
            rotAng = (this.ang * this.id + (this.ang / 2) + movedAngle) + Math.PI
            has_background = false
            pos = "left"
            if (NAMES.get(this.name) !== undefined) {
                name = NAMES.get(this.name)
            } else {
                name = this.name
            }
        }

        let m = {
            x: (this.p1.x + this.p2.x) / 2 + (-Math.cos(this.ang * this.id + (this.ang / 2) + movedAngle) * 10),
            y: (this.p1.y + this.p2.y) / 2 + (-Math.sin(this.ang * this.id + (this.ang / 2) + movedAngle) * 10)
        }

        canvas.draw_text(m, "white", name, rotAng, pos, 25, has_background)
    }
}

class MainWheel extends Wheel {
    constructor() {
        super()

        listener.set_listener({ name: "Space", func: this.spin })
        canvas.html_element.setAttribute("id", "mainWheel")
    }

    set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting) {
        this.t_set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting)
    }

    // overide
    check_sliecs() {
        this.winner = -1
        this.slices_array.forEach((slice, id) => {
            if (collide(this.pointer.p1, slice.p1, slice.p2)) {
                this.winner = id
                if (slice.isBonus) {
                    console.log("Log: starting bonus round.")
                    let bonus
                    switch (slice.name) {
                        case "coinFlip":
                            bonus = new coin_flip()
                            setTimeout(() => {
                                let { COIN_FLIP_MULTIPLIER, PSEUDOWHEEL_T, PSEUDOWHEEL_G, COIN_SPEED, COIN_T, WAIT } = this.bonus_setting.coin_flip

                                bonus.set(COIN_FLIP_MULTIPLIER, PSEUDOWHEEL_T, PSEUDOWHEEL_G, COIN_SPEED, COIN_T, WAIT)
                                bonus.attach()
                            }, this.bonus_setting.waiting_time * 10e2)

                            break

                        case "pachinko":
                            bonus = new pachinko()
                            setTimeout(() => {
                                let { LOADOUT, POSSIBLE_MULTIPLIER, SIZE, COLORS, ZONE, OBSTACLES, BALL, GRID_SUBDIVISION, RANDOMIZER, WAIT } = this.bonus_setting.pachinko

                                bonus.set(LOADOUT, POSSIBLE_MULTIPLIER, SIZE, COLORS, ZONE, OBSTACLES, BALL, GRID_SUBDIVISION, RANDOMIZER, WAIT)
                                bonus.attach()
                            }, this.bonus_setting.waiting_time * 10e2)

                            break

                        case "cashHunt":
                            bonus = new cash_hunt()
                            setTimeout(() => {
                                let { POSSIBLE_MULTIPLIER, POSSIBLE_COVERS, N_MULTIPLIER, PSEUDOWHEEL_G, PSEUDOWHEEL_T, WAIT } = this.bonus_setting.cash_hunt

                                bonus.set(POSSIBLE_MULTIPLIER, POSSIBLE_COVERS, N_MULTIPLIER, PSEUDOWHEEL_G, PSEUDOWHEEL_T, WAIT)
                                bonus.attach()
                            }, this.bonus_setting.waiting_time * 10e2)

                            break

                        case "crazyTime":
                            bonus = new CrazyTime()
                            setTimeout(() => {
                                let { SIZE_POINTER, SPEED, T_SPIN, COLORS, RADIUS, PARTS, PARTS_LOADOUT, D_ANG, WAIT, POINTER_COLORS } = this.bonus_setting.crazy_time

                                bonus.set(PARTS_LOADOUT, PARTS, RADIUS, COLORS, T_SPIN, SPEED, SIZE_POINTER, undefined, D_ANG)
                                bonus.addAdditionalSetting(WAIT, POINTER_COLORS)
                                bonus.attach()
                            }, this.bonus_setting.waiting_time * 10e2)

                            break
                    }
                    if (bonus == undefined) {
                        throw new Error("problem with the bonus selection")
                    }
                } else {
                    this.announce_winner()
                }
            }
        })

        this.createSlices()
        this.create_pointer()
    }

    announce_winner() {
        this.blockSpin = false

        let winner = this.slices_loadout[this.winner]
        // console.log(winner)

        better.pay_bet(winner)
    }
}

function get_elementIdx_by_id(elements, id, attribute_name) {
    let idx = -1

    elements.forEach((e, i) => {
        if (e.getAttribute(attribute_name) == id) {
            idx = i
        }
    })

    return idx
}

class CrazyTime extends Wheel {
    constructor() {
        super()

        this.isAttached = false

        this.chosen_pointer = [[], [], []]
        this.current_player
        this.bonus = [undefined, undefined, undefined]
    }

    set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting, d_ang) {
        this.t_set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting)

        this.pointer = [undefined, this.pointer, undefined]

        let ang = Math.PI / 2 + d_ang
        this.pointer[0] = {
            p1: {
                x: this.c.x + (Math.cos(ang) * radius) - (Math.cos(ang) * size_pointer),
                y: this.c.y - (Math.sin(ang) * radius) + (Math.sin(ang) * size_pointer)
            },
            p2: {
                x: this.c.x + (Math.cos(ang + Math.PI / 50) * radius) + (Math.cos(ang + Math.PI / 50) * size_pointer),
                y: this.c.y - (Math.sin(ang + Math.PI / 50) * radius) - (Math.sin(ang + Math.PI / 50) * size_pointer)
            },
            p3: {
                x: this.c.x + (Math.cos(ang - Math.PI / 50) * radius) + (Math.cos(ang - Math.PI / 50) * size_pointer),
                y: this.c.y - (Math.sin(ang - Math.PI / 50) * radius) - (Math.sin(ang - Math.PI / 50) * size_pointer)
            },
            c: {
                x: this.c.x + (Math.cos(ang) * radius),
                y: this.c.y - (Math.sin(ang) * radius),
            },
            isCenter: false,
        }

        ang = Math.PI / 2 - d_ang
        this.pointer[2] = {
            p1: {
                x: this.c.x + Math.cos(ang) * radius - Math.cos(ang) * size_pointer,
                y: this.c.y - Math.sin(ang) * radius + Math.sin(ang) * size_pointer
            },
            p2: {
                x: this.c.x + (Math.cos(ang + Math.PI / 50)) * radius + (Math.cos(ang + Math.PI / 50)) * size_pointer,
                y: this.c.y - (Math.sin(ang + Math.PI / 50)) * radius - (Math.sin(ang + Math.PI / 50)) * size_pointer
            },
            p3: {
                x: this.c.x + (Math.cos(ang - Math.PI / 50)) * radius + (Math.cos(ang - Math.PI / 50)) * size_pointer,
                y: this.c.y - (Math.sin(ang - Math.PI / 50)) * radius - (Math.sin(ang - Math.PI / 50)) * size_pointer
            },
            c: {
                x: this.c.x + (Math.cos(ang) * radius),
                y: this.c.y - (Math.sin(ang) * radius),
            },
            isCenter: false,
        }
    }

    create_pointer() {
        if ('p1' in this.pointer) {
            canvas.draw_triangle("lightgreen", this.pointer.p1, this.pointer.p2, this.pointer.p3)
        } else {
            this.pointer.forEach((pointer, idx) => {
                canvas.draw_triangle(this.pointer_colors[idx], pointer.p1, pointer.p2, pointer.p3)
            })
        }
    }

    add_choice() {
        this.html_elements = {
            container: document.createElement("div"),
            choices: [undefined, undefined, undefined],
            player_container: document.createElement("div"),
            players: [],
        }

        this.html_elements.container.classList.add("container", "crazyTime")
        this.html_elements.player_container.classList.add("player_container", "crazyTime")

        this.html_elements.choices.forEach((e, idx) => {
            e = document.createElement("button")

            e.classList.add("element", "crazyTime")
            e.setAttribute("n_pointer", idx)

            e.style.backgroundColor = this.pointer_colors[idx]

            e.onclick = this.choice

            this.html_elements.container.appendChild(e)
        })

        for (let i = 0; i < better.possible_bet[7].players.length; i++) {
            let e = document.createElement("button")

            e.classList.add("player", "crazyTime")
            e.style.backgroundColor = better.possible_bet[7].players[i].color

            e.setAttribute("n_player", better.possible_bet[7].players[i].id)

            e.onclick = this.select_player

            this.html_elements.player_container.appendChild(e)
            this.html_elements.players.push(e)
        }

        document.body.appendChild(this.html_elements.container)
        document.body.appendChild(this.html_elements.player_container)

        // setTimeout(this.choice, this.wait.start*10e2)
        if (this.html_elements.players.length == 0) {
            document.body.removeChild(this.html_elements.player_container)
            this.spin()
        }
    }

    remove_choice() {
        document.body.removeChild(this.html_elements.container)
    }

    select_player = (e) => {
        this.current_player = e.target.getAttribute("n_player")
    }

    choice = (e) => {
        if (this.current_player == undefined) return

        this.chosen_pointer[e.target.getAttribute("n_pointer")].push(this.current_player)

        let idx = get_elementIdx_by_id(this.html_elements.players, this.current_player, "n_player")

        this.html_elements.player_container.removeChild(this.html_elements.players[idx])
        this.html_elements.players.splice(idx, 1)
        this.current_player = undefined


        if (this.html_elements.players.length == 0) {
            document.body.removeChild(this.html_elements.player_container)
            this.spin()
        }
    }

    addAdditionalSetting(wait_time, pointer_colors) {
        this.wait = wait_time
        this.pointer_colors = pointer_colors
    }

    check_sliecs() {
        let bonus_values = [undefined, undefined, undefined]
        let changePointer = { change: false, p: [] }
        this.blockSpin = false
        let isReadyToSpin = false

        this.slices_array.forEach((slice, id) => {
            this.pointer.forEach((pointer, idx) => {
                if (collide(pointer.isCenter ? pointer.p1 : pointer.c, slice.p1, slice.p2)) {
                    if (slice.isBonus) {
                        if (this.chosen_pointer[idx].length !== 0) {
                            changePointer.change = true
                            changePointer.p.push(pointer)
                        } else {
                            bonus_values[idx] = null
                        }
                    } else {
                        bonus_values[idx] = Number(this.slices_loadout[id].slice(1))
                    }
                }
            })
        })

        if (changePointer.change) {
            isReadyToSpin = true
            this.pointer = changePointer.p
            this.slices_array.forEach(slice => {
                if (slice.isBonus) return
                slice.name = `x${slice.name.slice(1) * 2}`
            })

            this.slices_loadout = this.slices_loadout.map(e => isNaN(e.slice(1)) ? e : `x${e.slice(1) * 2}`)

            setTimeout(this.spin, this.wait.start * 10e2)
        }

        let j = 0
        for (let i = 0; i < this.bonus.length; i++) {
            if (this.bonus[i] === undefined) {
                if (bonus_values[i] !== undefined) {
                    this.bonus[i] = {
                        value: bonus_values[i],
                        players: this.chosen_pointer[i].map(e => Number(e))
                    }
                } else {
                    this.bonus[i] = {
                        value: undefined,
                        players: this.chosen_pointer[i].map(e => Number(e))
                    }
                }
            } else {
                if (this.bonus[i].value === undefined) {
                    this.bonus[i].value = bonus_values[j]
                    j++
                }
            }
        }

        let canEnd = true
        this.bonus.forEach(b => {
            if (b.value == undefined) canEnd = false
        })

        if (canEnd || !isReadyToSpin) {
        // if (false) {
            setTimeout(() => {
                this.detach()
                end(this.bonus, 3)
            }, this.wait.end * 10e2)
        } else {
            throw new Error("Somthing is gone wrong")
        }
    }

    attach = () => {
        if (!this.isAttached) {
            console.log("Log: attaching crazy time.")

            this.isAttached = true

            canvas.clear()
            this.createSlices()
            this.create_pointer()
            this.add_choice()
        }
    }

    detach = () => {
        if (this.isAttached) {
            console.log("Log: detaching crazy time.")

            this.isAttached = false

            this.remove_choice()

            canvas.clear()
            wheel.createSlices()
            wheel.create_pointer()
        }
    }
}

export const wheel = new MainWheel()
export const crazy_time = new CrazyTime()