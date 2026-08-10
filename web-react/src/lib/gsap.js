/* ============================================================
   GSAP INIT — registers ScrollTrigger once for the whole app.
   Import this module (for its side effect) before any component
   uses ScrollTrigger-based animations.
   ============================================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Split an element's text into per-word masks, preserving <em>/<br>.
   Ported 1:1 from gsap-animations.js `wrapWords`. Returns the array of
   inner spans (`.w-in`) that the caller animates (yPercent 118 -> 0). */
export function wrapWords(root) {
  const inners = [];
  function proc(node) {
    const frag = document.createDocumentFragment();
    Array.prototype.forEach.call(node.childNodes, (child) => {
      if (child.nodeType === 3) {
        // text node
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part === '') return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const mask = document.createElement('span');
          mask.className = 'w-mask';
          const inn = document.createElement('span');
          inn.className = 'w-in';
          inn.textContent = part;
          mask.appendChild(inn);
          frag.appendChild(mask);
          inners.push(inn);
        });
      } else if (child.nodeType === 1) {
        // element node
        if (child.tagName === 'BR') {
          frag.appendChild(document.createElement('br'));
        } else {
          const clone = child.cloneNode(false);
          clone.appendChild(proc(child));
          frag.appendChild(clone);
        }
      }
    });
    return frag;
  }
  const built = proc(root);
  root.innerHTML = '';
  root.appendChild(built);
  return inners;
}

export { gsap, ScrollTrigger };
