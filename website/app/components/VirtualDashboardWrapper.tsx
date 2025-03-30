import virtualDashboardStyles from "@kube/virtual-dashboard/style.css?raw";
import graphiqlStylesUrl from "graphiql/graphiql.min.css?url";
import monacoEditorStylesUrl from "monaco-editor/min/vs/editor/editor.main.css?url";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function useForceRender() {
  const [, setRenders] = useState(0);
  return () => setRenders((x) => x + 1);
}

/**
 * ShadowDOM wrapper for VirtualDashboard styles.
 */
export const VirtualDashboardWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
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

      // Inject GraphiQL styles
      const graphiqlStylesLink = document.createElement("link");
      graphiqlStylesLink.rel = "stylesheet";
      graphiqlStylesLink.href = graphiqlStylesUrl;
      shadow.appendChild(graphiqlStylesLink);

      // Inject Monaco editor styles
      const monacoStyles = document.createElement("style");
      monacoStyles.innerText = `@import "${monacoEditorStylesUrl}";`;
      shadow.appendChild(monacoStyles);

      shadowRootRef.current = shadow;
      forceRender();
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="flex top-0 left-0 right-0 bottom-0 absolute"
    >
      {shadowRootRef.current && createPortal(children, shadowRootRef.current)}
    </div>
  );
};
