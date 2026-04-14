export interface PathCommand {
  type: string;
  values: number[];
}

/**
 * Parse an SVG path `d` attribute into a list of commands.
 */
export function parsePath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  // Match command letter followed by optional numbers (with separators)
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(d)) !== null) {
    const type = match[1];
    const args = match[2].trim();
    const values: number[] = [];

    if (args.length > 0) {
      // Extract all numbers (including negatives and decimals)
      const numRe = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
      let numMatch: RegExpExecArray | null;
      while ((numMatch = numRe.exec(args)) !== null) {
        values.push(parseFloat(numMatch[0]));
      }
    }

    commands.push({ type, values });
  }

  return commands;
}

/**
 * Convert all relative commands to absolute.
 */
export function toAbsolute(commands: PathCommand[]): PathCommand[] {
  const result: PathCommand[] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0; // subpath start
  let sy = 0;

  for (const cmd of commands) {
    const { type, values } = cmd;
    const isRelative = type === type.toLowerCase() && type !== 'z' && type !== 'Z';
    const absType = type.toUpperCase();

    if (absType === 'Z') {
      result.push({ type: 'Z', values: [] });
      cx = sx;
      cy = sy;
      continue;
    }

    const absValues = [...values];

    if (isRelative) {
      switch (absType) {
        case 'M':
        case 'L':
        case 'T':
          for (let i = 0; i < absValues.length; i += 2) {
            absValues[i] += cx;
            absValues[i + 1] += cy;
          }
          break;
        case 'H':
          for (let i = 0; i < absValues.length; i++) {
            absValues[i] += cx;
          }
          break;
        case 'V':
          for (let i = 0; i < absValues.length; i++) {
            absValues[i] += cy;
          }
          break;
        case 'C':
          for (let i = 0; i < absValues.length; i += 6) {
            absValues[i] += cx;
            absValues[i + 1] += cy;
            absValues[i + 2] += cx;
            absValues[i + 3] += cy;
            absValues[i + 4] += cx;
            absValues[i + 5] += cy;
          }
          break;
        case 'S':
          for (let i = 0; i < absValues.length; i += 4) {
            absValues[i] += cx;
            absValues[i + 1] += cy;
            absValues[i + 2] += cx;
            absValues[i + 3] += cy;
          }
          break;
        case 'Q':
          for (let i = 0; i < absValues.length; i += 4) {
            absValues[i] += cx;
            absValues[i + 1] += cy;
            absValues[i + 2] += cx;
            absValues[i + 3] += cy;
          }
          break;
        case 'A':
          for (let i = 0; i < absValues.length; i += 7) {
            absValues[i + 5] += cx;
            absValues[i + 6] += cy;
          }
          break;
      }
    }

    // Update current position
    switch (absType) {
      case 'M':
        cx = absValues[absValues.length - 2];
        cy = absValues[absValues.length - 1];
        sx = absValues[0];
        sy = absValues[1];
        break;
      case 'L':
      case 'T':
        cx = absValues[absValues.length - 2];
        cy = absValues[absValues.length - 1];
        break;
      case 'H':
        cx = absValues[absValues.length - 1];
        break;
      case 'V':
        cy = absValues[absValues.length - 1];
        break;
      case 'C':
        cx = absValues[absValues.length - 2];
        cy = absValues[absValues.length - 1];
        break;
      case 'S':
      case 'Q':
        cx = absValues[absValues.length - 2];
        cy = absValues[absValues.length - 1];
        break;
      case 'A':
        cx = absValues[absValues.length - 2];
        cy = absValues[absValues.length - 1];
        break;
    }

    // Convert H and V to L for uniform coordinate handling
    if (absType === 'H') {
      result.push({ type: 'L', values: [absValues[0], cy] });
    } else if (absType === 'V') {
      result.push({ type: 'L', values: [cx, absValues[0]] });
    } else {
      result.push({ type: absType, values: absValues });
    }
  }

  return result;
}

/**
 * Get bounding box from parsed (absolute) commands.
 */
export function getBBox(commands: PathCommand[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const cmd of commands) {
    const { type, values } = cmd;
    if (type === 'Z') continue;

    // Extract all x,y pairs from the values
    if (type === 'A') {
      // Arc: rx ry angle largeArc sweep x y
      for (let i = 0; i < values.length; i += 7) {
        const x = values[i + 5];
        const y = values[i + 6];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    } else {
      // All other commands: pairs of x,y
      for (let i = 0; i < values.length; i += 2) {
        const x = values[i];
        const y = values[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Get combined bounding box across multiple sets of commands.
 */
function getCombinedBBox(allCommands: PathCommand[][]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const commands of allCommands) {
    const bb = getBBox(commands);
    if (bb.minX < minX) minX = bb.minX;
    if (bb.minY < minY) minY = bb.minY;
    if (bb.maxX > maxX) maxX = bb.maxX;
    if (bb.maxY > maxY) maxY = bb.maxY;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Serialize commands back to a `d` string.
 */
export function serializePath(commands: PathCommand[]): string {
  return commands
    .map((cmd) => {
      if (cmd.type === 'Z') return 'Z';
      return cmd.type + cmd.values.map((v) => Math.round(v * 1000) / 1000).join(' ');
    })
    .join('');
}

/**
 * Transform a point using the bend transform.
 */
function bendPoint(
  x: number,
  y: number,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  amount: number
): [number, number] {
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (width === 0) return [x, y];

  // Normalize x to [0, 1]
  const nx = (x - bbox.minX) / width;

  // Arc angle in radians — amount maps to arc curvature
  const arcAngle = (amount / 100) * Math.PI * 0.8;
  if (Math.abs(arcAngle) < 0.001) return [x, y];

  const radius = width / arcAngle;
  const centerX = bbox.minX + width / 2;
  const centerY = bbox.minY + height / 2;

  const angle = (nx - 0.5) * arcAngle;
  const r = radius - (y - centerY);

  const newX = centerX + r * Math.sin(angle);
  const newY = centerY - r * Math.cos(angle) + radius;

  return [newX, newY];
}

/**
 * Transform a point using the inflate transform.
 */
function inflatePoint(
  x: number,
  y: number,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  amount: number
): [number, number] {
  const centerX = (bbox.minX + bbox.maxX) / 2;
  const centerY = (bbox.minY + bbox.maxY) / 2;
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const maxDim = Math.max(width, height);
  if (maxDim === 0) return [x, y];

  const dx = x - centerX;
  const dy = y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return [x, y];

  const normalized = dist / maxDim;

  if (amount >= 0) {
    // Positive: inflate from center — center pushes outward, like a balloon
    const factor = (amount / 100) * 4.5;
    const centerBias = 1 - normalized; // stronger near center
    const push = 1 + factor * centerBias;
    return [centerX + dx * push, centerY + dy * push];
  } else {
    // Negative: inflate from edges — edges push outward, center stays
    const factor = (Math.abs(amount) / 100) * 4.5;
    const edgeFactor = normalized * normalized; // quadratic: edges move more
    const push = 1 + factor * edgeFactor;
    return [centerX + dx * push, centerY + dy * push];
  }
}

/**
 * Transform a point using the stretch transform.
 */
function stretchPoint(
  x: number,
  y: number,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  amount: number
): [number, number] {
  const centerY = (bbox.minY + bbox.maxY) / 2;
  const scale = 1 + amount / 100;
  return [x, centerY + (y - centerY) * scale];
}

/**
 * Apply a point transform to all coordinates in a set of commands.
 */
function transformCommands(
  commands: PathCommand[],
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  transformFn: (
    x: number,
    y: number,
    bbox: { minX: number; minY: number; maxX: number; maxY: number }
  ) => [number, number]
): PathCommand[] {
  return commands.map((cmd) => {
    if (cmd.type === 'Z') return { type: 'Z', values: [] };

    const newValues = [...cmd.values];

    if (cmd.type === 'A') {
      for (let i = 0; i < newValues.length; i += 7) {
        const [nx, ny] = transformFn(newValues[i + 5], newValues[i + 6], bbox);
        newValues[i + 5] = nx;
        newValues[i + 6] = ny;
      }
    } else {
      for (let i = 0; i < newValues.length; i += 2) {
        const [nx, ny] = transformFn(newValues[i], newValues[i + 1], bbox);
        newValues[i] = nx;
        newValues[i + 1] = ny;
      }
    }

    return { type: cmd.type, values: newValues };
  });
}

/**
 * Bend paths along a circular arc.
 */
export function bendPaths(paths: string[], amount: number): string[] {
  if (amount === 0) return paths;

  const allCommands = paths.map((d) => toAbsolute(parsePath(d)));
  const bbox = getCombinedBBox(allCommands);

  return allCommands.map((cmds) => {
    const transformed = transformCommands(cmds, bbox, (x, y, bb) => bendPoint(x, y, bb, amount));
    return serializePath(transformed);
  });
}

/**
 * Inflate paths radially from center.
 */
export function inflatePaths(paths: string[], amount: number): string[] {
  if (amount === 0) return paths;

  const allCommands = paths.map((d) => toAbsolute(parsePath(d)));
  const bbox = getCombinedBBox(allCommands);

  return allCommands.map((cmds) => {
    const transformed = transformCommands(cmds, bbox, (x, y, bb) =>
      inflatePoint(x, y, bb, amount)
    );
    return serializePath(transformed);
  });
}

/**
 * Stretch paths along Y axis.
 */
export function stretchPaths(paths: string[], amount: number): string[] {
  if (amount === 0) return paths;

  const allCommands = paths.map((d) => toAbsolute(parsePath(d)));
  const bbox = getCombinedBBox(allCommands);

  return allCommands.map((cmds) => {
    const transformed = transformCommands(cmds, bbox, (x, y, bb) =>
      stretchPoint(x, y, bb, amount)
    );
    return serializePath(transformed);
  });
}

/**
 * Apply all transforms in order: stretch -> inflate -> bend.
 */
export function applyTransforms(
  paths: string[],
  bend: number,
  inflate: number,
  stretch: number
): string[] {
  if (bend === 0 && inflate === 0 && stretch === 0) return paths;

  let result = paths;
  if (stretch !== 0) result = stretchPaths(result, stretch);
  if (inflate !== 0) result = inflatePaths(result, inflate);
  if (bend !== 0) result = bendPaths(result, bend);

  return result;
}
