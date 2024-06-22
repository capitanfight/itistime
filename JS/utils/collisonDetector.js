class CollisionDetector {
    constructor() { }

    calc_vector(p1, p2) {
        // from p1 to p2
        return { x: p2.x - p1.x, y: p2.y - p1.y }
    }

    calc_par_vector(v) {
        return { x: -v.y, y: v.x }
    }

    calc_dot_product(v, a) {
        // calculate projection of v on a
        return v.x * a.x + v.y * a.y
    }

    min_on_arr(arr) {
        let t
        arr.forEach(e => {
            t = Math.min(t, e)
        })
        return t
    }

    check(p1_s1, p2_s1, p1_s2, p2_s2) {
        return (p1_s1 <= p1_s2 && p2_s1 >= p1_s2) || (p1_s1 <= p2_s2 && p2_s1 >= p1_s2)
    }

    detect_collision(s1, s2) {
        // s1 and s2 -> array of vertices
        let edges_s1 = [], edges_s2 = []

        s1.forEach((vertex, idx) => {
            if (idx == s1.length - 2) return

            edges_s1.push(this.calc_vector(vertex, s1[idx + 1]))
        });
        s2.forEach((vertex, idx) => {
            if (idx == s1.length - 2) return

            edges_s1.push(this.calc_vector(vertex, s1[idx + 1]))
        });

        let axis = []
        edges_s1.forEach(edge => {
            axis.push(this.calc_par_vector(edge))
        })

        axis.forEach(a => {
            let p1_s1, p2_s1, p1_s2, p2_s2
            p1_s1 = p1_s2 = Infinity
            p2_s1 = p2_s2 = -Infinity 

            edges_s1.forEach(edge => {
                p1_s1 = Math.min(p1_s1, this.calc_dot_product(edge, a))
                p2_s1 = Math.max(p2_s1, this.calc_dot_product(edge, a))
            })
            edges_s2.forEach(edge => {
                p1_s2 = Math.min(p1_s2, this.calc_dot_product(edge, a))
                p2_s2 = Math.max(p2_s2, this.calc_dot_product(edge, a))
            })
        })

        if (!this.check(p1_s1, p2_s1, p1_s2, p2_s2)) return
    }
}

export const detector = new CollisionDetector()