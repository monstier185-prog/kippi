/**
 * Print / PDF export trigger (spec Sesi 7).
 *
 * Export is implemented honestly with the browser's own print pipeline:
 * `window.print()` opens the native print dialog, from which the user can print
 * on paper or "Save as PDF". There is no server-side PDF renderer. The
 * print-ready layout and page-break rules live in `PrintCV.module.css` under
 * `@media print`. jsdom does not implement `window.print`, so this guards for
 * its absence (used in tests).
 */
export function printPortfolio(): void {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}
