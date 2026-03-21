import { describe, expect, it } from "vitest";
import { generateGradientStops } from "../gradient.js";

describe("generateGradientStops", () => {
  describe("relative mode", () => {
    it("symmetric margins → center opacity=1, both edges opacity=0", () => {
      const stops = generateGradientStops("relative", 1, 20, 20);
      // Center is at position 0.5
      const center = stops.find((s) => Math.abs(s.position - 0.5) < 0.001);
      expect(center).toBeDefined();
      expect(center?.opacity).toBeCloseTo(1);

      // Left edge (position=0)
      const leftEdge = stops.find((s) => s.position === 0);
      expect(leftEdge).toBeDefined();
      expect(leftEdge?.opacity).toBeCloseTo(0);

      // Right edge (position=1)
      const rightEdge = stops.find((s) => Math.abs(s.position - 1) < 0.001);
      expect(rightEdge).toBeDefined();
      expect(rightEdge?.opacity).toBeCloseTo(0);
    });

    it("asymmetric margins → each side independently normalized", () => {
      const stops = generateGradientStops("relative", 1, 10, 30);
      // Center at 10/(10+30) = 0.25
      const center = stops.find((s) => Math.abs(s.position - 0.25) < 0.001);
      expect(center).toBeDefined();
      expect(center?.opacity).toBeCloseTo(1);

      // Both edges reach 0 in relative mode
      const leftEdge = stops[0];
      expect(leftEdge.position).toBeCloseTo(0);
      expect(leftEdge.opacity).toBeCloseTo(0);

      const rightEdge = stops[stops.length - 1];
      expect(rightEdge.position).toBeCloseTo(1);
      expect(rightEdge.opacity).toBeCloseTo(0);
    });
  });

  describe("absolute mode", () => {
    it("asymmetric margins → shorter side retains opacity at edge", () => {
      const stops = generateGradientStops("absolute", 1, 10, 30);
      // Left edge: d = 10/30 = 0.333, opacity = 1 - 0.333 ≈ 0.667
      const leftEdge = stops[0];
      expect(leftEdge.position).toBeCloseTo(0);
      expect(leftEdge.opacity).toBeCloseTo(1 - 10 / 30, 2);

      // Right edge: d = 30/30 = 1, opacity = 0
      const rightEdge = stops[stops.length - 1];
      expect(rightEdge.position).toBeCloseTo(1);
      expect(rightEdge.opacity).toBeCloseTo(0);
    });

    it("symmetric margins → same as relative (both edges reach 0)", () => {
      const stops = generateGradientStops("absolute", 1, 20, 20);
      const leftEdge = stops[0];
      expect(leftEdge.opacity).toBeCloseTo(0);
      const rightEdge = stops[stops.length - 1];
      expect(rightEdge.opacity).toBeCloseTo(0);
    });
  });

  describe("intensity variations", () => {
    it("intensity=1 produces linear falloff", () => {
      const stops = generateGradientStops("relative", 1, 20, 20);
      // Midpoint of left side: position = 0.25, d = 0.5, opacity = 0.5
      const midLeft = stops.find((s) => Math.abs(s.position - 0.25) < 0.01);
      expect(midLeft).toBeDefined();
      expect(midLeft?.opacity).toBeCloseTo(0.5, 1);
    });

    it("intensity=2 produces steeper falloff", () => {
      const stops = generateGradientStops("relative", 2, 20, 20);
      // Midpoint of left side: d = 0.5, opacity = (1-0.5)^2 = 0.25
      const midLeft = stops.find((s) => Math.abs(s.position - 0.25) < 0.01);
      expect(midLeft).toBeDefined();
      expect(midLeft?.opacity).toBeCloseTo(0.25, 1);
    });

    it("intensity=0.5 produces gentler falloff", () => {
      const stops = generateGradientStops("relative", 0.5, 20, 20);
      // Midpoint of left side: d = 0.5, opacity = (1-0.5)^0.5 ≈ 0.707
      const midLeft = stops.find((s) => Math.abs(s.position - 0.25) < 0.01);
      expect(midLeft).toBeDefined();
      expect(midLeft?.opacity).toBeCloseTo(0.5 ** 0.5, 1);
    });
  });

  describe("edge cases", () => {
    it("marginLow=0 → center at left edge with opacity=1", () => {
      const stops = generateGradientStops("relative", 1, 0, 20);
      expect(stops[0].position).toBeCloseTo(0);
      expect(stops[0].opacity).toBeCloseTo(1);
      // Right edge reaches 0
      expect(stops[stops.length - 1].position).toBeCloseTo(1);
      expect(stops[stops.length - 1].opacity).toBeCloseTo(0);
    });

    it("marginHigh=0 → center at right edge with opacity=1", () => {
      const stops = generateGradientStops("relative", 1, 20, 0);
      // Left edge reaches 0
      expect(stops[0].position).toBeCloseTo(0);
      expect(stops[0].opacity).toBeCloseTo(0);
      // Center/right edge at position 1
      expect(stops[stops.length - 1].position).toBeCloseTo(1);
      expect(stops[stops.length - 1].opacity).toBeCloseTo(1);
    });

    it("both margins 0 → empty array", () => {
      const stops = generateGradientStops("relative", 1, 0, 0);
      expect(stops).toEqual([]);
    });

    it("stops are sorted by position ascending", () => {
      const stops = generateGradientStops("relative", 1, 15, 25);
      for (let i = 1; i < stops.length; i++) {
        expect(stops[i].position).toBeGreaterThanOrEqual(stops[i - 1].position);
      }
    });

    it("custom stopsPerSide controls output count", () => {
      const stops = generateGradientStops("relative", 1, 20, 20, 5);
      // Left side: 6 stops (0..5 inclusive) + right side: 5 stops (1..5)
      expect(stops).toHaveLength(11);
    });
  });
});
