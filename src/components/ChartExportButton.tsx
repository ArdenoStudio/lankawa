"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "chart"
  );
}

function getViewBoxRect(svg: SVGSVGElement) {
  const viewBox = svg.viewBox.baseVal;

  if (viewBox.width > 0 && viewBox.height > 0) {
    return {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  return {
    x: 0,
    y: 0,
    width: Math.max(1, svg.getBoundingClientRect().width),
    height: Math.max(1, svg.getBoundingClientRect().height),
  };
}

function serializeMonochromeSvg(
  svg: SVGSVGElement,
  width: number,
  height: number,
): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originalNodes = Array.from(svg.querySelectorAll("*"));
  const cloneNodes = Array.from(clone.querySelectorAll("*"));
  const backgroundRect = getViewBoxRect(svg);

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("color", "#111827");
  clone.style.background = "#ffffff";

  const background = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  background.setAttribute("x", String(backgroundRect.x));
  background.setAttribute("y", String(backgroundRect.y));
  background.setAttribute("width", String(backgroundRect.width));
  background.setAttribute("height", String(backgroundRect.height));
  background.setAttribute("fill", "#ffffff");
  clone.insertBefore(background, clone.firstChild);

  cloneNodes.forEach((node, index) => {
    const original = originalNodes[index];
    if (!(node instanceof SVGElement) || !(original instanceof SVGElement)) {
      return;
    }

    const computed = window.getComputedStyle(original);
    const hasStroke =
      original.hasAttribute("stroke") || computed.stroke !== "none";
    const hasFill = original.hasAttribute("fill") || computed.fill !== "none";

    node.removeAttribute("class");
    node.setAttribute("color", "#111827");

    if (hasStroke && original.getAttribute("stroke") !== "none") {
      node.setAttribute("stroke", "#111827");
      if (computed.strokeWidth) {
        node.setAttribute("stroke-width", computed.strokeWidth);
      }
    }

    const dash =
      original.getAttribute("stroke-dasharray") ?? computed.strokeDasharray;
    if (dash && dash !== "none") {
      node.setAttribute("stroke-dasharray", dash);
    }

    if (original.getAttribute("fill") === "none" || computed.fill === "none") {
      node.setAttribute("fill", "none");
    } else if (hasFill) {
      node.setAttribute("fill", "#111827");
    }
  });

  return new XMLSerializer().serializeToString(clone);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load SVG image."));
    image.src = src;
  });
}

function resolveSvg(targetId: string): SVGSVGElement | null {
  const target = document.getElementById(targetId);
  if (!target) {
    return null;
  }
  if (target instanceof SVGSVGElement) {
    return target;
  }
  const nested = target.querySelector("svg");
  return nested instanceof SVGSVGElement ? nested : null;
}

async function exportSvgToPng(targetId: string): Promise<void> {
  const svg = resolveSvg(targetId);

  if (!(svg instanceof SVGSVGElement)) {
    throw new Error("No SVG chart found to export.");
  }

  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || 800));
  const height = Math.max(1, Math.round(rect.height || 400));
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const serialized = serializeMonochromeSvg(svg, width, height);
  const svgBlob = new Blob([serialized], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is unavailable.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNG export failed."));
        }
      }, "image/png");
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `lankawa-${slugify(targetId)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function ChartExportButton({ targetId }: { targetId: string }) {
  const t = useTranslations("export");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );

  async function handleExport() {
    setStatus("working");

    try {
      await exportSvgToPng(targetId);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={status === "working"}
        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "working" ? t("preparing") : t("png")}
      </button>
      <span className="text-xs text-slate-500" aria-live="polite">
        {status === "done"
          ? t("ready")
          : status === "error"
            ? t("error")
            : null}
      </span>
    </div>
  );
}
