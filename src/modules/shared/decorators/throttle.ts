
export function Throttle(delay: number = 100): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let timeout = null;

    const original = descriptor.value;

    descriptor.value = function (...args) {
      if (!timeout) {
        original.apply(this, args);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => original.apply(this, args), delay);
      }
    };

    return descriptor;
  };
}
