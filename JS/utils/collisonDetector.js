import { Vector, vectorMath } from "./vector.js"

class Polygon {
    constructor(vertices) {
        this.vertices = vertices.map(v => { return { x: v.x, y: -v.y } })
        this.edges = []
        this.vertices.forEach((vertex, idx) => {
            this.edges.push(new Vector(undefined, vertex, this.vertices[(idx + 1) % vertices.length]))
        });
    }

    getProjection(axis) {
        let min = Infinity, max = -Infinity

        this.vertices.forEach(vertex => {
            let projection = vectorMath.getDotProduct(vertex, axis)
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
        let dir = axis.noramlize()
        let val = vectorMath.scale(dir, this.r)

        let p1 = vectorMath.subtruct(this.c, val)
        let p2 = vectorMath.add(this.c, val)

        let projection_p1 = vectorMath.getDotProduct(p1, axis)
        let projection_p2 = vectorMath.getDotProduct(p2, axis)

        return { min: Math.min(projection_p1, projection_p2), max: Math.max(projection_p1, projection_p2) }
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
                length /= axis.get_length()
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
                length /= axis.get_length()
                min_vect = { x: dir.x * length, y: dir.y * length, magnitude: length }
            }

            if (this.check(projection_s1, projection_s2)) collision = false
        })
        if (!collision) return null

        return new Vector({ x: min_vect.x, y: -min_vect.y })
    }

    collision_circle_circle(c1, c2) {
        // let d = vectorMath.distance_p_to_p(c1.c, c2.c)
        let v = new Vector(undefined, c1.c, c2.c)
        let d = v.get_length()
        let mv = vectorMath.scale(v.noramlize(), (c1.r - c2.r))
        mv = mv.negate()
        return d <= c1.r + c2.r ? mv : null
    }

    collision_circle_polygon(circle, polygon) {
        let min_d = Infinity, min_d_vertex
        polygon.vertices.forEach(vertex => {
            let d = vectorMath.distance_p_to_p(circle.c, vertex)
            if (min_d > d) {
                min_d = d
                min_d_vertex = vertex
            }
        })

        let axis = new Vector(undefined, min_d_vertex, circle.c)

        let projection_circle = circle.getProjection(axis)
        let projection_polygon = polygon.getProjection(axis)

        let length = Math.min(projection_circle.max - projection_polygon.min, projection_polygon.max - projection_circle.min)
        let dir = axis.noramlize()
        let min_vect = { x: dir.x * length, y: dir.y * length, magnitude: length }

        if (this.check(projection_circle, projection_polygon)) return null

        let collision = true
        polygon.edges.forEach(edge => {
            let axis = edge.getPerendicularVector()

            let projection_circle = circle.getProjection(axis)
            let projection_polygon = polygon.getProjection(axis)

            let length = Math.min(projection_circle.max - projection_polygon.min, projection_polygon.max - projection_circle.min)
            if (min_vect.magnitude > length) {
                let dir = axis.noramlize()
                length /= axis.get_length()
                min_vect = { x: dir.x * length, y: dir.y * length, magnitude: length }
            }
            if (this.check(projection_circle, projection_polygon)) collision = false
        })
        if (!collision) return null

        return new Vector({ x: min_vect.x, y: -min_vect.y })
    }
}

export const detector = new CollisionDetector()

// let s1 = [{ x: 5, y: 1 }, { x: 10, y: 14 }, { x: 5, y: 30 }] // triangle
// let s2 = { c: { x: 9, y: 16 }, r: 1 } // circle
// let s3 = [{ x: 3, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 4 }] // square
// let s4 = { c: { x: 1, y: 1 }, r: 1 } // circle


// console.log(detector.detect_collision(s1, s2))