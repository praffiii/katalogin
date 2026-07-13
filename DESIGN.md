---
name: Listify
description: Foto produk jadi draft listing siap edit untuk penjual Indonesia.
colors:
  background: "oklch(1.000 0.000 0)"
  surface: "oklch(0.985 0.000 0)"
  surface-raised: "oklch(0.970 0.003 145)"
  border: "oklch(0.900 0.006 145)"
  ink: "oklch(0.180 0.018 145)"
  muted: "oklch(0.440 0.016 145)"
  primary: "oklch(0.350 0.110 140)"
  primary-hover: "oklch(0.300 0.105 140)"
  primary-soft: "oklch(0.940 0.035 140)"
  warning: "oklch(0.620 0.145 72)"
  warning-bg: "oklch(0.975 0.030 72)"
  warning-border: "oklch(0.835 0.100 72)"
  error: "oklch(0.560 0.170 28)"
  error-bg: "oklch(0.975 0.028 28)"
  error-border: "oklch(0.830 0.105 28)"
  success: "oklch(0.440 0.120 145)"
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
---

# Design System: Listify

## Overview

Listify is a practical counter tool for a seller who needs one listing draft quickly. The interface opens directly into the Draft Flow, keeps Product Photo and optional Seller Context close together, then moves the seller into editable Listing Copy without ceremony.

## Visual Direction

- Quiet white workspace with moss green only for primary actions, active progress, and success cues.
- Compact top header, no dashboard shell, no marketing hero.
- Mobile-first flow with a simple desktop two-column workspace.
- Single-photo MVP only: upload, preview, change, remove, and invalid-photo feedback.
- Editable Listing Copy first, Supporting Assistance second.

## Component Rules

- Buttons use 10px radius, visible focus, disabled states, and direct Indonesian labels.
- Panels use full borders and tonal surfaces before shadows.
- Inputs use readable placeholders, clear focus rings, and plain labels.
- Notices use full warning or error borders and stay near affected fields.
- Step progress must show the current state clearly on mobile and desktop.

## Do Not Use

No multi-photo upload, thumbnail gallery, side navigation, analytics panels, chatbot styling, abstract AI gradients, decorative badges, oversized hero typography, cream backgrounds, colored side stripes, gradient text, or nested cards.
