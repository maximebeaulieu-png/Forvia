The original certificate, always on the left, always the source of truth. Highlight rectangles are normalised so they survive zoom.

```jsx
<DocumentViewer
  pages={[{ n: 1, imageUrl: "../../assets/pages/marron_mts_p1.jpeg", lang: "fr", ocrUsed: true },
          { n: 2, imageUrl: "../../assets/pages/marron_mts_p2.jpeg", lang: "fr", ocrUsed: true }]}
  activePage={page} activeHighlightId={active}
  highlights={[{ id: "recall", page: 2, x: 0.09, y: 0.42, w: 0.62, h: 0.032 }]}
  fileName="MTS_MMA_2025.pdf" />
```

Nothing sells trust like the highlight landing on the right line — wire `onEvidenceClick` from `CoverageGrid` and `FindingsList` to `activePage` + `activeHighlightId`.
