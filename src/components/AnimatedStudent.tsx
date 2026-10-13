import { useState } from "react";
import "../styles/animated-student.css";

/**
 * Animated 3D student. The picture is the file student-3d-animated.svg in my project's public folder
 * (I upload it to GitHub myself). Tries "/student-3d-animated.svg", then the same file on my live site.
 * If both fail it shows an empty area (no broken-image text). Do NOT draw, generate or replace the picture.
 */
const SOURCES = [
  "/student-3d-animated.svg",
  "https://dropshippingacademy0.vercel.app/student-3d-animated.svg",
];

export default function AnimatedStudent() {
  const [i, setI] = useState(0);
  if (i >= SOURCES.length) return <div className="anim-student anim-student-empty" aria-hidden="true" />;
  return (
    <div className="anim-student">
      <img src={SOURCES[i]} width={780} height={793} onError={() => setI((n) => n + 1)}
           alt="A student studying on a laptop beside a stack of books" />
    </div>
  );
}
