import type { ModelViewerElement } from "@google/model-viewer";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerReactProps = DetailedHTMLProps<
  HTMLAttributes<ModelViewerElement>,
  ModelViewerElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerReactProps & {
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "auto-rotate"?: boolean;
        "auto-rotate-delay"?: string | number;
        "camera-controls"?: boolean;
        "camera-orbit"?: string;
        "environment-image"?: string;
        exposure?: string | number;
        "field-of-view"?: string;
        "interaction-prompt"?: "auto" | "none";
        loading?: "auto" | "lazy" | "eager";
        poster?: string;
        reveal?: "auto" | "manual";
        "shadow-intensity"?: string | number;
        src?: string;
        "touch-action"?: "pan-y" | "pan-x" | "none";
      };
    }
  }
}
