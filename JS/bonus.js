import { better } from "./better.js"
import { wheel } from "./wheel.js"
import { canvas } from "./utils/canvas.js"
import { setting } from "./setting.js"

const COIN_COLORS = ["red", "blue"]

export function end(multiplier, id) {
    better.possible_bet[id + 4].value = multiplier

    wheel.announce_winner()
}

class PseudoWheel {
    constructor({ value, percentage }, html_elements, t_tot, n_giri, master) {
        this.#checkForErrors(value, percentage, html_elements, t_tot, n_giri)

        this.elements = value
        this.master = master
        this.percentage = percentage

        this.t_tot = t_tot
        this.g_base = n_giri

        this.multiplier = 0

        this.stop = true

        this.#createHtmlElements(html_elements)
    }

    #checkForErrors(value, percentage, html_elements, t_tot, n_giri) {
        const { type, dir, n_displayedElements, e_class } = html_elements

        // error for value e percentage
        if (value.length !== percentage.length) { throw new Error("cannot accept a numbers of values different for 'value' and 'percentage'.") }

        // ---- errors for html_elements ----
        // errors for html_elements->type
        try { document.createElement(type) }
        catch (error) { throw new Error("the value passed for 'type' doesn't exist.") }

        // error for html_elements->dir
        if (dir != "v" && dir != "h") { throw new Error("cannot accept value for propriety 'dir' different from 'v'->vertical or 'h'->horizzontal.") }

        // error for html_elements->n_displayedElements
        if (n_displayedElements <= 0) { throw new Error("cannot accept value for propriety 'n_displayedElements' that is less or equal than zero.") }

        // error for t_tot
        if (t_tot <= 0) { throw new Error("cannot accept value for propriety 't_tot' that is less than zero.") }

        // error for n_giri
        if (n_giri <= 0) { throw new Error("cannot accept value for propriety 'n_giri' that is less or equal than zero.") }
    }

    #createHtmlElements(html_elements) {
        const { type, dir, n_displayedElements, e_class, size, id } = html_elements
        const { inner_size, outer_size } = size

        this.displayed_elements = n_displayedElements

        let size_n = {
            inner_size: {
                w: Number(size.inner_size.w.slice(0, size.inner_size.w.length - 2)),
                h: Number(size.inner_size.h.slice(0, size.inner_size.h.length - 2)),
            },
            outer_size: {
                w: Number(size.outer_size.w.slice(0, size.outer_size.w.length - 2)),
                h: Number(size.outer_size.h.slice(0, size.outer_size.h.length - 2)),
            }
        }

        this.inner_l = dir == 'v' ? size_n.inner_size.h : size_n.inner_size.w
        this.dir = dir

        this.html_elements = {
            container: document.createElement("div"),
            elements: []
        }

        for (let i = 0; i < this.elements.length; i++) {
            let e = document.createElement(type)

            e.classList.add("element", e_class, "pseudoWheel")

            e.textContent = `x${this.elements[i]}`
            e.style.width = inner_size.w
            e.style.height = inner_size.h
            if (dir == 'v') {
                e.style.top = `${i * this.inner_l}px`
            } else {
                e.style.left = `${i * this.inner_l}px`
            }

            if (type == "button") [
                e.onclick = html_elements.func
            ]

            this.html_elements.container.appendChild(e)

            this.html_elements.elements.push(e)
        }

        this.html_elements.container.classList.add("container", e_class, "pseudoWheel")
        if (id != undefined) {
            this.html_elements.container.setAttribute("id", id)
        }

        this.html_elements.container.style.width = outer_size.w
        this.html_elements.container.style.height = outer_size.h

        this.master.appendChild(this.html_elements.container)
    }

    #getMultiplier() {
        let n = Math.random() * 100, t = 0

        for (let i = 0; i < this.elements.length; i++) {
            t += this.percentage[i]

            if (n <= t) {
                return { element: this.elements[i], idx: i }
            }
        }
    }

    get_htmlElement() {
        return this.html_elements
    }

    #place() {
        if (this.curr_element.pos <= -this.inner_l) {
            this.curr_element = this.succ_element[0]
            this.succ_element.push({
                e: this.html_elements.elements[this.n % this.html_elements.elements.length],
                pos: this.inner_l * this.displayed_elements,
                pos_ini: this.curr_element.pos_ini + this.inner_l * this.displayed_elements,
            })
            this.succ_element.splice(0, 1)

            this.n++
        }

        this.curr_element.pos = -(this.d_mov - this.curr_element.pos_ini)

        this.succ_element.forEach((e, idx) => {
            e.pos = this.curr_element.pos + this.inner_l * (idx + 1)
        })

        if (this.dir == 'v') {
            this.curr_element.e.style.top = `${this.curr_element.pos}px`
            this.succ_element.forEach(e => {
                e.e.style.top = `${e.pos}px`
            })
        } else {
            this.curr_element.e.style.left = `${this.curr_element.pos}px`
            this.succ_element.forEach(e => {
                e.e.style.left = `${e.pos}px`
            })
        }
    }

    spin = () => {
        if (!this.stop) {
            return
        }
        console.log("Log: start pseudo-wheel spin.")

        this.stop = false
        this.start_t = 0

        this.curr_element = {
            e: this.html_elements.elements[this.html_elements.elements.length - 1],
            pos: -this.inner_l,
            pos_ini: -this.inner_l,
        }
        this.succ_element = []
        for (let i = 0; i < this.displayed_elements; i++) {
            this.succ_element.push({
                e: this.html_elements.elements[i],
                pos: i * this.inner_l,
                pos_ini: i * this.inner_l,
            })
        }

        this.n = this.displayed_elements

        let { element, idx } = this.#getMultiplier()
        this.result = element

        this.pos_tot = this.g_base * this.elements.length + idx
        this.g_tot = this.pos_tot / this.elements.length
        this.v_ini = (this.pos_tot / this.t_tot) * 2
        this.a = -(this.v_ini / this.t_tot)

        this.#update()
    }

    #update = (t) => {
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
        this.d_mov = ((1 / 2) * this.a * Math.pow(t, 2) + this.v_ini * t) * this.inner_l

        this.#place()

        if (this.v <= 0) {
            this.stop = true
            console.log("Log: stop pseudo-wheel spin.")
            console.log(`result -> ${this.result}`)
        }
        if (!this.stop) {
            requestAnimationFrame(this.#update)
        }
    }

    get_result() {
        return this.result
    }
}

class CoinFlip {
    constructor() {
        this.isAttached = false

        this.html_elements = {
            container: document.createElement("div"),
            coin: document.createElement("div"),
            m1: undefined,
            m2: undefined,
        }

        this.html_elements.container.classList.add("container", "coinFlip")
        this.html_elements.coin.classList.add("coin", "coinFlip")

        this.#getCoin()

        this.html_elements.container.appendChild(this.html_elements.coin)
    }

    set(multipliers, t_mult, g_multi, speed_coin, t_coin, wait) {
        this.multipliers = multipliers
        this.t_mult = t_mult
        this.speed = speed_coin
        this.t_coin = t_coin
        this.wait = wait

        this.m1 = new PseudoWheel(multipliers, { dir: 'v', type: "div", n_displayedElements: 1, e_class: "coinFlip", size: { inner_size: { h: "400px", w: "400px" }, outer_size: { h: "400px", w: "400px" } }, id: "red" }, t_mult, g_multi, this.html_elements.container)
        this.m2 = new PseudoWheel(multipliers, { dir: 'v', type: "div", n_displayedElements: 1, e_class: "coinFlip", size: { inner_size: { h: "400px", w: "400px" }, outer_size: { h: "400px", w: "400px" } }, id: "blue" }, t_mult, g_multi, this.html_elements.container)

        this.html_elements.m1 = this.m1.get_htmlElement()
        this.html_elements.m2 = this.m2.get_htmlElement()

        this.#changeCoinColor(this.#getCoin())
    }

    #start = () => {
        this.m1.spin()
        this.m2.spin()

        this.m1_res = this.m1.get_result()
        this.m2_res = this.m2.get_result()

        setTimeout(this.#tossCoin, this.t_mult * 10e2 + 700)
    }

    #changeCoinColor(n) {
        this.html_elements.coin.style.backgroundColor = COIN_COLORS[n % 2]
    }

    #tossCoin = () => {
        console.log("Log: tossing coin.")

        this.stop = false

        this.coin_res = this.#getCoin()

        let { min, max } = this.speed

        this.v_ini = Math.random() * (max - min) + min
        this.a = -(this.v_ini / this.t_coin)

        this.#update()
    }

    #update = (t) => {
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

        let v = this.v_ini + this.a * t
        let s = (1 / 2) * this.a * Math.pow(t, 2) + this.v_ini * t

        this.#changeCoinColor(s.toFixed(0))

        if (v <= 0) {
            console.log("Log: stop coin toss.")
            this.stop = true

            this.#end()
        }
        if (!this.stop) {
            requestAnimationFrame(this.#update)
        }
    }

    #getCoin() {
        return ((Math.random() + 1).toFixed(0) % 2)
    }

    #end() {
        let res = this.#getCoin()
        this.#changeCoinColor(res)

        console.log(`result -> ${COIN_COLORS[res]}`)

        setInterval(() => {
            this.detach()
            end(res == 1 ? this.m1_res : this.m2_res, 0)
        }, this.wait.end * 10e2)
    }

    attach = () => {
        if (!this.isAttached) {
            console.log("Log: attaching coin flip.")

            this.isAttached = true
            document.body.appendChild(this.html_elements.container)

            setTimeout(this.#start, this.wait.start * 10e2)
        }
    }

    detach = () => {
        if (this.isAttached) {
            console.log("Log: detaching coin flip.")

            this.isAttached = false
            document.body.removeChild(this.html_elements.container)
        }
    }
}

class Pachinko {
    constructor() {
        canvas.start()

        this.isAttached = false
        this.c = {
            x: canvas.w / 2,
            y: canvas.h / 2,
        }

        this.stop = true
    }

    get_loadout(possible_multipliers) {
        let arr = []
        let {values, percentages, length} = possible_multipliers

        for (let j = 0; j < length; j++) {
            let n = Math.random() * 100, t = 0

            for (let i = 0; i < values.length; i++) {
                t += percentages[i]

                if (n <= t) {
                    arr.push(values[i])
                    break
                }
            }
        }

        return arr
    }

    set(loadout, possible_multipliers, size, colors, zone, obstacles, ball) {
        if (possible_multipliers == undefined) {
            this.multipliers = {
                strings: loadout,
                values: loadout.map(e => isNaN(e.slice(1)) ? e : Number(e.slice(1))),
            }
        } else if (loadout == undefined) {
            loadout = this.get_loadout(possible_multipliers)

            this.multipliers = {
                strings: loadout,
                values: loadout.map(e => isNaN(e.slice(1)) ? e : Number(e.slice(1))),
            }
        } else {
            throw new Error("define the precedence of the pachinko's loadout.")
        }

        this.size = {
            w: size.width === -1 ? canvas.w : size.width,
            h: size.height === -1 ? canvas.h : size.height,
        }

        this.top_left = {
            x: this.c.x - this.size.w / 2,
            y: this.c.y - this.size.h / 2
        }

        this.top_right = {
            x: this.c.x + this.size.w / 2,
            y: this.c.y - this.size.h / 2
        }

        this.bottom_left = {
            x: this.c.x - this.size.w / 2,
            y: this.c.y + this.size.h / 2
        }

        this.bottom_right = {
            x: this.c.x + this.size.w / 2,
            y: this.c.y + this.size.h / 2
        }

        let zone_h = zone.height === -1 ? this.size.h : zone.height

        this.zone = {
            pos: {
                x: this.top_left.x,
                y: this.c.y + this.size.h / 2 - zone.height,
            },
            size: {
                w: zone.width === -1 ? this.size.w : zone.width,
                h: zone_h,
            },
            splitters: {
                w: zone.splitter.width,
                h: zone.splitter.height === -1 ? zone_h : zone.splitter.height,
            },
        }

        this.colors = colors

        this.obstacles = {
            setting: obstacles,
            pos: [],
            walls: [[this.top_left], [this.top_right]]
        }

        const { color, radius } = ball
        this.ball = {
            radius: radius,
            color: color,
            pos: undefined,
            mass: 1,
            v: 0,
            a: 0,
        }
    }

    draw_base() {
        const { background, splitter, text } = this.colors

        canvas.draw_rectangle(background, this.top_left, this.size)

        canvas.draw_rectangle(splitter, this.zone.pos, this.zone.size)

        this.zone_dim = (this.size.w - this.zone.splitters.w) / this.multipliers.strings.length
        this.multipliers.strings.forEach((e, idx) => {
            let x = this.top_left.x + this.zone_dim * idx + this.zone.splitters.w

            canvas.draw_rectangle(background, { x: x, y: this.zone.pos.y }, { w: (this.zone_dim - this.zone.splitters.w), h: this.zone.size.h })
            canvas.draw_text({ x: x - this.zone.splitters.w + this.zone_dim / 2, y: this.zone.pos.y + this.zone.size.h / 2 }, text, e, -Math.PI / 2, "left", 20, false)
        })

        const { vertical, horizontal, size, color } = this.obstacles.setting
        const dY = (this.size.h - this.zone.size.h * 2) / vertical
        let start = {
            x: undefined,
            y: this.top_left.y + dY,
        }, max

        for (let i = 0; i < vertical; i++) {
            if (i % 2 == 0) {
                max = horizontal.even
                start.x = this.top_left.x + this.zone_dim + (this.zone_dim/2)
            } else {
                max = horizontal.odd
                start.x = this.top_left.x + this.zone_dim
            }
            for (let j = 0; j < max; j++) {
                let pos = {
                    x: start.x + ((this.zone_dim ) * j), 
                    y: start.y + dY * i
                }
                canvas.draw_circle(pos, size, color, false)

                if (j == 0) this.obstacles.walls[0].push({x: pos.x - (this.zone_dim), y: pos.y})
                if (j == max - 1) this.obstacles.walls[1].push({x: pos.x + (this.zone_dim), y: pos.y})

                this.obstacles.pos.push(pos)
            }
        }

        canvas.draw_shape(this.obstacles.walls[0], color)
        canvas.draw_shape(this.obstacles.walls[1], color)
    }

    draw_ball() {
        canvas.draw_circle(this.ball.pos, this.ball.radius, this.ball.color, false)
    }

    start = () => {
        if (!this.stop) return
        console.log("Log: starting pachinko.")
        this.stop = false

        const dY = (this.size.h - this.zone.size.h * 2) / this.obstacles.setting.vertical

        this.ball.pos = {
            x: this.top_left.x + Number((Math.random() * 8 + 3).toFixed(0))*this.zone_dim + this.zone_dim/2,
            y: this.top_left.y + dY/2,
        }
        this.draw_ball()

        this.#update()
    }

    #update = (t) => {
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

        // if (v <= 0) {
        //     console.log("Log: stop pachinko.")
        //     this.stop = true
        // }
        if (!this.stop) {
            requestAnimationFrame(this.#update)
        }
    }

    attach = () => {
        if (!this.isAttached) {
            console.log("Log: attaching pachinko.")

            this.isAttached = true

            canvas.clear()
            this.draw_base()
        }
    }

    detach = () => {
        if (this.isAttached) {
            console.log("Log: detaching pachinko.")

            this.isAttached = false
        }
    }
}

class CashHunt {
    constructor() { }

    set() { }

    start() { }

    attach() { }

    detach() { }
}

export const bonus = {
    coin_flip: CoinFlip,
    pachinko: new Pachinko(),
    cash_hunt: new CashHunt(),
}