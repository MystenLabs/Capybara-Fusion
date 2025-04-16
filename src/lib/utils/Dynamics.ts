export class SecondOrderDynamics {
    prevTarget: number;
    position: number;
    velocity: number;
    k1: number;
    k2: number;
    k3: number;
    critical: number;

    constructor(f: number, z: number, r: number, initial: number) {
        this.k1 = z / (Math.PI * f);
        this.k2 = 1 / Math.pow(2 * Math.PI * f, 2);
        this.k3 = r * z / (2 * Math.PI * f);
        
        this.critical = 0.8 * (Math.sqrt(4 * this.k2 + this.k1 * this.k1) - this.k1);

        this.prevTarget = initial;
        this.position = initial;
        this.velocity = 0;
    }

    update(target: number, dt: number): number {
        const target_velocity = (target - this.prevTarget) / dt;
        this.prevTarget = target;

        const iterations = Math.ceil(dt / this.critical);
        dt = dt / iterations;

        for (let i = 0; i < iterations; i++) {
            this.position += this.velocity * dt;
            this.velocity += dt * (target + target_velocity * this.k3 - this.position - this.velocity * this.k1) / this.k2;
        }

        return this.position;
    }

    reset(newPosition: number) {
        this.prevTarget = newPosition;
        this.position = newPosition;
        this.velocity = 0;
    }
}