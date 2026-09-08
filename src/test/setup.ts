import "@testing-library/jest-dom/vitest";

// O jsdom não implementa a API de Pointer Capture nem scrollIntoView, e os
// componentes do Radix (Select, Dropdown) chamam as duas ao abrir. Sem estes
// stubs qualquer teste que abra um Select quebra com "hasPointerCapture is not
// a function".
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}
