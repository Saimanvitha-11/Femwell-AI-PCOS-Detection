import { motion } from "framer-motion";

type Props = { probability: number; size?: "sm" | "md" };

export function PCOSGauge({ probability, size = "md" }: Props) {
  const percentage = Math.round(probability * 100);
  const r = size === "sm" ? 48 : 80;
  const stroke = size === "sm" ? 10 : 16;
  const normalizedRadius = r - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = "#22c55e"; // green
  if (probability >= 0.33 && probability < 0.66) strokeColor = "#eab308"; // yellow
  if (probability >= 0.66) strokeColor = "#ef4444"; // red

  const dim = r * 2;
  const fontSize = size === "sm" ? "text-xl" : "text-4xl";

  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: dim, height: dim }}>
      <svg height={dim} width={dim} className="transform -rotate-90">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={r}
          cy={r}
          className="text-muted"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          r={normalizedRadius}
          cx={r}
          cy={r}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className={`${fontSize} font-bold font-serif`}
          style={{ color: strokeColor }}
        >
          {percentage}%
        </motion.span>
        {size === "md" && <span className="text-sm text-muted-foreground">Probability</span>}
      </div>
    </div>
  );
}
