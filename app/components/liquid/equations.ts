// app/components/liquid/equations.ts

export type SurfaceFnDef = {
    title: string;
    fn: (x: number) => number;
};

export const CONVEX_CIRCLE: SurfaceFnDef = {
    title: 'Convex Circle',
    fn: (x) => Math.sqrt(1 - (1 - x) ** 2),
};

export const CONVEX: SurfaceFnDef = {
    title: 'Convex Squircle',
    fn: (x) => (1 - (1 - x) ** 4) ** (1 / 4),
};

export const CONCAVE: SurfaceFnDef = {
    title: 'Concave',
    fn: (x) => 1 - CONVEX_CIRCLE.fn(x),
};

export const LIP: SurfaceFnDef = {
    title: 'Lip',
    fn: (x) => {
        const convex = CONVEX.fn(x * 2);
        const concave = CONCAVE.fn(x) + 0.1;
        const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
        return convex * (1 - smootherstep) + concave * smootherstep;
    },
};

export const WAVE: SurfaceFnDef = {
    title: 'Wave',
    fn: (x) => {
        const base = x ** 0.5;
        const wave = Math.sin(x * Math.PI * 3) * 0.1;
        return Math.max(0, Math.min(1, base + wave));
    },
};

export const STEPPED: SurfaceFnDef = {
    title: 'Stepped',
    fn: (x) => {
        const steps = 4;
        const stepSize = 1 / steps;
        const stepIndex = Math.floor(x / stepSize);
        const stepProgress = (x % stepSize) / stepSize;
        const stepHeight = stepIndex / (steps - 1);
        const smoothing = stepProgress ** 3 * (stepProgress * (stepProgress * 6 - 15) + 10);
        return stepHeight + smoothing * (1 / (steps - 1));
    },
};

export const ELASTIC: SurfaceFnDef = {
    title: 'Elastic',
    fn: (x) => {
        if (x === 0) return 0;
        if (x === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return 2 ** (-10 * x) * Math.sin(((x - s) * (2 * Math.PI)) / p) + 1;
    },
};

export const fns: SurfaceFnDef[] = [CONVEX_CIRCLE, CONVEX, CONCAVE, LIP, WAVE, STEPPED, ELASTIC];