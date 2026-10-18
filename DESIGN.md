---
version: alpha
name: Stack
description: A private note list and a public waitlist.
colors:
  bg: '#080616'
  surface: '#1a1953'
  ink: '#f4f6ff'
  ink-soft: '#c9cef2'
  accent: '#2f2fe4'
  accent-press: '#162e93'
  accent-ink: '#ffffff'
  line: '#162e93'
  control: '#8e97d6'
  danger: '#ff5d73'
  danger-press: '#ff8b9a'
  scrim: 'rgb(0 0 0 / 62%)'
typography:
  body:
    fontFamily: 'Inter Tight, system-ui, sans-serif'
    fontSize: 1rem
---

# Design

The four swatches are [2F2FE4, 162E93, 1A1953, 080616](https://colorhunt.co/palette/2f2fe4162e931a1953080616). The field is the near-black. Raised panels are the deep indigo. The button is the bright violet, with white type. The royal blue is the pressed button and the quiet divider. Field edges and secondary type are lighter steps of that same violet, because the four swatches are all too dark to read as text or as a box edge. Danger stays a separate red.

Raised surfaces are one step lighter than the field, with a soft offset shadow. Control corners are 6px. A dialog’s outer corner is that radius plus its padding. Buttons scale to 0.96 while pressed and return if the press is released early.
