import { wheel, Wheel } from "./wheel.js"
import { better } from "./better.js"

const COIN_COLORS = ["red", "blue"]

function end(multiplier, id) {
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

class Pachinco {
    constructor() { }

    set() { }

    start() { }

    attach() { }

    detach() { }
}

class CashHunt {
    constructor() { }

    set() { }

    start() { }

    attach() { }

    detach() { }
}

class CrazyTime extends Wheel{
    constructor() {
        super(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer)

        this.isAttached = false
    }

    set() {
        // this.wheel.set(slices_loadout, slices, radius, colors, t_spin, speed, size_pointer)
    }

    start() { }

    attach = () => {
        if (!this.isAttached) {
            console.log("Log: attaching crazy time.")

            this.isAttached = true
            // document.body.appendChild(this.html_elements.container)

            setTimeout(start, this.wait.start * 10e2)
        }
    }

    detach = () => {
        if (this.isAttached) {
            console.log("Log: detaching crazy time.")

            this.isAttached = false
            this.wheel.start()
            // document.body.removeChild(this.html_elements.container)
        }
    }
}

export const bonus = {
    coin_flip: CoinFlip,
    pachinco: new Pachinco(),
    cash_hunt: new CashHunt(),
    crazy_time: new CrazyTime(),
}