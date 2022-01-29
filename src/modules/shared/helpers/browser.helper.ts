export class BrowserHelper {
  public static get isSupportWasm() {
    try {
      if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
        const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
        if (module instanceof WebAssembly.Module)
          return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    } catch (e) {
    }
    return false;
  }

  public static get isSupportAsm() {
    try {
      (function MyAsmModule() {'use asm'; })();
      return true;
    } catch (err) {
    }
    return false;
  }

  public static get isMobile() {
    const UA = navigator.userAgent;
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
      /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
  }

  public static lockOrientation(orientation) {
    const lockOrientation = screen['lockOrientation'] || screen['mozLockOrientation'] || screen['msLockOrientation'];
    if (lockOrientation) {
      lockOrientation(orientation);
      console.log(`orientation locked`, orientation);
    } else {
      console.log(`lock orientation failed`, orientation);
    }
  }
}
