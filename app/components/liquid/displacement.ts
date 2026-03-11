// app/components/liquid/displacement.ts

export function createImageDataSafe(width: number, height: number): ImageData {
    const safeWidth = Math.max(1, Math.round(width));
    const safeHeight = Math.max(1, Math.round(height));

    if (typeof ImageData !== 'undefined') {
        return new ImageData(safeWidth, safeHeight);
    }

    return {
        width: safeWidth,
        height: safeHeight,
        data: new Uint8ClampedArray(safeWidth * safeHeight * 4),
        colorSpace: 'srgb',
    } as ImageData;
}

export function calculateRefractionProfile(
    glassThickness: number = 200,
    bezelWidth: number = 50,
    bezelHeightFn: (x: number) => number = (x) => x,
    refractiveIndex: number = 1.5,
    samples: number = 128,
): number[] {
    const eta = 1 / refractiveIndex;

    function refract(normalX: number, normalY: number): [number, number] | null {
        const dot = normalY;
        const k = 1 - eta * eta * (1 - dot * dot);
        if (k < 0) return null; // Total internal reflection
        const kSqrt = Math.sqrt(k);
        return [-(eta * dot + kSqrt) * normalX, eta - (eta * dot + kSqrt) * normalY];
    }

    return Array.from({ length: samples }, (_, i) => {
        const x = i / samples;
        const y = bezelHeightFn(x);

        const dx = x < 1 ? 0.0001 : -0.0001;
        const y2 = bezelHeightFn(x + dx);
        const derivative = (y2 - y) / dx;
        const magnitude = Math.sqrt(derivative * derivative + 1);
        const normal: [number, number] = [-derivative / magnitude, -1 / magnitude];
        const refracted = refract(normal[0], normal[1]);

        if (!refracted) return 0;
        
        const remainingHeightOnBezel = y * bezelWidth;
        const remainingHeight = remainingHeightOnBezel + glassThickness;
        return refracted[0] * (remainingHeight / refracted[1]);
    });
}

export function generateDisplacementImageData(
    canvasWidth: number,
    canvasHeight: number,
    objectWidth: number,
    objectHeight: number,
    radius: number,
    bezelWidth: number,
    maximumDisplacement: number,
    refractionProfile: number[] = [],
    dpr: number = 1,
) {
    const bufferWidth = Math.round(canvasWidth * dpr);
    const bufferHeight = Math.round(canvasHeight * dpr);
    const imageData = createImageDataSafe(bufferWidth, bufferHeight);
    const data = imageData.data;

    // 1. Fill entire buffer with neutral displacement (no refraction) highly efficiently
    new Uint32Array(data.buffer).fill(0xff008080); // A=255, B=0, G=128, R=128

    const radius_ = radius * dpr;
    const bezel = bezelWidth * dpr;
    
    // If there is no bezel, the entire glass is flat. Return the neutral map immediately.
    if (bezel <= 0) return imageData;

    const radiusSquared = radius_ ** 2;
    const radiusPlusOneSquared = (radius_ + 1) ** 2;
    const radiusMinusBezelSquared = (radius_ - bezel) ** 2;

    const objectWidth_ = objectWidth * dpr;
    const objectHeight_ = objectHeight * dpr;
    const widthBetweenRadiuses = objectWidth_ - radius_ * 2;
    const heightBetweenRadiuses = objectHeight_ - radius_ * 2;

    const objectX = (bufferWidth - objectWidth_) / 2;
    const objectY = (bufferHeight - objectHeight_) / 2;

    // 2. The Algorithmic Leap: Perimeter Iteration
    for (let y1 = 0; y1 < objectHeight_; y1++) {
        const isOnTopSide = y1 < radius_;
        const isOnBottomSide = y1 >= objectHeight_ - radius_;
        const y = isOnTopSide ? y1 - radius_ : isOnBottomSide ? y1 - radius_ - heightBetweenRadiuses : 0;
        
        // If we are in the flat vertical center of the glass, we ONLY calculate the left and right bezels
        const skipCenter = !isOnTopSide && !isOnBottomSide;

        for (let x1 = 0; x1 < objectWidth_; x1++) {
            // THE LEAP: Skip the perfectly flat center of the window
            if (skipCenter && x1 >= radius_ && x1 < objectWidth_ - radius_) {
                x1 = objectWidth_ - radius_ - 1; // Fast-forward x1 to the right bezel
                continue;
            }

            const isOnLeftSide = x1 < radius_;
            const isOnRightSide = x1 >= objectWidth_ - radius_;
            const x = isOnLeftSide ? x1 - radius_ : isOnRightSide ? x1 - radius_ - widthBetweenRadiuses : 0;

            const distanceToCenterSquared = x * x + y * y;
            const isInBezel = distanceToCenterSquared <= radiusPlusOneSquared && distanceToCenterSquared >= radiusMinusBezelSquared;

            if (isInBezel) {
                const opacity = distanceToCenterSquared < radiusSquared ? 1 : 
                    1 - (Math.sqrt(distanceToCenterSquared) - Math.sqrt(radiusSquared)) / 
                    (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

                const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
                const distanceFromSide = radius_ - distanceFromCenter;

                const cos = x / distanceFromCenter;
                const sin = y / distanceFromCenter;

                const bezelIndex = ((distanceFromSide / bezel) * refractionProfile.length) | 0;
                const distance = refractionProfile[bezelIndex] ?? 0;

                const dX = (-cos * distance) / maximumDisplacement;
                const dY = (-sin * distance) / maximumDisplacement;

                const idx = ((objectY + y1) * bufferWidth + objectX + x1) * 4;
                data[idx] = 128 + dX * 127 * opacity;     // R (X displacement)
                data[idx + 1] = 128 + dY * 127 * opacity; // G (Y displacement)
                // B is already 0 and A is already 255 from the neutral fill
            }
        }
    }
    return imageData;
}