import { useCallback, useEffect, useRef } from "react";

export function useProxyCallback<Fn extends (...args: never[]) => unknown>(
  fn: Fn
): Fn;

export function useProxyCallback(fn: Function) {
  const callbackRef = useRef<typeof fn>(fn);
  callbackRef.current = fn;
  return useCallback((...args: any[]) => callbackRef.current(...args), []);
}

export function useAttachEventListener<E extends keyof HTMLElementEventMap>(
  ref: React.RefObject<HTMLElement | null>,
  eventName: E,
  handler: (e: HTMLElementEventMap[E]) => void
) {
  const _handler = useProxyCallback(handler);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener(eventName, _handler);
    return () => {
      element.removeEventListener(eventName, _handler);
    };
  }, [ref, eventName, _handler]);
}
