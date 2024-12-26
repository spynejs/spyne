const createFaderInlineText = (isInBool = false, t = 1, e = 'ease', startZeroBool = false) => {
  const initOpacityZero = startZeroBool === true ? 'opacity:0;' : ''
  const opacity = isInBool === true ? 1 : 0
  return `${initOpacityZero}transition: opacity ${t}s ${e}; opacity: ${opacity};`
}
export function fadein(el, t) {
  const currentOpacity = window.getComputedStyle(el).opacity * 1
  const startAtZero = currentOpacity === 1
  const inlineCss = createFaderInlineText(true, t, 'ease', startAtZero)
  el.style.cssText += inlineCss
}
export function fadeout(el, t, callback) {
  const inlineCss = createFaderInlineText(false, t, 'ease')
  el.style.cssText += inlineCss

  // window.setTimeout(callback, t * 1000);
  el.addEventListener('transitionend', callback, false)
}
