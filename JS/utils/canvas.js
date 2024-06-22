const SVG_SIZE = 300
const BACKGROUND_SVG = new Image()
BACKGROUND_SVG.src = "/assets/backgoround_number.svg"

function calc_dist_pToP(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

class Canvas {
    constructor(w, h, master) {
        this.html_element = document.createElement("canvas")
        this.html_element.width = w
        this.html_element.height = h

        this.w = w
        this.h = h

        this.master = master

        this.ctx = this.html_element.getContext("2d")
    }

    draw_batch(arr) {
        arr.forEach(element => {
            let color = element.color
            let el_type = element.el_type
            let pos = element.pos
        });
    }

    draw_triangle(color, p1, p2, p3, has_border = false, border_color = undefined, border_width = undefined) {
        this.ctx.beginPath()
        this.ctx.moveTo(p1.x, p1.y)
        this.ctx.lineTo(p2.x, p2.y)
        this.ctx.lineTo(p3.x, p3.y)
        this.ctx.lineTo(p1.x, p1.y)
        this.ctx.closePath()

        if (has_border) {
            this.ctx.strokeStyle = border_color
            this.ctx.lineWidth = border_width
            this.ctx.stroke()
        }

        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    draw_line(color, p1, p2) {
        this.ctx.beginPath()
        this.ctx.moveTo(p1.x, p1.y)
        this.ctx.lineTo(p2.x, p2.y)
        this.ctx.closePath()

        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 1

        this.ctx.stroke()
    }

    draw_shape(points, color) {
        this.ctx.beginPath()
        points.forEach((p, idx) => {
            if (idx === 0) this.ctx.moveTo(p.x, p.y)
            else this.ctx.lineTo(p.x, p.y)
        })
        this.ctx.closePath()
        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    draw_rectangle(color, p, s) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(p.x, p.y, s.w, s.h)
    }

    draw_slice(color, v, p1, p2, ang, id, movedAngle) {
        // console.log("Log: Drawing sliceces for id: " + id + ".")
        this.ctx.beginPath()

        let offset = (ang * id + movedAngle)

        let r = calc_dist_pToP(v, p1)

        this.ctx.moveTo(p1.x, p1.y)
        this.ctx.lineTo(v.x, v.y)
        this.ctx.lineTo(p2.x, p2.y)
        this.ctx.arc(v.x, v.y, r, offset, offset + ang)

        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 1
        this.ctx.closePath()
        this.ctx.fillStyle = color
        this.ctx.fill()
        this.ctx.stroke()
    }

    draw_circle(c, r, color, border = false, border_color = undefined, border_width = undefined) {
        this.ctx.beginPath();
        this.ctx.ellipse(c.x, c.y, r, r, 1, 0, Math.PI * 2)
        this.ctx.closePath()

        if (border) {
            this.ctx.strokeStyle = border_color
            this.ctx.lineWidth = border_width
            this.ctx.stroke()
        }

        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    draw_text(p, color, text, ang, pos, font_size, has_background = false) {
        let { x, y } = p

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(ang);
        this.ctx.textAlign = pos;

        if (has_background) {
            // TODO: inserire l'immagine
            // this.ctx.drawImage(BACKGROUND_SVG, p.x - (SVG_SIZE / 2), p.y - (SVG_SIZE / 2))
        }

        this.ctx.fillStyle = color
        this.ctx.font = font_size + "px Arial"
        this.ctx.fillText(text.toUpperCase(), 0, font_size / 2)

        this.ctx.restore();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.w, this.h);
    }

    // TODO: far funzionare questa funzione
    resize = () => {
        this.w = window.innerWidth
        this.h = window.innerHeight

        this.html_element.width = window.innerWidth
        this.html_element.height = window.innerHeight

        this.ctx = this.html_element.getContext("2d")
    }

    start() {
        this.master.appendChild(this.html_element)
        // window.addEventListener("resize", this.resize)
    }
}

export const canvas = new Canvas(window.innerWidth, window.innerHeight, document.body)