import { RibbonTrail } from "./ribbon-trail";

interface TrailProps {
  points: [number, number, number][];
  color: string;
  opacity?: number;
  width?: number;
  emissiveIntensity?: number;
}

export function Trail({ points, color, opacity = 0.85, width = 0.025, emissiveIntensity = 0.4 }: TrailProps) {
  return (
    <RibbonTrail
      points={points}
      color={color}
      width={width}
      opacity={opacity}
      emissiveIntensity={emissiveIntensity}
    />
  );
}
