function getDotProduct(vertex, axis) {
    return axis.x * vertex.x + axis.y * vertex.y
}
function distance_p_to_p(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

class Vector {
    constructor(p1, p2) {
        this.x = p2.x - p1.x
        this.y = p2.y - p1.y
    }

    set(x, y) {
        this.x = x
        this.y = y
    }

    getVector() {
        return { x: this.x, y: this.y }
    }

    getPerendicularVector() {
        let v = new Vector(0, 0)
        v.set(-this.y, this.x)
        return v
    }

    setToPerendicularVector() {
        this.x = -this.y
        this.y = this.x

        return this
    }

    noramlize() {
        let len_v = Math.sqrt(this.x * this.x + this.y * this.y)
        return len_v != 0 ? { x: this.x / len_v, y: this.y / len_v } : { x: 0, y: 0}
    }
}

class Polygon {
    constructor(vertices) {
        this.vertices = vertices.map(v => { return { x: v.x, y: -v.y } })
        this.edges = []
        this.vertices.forEach((vertex, idx) => {
            this.edges.push(new Vector(vertex, this.vertices[(idx + 1) % vertices.length]))
        });
    }

    getProjection(axis) {
        let min = Infinity, max = -Infinity

        this.vertices.forEach(vertex => {
            let projection = getDotProduct(vertex, axis)
            min = Math.min(min, projection)
            max = Math.max(max, projection)
        })

        return { min: min, max: max }
    }
}

class Circle {
    constructor({ c, r }) {
        this.c = {
            x: c.x,
            y: -c.y
        }
        this.r = r
    }

    getProjection(axis) {
        let projection = getDotProduct(this.c, axis)
        let min = projection - this.r
        let max = projection + this.r

        return { min: min, max: max }
    }
}

class CollisionDetector {
    constructor() { }

    check(proj1, proj2) {
        return (proj1.min >= proj2.max || proj2.min >= proj1.max)
    }

    detect_collision(s1, s2) {
        // s1 and s2 -> array of vertices
        if ((Object.hasOwn(s1, 'c') && Object.hasOwn(s1, 'r')) || (Object.hasOwn(s2, 'c') && Object.hasOwn(s2, 'r'))) {
            if ((Object.hasOwn(s1, 'c') && Object.hasOwn(s1, 'r')) && (Object.hasOwn(s2, 'c') && Object.hasOwn(s2, 'r'))) {
                return this.collision_circle_circle(s1, s2)
            } else {
                if ((Object.hasOwn(s1, 'c') && Object.hasOwn(s1, 'r'))) {
                    return this.collision_circle_polygon(new Circle(s1), new Polygon(s2))
                } else {
                    return this.collision_circle_polygon(new Circle(s2), new Polygon(s1))
                }
            }
        } else {
            s1 = new Polygon(s1)
            s2 = new Polygon(s2)
        }

        let min_vect = { dir: undefined, magnitude: Infinity }
        let collision = true
        s1.edges.forEach(edge => {
            let axis = edge.getPerendicularVector()

            let projection_s1 = s1.getProjection(axis)
            let projection_s2 = s2.getProjection(axis)

            let length = Math.min(projection_s1.max - projection_s2.min, projection_s2.max - projection_s1.min)
            if (min_vect.magnitude > length) {
                let dir = axis.noramlize()
                min_vect = { x: dir.x * length, y: dir.y * length, magnitude: length }
            }
            if (this.check(projection_s1, projection_s2)) collision = false
        })
        if (!collision) return null
        s2.edges.forEach(edge => {
            let axis = edge.getPerendicularVector()

            let projection_s1 = s1.getProjection(axis)
            let projection_s2 = s2.getProjection(axis)

            let length = projection_s1 - projection_s2
            if (min_vect.magnitude > length) {
                let dir = axis.noramlize()
                min_vect = { x: dir.x * length, y: dir.y * length, magnitude: length }
            }

            if (this.check(projection_s1, projection_s2)) collision = false
        })
        if (!collision) return null

        return {x: min_vect.x, y: -min_vect.y}
    }

    collision_circle_circle(c1, c2) {
        let d = distance_p_to_p(c1.c, c2.c)
        return d <= c1.r + c2.r ? {x: c1.c.x - c2.c.x, y: -(c1.c.y - c2.c.y)} : null
    }

    collision_circle_polygon(circle, polygon) {
        let min_d = Infinity, min_d_vertex
        polygon.vertices.forEach(vertex => {
            let d = distance_p_to_p(circle.c, vertex)
            if (min_d > d) {
                min_d = d
                min_d_vertex = vertex
            }
        })

        let axis = new Vector(min_d_vertex, circle.c)

        let projection_circle = circle.getProjection(axis)
        let projection_polygon = polygon.getProjection(axis)

        let length = Math.min(projection_circle.max - projection_polygon.min, projection_polygon.max - projection_circle.min)
        let dir = axis.noramlize()
        let min_vect = { x: dir.x * length, y: dir.y * length }


        if (this.check(projection_circle, projection_polygon)) return null
        return {x: min_vect.x, y: -min_vect.y}
    }
}

export const detector = new CollisionDetector()

// let s1 = [{ x: 2, y: 2 }, { x: 5, y: 5 }, { x: 2, y: 7 }] // triangle
// let s2 = { c: { x: 2, y: 2 }, r: 1 } // circle
// let s3 = [{ x: 3, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 4 }] // square
// let s4 = { c: { x: 1, y: 1 }, r: 1 } // circle


// console.log(detector.detect_collision(s2, s4))