'use client';

import React, { useEffect, useState, useId, useRef, useLayoutEffect } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'motion/react';
import { CONVEX, CONVEX_CIRCLE } from './equations';
import { generateDisplacementImageData, calculateRefractionProfile } from './displacement';
import { cn } from '@/app/utils/cn';

// --- UTILS ---
function imageDataToUrl(imageData: ImageData): string {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function getValueOrMotion<T>(value: T | MotionValue<T>): T {
    return value instanceof MotionValue ? value.get() : value;
}

// --- THE FILTER COMPONENT ---
interface LiquidFilterProps {
    id: string;
    width: number | MotionValue<number>;
    height: number | MotionValue<number>;
    radius: number | MotionValue<number>;
    blur?: number | MotionValue<number>;
    glassThickness?: number | MotionValue<number>;
    bezelWidth?: number | MotionValue<number>;
    refractiveIndex?: number | MotionValue<number>;
    dpr?: number;
}

const LiquidFilter: React.FC<LiquidFilterProps> = ({
    id, width, height, radius, blur = 0.3, glassThickness = 40, bezelWidth = 12, refractiveIndex = 1.2, dpr = 1
}) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    // Highly optimized displacement map generation bypassing React state
    const displacementData = useTransform(() => {
        const w = getValueOrMotion(width);
        const h = getValueOrMotion(height);
        const r = getValueOrMotion(radius);
        const bz = getValueOrMotion(bezelWidth);
        const gt = getValueOrMotion(glassThickness);
        const ri = getValueOrMotion(refractiveIndex);

        const profile = calculateRefractionProfile(gt, bz, CONVEX.fn, ri, 128);
        const maxDisp = Math.max(...profile.map((v) => Math.abs(v)));
        
        const map = generateDisplacementImageData(w, h, w, h, r, bz, maxDisp, profile, dpr);
        return { map, maxDisp };
    });

    const displacementUrl = useTransform(() => imageDataToUrl(displacementData.get().map));
    const scale = useTransform(() => displacementData.get().maxDisp);

    if (!isMounted) return null;

    return (
        <svg style={{ display: 'none' }}>
            <defs>
                <filter id={id} colorInterpolationFilters="sRGB">
                    <motion.feGaussianBlur 
                        in="SourceGraphic" 
                        stdDeviation={blur as any} 
                        result="blurred_source" 
                    />
                    <motion.feImage
                        href={displacementUrl as any}
                        x={0} y={0}
                        width={width as any}
                        height={height as any}
                        result="displacement_map"
                    />
                    <motion.feDisplacementMap
                        in="blurred_source"
                        in2="displacement_map"
                        scale={scale as any}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="displaced"
                    />
                    <feBlend in="displaced" in2="SourceGraphic" mode="normal" />
                </filter>
            </defs>
        </svg>
    );
};

// --- THE GLASS WRAPPER ---
export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
    glassThickness?: number;
    bezelWidth?: number;
    refractiveIndex?: number;
    blur?: number;
    dpr?: number;
}

export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
    ({ children, className, glassThickness = 40, bezelWidth = 12, refractiveIndex = 1.2, blur = 0.3, dpr = 1, ...props }, forwardedRef) => {
        const id = `glass-${useId()}`;
        const internalRef = useRef<HTMLDivElement>(null);
        const ref = (forwardedRef || internalRef) as React.RefObject<HTMLDivElement>;

        // Spring physics for dynamic resizing
        const width = useSpring(100, { stiffness: 300, damping: 30 });
        const height = useSpring(100, { stiffness: 300, damping: 30 });
        const radius = useSpring(0, { stiffness: 300, damping: 30 });

        useLayoutEffect(() => {
            if (!ref.current) return;
            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    width.set(entry.contentRect.width);
                    height.set(entry.contentRect.height);
                    
                    const style = window.getComputedStyle(entry.target);
                    const parsedRadius = parseFloat(style.borderRadius);
                    radius.set(isNaN(parsedRadius) ? 0 : parsedRadius);
                }
            });
            observer.observe(ref.current);
            return () => observer.disconnect();
        }, [ref, width, height, radius]);

        return (
            <>
                <LiquidFilter 
                    id={id} 
                    width={width} 
                    height={height} 
                    radius={radius}
                    glassThickness={glassThickness}
                    bezelWidth={bezelWidth}
                    refractiveIndex={refractiveIndex}
                    blur={blur}
                    dpr={dpr}
                />
                <motion.div
                    ref={ref}
                    className={cn('relative', className)}
                    style={{
                        backdropFilter: `url(#${id})`,
                        WebkitBackdropFilter: `url(#${id})`,
                    }}
                    {...props as any}
                >
                    {children}
                </motion.div>
            </>
        );
    }
);

LiquidGlass.displayName = 'LiquidGlass';