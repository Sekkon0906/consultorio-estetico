"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { interpolate } from "flubber";

interface Props {
  tipo: string | null;
}

const paths = {
  inicialJ: "M100,600 Q200,200 400,600 T700,600",
  inicialM: "M1400,600 Q1300,200 1100,600 T900,600",

  faciales1: "M300,500 C350,350 450,350 500,500 C520,580 460,640 380,600 Z",
  faciales2: "M1200,500 C1150,350 1050,350 1000,500 C980,580 1040,640 1120,600 Z",

  corporales1: "M300,550 C320,400 480,400 500,550 C510,640 420,680 360,620 Z",
  corporales2: "M1200,550 C1180,400 1020,400 1000,550 C990,640 1080,680 1140,620 Z",

  capilares1: "M300,520 C360,420 440,420 500,520 C520,600 460,660 380,600 Z",
  capilares2: "M1200,520 C1140,420 1060,420 1000,520 C980,600 1040,660 1120,600 Z",
};

export default function SiluetasAnimadas({ tipo }: Props) {
  const [path1, setPath1] = useState(paths.inicialJ);
  const [path2, setPath2] = useState(paths.inicialM);
  const [flubberFn1, setFlubberFn1] = useState(() => (t: number) => paths.inicialJ);
  const [flubberFn2, setFlubberFn2] = useState(() => (t: number) => paths.inicialM);

  const motionValue1 = useMotionValue(0);
  const motionValue2 = useMotionValue(0);

  useEffect(() => {
    let next1 = paths.inicialJ;
    let next2 = paths.inicialM;

    switch (tipo) {
      case "Explora los procedimientos faciales":
        next1 = paths.faciales1;
        next2 = paths.faciales2;
        break;
      case "Explora los procedimientos corporales":
        next1 = paths.corporales1;
        next2 = paths.corporales2;
        break;
      case "Explora los procedimientos capilares":
        next1 = paths.capilares1;
        next2 = paths.capilares2;
        break;
      default:
        next1 = paths.inicialJ;
        next2 = paths.inicialM;
    }

    setFlubberFn1(() => interpolate(path1, next1, { maxSegmentLength: 2 }));
    setFlubberFn2(() => interpolate(path2, next2, { maxSegmentLength: 2 }));

    const controls1 = animate(0, 1, {
      duration: 3,
      ease: "easeInOut",
      onUpdate: (t) => setPath1(flubberFn1(t)),
    });
    const controls2 = animate(0, 1, {
      duration: 3,
      ease: "easeInOut",
      onUpdate: (t) => setPath2(flubberFn2(t)),
    });

    return () => {
      controls1.stop();
      controls2.stop();
    };
  }, [tipo]);

  // movimiento ondulante serpenteante
  useEffect(() => {
    animate(0, 1, {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
      onUpdate: (t) => {
        motionValue1.set(Math.sin(t * Math.PI * 2) * 20);
        motionValue2.set(Math.cos(t * Math.PI * 2) * 20);
      },
    });
  }, []);

  const y1 = useTransform(motionValue1, (v) => v);
  const y2 = useTransform(motionValue2, (v) => v);

  return (
    <svg
      viewBox="0 0 1500 800"
      className="absolute inset-0 w-full h-full overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d={path1}
        fill="none"
        stroke="#B08968"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{ y: y1 }}
      />

      <motion.path
        d={path2}
        fill="none"
        stroke="#6C584C"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{ y: y2 }}
      />

      <motion.circle
        cx="750"
        cy="400"
        r="300"
        fill="url(#grad)"
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <defs>
        <radialGradient id="grad">
          <stop offset="0%" stopColor="#E9DED2" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}
