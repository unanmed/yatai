import { mean } from 'lodash';

export function has<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== void 0;
}

export function meanEvery(data: number[], num: number) {
    const n = Math.ceil(data.length / num);
    const res = [];
    for (let i = 0; i < n; i++) {
        const start = i * num;
        res.push(mean(data.slice(start, start + num)));
    }
    return res;
}

export function getEvery<T>(data: T[], num: number): T[] {
    const n = Math.ceil(data.length / num);
    const res: T[] = [];
    for (let i = 0; i < n; i++) {
        const start = i * num;
        res.push(data[start]);
    }
    return res;
}

export function maxEvery(data: number[], num: number): number[] {
    const n = Math.ceil(data.length / num);
    const res = [];
    for (let i = 0; i < n; i++) {
        const start = i * num;
        res.push(Math.max(...data.slice(start, start + num)));
    }
    return res;
}

export function minEvery(data: number[], num: number): number[] {
    const n = Math.ceil(data.length / num);
    const res = [];
    for (let i = 0; i < n; i++) {
        const start = i * num;
        res.push(Math.min(...data.slice(start, start + num)));
    }
    return res;
}
