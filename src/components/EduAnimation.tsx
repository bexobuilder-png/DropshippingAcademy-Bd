"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import "./edu-animation.css";

/* Three academic-style animations for the registration flow.
   Needs these CSS variables on :root: --bg --ink --muted --stroke --orange --yellow --brown --cream
   kind="intro"   : user taps Register              (3.0s, skippable)
   kind="submit"  : form sent, email code going out  (3.6s, not skippable)
   kind="success" : email verified, seat confirmed   (3.8s, skippable)
   See PROMPT.md for the full wiring. */
export type AnimKind = "intro" | "submit" | "success";

export const ART: Record<AnimKind, string> = {
  "intro": "<svg class=\"edu-art\" viewBox=\"0 0 360 320\" role=\"img\" aria-label=\"Books, a graduation cap, an idea and a parcel\" xmlns=\"http://www.w3.org/2000/svg\">\n  <ellipse class=\"a-shadow fs\" cx=\"180\" cy=\"280\" rx=\"124\" ry=\"9\"/>\n  <g class=\"a-sparks\">\n    <path class=\"fy sp s1\" d=\"M118 70l4 10 10 4-10 4-4 10-4-10-10-4 10-4z\"/>\n    <path class=\"fy sp s2\" d=\"M256 62l3 8 8 3-8 3-3 8-3-8-8-3 8-3z\"/>\n    <path class=\"fy sp s3\" d=\"M62 112l3 7 7 3-7 3-3 7-3-7-7-3 7-3z\"/>\n  </g>\n  <g class=\"a-book a-b1\"><rect class=\"fo\" x=\"70\" y=\"238\" width=\"220\" height=\"32\" rx=\"7\"/><path d=\"M96 238v32M270 250h-142\"/></g>\n  <g class=\"a-book a-b2\"><rect class=\"fy\" x=\"85\" y=\"206\" width=\"190\" height=\"32\" rx=\"7\"/><path d=\"M111 206v32M255 218h-122\"/></g>\n  <g class=\"a-book a-b3\"><rect class=\"fb\" x=\"100\" y=\"174\" width=\"160\" height=\"32\" rx=\"7\"/><path d=\"M126 174v32M240 186h-98\"/></g>\n  <g class=\"a-cap\">\n    <path class=\"fk\" d=\"M146 150v14q34 17 68 0v-14\"/>\n    <path class=\"fk\" d=\"M180 112l70 22-70 22-70-22z\"/>\n    <path d=\"M240 139v26\"/><circle class=\"fy\" cx=\"240\" cy=\"168\" r=\"5\"/>\n  </g>\n  <g class=\"a-bulb\">\n    <g class=\"a-rays\"><path d=\"M180 22v-9M148 34l-6-6M212 34l6-6M138 62h-9M222 62h9\"/></g>\n    <circle class=\"fy\" cx=\"180\" cy=\"62\" r=\"23\"/>\n    <path d=\"M172 62l8 10 8-10\"/>\n    <rect class=\"fc\" x=\"168\" y=\"85\" width=\"24\" height=\"12\" rx=\"4\"/>\n  </g>\n  <g class=\"a-parcel\">\n    <rect class=\"fy\" x=\"38\" y=\"148\" width=\"58\" height=\"46\" rx=\"5\"/>\n    <rect class=\"fo\" x=\"59\" y=\"148\" width=\"16\" height=\"46\"/>\n    <path d=\"M38 164h58\"/>\n  </g>\n  <g class=\"a-chart\">\n    <rect class=\"fo a-bar bar1\" x=\"262\" y=\"178\" width=\"14\" height=\"22\"/>\n    <rect class=\"fy a-bar bar2\" x=\"282\" y=\"164\" width=\"14\" height=\"36\"/>\n    <rect class=\"fb a-bar bar3\" x=\"302\" y=\"146\" width=\"14\" height=\"54\"/>\n    <path class=\"a-trend\" d=\"M258 140l26-20 14 10 26-26M310 104h14v14\"/>\n  </g>\n</svg>",
  "submit": "<svg class=\"edu-art art-submit\" viewBox=\"0 0 360 320\" role=\"img\" aria-label=\"An application form being filled in and sent in an envelope\" xmlns=\"http://www.w3.org/2000/svg\">\n  <ellipse class=\"a-shadow fs\" cx=\"180\" cy=\"290\" rx=\"120\" ry=\"9\"/>\n  <g class=\"a-board\">\n    <rect class=\"fb\" x=\"92\" y=\"40\" width=\"176\" height=\"236\" rx=\"14\"/>\n    <rect class=\"fc\" x=\"106\" y=\"64\" width=\"148\" height=\"198\" rx=\"6\"/>\n    <rect class=\"fy\" x=\"140\" y=\"26\" width=\"80\" height=\"28\" rx=\"9\"/>\n    <path class=\"ln r0\" pathLength=\"100\" d=\"M128 88h60\" style=\"stroke-width:5\"/>\n    <rect class=\"fc\" x=\"122\" y=\"110\" width=\"16\" height=\"16\" rx=\"3\"/><path class=\"ln r1\" pathLength=\"100\" d=\"M150 118h86\"/><path class=\"tick t1\" pathLength=\"100\" d=\"M125 118l4 4 7-9\"/>\n    <rect class=\"fc\" x=\"122\" y=\"144\" width=\"16\" height=\"16\" rx=\"3\"/><path class=\"ln r2\" pathLength=\"100\" d=\"M150 152h86\"/><path class=\"tick t2\" pathLength=\"100\" d=\"M125 152l4 4 7-9\"/>\n    <rect class=\"fc\" x=\"122\" y=\"178\" width=\"16\" height=\"16\" rx=\"3\"/><path class=\"ln r3\" pathLength=\"100\" d=\"M150 186h86\"/><path class=\"tick t3\" pathLength=\"100\" d=\"M125 186l4 4 7-9\"/>\n    <rect class=\"fc\" x=\"122\" y=\"212\" width=\"16\" height=\"16\" rx=\"3\"/><path class=\"ln r4\" pathLength=\"100\" d=\"M150 220h86\"/><path class=\"tick t4\" pathLength=\"100\" d=\"M125 220l4 4 7-9\"/>\n    <g class=\"a-pencil\"><g transform=\"translate(150 118) rotate(38)\">\n      <path class=\"fc\" d=\"M0 0l-7-18h14z\"/><path class=\"fk\" d=\"M0 0l-2.6-6.5h5.2z\"/>\n      <rect class=\"fo\" x=\"-7\" y=\"-70\" width=\"14\" height=\"52\"/>\n      <rect class=\"fy\" x=\"-7\" y=\"-80\" width=\"14\" height=\"10\"/>\n      <rect class=\"fb\" x=\"-7\" y=\"-92\" width=\"14\" height=\"12\" rx=\"3\"/>\n    </g></g>\n  </g>\n  <g class=\"a-env\"><g class=\"a-env-fly\">\n    <rect class=\"fy\" x=\"70\" y=\"150\" width=\"220\" height=\"134\" rx=\"12\"/>\n    <path d=\"M70 284l80-62M290 284l-80-62\"/>\n    <path class=\"fo\" d=\"M70 162q0-12 12-12h196q12 0 12 12l-110 78z\"/>\n    <circle class=\"fb\" cx=\"180\" cy=\"236\" r=\"14\"/><path d=\"M173 236l5 5 9-11\"/>\n  </g></g>\n</svg>",
  "success": "<svg class=\"edu-art art-success\" viewBox=\"0 0 360 320\" role=\"img\" aria-label=\"A graduation certificate with a seal and a tossed cap\" xmlns=\"http://www.w3.org/2000/svg\">\n  <ellipse class=\"a-shadow fs\" cx=\"180\" cy=\"292\" rx=\"124\" ry=\"9\"/>\n  <g class=\"a-conf\">\n    <rect class=\"fo\" x=\"70\" y=\"48\" width=\"10\" height=\"7\" style=\"--dx:-26px\"/>\n    <circle class=\"fy\" cx=\"120\" cy=\"22\" r=\"4.5\" style=\"--dx:-14px\"/>\n    <rect class=\"fb\" x=\"248\" y=\"26\" width=\"10\" height=\"7\" style=\"--dx:20px\"/>\n    <circle class=\"fo\" cx=\"296\" cy=\"58\" r=\"4.5\" style=\"--dx:28px\"/>\n    <rect class=\"fy\" x=\"34\" y=\"120\" width=\"10\" height=\"7\" style=\"--dx:-16px\"/>\n    <circle class=\"fb\" cx=\"322\" cy=\"116\" r=\"4.5\" style=\"--dx:18px\"/>\n    <rect class=\"fo\" x=\"196\" y=\"8\" width=\"10\" height=\"7\" style=\"--dx:10px\"/>\n    <circle class=\"fy\" cx=\"334\" cy=\"176\" r=\"4.5\" style=\"--dx:12px\"/>\n  </g>\n  <g class=\"a-roll rl\"><rect class=\"fy\" x=\"56\" y=\"78\" width=\"20\" height=\"176\" rx=\"10\"/><path d=\"M66 96v2M66 234v2\" style=\"stroke-width:3\"/></g>\n  <g class=\"a-paper\">\n    <rect class=\"fc\" x=\"70\" y=\"82\" width=\"220\" height=\"164\" rx=\"6\"/>\n    <rect x=\"82\" y=\"94\" width=\"196\" height=\"140\" rx=\"3\" style=\"stroke-dasharray:7 6;stroke-width:2\"/>\n    <path class=\"ln l1\" pathLength=\"100\" d=\"M130 122h100\" style=\"stroke-width:5\"/>\n    <path class=\"ln l2\" pathLength=\"100\" d=\"M110 148h140\"/>\n    <path class=\"ln l3\" pathLength=\"100\" d=\"M120 166h120\"/>\n    <path class=\"ln l4\" pathLength=\"100\" d=\"M108 202h84\"/>\n  </g>\n  <g class=\"a-roll rr\"><rect class=\"fy\" x=\"284\" y=\"78\" width=\"20\" height=\"176\" rx=\"10\"/><path d=\"M294 96v2M294 234v2\" style=\"stroke-width:3\"/></g>\n  <g class=\"a-seal\">\n    <path class=\"fb\" d=\"M226 238l-10 42 16-9 10 15 8-46z\"/>\n    <circle class=\"fo\" cx=\"240\" cy=\"220\" r=\"29\"/>\n    <circle cx=\"240\" cy=\"220\" r=\"21\" style=\"stroke-width:2;stroke-dasharray:4 4\"/>\n    <path class=\"tick\" pathLength=\"100\" d=\"M229 221l8 9 17-20\" style=\"stroke-width:5\"/>\n  </g>\n  <g class=\"a-sparks\">\n    <path class=\"fy sp s1\" d=\"M330 196l4 10 10 4-10 4-4 10-4-10-10-4 10-4z\"/>\n    <path class=\"fy sp s2\" d=\"M42 200l3 8 8 3-8 3-3 8-3-8-8-3 8-3z\"/>\n  </g>\n  <g class=\"a-toss\">\n    <path class=\"fk\" d=\"M154 46v10q26 12 52 0V46\"/>\n    <path class=\"fk\" d=\"M180 24l44 14-44 14-44-14z\"/>\n    <path d=\"M214 41v18\"/><circle class=\"fy\" cx=\"214\" cy=\"62\" r=\"4.5\"/>\n  </g>\n</svg>"
};

const DEFAULTS: Record<AnimKind, { ms: number; skip: boolean; words: [string, string, string] }> = {
  intro: { ms: 3000, skip: true, words: ["শিখুন", "তৈরি করুন", "আয় করুন"] },
  submit: { ms: 3600, skip: false, words: ["তথ্য লিখছি", "যাচাই করছি", "কোড পাঠাচ্ছি"] },
  success: { ms: 3800, skip: true, words: ["ইমেইল যাচাই সম্পন্ন", "আপনার আসন নিশ্চিত", "স্বাগতম!"] },
};

type Props = {
  kind: AnimKind;
  open: boolean;
  onDone: () => void;
  /** Set false when the parent closes it (for example after the API call finishes). */
  autoClose?: boolean;
  ms?: number;
  words?: [string, string, string];
  skipLabel?: string;
  runKey?: number;
};

export default function EduAnimation({
  kind,
  open,
  onDone,
  autoClose = true,
  ms,
  words,
  skipLabel = "এড়িয়ে যান",
  runKey = 0,
}: Props) {
  const cfg = DEFAULTS[kind];
  const total = ms ?? cfg.ms;
  const w = words ?? cfg.words;
  const skipRef = useRef<HTMLButtonElement>(null);
  const artHostRef = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  const [instanceId, setInstanceId] = useState(0);

  useEffect(() => {
    if (open) {
      setInstanceId((prev) => prev + 1);
    }
  }, [open, kind, runKey]);

  const svgMarkup = useMemo(
    () => ({
      __html: ART[kind].replace(/class="edu-art/, 'class="edu-art run'),
    }),
    [kind, instanceId]
  );

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Force SVG layout reflow so CSS keyframe animations always trigger cleanly from frame 0
    const host = artHostRef.current;
    if (host) {
      const svgEl = host.querySelector(".edu-art");
      if (svgEl) {
        svgEl.classList.remove("run");
        void svgEl.getBoundingClientRect();
        svgEl.classList.add("run");
      }
    }

    const id = autoClose
      ? window.setTimeout(() => done.current(), total)
      : 0;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && cfg.skip && done.current();
    document.addEventListener("keydown", onKey);
    if (cfg.skip) skipRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, kind, autoClose, total, cfg.skip, instanceId]);

  if (!open) return null;
  return (
    <div
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label={w.join(", ")}
      style={{ ["--intro-ms" as string]: `${total}ms` }}
    >
      <div key={`${kind}-${instanceId}`} className="intro-inner">
        <div
          ref={artHostRef}
          className="intro-art"
          dangerouslySetInnerHTML={svgMarkup}
        />
        <div className="intro-words" aria-live="polite">
          <span className="w1">{w[0]}</span>
          <span className="w2">{w[1]}</span>
          <span className="w3">{w[2]}</span>
        </div>
        <div className="intro-bar" aria-hidden="true">
          <i />
        </div>
        {cfg.skip && (
          <button
            ref={skipRef}
            className="intro-skip"
            type="button"
            onClick={() => done.current()}
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
