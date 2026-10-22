// Shrinks any element marked data-fit-page="<width>x<height>" (mm, the printable
// area inside the @page margins) so it always lands on ONE printed page.
// CSS cannot force-fit variable-length text, so this measures just before
// printing and applies `zoom` only when the content would overflow.
(function () {
  const MM = 96 / 25.4;
  const MIN_ZOOM = 0.4;
  const SAFETY = 0.97; // leave a little slack for rounding / printer differences

  let measureStyle = null;
  let fitted = [];

  // Make the @media print rules apply on screen so we measure the real print
  // layout, not the screen layout.
  function applyPrintRulesOnScreen() {
    let css = '';
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule && rule.media.mediaText.trim() === 'print') {
          for (const inner of rule.cssRules) {
            if (!(inner instanceof CSSPageRule)) css += inner.cssText + '\n';
          }
        }
      }
    }
    measureStyle = document.createElement('style');
    measureStyle.media = 'screen';
    measureStyle.textContent = css;
    document.head.appendChild(measureStyle);
  }

  function beforePrint() {
    reset();
    applyPrintRulesOnScreen();
    document.querySelectorAll('[data-fit-page]').forEach((el) => {
      const [w, h] = el.dataset.fitPage.split('x').map(Number);
      if (!el.getClientRects().length) return; // hidden: not being printed
      el.style.boxSizing = 'border-box';
      el.style.width = w + 'mm';
      el.style.maxWidth = 'none';
      const height = el.getBoundingClientRect().height;
      const limit = h * MM * SAFETY;
      if (height > limit) {
        const z = Math.max(MIN_ZOOM, limit / height);
        el.style.zoom = z;
        el.style.width = w / z + 'mm';
      } else {
        el.style.boxSizing = el.style.width = el.style.maxWidth = '';
      }
      fitted.push(el);
    });
    if (measureStyle) { measureStyle.remove(); measureStyle = null; }
  }

  function reset() {
    if (measureStyle) { measureStyle.remove(); measureStyle = null; }
    fitted.forEach((el) => { el.style.zoom = el.style.width = el.style.maxWidth = el.style.boxSizing = ''; });
    fitted = [];
  }

  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', reset);
})();
