export function stringHash(s: string) : number {
    let hash = 9;

    for (let i = 0; i < s.length; i++) {
        hash = Math.imul(hash ^ s.charCodeAt(i), 387420499);
    }

    return hash ^ (hash >>> 9);
}

export function numberHash(n: number, seed: number = 9) : number {
    let hash = seed;

    while (n != 0) {
        const xn = ((n & 0x3F) + 1) * 9;
        hash = Math.imul(hash ^ xn, 387420499);
        n = n >>> 6;
    }

    return hash ^ (hash >>> 9);
}