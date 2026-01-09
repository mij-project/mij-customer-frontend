import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Media = {
  media_assets_id: string | number;
  storage_key?: string | null;
  orientation?: number;
};

type Props = {
  open: boolean;
  images: Media[];
  initialIndex?: number;
  onClose: () => void;
  fallbackSrc: string;
};

export default function ImageFullscreenViewer({
  open,
  images,
  initialIndex = 0,
  onClose,
  fallbackSrc,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // reset zoom when changing image
  const transformKey = useMemo(() => `img-${index}`, [index]);

  // portal container
  const portalElRef = useRef<HTMLDivElement | null>(null);

  // swipe
  const startXRef = useRef<number | null>(null);

  const canPrev = index > 0;
  const canNext = index < images.length - 1;

  const goPrev = () => canPrev && setIndex((v) => v - 1);
  const goNext = () => canNext && setIndex((v) => v + 1);

  useEffect(() => {
    if (!portalElRef.current) {
      portalElRef.current = document.createElement("div");
      portalElRef.current.id = "image-fullscreen-portal";
    }
    const el = portalElRef.current;

    if (open) {
      document.body.appendChild(el);

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      };
      window.addEventListener("keydown", onKeyDown);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
        try {
          document.body.removeChild(el);
        } catch { }
      };
    }
  }, [open, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    setIndex(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));
    setIsZoomed(false);
  }, [open, initialIndex, images.length]);

  if (!open || !portalElRef.current) return null;

  const current = images[index];
  const src = current?.storage_key || fallbackSrc;

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isZoomed) return;
    startXRef.current = e.clientX;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch { }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isZoomed) return;
    if (startXRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    startXRef.current = null;

    const THRESHOLD = 60;
    if (Math.abs(dx) < THRESHOLD) return;

    if (dx > 0) goPrev();
    else goNext();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch { }
  };

  const ui = (
    <div
      className="fixed inset-0 z-[99999] bg-black"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div className="text-white/90 text-sm tabular-nums">
          {images.length ? `${index + 1} / ${images.length}` : "0 / 0"}
        </div>

        <div className="w-10 h-10" />
      </div>

      <div
        className="absolute inset-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <TransformWrapper
          key={transformKey}
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          limitToBounds
          pinch={{ disabled: false }}
          doubleClick={{ mode: "zoomIn" }}
          onTransformed={({ state }) => setIsZoomed(state.scale > 1.01)}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative w-screen h-[100svh]">
              {/* Zoom controls */}
              <div className="absolute right-3 top-16 z-40 flex flex-col gap-2">
                <button
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-5 w-5 text-white" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-5 w-5 text-white" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
                  onClick={() => {
                    resetTransform();
                    setIsZoomed(false);
                  }}
                  aria-label="Reset"
                >
                  <RotateCcw className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button
                    className={`absolute left-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${canPrev ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
                      }`}
                    onClick={goPrev}
                    disabled={!canPrev}
                    aria-label="Prev"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>

                  <button
                    className={`absolute right-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${canNext ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
                      }`}
                    onClick={goNext}
                    disabled={!canNext}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}

              <div
                className="absolute inset-0 z-20"
                style={{ touchAction: "none" }}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
              >

                <TransformComponent
                  wrapperStyle={{
                    width: "100vw",
                    height: "100svh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    touchAction: "none",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="block max-w-full max-h-[100svh] object-contain select-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </TransformComponent>
              </div>
            </div>
          )}
        </TransformWrapper>
      </div>
    </div>
  );

  return createPortal(ui, portalElRef.current);
}
