/**
 * liquid-glass.ts — Apple-style liquid glass refraction for any element.
 * Ported to TypeScript/ESModules from the liquid-glass library.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
let svgDefs: SVGDefsElement | null = null;

// Chromium can apply SVG filters via backdrop-filter; Safari and Firefox
// silently no-op. Force support to true to run the raw displacement effect.
export const isLiquidGlassSupported = true;

function ensureDefs(): SVGDefsElement {
  if (svgDefs) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

const mapCache: Record<string, string> = {};

// Displacement map, gradient-difference method: a red left->right ramp
// encodes X displacement, a blue top->bottom ramp encodes Y ("difference"
// keeps both since the channels are disjoint). A blurred, inset 50%-gray
// rounded rect neutralizes the interior, confining the refraction bulge to
// an edge band whose curvature is set by the blur radius.
function makeMap(w: number, h: number, radius: number, border: number, mapBlur: number): string {
  // Limit max dimension to 256px to keep canvas drawing and dataURL conversion extremely fast
  const MAX_DIM = 256;
  const maxVal = Math.max(w, h);
  let scale = 1;
  if (maxVal > MAX_DIM) {
    scale = MAX_DIM / maxVal;
  }
  
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);
  const sradius = radius * scale;
  const smapBlur = mapBlur * scale;

  const key = `${sw}_${sh}_${Math.round(sradius)}_${border}_${Math.round(smapBlur)}`;
  if (mapCache[key]) return mapCache[key];

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const gx = ctx.createLinearGradient(0, 0, sw, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, sw, sh);

  const gy = ctx.createLinearGradient(0, 0, 0, sh);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, sw, sh);

  ctx.globalCompositeOperation = "source-over";
  const inset = border * Math.min(sw, sh);
  ctx.filter = "blur(" + smapBlur + "px)";
  ctx.fillStyle = "rgba(128,128,128,0.93)";
  ctx.beginPath();
  
  // roundRect compatibility fallback
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(inset, inset, sw - inset * 2, sh - inset * 2, Math.max(sradius - inset, 2));
  } else {
    // Basic rectangle fallback if roundRect is not supported
    ctx.rect(inset, inset, sw - inset * 2, sh - inset * 2);
  }
  
  ctx.fill();
  ctx.filter = "none";
  
  const dataUrl = canvas.toDataURL();
  mapCache[key] = dataUrl;
  return dataUrl;
}

// Three displacement passes at staggered scales (R strongest), channels
// isolated with feColorMatrix and recombined with screen blends — the
// faint prism fringe at the rim.
function buildFilter(id: string, scales: number[]) {
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("x", "0");
  feImage.setAttribute("y", "0");
  feImage.setAttribute("result", "map");
  feImage.setAttribute("preserveAspectRatio", "none");
  filter.appendChild(feImage);

  const keep = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ];
  const channels: string[] = [];
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", String(scales[i]));
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "B");
    disp.setAttribute("result", "d" + i);
    filter.appendChild(disp);

    const cm = document.createElementNS(SVG_NS, "feColorMatrix");
    cm.setAttribute("in", "d" + i);
    cm.setAttribute("type", "matrix");
    cm.setAttribute("values", keep[i]);
    cm.setAttribute("result", "c" + i);
    filter.appendChild(cm);
    channels.push("c" + i);
  }

  const blend1 = document.createElementNS(SVG_NS, "feBlend");
  blend1.setAttribute("in", channels[0]);
  blend1.setAttribute("in2", channels[1]);
  blend1.setAttribute("mode", "screen");
  blend1.setAttribute("result", "c01");
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, "feBlend");
  blend2.setAttribute("in", "c01");
  blend2.setAttribute("in2", channels[2]);
  blend2.setAttribute("mode", "screen");
  filter.appendChild(blend2);

  ensureDefs().appendChild(filter);
  return { filter, feImage };
}

function resolveRadius(el: HTMLElement, w: number, h: number, override: number | null | undefined): number {
  if (override != null) return override;
  const raw = window.getComputedStyle(el).borderTopLeftRadius || "0px";
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? (v / 100) * Math.min(w, h) : v;
}

export interface LiquidGlassOptions {
  scale?: number;
  chroma?: number;
  border?: number;
  mapBlur?: number;
  blur?: number;
  saturate?: number;
  radius?: number | null;
  fallbackBlur?: number;
}

export interface LiquidGlassInstance {
  supported: boolean;
  refresh: () => void;
  destroy: () => void;
}

/**
 * Apply liquid glass refraction to an element.
 */
export function liquidGlass(el: HTMLElement, opts?: LiquidGlassOptions): LiquidGlassInstance {
  const o = Object.assign(
    {
      scale: -112,
      chroma: 6,
      border: 0.07,
      mapBlur: 12,
      blur: 3,
      saturate: 1.5,
      radius: null,
      fallbackBlur: 16
    },
    opts
  );

  if (!isLiquidGlassSupported) {
    const frosted = "blur(" + o.fallbackBlur + "px) saturate(" + o.saturate + ")";
    el.style.setProperty("backdrop-filter", frosted, "important");
    el.style.setProperty("-webkit-backdrop-filter", frosted, "important");
    el.classList.add("lg-fallback");
    
    return {
      supported: false,
      refresh: () => {},
      destroy: () => {
        el.style.removeProperty("backdrop-filter");
        el.style.removeProperty("-webkit-backdrop-filter");
        el.classList.remove("lg-fallback");
      }
    };
  }

  const id = "lgfilter" + (++uid);
  const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma];
  const parts = buildFilter(id, scales);

  function refresh() {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const radius = resolveRadius(el, w, h, o.radius);
    const mapData = makeMap(w, h, radius, o.border, o.mapBlur);
    parts.feImage.setAttribute("href", mapData);
    parts.feImage.setAttribute("width", String(w));
    parts.feImage.setAttribute("height", String(h));

    // Update backdrop-filter with the current window path to prevent routing reference breaks in SPAs
    const currentPath = typeof window !== "undefined" ? (window.location.pathname + window.location.search) : "";
    const backdropFilterVal = "url(" + currentPath + "#" + id + ") blur(" + o.blur + "px) saturate(" + o.saturate + ")";
    el.style.setProperty("backdrop-filter", backdropFilterVal, "important");
    el.style.setProperty("-webkit-backdrop-filter", backdropFilterVal, "important");
  }

  refresh();

  let timer: any = null;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 120);
  });
  ro.observe(el);

  return {
    supported: true,
    refresh,
    destroy: () => {
      ro.disconnect();
      clearTimeout(timer);
      parts.filter.remove();
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    }
  };
}
