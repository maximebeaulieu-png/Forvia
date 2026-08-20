/**
 * Left pane of the certificate screen: page thumbnails, the rendered page, and the evidence highlight layer.
 * Signature element #1 — clicking a value in the coverage grid lights up the exact line here.
 */
export interface DocumentPage {
  n: number;
  imageUrl: string;
  /** page language code shown as a badge, e.g. "fr" */
  lang?: string;
  ocrUsed?: boolean;
}
export interface EvidenceHighlight {
  id: string;
  page: number;
  /** normalised 0–1 rectangle on the page image */
  x: number; y: number; w: number; h: number;
}
export interface DocumentViewerProps {
  pages: DocumentPage[];
  /** controlled page number — set it when a grid row is clicked */
  activePage?: number;
  onPageChange?: (n: number) => void;
  highlights?: EvidenceHighlight[];
  /** the highlight that pulses (300 ms) and gets an outline */
  activeHighlightId?: string;
  /** default true */
  showEvidence?: boolean;
  onToggleEvidence?: () => void;
  /** forces the OCR-quality badge on regardless of per-page flags */
  ocrUsed?: boolean;
  /** original file name, shown on the download button */
  fileName?: string;
  style?: React.CSSProperties;
}
export declare function DocumentViewer(props: DocumentViewerProps): JSX.Element;
