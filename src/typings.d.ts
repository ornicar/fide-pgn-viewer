/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare var ResizeObserver: {
  prototype: ResizeObserver;
  new(callback: ResizeObserverCallback): ResizeObserver;
};

interface ResizeObserverSize {
  inlineSize: number;
  blockSize: number;
}

type ResizeObserverCallback = (entries: ReadonlyArray<ResizeObserverEntry>, observer: ResizeObserver) => void;

interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
  readonly borderBoxSize: ResizeObserverSize;
  readonly contentBoxSize: ResizeObserverSize;
}

// Object with environment variables from the .env file (see frontend/app/config/.env.template)
// The .env file will automatically created inside gitlab build process.
declare const buildEnvironments: { [key: string]: string };
