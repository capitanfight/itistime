export class Vector {
    constructor(coordinate, p1, p2) {
        if (coordinate == undefined) {
            this.x = p2.x - p1.x
            this.y = p2.y - p1.y
        } else if (p1 == undefined && p2 == undefined) {
            let { x, y } = coordinate
            this.x = x
            this.y = y
        } else {
            throw new Error("no coordinate are passed.")
        }
    }

    getVector() {
        return { x: this.x, y: this.y }
    }

    getPerendicularVector() {
        return new Vector({ x: -this.y, y: this.x })
    }

    noramlize() {
        let len_v = this.get_length()
        return len_v != 0 ? { x: this.x / len_v, y: this.y / len_v } : { x: 0, y: 0 }
    }

    get_length() {
        return vectorMath.distance_p_to_p({ x: this.x, y: 0 }, { x: 0, y: this.y })
    }

    negate() {
        return new Vector({ x: -this.x, y: -this.y })
    }
}

class VectorMath {
    constructor() { }

    add(v1, v2) {
        return new Vector({ x: v1.x + v2.x, y: v1.y + v2.y })
    }

    subtruct(v1, v2) {
        return new Vector({ x: v1.x - v2.x, y: v1.y - v2.y })
    }

    multiply(v1, v2) {
        return new Vector({ x: v1.x * v2.x, y: v1.y * v2.y })
    }

    divide(v1, v2) {
        return new Vector({ x: v1.x / v2.x, y: v1.y / v2.y })
    }

    distance_p_to_p(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

    getDotProduct(v1, v2) {
        return v2.x * v1.x + v2.y * v1.y
    }

    getCrossProduct(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x
    }

    scale(v, scaler) {
        return new Vector({ x: v.x * scaler, y: v.y * scaler })
    }
}

export const vectorMath = new VectorMath()