import { useCallback, useRef, useState } from "react";

const useLongPress = (
  { shouldPreventDefault = true, delay = 350 } = {},
  onLongPress,
  onClick,
  onDrag
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [shouldTriggerClick, setShouldTriggerClick] = useState(false);
  const [started, setStarted] = useState(false);
  const timeout = useRef();
  const target = useRef();
  const start = useCallback(
    event => {
      setStarted(true);
      setShouldTriggerClick(true);
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        setShouldTriggerClick(false);
        onLongPress(event);
        setLongPressTriggered(true);
        setStarted(false);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );
  const drag = useCallback(
    event => { 
      timeout.current && clearTimeout(timeout.current);
      setStarted(false);
      setLongPressTriggered(false);
      onDrag(event);
       if (shouldPreventDefault && target.current) {
         target.current.removeEventListener("touchend", preventDefault);
      }
  }, [shouldPreventDefault, longPressTriggered]);

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      !shouldTriggerClick && setShouldTriggerClick(false);
      console.log('shouldTriggerClick', shouldTriggerClick)
      shouldTriggerClick && !longPressTriggered && onClick(event);
      setStarted(false);
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: e => start(e),
    onTouchStart: e => start(e),
    onMouseUp: e => started && clear(e, shouldTriggerClick),
    onMouseLeave: e => started && drag(e),
    //onMouseMove: e => started && drag(e),
    onTouchMove: e => started && drag(e),
    onTouchEnd: e => started && clear(e, shouldTriggerClick)
  };
};

const isTouchEvent = event => {
  return "touches" in event;
};

const preventDefault = event => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

export default useLongPress;