import graphiqlStylesUrl from "@graphiql/react/dist/style.css?url";
import virtualDashboardStyles from "@kube/virtual-dashboard/style.css?raw";
import monacoEditorStylesUrl from "monaco-editor/min/vs/editor/editor.main.css?url";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function useForceRender() {
  const [, setRenders] = useState(0);
  return () => setRenders((x) => x + 1);
}

/**
 * Wrapper for ShadowDOM VirtualDashboard and Monaco Editor styles.
 */
export const VirtualDashboardWrapper: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot>(null);
  const forceRender = useForceRender();

  useEffect(() => {
    if (wrapperRef.current && !shadowRootRef.current) {
      // Remove previous shadow if exists
      const shadow = wrapperRef.current.attachShadow({ mode: "open" });

      // Inject inline CSS
      // Maybe not the most efficient way as it will make styles content live inside JS memory
      const style = document.createElement("style");
      style.innerText = virtualDashboardStyles;
      shadow.appendChild(style);

      // Inject Monaco editor styles
      const monacoStyles = document.createElement("style");
      monacoStyles.innerText = `@import "${monacoEditorStylesUrl}";`;
      shadow.appendChild(monacoStyles);

      // Inject GraphiQL editor styles
      const graphiqlStyles = document.createElement("style");
      graphiqlStyles.innerText = `@import "${graphiqlStylesUrl}";`;
      shadow.appendChild(graphiqlStyles);

      shadowRootRef.current = shadow;
      forceRender();
    }
  }, []);

  return (
    <div ref={wrapperRef} className={className}>
      {shadowRootRef.current && createPortal(children, shadowRootRef.current)}
    </div>
  );
};
