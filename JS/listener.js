export class Listener {
    #pressedKey
    #args
    constructor(args = []) {
        this.#pressedKey = []

        this.#args = args

        addEventListener("keydown", key => {
            if (this.#pressedKey.indexOf(key) == -1) {
                key = key.code

                this.#pressedKey.push(key)

                this.#args.forEach(arg => {
                    if (arg.name == key) {
                        arg.func()
                    }
                });
            }
        })

        addEventListener("keyup", key => {
            key = key.code

            this.#pressedKey.splice(this.#pressedKey.indexOf(key), 1)
        })
    }

    set_listener(arg) {
        this.#args.push(arg)
    }

    getPressedKey() {
        return this.#pressedKey
    }
}

export const listener = new Listener()