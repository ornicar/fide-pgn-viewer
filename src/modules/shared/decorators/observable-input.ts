import { SimpleChanges } from '@angular/core';
import { ReplaySubject } from 'rxjs';

const subjects = {
  subjects: new WeakMap<Object, { [prop: string]: ReplaySubject<any> }>(),

  getValue(object: Object, prop: string): any {
    return this.getSubject(object, prop).value;
  },

  setValue(object: Object, prop: string, value: any): any {
    this.getSubject(object, prop).next(value);
  },

  getSubject(object: Object, prop: string): ReplaySubject<any> {
    let objectSubjects = this.subjects.get(object);

    if (!objectSubjects) {
      objectSubjects = {};
      this.subjects.set(object, objectSubjects);
    }

    if (!objectSubjects[prop]) {
      objectSubjects[prop] = new ReplaySubject<any>(1);
    }

    return objectSubjects[prop];
  }
};

export function ObservableInput(inputProp?: string) {
  return (target, observableProp) => {
    if (!inputProp) {
      inputProp = observableProp.slice(0, -1);
    }

    delete target[inputProp];
    delete target[observableProp];

    const prevOnChanges = target['ngOnChanges'];

    target['ngOnChanges'] = function(changes: SimpleChanges) {
      if (changes[inputProp]) {
        subjects.setValue(this, observableProp, changes[inputProp].currentValue);
      }

      if (prevOnChanges) {
        prevOnChanges.call(this, changes);
      }
    };

    Object.defineProperty(target, observableProp, {
      set() {},
      get() {
        return subjects.getSubject(this, observableProp);
      }
    });
  };
}

const inputProps = new WeakMap<Object, Array<{ inputProp: string, observerProp: string }>>();

export function OnChangesInputObservable(inputProp?: string) {
  return (target, observerProp) => {
    if (!inputProp) {
      inputProp = observerProp.slice(0, -1);
    }

    if (!inputProps.has(target)) {
      inputProps.set(target, []);
    }

    inputProps.get(target).push({ inputProp, observerProp });
  };
}

export function OnChangesObservable() {
  return (target, propertyKey, descriptor) => {
    const fn = descriptor.value;

    descriptor.value = function(changes) {
      for (const { inputProp, observerProp } of (inputProps.get(target) || [])) {
        if (changes[inputProp]) {
          this[observerProp].next(changes[inputProp].currentValue);
        }
      }

      fn.call(this, changes);
    };
  };
}
