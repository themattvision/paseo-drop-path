import { Platform } from "react-native";

// Il plugin fa il typecheck senza la libreria DOM: qui si dichiara solo ciò che serve.
interface DomElement {
  parentElement: DomElement | null;
  closest(selector: string): DomElement | null;
  querySelector(selector: string): DomElement | null;
}

interface DomTextArea extends DomElement {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  focus(): void;
  setSelectionRange(start: number, end: number): void;
  dispatchEvent(event: unknown): boolean;
}

interface DropEventLike {
  target: DomElement | null;
  isTrusted: boolean;
  dataTransfer: { files: ArrayLike<unknown> } | null;
  preventDefault(): void;
  stopImmediatePropagation(): void;
}

declare const window: {
  paseoDesktop?: { webUtils?: { getPathForFile?: (file: unknown) => string } };
  HTMLTextAreaElement: { prototype: object };
  Event: new (type: string, init: { bubbles: boolean }) => unknown;
  DragEvent: new (type: string, init: object) => unknown;
  DataTransfer: new () => unknown;
  addEventListener(type: "drop", listener: (event: DropEventLike) => void, capture: boolean): void;
  removeEventListener(
    type: "drop",
    listener: (event: DropEventLike) => void,
    capture: boolean,
  ): void;
};

const COMPOSER_SELECTOR = '[data-testid="message-input-root"]';
// Zone che hanno già una loro gestione dei drop: non si toccano.
const EXCLUDED_SELECTOR =
  '.xterm, [data-testid^="terminal"], [data-testid="workspace-explorer-sidebar"], [data-testid="workspace-file-pane"]';

function readPaths(files: ArrayLike<unknown>): string[] | null {
  const getPath = window.paseoDesktop?.webUtils?.getPathForFile;
  if (typeof getPath !== "function") return null;
  const paths: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    try {
      const path = getPath(files[index]);
      if (typeof path !== "string" || path.length === 0) return null;
      paths.push(path);
    } catch {
      return null;
    }
  }
  return paths.length > 0 ? paths : null;
}

function formatPaths(paths: string[]): string {
  return paths.map((path) => (/\s/.test(path) ? `"${path}"` : path)).join(" ");
}

function findComposerTextArea(target: DomElement | null): DomTextArea | null {
  let node: DomElement | null = target;
  while (node) {
    const root = node.querySelector(COMPOSER_SELECTOR);
    if (root) return root.querySelector("textarea") as DomTextArea | null;
    node = node.parentElement;
  }
  return null;
}

function insertAtCursor(textarea: DomTextArea, text: string): void {
  const { value, selectionStart, selectionEnd } = textarea;
  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);
  const before = value.slice(0, start);
  const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
  const inserted = `${needsLeadingSpace ? " " : ""}${text} `;
  const next = `${before}${inserted}${value.slice(end)}`;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
  // Il setter nativo + evento input fa aggiornare lo stato di React Native Web.
  if (setter) setter.call(textarea, next);
  else textarea.value = next;
  textarea.dispatchEvent(new window.Event("input", { bubbles: true }));
  const caret = start + inserted.length;
  textarea.focus();
  textarea.setSelectionRange(caret, caret);
}

// Rimanda a Paseo un drop vuoto, così azzera da solo l'overlay "rilascia qui" senza caricare nulla.
function dispatchEmptyDrop(target: DomElement): void {
  const emptyDrop = new window.DragEvent("drop", {
    bubbles: true,
    cancelable: true,
    dataTransfer: new window.DataTransfer(),
  });
  (target as unknown as DomTextArea).dispatchEvent(emptyDrop);
}

export function installDropPath(): () => void {
  if (Platform.OS !== "web") return () => {};

  const onDrop = (event: DropEventLike): void => {
    if (!event.isTrusted) return;
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const target = event.target;
    if (target?.closest(EXCLUDED_SELECTOR)) return;
    const textarea = findComposerTextArea(target);
    if (!textarea) return;
    const paths = readPaths(files);
    if (!paths) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    insertAtCursor(textarea, formatPaths(paths));
    if (target) dispatchEmptyDrop(target);
  };

  window.addEventListener("drop", onDrop, true);
  return () => window.removeEventListener("drop", onDrop, true);
}
