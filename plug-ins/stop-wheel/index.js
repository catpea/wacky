import constants from '/plug-ins/constants/index.js';

const Action = constants(' SCROLL ZOOM ');

export default function stopWheel(el){

  function wheelHandler(e){

    const hasVerticalScrollbar = el.clientHeight < el.scrollHeight;
    const hasHorizontalScrollbar = el.clientWidth < el.scrollWidth;
    const isHoldingShiftKey = e.shiftKey;

    let action = Action.ZOOM;

    if(hasVerticalScrollbar) action = Action.SCROLL;
    if(isHoldingShiftKey) action = Action.ZOOM;

    if( action == Action.ZOOM ) {
      e.preventDefault(); // do not perform default action
      return false;
    };

    if( action == Action.SCROLL ) {
      e.stopPropagation(); // end the event at the scroll, don't let anubody else hear it.
    }

  } // wheelHandler

  el.addEventListener('wheel', wheelHandler);
    return {
      destroy() {
        el.removeEventListener('wheel', wheelHandler);
      }
  };

}
