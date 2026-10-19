const floating = document.querySelector<HTMLDivElement>('#hover-preview')!;
const hoverImage = document.querySelector<HTMLImageElement>('#hover-image')!;
const hoverTitle = document.querySelector<HTMLParagraphElement>('#hover-title')!;
const dialog = document.querySelector<HTMLDialogElement>('#preview-dialog')!;
const dialogImage = document.querySelector<HTMLImageElement>('#dialog-image')!;
const dialogTitle = document.querySelector<HTMLHeadingElement>('#preview-title')!;
const visit = document.querySelector<HTMLAnchorElement>('#visit-project')!;
const visitLabel = document.querySelector<HTMLSpanElement>('#visit-label')!;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let active: HTMLElement | null = null;
let lastPointer = '';
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function configureImage(image: HTMLImageElement, trigger: HTMLElement) {
  const width = Number(trigger.dataset.imageWidth) || 584;
  const height = Number(trigger.dataset.imageHeight) || 329;
  image.width = width;
  image.height = height;
  image.style.aspectRatio = `${width} / ${height}`;
  image.src = trigger.dataset.image || '';
}

function hidePreview() {
  clearTimeout(hideTimer);
  floating.hidden = true;
  active = null;
}

function showPreview(trigger: HTMLElement) {
  if (!finePointer.matches || dialog.open) return;
  clearTimeout(hideTimer);
  const image = trigger.dataset.image;
  if (!image) return;
  active = trigger;
  configureImage(hoverImage, trigger);
  hoverTitle.textContent = trigger.dataset.caption || '';
  hoverTitle.hidden = !trigger.dataset.caption;
  const rect = trigger.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return hidePreview();
  const width = Math.min(480, window.innerWidth - 32);
  floating.hidden = false;
  const height = floating.getBoundingClientRect().height;
  const right = rect.right + 24;
  const x = right + width <= window.innerWidth - 16
    ? right : Math.max(16, window.innerWidth - width - 16);
  const y = Math.min(Math.max(16, rect.top), window.innerHeight - height - 16);
  floating.style.left = `${x}px`;
  floating.style.top = `${Math.max(16, y)}px`;
  floating.hidden = false;
}

function showDialog(trigger: HTMLElement) {
  hidePreview();
  dialogTitle.textContent = trigger.dataset.title || 'Project preview';
  configureImage(dialogImage, trigger);
  dialogImage.alt = trigger.dataset.title || 'Project preview';
  const url = trigger.dataset.url;
  visit.hidden = !url;
  if (url) {
    visit.href = url;
    visitLabel.textContent = trigger.dataset.preview === 'amiba-isp' ? 'Open presentation' : 'Visit website';
  } else {
    visit.removeAttribute('href');
  }
  dialog.showModal();
}

document.querySelectorAll<HTMLElement>('[data-preview]').forEach(trigger => {
  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') showPreview(trigger);
  });
  trigger.addEventListener('pointerleave', () => {
    if (document.activeElement !== trigger) hideTimer = setTimeout(hidePreview, 160);
  });
  trigger.addEventListener('focus', () => showPreview(trigger));
  trigger.addEventListener('blur', hidePreview);
  trigger.addEventListener('pointerdown', event => { lastPointer = event.pointerType; });
  trigger.addEventListener('click', event => {
    const pointer = lastPointer;
    lastPointer = '';
    if (event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    if (trigger.tagName === 'BUTTON' || !finePointer.matches || pointer === 'touch') {
      event.preventDefault();
      showDialog(trigger);
    }
  });
});

floating.addEventListener('pointerenter', () => clearTimeout(hideTimer));
floating.addEventListener('pointerleave', () => {
  if (document.activeElement !== active) hidePreview();
});

document.querySelector('#close-preview')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') hidePreview(); });
window.addEventListener('scroll', () => {
  if (active && (active.matches(':hover') || document.activeElement === active)) showPreview(active);
  else hidePreview();
}, { passive: true });
window.addEventListener('resize', () => { if (active) showPreview(active); }, { passive: true });

// Warm the browser's image cache after the page's critical resources finish.
// Keep requests low priority and sequential so reading stays responsive.
async function prefetchPreviews() {
  const urls = new Set(Array.from(document.querySelectorAll<HTMLElement>('[data-image]'), trigger => trigger.dataset.image));
  for (const url of urls) {
    if (!url) continue;
    await new Promise<void>(resolve => {
      const image = new Image();
      image.fetchPriority = 'low';
      image.decoding = 'async';
      image.onload = image.onerror = () => resolve();
      image.src = url;
    });
  }
}

function schedulePrefetch() {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => void prefetchPreviews(), { timeout: 1500 });
  } else {
    setTimeout(() => void prefetchPreviews(), 250);
  }
}

if (document.readyState === 'complete') schedulePrefetch();
else window.addEventListener('load', schedulePrefetch, { once: true });
