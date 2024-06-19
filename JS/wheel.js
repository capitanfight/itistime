import { Canvas } from "./canvas.js"
import { Listener } from "./listener.js"
import { better } from "./better.js"
import { leaderboard } from "./leaderboard.js"
import { bonus, end } from "./bonus.js"

const listener = new Listener()
const canvas = new Canvas(window.innerWidth, window.innerHeight, document.body)
const NAMES = new Map([["crazyTime", "crazy time"], ["coinFlip", "coin flip"], ["cashHunt", "cash hunt"], ["pachinco", "pachinco"]])
const { coin_flip } = bonus

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
            }
        }

        this.create_pointer()
    }

    create_pointer() {
        canvas.draw_triangle("lightgreen", this.pointer.p1, this.pointer.p2, this.pointer.p3)
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
        if (!this.stop) {
            return
        }

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
            this.isBonus = true
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

                        case "pachinco":

                            break

                        case "cashHun":

                            break

                        case "crazyTime":
                            bonus = new CrazyTime()
                            setTimeout(() => {
                                let { SIZE_POINTER, SPEED, T_SPIN, COLORS, RADIUS, PARTS, PARTS_LOADOUT, D_ANG, WAIT } = this.bonus_setting.crazy_time

                                bonus.set(PARTS_LOADOUT, PARTS, RADIUS, COLORS, T_SPIN, SPEED, SIZE_POINTER, undefined, D_ANG)
                                bonus.addWaitSetting(WAIT)
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
        let winner = this.slices_loadout[this.winner]
        console.log(winner)

        better.pay_bet(winner)
    }
}

class CrazyTime extends Wheel {
    constructor() {
        super()

        this.isAttached = false
    }

    set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting, d_ang) {
        this.t_set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer, bonus_setting)

        this.pointer = [undefined, this.pointer, undefined]

        let ang = Math.PI / 2 + d_ang
        this.pointer[0] = {
            p1: {
                x: this.c.x + Math.cos(ang) * radius + Math.cos(ang) * size_pointer,
                y: this.c.y + Math.sin(ang) * radius + Math.sin(ang) * size_pointer
            },
            p2: {
                x: this.c.x + Math.cos(ang + Math.PI / 6) * radius + Math.cos(ang + Math.PI / 6) * size_pointer,
                y: this.c.y + Math.sin(ang + Math.PI / 6) * radius + Math.sin(ang + Math.PI / 6) * size_pointer
            },
            p3: {
                x: this.c.x + Math.cos(ang - Math.PI / 6) * radius + Math.cos(ang - Math.PI / 6) * size_pointer,
                y: this.c.y + Math.sin(ang - Math.PI / 6) * radius + Math.sin(ang - Math.PI / 6) * size_pointer
            }
        }

        ang = Math.PI / 2 - d_ang
        this.pointer[2] = {
            p1: {
                x: this.c.x + Math.cos(ang) * radius + Math.cos(ang) * size_pointer,
                y: this.c.y + Math.sin(ang) * radius + Math.sin(ang) * size_pointer
            },
            p2: {
                x: this.c.x + Math.cos(ang + Math.PI / 6) * radius + Math.cos(ang + Math.PI / 6) * size_pointer,
                y: this.c.y + Math.sin(ang + Math.PI / 6) * radius + Math.sin(ang + Math.PI / 6) * size_pointer
            },
            p3: {
                x: this.c.x + Math.cos(ang - Math.PI / 6) * radius + Math.cos(ang - Math.PI / 6) * size_pointer,
                y: this.c.y + Math.sin(ang - Math.PI / 6) * radius + Math.sin(ang - Math.PI / 6) * size_pointer
            }
        }
    }

    create_pointer() {
        if ('p1' in this.pointer) {
            canvas.draw_triangle("lightgreen", this.pointer.p1, this.pointer.p2, this.pointer.p3)
        } else {
            this.pointer.forEach(pointer => {
                canvas.draw_triangle("lightgreen", pointer.p1, pointer.p2, pointer.p3)
            })
        }
    }

    start = () => {
        // this.spin()
    }

    addWaitSetting(wait_time) {
        this.wait = wait_time
    }

    check_sliecs() {
        let bonus_value = -1

        this.slices_array.forEach((slice, id) => {
            if (collide(this.pointer.p1, slice.p1, slice.p2)) {
                let v = this.slices_loadout[id]
                let b = v.slice(1)
                bonus_value = Number(b)
            }
        })

        setInterval(() => {
            this.detach()
            end(bonus_value, 3)
        }, this.wait.end * 10e2)
    }

    attach = () => {
        if (!this.isAttached) {
            console.log("Log: attaching crazy time.")

            this.isAttached = true

            canvas.clear()
            this.createSlices()
            this.create_pointer()

            setTimeout(this.start, this.wait.start * 10e2)
        }
    }

    detach = () => {
        if (this.isAttached) {
            console.log("Log: detaching crazy time.")

            this.isAttached = false

            canvas.clear()
            wheel.createSlices()
            wheel.create_pointer()
        }
    }
}

export const wheel = new MainWheel()
export const crazy_time = new CrazyTime()