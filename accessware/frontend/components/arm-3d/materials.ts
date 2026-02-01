// Brighter base colors + reduced metalness so materials don't
// depend entirely on environment map reflections for visibility.

export const METAL_DARK = {
  color: "#3D3D3D",
  roughness: 0.65,
  metalness: 0.6,
} as const;

export const METAL_MID = {
  color: "#555555",
  roughness: 0.55,
  metalness: 0.65,
} as const;

export const METAL_LIGHT = {
  color: "#6A6A6A",
  roughness: 0.5,
  metalness: 0.6,
} as const;

export const JOINT_EMISSIVE = {
  color: "#F5A623",
  emissive: "#F5A623",
  emissiveIntensity: 0.35,
  roughness: 0.4,
  metalness: 0.7,
} as const;

export const BRACKET_DARK = {
  color: "#2A2A2A",
  roughness: 0.85,
  metalness: 0.5,
} as const;

export const HORN_CREAM = {
  color: "#E8E0D0",
  roughness: 0.6,
  metalness: 0.2,
} as const;

export const EDGE_HIGHLIGHT = {
  color: "#4A4A4A",
  roughness: 0.4,
  metalness: 0.8,
} as const;

export const JOYSTICK_BASE = {
  color: "#2E2E2E",
  roughness: 0.75,
  metalness: 0.55,
} as const;

export const JOYSTICK_ACTIVE_RING = {
  color: "#F5A623",
  emissive: "#F5A623",
  emissiveIntensity: 0,
  roughness: 0.3,
  metalness: 0.6,
} as const;
