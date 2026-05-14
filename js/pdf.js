/* Direct PDF export — bypasses the browser print dialog so output is identical
   across browsers and printers. Uses html2canvas + jsPDF loaded on-demand from
   esm.sh so there's no build step and no cost until the user clicks. */

let libsPromise = null;
function loadLibs() {
  if (libsPromise) return libsPromise;
  libsPromise = Promise.all([
    import('https://esm.sh/html2canvas@1.4.1'),
    import('https://esm.sh/jspdf@2.5.1'),
  ]).then(([h2c, jspdfMod]) => ({
    html2canvas: h2c.default,
    jsPDF: jspdfMod.jsPDF,
  }));
  return libsPromise;
}

export async function downloadInvoicePDF({ filename = 'invoice.pdf' } = {}) {
  const sheet = document.getElementById('invoice-sheet');
  if (!sheet) throw new Error('Invoice sheet not found');

  const { html2canvas, jsPDF } = await loadLibs();

  // Render at 2x for crisp output. backgroundColor: white so transparent areas
  // don't render as black on some browsers.
  const canvas = await html2canvas(sheet, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Aspect-fit the canvas to the page while keeping it centered.
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h, undefined, 'FAST');
  pdf.save(filename);
}
