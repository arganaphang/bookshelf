import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@hapi/hoek/lib/assertError.js
var require_assertError = __commonJS((exports, module) => {
  module.exports = class AssertError extends Error {
    name = "AssertError";
    constructor(message, ctor) {
      super(message || "Unknown error");
      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, ctor);
      }
    }
  };
});

// node_modules/@hapi/hoek/lib/stringify.js
var require_stringify = __commonJS((exports, module) => {
  module.exports = function(...args) {
    try {
      return JSON.stringify(...args);
    } catch (err) {
      return "[Cannot display object: " + err.message + "]";
    }
  };
});

// node_modules/@hapi/hoek/lib/assert.js
var require_assert = __commonJS((exports, module) => {
  var AssertError = require_assertError();
  var Stringify = require_stringify();
  var assert = module.exports = function(condition, ...args) {
    if (condition) {
      return;
    }
    if (args.length === 1 && args[0] instanceof Error) {
      throw args[0];
    }
    const msgs = args.filter((arg) => arg !== "").map((arg) => {
      return typeof arg === "string" ? arg : arg instanceof Error ? arg.message : Stringify(arg);
    });
    throw new AssertError(msgs.join(" "), assert);
  };
});

// node_modules/@hapi/hoek/lib/reach.js
var require_reach = __commonJS((exports, module) => {
  var Assert = require_assert();
  var internals = {};
  module.exports = function(obj, chain, options) {
    if (chain === false || chain === null || chain === undefined) {
      return obj;
    }
    options = options || {};
    if (typeof options === "string") {
      options = { separator: options };
    }
    const isChainArray = Array.isArray(chain);
    Assert(!isChainArray || !options.separator, "Separator option is not valid for array-based chain");
    const path = isChainArray ? chain : chain.split(options.separator || ".");
    let ref = obj;
    for (let i = 0;i < path.length; ++i) {
      let key = path[i];
      const type = options.iterables && internals.iterables(ref);
      if (Array.isArray(ref) || type === "set") {
        const number = Number(key);
        if (Number.isInteger(number)) {
          key = number < 0 ? ref.length + number : number;
        }
      }
      if (!ref || typeof ref === "function" && options.functions === false || !type && ref[key] === undefined) {
        Assert(!options.strict || i + 1 === path.length, "Missing segment", key, "in reach path ", chain);
        Assert(typeof ref === "object" || options.functions === true || typeof ref !== "function", "Invalid segment", key, "in reach path ", chain);
        ref = options.default;
        break;
      }
      if (!type) {
        ref = ref[key];
      } else if (type === "set") {
        ref = [...ref][key];
      } else {
        ref = ref.get(key);
      }
    }
    return ref;
  };
  internals.iterables = function(ref) {
    if (ref instanceof Set) {
      return "set";
    }
    if (ref instanceof Map) {
      return "map";
    }
  };
});

// node_modules/@hapi/hoek/lib/types.js
var require_types = __commonJS((exports, module) => {
  var internals = {};
  exports = module.exports = {
    array: Array.prototype,
    buffer: Buffer && Buffer.prototype,
    date: Date.prototype,
    error: Error.prototype,
    generic: Object.prototype,
    map: Map.prototype,
    promise: Promise.prototype,
    regex: RegExp.prototype,
    set: Set.prototype,
    url: URL.prototype,
    weakMap: WeakMap.prototype,
    weakSet: WeakSet.prototype
  };
  internals.typeMap = new Map([
    ["[object Error]", exports.error],
    ["[object Map]", exports.map],
    ["[object Promise]", exports.promise],
    ["[object Set]", exports.set],
    ["[object URL]", exports.url],
    ["[object WeakMap]", exports.weakMap],
    ["[object WeakSet]", exports.weakSet]
  ]);
  exports.getInternalProto = function(obj) {
    if (Array.isArray(obj)) {
      return exports.array;
    }
    if (Buffer && obj instanceof Buffer) {
      return exports.buffer;
    }
    if (obj instanceof Date) {
      return exports.date;
    }
    if (obj instanceof RegExp) {
      return exports.regex;
    }
    if (obj instanceof Error) {
      return exports.error;
    }
    const objName = Object.prototype.toString.call(obj);
    return internals.typeMap.get(objName) || exports.generic;
  };
});

// node_modules/@hapi/hoek/lib/utils.js
var require_utils = __commonJS((exports) => {
  exports.keys = function(obj, options = {}) {
    return options.symbols !== false ? Reflect.ownKeys(obj) : Object.getOwnPropertyNames(obj);
  };
});

// node_modules/@hapi/hoek/lib/clone.js
var require_clone = __commonJS((exports, module) => {
  var Reach = require_reach();
  var Types = require_types();
  var Utils = require_utils();
  var internals = {
    needsProtoHack: new Set([Types.set, Types.map, Types.weakSet, Types.weakMap]),
    structuredCloneExists: typeof structuredClone === "function"
  };
  module.exports = internals.clone = function(obj, options = {}, _seen = null) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    let clone = internals.clone;
    let seen = _seen;
    if (options.shallow) {
      if (options.shallow !== true) {
        return internals.cloneWithShallow(obj, options);
      }
      clone = (value) => value;
    } else if (seen) {
      const lookup = seen.get(obj);
      if (lookup) {
        return lookup;
      }
    } else {
      seen = new Map;
    }
    const baseProto = Types.getInternalProto(obj);
    switch (baseProto) {
      case Types.buffer:
        return Buffer?.from(obj);
      case Types.date:
        return new Date(obj.getTime());
      case Types.regex:
      case Types.url:
        return new baseProto.constructor(obj);
    }
    const newObj = internals.base(obj, baseProto, options);
    if (newObj === obj) {
      return obj;
    }
    if (seen) {
      seen.set(obj, newObj);
    }
    if (baseProto === Types.set) {
      for (const value of obj) {
        newObj.add(clone(value, options, seen));
      }
    } else if (baseProto === Types.map) {
      for (const [key, value] of obj) {
        newObj.set(key, clone(value, options, seen));
      }
    }
    const keys = Utils.keys(obj, options);
    for (const key of keys) {
      if (key === "__proto__") {
        continue;
      }
      if (baseProto === Types.array && key === "length") {
        newObj.length = obj.length;
        continue;
      }
      if (internals.structuredCloneExists && baseProto === Types.error && key === "stack") {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (descriptor) {
        if (descriptor.get || descriptor.set) {
          Object.defineProperty(newObj, key, descriptor);
        } else if (descriptor.enumerable) {
          newObj[key] = clone(obj[key], options, seen);
        } else {
          Object.defineProperty(newObj, key, { enumerable: false, writable: true, configurable: true, value: clone(obj[key], options, seen) });
        }
      } else {
        Object.defineProperty(newObj, key, {
          enumerable: true,
          writable: true,
          configurable: true,
          value: clone(obj[key], options, seen)
        });
      }
    }
    return newObj;
  };
  internals.cloneWithShallow = function(source, options) {
    const keys = options.shallow;
    options = Object.assign({}, options);
    options.shallow = false;
    const seen = new Map;
    for (const key of keys) {
      const ref = Reach(source, key);
      if (typeof ref === "object" || typeof ref === "function") {
        seen.set(ref, ref);
      }
    }
    return internals.clone(source, options, seen);
  };
  internals.base = function(obj, baseProto, options) {
    if (options.prototype === false) {
      if (internals.needsProtoHack.has(baseProto)) {
        return new baseProto.constructor;
      }
      return baseProto === Types.array ? [] : {};
    }
    const proto = Object.getPrototypeOf(obj);
    if (proto && proto.isImmutable) {
      return obj;
    }
    if (baseProto === Types.array) {
      const newObj = [];
      if (proto !== baseProto) {
        Object.setPrototypeOf(newObj, proto);
      }
      return newObj;
    } else if (baseProto === Types.error && internals.structuredCloneExists) {
      const err = structuredClone(obj);
      if (Object.getPrototypeOf(err) !== proto) {
        Object.setPrototypeOf(err, proto);
      }
      return err;
    }
    if (internals.needsProtoHack.has(baseProto)) {
      const newObj = new proto.constructor;
      if (proto !== baseProto) {
        Object.setPrototypeOf(newObj, proto);
      }
      return newObj;
    }
    return Object.create(proto);
  };
});

// node_modules/@hapi/hoek/lib/merge.js
var require_merge = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Utils = require_utils();
  var internals = {};
  module.exports = internals.merge = function(target, source, options) {
    Assert(target && typeof target === "object", "Invalid target value: must be an object");
    Assert(source === null || source === undefined || typeof source === "object", "Invalid source value: must be null, undefined, or an object");
    if (!source) {
      return target;
    }
    options = Object.assign({ nullOverride: true, mergeArrays: true }, options);
    if (Array.isArray(source)) {
      Assert(Array.isArray(target), "Cannot merge array onto an object");
      if (!options.mergeArrays) {
        target.length = 0;
      }
      for (let i = 0;i < source.length; ++i) {
        target.push(Clone(source[i], { symbols: options.symbols }));
      }
      return target;
    }
    const keys = Utils.keys(source, options);
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (key === "__proto__" || !Object.prototype.propertyIsEnumerable.call(source, key)) {
        continue;
      }
      const value = source[key];
      if (value && typeof value === "object") {
        if (target[key] === value) {
          continue;
        }
        if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key]) !== Array.isArray(value) || value instanceof Date || Buffer && Buffer.isBuffer(value) || value instanceof RegExp) {
          target[key] = Clone(value, { symbols: options.symbols });
        } else {
          internals.merge(target[key], value, options);
        }
      } else {
        if (value !== null && value !== undefined) {
          target[key] = value;
        } else if (options.nullOverride) {
          target[key] = value;
        }
      }
    }
    return target;
  };
});

// node_modules/@hapi/hoek/lib/applyToDefaults.js
var require_applyToDefaults = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Merge = require_merge();
  var Reach = require_reach();
  var internals = {};
  module.exports = function(defaults, source, options = {}) {
    Assert(defaults && typeof defaults === "object", "Invalid defaults value: must be an object");
    Assert(!source || source === true || typeof source === "object", "Invalid source value: must be true, falsy or an object");
    Assert(typeof options === "object", "Invalid options: must be an object");
    if (!source) {
      return null;
    }
    if (options.shallow) {
      return internals.applyToDefaultsWithShallow(defaults, source, options);
    }
    const copy = Clone(defaults);
    if (source === true) {
      return copy;
    }
    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;
    return Merge(copy, source, { nullOverride, mergeArrays: false });
  };
  internals.applyToDefaultsWithShallow = function(defaults, source, options) {
    const keys = options.shallow;
    Assert(Array.isArray(keys), "Invalid keys");
    const seen = new Map;
    const merge = source === true ? null : new Set;
    for (let key of keys) {
      key = Array.isArray(key) ? key : key.split(".");
      const ref = Reach(defaults, key);
      if (ref && typeof ref === "object") {
        seen.set(ref, merge && Reach(source, key) || ref);
      } else if (merge) {
        merge.add(key);
      }
    }
    const copy = Clone(defaults, {}, seen);
    if (!merge) {
      return copy;
    }
    for (const key of merge) {
      internals.reachCopy(copy, source, key);
    }
    const nullOverride = options.nullOverride !== undefined ? options.nullOverride : false;
    return Merge(copy, source, { nullOverride, mergeArrays: false });
  };
  internals.reachCopy = function(dst, src, path) {
    for (const segment of path) {
      if (!(segment in src)) {
        return;
      }
      const val = src[segment];
      if (typeof val !== "object" || val === null) {
        return;
      }
      src = val;
    }
    const value = src;
    let ref = dst;
    for (let i = 0;i < path.length - 1; ++i) {
      const segment = path[i];
      if (typeof ref[segment] !== "object") {
        ref[segment] = {};
      }
      ref = ref[segment];
    }
    ref[path[path.length - 1]] = value;
  };
});

// node_modules/@hapi/hoek/lib/bench.js
var require_bench = __commonJS((exports, module) => {
  var internals = {};
  module.exports = internals.Bench = class {
    constructor() {
      this.ts = 0;
      this.reset();
    }
    reset() {
      this.ts = internals.Bench.now();
    }
    elapsed() {
      return internals.Bench.now() - this.ts;
    }
    static now() {
      const ts = process.hrtime();
      return ts[0] * 1000 + ts[1] / 1e6;
    }
  };
});

// node_modules/@hapi/hoek/lib/ignore.js
var require_ignore = __commonJS((exports, module) => {
  module.exports = function() {
  };
});

// node_modules/@hapi/hoek/lib/block.js
var require_block = __commonJS((exports, module) => {
  var Ignore = require_ignore();
  module.exports = function() {
    return new Promise(Ignore);
  };
});

// node_modules/@hapi/hoek/lib/deepEqual.js
var require_deepEqual = __commonJS((exports, module) => {
  var Types = require_types();
  var internals = {
    mismatched: null
  };
  module.exports = function(obj, ref, options) {
    options = Object.assign({ prototype: true }, options);
    return !!internals.isDeepEqual(obj, ref, options, []);
  };
  internals.isDeepEqual = function(obj, ref, options, seen) {
    if (obj === ref) {
      return obj !== 0 || 1 / obj === 1 / ref;
    }
    const type = typeof obj;
    if (type !== typeof ref) {
      return false;
    }
    if (obj === null || ref === null) {
      return false;
    }
    if (type === "function") {
      if (!options.deepFunction || obj.toString() !== ref.toString()) {
        return false;
      }
    } else if (type !== "object") {
      return obj !== obj && ref !== ref;
    }
    const instanceType = internals.getSharedType(obj, ref, !!options.prototype);
    switch (instanceType) {
      case Types.buffer:
        return Buffer && Buffer.prototype.equals.call(obj, ref);
      case Types.promise:
        return obj === ref;
      case Types.regex:
      case Types.url:
        return obj.toString() === ref.toString();
      case internals.mismatched:
        return false;
    }
    for (let i = seen.length - 1;i >= 0; --i) {
      if (seen[i].isSame(obj, ref)) {
        return true;
      }
    }
    seen.push(new internals.SeenEntry(obj, ref));
    try {
      return !!internals.isDeepEqualObj(instanceType, obj, ref, options, seen);
    } finally {
      seen.pop();
    }
  };
  internals.getSharedType = function(obj, ref, checkPrototype) {
    if (checkPrototype) {
      if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
        return internals.mismatched;
      }
      return Types.getInternalProto(obj);
    }
    const type = Types.getInternalProto(obj);
    if (type !== Types.getInternalProto(ref)) {
      return internals.mismatched;
    }
    return type;
  };
  internals.valueOf = function(obj) {
    const objValueOf = obj.valueOf;
    if (objValueOf === undefined) {
      return obj;
    }
    try {
      return objValueOf.call(obj);
    } catch (err) {
      return err;
    }
  };
  internals.hasOwnEnumerableProperty = function(obj, key) {
    return Object.prototype.propertyIsEnumerable.call(obj, key);
  };
  internals.isSetSimpleEqual = function(obj, ref) {
    for (const entry of Set.prototype.values.call(obj)) {
      if (!Set.prototype.has.call(ref, entry)) {
        return false;
      }
    }
    return true;
  };
  internals.isDeepEqualObj = function(instanceType, obj, ref, options, seen) {
    const { isDeepEqual, valueOf, hasOwnEnumerableProperty } = internals;
    const { keys, getOwnPropertySymbols } = Object;
    if (instanceType === Types.array) {
      if (options.part) {
        for (const objValue of obj) {
          for (const refValue of ref) {
            if (isDeepEqual(objValue, refValue, options, seen)) {
              return true;
            }
          }
        }
      } else {
        if (obj.length !== ref.length) {
          return false;
        }
        for (let i = 0;i < obj.length; ++i) {
          if (!isDeepEqual(obj[i], ref[i], options, seen)) {
            return false;
          }
        }
        return true;
      }
    } else if (instanceType === Types.set) {
      if (obj.size !== ref.size) {
        return false;
      }
      if (!internals.isSetSimpleEqual(obj, ref)) {
        const ref2 = new Set(Set.prototype.values.call(ref));
        for (const objEntry of Set.prototype.values.call(obj)) {
          if (ref2.delete(objEntry)) {
            continue;
          }
          let found = false;
          for (const refEntry of ref2) {
            if (isDeepEqual(objEntry, refEntry, options, seen)) {
              ref2.delete(refEntry);
              found = true;
              break;
            }
          }
          if (!found) {
            return false;
          }
        }
      }
    } else if (instanceType === Types.map) {
      if (obj.size !== ref.size) {
        return false;
      }
      for (const [key, value] of Map.prototype.entries.call(obj)) {
        if (value === undefined && !Map.prototype.has.call(ref, key)) {
          return false;
        }
        if (!isDeepEqual(value, Map.prototype.get.call(ref, key), options, seen)) {
          return false;
        }
      }
    } else if (instanceType === Types.error) {
      if (obj.name !== ref.name || obj.message !== ref.message) {
        return false;
      }
    }
    const valueOfObj = valueOf(obj);
    const valueOfRef = valueOf(ref);
    if ((obj !== valueOfObj || ref !== valueOfRef) && !isDeepEqual(valueOfObj, valueOfRef, options, seen)) {
      return false;
    }
    const objKeys = keys(obj);
    if (!options.part && objKeys.length !== keys(ref).length && !options.skip) {
      return false;
    }
    let skipped = 0;
    for (const key of objKeys) {
      if (options.skip && options.skip.includes(key)) {
        if (ref[key] === undefined) {
          ++skipped;
        }
        continue;
      }
      if (!hasOwnEnumerableProperty(ref, key)) {
        return false;
      }
      if (!isDeepEqual(obj[key], ref[key], options, seen)) {
        return false;
      }
    }
    if (!options.part && objKeys.length - skipped !== keys(ref).length) {
      return false;
    }
    if (options.symbols !== false) {
      const objSymbols = getOwnPropertySymbols(obj);
      const refSymbols = new Set(getOwnPropertySymbols(ref));
      for (const key of objSymbols) {
        if (!options.skip?.includes(key)) {
          if (hasOwnEnumerableProperty(obj, key)) {
            if (!hasOwnEnumerableProperty(ref, key)) {
              return false;
            }
            if (!isDeepEqual(obj[key], ref[key], options, seen)) {
              return false;
            }
          } else if (hasOwnEnumerableProperty(ref, key)) {
            return false;
          }
        }
        refSymbols.delete(key);
      }
      for (const key of refSymbols) {
        if (hasOwnEnumerableProperty(ref, key)) {
          return false;
        }
      }
    }
    return true;
  };
  internals.SeenEntry = class {
    constructor(obj, ref) {
      this.obj = obj;
      this.ref = ref;
    }
    isSame(obj, ref) {
      return this.obj === obj && this.ref === ref;
    }
  };
});

// node_modules/@hapi/hoek/lib/escapeRegex.js
var require_escapeRegex = __commonJS((exports, module) => {
  module.exports = function(string) {
    return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, "\\$&");
  };
});

// node_modules/@hapi/hoek/lib/contain.js
var require_contain = __commonJS((exports, module) => {
  var Assert = require_assert();
  var DeepEqual = require_deepEqual();
  var EscapeRegex = require_escapeRegex();
  var Utils = require_utils();
  var internals = {};
  module.exports = function(ref, values, options = {}) {
    if (typeof values !== "object") {
      values = [values];
    }
    Assert(!Array.isArray(values) || values.length, "Values array cannot be empty");
    if (typeof ref === "string") {
      return internals.string(ref, values, options);
    }
    if (Array.isArray(ref)) {
      return internals.array(ref, values, options);
    }
    Assert(typeof ref === "object", "Reference must be string or an object");
    return internals.object(ref, values, options);
  };
  internals.array = function(ref, values, options) {
    if (!Array.isArray(values)) {
      values = [values];
    }
    if (!ref.length) {
      return false;
    }
    if (options.only && options.once && ref.length !== values.length) {
      return false;
    }
    let compare;
    const map = new Map;
    for (const value of values) {
      if (!options.deep || !value || typeof value !== "object") {
        const existing = map.get(value);
        if (existing) {
          ++existing.allowed;
        } else {
          map.set(value, { allowed: 1, hits: 0 });
        }
      } else {
        compare = compare ?? internals.compare(options);
        let found = false;
        for (const [key, existing] of map.entries()) {
          if (compare(key, value)) {
            ++existing.allowed;
            found = true;
            break;
          }
        }
        if (!found) {
          map.set(value, { allowed: 1, hits: 0 });
        }
      }
    }
    let hits = 0;
    for (const item of ref) {
      let match;
      if (!options.deep || !item || typeof item !== "object") {
        match = map.get(item);
      } else {
        compare = compare ?? internals.compare(options);
        for (const [key, existing] of map.entries()) {
          if (compare(key, item)) {
            match = existing;
            break;
          }
        }
      }
      if (match) {
        ++match.hits;
        ++hits;
        if (options.once && match.hits > match.allowed) {
          return false;
        }
      }
    }
    if (options.only && hits !== ref.length) {
      return false;
    }
    for (const match of map.values()) {
      if (match.hits === match.allowed) {
        continue;
      }
      if (match.hits < match.allowed && !options.part) {
        return false;
      }
    }
    return !!hits;
  };
  internals.object = function(ref, values, options) {
    Assert(options.once === undefined, "Cannot use option once with object");
    const keys = Utils.keys(ref, options);
    if (!keys.length) {
      return false;
    }
    if (Array.isArray(values)) {
      return internals.array(keys, values, options);
    }
    const symbols = Object.getOwnPropertySymbols(values).filter((sym) => values.propertyIsEnumerable(sym));
    const targets = [...Object.keys(values), ...symbols];
    const compare = internals.compare(options);
    const set = new Set(targets);
    for (const key of keys) {
      if (!set.has(key)) {
        if (options.only) {
          return false;
        }
        continue;
      }
      if (!compare(values[key], ref[key])) {
        return false;
      }
      set.delete(key);
    }
    if (set.size) {
      return options.part ? set.size < targets.length : false;
    }
    return true;
  };
  internals.string = function(ref, values, options) {
    if (ref === "") {
      return values.length === 1 && values[0] === "" || !options.once && !values.some((v) => v !== "");
    }
    const map = new Map;
    const patterns = [];
    for (const value of values) {
      Assert(typeof value === "string", "Cannot compare string reference to non-string value");
      if (value) {
        const existing = map.get(value);
        if (existing) {
          ++existing.allowed;
        } else {
          map.set(value, { allowed: 1, hits: 0 });
          patterns.push(EscapeRegex(value));
        }
      } else if (options.once || options.only) {
        return false;
      }
    }
    if (!patterns.length) {
      return true;
    }
    const regex = new RegExp(`(${patterns.join("|")})`, "g");
    const leftovers = ref.replace(regex, ($0, $1) => {
      ++map.get($1).hits;
      return "";
    });
    if (options.only && leftovers) {
      return false;
    }
    let any = false;
    for (const match of map.values()) {
      if (match.hits) {
        any = true;
      }
      if (match.hits === match.allowed) {
        continue;
      }
      if (match.hits < match.allowed && !options.part) {
        return false;
      }
      if (options.once) {
        return false;
      }
    }
    return !!any;
  };
  internals.compare = function(options) {
    if (!options.deep) {
      return internals.shallow;
    }
    const hasOnly = options.only !== undefined;
    const hasPart = options.part !== undefined;
    const flags = {
      prototype: hasOnly ? options.only : hasPart ? !options.part : false,
      part: hasOnly ? !options.only : hasPart ? options.part : false
    };
    return (a, b) => DeepEqual(a, b, flags);
  };
  internals.shallow = function(a, b) {
    return a === b;
  };
});

// node_modules/@hapi/hoek/lib/escapeHeaderAttribute.js
var require_escapeHeaderAttribute = __commonJS((exports, module) => {
  var Assert = require_assert();
  module.exports = function(attribute) {
    Assert(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/.test(attribute), "Bad attribute value (" + attribute + ")");
    return attribute.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
  };
});

// node_modules/@hapi/hoek/lib/escapeHtml.js
var require_escapeHtml = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(input) {
    if (!input) {
      return "";
    }
    let escaped = "";
    for (let i = 0;i < input.length; ++i) {
      const charCode = input.charCodeAt(i);
      if (internals.isSafe(charCode)) {
        escaped += input[i];
      } else {
        escaped += internals.escapeHtmlChar(charCode);
      }
    }
    return escaped;
  };
  internals.escapeHtmlChar = function(charCode) {
    const namedEscape = internals.namedHtml.get(charCode);
    if (namedEscape) {
      return namedEscape;
    }
    if (charCode >= 256) {
      return "&#" + charCode + ";";
    }
    const hexValue = charCode.toString(16).padStart(2, "0");
    return `&#x${hexValue};`;
  };
  internals.isSafe = function(charCode) {
    return internals.safeCharCodes.has(charCode);
  };
  internals.namedHtml = new Map([
    [38, "&amp;"],
    [60, "&lt;"],
    [62, "&gt;"],
    [34, "&quot;"],
    [160, "&nbsp;"],
    [162, "&cent;"],
    [163, "&pound;"],
    [164, "&curren;"],
    [169, "&copy;"],
    [174, "&reg;"]
  ]);
  internals.safeCharCodes = function() {
    const safe = new Set;
    for (let i = 32;i < 123; ++i) {
      if (i >= 97 || i >= 65 && i <= 90 || i >= 48 && i <= 57 || i === 32 || i === 46 || i === 44 || i === 45 || i === 58 || i === 95) {
        safe.add(i);
      }
    }
    return safe;
  }();
});

// node_modules/@hapi/hoek/lib/escapeJson.js
var require_escapeJson = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(input) {
    if (!input) {
      return "";
    }
    return input.replace(/[<>&\u2028\u2029]/g, internals.escape);
  };
  internals.escape = function(char) {
    return internals.replacements.get(char);
  };
  internals.replacements = new Map([
    ["<", "\\u003c"],
    [">", "\\u003e"],
    ["&", "\\u0026"],
    ["\u2028", "\\u2028"],
    ["\u2029", "\\u2029"]
  ]);
});

// node_modules/@hapi/hoek/lib/flatten.js
var require_flatten = __commonJS((exports, module) => {
  var internals = {};
  module.exports = internals.flatten = function(array, target) {
    const result = target || [];
    for (const entry of array) {
      if (Array.isArray(entry)) {
        internals.flatten(entry, result);
      } else {
        result.push(entry);
      }
    }
    return result;
  };
});

// node_modules/@hapi/hoek/lib/intersect.js
var require_intersect = __commonJS((exports, module) => {
  var internals = {};
  module.exports = function(array1, array2, options = {}) {
    if (!array1 || !array2) {
      return options.first ? null : [];
    }
    const common = [];
    const hash = Array.isArray(array1) ? new Set(array1) : array1;
    const found = new Set;
    for (const value of array2) {
      if (internals.has(hash, value) && !found.has(value)) {
        if (options.first) {
          return value;
        }
        common.push(value);
        found.add(value);
      }
    }
    return options.first ? null : common;
  };
  internals.has = function(ref, key) {
    if (typeof ref.has === "function") {
      return ref.has(key);
    }
    return ref[key] !== undefined;
  };
});

// node_modules/@hapi/hoek/lib/isPromise.js
var require_isPromise = __commonJS((exports, module) => {
  module.exports = function(promise) {
    return typeof promise?.then === "function";
  };
});

// node_modules/@hapi/hoek/lib/once.js
var require_once = __commonJS((exports, module) => {
  var internals = {
    wrapped: Symbol("wrapped")
  };
  module.exports = function(method) {
    if (method[internals.wrapped]) {
      return method;
    }
    let once = false;
    const wrappedFn = function(...args) {
      if (!once) {
        once = true;
        method(...args);
      }
    };
    wrappedFn[internals.wrapped] = true;
    return wrappedFn;
  };
});

// node_modules/@hapi/hoek/lib/reachTemplate.js
var require_reachTemplate = __commonJS((exports, module) => {
  var Reach = require_reach();
  module.exports = function(obj, template, options) {
    return template.replace(/{([^{}]+)}/g, ($0, chain) => {
      const value = Reach(obj, chain, options);
      return value ?? "";
    });
  };
});

// node_modules/@hapi/hoek/lib/wait.js
var require_wait = __commonJS((exports, module) => {
  var internals = {
    maxTimer: 2 ** 31 - 1
  };
  module.exports = function(timeout, returnValue, options) {
    if (typeof timeout === "bigint") {
      timeout = Number(timeout);
    }
    if (timeout >= Number.MAX_SAFE_INTEGER) {
      timeout = Infinity;
    }
    if (typeof timeout !== "number" && timeout !== undefined) {
      throw new TypeError("Timeout must be a number or bigint");
    }
    return new Promise((resolve) => {
      const _setTimeout = options ? options.setTimeout : setTimeout;
      const activate = () => {
        const time = Math.min(timeout, internals.maxTimer);
        timeout -= time;
        _setTimeout(() => timeout > 0 ? activate() : resolve(returnValue), time);
      };
      if (timeout !== Infinity) {
        activate();
      }
    });
  };
});

// node_modules/@hapi/hoek/lib/index.js
var require_lib = __commonJS((exports) => {
  exports.applyToDefaults = require_applyToDefaults();
  exports.assert = require_assert();
  exports.AssertError = require_assertError();
  exports.Bench = require_bench();
  exports.block = require_block();
  exports.clone = require_clone();
  exports.contain = require_contain();
  exports.deepEqual = require_deepEqual();
  exports.escapeHeaderAttribute = require_escapeHeaderAttribute();
  exports.escapeHtml = require_escapeHtml();
  exports.escapeJson = require_escapeJson();
  exports.escapeRegex = require_escapeRegex();
  exports.flatten = require_flatten();
  exports.ignore = require_ignore();
  exports.intersect = require_intersect();
  exports.isPromise = require_isPromise();
  exports.merge = require_merge();
  exports.once = require_once();
  exports.reach = require_reach();
  exports.reachTemplate = require_reachTemplate();
  exports.stringify = require_stringify();
  exports.wait = require_wait();
});

// node_modules/@hapi/validate/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "@hapi/validate",
    description: "Object schema validation",
    version: "2.0.1",
    repository: "git://github.com/hapijs/validate",
    main: "lib/index.js",
    files: [
      "lib/**/*"
    ],
    eslintConfig: {
      extends: [
        "plugin:@hapi/module"
      ]
    },
    dependencies: {
      "@hapi/hoek": "^11.0.2",
      "@hapi/topo": "^6.0.1"
    },
    devDependencies: {
      "@hapi/bourne": "^3.0.0",
      "@hapi/code": "^9.0.3",
      "@hapi/eslint-plugin": "*",
      "@hapi/lab": "^25.1.2"
    },
    scripts: {
      test: "lab -t 100 -a @hapi/code -L",
      "test-cov-html": "lab -r html -o coverage.html -a @hapi/code"
    },
    license: "BSD-3-Clause"
  };
});

// node_modules/@hapi/validate/lib/schemas.js
var require_schemas = __commonJS((exports) => {
  var Joi = require_lib3();
  var internals = {};
  internals.wrap = Joi.string().min(1).max(2).allow(false);
  exports.preferences = Joi.object({
    allowUnknown: Joi.boolean(),
    abortEarly: Joi.boolean(),
    context: Joi.object(),
    convert: Joi.boolean(),
    dateFormat: Joi.valid("date", "iso", "string", "time", "utc"),
    errors: {
      escapeHtml: Joi.boolean(),
      label: Joi.valid("path", "key", false),
      language: [
        Joi.string(),
        Joi.object().ref()
      ],
      render: Joi.boolean(),
      stack: Joi.boolean(),
      wrap: {
        label: internals.wrap,
        array: internals.wrap
      }
    },
    messages: Joi.object(),
    noDefaults: Joi.boolean(),
    nonEnumerables: Joi.boolean(),
    presence: Joi.valid("required", "optional", "forbidden"),
    skipFunctions: Joi.boolean(),
    stripUnknown: Joi.object({
      arrays: Joi.boolean(),
      objects: Joi.boolean()
    }).or("arrays", "objects").allow(true, false)
  }).strict();
});

// node_modules/@hapi/validate/lib/ref.js
var require_ref = __commonJS((exports) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Reach = require_reach();
  var Common = require_common();
  var internals = {
    symbol: Symbol("ref"),
    defaults: {
      adjust: null,
      in: false,
      iterables: null,
      map: null,
      separator: ".",
      type: "value"
    }
  };
  exports.create = function(key, options = {}) {
    Assert(typeof key === "string", "Invalid reference key:", key);
    Common.assertOptions(options, ["adjust", "ancestor", "in", "iterables", "map", "prefix", "separator"]);
    Assert(!options.prefix || typeof options.prefix === "object", "options.prefix must be of type object");
    const ref = Object.assign({}, internals.defaults, options);
    delete ref.prefix;
    const separator = ref.separator;
    const context = internals.context(key, separator, options.prefix);
    ref.type = context.type;
    key = context.key;
    if (ref.type === "value") {
      if (context.root) {
        Assert(!separator || key[0] !== separator, "Cannot specify relative path with root prefix");
        ref.ancestor = "root";
        if (!key) {
          key = null;
        }
      }
      if (separator && separator === key) {
        key = null;
        ref.ancestor = 0;
      } else {
        if (ref.ancestor !== undefined) {
          Assert(!separator || !key || key[0] !== separator, "Cannot combine prefix with ancestor option");
        } else {
          const [ancestor, slice] = internals.ancestor(key, separator);
          if (slice) {
            key = key.slice(slice);
            if (key === "") {
              key = null;
            }
          }
          ref.ancestor = ancestor;
        }
      }
    }
    ref.path = separator ? key === null ? [] : key.split(separator) : [key];
    return new internals.Ref(ref);
  };
  exports.in = function(key, options = {}) {
    return exports.create(key, Object.assign({}, options, { in: true }));
  };
  exports.isRef = function(ref) {
    return ref ? !!ref[Common.symbols.ref] : false;
  };
  internals.Ref = class {
    constructor(options) {
      Assert(typeof options === "object", "Invalid reference construction");
      Common.assertOptions(options, [
        "adjust",
        "ancestor",
        "in",
        "iterables",
        "map",
        "path",
        "separator",
        "type",
        "depth",
        "key",
        "root",
        "display"
      ]);
      Assert([false, undefined].includes(options.separator) || typeof options.separator === "string" && options.separator.length === 1, "Invalid separator");
      Assert(!options.adjust || typeof options.adjust === "function", "options.adjust must be a function");
      Assert(!options.map || Array.isArray(options.map), "options.map must be an array");
      Assert(!options.map || !options.adjust, "Cannot set both map and adjust options");
      Object.assign(this, internals.defaults, options);
      Assert(this.type === "value" || this.ancestor === undefined, "Non-value references cannot reference ancestors");
      if (Array.isArray(this.map)) {
        this.map = new Map(this.map);
      }
      this.depth = this.path.length;
      this.key = this.path.length ? this.path.join(this.separator) : null;
      this.root = this.path[0];
      this.updateDisplay();
    }
    resolve(value, state, prefs, local, options = {}) {
      Assert(!this.in || options.in, "Invalid in() reference usage");
      if (this.type === "global") {
        return this._resolve(prefs.context, state, options);
      }
      if (this.type === "local") {
        return this._resolve(local, state, options);
      }
      if (!this.ancestor) {
        return this._resolve(value, state, options);
      }
      if (this.ancestor === "root") {
        return this._resolve(state.ancestors[state.ancestors.length - 1], state, options);
      }
      Assert(this.ancestor <= state.ancestors.length, "Invalid reference exceeds the schema root:", this.display);
      return this._resolve(state.ancestors[this.ancestor - 1], state, options);
    }
    _resolve(target, state, options) {
      let resolved;
      if (this.type === "value" && state.mainstay.shadow && options.shadow !== false) {
        resolved = state.mainstay.shadow.get(this.absolute(state));
      }
      if (resolved === undefined) {
        resolved = Reach(target, this.path, { iterables: this.iterables, functions: true });
      }
      if (this.adjust) {
        resolved = this.adjust(resolved);
      }
      if (this.map) {
        const mapped = this.map.get(resolved);
        if (mapped !== undefined) {
          resolved = mapped;
        }
      }
      return resolved;
    }
    toString() {
      return this.display;
    }
    absolute(state) {
      return [...state.path.slice(0, -this.ancestor), ...this.path];
    }
    clone() {
      return new internals.Ref(this);
    }
    updateDisplay() {
      const key = this.key !== null ? this.key : "";
      if (this.type !== "value") {
        this.display = `ref:${this.type}:${key}`;
        return;
      }
      if (!this.separator) {
        this.display = `ref:${key}`;
        return;
      }
      if (!this.ancestor) {
        this.display = `ref:${this.separator}${key}`;
        return;
      }
      if (this.ancestor === "root") {
        this.display = `ref:root:${key}`;
        return;
      }
      if (this.ancestor === 1) {
        this.display = `ref:${key || ".."}`;
        return;
      }
      const lead = new Array(this.ancestor + 1).fill(this.separator).join("");
      this.display = `ref:${lead}${key || ""}`;
    }
  };
  internals.Ref.prototype[Common.symbols.ref] = true;
  internals.context = function(key, separator, prefix = {}) {
    key = key.trim();
    if (prefix) {
      const globalp = prefix.global === undefined ? "$" : prefix.global;
      if (globalp !== separator && key.startsWith(globalp)) {
        return { key: key.slice(globalp.length), type: "global" };
      }
      const local = prefix.local === undefined ? "#" : prefix.local;
      if (local !== separator && key.startsWith(local)) {
        return { key: key.slice(local.length), type: "local" };
      }
      const root = prefix.root === undefined ? "/" : prefix.root;
      if (root !== separator && key.startsWith(root)) {
        return { key: key.slice(root.length), type: "value", root: true };
      }
    }
    return { key, type: "value" };
  };
  internals.ancestor = function(key, separator) {
    if (!separator) {
      return [1, 0];
    }
    if (key[0] !== separator) {
      return [1, 0];
    }
    if (key[1] !== separator) {
      return [0, 1];
    }
    let i = 2;
    while (key[i] === separator) {
      ++i;
    }
    return [i - 1, i];
  };
  exports.toSibling = 0;
  exports.toParent = 1;
  exports.Manager = class {
    constructor() {
      this.refs = [];
    }
    register(source, target) {
      if (!source) {
        return;
      }
      target = target === undefined ? exports.toParent : target;
      if (Array.isArray(source)) {
        for (const ref of source) {
          this.register(ref, target);
        }
        return;
      }
      if (Common.isSchema(source)) {
        for (const item of source._refs.refs) {
          if (item.ancestor - target >= 0) {
            this.refs.push({ ancestor: item.ancestor - target, root: item.root });
          }
        }
        return;
      }
      if (exports.isRef(source) && source.type === "value" && source.ancestor - target >= 0) {
        this.refs.push({ ancestor: source.ancestor - target, root: source.root });
      }
    }
    clone() {
      const copy = new exports.Manager;
      copy.refs = Clone(this.refs);
      return copy;
    }
    reset() {
      this.refs = [];
    }
    roots() {
      return this.refs.filter((ref) => !ref.ancestor).map((ref) => ref.root);
    }
  };
});

// node_modules/@hapi/validate/lib/template.js
var require_template = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var EscapeHtml = require_escapeHtml();
  var Common = require_common();
  var Ref = require_ref();
  var internals = {
    symbol: Symbol("template"),
    opens: new Array(1000).join("\0"),
    closes: new Array(1000).join("\x01"),
    dateFormat: {
      date: Date.prototype.toDateString,
      iso: Date.prototype.toISOString,
      string: Date.prototype.toString,
      time: Date.prototype.toTimeString,
      utc: Date.prototype.toUTCString
    }
  };
  module.exports = exports = internals.Template = class {
    constructor(source, options) {
      Assert(typeof source === "string", "Template source must be a string");
      Assert(!source.includes("\0") && !source.includes("\x01"), "Template source cannot contain reserved control characters");
      this.source = source;
      this.rendered = source;
      this._template = null;
      this._settings = Clone(options);
      this._parse();
    }
    _parse() {
      if (!this.source.includes("{")) {
        return;
      }
      const encoded = internals.encode(this.source);
      const parts = internals.split(encoded);
      const processed = [];
      const head = parts.shift();
      if (head) {
        processed.push(head);
      }
      for (const part of parts) {
        const raw = part[0] !== "{";
        const ender = raw ? "}" : "}}";
        const end = part.indexOf(ender);
        let variable = part.slice(raw ? 0 : 1, end);
        const wrapped = variable[0] === ":";
        if (wrapped) {
          variable = variable.slice(1);
        }
        const dynamic = this._ref(internals.decode(variable), { raw, wrapped });
        processed.push(dynamic);
        const rest = part.slice(end + ender.length);
        if (rest) {
          processed.push(internals.decode(rest));
        }
      }
      this._template = processed;
    }
    static date(date, prefs) {
      return internals.dateFormat[prefs.dateFormat].call(date);
    }
    isDynamic() {
      return !!this._template;
    }
    static isTemplate(template) {
      return template ? !!template[Common.symbols.template] : false;
    }
    render(value, state, prefs, local, options = {}) {
      if (!this.isDynamic()) {
        return this.rendered;
      }
      const parts = [];
      for (const part of this._template) {
        if (typeof part === "string") {
          parts.push(part);
        } else {
          const rendered = part.ref.resolve(value, state, prefs, local, options);
          const string = internals.stringify(rendered, prefs, options.errors);
          const result = part.raw || options.errors?.escapeHtml === false ? string : EscapeHtml(string);
          parts.push(internals.wrap(result, part.wrapped && prefs.errors.wrap.label));
        }
      }
      return parts.join("");
    }
    _ref(content, { raw, wrapped }) {
      const ref = Ref.create(content, this._settings);
      return { ref, raw, wrapped: wrapped || ref.type === "local" && ref.key === "label" };
    }
    toString() {
      return this.source;
    }
  };
  internals.Template.prototype[Common.symbols.template] = true;
  internals.Template.prototype.isImmutable = true;
  internals.encode = function(string) {
    return string.replace(/\\(\{+)/g, ($0, $1) => {
      return internals.opens.slice(0, $1.length);
    }).replace(/\\(\}+)/g, ($0, $1) => {
      return internals.closes.slice(0, $1.length);
    });
  };
  internals.decode = function(string) {
    return string.replace(/\u0000/g, "{").replace(/\u0001/g, "}");
  };
  internals.split = function(string) {
    const parts = [];
    let current = "";
    for (let i = 0;i < string.length; ++i) {
      const char = string[i];
      if (char === "{") {
        let next = "";
        while (i + 1 < string.length && string[i + 1] === "{") {
          next += "{";
          ++i;
        }
        parts.push(current);
        current = next;
      } else {
        current += char;
      }
    }
    parts.push(current);
    return parts;
  };
  internals.wrap = function(value, ends) {
    if (!ends) {
      return value;
    }
    if (ends.length === 1) {
      return `${ends}${value}${ends}`;
    }
    return `${ends[0]}${value}${ends[1]}`;
  };
  internals.stringify = function(value, prefs, options) {
    const type = typeof value;
    if (value === null) {
      return "null";
    }
    if (value === undefined) {
      return "";
    }
    if (type === "string") {
      return value;
    }
    if (type === "number" || type === "function" || type === "symbol") {
      return value.toString();
    }
    if (type !== "object") {
      return JSON.stringify(value);
    }
    if (value instanceof Date) {
      return internals.Template.date(value, prefs);
    }
    if (value instanceof Map) {
      const pairs = [];
      for (const [key, sym] of value.entries()) {
        pairs.push(`${key.toString()} -> ${sym.toString()}`);
      }
      value = pairs;
    }
    if (!Array.isArray(value)) {
      return value.toString();
    }
    let partial = "";
    for (const item of value) {
      partial = partial + (partial.length ? ", " : "") + internals.stringify(item, prefs, options);
    }
    return internals.wrap(partial, prefs.errors.wrap.array);
  };
});

// node_modules/@hapi/validate/lib/messages.js
var require_messages = __commonJS((exports) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Template = require_template();
  exports.compile = function(messages, target) {
    if (typeof messages === "string") {
      Assert(!target, "Cannot set single message string");
      return new Template(messages);
    }
    if (Template.isTemplate(messages)) {
      Assert(!target, "Cannot set single message template");
      return messages;
    }
    Assert(typeof messages === "object" && !Array.isArray(messages), "Invalid message options");
    target = target ? Clone(target) : {};
    for (let code in messages) {
      const message = messages[code];
      if (code === "root" || Template.isTemplate(message)) {
        target[code] = message;
        continue;
      }
      if (typeof message === "string") {
        target[code] = new Template(message);
        continue;
      }
      Assert(typeof message === "object" && !Array.isArray(message), "Invalid message for", code);
      const language = code;
      target[language] = target[language] || {};
      for (code in message) {
        const localized = message[code];
        if (code === "root" || Template.isTemplate(localized)) {
          target[language][code] = localized;
          continue;
        }
        Assert(typeof localized === "string", "Invalid message for", code, "in", language);
        target[language][code] = new Template(localized);
      }
    }
    return target;
  };
  exports.merge = function(base, extended) {
    if (!base) {
      return exports.compile(extended);
    }
    if (!extended) {
      return base;
    }
    if (typeof extended === "string") {
      return new Template(extended);
    }
    if (Template.isTemplate(extended)) {
      return extended;
    }
    const target = Clone(base);
    for (let code in extended) {
      const message = extended[code];
      if (code === "root" || Template.isTemplate(message)) {
        target[code] = message;
        continue;
      }
      if (typeof message === "string") {
        target[code] = new Template(message);
        continue;
      }
      Assert(typeof message === "object" && !Array.isArray(message), "Invalid message for", code);
      const language = code;
      target[language] = target[language] || {};
      for (code in message) {
        const localized = message[code];
        if (code === "root" || Template.isTemplate(localized)) {
          target[language][code] = localized;
          continue;
        }
        Assert(typeof localized === "string", "Invalid message for", code, "in", language);
        target[language][code] = new Template(localized);
      }
    }
    return target;
  };
});

// node_modules/@hapi/validate/lib/common.js
var require_common = __commonJS((exports) => {
  var Assert = require_assert();
  var AssertError = require_assertError();
  var Pkg = require_package();
  var Messages;
  var Schemas;
  var internals = {
    isoDate: /^(?:[-+]\d{2})?(?:\d{4}(?!\d{2}\b))(?:(-?)(?:(?:0[1-9]|1[0-2])(?:\1(?:[12]\d|0[1-9]|3[01]))?|W(?:[0-4]\d|5[0-2])(?:-?[1-7])?|(?:00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[1-6])))(?![T]$|[T][\d]+Z$)(?:[T\s](?:(?:(?:[01]\d|2[0-3])(?:(:?)[0-5]\d)?|24\:?00)(?:[.,]\d+(?!:))?)(?:\2[0-5]\d(?:[.,]\d+)?)?(?:[Z]|(?:[+-])(?:[01]\d|2[0-3])(?::?[0-5]\d)?)?)?)?$/
  };
  exports.version = Pkg.version;
  exports.defaults = {
    abortEarly: true,
    allowUnknown: false,
    context: null,
    convert: true,
    dateFormat: "iso",
    errors: {
      escapeHtml: false,
      label: "path",
      language: null,
      render: true,
      stack: false,
      wrap: {
        label: '"',
        array: "[]"
      }
    },
    messages: {},
    nonEnumerables: false,
    noDefaults: false,
    presence: "optional",
    skipFunctions: false,
    stripUnknown: false
  };
  exports.symbols = {
    any: Symbol.for("@hapi/joi/schema"),
    arraySingle: Symbol("arraySingle"),
    deepDefault: Symbol("deepDefault"),
    errors: Symbol("errors"),
    literal: Symbol("literal"),
    override: Symbol("override"),
    parent: Symbol("parent"),
    prefs: Symbol("prefs"),
    ref: Symbol("ref"),
    template: Symbol("template"),
    values: Symbol("values")
  };
  exports.assertOptions = function(options, keys, name = "Options") {
    Assert(options && typeof options === "object" && !Array.isArray(options), "Options must be of type object");
    const unknownKeys = Object.keys(options).filter((k) => !keys.includes(k));
    Assert(unknownKeys.length === 0, `${name} contain unknown keys: ${unknownKeys}`);
  };
  exports.checkPreferences = function(prefs) {
    Schemas = Schemas || require_schemas();
    const result = Schemas.preferences.validate(prefs);
    if (result.error) {
      throw new AssertError([result.error.details[0].message]);
    }
  };
  exports.compare = function(a, b, operator) {
    switch (operator) {
      case "=":
        return a === b;
      case ">":
        return a > b;
      case "<":
        return a < b;
      case ">=":
        return a >= b;
      case "<=":
        return a <= b;
    }
  };
  exports.default = function(value, defaultValue) {
    return value === undefined ? defaultValue : value;
  };
  exports.isIsoDate = function(date) {
    return internals.isoDate.test(date);
  };
  exports.isNumber = function(value) {
    return typeof value === "number" && !isNaN(value);
  };
  exports.isResolvable = function(obj) {
    if (!obj) {
      return false;
    }
    return obj[exports.symbols.ref] || obj[exports.symbols.template];
  };
  exports.isSchema = function(schema, options = {}) {
    const any = schema && schema[exports.symbols.any];
    if (!any) {
      return false;
    }
    return true;
  };
  exports.limit = function(value) {
    return Number.isSafeInteger(value) && value >= 0;
  };
  exports.preferences = function(target, source) {
    Messages = Messages || require_messages();
    target = target || {};
    source = source || {};
    const merged = Object.assign({}, target, source);
    if (source.errors && target.errors) {
      merged.errors = Object.assign({}, target.errors, source.errors);
      merged.errors.wrap = Object.assign({}, target.errors.wrap, source.errors.wrap);
    }
    if (source.messages) {
      merged.messages = Messages.compile(source.messages, target.messages);
    }
    delete merged[exports.symbols.prefs];
    return merged;
  };
  exports.tryWithPath = function(fn, key, options = {}) {
    try {
      return fn();
    } catch (err) {
      if (err.path !== undefined) {
        err.path = key + "." + err.path;
      } else {
        err.path = key;
      }
      if (options.append) {
        err.message = `${err.message} (${err.path})`;
      }
      throw err;
    }
  };
  exports.validateArg = function(value, label, { assert, message }) {
    if (exports.isSchema(assert)) {
      const result = assert.validate(value);
      if (!result.error) {
        return;
      }
      return result.error.message;
    } else if (!assert(value)) {
      return label ? `${label} ${message}` : message;
    }
  };
  exports.verifyFlat = function(args, method) {
    for (const arg of args) {
      Assert(!Array.isArray(arg), "Method no longer accepts array arguments:", method);
    }
  };
});

// node_modules/@hapi/validate/lib/compile.js
var require_compile = __commonJS((exports) => {
  var Assert = require_assert();
  var Common = require_common();
  var Ref = require_ref();
  var internals = {};
  exports.schema = function(Joi, config, options = {}) {
    Common.assertOptions(options, ["appendPath", "override"]);
    try {
      return internals.schema(Joi, config, options);
    } catch (err) {
      if (options.appendPath && err.path !== undefined) {
        err.message = `${err.message} (${err.path})`;
      }
      throw err;
    }
  };
  internals.schema = function(Joi, config, options) {
    Assert(config !== undefined, "Invalid undefined schema");
    if (Array.isArray(config)) {
      Assert(config.length, "Invalid empty array schema");
      if (config.length === 1) {
        config = config[0];
      }
    }
    const valid = (base, ...values) => {
      if (options.override !== false) {
        return base.valid(Joi.override, ...values);
      }
      return base.valid(...values);
    };
    if (internals.simple(config)) {
      return valid(Joi, config);
    }
    if (typeof config === "function") {
      return Joi.custom(config);
    }
    Assert(typeof config === "object", "Invalid schema content:", typeof config);
    if (Common.isResolvable(config)) {
      return valid(Joi, config);
    }
    if (Common.isSchema(config)) {
      return config;
    }
    if (Array.isArray(config)) {
      for (const item of config) {
        if (!internals.simple(item)) {
          return Joi.alternatives().try(...config);
        }
      }
      return valid(Joi, ...config);
    }
    if (config instanceof RegExp) {
      return Joi.string().regex(config);
    }
    if (config instanceof Date) {
      return valid(Joi.date(), config);
    }
    Assert(Object.getPrototypeOf(config) === Object.getPrototypeOf({}), "Schema can only contain plain objects");
    return Joi.object().keys(config);
  };
  exports.ref = function(id, options) {
    return Ref.isRef(id) ? id : Ref.create(id, options);
  };
  exports.compile = function(root, schema) {
    const any = schema && schema[Common.symbols.any];
    if (any) {
      Assert(any.version === Common.version, "Cannot mix different versions of joi schemas:", any.version, Common.version);
      return schema;
    }
    return exports.schema(root, schema, { appendPath: true });
  };
  internals.simple = function(value) {
    return value === null || ["boolean", "string", "number"].includes(typeof value);
  };
  exports.when = function(schema, condition, options) {
    if (options === undefined) {
      Assert(condition && typeof condition === "object", "Missing options");
      options = condition;
      condition = Ref.create(".");
    }
    if (Array.isArray(options)) {
      options = { switch: options };
    }
    Common.assertOptions(options, ["is", "not", "then", "otherwise", "switch", "break"]);
    if (Common.isSchema(condition)) {
      Assert(options.is === undefined, '"is" can not be used with a schema condition');
      Assert(options.not === undefined, '"not" can not be used with a schema condition');
      Assert(options.switch === undefined, '"switch" can not be used with a schema condition');
      return internals.condition(schema, { is: condition, then: options.then, otherwise: options.otherwise, break: options.break });
    }
    Assert(Ref.isRef(condition) || typeof condition === "string", "Invalid condition:", condition);
    Assert(options.not === undefined || options.is === undefined, 'Cannot combine "is" with "not"');
    if (options.switch === undefined) {
      let rule2 = options;
      if (options.not !== undefined) {
        rule2 = { is: options.not, then: options.otherwise, otherwise: options.then, break: options.break };
      }
      let is = rule2.is !== undefined ? schema.$_compile(rule2.is) : schema.$_root.invalid(null, false, 0, "").required();
      Assert(rule2.then !== undefined || rule2.otherwise !== undefined, 'options must have at least one of "then", "otherwise", or "switch"');
      Assert(rule2.break === undefined || rule2.then === undefined || rule2.otherwise === undefined, "Cannot specify then, otherwise, and break all together");
      if (options.is !== undefined && !Ref.isRef(options.is) && !Common.isSchema(options.is)) {
        is = is.required();
      }
      return internals.condition(schema, { ref: exports.ref(condition), is, then: rule2.then, otherwise: rule2.otherwise, break: rule2.break });
    }
    Assert(Array.isArray(options.switch), '"switch" must be an array');
    Assert(options.is === undefined, 'Cannot combine "switch" with "is"');
    Assert(options.not === undefined, 'Cannot combine "switch" with "not"');
    Assert(options.then === undefined, 'Cannot combine "switch" with "then"');
    const rule = {
      ref: exports.ref(condition),
      switch: [],
      break: options.break
    };
    for (let i = 0;i < options.switch.length; ++i) {
      const test = options.switch[i];
      const last = i === options.switch.length - 1;
      Common.assertOptions(test, last ? ["is", "then", "otherwise"] : ["is", "then"]);
      Assert(test.is !== undefined, 'Switch statement missing "is"');
      Assert(test.then !== undefined, 'Switch statement missing "then"');
      const item = {
        is: schema.$_compile(test.is),
        then: schema.$_compile(test.then)
      };
      if (!Ref.isRef(test.is) && !Common.isSchema(test.is)) {
        item.is = item.is.required();
      }
      if (last) {
        Assert(options.otherwise === undefined || test.otherwise === undefined, 'Cannot specify "otherwise" inside and outside a "switch"');
        const otherwise = options.otherwise !== undefined ? options.otherwise : test.otherwise;
        if (otherwise !== undefined) {
          Assert(rule.break === undefined, "Cannot specify both otherwise and break");
          item.otherwise = schema.$_compile(otherwise);
        }
      }
      rule.switch.push(item);
    }
    return rule;
  };
  internals.condition = function(schema, condition) {
    for (const key of ["then", "otherwise"]) {
      if (condition[key] === undefined) {
        delete condition[key];
      } else {
        condition[key] = schema.$_compile(condition[key]);
      }
    }
    return condition;
  };
});

// node_modules/@hapi/validate/lib/annotate.js
var require_annotate = __commonJS((exports) => {
  var Clone = require_clone();
  var Common = require_common();
  var internals = {
    annotations: Symbol("annotations")
  };
  exports.error = function(stripColorCodes) {
    if (!this._original || typeof this._original !== "object") {
      return this.details[0].message;
    }
    const redFgEscape = stripColorCodes ? "" : "\x1B[31m";
    const redBgEscape = stripColorCodes ? "" : "\x1B[41m";
    const endColor = stripColorCodes ? "" : "\x1B[0m";
    const obj = Clone(this._original);
    for (let i = this.details.length - 1;i >= 0; --i) {
      const pos = i + 1;
      const error = this.details[i];
      const path = error.path;
      let node = obj;
      for (let j = 0;; ++j) {
        const seg = path[j];
        if (Common.isSchema(node)) {
          node = node.clone();
        }
        if (j + 1 < path.length && typeof node[seg] !== "string") {
          node = node[seg];
        } else {
          const refAnnotations = node[internals.annotations] || { errors: {}, missing: {} };
          node[internals.annotations] = refAnnotations;
          const cacheKey = seg || error.context.key;
          if (node[seg] !== undefined) {
            refAnnotations.errors[cacheKey] = refAnnotations.errors[cacheKey] || [];
            refAnnotations.errors[cacheKey].push(pos);
          } else {
            refAnnotations.missing[cacheKey] = pos;
          }
          break;
        }
      }
    }
    const replacers = {
      key: /_\$key\$_([, \d]+)_\$end\$_"/g,
      missing: /"_\$miss\$_([^|]+)\|(\d+)_\$end\$_": "__missing__"/g,
      arrayIndex: /\s*"_\$idx\$_([, \d]+)_\$end\$_",?\n(.*)/g,
      specials: /"\[(NaN|Symbol.*|-?Infinity|function.*|\(.*)]"/g
    };
    let message = internals.safeStringify(obj, 2).replace(replacers.key, ($0, $1) => `" ${redFgEscape}[${$1}]${endColor}`).replace(replacers.missing, ($0, $1, $2) => `${redBgEscape}"${$1}"${endColor}${redFgEscape} [${$2}]: -- missing --${endColor}`).replace(replacers.arrayIndex, ($0, $1, $2) => `\n${$2} ${redFgEscape}[${$1}]${endColor}`).replace(replacers.specials, ($0, $1) => $1);
    message = `${message}\n${redFgEscape}`;
    for (let i = 0;i < this.details.length; ++i) {
      const pos = i + 1;
      message = `${message}\n[${pos}] ${this.details[i].message}`;
    }
    message = message + endColor;
    return message;
  };
  internals.safeStringify = function(obj, spaces) {
    return JSON.stringify(obj, internals.serializer(), spaces);
  };
  internals.serializer = function() {
    const keys = [];
    const stack = [];
    const cycleReplacer = (key, value) => {
      if (stack[0] === value) {
        return "[Circular ~]";
      }
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
    };
    return function(key, value) {
      if (stack.length > 0) {
        const thisPos = stack.indexOf(this);
        if (~thisPos) {
          stack.length = thisPos + 1;
          keys.length = thisPos + 1;
          keys[thisPos] = key;
        } else {
          stack.push(this);
          keys.push(key);
        }
        if (~stack.indexOf(value)) {
          value = cycleReplacer.call(this, key, value);
        }
      } else {
        stack.push(value);
      }
      if (value) {
        const annotations = value[internals.annotations];
        if (annotations) {
          if (Array.isArray(value)) {
            const annotated = [];
            for (let i = 0;i < value.length; ++i) {
              if (annotations.errors[i]) {
                annotated.push(`_\$idx\$_${annotations.errors[i].sort().join(", ")}_\$end\$_`);
              }
              annotated.push(value[i]);
            }
            value = annotated;
          } else {
            for (const errorKey in annotations.errors) {
              value[`${errorKey}_\$key\$_${annotations.errors[errorKey].sort().join(", ")}_\$end\$_`] = value[errorKey];
              value[errorKey] = undefined;
            }
            for (const missingKey in annotations.missing) {
              value[`_\$miss\$_${missingKey}|${annotations.missing[missingKey]}_\$end\$_`] = "__missing__";
            }
          }
          return value;
        }
      }
      if (value === Infinity || value === -Infinity || Number.isNaN(value) || typeof value === "function" || typeof value === "symbol") {
        return "[" + value.toString() + "]";
      }
      return value;
    };
  };
});

// node_modules/@hapi/validate/lib/errors.js
var require_errors = __commonJS((exports) => {
  var Annotate = require_annotate();
  var Common = require_common();
  var Template = require_template();
  exports.Report = class {
    constructor(code, value, local, flags, messages, state, prefs) {
      this.code = code;
      this.flags = flags;
      this.messages = messages;
      this.path = state.path;
      this.prefs = prefs;
      this.state = state;
      this.value = value;
      this.message = null;
      this.local = local || {};
      this.local.label = exports.label(this.flags, this.state, this.prefs, this.messages);
      if (this.value !== undefined && !this.local.hasOwnProperty("value")) {
        this.local.value = this.value;
      }
      if (this.path.length) {
        const key = this.path[this.path.length - 1];
        if (typeof key !== "object") {
          this.local.key = key;
        }
      }
    }
    toString() {
      if (this.message) {
        return this.message;
      }
      const code = this.code;
      if (!this.prefs.errors.render) {
        return this.code;
      }
      const template = this._template(this.prefs.messages) || this._template(this.messages);
      if (template === undefined) {
        return `Error code "${code}" is not defined, your custom type is missing the correct messages definition`;
      }
      this.message = template.render(this.value, this.state, this.prefs, this.local, { errors: this.prefs.errors, messages: [this.prefs.messages, this.messages] });
      if (!this.prefs.errors.label) {
        this.message = this.message.replace(/^"" /, "").trim();
      }
      return this.message;
    }
    _template(messages) {
      return exports.template(this.value, messages, this.code, this.state, this.prefs);
    }
  };
  exports.path = function(path) {
    let label = "";
    for (const segment of path) {
      if (typeof segment === "object") {
        continue;
      }
      if (typeof segment === "string") {
        if (label) {
          label += ".";
        }
        label += segment;
      } else {
        label += `[${segment}]`;
      }
    }
    return label;
  };
  exports.template = function(value, messages, code, state, prefs) {
    if (Template.isTemplate(messages)) {
      return code !== "root" ? messages : null;
    }
    let lang = prefs.errors.language;
    if (Common.isResolvable(lang)) {
      lang = lang.resolve(value, state, prefs);
    }
    if (lang && messages[lang] && messages[lang][code] !== undefined) {
      return messages[lang][code];
    }
    return messages[code];
  };
  exports.label = function(flags, state, prefs, messages) {
    if (!prefs.errors.label) {
      return "";
    }
    let path = state.path;
    if (prefs.errors.label === "key" && state.path.length > 1) {
      path = state.path.slice(-1);
    }
    const normalized = exports.path(path);
    if (normalized) {
      return normalized;
    }
    return exports.template(null, prefs.messages, "root", state, prefs) || exports.template(null, messages, "root", state, prefs) || "value";
  };
  exports.process = function(errors, original, prefs) {
    if (!errors) {
      return null;
    }
    const { override, message, details } = exports.details(errors);
    if (override) {
      return override;
    }
    if (prefs.errors.stack) {
      return new exports.ValidationError(message, details, original);
    }
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    const validationError = new exports.ValidationError(message, details, original);
    Error.stackTraceLimit = limit;
    return validationError;
  };
  exports.details = function(errors, options = {}) {
    let messages = [];
    const details = [];
    for (const item of errors) {
      if (item instanceof Error) {
        if (options.override !== false) {
          return { override: item };
        }
        const message2 = item.toString();
        messages.push(message2);
        details.push({
          message: message2,
          type: "override",
          context: { error: item }
        });
        continue;
      }
      const message = item.toString();
      messages.push(message);
      details.push({
        message,
        path: item.path.filter((v) => typeof v !== "object"),
        type: item.code,
        context: item.local
      });
    }
    if (messages.length > 1) {
      messages = [...new Set(messages)];
    }
    return { message: messages.join(". "), details };
  };
  exports.ValidationError = class extends Error {
    constructor(message, details, original) {
      super(message);
      this._original = original;
      this.details = details;
    }
    static isError(err) {
      return err instanceof exports.ValidationError;
    }
  };
  exports.ValidationError.prototype.isJoi = true;
  exports.ValidationError.prototype.name = "ValidationError";
  exports.ValidationError.prototype.annotate = Annotate.error;
});

// node_modules/@hapi/validate/lib/extend.js
var require_extend = __commonJS((exports) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Common = require_common();
  var Messages = require_messages();
  exports.type = function(from, options) {
    const base = Object.getPrototypeOf(from);
    const prototype = Clone(base);
    const schema = from._assign(Object.create(prototype));
    const def = Object.assign({}, options);
    delete def.base;
    prototype._definition = def;
    const parent = base._definition || {};
    def.messages = Messages.merge(parent.messages, def.messages);
    def.properties = Object.assign({}, parent.properties, def.properties);
    schema.type = def.type;
    def.flags = Object.assign({}, parent.flags, def.flags);
    const terms = Object.assign({}, parent.terms);
    if (def.terms) {
      for (const name in def.terms) {
        const term = def.terms[name];
        Assert(schema.$_terms[name] === undefined, "Invalid term override for", def.type, name);
        schema.$_terms[name] = term.init;
        terms[name] = term;
      }
    }
    def.terms = terms;
    if (!def.args) {
      def.args = parent.args;
    }
    if (def.coerce) {
      if (typeof def.coerce === "function") {
        def.coerce = { method: def.coerce };
      }
      if (def.coerce.from && !Array.isArray(def.coerce.from)) {
        def.coerce = { method: def.coerce.method, from: [].concat(def.coerce.from) };
      }
    }
    def.coerce = def.coerce || parent.coerce;
    def.validate = def.validate || parent.validate;
    const rules = Object.assign({}, parent.rules);
    if (def.rules) {
      for (const name in def.rules) {
        const rule = def.rules[name];
        Assert(typeof rule === "object", "Invalid rule definition for", def.type, name);
        const method = rule.method;
        if (method) {
          Assert(!prototype[name], "Rule conflict in", def.type, name);
          prototype[name] = method;
        }
        Assert(!rules[name], "Rule conflict in", def.type, name);
        rules[name] = rule;
        if (rule.alias) {
          const aliases = [].concat(rule.alias);
          for (const alias of aliases) {
            prototype[alias] = rule.method;
          }
        }
        if (rule.args) {
          rule.argsByName = new Map;
          rule.args = rule.args.map((arg) => {
            if (typeof arg === "string") {
              arg = { name: arg };
            }
            Assert(!rule.argsByName.has(arg.name), "Duplicated argument name", arg.name);
            rule.argsByName.set(arg.name, arg);
            return arg;
          });
        }
      }
    }
    def.rules = rules;
    if (def.overrides) {
      prototype._super = base;
      schema.$_super = {};
      for (const override in def.overrides) {
        Assert(base[override], "Cannot override missing", override);
        def.overrides[override][Common.symbols.parent] = base[override];
        schema.$_super[override] = base[override].bind(schema);
      }
      Object.assign(prototype, def.overrides);
    }
    def.cast = Object.assign({}, parent.cast, def.cast);
    def.rebuild = def.rebuild || parent.rebuild;
    return schema;
  };
});

// node_modules/@hapi/validate/lib/modify.js
var require_modify = __commonJS((exports) => {
  var Assert = require_assert();
  var Common = require_common();
  var Ref = require_ref();
  var internals = {};
  exports.Ids = internals.Ids = class {
    constructor() {
      this._byId = new Map;
      this._byKey = new Map;
      this._schemaChain = false;
    }
    clone() {
      const clone = new internals.Ids;
      clone._byId = new Map(this._byId);
      clone._byKey = new Map(this._byKey);
      clone._schemaChain = this._schemaChain;
      return clone;
    }
    concat(source) {
      if (source._schemaChain) {
        this._schemaChain = true;
      }
      for (const [id, value] of source._byId.entries()) {
        Assert(!this._byKey.has(id), "Schema id conflicts with existing key:", id);
        this._byId.set(id, value);
      }
      for (const [key, value] of source._byKey.entries()) {
        Assert(!this._byId.has(key), "Schema key conflicts with existing id:", key);
        this._byKey.set(key, value);
      }
    }
    reach(path, behind = []) {
      const current = path[0];
      const node = this._get(current);
      Assert(node, "Schema does not contain path", [...behind, ...path].join("."));
      const forward = path.slice(1);
      if (!forward.length) {
        return node.schema;
      }
      return node.schema._ids.reach(forward, [...behind, current]);
    }
    register(schema, { key } = {}) {
      if (!schema || !Common.isSchema(schema)) {
        return;
      }
      if (schema.$_property("schemaChain") || schema._ids._schemaChain) {
        this._schemaChain = true;
      }
      const id = schema._flags.id;
      if (id) {
        const existing = this._byId.get(id);
        Assert(!existing || existing.schema === schema, "Cannot add different schemas with the same id:", id);
        Assert(!this._byKey.has(id), "Schema id conflicts with existing key:", id);
        this._byId.set(id, { schema, id });
      }
      if (key) {
        Assert(!this._byKey.has(key), "Schema already contains key:", key);
        Assert(!this._byId.has(key), "Schema key conflicts with existing id:", key);
        this._byKey.set(key, { schema, id: key });
      }
    }
    reset() {
      this._byId = new Map;
      this._byKey = new Map;
      this._schemaChain = false;
    }
    _get(id) {
      return this._byId.get(id) || this._byKey.get(id);
    }
  };
  exports.schema = function(schema, options) {
    let obj;
    for (const name in schema._flags) {
      if (name[0] === "_") {
        continue;
      }
      const result = internals.scan(schema._flags[name], { source: "flags", name }, options);
      if (result !== undefined) {
        obj = obj || schema.clone();
        obj._flags[name] = result;
      }
    }
    for (let i = 0;i < schema._rules.length; ++i) {
      const rule = schema._rules[i];
      const result = internals.scan(rule.args, { source: "rules", name: rule.name }, options);
      if (result !== undefined) {
        obj = obj || schema.clone();
        const clone = Object.assign({}, rule);
        clone.args = result;
        obj._rules[i] = clone;
        const existingUnique = obj._singleRules.get(rule.name);
        if (existingUnique === rule) {
          obj._singleRules.set(rule.name, clone);
        }
      }
    }
    for (const name in schema.$_terms) {
      if (name[0] === "_") {
        continue;
      }
      const result = internals.scan(schema.$_terms[name], { source: "terms", name }, options);
      if (result !== undefined) {
        obj = obj || schema.clone();
        obj.$_terms[name] = result;
      }
    }
    return obj;
  };
  internals.scan = function(item, source, options, _path, _key) {
    const path = _path || [];
    if (item === null || typeof item !== "object") {
      return;
    }
    let clone;
    if (Array.isArray(item)) {
      for (let i = 0;i < item.length; ++i) {
        const key = source.name === "keys" && item[i].key;
        const result = internals.scan(item[i], source, options, [i, ...path], key);
        if (result !== undefined) {
          clone = clone || item.slice();
          clone[i] = result;
        }
      }
      return clone;
    }
    if (options.schema !== false && Common.isSchema(item) || options.ref !== false && Ref.isRef(item)) {
      const result = options.each(item, { ...source, path, key: _key });
      return result;
    }
    for (const key in item) {
      if (key[0] === "_") {
        continue;
      }
      const result = internals.scan(item[key], source, options, [key, ...path], _key);
      if (result !== undefined) {
        clone = clone || Object.assign({}, item);
        clone[key] = result;
      }
    }
    return clone;
  };
});

// node_modules/@hapi/validate/lib/state.js
var require_state = __commonJS((exports, module) => {
  var Clone = require_clone();
  var Reach = require_reach();
  var Common = require_common();
  var internals = {
    value: Symbol("value")
  };
  module.exports = internals.State = class {
    constructor(path, ancestors, state) {
      this.path = path;
      this.ancestors = ancestors;
      this.mainstay = state.mainstay;
      this.schemas = state.schemas;
    }
    localize(path, ancestors = null, schema = null) {
      const state = new internals.State(path, ancestors, this);
      if (schema && state.schemas) {
        state.schemas = [internals.schemas(schema), ...state.schemas];
      }
      return state;
    }
    nest(schema) {
      const state = new internals.State(this.path, this.ancestors, this);
      state.schemas = state.schemas && [internals.schemas(schema), ...state.schemas];
      return state;
    }
    shadow(value, reason) {
      this.mainstay.shadow = this.mainstay.shadow || new internals.Shadow;
      this.mainstay.shadow.set(this.path, value, reason);
    }
    snapshot() {
      if (this.mainstay.shadow) {
        this._snapshot = Clone(this.mainstay.shadow.node(this.path));
      }
    }
    restore() {
      if (this.mainstay.shadow) {
        this.mainstay.shadow.override(this.path, this._snapshot);
        this._snapshot = undefined;
      }
    }
  };
  internals.schemas = function(schema) {
    if (Common.isSchema(schema)) {
      return { schema };
    }
    return schema;
  };
  internals.Shadow = class {
    constructor() {
      this._values = null;
    }
    set(path, value, reason) {
      if (!path.length) {
        return;
      }
      if (reason === "strip" && typeof path[path.length - 1] === "number") {
        return;
      }
      this._values = this._values || new Map;
      let node = this._values;
      for (let i = 0;i < path.length; ++i) {
        const segment = path[i];
        let next = node.get(segment);
        if (!next) {
          next = new Map;
          node.set(segment, next);
        }
        node = next;
      }
      node[internals.value] = value;
    }
    get(path) {
      const node = this.node(path);
      if (node) {
        return node[internals.value];
      }
    }
    node(path) {
      if (!this._values) {
        return;
      }
      return Reach(this._values, path, { iterables: true });
    }
    override(path, node) {
      if (!this._values) {
        return;
      }
      const parents = path.slice(0, -1);
      const own = path[path.length - 1];
      const parent = Reach(this._values, parents, { iterables: true });
      if (node) {
        parent.set(own, node);
        return;
      }
      if (parent) {
        parent.delete(own);
      }
    }
  };
});

// node_modules/@hapi/validate/lib/validator.js
var require_validator = __commonJS((exports) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Common = require_common();
  var Errors = require_errors();
  var State = require_state();
  var internals = {
    result: Symbol("result")
  };
  exports.entry = function(value, schema, prefs) {
    let settings = Common.defaults;
    if (prefs) {
      settings = Common.preferences(Common.defaults, prefs);
    }
    const result = internals.entry(value, schema, settings);
    const outcome = { value: result.value };
    if (result.error) {
      outcome.error = result.error;
    }
    return outcome;
  };
  internals.entry = function(value, schema, prefs) {
    const links = schema._ids._schemaChain ? new Map : null;
    const mainstay = { links };
    const schemas = schema._ids._schemaChain ? [{ schema }] : null;
    const state = new State([], [], { mainstay, schemas });
    const result = exports.validate(value, schema, state, prefs);
    const error = Errors.process(result.errors, value, prefs);
    return { value: result.value, error, mainstay };
  };
  exports.validate = function(value, schema, state, prefs, overrides = {}) {
    if (schema.$_terms.whens) {
      schema = schema._generate(value, state, prefs).schema;
    }
    if (schema._preferences) {
      prefs = internals.prefs(schema, prefs);
    }
    const createError = (code, local, localState) => schema.$_createError(code, value, local, localState || state, prefs);
    const helpers = {
      original: value,
      prefs,
      schema,
      state,
      error: createError,
      errorsArray: internals.errorsArray,
      message: (messages, local) => schema.$_createError("custom", value, local, state, prefs, { messages })
    };
    const def = schema._definition;
    if (def.coerce && value !== undefined && prefs.convert && (!def.coerce.from || def.coerce.from.includes(typeof value))) {
      const coerced = def.coerce.method(value, helpers);
      if (coerced) {
        if (coerced.errors) {
          return internals.finalize(coerced.value, [].concat(coerced.errors), helpers);
        }
        value = coerced.value;
      }
    }
    const empty = schema._flags.empty;
    if (empty && empty.$_match(internals.trim(value, schema), state.nest(empty), Common.defaults)) {
      value = undefined;
    }
    const presence = overrides.presence || schema._flags.presence || (schema._flags._endedSwitch ? null : prefs.presence);
    if (value === undefined) {
      if (presence === "forbidden") {
        return internals.finalize(value, null, helpers);
      }
      if (presence === "required") {
        return internals.finalize(value, [schema.$_createError("any.required", value, null, state, prefs)], helpers);
      }
      if (presence === "optional") {
        if (schema._flags.default !== Common.symbols.deepDefault) {
          return internals.finalize(value, null, helpers);
        }
        value = {};
      }
    } else if (presence === "forbidden") {
      return internals.finalize(value, [schema.$_createError("any.unknown", value, null, state, prefs)], helpers);
    }
    const errors = [];
    if (schema._valids) {
      const match = schema._valids.get(value, state, prefs, schema._flags.insensitive);
      if (match) {
        if (prefs.convert) {
          value = match.value;
        }
        return internals.finalize(value, null, helpers);
      }
      if (schema._flags.only) {
        const report = schema.$_createError("any.only", value, { valids: schema._valids.values({ display: true }) }, state, prefs);
        if (prefs.abortEarly) {
          return internals.finalize(value, [report], helpers);
        }
        errors.push(report);
      }
    }
    if (schema._invalids) {
      const match = schema._invalids.get(value, state, prefs, schema._flags.insensitive);
      if (match) {
        const report = schema.$_createError("any.invalid", value, { invalids: schema._invalids.values({ display: true }) }, state, prefs);
        if (prefs.abortEarly) {
          return internals.finalize(value, [report], helpers);
        }
        errors.push(report);
      }
    }
    if (def.validate) {
      const base = def.validate(value, helpers);
      if (base) {
        value = base.value;
        if (base.errors) {
          if (!Array.isArray(base.errors)) {
            errors.push(base.errors);
            return internals.finalize(value, errors, helpers);
          }
          if (base.errors.length) {
            errors.push(...base.errors);
            return internals.finalize(value, errors, helpers);
          }
        }
      }
    }
    if (!schema._rules.length) {
      return internals.finalize(value, errors, helpers);
    }
    return internals.rules(value, errors, helpers);
  };
  internals.rules = function(value, errors, helpers) {
    const { schema, state, prefs } = helpers;
    for (const rule of schema._rules) {
      const definition = schema._definition.rules[rule.method];
      if (definition.convert && prefs.convert) {
        continue;
      }
      let ret;
      let args = rule.args;
      if (rule._resolve.length) {
        args = Object.assign({}, args);
        for (const key of rule._resolve) {
          const resolver = definition.argsByName.get(key);
          const resolved = args[key].resolve(value, state, prefs);
          const normalized = resolver.normalize ? resolver.normalize(resolved) : resolved;
          const invalid = Common.validateArg(normalized, null, resolver);
          if (invalid) {
            ret = schema.$_createError("any.ref", resolved, { arg: key, ref: args[key], reason: invalid }, state, prefs);
            break;
          }
          args[key] = normalized;
        }
      }
      ret = ret || definition.validate(value, helpers, args, rule);
      const result = internals.rule(ret, rule);
      if (result.errors) {
        if (prefs.abortEarly) {
          return internals.finalize(value, result.errors, helpers);
        }
        errors.push(...result.errors);
      } else {
        value = result.value;
      }
    }
    return internals.finalize(value, errors, helpers);
  };
  internals.rule = function(ret, rule) {
    if (ret instanceof Errors.Report) {
      return { errors: [ret], value: null };
    }
    if (Array.isArray(ret) && ret[Common.symbols.errors]) {
      return { errors: ret, value: null };
    }
    return { errors: null, value: ret };
  };
  internals.finalize = function(value, errors, helpers) {
    errors = errors || [];
    const { schema, state } = helpers;
    if (errors.length) {
      const failover = internals.default("failover", undefined, errors, helpers);
      if (failover !== undefined) {
        value = failover;
        errors = [];
      }
    }
    if (errors.length && schema._flags.error) {
      if (typeof schema._flags.error === "function") {
        errors = schema._flags.error(errors);
        if (!Array.isArray(errors)) {
          errors = [errors];
        }
        for (const error of errors) {
          Assert(error instanceof Error || error instanceof Errors.Report, "error() must return an Error object");
        }
      } else {
        errors = [schema._flags.error];
      }
    }
    if (value === undefined) {
      const defaulted = internals.default("default", value, errors, helpers);
      value = defaulted;
    }
    if (schema._flags.cast && value !== undefined) {
      const caster = schema._definition.cast[schema._flags.cast];
      if (caster.from(value)) {
        const casted = caster.to(value, helpers);
        value = casted;
      }
    }
    const result = { value, errors: errors.length ? errors : null };
    if (schema._flags.result) {
      result.value = schema._flags.result === "strip" ? undefined : helpers.original;
      state.shadow(value, schema._flags.result);
    }
    return result;
  };
  internals.prefs = function(schema, prefs) {
    const isDefaultOptions = prefs === Common.defaults;
    if (isDefaultOptions && schema._preferences[Common.symbols.prefs]) {
      return schema._preferences[Common.symbols.prefs];
    }
    prefs = Common.preferences(prefs, schema._preferences);
    if (isDefaultOptions) {
      schema._preferences[Common.symbols.prefs] = prefs;
    }
    return prefs;
  };
  internals.default = function(flag, value, errors, helpers) {
    const { schema, state, prefs } = helpers;
    const source = schema._flags[flag];
    if (prefs.noDefaults || source === undefined) {
      return value;
    }
    if (!source) {
      return source;
    }
    if (typeof source === "function") {
      const args = source.length ? [Clone(state.ancestors[0]), helpers] : [];
      try {
        return source(...args);
      } catch (err) {
        errors.push(schema.$_createError(`any.${flag}`, null, { error: err }, state, prefs));
        return;
      }
    }
    if (typeof source !== "object") {
      return source;
    }
    if (source[Common.symbols.literal]) {
      return source.literal;
    }
    if (Common.isResolvable(source)) {
      return source.resolve(value, state, prefs);
    }
    return Clone(source);
  };
  internals.trim = function(value, schema) {
    if (typeof value !== "string") {
      return value;
    }
    const trim = schema.$_getRule("trim");
    if (!trim || !trim.args.enabled) {
      return value;
    }
    return value.trim();
  };
  internals.errorsArray = function() {
    const errors = [];
    errors[Common.symbols.errors] = true;
    return errors;
  };
});

// node_modules/@hapi/validate/lib/values.js
var require_values = __commonJS((exports, module) => {
  var Assert = require_assert();
  var DeepEqual = require_deepEqual();
  var Common = require_common();
  var internals = {};
  module.exports = internals.Values = class {
    constructor(values, refs) {
      this._values = new Set(values);
      this._refs = new Set(refs);
      this._lowercase = internals.lowercases(values);
      this._override = false;
    }
    get length() {
      return this._values.size + this._refs.size;
    }
    add(value, refs) {
      if (Common.isResolvable(value)) {
        if (!this._refs.has(value)) {
          this._refs.add(value);
          if (refs) {
            refs.register(value);
          }
        }
        return;
      }
      if (!this.has(value, null, null, false)) {
        this._values.add(value);
        if (typeof value === "string") {
          this._lowercase.set(value.toLowerCase(), value);
        }
      }
    }
    static merge(target, source, remove) {
      target = target || new internals.Values;
      if (source) {
        if (source._override) {
          return source.clone();
        }
        for (const item of [...source._values, ...source._refs]) {
          target.add(item);
        }
      }
      if (remove) {
        for (const item of [...remove._values, ...remove._refs]) {
          target.remove(item);
        }
      }
      return target.length ? target : null;
    }
    remove(value) {
      if (Common.isResolvable(value)) {
        this._refs.delete(value);
        return;
      }
      this._values.delete(value);
      if (typeof value === "string") {
        this._lowercase.delete(value.toLowerCase());
      }
    }
    has(value, state, prefs, insensitive) {
      return !!this.get(value, state, prefs, insensitive);
    }
    get(value, state, prefs, insensitive) {
      if (!this.length) {
        return false;
      }
      if (this._values.has(value)) {
        return { value };
      }
      if (typeof value === "string" && value && insensitive) {
        const found = this._lowercase.get(value.toLowerCase());
        if (found) {
          return { value: found };
        }
      }
      if (!this._refs.size && typeof value !== "object") {
        return false;
      }
      if (typeof value === "object") {
        for (const item of this._values) {
          if (DeepEqual(item, value)) {
            return { value: item };
          }
        }
      }
      if (state) {
        for (const ref of this._refs) {
          const resolved = ref.resolve(value, state, prefs, null, { in: true });
          if (resolved === undefined) {
            continue;
          }
          const items = !ref.in || typeof resolved !== "object" ? [resolved] : Array.isArray(resolved) ? resolved : Object.keys(resolved);
          for (const item of items) {
            if (typeof item !== typeof value) {
              continue;
            }
            if (insensitive && value && typeof value === "string") {
              if (item.toLowerCase() === value.toLowerCase()) {
                return { value: item, ref };
              }
            } else {
              if (DeepEqual(item, value)) {
                return { value: item, ref };
              }
            }
          }
        }
      }
      return false;
    }
    override() {
      this._override = true;
    }
    values(options) {
      if (options && options.display) {
        const values = [];
        for (const item of [...this._values, ...this._refs]) {
          if (item !== undefined) {
            values.push(item);
          }
        }
        return values;
      }
      return Array.from([...this._values, ...this._refs]);
    }
    clone() {
      const set = new internals.Values(this._values, this._refs);
      set._override = this._override;
      return set;
    }
    concat(source) {
      Assert(!source._override, "Cannot concat override set of values");
      const set = new internals.Values([...this._values, ...source._values], [...this._refs, ...source._refs]);
      set._override = this._override;
      return set;
    }
  };
  internals.Values.prototype[Common.symbols.values] = true;
  internals.Values.prototype.slice = internals.Values.prototype.clone;
  internals.lowercases = function(from) {
    const map = new Map;
    if (from) {
      for (const value of from) {
        if (typeof value === "string") {
          map.set(value.toLowerCase(), value);
        }
      }
    }
    return map;
  };
});

// node_modules/@hapi/validate/lib/base.js
var require_base = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var DeepEqual = require_deepEqual();
  var Merge = require_merge();
  var Common = require_common();
  var Compile = require_compile();
  var Errors = require_errors();
  var Extend = require_extend();
  var Messages = require_messages();
  var Modify = require_modify();
  var Ref = require_ref();
  var Validator = require_validator();
  var Values = require_values();
  var internals = {};
  internals.Base = class {
    constructor(type) {
      this.type = type;
      this.$_root = null;
      this._definition = {};
      this._ids = new Modify.Ids;
      this._preferences = null;
      this._refs = new Ref.Manager;
      this._cache = null;
      this._valids = null;
      this._invalids = null;
      this._flags = {};
      this._rules = [];
      this._singleRules = new Map;
      this.$_terms = {};
      this.$_temp = {
        whens: {}
      };
    }
    allow(...values) {
      Common.verifyFlat(values, "allow");
      return this._values(values, "_valids");
    }
    cast(to) {
      Assert(to === false || typeof to === "string", "Invalid to value");
      Assert(to === false || this._definition.cast[to], "Type", this.type, "does not support casting to", to);
      return this.$_setFlag("cast", to === false ? undefined : to);
    }
    default(value, options) {
      return this._default("default", value, options);
    }
    empty(schema) {
      const obj = this.clone();
      if (schema !== undefined) {
        schema = obj.$_compile(schema, { override: false });
      }
      return obj.$_setFlag("empty", schema, { clone: false });
    }
    error(err) {
      Assert(err, "Missing error");
      Assert(err instanceof Error || typeof err === "function", "Must provide a valid Error object or a function");
      return this.$_setFlag("error", err);
    }
    failover(value, options) {
      return this._default("failover", value, options);
    }
    forbidden() {
      return this.presence("forbidden");
    }
    id(id) {
      if (!id) {
        return this.$_setFlag("id", undefined);
      }
      Assert(typeof id === "string", "id must be a non-empty string");
      Assert(/^[^\.]+$/.test(id), "id cannot contain period character");
      return this.$_setFlag("id", id);
    }
    invalid(...values) {
      return this._values(values, "_invalids");
    }
    only(mode = true) {
      Assert(typeof mode === "boolean", "Invalid mode:", mode);
      return this.$_setFlag("only", mode);
    }
    optional() {
      return this.presence("optional");
    }
    prefs(prefs) {
      Assert(prefs, "Missing preferences");
      Assert(prefs.context === undefined, "Cannot override context");
      Common.checkPreferences(prefs);
      const obj = this.clone();
      obj._preferences = Common.preferences(obj._preferences, prefs);
      return obj;
    }
    presence(mode) {
      Assert(["optional", "required", "forbidden"].includes(mode), "Unknown presence mode", mode);
      return this.$_setFlag("presence", mode);
    }
    raw(enabled = true) {
      return this.$_setFlag("result", enabled ? "raw" : undefined);
    }
    required() {
      return this.presence("required");
    }
    strict(enabled) {
      const obj = this.clone();
      const convert = enabled === undefined ? false : !enabled;
      obj._preferences = Common.preferences(obj._preferences, { convert });
      return obj;
    }
    strip(enabled = true) {
      return this.$_setFlag("result", enabled ? "strip" : undefined);
    }
    valid(...values) {
      Common.verifyFlat(values, "valid");
      const obj = this.allow(...values);
      obj.$_setFlag("only", !!obj._valids, { clone: false });
      return obj;
    }
    when(condition, options) {
      const obj = this.clone();
      if (!obj.$_terms.whens) {
        obj.$_terms.whens = [];
      }
      const when = Compile.when(obj, condition, options);
      if (!["any", "link"].includes(obj.type)) {
        const conditions = when.is ? [when] : when.switch;
        for (const item of conditions) {
          Assert(!item.then || item.then.type === "any" || item.then.type === obj.type, "Cannot combine", obj.type, "with", item.then?.type);
          Assert(!item.otherwise || item.otherwise.type === "any" || item.otherwise.type === obj.type, "Cannot combine", obj.type, "with", item.otherwise?.type);
        }
      }
      obj.$_terms.whens.push(when);
      return obj.$_mutateRebuild();
    }
    clone() {
      const obj = Object.create(Object.getPrototypeOf(this));
      return this._assign(obj);
    }
    concat(source) {
      Assert(Common.isSchema(source), "Invalid schema object");
      Assert(this.type === "any" || source.type === "any" || source.type === this.type, "Cannot merge type", this.type, "with another type:", source.type);
      let obj = this.clone();
      if (this.type === "any" && source.type !== "any") {
        const tmpObj = source.clone();
        for (const key of Object.keys(obj)) {
          if (key !== "type") {
            tmpObj[key] = obj[key];
          }
        }
        obj = tmpObj;
      }
      obj._ids.concat(source._ids);
      obj._refs.register(source, Ref.toSibling);
      obj._preferences = obj._preferences ? Common.preferences(obj._preferences, source._preferences) : source._preferences;
      obj._valids = Values.merge(obj._valids, source._valids, source._invalids);
      obj._invalids = Values.merge(obj._invalids, source._invalids, source._valids);
      for (const name of source._singleRules.keys()) {
        if (obj._singleRules.has(name)) {
          obj._rules = obj._rules.filter((target) => target.name !== name);
          obj._singleRules.delete(name);
        }
      }
      for (const test of source._rules) {
        if (!source._definition.rules[test.method].multi) {
          obj._singleRules.set(test.name, test);
        }
        obj._rules.push(test);
      }
      if (obj._flags.empty && source._flags.empty) {
        obj._flags.empty = obj._flags.empty.concat(source._flags.empty);
        const flags = Object.assign({}, source._flags);
        delete flags.empty;
        Merge(obj._flags, flags);
      } else if (source._flags.empty) {
        obj._flags.empty = source._flags.empty;
        const flags = Object.assign({}, source._flags);
        delete flags.empty;
        Merge(obj._flags, flags);
      } else {
        Merge(obj._flags, source._flags);
      }
      for (const key in source.$_terms) {
        const terms = source.$_terms[key];
        if (!terms) {
          if (!obj.$_terms[key]) {
            obj.$_terms[key] = terms;
          }
          continue;
        }
        if (!obj.$_terms[key]) {
          obj.$_terms[key] = terms.slice();
          continue;
        }
        obj.$_terms[key] = obj.$_terms[key].concat(terms);
      }
      return obj.$_mutateRebuild();
    }
    validate(value, options) {
      return Validator.entry(value, this, options);
    }
    validateAsync(value, options) {
      const result = this.validate(value, options);
      if (result.error) {
        throw result.error;
      }
      return result.value;
    }
    $_addRule(options) {
      if (typeof options === "string") {
        options = { name: options };
      }
      Assert(options && typeof options === "object", "Invalid options");
      Assert(options.name && typeof options.name === "string", "Invalid rule name");
      for (const key in options) {
        Assert(key[0] !== "_", "Cannot set private rule properties");
      }
      const rule = Object.assign({}, options);
      rule._resolve = [];
      rule.method = rule.method || rule.name;
      const definition = this._definition.rules[rule.method];
      const args = rule.args;
      Assert(definition, "Unknown rule", rule.method);
      const obj = this.clone();
      if (args) {
        Assert(Object.keys(args).length === 1 || Object.keys(args).length === this._definition.rules[rule.name].args.length, "Invalid rule definition for", this.type, rule.name);
        for (const key in args) {
          let arg = args[key];
          if (arg === undefined) {
            delete args[key];
            continue;
          }
          if (definition.argsByName) {
            const resolver = definition.argsByName.get(key);
            if (resolver.ref && Common.isResolvable(arg)) {
              rule._resolve.push(key);
              obj.$_mutateRegister(arg);
            } else {
              if (resolver.normalize) {
                arg = resolver.normalize(arg);
                args[key] = arg;
              }
              if (resolver.assert) {
                const error = Common.validateArg(arg, key, resolver);
                Assert(!error, error, "or reference");
              }
            }
          }
          args[key] = arg;
        }
      }
      if (!definition.multi) {
        obj._ruleRemove(rule.name);
        obj._singleRules.set(rule.name, rule);
      }
      if (definition.priority) {
        obj._rules.unshift(rule);
      } else {
        obj._rules.push(rule);
      }
      return obj;
    }
    $_compile(schema, options) {
      return Compile.schema(this.$_root, schema, options);
    }
    $_createError(code, value, local, state, prefs, options = {}) {
      const flags = options.flags !== false ? this._flags : {};
      const messages = options.messages ? Messages.merge(this._definition.messages, options.messages) : this._definition.messages;
      return new Errors.Report(code, value, local, flags, messages, state, prefs);
    }
    $_getRule(name) {
      return this._singleRules.get(name);
    }
    $_match(value, state, prefs, overrides) {
      prefs = Object.assign({}, prefs);
      prefs.abortEarly = true;
      prefs._externals = false;
      state.snapshot();
      const result = !Validator.validate(value, this, state, prefs, overrides).errors;
      state.restore();
      return result;
    }
    $_modify(options) {
      Common.assertOptions(options, ["each", "once", "ref", "schema"]);
      return Modify.schema(this, options) || this;
    }
    $_mutateRebuild() {
      this._refs.reset();
      this._ids.reset();
      const each = (item, { source, name, path, key }) => {
        const family = this._definition[source][name]?.register;
        if (family !== false) {
          this.$_mutateRegister(item, { family, key });
        }
      };
      this.$_modify({ each });
      if (this._definition.rebuild) {
        this._definition.rebuild(this);
      }
      return this;
    }
    $_mutateRegister(schema, { family, key } = {}) {
      this._refs.register(schema, family);
      this._ids.register(schema, { key });
    }
    $_property(name) {
      return this._definition.properties[name];
    }
    $_reach(path) {
      return this._ids.reach(path);
    }
    $_rootReferences() {
      return this._refs.roots();
    }
    $_setFlag(name, value, options = {}) {
      const flag = this._definition.flags[name] || {};
      if (DeepEqual(value, flag.default)) {
        value = undefined;
      }
      if (DeepEqual(value, this._flags[name])) {
        return this;
      }
      const obj = options.clone !== false ? this.clone() : this;
      if (value !== undefined) {
        obj._flags[name] = value;
        obj.$_mutateRegister(value);
      } else {
        delete obj._flags[name];
      }
      return obj;
    }
    $_parent(method, ...args) {
      return this[method][Common.symbols.parent].call(this, ...args);
    }
    $_validate(value, state, prefs) {
      return Validator.validate(value, this, state, prefs);
    }
    _assign(target) {
      target.type = this.type;
      target.$_root = this.$_root;
      target.$_temp = Object.assign({}, this.$_temp);
      target.$_temp.whens = {};
      target._ids = this._ids.clone();
      target._preferences = this._preferences;
      target._valids = this._valids?.clone();
      target._invalids = this._invalids?.clone();
      target._rules = this._rules.slice();
      target._singleRules = Clone(this._singleRules, { shallow: true });
      target._refs = this._refs.clone();
      target._flags = Object.assign({}, this._flags);
      target._cache = null;
      target.$_terms = {};
      for (const key in this.$_terms) {
        target.$_terms[key] = this.$_terms[key] ? this.$_terms[key].slice() : null;
      }
      target.$_super = {};
      for (const override in this.$_super) {
        target.$_super[override] = this._super[override].bind(target);
      }
      return target;
    }
    _default(flag, value, options = {}) {
      Common.assertOptions(options, "literal");
      Assert(value !== undefined, "Missing", flag, "value");
      Assert(typeof value === "function" || !options.literal, "Only function value supports literal option");
      if (typeof value === "function" && options.literal) {
        value = {
          [Common.symbols.literal]: true,
          literal: value
        };
      }
      const obj = this.$_setFlag(flag, value);
      return obj;
    }
    _extend(options) {
      Assert(!options.base, "Cannot extend type with another base");
      return Extend.type(this, options);
    }
    _generate(value, state, prefs) {
      if (!this.$_terms.whens) {
        return { schema: this };
      }
      const whens = [];
      const ids = [];
      for (let i = 0;i < this.$_terms.whens.length; ++i) {
        const when = this.$_terms.whens[i];
        if (when.concat) {
          whens.push(when.concat);
          ids.push(`${i}.concat`);
          continue;
        }
        const input = when.ref ? when.ref.resolve(value, state, prefs) : value;
        const tests = when.is ? [when] : when.switch;
        const before = ids.length;
        for (let j = 0;j < tests.length; ++j) {
          const { is, then, otherwise } = tests[j];
          const baseId = `${i}${when.switch ? "." + j : ""}`;
          if (is.$_match(input, state.nest(is, `${baseId}.is`), prefs)) {
            if (then) {
              const localState = state.localize([...state.path, `${baseId}.then`], state.ancestors, state.schemas);
              const { schema: generated, id: id2 } = then._generate(value, localState, prefs);
              whens.push(generated);
              ids.push(`${baseId}.then${id2 ? `(${id2})` : ""}`);
              break;
            }
          } else if (otherwise) {
            const localState = state.localize([...state.path, `${baseId}.otherwise`], state.ancestors, state.schemas);
            const { schema: generated, id: id2 } = otherwise._generate(value, localState, prefs);
            whens.push(generated);
            ids.push(`${baseId}.otherwise${id2 ? `(${id2})` : ""}`);
            break;
          }
        }
        if (when.break && ids.length > before) {
          break;
        }
      }
      const id = ids.join(", ");
      if (!id) {
        return { schema: this };
      }
      if (this.$_temp.whens[id]) {
        return { schema: this.$_temp.whens[id], id };
      }
      let obj = this;
      if (this._definition.generate) {
        obj = this._definition.generate(this, value, state, prefs);
      }
      for (const when of whens) {
        obj = obj.concat(when);
      }
      this.$_temp.whens[id] = obj;
      return { schema: obj, id };
    }
    _ruleRemove(name) {
      if (!this._singleRules.has(name)) {
        return this;
      }
      this._singleRules.delete(name);
      const filtered = [];
      for (let i = 0;i < this._rules.length; ++i) {
        const test = this._rules[i];
        if (test.name === name) {
          continue;
        }
        filtered.push(test);
      }
      this._rules = filtered;
    }
    _values(values, key) {
      Common.verifyFlat(values, key.slice(1, -1));
      const obj = this.clone();
      const override = values[0] === Common.symbols.override;
      if (override) {
        values = values.slice(1);
      }
      if (!obj[key] && values.length) {
        obj[key] = new Values;
      } else if (override) {
        obj[key] = values.length ? new Values : null;
        obj.$_mutateRebuild();
      }
      if (!obj[key]) {
        return obj;
      }
      if (override) {
        obj[key].override();
      }
      for (const value of values) {
        Assert(value !== undefined, "Cannot call allow/valid/invalid with undefined");
        Assert(value !== Common.symbols.override, "Override must be the first value");
        const other = key === "_invalids" ? "_valids" : "_invalids";
        if (obj[other]) {
          obj[other].remove(value);
          if (!obj[other].length) {
            Assert(key === "_valids" || !obj._flags.only, "Setting invalid value", value, "leaves schema rejecting all values due to previous valid rule");
            obj[other] = null;
          }
        }
        obj[key].add(value, obj._refs);
      }
      return obj;
    }
  };
  internals.Base.prototype[Common.symbols.any] = {
    version: Common.version,
    compile: Compile.compile,
    root: "$_root"
  };
  internals.Base.prototype.isImmutable = true;
  internals.Base.prototype.deny = internals.Base.prototype.invalid;
  internals.Base.prototype.disallow = internals.Base.prototype.invalid;
  internals.Base.prototype.equal = internals.Base.prototype.valid;
  internals.Base.prototype.exist = internals.Base.prototype.required;
  internals.Base.prototype.not = internals.Base.prototype.invalid;
  internals.Base.prototype.options = internals.Base.prototype.prefs;
  internals.Base.prototype.preferences = internals.Base.prototype.prefs;
  module.exports = new internals.Base;
});

// node_modules/@hapi/validate/lib/types/any.js
var require_any = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Base = require_base();
  var Common = require_common();
  module.exports = Base._extend({
    type: "any",
    flags: {
      only: { default: false }
    },
    terms: {
      alterations: { init: null },
      examples: { init: null },
      metas: { init: [] },
      notes: { init: [] },
      shared: { init: null },
      tags: { init: [] },
      whens: { init: null }
    },
    rules: {
      custom: {
        method(method, description) {
          Assert(typeof method === "function", "Method must be a function");
          Assert(description === undefined || description && typeof description === "string", "Description must be a non-empty string");
          return this.$_addRule({ name: "custom", args: { method, description } });
        },
        validate(value, helpers, { method }) {
          try {
            return method(value, helpers);
          } catch (err) {
            return helpers.error("any.custom", { error: err });
          }
        },
        args: ["method", "description"],
        multi: true
      },
      messages: {
        method(messages) {
          return this.prefs({ messages });
        }
      },
      shared: {
        method(schema) {
          Assert(Common.isSchema(schema) && schema._flags.id, "Schema must be a schema with an id");
          const obj = this.clone();
          obj.$_terms.shared = obj.$_terms.shared || [];
          obj.$_terms.shared.push(schema);
          obj.$_mutateRegister(schema);
          return obj;
        }
      }
    },
    messages: {
      "any.custom": "{{#label}} failed custom validation because {{#error.message}}",
      "any.default": "{{#label}} threw an error when running default method",
      "any.failover": "{{#label}} threw an error when running failover method",
      "any.invalid": "{{#label}} contains an invalid value",
      "any.only": "{{#label}} must be one of {{#valids}}",
      "any.ref": "{{#label}} {{#arg}} references {{:#ref}} which {{#reason}}",
      "any.required": "{{#label}} is required",
      "any.unknown": "{{#label}} is not allowed"
    }
  });
});

// node_modules/@hapi/validate/lib/types/alternatives.js
var require_alternatives = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  var Compile = require_compile();
  var Errors = require_errors();
  var Ref = require_ref();
  var internals = {};
  module.exports = Any._extend({
    type: "alternatives",
    flags: {
      match: { default: "any" }
    },
    terms: {
      matches: { init: [], register: Ref.toSibling }
    },
    args(schema, ...schemas) {
      if (schemas.length === 1) {
        if (Array.isArray(schemas[0])) {
          return schema.try(...schemas[0]);
        }
      }
      return schema.try(...schemas);
    },
    validate(value, helpers) {
      const { schema, error, state, prefs } = helpers;
      if (schema._flags.match) {
        let hits = 0;
        let matched;
        for (let i = 0;i < schema.$_terms.matches.length; ++i) {
          const item = schema.$_terms.matches[i];
          const localState = state.nest(item.schema, `match.${i}`);
          localState.snapshot();
          const result = item.schema.$_validate(value, localState, prefs);
          if (!result.errors) {
            ++hits;
            matched = result.value;
          } else {
            localState.restore();
          }
        }
        if (!hits) {
          return { errors: error("alternatives.any") };
        }
        if (schema._flags.match === "one") {
          return hits === 1 ? { value: matched } : { errors: error("alternatives.one") };
        }
        return hits === schema.$_terms.matches.length ? { value } : { errors: error("alternatives.all") };
      }
      const errors = [];
      for (let i = 0;i < schema.$_terms.matches.length; ++i) {
        const item = schema.$_terms.matches[i];
        if (item.schema) {
          const localState = state.nest(item.schema, `match.${i}`);
          localState.snapshot();
          const result = item.schema.$_validate(value, localState, prefs);
          if (!result.errors) {
            return result;
          }
          localState.restore();
          errors.push({ schema: item.schema, reports: result.errors });
          continue;
        }
        const input = item.ref ? item.ref.resolve(value, state, prefs) : value;
        const tests = item.is ? [item] : item.switch;
        for (let j = 0;j < tests.length; ++j) {
          const test = tests[j];
          const { is, then, otherwise } = test;
          const id = `match.${i}${item.switch ? "." + j : ""}`;
          if (!is.$_match(input, state.nest(is, `${id}.is`), prefs)) {
            if (otherwise) {
              return otherwise.$_validate(value, state.nest(otherwise, `${id}.otherwise`), prefs);
            }
          } else if (then) {
            return then.$_validate(value, state.nest(then, `${id}.then`), prefs);
          }
        }
      }
      return internals.errors(errors, helpers);
    },
    rules: {
      conditional: {
        method(condition, options) {
          Assert(!this._flags._endedSwitch, "Unreachable condition");
          Assert(!this._flags.match, "Cannot combine match mode", this._flags.match, "with conditional rule");
          Assert(options.break === undefined, "Cannot use break option with alternatives conditional");
          const obj = this.clone();
          const match = Compile.when(obj, condition, options);
          const conditions = match.is ? [match] : match.switch;
          for (const item of conditions) {
            if (item.then && item.otherwise) {
              obj.$_setFlag("_endedSwitch", true, { clone: false });
              break;
            }
          }
          obj.$_terms.matches.push(match);
          return obj.$_mutateRebuild();
        }
      },
      match: {
        method(mode) {
          Assert(["any", "one", "all"].includes(mode), "Invalid alternatives match mode", mode);
          if (mode !== "any") {
            for (const match of this.$_terms.matches) {
              Assert(match.schema, "Cannot combine match mode", mode, "with conditional rules");
            }
          }
          return this.$_setFlag("match", mode);
        }
      },
      try: {
        method(...schemas) {
          Assert(schemas.length, "Missing alternative schemas");
          Common.verifyFlat(schemas, "try");
          Assert(!this._flags._endedSwitch, "Unreachable condition");
          const obj = this.clone();
          for (const schema of schemas) {
            obj.$_terms.matches.push({ schema: obj.$_compile(schema) });
          }
          return obj.$_mutateRebuild();
        }
      }
    },
    rebuild(schema) {
      const each = (item) => {
        if (Common.isSchema(item) && item.type === "array") {
          schema.$_setFlag("_arrayItems", true, { clone: false });
        }
      };
      schema.$_modify({ each });
    },
    messages: {
      "alternatives.all": "{{#label}} does not match all of the required types",
      "alternatives.any": "{{#label}} does not match any of the allowed types",
      "alternatives.match": "{{#label}} does not match any of the allowed types",
      "alternatives.one": "{{#label}} matches more than one allowed type",
      "alternatives.types": "{{#label}} must be one of {{#types}}"
    }
  });
  internals.errors = function(failures, { error, state }) {
    if (!failures.length) {
      return { errors: error("alternatives.any") };
    }
    if (failures.length === 1) {
      return { errors: failures[0].reports };
    }
    const valids = new Set;
    const complex = [];
    for (const { reports, schema } of failures) {
      if (reports.length > 1) {
        return internals.unmatched(failures, error);
      }
      const report = reports[0];
      if (report instanceof Errors.Report === false) {
        return internals.unmatched(failures, error);
      }
      if (report.state.path.length !== state.path.length) {
        complex.push({ type: schema.type, report });
        continue;
      }
      if (report.code === "any.only") {
        for (const valid of report.local.valids) {
          valids.add(valid);
        }
        continue;
      }
      const [type, code] = report.code.split(".");
      if (code !== "base") {
        complex.push({ type: schema.type, report });
        continue;
      }
      valids.add(type);
    }
    if (!complex.length) {
      return { errors: error("alternatives.types", { types: [...valids] }) };
    }
    if (complex.length === 1) {
      return { errors: complex[0].report };
    }
    return internals.unmatched(failures, error);
  };
  internals.unmatched = function(failures, error) {
    const errors = [];
    for (const failure of failures) {
      errors.push(...failure.reports);
    }
    return { errors: error("alternatives.match", Errors.details(errors, { override: false })) };
  };
});

// node_modules/@hapi/validate/lib/types/array.js
var require_array = __commonJS((exports, module) => {
  var Assert = require_assert();
  var DeepEqual = require_deepEqual();
  var Reach = require_reach();
  var Any = require_any();
  var Common = require_common();
  var Compile = require_compile();
  var internals = {};
  module.exports = Any._extend({
    type: "array",
    flags: {
      single: { default: false },
      sparse: { default: false }
    },
    terms: {
      items: { init: [] },
      ordered: { init: [] },
      _exclusions: { init: [] },
      _inclusions: { init: [] },
      _requireds: { init: [] }
    },
    coerce: {
      from: "object",
      method(value, { schema, state, prefs }) {
        if (!Array.isArray(value)) {
          return;
        }
        const sort = schema.$_getRule("sort");
        if (!sort) {
          return;
        }
        return internals.sort(schema, value, sort.args.options, state, prefs);
      }
    },
    validate(value, { schema, error }) {
      if (!Array.isArray(value)) {
        if (schema._flags.single) {
          const single = [value];
          single[Common.symbols.arraySingle] = true;
          return { value: single };
        }
        return { errors: error("array.base") };
      }
      if (!schema.$_getRule("items")) {
        return;
      }
      return { value: value.slice() };
    },
    rules: {
      has: {
        method(schema) {
          schema = this.$_compile(schema, { appendPath: true });
          const obj = this.$_addRule({ name: "has", args: { schema } });
          obj.$_mutateRegister(schema);
          return obj;
        },
        validate(value, { state, prefs, error }, { schema: has }) {
          const ancestors = [value, ...state.ancestors];
          for (let i = 0;i < value.length; ++i) {
            const localState = state.localize([...state.path, i], ancestors, has);
            if (has.$_match(value[i], localState, prefs)) {
              return value;
            }
          }
          return error("array.hasUnknown", null);
        },
        multi: true
      },
      items: {
        method(...schemas) {
          Common.verifyFlat(schemas, "items");
          const obj = this.$_addRule("items");
          for (let i = 0;i < schemas.length; ++i) {
            const type = Common.tryWithPath(() => this.$_compile(schemas[i]), i, { append: true });
            obj.$_terms.items.push(type);
          }
          return obj.$_mutateRebuild();
        },
        validate(value, { schema, error, state, prefs, errorsArray }) {
          const requireds = schema.$_terms._requireds.slice();
          const ordereds = schema.$_terms.ordered.slice();
          const inclusions = [...schema.$_terms._inclusions, ...requireds];
          const wasArray = !value[Common.symbols.arraySingle];
          delete value[Common.symbols.arraySingle];
          const errors = errorsArray();
          let il = value.length;
          for (let i = 0;i < il; ++i) {
            const item = value[i];
            let errored = false;
            let isValid = false;
            const key = wasArray ? i : new Number(i);
            const path = [...state.path, key];
            if (!schema._flags.sparse && item === undefined) {
              errors.push(error("array.sparse", { key, path, pos: i, value: undefined }, state.localize(path)));
              if (prefs.abortEarly) {
                return errors;
              }
              ordereds.shift();
              continue;
            }
            const ancestors = [value, ...state.ancestors];
            for (const exclusion of schema.$_terms._exclusions) {
              if (!exclusion.$_match(item, state.localize(path, ancestors, exclusion), prefs, { presence: "ignore" })) {
                continue;
              }
              errors.push(error("array.excludes", { pos: i, value: item }, state.localize(path)));
              if (prefs.abortEarly) {
                return errors;
              }
              errored = true;
              ordereds.shift();
              break;
            }
            if (errored) {
              continue;
            }
            if (schema.$_terms.ordered.length) {
              if (ordereds.length) {
                const ordered = ordereds.shift();
                const res = ordered.$_validate(item, state.localize(path, ancestors, ordered), prefs);
                if (!res.errors) {
                  if (ordered._flags.result === "strip") {
                    internals.fastSplice(value, i);
                    --i;
                    --il;
                  } else if (!schema._flags.sparse && res.value === undefined) {
                    errors.push(error("array.sparse", { key, path, pos: i, value: undefined }, state.localize(path)));
                    if (prefs.abortEarly) {
                      return errors;
                    }
                    continue;
                  } else {
                    value[i] = res.value;
                  }
                } else {
                  errors.push(...res.errors);
                  if (prefs.abortEarly) {
                    return errors;
                  }
                }
                continue;
              } else if (!schema.$_terms.items.length) {
                errors.push(error("array.orderedLength", { pos: i, limit: schema.$_terms.ordered.length }));
                if (prefs.abortEarly) {
                  return errors;
                }
                break;
              }
            }
            const requiredChecks = [];
            let jl = requireds.length;
            for (let j = 0;j < jl; ++j) {
              const localState = state.localize(path, ancestors, requireds[j]);
              localState.snapshot();
              const res = requireds[j].$_validate(item, localState, prefs);
              requiredChecks[j] = res;
              if (!res.errors) {
                value[i] = res.value;
                isValid = true;
                internals.fastSplice(requireds, j);
                --j;
                --jl;
                if (!schema._flags.sparse && res.value === undefined) {
                  errors.push(error("array.sparse", { key, path, pos: i, value: undefined }, state.localize(path)));
                  if (prefs.abortEarly) {
                    return errors;
                  }
                }
                break;
              }
              localState.restore();
            }
            if (isValid) {
              continue;
            }
            const stripUnknown = prefs.stripUnknown && !!prefs.stripUnknown.arrays || false;
            jl = inclusions.length;
            for (const inclusion of inclusions) {
              let res;
              const previousCheck = requireds.indexOf(inclusion);
              if (previousCheck !== -1) {
                res = requiredChecks[previousCheck];
              } else {
                const localState = state.localize(path, ancestors, inclusion);
                localState.snapshot();
                res = inclusion.$_validate(item, localState, prefs);
                if (!res.errors) {
                  if (inclusion._flags.result === "strip") {
                    internals.fastSplice(value, i);
                    --i;
                    --il;
                  } else if (!schema._flags.sparse && res.value === undefined) {
                    errors.push(error("array.sparse", { key, path, pos: i, value: undefined }, state.localize(path)));
                    errored = true;
                  } else {
                    value[i] = res.value;
                  }
                  isValid = true;
                  break;
                }
                localState.restore();
              }
              if (jl === 1) {
                if (stripUnknown) {
                  internals.fastSplice(value, i);
                  --i;
                  --il;
                  isValid = true;
                  break;
                }
                errors.push(...res.errors);
                if (prefs.abortEarly) {
                  return errors;
                }
                errored = true;
                break;
              }
            }
            if (errored) {
              continue;
            }
            if (schema.$_terms._inclusions.length && !isValid) {
              if (stripUnknown) {
                internals.fastSplice(value, i);
                --i;
                --il;
                continue;
              }
              errors.push(error("array.includes", { pos: i, value: item }, state.localize(path)));
              if (prefs.abortEarly) {
                return errors;
              }
            }
          }
          if (requireds.length) {
            internals.fillMissedErrors(schema, errors, requireds, value, state, prefs);
          }
          if (ordereds.length) {
            internals.fillOrderedErrors(schema, errors, ordereds, value, state, prefs);
          }
          return errors.length ? errors : value;
        },
        priority: true
      },
      length: {
        method(limit) {
          return this.$_addRule({ name: "length", args: { limit }, operator: "=" });
        },
        validate(value, helpers, { limit }, { name, operator, args }) {
          if (Common.compare(value.length, limit, operator)) {
            return value;
          }
          return helpers.error("array." + name, { limit: args.limit, value });
        },
        args: [
          {
            name: "limit",
            ref: true,
            assert: Common.limit,
            message: "must be a positive integer"
          }
        ]
      },
      max: {
        method(limit) {
          return this.$_addRule({ name: "max", method: "length", args: { limit }, operator: "<=" });
        }
      },
      min: {
        method(limit) {
          return this.$_addRule({ name: "min", method: "length", args: { limit }, operator: ">=" });
        }
      },
      ordered: {
        method(...schemas) {
          Common.verifyFlat(schemas, "ordered");
          const obj = this.$_addRule("items");
          for (let i = 0;i < schemas.length; ++i) {
            const type = Common.tryWithPath(() => this.$_compile(schemas[i]), i, { append: true });
            internals.validateSingle(type, obj);
            obj.$_mutateRegister(type);
            obj.$_terms.ordered.push(type);
          }
          return obj.$_mutateRebuild();
        }
      },
      single: {
        method(enabled) {
          const value = enabled === undefined ? true : !!enabled;
          Assert(!value || !this._flags._arrayItems, "Cannot specify single rule when array has array items");
          return this.$_setFlag("single", value);
        }
      },
      sort: {
        method(options = {}) {
          Common.assertOptions(options, ["by", "order"]);
          const settings = {
            order: options.order || "ascending"
          };
          if (options.by) {
            settings.by = Compile.ref(options.by, { ancestor: 0 });
            Assert(!settings.by.ancestor, "Cannot sort by ancestor");
          }
          return this.$_addRule({ name: "sort", args: { options: settings } });
        },
        validate(value, { error, state, prefs, schema }, { options }) {
          const { value: sorted, errors } = internals.sort(schema, value, options, state, prefs);
          if (errors) {
            return errors;
          }
          for (let i = 0;i < value.length; ++i) {
            if (value[i] !== sorted[i]) {
              return error("array.sort", { order: options.order, by: options.by ? options.by.key : "value" });
            }
          }
          return value;
        },
        convert: true
      },
      sparse: {
        method(enabled) {
          const value = enabled === undefined ? true : !!enabled;
          if (this._flags.sparse === value) {
            return this;
          }
          const obj = value ? this.clone() : this.$_addRule("items");
          return obj.$_setFlag("sparse", value, { clone: false });
        }
      },
      unique: {
        method(comparator, options = {}) {
          Assert(!comparator || typeof comparator === "function" || typeof comparator === "string", "comparator must be a function or a string");
          Common.assertOptions(options, ["ignoreUndefined", "separator"]);
          const rule = { name: "unique", args: { options, comparator } };
          if (comparator) {
            if (typeof comparator === "string") {
              const separator = Common.default(options.separator, ".");
              rule.path = separator ? comparator.split(separator) : [comparator];
            } else {
              rule.comparator = comparator;
            }
          }
          return this.$_addRule(rule);
        },
        validate(value, { state, error, schema }, { comparator: raw, options }, { comparator, path }) {
          const found = {
            string: Object.create(null),
            number: Object.create(null),
            undefined: Object.create(null),
            boolean: Object.create(null),
            object: new Map,
            function: new Map,
            custom: new Map
          };
          const compare = comparator || DeepEqual;
          const ignoreUndefined = options.ignoreUndefined;
          for (let i = 0;i < value.length; ++i) {
            const item = path ? Reach(value[i], path) : value[i];
            const records = comparator ? found.custom : found[typeof item];
            Assert(records, "Failed to find unique map container for type", typeof item);
            if (records instanceof Map) {
              const entries = records.entries();
              let current;
              while (!(current = entries.next()).done) {
                if (compare(current.value[0], item)) {
                  const localState = state.localize([...state.path, i], [value, ...state.ancestors]);
                  const context = {
                    pos: i,
                    value: value[i],
                    dupePos: current.value[1],
                    dupeValue: value[current.value[1]]
                  };
                  if (path) {
                    context.path = raw;
                  }
                  return error("array.unique", context, localState);
                }
              }
              records.set(item, i);
            } else {
              if ((!ignoreUndefined || item !== undefined) && records[item] !== undefined) {
                const context = {
                  pos: i,
                  value: value[i],
                  dupePos: records[item],
                  dupeValue: value[records[item]]
                };
                if (path) {
                  context.path = raw;
                }
                const localState = state.localize([...state.path, i], [value, ...state.ancestors]);
                return error("array.unique", context, localState);
              }
              records[item] = i;
            }
          }
          return value;
        },
        args: ["comparator", "options"],
        multi: true
      }
    },
    cast: {
      set: {
        from: Array.isArray,
        to(value, helpers) {
          return new Set(value);
        }
      }
    },
    rebuild(schema) {
      schema.$_terms._inclusions = [];
      schema.$_terms._exclusions = [];
      schema.$_terms._requireds = [];
      for (const type of schema.$_terms.items) {
        internals.validateSingle(type, schema);
        if (type._flags.presence === "required") {
          schema.$_terms._requireds.push(type);
        } else if (type._flags.presence === "forbidden") {
          schema.$_terms._exclusions.push(type);
        } else {
          schema.$_terms._inclusions.push(type);
        }
      }
      for (const type of schema.$_terms.ordered) {
        internals.validateSingle(type, schema);
      }
    },
    messages: {
      "array.base": "{{#label}} must be an array",
      "array.excludes": "{{#label}} contains an excluded value",
      "array.hasUnknown": "{{#label}} does not contain at least one required match",
      "array.includes": "{{#label}} does not match any of the allowed types",
      "array.includesRequiredBoth": "{{#label}} does not contain {{#knownMisses}} and {{#unknownMisses}} other required value(s)",
      "array.includesRequiredKnowns": "{{#label}} does not contain {{#knownMisses}}",
      "array.includesRequiredUnknowns": "{{#label}} does not contain {{#unknownMisses}} required value(s)",
      "array.length": "{{#label}} must contain {{#limit}} items",
      "array.max": "{{#label}} must contain less than or equal to {{#limit}} items",
      "array.min": "{{#label}} must contain at least {{#limit}} items",
      "array.orderedLength": "{{#label}} must contain at most {{#limit}} items",
      "array.sort": "{{#label}} must be sorted in {#order} order by {{#by}}",
      "array.sort.mismatching": "{{#label}} cannot be sorted due to mismatching types",
      "array.sort.unsupported": "{{#label}} cannot be sorted due to unsupported type {#type}",
      "array.sparse": "{{#label}} must not be a sparse array item",
      "array.unique": "{{#label}} contains a duplicate value"
    }
  });
  internals.fillMissedErrors = function(schema, errors, requireds, value, state, prefs) {
    let unknownMisses = 0;
    for (let i = 0;i < requireds.length; ++i) {
      ++unknownMisses;
    }
    errors.push(schema.$_createError("array.includesRequiredUnknowns", value, { unknownMisses }, state, prefs));
  };
  internals.fillOrderedErrors = function(schema, errors, ordereds, value, state, prefs) {
    const requiredOrdereds = [];
    for (const ordered of ordereds) {
      if (ordered._flags.presence === "required") {
        requiredOrdereds.push(ordered);
      }
    }
    if (requiredOrdereds.length) {
      internals.fillMissedErrors(schema, errors, requiredOrdereds, value, state, prefs);
    }
  };
  internals.fastSplice = function(arr, i) {
    let pos = i;
    while (pos < arr.length) {
      arr[pos++] = arr[pos];
    }
    --arr.length;
  };
  internals.validateSingle = function(type, obj) {
    if (type.type === "array" || type._flags._arrayItems) {
      Assert(!obj._flags.single, "Cannot specify array item with single rule enabled");
      obj.$_setFlag("_arrayItems", true, { clone: false });
    }
  };
  internals.sort = function(schema, value, settings, state, prefs) {
    const order = settings.order === "ascending" ? 1 : -1;
    const aFirst = -1 * order;
    const bFirst = order;
    const sort = (a, b) => {
      let compare = internals.compare(a, b, aFirst, bFirst);
      if (compare !== null) {
        return compare;
      }
      if (settings.by) {
        a = settings.by.resolve(a, state, prefs);
        b = settings.by.resolve(b, state, prefs);
      }
      compare = internals.compare(a, b, aFirst, bFirst);
      if (compare !== null) {
        return compare;
      }
      const type = typeof a;
      if (type !== typeof b) {
        throw schema.$_createError("array.sort.mismatching", value, null, state, prefs);
      }
      if (type !== "number" && type !== "string") {
        throw schema.$_createError("array.sort.unsupported", value, { type }, state, prefs);
      }
      if (type === "number") {
        return (a - b) * order;
      }
      return a < b ? aFirst : bFirst;
    };
    try {
      return { value: value.slice().sort(sort) };
    } catch (err) {
      return { errors: err };
    }
  };
  internals.compare = function(a, b, aFirst, bFirst) {
    if (a === b) {
      return 0;
    }
    if (a === undefined) {
      return 1;
    }
    if (b === undefined) {
      return -1;
    }
    if (a === null) {
      return bFirst;
    }
    if (b === null) {
      return aFirst;
    }
    return null;
  };
});

// node_modules/@hapi/validate/lib/types/boolean.js
var require_boolean = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  var Values = require_values();
  var internals = {};
  internals.isBool = function(value) {
    return typeof value === "boolean";
  };
  module.exports = Any._extend({
    type: "boolean",
    flags: {
      sensitive: { default: false }
    },
    terms: {
      falsy: {
        init: null
      },
      truthy: {
        init: null
      }
    },
    coerce(value, { schema }) {
      if (typeof value === "boolean") {
        return;
      }
      if (typeof value === "string") {
        const normalized = schema._flags.sensitive ? value : value.toLowerCase();
        value = normalized === "true" ? true : normalized === "false" ? false : value;
      }
      if (typeof value !== "boolean") {
        value = schema.$_terms.truthy?.has(value, null, null, !schema._flags.sensitive) || (schema.$_terms.falsy?.has(value, null, null, !schema._flags.sensitive) ? false : value);
      }
      return { value };
    },
    validate(value, { error }) {
      if (typeof value !== "boolean") {
        return { value, errors: error("boolean.base") };
      }
    },
    rules: {
      truthy: {
        method(...values) {
          Common.verifyFlat(values, "truthy");
          const obj = this.clone();
          obj.$_terms.truthy = obj.$_terms.truthy || new Values;
          for (let i = 0;i < values.length; ++i) {
            const value = values[i];
            Assert(value !== undefined, "Cannot call truthy with undefined");
            obj.$_terms.truthy.add(value);
          }
          return obj;
        }
      },
      falsy: {
        method(...values) {
          Common.verifyFlat(values, "falsy");
          const obj = this.clone();
          obj.$_terms.falsy = obj.$_terms.falsy || new Values;
          for (let i = 0;i < values.length; ++i) {
            const value = values[i];
            Assert(value !== undefined, "Cannot call falsy with undefined");
            obj.$_terms.falsy.add(value);
          }
          return obj;
        }
      },
      sensitive: {
        method(enabled = true) {
          return this.$_setFlag("sensitive", enabled);
        }
      }
    },
    cast: {
      number: {
        from: internals.isBool,
        to(value, helpers) {
          return value ? 1 : 0;
        }
      },
      string: {
        from: internals.isBool,
        to(value, helpers) {
          return value ? "true" : "false";
        }
      }
    },
    messages: {
      "boolean.base": "{{#label}} must be a boolean"
    }
  });
});

// node_modules/@hapi/validate/lib/types/date.js
var require_date = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  var Template = require_template();
  var internals = {};
  internals.isDate = function(value) {
    return value instanceof Date;
  };
  module.exports = Any._extend({
    type: "date",
    coerce: {
      from: ["number", "string"],
      method(value, { schema }) {
        return { value: internals.parse(value, schema._flags.format) || value };
      }
    },
    validate(value, { schema, error, prefs }) {
      if (value instanceof Date && !isNaN(value.getTime())) {
        return;
      }
      const format = schema._flags.format;
      if (!prefs.convert || !format || typeof value !== "string") {
        return { value, errors: error("date.base") };
      }
      return { value, errors: error("date.format", { format }) };
    },
    rules: {
      compare: {
        method: false,
        validate(value, helpers, { date }, { name, operator, args }) {
          const to = date === "now" ? Date.now() : date.getTime();
          if (Common.compare(value.getTime(), to, operator)) {
            return value;
          }
          return helpers.error("date." + name, { limit: args.date, value });
        },
        args: [
          {
            name: "date",
            ref: true,
            normalize: (date) => {
              return date === "now" ? date : internals.parse(date);
            },
            assert: (date) => date !== null,
            message: "must have a valid date format"
          }
        ]
      },
      format: {
        method(format) {
          Assert(["iso", "javascript", "unix"].includes(format), "Unknown date format", format);
          return this.$_setFlag("format", format);
        }
      },
      greater: {
        method(date) {
          return this.$_addRule({ name: "greater", method: "compare", args: { date }, operator: ">" });
        }
      },
      iso: {
        method() {
          return this.format("iso");
        }
      },
      less: {
        method(date) {
          return this.$_addRule({ name: "less", method: "compare", args: { date }, operator: "<" });
        }
      },
      max: {
        method(date) {
          return this.$_addRule({ name: "max", method: "compare", args: { date }, operator: "<=" });
        }
      },
      min: {
        method(date) {
          return this.$_addRule({ name: "min", method: "compare", args: { date }, operator: ">=" });
        }
      },
      timestamp: {
        method(type = "javascript") {
          Assert(["javascript", "unix"].includes(type), '"type" must be one of "javascript, unix"');
          return this.format(type);
        }
      }
    },
    cast: {
      number: {
        from: internals.isDate,
        to(value, helpers) {
          return value.getTime();
        }
      },
      string: {
        from: internals.isDate,
        to(value, { prefs }) {
          return Template.date(value, prefs);
        }
      }
    },
    messages: {
      "date.base": "{{#label}} must be a valid date",
      "date.format": "{{#label}} must be in {{#format}} format",
      "date.greater": "{{#label}} must be greater than {{:#limit}}",
      "date.less": "{{#label}} must be less than {{:#limit}}",
      "date.max": "{{#label}} must be less than or equal to {{:#limit}}",
      "date.min": "{{#label}} must be greater than or equal to {{:#limit}}"
    }
  });
  internals.parse = function(value, format) {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value !== "string" && (isNaN(value) || !isFinite(value))) {
      return null;
    }
    if (/^\s*$/.test(value)) {
      return null;
    }
    if (format === "iso") {
      if (!Common.isIsoDate(value)) {
        return null;
      }
      return internals.date(value.toString());
    }
    const original = value;
    if (typeof value === "string" && /^[+-]?\d+(\.\d+)?$/.test(value)) {
      value = parseFloat(value);
    }
    if (format) {
      if (format === "javascript") {
        return internals.date(1 * value);
      }
      if (format === "unix") {
        return internals.date(1000 * value);
      }
      if (typeof original === "string") {
        return null;
      }
    }
    return internals.date(value);
  };
  internals.date = function(value) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  };
});

// node_modules/@hapi/topo/lib/index.js
var require_lib2 = __commonJS((exports) => {
  var { assert } = require_lib();
  var internals = {};
  exports.Sorter = class {
    constructor() {
      this._items = [];
      this.nodes = [];
    }
    add(nodes, options) {
      options = options ?? {};
      const before = [].concat(options.before ?? []);
      const after = [].concat(options.after ?? []);
      const group = options.group ?? "?";
      const sort = options.sort ?? 0;
      assert(!before.includes(group), `Item cannot come before itself: ${group}`);
      assert(!before.includes("?"), "Item cannot come before unassociated items");
      assert(!after.includes(group), `Item cannot come after itself: ${group}`);
      assert(!after.includes("?"), "Item cannot come after unassociated items");
      if (!Array.isArray(nodes)) {
        nodes = [nodes];
      }
      for (const node of nodes) {
        const item = {
          seq: this._items.length,
          sort,
          before,
          after,
          group,
          node
        };
        this._items.push(item);
      }
      if (!options.manual) {
        const valid = this._sort();
        assert(valid, "item", group !== "?" ? `added into group ${group}` : "", "created a dependencies error");
      }
      return this.nodes;
    }
    merge(others) {
      if (!Array.isArray(others)) {
        others = [others];
      }
      for (const other of others) {
        if (other) {
          for (const item of other._items) {
            this._items.push(Object.assign({}, item));
          }
        }
      }
      this._items.sort(internals.mergeSort);
      for (let i = 0;i < this._items.length; ++i) {
        this._items[i].seq = i;
      }
      const valid = this._sort();
      assert(valid, "merge created a dependencies error");
      return this.nodes;
    }
    sort() {
      const valid = this._sort();
      assert(valid, "sort created a dependencies error");
      return this.nodes;
    }
    _sort() {
      const graph = {};
      const graphAfters = Object.create(null);
      const groups = Object.create(null);
      for (const item of this._items) {
        const seq = item.seq;
        const group = item.group;
        groups[group] = groups[group] ?? [];
        groups[group].push(seq);
        graph[seq] = item.before;
        for (const after of item.after) {
          graphAfters[after] = graphAfters[after] ?? [];
          graphAfters[after].push(seq);
        }
      }
      for (const node in graph) {
        const expandedGroups = [];
        for (const graphNodeItem in graph[node]) {
          const group = graph[node][graphNodeItem];
          groups[group] = groups[group] ?? [];
          expandedGroups.push(...groups[group]);
        }
        graph[node] = expandedGroups;
      }
      for (const group in graphAfters) {
        if (groups[group]) {
          for (const node of groups[group]) {
            graph[node].push(...graphAfters[group]);
          }
        }
      }
      const ancestors = {};
      for (const node in graph) {
        const children = graph[node];
        for (const child of children) {
          ancestors[child] = ancestors[child] ?? [];
          ancestors[child].push(node);
        }
      }
      const visited = {};
      const sorted = [];
      for (let i = 0;i < this._items.length; ++i) {
        let next = i;
        if (ancestors[i]) {
          next = null;
          for (let j = 0;j < this._items.length; ++j) {
            if (visited[j] === true) {
              continue;
            }
            if (!ancestors[j]) {
              ancestors[j] = [];
            }
            const shouldSeeCount = ancestors[j].length;
            let seenCount = 0;
            for (let k = 0;k < shouldSeeCount; ++k) {
              if (visited[ancestors[j][k]]) {
                ++seenCount;
              }
            }
            if (seenCount === shouldSeeCount) {
              next = j;
              break;
            }
          }
        }
        if (next !== null) {
          visited[next] = true;
          sorted.push(next);
        }
      }
      if (sorted.length !== this._items.length) {
        return false;
      }
      const seqIndex = {};
      for (const item of this._items) {
        seqIndex[item.seq] = item;
      }
      this._items = [];
      this.nodes = [];
      for (const value of sorted) {
        const sortedItem = seqIndex[value];
        this.nodes.push(sortedItem.node);
        this._items.push(sortedItem);
      }
      return true;
    }
  };
  internals.mergeSort = (a, b) => {
    return a.sort === b.sort ? 0 : a.sort < b.sort ? -1 : 1;
  };
});

// node_modules/@hapi/validate/lib/types/keys.js
var require_keys = __commonJS((exports, module) => {
  var ApplyToDefaults = require_applyToDefaults();
  var Assert = require_assert();
  var Clone = require_clone();
  var Topo = require_lib2();
  var Any = require_any();
  var Common = require_common();
  var Compile = require_compile();
  var Errors = require_errors();
  var Ref = require_ref();
  var internals = {
    renameDefaults: {
      alias: false,
      multiple: false,
      override: false
    }
  };
  module.exports = Any._extend({
    type: "_keys",
    properties: {
      typeof: "object"
    },
    flags: {
      unknown: { default: false }
    },
    terms: {
      dependencies: { init: null },
      keys: { init: null },
      patterns: { init: null },
      renames: { init: null }
    },
    args(schema, keys) {
      return schema.keys(keys);
    },
    validate(value, { schema, error, state, prefs }) {
      if (!value || typeof value !== schema.$_property("typeof") || Array.isArray(value)) {
        return { value, errors: error("object.base", { type: schema.$_property("typeof") }) };
      }
      if (!schema.$_terms.renames && !schema.$_terms.dependencies && !schema.$_terms.keys && !schema.$_terms.patterns) {
        return;
      }
      value = internals.clone(value, prefs);
      const errors = [];
      if (schema.$_terms.renames && !internals.rename(schema, value, state, prefs, errors)) {
        return { value, errors };
      }
      if (!schema.$_terms.keys && !schema.$_terms.patterns && !schema.$_terms.dependencies) {
        return { value, errors };
      }
      const unprocessed = new Set(Object.keys(value));
      if (schema.$_terms.keys) {
        const ancestors = [value, ...state.ancestors];
        for (const child of schema.$_terms.keys) {
          const key = child.key;
          const item = value[key];
          unprocessed.delete(key);
          const localState = state.localize([...state.path, key], ancestors, child);
          const result = child.schema.$_validate(item, localState, prefs);
          if (result.errors) {
            if (prefs.abortEarly) {
              return { value, errors: result.errors };
            }
            errors.push(...result.errors);
          } else if (child.schema._flags.result === "strip" || result.value === undefined && item !== undefined) {
            delete value[key];
          } else if (result.value !== undefined) {
            value[key] = result.value;
          }
        }
      }
      if (unprocessed.size || schema._flags._hasPatternMatch) {
        const early = internals.unknown(schema, value, unprocessed, errors, state, prefs);
        if (early) {
          return early;
        }
      }
      if (schema.$_terms.dependencies) {
        for (const dep of schema.$_terms.dependencies) {
          if (dep.key && dep.key.resolve(value, state, prefs, null, { shadow: false }) === undefined) {
            continue;
          }
          const failed = internals.dependencies[dep.rel](schema, dep, value, state, prefs);
          if (failed) {
            const report = schema.$_createError(failed.code, value, failed.context, state, prefs);
            if (prefs.abortEarly) {
              return { value, errors: report };
            }
            errors.push(report);
          }
        }
      }
      return { value, errors };
    },
    rules: {
      and: {
        method(...peers) {
          Common.verifyFlat(peers, "and");
          return internals.dependency(this, "and", null, peers);
        }
      },
      append: {
        method(schema) {
          if (schema === null || schema === undefined || Object.keys(schema).length === 0) {
            return this;
          }
          return this.keys(schema);
        }
      },
      assert: {
        method(subject, schema, message) {
          subject = Compile.ref(subject);
          Assert(message === undefined || typeof message === "string", "Message must be a string");
          schema = this.$_compile(schema, { appendPath: true });
          const obj = this.$_addRule({ name: "assert", args: { subject, schema, message } });
          obj.$_mutateRegister(subject);
          obj.$_mutateRegister(schema);
          return obj;
        },
        validate(value, { error, prefs, state }, { subject, schema, message }) {
          const about = subject.resolve(value, state, prefs);
          const path = subject.absolute(state);
          if (schema.$_match(about, state.localize(path, [value, ...state.ancestors], schema), prefs)) {
            return value;
          }
          return error("object.assert", { subject, message });
        },
        args: ["subject", "schema", "message"],
        multi: true
      },
      instance: {
        method(constructor, name) {
          Assert(typeof constructor === "function", "constructor must be a function");
          name = name || constructor.name;
          return this.$_addRule({ name: "instance", args: { constructor, name } });
        },
        validate(value, helpers, { constructor, name }) {
          if (value instanceof constructor) {
            return value;
          }
          return helpers.error("object.instance", { type: name, value });
        },
        args: ["constructor", "name"]
      },
      keys: {
        method(schema) {
          Assert(schema === undefined || typeof schema === "object", "Object schema must be a valid object");
          Assert(!Common.isSchema(schema), "Object schema cannot be a joi schema");
          const obj = this.clone();
          if (!schema) {
            obj.$_terms.keys = null;
          } else if (!Object.keys(schema).length) {
            obj.$_terms.keys = new internals.Keys;
          } else {
            obj.$_terms.keys = obj.$_terms.keys ? obj.$_terms.keys.filter((child) => !schema.hasOwnProperty(child.key)) : new internals.Keys;
            for (const key in schema) {
              Common.tryWithPath(() => obj.$_terms.keys.push({ key, schema: this.$_compile(schema[key]) }), key);
            }
          }
          return obj.$_mutateRebuild();
        }
      },
      length: {
        method(limit) {
          return this.$_addRule({ name: "length", args: { limit }, operator: "=" });
        },
        validate(value, helpers, { limit }, { name, operator, args }) {
          if (Common.compare(Object.keys(value).length, limit, operator)) {
            return value;
          }
          return helpers.error("object." + name, { limit: args.limit, value });
        },
        args: [
          {
            name: "limit",
            ref: true,
            assert: Common.limit,
            message: "must be a positive integer"
          }
        ]
      },
      max: {
        method(limit) {
          return this.$_addRule({ name: "max", method: "length", args: { limit }, operator: "<=" });
        }
      },
      min: {
        method(limit) {
          return this.$_addRule({ name: "min", method: "length", args: { limit }, operator: ">=" });
        }
      },
      nand: {
        method(...peers) {
          Common.verifyFlat(peers, "nand");
          return internals.dependency(this, "nand", null, peers);
        }
      },
      or: {
        method(...peers) {
          Common.verifyFlat(peers, "or");
          return internals.dependency(this, "or", null, peers);
        }
      },
      oxor: {
        method(...peers) {
          return internals.dependency(this, "oxor", null, peers);
        }
      },
      pattern: {
        method(pattern, schema, options = {}) {
          const isRegExp = pattern instanceof RegExp;
          if (!isRegExp) {
            pattern = this.$_compile(pattern, { appendPath: true });
          }
          Assert(schema !== undefined, "Invalid rule");
          Common.assertOptions(options, ["fallthrough", "matches"]);
          if (isRegExp) {
            Assert(!pattern.flags.includes("g") && !pattern.flags.includes("y"), "pattern should not use global or sticky mode");
          }
          schema = this.$_compile(schema, { appendPath: true });
          const obj = this.clone();
          obj.$_terms.patterns = obj.$_terms.patterns || [];
          const config = { [isRegExp ? "regex" : "schema"]: pattern, rule: schema };
          if (options.matches) {
            config.matches = this.$_compile(options.matches);
            if (config.matches.type !== "array") {
              config.matches = config.matches.$_root.array().items(config.matches);
            }
            obj.$_mutateRegister(config.matches);
            obj.$_setFlag("_hasPatternMatch", true, { clone: false });
          }
          if (options.fallthrough) {
            config.fallthrough = true;
          }
          obj.$_terms.patterns.push(config);
          obj.$_mutateRegister(schema);
          return obj;
        }
      },
      ref: {
        method() {
          return this.$_addRule("ref");
        },
        validate(value, helpers) {
          if (Ref.isRef(value)) {
            return value;
          }
          return helpers.error("object.refType", { value });
        }
      },
      regex: {
        method() {
          return this.$_addRule("regex");
        },
        validate(value, helpers) {
          if (value instanceof RegExp) {
            return value;
          }
          return helpers.error("object.regex", { value });
        }
      },
      rename: {
        method(from, to, options = {}) {
          Assert(typeof from === "string" || from instanceof RegExp, "Rename missing the from argument");
          Assert(typeof to === "string", "Invalid rename to argument");
          Assert(to !== from, "Cannot rename key to same name:", from);
          Common.assertOptions(options, ["alias", "ignoreUndefined", "override", "multiple"]);
          const obj = this.clone();
          obj.$_terms.renames = obj.$_terms.renames || [];
          for (const rename of obj.$_terms.renames) {
            Assert(rename.from !== from, "Cannot rename the same key multiple times");
          }
          obj.$_terms.renames.push({
            from,
            to,
            options: ApplyToDefaults(internals.renameDefaults, options)
          });
          return obj;
        }
      },
      schema: {
        method(type = "any") {
          return this.$_addRule({ name: "schema", args: { type } });
        },
        validate(value, helpers, { type }) {
          if (Common.isSchema(value) && (type === "any" || value.type === type)) {
            return value;
          }
          return helpers.error("object.schema", { type });
        }
      },
      unknown: {
        method(allow) {
          return this.$_setFlag("unknown", allow !== false);
        }
      },
      with: {
        method(key, peers, options = {}) {
          return internals.dependency(this, "with", key, peers, options);
        }
      },
      without: {
        method(key, peers, options = {}) {
          return internals.dependency(this, "without", key, peers, options);
        }
      },
      xor: {
        method(...peers) {
          Common.verifyFlat(peers, "xor");
          return internals.dependency(this, "xor", null, peers);
        }
      }
    },
    overrides: {
      default(value, options) {
        if (value === undefined) {
          value = Common.symbols.deepDefault;
        }
        return this.$_parent("default", value, options);
      }
    },
    rebuild(schema) {
      if (schema.$_terms.keys) {
        const topo = new Topo.Sorter;
        for (const child of schema.$_terms.keys) {
          Common.tryWithPath(() => topo.add(child, { after: child.schema.$_rootReferences(), group: child.key }), child.key);
        }
        schema.$_terms.keys = new internals.Keys(...topo.nodes);
      }
    },
    messages: {
      "object.and": "{{#label}} contains {{#present}} without its required peers {{#missing}}",
      "object.assert": "{{#label}} is invalid because it failed to pass the assertion test",
      "object.base": "{{#label}} must be of type {{#type}}",
      "object.instance": "{{#label}} must be an instance of {{:#type}}",
      "object.length": "{{#label}} must have {{#limit}} keys",
      "object.max": "{{#label}} must have less than or equal to {{#limit}} keys",
      "object.min": "{{#label}} must have at least {{#limit}} keys",
      "object.missing": "{{#label}} must contain at least one of {{#peers}}",
      "object.nand": "{{:#main}} must not exist simultaneously with {{#peers}}",
      "object.oxor": "{{#label}} contains a conflict between optional exclusive peers {{#peers}}",
      "object.pattern.match": "{{#label}} keys failed to match pattern requirements",
      "object.refType": "{{#label}} must be a Joi reference",
      "object.regex": "{{#label}} must be a RegExp object",
      "object.rename.multiple": "{{#label}} cannot rename {{:#from}} because multiple renames are disabled and another key was already renamed to {{:#to}}",
      "object.rename.override": "{{#label}} cannot rename {{:#from}} because override is disabled and target {{:#to}} exists",
      "object.schema": "{{#label}} must be a Joi schema of {{#type}} type",
      "object.unknown": "{{#label}} is not allowed",
      "object.with": "{{:#main}} missing required peer {{:#peer}}",
      "object.without": "{{:#main}} conflict with forbidden peer {{:#peer}}",
      "object.xor": "{{#label}} contains a conflict between exclusive peers {{#peers}}"
    }
  });
  internals.clone = function(value, prefs) {
    if (typeof value === "object") {
      if (prefs.nonEnumerables) {
        return Clone(value, { shallow: true });
      }
      const clone2 = Object.create(Object.getPrototypeOf(value));
      Object.assign(clone2, value);
      return clone2;
    }
    const clone = function(...args) {
      return value.apply(this, args);
    };
    clone.prototype = Clone(value.prototype);
    Object.defineProperty(clone, "name", { value: value.name, writable: false });
    Object.defineProperty(clone, "length", { value: value.length, writable: false });
    Object.assign(clone, value);
    return clone;
  };
  internals.dependency = function(schema, rel, key, peers, options) {
    Assert(key === null || typeof key === "string", rel, "key must be a strings");
    if (!options) {
      options = peers.length > 1 && typeof peers[peers.length - 1] === "object" ? peers.pop() : {};
    }
    Common.assertOptions(options, ["separator"]);
    peers = [].concat(peers);
    const separator = Common.default(options.separator, ".");
    const paths = [];
    for (const peer of peers) {
      Assert(typeof peer === "string", rel, "peers must be a string or a reference");
      paths.push(Compile.ref(peer, { separator, ancestor: 0, prefix: false }));
    }
    if (key !== null) {
      key = Compile.ref(key, { separator, ancestor: 0, prefix: false });
    }
    const obj = schema.clone();
    obj.$_terms.dependencies = obj.$_terms.dependencies || [];
    obj.$_terms.dependencies.push(new internals.Dependency(rel, key, paths, peers));
    return obj;
  };
  internals.dependencies = {
    and(schema, dep, value, state, prefs) {
      const missing = [];
      const present = [];
      const count = dep.peers.length;
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) === undefined) {
          missing.push(peer.key);
        } else {
          present.push(peer.key);
        }
      }
      if (missing.length !== count && present.length !== count) {
        return {
          code: "object.and",
          context: {
            present,
            missing
          }
        };
      }
    },
    nand(schema, dep, value, state, prefs) {
      const present = [];
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) !== undefined) {
          present.push(peer.key);
        }
      }
      if (present.length !== dep.peers.length) {
        return;
      }
      const main = dep.paths[0];
      const values = dep.paths.slice(1);
      return {
        code: "object.nand",
        context: {
          main,
          peers: values
        }
      };
    },
    or(schema, dep, value, state, prefs) {
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) !== undefined) {
          return;
        }
      }
      return {
        code: "object.missing",
        context: {
          peers: dep.paths
        }
      };
    },
    oxor(schema, dep, value, state, prefs) {
      const present = [];
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) !== undefined) {
          present.push(peer.key);
        }
      }
      if (!present.length || present.length === 1) {
        return;
      }
      const context = { peers: dep.paths };
      context.present = present;
      return { code: "object.oxor", context };
    },
    with(schema, dep, value, state, prefs) {
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) === undefined) {
          return {
            code: "object.with",
            context: {
              main: dep.key.key,
              peer: peer.key
            }
          };
        }
      }
    },
    without(schema, dep, value, state, prefs) {
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) !== undefined) {
          return {
            code: "object.without",
            context: {
              main: dep.key.key,
              peer: peer.key
            }
          };
        }
      }
    },
    xor(schema, dep, value, state, prefs) {
      const present = [];
      for (const peer of dep.peers) {
        if (peer.resolve(value, state, prefs, null, { shadow: false }) !== undefined) {
          present.push(peer.key);
        }
      }
      if (present.length === 1) {
        return;
      }
      const context = { peers: dep.paths };
      if (present.length === 0) {
        return { code: "object.missing", context };
      }
      context.present = present;
      return { code: "object.xor", context };
    }
  };
  internals.rename = function(schema, value, state, prefs, errors) {
    const renamed = {};
    for (const rename of schema.$_terms.renames) {
      const matches = [];
      const pattern = typeof rename.from !== "string";
      if (!pattern) {
        if (Object.prototype.hasOwnProperty.call(value, rename.from) && (value[rename.from] !== undefined || !rename.options.ignoreUndefined)) {
          matches.push(rename);
        }
      } else {
        for (const from in value) {
          if (value[from] === undefined && rename.options.ignoreUndefined) {
            continue;
          }
          if (from === rename.to) {
            continue;
          }
          const match = rename.from.exec(from);
          if (!match) {
            continue;
          }
          matches.push({ from, to: rename.to, match });
        }
      }
      for (const match of matches) {
        const from = match.from;
        const to = match.to;
        if (!rename.options.multiple && renamed[to]) {
          errors.push(schema.$_createError("object.rename.multiple", value, { from, to, pattern }, state, prefs));
          if (prefs.abortEarly) {
            return false;
          }
        }
        if (Object.prototype.hasOwnProperty.call(value, to) && !rename.options.override && !renamed[to]) {
          errors.push(schema.$_createError("object.rename.override", value, { from, to, pattern }, state, prefs));
          if (prefs.abortEarly) {
            return false;
          }
        }
        if (value[from] === undefined) {
          delete value[to];
        } else {
          value[to] = value[from];
        }
        renamed[to] = true;
        if (!rename.options.alias) {
          delete value[from];
        }
      }
    }
    return true;
  };
  internals.unknown = function(schema, value, unprocessed, errors, state, prefs) {
    if (schema.$_terms.patterns) {
      let hasMatches = false;
      const matches = schema.$_terms.patterns.map((pattern) => {
        if (pattern.matches) {
          hasMatches = true;
          return [];
        }
      });
      const ancestors = [value, ...state.ancestors];
      for (const key of unprocessed) {
        const item = value[key];
        const path = [...state.path, key];
        for (let i = 0;i < schema.$_terms.patterns.length; ++i) {
          const pattern = schema.$_terms.patterns[i];
          if (pattern.regex) {
            const match = pattern.regex.test(key);
            if (!match) {
              continue;
            }
          } else {
            if (!pattern.schema.$_match(key, state.nest(pattern.schema, `pattern.${i}`), prefs)) {
              continue;
            }
          }
          unprocessed.delete(key);
          const localState = state.localize(path, ancestors, { schema: pattern.rule, key });
          const result = pattern.rule.$_validate(item, localState, prefs);
          if (result.errors) {
            if (prefs.abortEarly) {
              return { value, errors: result.errors };
            }
            errors.push(...result.errors);
          }
          if (pattern.matches) {
            matches[i].push(key);
          }
          value[key] = result.value;
          if (!pattern.fallthrough) {
            break;
          }
        }
      }
      if (hasMatches) {
        for (let i = 0;i < matches.length; ++i) {
          const match = matches[i];
          if (!match) {
            continue;
          }
          const stpm = schema.$_terms.patterns[i].matches;
          const localState = state.localize(state.path, ancestors, stpm);
          const result = stpm.$_validate(match, localState, prefs);
          if (result.errors) {
            const details = Errors.details(result.errors, { override: false });
            details.matches = match;
            const report = schema.$_createError("object.pattern.match", value, details, state, prefs);
            if (prefs.abortEarly) {
              return { value, errors: report };
            }
            errors.push(report);
          }
        }
      }
    }
    if (!unprocessed.size || !schema.$_terms.keys && !schema.$_terms.patterns) {
      return;
    }
    if (prefs.stripUnknown && !schema._flags.unknown || prefs.skipFunctions) {
      const stripUnknown = prefs.stripUnknown ? prefs.stripUnknown === true ? true : !!prefs.stripUnknown.objects : false;
      for (const key of unprocessed) {
        if (stripUnknown) {
          delete value[key];
          unprocessed.delete(key);
        } else if (typeof value[key] === "function") {
          unprocessed.delete(key);
        }
      }
    }
    const forbidUnknown = !Common.default(schema._flags.unknown, prefs.allowUnknown);
    if (forbidUnknown) {
      for (const unprocessedKey of unprocessed) {
        const localState = state.localize([...state.path, unprocessedKey], []);
        const report = schema.$_createError("object.unknown", value[unprocessedKey], { child: unprocessedKey }, localState, prefs, { flags: false });
        if (prefs.abortEarly) {
          return { value, errors: report };
        }
        errors.push(report);
      }
    }
  };
  internals.Dependency = class {
    constructor(rel, key, peers, paths) {
      this.rel = rel;
      this.key = key;
      this.peers = peers;
      this.paths = paths;
    }
  };
  internals.Keys = class extends Array {
    concat(source) {
      const result = this.slice();
      const keys = new Map;
      for (let i = 0;i < result.length; ++i) {
        keys.set(result[i].key, i);
      }
      for (const item of source) {
        const key = item.key;
        const pos = keys.get(key);
        if (pos !== undefined) {
          result[pos] = { key, schema: result[pos].schema.concat(item.schema) };
        } else {
          result.push(item);
        }
      }
      return result;
    }
  };
});

// node_modules/@hapi/validate/lib/types/function.js
var require_function = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Keys = require_keys();
  module.exports = Keys._extend({
    type: "function",
    properties: {
      typeof: "function"
    },
    rules: {
      arity: {
        method(n) {
          Assert(Number.isSafeInteger(n) && n >= 0, "n must be a positive integer");
          return this.$_addRule({ name: "arity", args: { n } });
        },
        validate(value, helpers, { n }) {
          if (value.length === n) {
            return value;
          }
          return helpers.error("function.arity", { n });
        }
      },
      class: {
        method() {
          return this.$_addRule("class");
        },
        validate(value, helpers) {
          if (/^\s*class\s/.test(value.toString())) {
            return value;
          }
          return helpers.error("function.class", { value });
        }
      },
      minArity: {
        method(n) {
          Assert(Number.isSafeInteger(n) && n > 0, "n must be a strict positive integer");
          return this.$_addRule({ name: "minArity", args: { n } });
        },
        validate(value, helpers, { n }) {
          if (value.length >= n) {
            return value;
          }
          return helpers.error("function.minArity", { n });
        }
      },
      maxArity: {
        method(n) {
          Assert(Number.isSafeInteger(n) && n >= 0, "n must be a positive integer");
          return this.$_addRule({ name: "maxArity", args: { n } });
        },
        validate(value, helpers, { n }) {
          if (value.length <= n) {
            return value;
          }
          return helpers.error("function.maxArity", { n });
        }
      }
    },
    messages: {
      "function.arity": "{{#label}} must have an arity of {{#n}}",
      "function.class": "{{#label}} must be a class",
      "function.maxArity": "{{#label}} must have an arity lesser or equal to {{#n}}",
      "function.minArity": "{{#label}} must have an arity greater or equal to {{#n}}"
    }
  });
});

// node_modules/@hapi/validate/lib/types/link.js
var require_link = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  var Compile = require_compile();
  var Errors = require_errors();
  var internals = {};
  module.exports = Any._extend({
    type: "link",
    properties: {
      schemaChain: true
    },
    terms: {
      link: { init: null, register: false }
    },
    args(schema, ref) {
      return schema.ref(ref);
    },
    validate(value, { schema, state, prefs }) {
      Assert(schema.$_terms.link, "Uninitialized link schema");
      const linked = internals.generate(schema, value, state, prefs);
      const ref = schema.$_terms.link[0].ref;
      return linked.$_validate(value, state.nest(linked, `link:${ref.display}:${linked.type}`), prefs);
    },
    generate(schema, value, state, prefs) {
      return internals.generate(schema, value, state, prefs);
    },
    rules: {
      ref: {
        method(ref) {
          Assert(!this.$_terms.link, "Cannot reinitialize schema");
          ref = Compile.ref(ref);
          Assert(ref.type === "value" || ref.type === "local", "Invalid reference type:", ref.type);
          Assert(ref.type === "local" || ref.ancestor === "root" || ref.ancestor > 0, "Link cannot reference itself");
          const obj = this.clone();
          obj.$_terms.link = [{ ref }];
          return obj;
        }
      },
      relative: {
        method(enabled = true) {
          return this.$_setFlag("relative", enabled);
        }
      }
    },
    overrides: {
      concat(source) {
        Assert(this.$_terms.link, "Uninitialized link schema");
        Assert(Common.isSchema(source), "Invalid schema object");
        Assert(source.type !== "link", "Cannot merge type link with another link");
        const obj = this.clone();
        if (!obj.$_terms.whens) {
          obj.$_terms.whens = [];
        }
        obj.$_terms.whens.push({ concat: source });
        return obj.$_mutateRebuild();
      }
    }
  });
  internals.generate = function(schema, value, state, prefs) {
    let linked = state.mainstay.links.get(schema);
    if (linked) {
      return linked._generate(value, state, prefs).schema;
    }
    const ref = schema.$_terms.link[0].ref;
    const { perspective, path } = internals.perspective(ref, state);
    internals.assert(perspective, "which is outside of schema boundaries", ref, schema, state, prefs);
    try {
      linked = path.length ? perspective.$_reach(path) : perspective;
    } catch (ignoreErr) {
      internals.assert(false, "to non-existing schema", ref, schema, state, prefs);
    }
    internals.assert(linked.type !== "link", "which is another link", ref, schema, state, prefs);
    if (!schema._flags.relative) {
      state.mainstay.links.set(schema, linked);
    }
    return linked._generate(value, state, prefs).schema;
  };
  internals.perspective = function(ref, state) {
    if (ref.type === "local") {
      for (const { schema, key } of state.schemas) {
        const id = schema._flags.id || key;
        if (id === ref.path[0]) {
          return { perspective: schema, path: ref.path.slice(1) };
        }
        if (schema.$_terms.shared) {
          for (const shared of schema.$_terms.shared) {
            if (shared._flags.id === ref.path[0]) {
              return { perspective: shared, path: ref.path.slice(1) };
            }
          }
        }
      }
      return { perspective: null, path: null };
    }
    if (ref.ancestor === "root") {
      return { perspective: state.schemas[state.schemas.length - 1].schema, path: ref.path };
    }
    return { perspective: state.schemas[ref.ancestor]?.schema, path: ref.path };
  };
  internals.assert = function(condition, message, ref, schema, state, prefs) {
    if (condition) {
      return;
    }
    Assert(false, `"${Errors.label(schema._flags, state, prefs)}" contains link reference "${ref.display}" ${message}`);
  };
});

// node_modules/@hapi/validate/lib/types/number.js
var require_number = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  var internals = {
    numberRx: /^\s*[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e([+-]?\d+))?\s*$/i,
    precisionRx: /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/
  };
  module.exports = Any._extend({
    type: "number",
    flags: {
      unsafe: { default: false }
    },
    coerce: {
      from: "string",
      method(value, { schema, error }) {
        const matches = value.match(internals.numberRx);
        if (!matches) {
          return;
        }
        value = value.trim();
        const result = { value: parseFloat(value) };
        if (result.value === 0) {
          result.value = 0;
        }
        if (!schema._flags.unsafe) {
          if (value.match(/e/i)) {
            const constructed = internals.normalizeExponent(`${result.value / Math.pow(10, matches[1])}e${matches[1]}`);
            if (constructed !== internals.normalizeExponent(value)) {
              result.errors = error("number.unsafe");
              return result;
            }
          } else {
            const string = result.value.toString();
            if (string.match(/e/i)) {
              return result;
            }
            if (string !== internals.normalizeDecimal(value)) {
              result.errors = error("number.unsafe");
              return result;
            }
          }
        }
        return result;
      }
    },
    validate(value, { schema, error, prefs }) {
      if (value === Infinity || value === -Infinity) {
        return { value, errors: error("number.infinity") };
      }
      if (!Common.isNumber(value)) {
        return { value, errors: error("number.base") };
      }
      const result = { value };
      if (prefs.convert) {
        const rule = schema.$_getRule("precision");
        if (rule) {
          const precision = Math.pow(10, rule.args.limit);
          result.value = Math.round(result.value * precision) / precision;
        }
      }
      if (result.value === 0) {
        result.value = 0;
      }
      if (!schema._flags.unsafe && (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)) {
        result.errors = error("number.unsafe");
      }
      return result;
    },
    rules: {
      compare: {
        method: false,
        validate(value, helpers, { limit }, { name, operator, args }) {
          if (Common.compare(value, limit, operator)) {
            return value;
          }
          return helpers.error("number." + name, { limit: args.limit, value });
        },
        args: [
          {
            name: "limit",
            ref: true,
            assert: Common.isNumber,
            message: "must be a number"
          }
        ]
      },
      greater: {
        method(limit) {
          return this.$_addRule({ name: "greater", method: "compare", args: { limit }, operator: ">" });
        }
      },
      integer: {
        method() {
          return this.$_addRule("integer");
        },
        validate(value, helpers) {
          if (Math.trunc(value) - value === 0) {
            return value;
          }
          return helpers.error("number.integer");
        }
      },
      less: {
        method(limit) {
          return this.$_addRule({ name: "less", method: "compare", args: { limit }, operator: "<" });
        }
      },
      max: {
        method(limit) {
          return this.$_addRule({ name: "max", method: "compare", args: { limit }, operator: "<=" });
        }
      },
      min: {
        method(limit) {
          return this.$_addRule({ name: "min", method: "compare", args: { limit }, operator: ">=" });
        }
      },
      multiple: {
        method(base) {
          return this.$_addRule({ name: "multiple", args: { base } });
        },
        validate(value, helpers, { base }, options) {
          if (value % base === 0) {
            return value;
          }
          return helpers.error("number.multiple", { multiple: options.args.base, value });
        },
        args: [
          {
            name: "base",
            ref: true,
            assert: (value) => typeof value === "number" && isFinite(value) && value > 0,
            message: "must be a positive number"
          }
        ],
        multi: true
      },
      negative: {
        method() {
          return this.sign("negative");
        }
      },
      port: {
        method() {
          return this.$_addRule("port");
        },
        validate(value, helpers) {
          if (Number.isSafeInteger(value) && value >= 0 && value <= 65535) {
            return value;
          }
          return helpers.error("number.port");
        }
      },
      positive: {
        method() {
          return this.sign("positive");
        }
      },
      precision: {
        method(limit) {
          Assert(Number.isSafeInteger(limit), "limit must be an integer");
          return this.$_addRule({ name: "precision", args: { limit } });
        },
        validate(value, helpers, { limit }) {
          const places = value.toString().match(internals.precisionRx);
          const decimals = Math.max((places[1] ? places[1].length : 0) - (places[2] ? parseInt(places[2], 10) : 0), 0);
          if (decimals <= limit) {
            return value;
          }
          return helpers.error("number.precision", { limit, value });
        },
        convert: true
      },
      sign: {
        method(sign) {
          Assert(["negative", "positive"].includes(sign), "Invalid sign", sign);
          return this.$_addRule({ name: "sign", args: { sign } });
        },
        validate(value, helpers, { sign }) {
          if (sign === "negative" && value < 0 || sign === "positive" && value > 0) {
            return value;
          }
          return helpers.error(`number.${sign}`);
        }
      },
      unsafe: {
        method(enabled = true) {
          Assert(typeof enabled === "boolean", "enabled must be a boolean");
          return this.$_setFlag("unsafe", enabled);
        }
      }
    },
    cast: {
      string: {
        from: (value) => typeof value === "number",
        to(value, helpers) {
          return value.toString();
        }
      }
    },
    messages: {
      "number.base": "{{#label}} must be a number",
      "number.greater": "{{#label}} must be greater than {{#limit}}",
      "number.infinity": "{{#label}} cannot be infinity",
      "number.integer": "{{#label}} must be an integer",
      "number.less": "{{#label}} must be less than {{#limit}}",
      "number.max": "{{#label}} must be less than or equal to {{#limit}}",
      "number.min": "{{#label}} must be greater than or equal to {{#limit}}",
      "number.multiple": "{{#label}} must be a multiple of {{#multiple}}",
      "number.negative": "{{#label}} must be a negative number",
      "number.port": "{{#label}} must be a valid port",
      "number.positive": "{{#label}} must be a positive number",
      "number.precision": "{{#label}} must have no more than {{#limit}} decimal places",
      "number.unsafe": "{{#label}} must be a safe number"
    }
  });
  internals.normalizeExponent = function(str) {
    return str.replace(/E/, "e").replace(/\.(\d*[1-9])?0+e/, ".$1e").replace(/\.e/, "e").replace(/e\+/, "e").replace(/^\+/, "").replace(/^(-?)0+([1-9])/, "$1$2");
  };
  internals.normalizeDecimal = function(str) {
    str = str.replace(/^\+/, "").replace(/\.0+$/, "").replace(/^(-?)\.([^\.]*)$/, "$10.$2").replace(/^(-?)0+([1-9])/, "$1$2");
    if (str.includes(".") && str.endsWith("0")) {
      str = str.replace(/0+$/, "");
    }
    if (str === "-0") {
      return "0";
    }
    return str;
  };
});

// node_modules/@hapi/validate/lib/types/object.js
var require_object = __commonJS((exports, module) => {
  var Keys = require_keys();
  module.exports = Keys._extend({
    type: "object",
    cast: {
      map: {
        from: (value) => value && typeof value === "object",
        to(value, helpers) {
          return new Map(Object.entries(value));
        }
      }
    }
  });
});

// node_modules/@hapi/validate/lib/types/string.js
var require_string = __commonJS((exports, module) => {
  var Url = __require("url");
  var Assert = require_assert();
  var EscapeRegex = require_escapeRegex();
  var Any = require_any();
  var Common = require_common();
  var internals = {
    base64Regex: {
      true: {
        true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}==|[\w\-]{3}=)?$/,
        false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
      },
      false: {
        true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}(==)?|[\w\-]{3}=?)?$/,
        false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/
      }
    },
    dataUriRegex: /^data:[\w+.-]+\/[\w+.-]+;((charset=[\w-]+|base64),)?(.*)$/,
    hexRegex: /^[a-f0-9]+$/i,
    isoDurationRegex: /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/,
    guidBrackets: {
      "{": "}",
      "[": "]",
      "(": ")",
      "": ""
    },
    guidVersions: {
      uuidv1: "1",
      uuidv2: "2",
      uuidv3: "3",
      uuidv4: "4",
      uuidv5: "5"
    },
    guidSeparators: new Set([undefined, true, false, "-", ":"]),
    normalizationForms: ["NFC", "NFD", "NFKC", "NFKD"],
    domainControlRx: /[\x00-\x20@\:\/]/,
    domainSegmentRx: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/,
    finalSegmentAdditionalRx: /[^0-9]/
  };
  module.exports = Any._extend({
    type: "string",
    flags: {
      insensitive: { default: false },
      truncate: { default: false }
    },
    terms: {
      replacements: { init: null }
    },
    coerce: {
      from: "string",
      method(value, { schema, state, prefs }) {
        const normalize = schema.$_getRule("normalize");
        if (normalize) {
          value = value.normalize(normalize.args.form);
        }
        const casing = schema.$_getRule("case");
        if (casing) {
          value = casing.args.direction === "upper" ? value.toLocaleUpperCase() : value.toLocaleLowerCase();
        }
        const trim = schema.$_getRule("trim");
        if (trim && trim.args.enabled) {
          value = value.trim();
        }
        if (schema.$_terms.replacements) {
          for (const replacement of schema.$_terms.replacements) {
            value = value.replace(replacement.pattern, replacement.replacement);
          }
        }
        const hex = schema.$_getRule("hex");
        if (hex && hex.args.options.byteAligned && value.length % 2 !== 0) {
          value = `0${value}`;
        }
        if (schema.$_getRule("isoDate")) {
          const iso = internals.isoDate(value);
          if (iso) {
            value = iso;
          }
        }
        if (schema._flags.truncate) {
          const rule = schema.$_getRule("max");
          if (rule) {
            let limit = rule.args.limit;
            if (Common.isResolvable(limit)) {
              limit = limit.resolve(value, state, prefs);
              if (!Common.limit(limit)) {
                return { value, errors: schema.$_createError("any.ref", limit, { ref: rule.args.limit, arg: "limit", reason: "must be a positive integer" }, state, prefs) };
              }
            }
            value = value.slice(0, limit);
          }
        }
        return { value };
      }
    },
    validate(value, { error }) {
      if (typeof value !== "string") {
        return { value, errors: error("string.base") };
      }
      if (value === "") {
        return { value, errors: error("string.empty") };
      }
    },
    rules: {
      alphanum: {
        method() {
          return this.$_addRule("alphanum");
        },
        validate(value, helpers) {
          if (/^[a-zA-Z0-9]+$/.test(value)) {
            return value;
          }
          return helpers.error("string.alphanum");
        }
      },
      base64: {
        method(options = {}) {
          Common.assertOptions(options, ["paddingRequired", "urlSafe"]);
          options = { urlSafe: false, paddingRequired: true, ...options };
          Assert(typeof options.paddingRequired === "boolean", "paddingRequired must be boolean");
          Assert(typeof options.urlSafe === "boolean", "urlSafe must be boolean");
          return this.$_addRule({ name: "base64", args: { options } });
        },
        validate(value, helpers, { options }) {
          const regex = internals.base64Regex[options.paddingRequired][options.urlSafe];
          if (regex.test(value)) {
            return value;
          }
          return helpers.error("string.base64");
        }
      },
      case: {
        method(direction) {
          Assert(["lower", "upper"].includes(direction), "Invalid case:", direction);
          return this.$_addRule({ name: "case", args: { direction } });
        },
        validate(value, helpers, { direction }) {
          if (direction === "lower" && value === value.toLocaleLowerCase() || direction === "upper" && value === value.toLocaleUpperCase()) {
            return value;
          }
          return helpers.error(`string.${direction}case`);
        },
        convert: true
      },
      creditCard: {
        method() {
          return this.$_addRule("creditCard");
        },
        validate(value, helpers) {
          let i = value.length;
          let sum = 0;
          let mul = 1;
          while (i--) {
            const char = value.charAt(i) * mul;
            sum = sum + (char - (char > 9) * 9);
            mul = mul ^ 3;
          }
          if (sum > 0 && sum % 10 === 0) {
            return value;
          }
          return helpers.error("string.creditCard");
        }
      },
      dataUri: {
        method(options = {}) {
          Common.assertOptions(options, ["paddingRequired"]);
          options = { paddingRequired: true, ...options };
          Assert(typeof options.paddingRequired === "boolean", "paddingRequired must be boolean");
          return this.$_addRule({ name: "dataUri", args: { options } });
        },
        validate(value, helpers, { options }) {
          const matches = value.match(internals.dataUriRegex);
          if (matches) {
            if (!matches[2]) {
              return value;
            }
            if (matches[2] !== "base64") {
              return value;
            }
            const base64regex = internals.base64Regex[options.paddingRequired].false;
            if (base64regex.test(matches[3])) {
              return value;
            }
          }
          return helpers.error("string.dataUri");
        }
      },
      guid: {
        alias: "uuid",
        method(options = {}) {
          Common.assertOptions(options, ["version", "separator"]);
          let versionNumbers = "";
          if (options.version) {
            const versions = [].concat(options.version);
            Assert(versions.length >= 1, "version must have at least 1 valid version specified");
            const set = new Set;
            for (let i = 0;i < versions.length; ++i) {
              const version = versions[i];
              Assert(typeof version === "string", "version at position " + i + " must be a string");
              const versionNumber = internals.guidVersions[version.toLowerCase()];
              Assert(versionNumber, "version at position " + i + " must be one of " + Object.keys(internals.guidVersions).join(", "));
              Assert(!set.has(versionNumber), "version at position " + i + " must not be a duplicate");
              versionNumbers += versionNumber;
              set.add(versionNumber);
            }
          }
          Assert(internals.guidSeparators.has(options.separator), 'separator must be one of true, false, "-", or ":"');
          const separator = options.separator === undefined ? "[:-]?" : options.separator === true ? "[:-]" : options.separator === false ? "[]?" : `\\${options.separator}`;
          const regex = new RegExp(`^([\\[{\\(]?)[0-9A-F]{8}(${separator})[0-9A-F]{4}\\2?[${versionNumbers || "0-9A-F"}][0-9A-F]{3}\\2?[${versionNumbers ? "89AB" : "0-9A-F"}][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)\$`, "i");
          return this.$_addRule({ name: "guid", args: { options }, regex });
        },
        validate(value, helpers, args, { regex }) {
          const results = regex.exec(value);
          if (!results) {
            return helpers.error("string.guid");
          }
          if (internals.guidBrackets[results[1]] !== results[results.length - 1]) {
            return helpers.error("string.guid");
          }
          return value;
        }
      },
      hex: {
        method(options = {}) {
          Common.assertOptions(options, ["byteAligned"]);
          options = { byteAligned: false, ...options };
          Assert(typeof options.byteAligned === "boolean", "byteAligned must be boolean");
          return this.$_addRule({ name: "hex", args: { options } });
        },
        validate(value, helpers, { options }) {
          if (!internals.hexRegex.test(value)) {
            return helpers.error("string.hex");
          }
          if (options.byteAligned && value.length % 2 !== 0) {
            return helpers.error("string.hexAlign");
          }
          return value;
        }
      },
      hostname: {
        method() {
          return this.$_addRule("hostname");
        },
        validate(value, helpers) {
          if (internals.isDomainValid(value) || internals.ipRegex.test(value)) {
            return value;
          }
          return helpers.error("string.hostname");
        }
      },
      insensitive: {
        method() {
          return this.$_setFlag("insensitive", true);
        }
      },
      isoDate: {
        method() {
          return this.$_addRule("isoDate");
        },
        validate(value, { error }) {
          if (internals.isoDate(value)) {
            return value;
          }
          return error("string.isoDate");
        }
      },
      isoDuration: {
        method() {
          return this.$_addRule("isoDuration");
        },
        validate(value, helpers) {
          if (internals.isoDurationRegex.test(value)) {
            return value;
          }
          return helpers.error("string.isoDuration");
        }
      },
      length: {
        method(limit, encoding) {
          return internals.length(this, "length", limit, "=", encoding);
        },
        validate(value, helpers, { limit, encoding }, { name, operator, args }) {
          const length = encoding ? Buffer.byteLength(value, encoding) : value.length;
          if (Common.compare(length, limit, operator)) {
            return value;
          }
          return helpers.error("string." + name, { limit: args.limit, value, encoding });
        },
        args: [
          {
            name: "limit",
            ref: true,
            assert: Common.limit,
            message: "must be a positive integer"
          },
          "encoding"
        ]
      },
      lowercase: {
        method() {
          return this.case("lower");
        }
      },
      max: {
        method(limit, encoding) {
          return internals.length(this, "max", limit, "<=", encoding);
        },
        args: ["limit", "encoding"]
      },
      min: {
        method(limit, encoding) {
          return internals.length(this, "min", limit, ">=", encoding);
        },
        args: ["limit", "encoding"]
      },
      normalize: {
        method(form = "NFC") {
          Assert(internals.normalizationForms.includes(form), "normalization form must be one of " + internals.normalizationForms.join(", "));
          return this.$_addRule({ name: "normalize", args: { form } });
        },
        validate(value, { error }, { form }) {
          if (value === value.normalize(form)) {
            return value;
          }
          return error("string.normalize", { value, form });
        },
        convert: true
      },
      pattern: {
        alias: "regex",
        method(regex, options = {}) {
          Assert(regex instanceof RegExp, "regex must be a RegExp");
          Assert(!regex.flags.includes("g") && !regex.flags.includes("y"), "regex should not use global or sticky mode");
          if (typeof options === "string") {
            options = { name: options };
          }
          Common.assertOptions(options, ["invert", "name"]);
          const errorCode = ["string.pattern", options.invert ? ".invert" : "", options.name ? ".name" : ".base"].join("");
          return this.$_addRule({ name: "pattern", args: { regex, options }, errorCode });
        },
        validate(value, helpers, { regex, options }, { errorCode }) {
          const patternMatch = regex.test(value);
          if (patternMatch ^ options.invert) {
            return value;
          }
          return helpers.error(errorCode, { name: options.name, regex, value });
        },
        args: ["regex", "options"],
        multi: true
      },
      replace: {
        method(pattern, replacement) {
          if (typeof pattern === "string") {
            pattern = new RegExp(EscapeRegex(pattern), "g");
          }
          Assert(pattern instanceof RegExp, "pattern must be a RegExp");
          Assert(typeof replacement === "string", "replacement must be a String");
          const obj = this.clone();
          if (!obj.$_terms.replacements) {
            obj.$_terms.replacements = [];
          }
          obj.$_terms.replacements.push({ pattern, replacement });
          return obj;
        }
      },
      token: {
        method() {
          return this.$_addRule("token");
        },
        validate(value, helpers) {
          if (/^\w+$/.test(value)) {
            return value;
          }
          return helpers.error("string.token");
        }
      },
      trim: {
        method(enabled = true) {
          Assert(typeof enabled === "boolean", "enabled must be a boolean");
          return this.$_addRule({ name: "trim", args: { enabled } });
        },
        validate(value, helpers, { enabled }) {
          if (!enabled || value === value.trim()) {
            return value;
          }
          return helpers.error("string.trim");
        },
        convert: true
      },
      truncate: {
        method(enabled = true) {
          Assert(typeof enabled === "boolean", "enabled must be a boolean");
          return this.$_setFlag("truncate", enabled);
        }
      },
      uppercase: {
        method() {
          return this.case("upper");
        }
      }
    },
    messages: {
      "string.alphanum": "{{#label}} must only contain alpha-numeric characters",
      "string.base": "{{#label}} must be a string",
      "string.base64": "{{#label}} must be a valid base64 string",
      "string.creditCard": "{{#label}} must be a credit card",
      "string.dataUri": "{{#label}} must be a valid dataUri string",
      "string.empty": "{{#label}} is not allowed to be empty",
      "string.guid": "{{#label}} must be a valid GUID",
      "string.hex": "{{#label}} must only contain hexadecimal characters",
      "string.hexAlign": "{{#label}} hex decoded representation must be byte aligned",
      "string.hostname": "{{#label}} must be a valid hostname",
      "string.isoDate": "{{#label}} must be in iso format",
      "string.isoDuration": "{{#label}} must be a valid ISO 8601 duration",
      "string.length": "{{#label}} length must be {{#limit}} characters long",
      "string.lowercase": "{{#label}} must only contain lowercase characters",
      "string.max": "{{#label}} length must be less than or equal to {{#limit}} characters long",
      "string.min": "{{#label}} length must be at least {{#limit}} characters long",
      "string.normalize": "{{#label}} must be unicode normalized in the {{#form}} form",
      "string.token": "{{#label}} must only contain alpha-numeric and underscore characters",
      "string.pattern.base": "{{#label}} with value {:.} fails to match the required pattern: {{#regex}}",
      "string.pattern.name": "{{#label}} with value {:.} fails to match the {{#name}} pattern",
      "string.pattern.invert.base": "{{#label}} with value {:.} matches the inverted pattern: {{#regex}}",
      "string.pattern.invert.name": "{{#label}} with value {:.} matches the inverted {{#name}} pattern",
      "string.trim": "{{#label}} must not have leading or trailing whitespace",
      "string.uppercase": "{{#label}} must only contain uppercase characters"
    }
  });
  internals.isoDate = function(value) {
    if (!Common.isIsoDate(value)) {
      return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  };
  internals.length = function(schema, name, limit, operator, encoding) {
    Assert(!encoding || Buffer.isEncoding(encoding), "Invalid encoding:", encoding);
    return schema.$_addRule({ name, method: "length", args: { limit, encoding }, operator });
  };
  internals.rfc3986 = function() {
    const rfc3986 = {};
    const hexDigit = "\\dA-Fa-f";
    const hexDigitOnly = "[" + hexDigit + "]";
    const unreserved = "\\w-\\.~";
    const subDelims = "!\\$&\'\\(\\)\\*\\+,;=";
    const decOctect = "(?:0{0,2}\\d|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
    rfc3986.ipv4 = "(?:" + decOctect + "\\.){3}" + decOctect;
    const h16 = hexDigitOnly + "{1,4}";
    const ls32 = "(?:" + h16 + ":" + h16 + "|" + rfc3986.ipv4 + ")";
    const IPv6SixHex = "(?:" + h16 + ":){6}" + ls32;
    const IPv6FiveHex = "::(?:" + h16 + ":){5}" + ls32;
    const IPv6FourHex = "(?:" + h16 + ")?::(?:" + h16 + ":){4}" + ls32;
    const IPv6ThreeHex = "(?:(?:" + h16 + ":){0,1}" + h16 + ")?::(?:" + h16 + ":){3}" + ls32;
    const IPv6TwoHex = "(?:(?:" + h16 + ":){0,2}" + h16 + ")?::(?:" + h16 + ":){2}" + ls32;
    const IPv6OneHex = "(?:(?:" + h16 + ":){0,3}" + h16 + ")?::" + h16 + ":" + ls32;
    const IPv6NoneHex = "(?:(?:" + h16 + ":){0,4}" + h16 + ")?::" + ls32;
    const IPv6NoneHex2 = "(?:(?:" + h16 + ":){0,5}" + h16 + ")?::" + h16;
    const IPv6NoneHex3 = "(?:(?:" + h16 + ":){0,6}" + h16 + ")?::";
    rfc3986.v4Cidr = "(?:\\d|[1-2]\\d|3[0-2])";
    rfc3986.v6Cidr = "(?:0{0,2}\\d|0?[1-9]\\d|1[01]\\d|12[0-8])";
    rfc3986.ipv6 = "(?:" + IPv6SixHex + "|" + IPv6FiveHex + "|" + IPv6FourHex + "|" + IPv6ThreeHex + "|" + IPv6TwoHex + "|" + IPv6OneHex + "|" + IPv6NoneHex + "|" + IPv6NoneHex2 + "|" + IPv6NoneHex3 + ")";
    rfc3986.ipvfuture = "v" + hexDigitOnly + "+\\.[" + unreserved + subDelims + ":]+";
    return rfc3986;
  };
  internals.ipRegex = function() {
    const versions = ["ipv4", "ipv6", "ipvfuture"];
    const rfc3986 = internals.rfc3986();
    const parts = versions.map((version) => {
      const cidrpart = `\\/${version === "ipv4" ? rfc3986.v4Cidr : rfc3986.v6Cidr}`;
      return `${rfc3986[version]}(?:${cidrpart})?`;
    });
    const raw = `(?:${parts.join("|")})`;
    return new RegExp(`^${raw}\$`);
  }();
  internals.isDomainValid = function(domain) {
    if (domain.length > 256) {
      return false;
    }
    domain = domain.normalize("NFC");
    if (internals.domainControlRx.test(domain)) {
      return false;
    }
    domain = internals.punycode(domain);
    const segments = domain.split(".");
    for (let i = 0;i < segments.length; ++i) {
      const segment = segments[i];
      if (!segment.length) {
        return false;
      }
      if (segment.length > 63) {
        return false;
      }
      if (!internals.domainSegmentRx.test(segment)) {
        return false;
      }
      const isFinalSegment = i === segments.length - 1;
      if (isFinalSegment && !internals.finalSegmentAdditionalRx.test(segment)) {
        return false;
      }
    }
    return true;
  };
  internals.punycode = function(domain) {
    try {
      return new Url.URL(`http://${domain}`).host;
    } catch (err) {
      return domain;
    }
  };
});

// node_modules/@hapi/validate/lib/types/symbol.js
var require_symbol = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var internals = {};
  internals.Map = class extends Map {
    slice() {
      return new internals.Map(this);
    }
  };
  module.exports = Any._extend({
    type: "symbol",
    terms: {
      map: { init: new internals.Map }
    },
    coerce: {
      method(value, { schema, error }) {
        const lookup = schema.$_terms.map.get(value);
        if (lookup) {
          value = lookup;
        }
        if (!schema._flags.only || typeof value === "symbol") {
          return { value };
        }
        return { value, errors: error("symbol.map", { map: schema.$_terms.map }) };
      }
    },
    validate(value, { error }) {
      if (typeof value !== "symbol") {
        return { value, errors: error("symbol.base") };
      }
    },
    rules: {
      map: {
        method(iterable) {
          if (iterable && !iterable[Symbol.iterator] && typeof iterable === "object") {
            iterable = Object.entries(iterable);
          }
          Assert(iterable && iterable[Symbol.iterator], "Iterable must be an iterable or object");
          const obj = this.clone();
          const symbols = [];
          for (const entry of iterable) {
            Assert(entry && entry[Symbol.iterator], "Entry must be an iterable");
            const [key, value] = entry;
            Assert(typeof key !== "object" && typeof key !== "function" && typeof key !== "symbol", "Key must not be of type object, function, or Symbol");
            Assert(typeof value === "symbol", "Value must be a Symbol");
            obj.$_terms.map.set(key, value);
            symbols.push(value);
          }
          return obj.valid(...symbols);
        }
      }
    },
    messages: {
      "symbol.base": "{{#label}} must be a symbol",
      "symbol.map": "{{#label}} must be one of {{#map}}"
    }
  });
});

// node_modules/@hapi/validate/lib/types/binary.js
var require_binary = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Any = require_any();
  var Common = require_common();
  module.exports = Any._extend({
    type: "binary",
    coerce: {
      from: "string",
      method(value, { schema }) {
        try {
          return { value: Buffer.from(value, schema._flags.encoding) };
        } catch (ignoreErr) {
        }
      }
    },
    validate(value, { error }) {
      if (!Buffer.isBuffer(value)) {
        return { value, errors: error("binary.base") };
      }
    },
    rules: {
      encoding: {
        method(encoding) {
          Assert(Buffer.isEncoding(encoding), "Invalid encoding:", encoding);
          return this.$_setFlag("encoding", encoding);
        }
      },
      length: {
        method(limit) {
          return this.$_addRule({ name: "length", method: "length", args: { limit }, operator: "=" });
        },
        validate(value, helpers, { limit }, { name, operator, args }) {
          if (Common.compare(value.length, limit, operator)) {
            return value;
          }
          return helpers.error("binary." + name, { limit: args.limit, value });
        },
        args: [
          {
            name: "limit",
            ref: true,
            assert: Common.limit,
            message: "must be a positive integer"
          }
        ]
      },
      max: {
        method(limit) {
          return this.$_addRule({ name: "max", method: "length", args: { limit }, operator: "<=" });
        }
      },
      min: {
        method(limit) {
          return this.$_addRule({ name: "min", method: "length", args: { limit }, operator: ">=" });
        }
      }
    },
    cast: {
      string: {
        from: (value) => Buffer.isBuffer(value),
        to(value, helpers) {
          return value.toString();
        }
      }
    },
    messages: {
      "binary.base": "{{#label}} must be a buffer or a string",
      "binary.length": "{{#label}} must be {{#limit}} bytes",
      "binary.max": "{{#label}} must be less than or equal to {{#limit}} bytes",
      "binary.min": "{{#label}} must be at least {{#limit}} bytes"
    }
  });
});

// node_modules/@hapi/validate/lib/index.js
var require_lib3 = __commonJS((exports, module) => {
  var Assert = require_assert();
  var Clone = require_clone();
  var Common = require_common();
  var Compile = require_compile();
  var Errors = require_errors();
  var Ref = require_ref();
  var internals = {
    types: {
      alternatives: require_alternatives(),
      any: require_any(),
      array: require_array(),
      boolean: require_boolean(),
      date: require_date(),
      function: require_function(),
      link: require_link(),
      number: require_number(),
      object: require_object(),
      string: require_string(),
      symbol: require_symbol()
    },
    aliases: {
      alt: "alternatives",
      bool: "boolean",
      func: "function"
    }
  };
  if (Buffer) {
    internals.types.binary = require_binary();
  }
  internals.root = function() {
    const root = {
      _types: new Set(Object.keys(internals.types))
    };
    for (const type of root._types) {
      root[type] = function(...args) {
        Assert(!args.length || ["alternatives", "link", "object"].includes(type), "The", type, "type does not allow arguments");
        return internals.generate(this, internals.types[type], args);
      };
    }
    for (const method of ["allow", "custom", "disallow", "equal", "exist", "forbidden", "invalid", "not", "only", "optional", "options", "prefs", "preferences", "required", "strip", "valid", "when"]) {
      root[method] = function(...args) {
        return this.any()[method](...args);
      };
    }
    Object.assign(root, internals.methods);
    for (const alias in internals.aliases) {
      const target = internals.aliases[alias];
      root[alias] = root[target];
    }
    return root;
  };
  internals.methods = {
    ValidationError: Errors.ValidationError,
    version: Common.version,
    assert(value, schema, ...args) {
      internals.assert(value, schema, true, args);
    },
    attempt(value, schema, ...args) {
      return internals.assert(value, schema, false, args);
    },
    checkPreferences(prefs) {
      Common.checkPreferences(prefs);
    },
    compile(schema, options) {
      return Compile.compile(this, schema, options);
    },
    isError: Errors.ValidationError.isError,
    isRef: Ref.isRef,
    isSchema: Common.isSchema,
    in(...args) {
      return Ref.in(...args);
    },
    override: Common.symbols.override,
    ref(...args) {
      return Ref.create(...args);
    }
  };
  internals.assert = function(value, schema, annotate, args) {
    const message = args[0] instanceof Error || typeof args[0] === "string" ? args[0] : null;
    const options = message ? args[1] : args[0];
    const result = schema.validate(value, Common.preferences({ errors: { stack: true } }, options || {}));
    let error = result.error;
    if (!error) {
      return result.value;
    }
    if (message instanceof Error) {
      throw message;
    }
    const display = annotate && typeof error.annotate === "function" ? error.annotate() : error.message;
    if (error instanceof Errors.ValidationError === false) {
      error = Clone(error);
    }
    error.message = message ? `${message} ${display}` : display;
    throw error;
  };
  internals.generate = function(root, schema, args) {
    Assert(root, "Must be invoked on a Joi instance.");
    schema.$_root = root;
    if (!schema._definition.args || !args.length) {
      return schema;
    }
    return schema._definition.args(schema, ...args);
  };
  module.exports = internals.root();
});

// node_modules/@hapi/shot/lib/symbols.js
var require_symbols = __commonJS((exports) => {
  exports.injection = Symbol("injection");
});

// node_modules/@hapi/shot/lib/request.js
var require_request = __commonJS((exports, module) => {
  var Events = __require("events");
  var Stream = __require("stream");
  var Url = __require("url");
  var Symbols = require_symbols();
  var internals = {};
  exports = module.exports = internals.Request = class extends Stream.Readable {
    constructor(options) {
      super({
        emitClose: !!options.simulate?.close,
        autoDestroy: true
      });
      let url = options.url;
      if (typeof url === "object") {
        url = Url.format(url);
      }
      const uri = Url.parse(url);
      this.url = uri.path;
      this.httpVersion = "1.1";
      this.method = options.method ? options.method.toUpperCase() : "GET";
      this.headers = {};
      const headers = options.headers ?? {};
      const fields = Object.keys(headers);
      fields.forEach((field) => {
        this.headers[field.toLowerCase()] = headers[field];
      });
      this.headers["user-agent"] = this.headers["user-agent"] ?? "shot";
      const hostHeaderFromUri = function() {
        if (uri.port) {
          return uri.host;
        }
        if (uri.protocol) {
          return uri.hostname + (uri.protocol === "https:" ? ":443" : ":80");
        }
        return null;
      };
      this.headers.host = this.headers.host ?? hostHeaderFromUri() ?? options.authority ?? "localhost:80";
      this.socket = this.connection = new internals.MockSocket(options);
      let payload = options.payload ?? null;
      if (payload && typeof payload !== "string" && !(payload instanceof Stream) && !Buffer.isBuffer(payload)) {
        payload = JSON.stringify(payload);
        this.headers["content-type"] = this.headers["content-type"] || "application/json";
      }
      if (payload && !(payload instanceof Stream) && !this.headers.hasOwnProperty("content-length")) {
        this.headers["content-length"] = (Buffer.isBuffer(payload) ? payload.length : Buffer.byteLength(payload)).toString();
      }
      this._shot = {
        payload,
        isDone: false,
        simulate: options.simulate ?? {}
      };
      return this;
    }
    prepare(next) {
      if (this._shot.payload instanceof Stream === false) {
        return next();
      }
      const chunks = [];
      this._shot.payload.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      this._shot.payload.on("end", () => {
        const payload = Buffer.concat(chunks);
        this.headers["content-length"] = this.headers["content-length"] || payload.length;
        this._shot.payload = payload;
        return next();
      });
    }
    _read(size) {
      setImmediate(() => {
        if (this._shot.isDone) {
          if (this._shot.simulate.end !== false) {
            this.push(null);
          }
          return;
        }
        this._shot.isDone = true;
        if (this._shot.payload) {
          if (this._shot.simulate.split) {
            this.push(this._shot.payload.slice(0, 1));
            this.push(this._shot.payload.slice(1));
          } else {
            this.push(this._shot.payload);
          }
        }
        if (this._shot.simulate.error) {
          this.destroy(new Error("Simulated"));
        } else if (this._shot.simulate.end !== false) {
          this.push(null);
        } else if (this._shot.simulate.close) {
          this.emit("close");
        }
      });
    }
  };
  internals.Request.prototype[Symbols.injection] = true;
  internals.MockSocket = class MockSocket extends Events.EventEmitter {
    constructor({ remoteAddress }) {
      super();
      this.remoteAddress = remoteAddress ?? "127.0.0.1";
    }
    end() {
    }
    setTimeout() {
    }
  };
});

// node_modules/@hapi/shot/lib/response.js
var require_response = __commonJS((exports, module) => {
  var Http = __require("http");
  var Stream = __require("stream");
  var Symbols = require_symbols();
  var internals = {};
  exports = module.exports = internals.Response = class extends Http.ServerResponse {
    constructor(req, onEnd) {
      super({ method: req.method, httpVersionMajor: 1, httpVersionMinor: 1 });
      this._shot = { headers: null, trailers: {}, payloadChunks: [] };
      this.assignSocket(internals.nullSocket());
      if (req._shot.simulate.close) {
        req.once("close", () => {
          process.nextTick(() => this.emit("close"));
        });
      }
      this.once("finish", () => {
        const res = internals.payload(this);
        res.raw.req = req;
        process.nextTick(() => onEnd(res));
      });
    }
    writeHead(...args) {
      const headers = args[args.length - 1];
      if (typeof headers === "object" && headers !== null) {
        const headerNames = Object.keys(headers);
        for (let i = 0;i < headerNames.length; ++i) {
          const name = headerNames[i];
          try {
            this.setHeader(name, headers[name]);
            break;
          } catch (ignoreErr) {
          }
        }
      }
      const result = super.writeHead(...args);
      this._shot.headers = this.getHeaders();
      ["Date", "Connection", "Transfer-Encoding"].forEach((name) => {
        const regex = new RegExp("\\r\\n" + name + ": ([^\\r]*)\\r\\n");
        const field = this._header.match(regex);
        if (field) {
          this._shot.headers[name.toLowerCase()] = field[1];
        }
      });
      return result;
    }
    write(data, encoding, callback) {
      super.write(data, encoding, callback);
      this._shot.payloadChunks.push(Buffer.from(data, encoding));
      return true;
    }
    end(data, encoding, callback) {
      if (data) {
        this.write(data, encoding);
      }
      super.end(callback);
      this.emit("finish");
    }
    addTrailers(trailers) {
      for (const key in trailers) {
        this._shot.trailers[key.toLowerCase().trim()] = trailers[key].toString().trim();
      }
    }
  };
  internals.Response.prototype[Symbols.injection] = true;
  internals.payload = function(response) {
    const res = {
      raw: {
        res: response
      },
      headers: response._shot.headers,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      trailers: {}
    };
    const rawBuffer = Buffer.concat(response._shot.payloadChunks);
    res.rawPayload = rawBuffer;
    res.payload = rawBuffer.toString();
    res.trailers = response._shot.trailers;
    return res;
  };
  internals.nullSocket = function() {
    return new Stream.Writable({
      write(chunk, encoding, callback) {
        setImmediate(callback);
      }
    });
  };
});

// node_modules/@hapi/shot/lib/index.js
var require_lib4 = __commonJS((exports) => {
  var Hoek = require_lib();
  var Validate = require_lib3();
  var Request = require_request();
  var Response = require_response();
  var Symbols = require_symbols();
  var internals = {};
  internals.options = Validate.object().keys({
    url: Validate.alternatives([
      Validate.string(),
      Validate.object().keys({
        protocol: Validate.string(),
        hostname: Validate.string(),
        port: Validate.any(),
        pathname: Validate.string().required(),
        query: Validate.any()
      })
    ]).required(),
    headers: Validate.object(),
    payload: Validate.any(),
    simulate: {
      end: Validate.boolean(),
      split: Validate.boolean(),
      error: Validate.boolean(),
      close: Validate.boolean()
    },
    authority: Validate.string(),
    remoteAddress: Validate.string(),
    method: Validate.string(),
    validate: Validate.boolean()
  });
  exports.inject = function(dispatchFunc, options) {
    options = typeof options === "string" ? { url: options } : options;
    if (options.validate !== false) {
      try {
        Hoek.assert(typeof dispatchFunc === "function", "Invalid dispatch function");
        Validate.assert(options, internals.options);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return new Promise((resolve) => {
      const req = new Request(options);
      const res = new Response(req, resolve);
      req.prepare(() => dispatchFunc(req, res));
    });
  };
  exports.isInjection = function(obj) {
    return !!obj[Symbols.injection];
  };
});

// node_modules/@hapi/teamwork/lib/index.js
var require_lib5 = __commonJS((exports) => {
  var internals = {};
  exports.Team = class {
    #meetings = null;
    #count = null;
    #notes = null;
    #done = false;
    #strict = false;
    constructor(options) {
      this._init(options);
    }
    static _notes(instance) {
      return instance.#notes;
    }
    _init(options = {}) {
      this.work = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
      const meetings = options.meetings || 1;
      this.#meetings = meetings;
      this.#count = meetings;
      this.#notes = [];
      this.#done = false;
      this.#strict = options.strict;
    }
    attend(note) {
      if (this.#strict && this.#done) {
        throw new Error("Unscheduled meeting");
      } else if (this.#done) {
        return;
      }
      if (note instanceof Error) {
        this.#done = true;
        this.#notes = null;
        return this._reject(note);
      }
      this.#notes.push(note);
      if (--this.#count) {
        return;
      }
      this.#done = true;
      this._resolve(this.#meetings === 1 ? this.#notes[0] : [...this.#notes]);
      this.#notes = null;
    }
    async regroup(options) {
      await this.work;
      this._init(options);
    }
  };
  exports.Events = class {
    #pending = null;
    #queue = [];
    static isIterator(iterator) {
      return iterator instanceof internals.EventsIterator;
    }
    iterator() {
      return new internals.EventsIterator(this);
    }
    emit(value) {
      this._queue({ value, done: false });
    }
    end() {
      this._queue({ done: true });
    }
    _next() {
      if (this.#queue.length) {
        return Promise.resolve(this.#queue.shift());
      }
      this.#pending = new exports.Team;
      return this.#pending.work;
    }
    _queue(item) {
      if (this.#pending) {
        this.#pending.attend(item);
        this.#pending = null;
      } else {
        this.#queue.push(item);
      }
    }
  };
  internals.EventsIterator = class {
    #events = null;
    constructor(events) {
      this.#events = events;
    }
    [Symbol.asyncIterator]() {
      return this;
    }
    next() {
      return this.#events._next();
    }
  };
});

// node_modules/@hapi/boom/lib/index.js
var require_lib6 = __commonJS((exports) => {
  var Hoek = require_lib();
  var internals = {
    codes: new Map([
      [100, "Continue"],
      [101, "Switching Protocols"],
      [102, "Processing"],
      [200, "OK"],
      [201, "Created"],
      [202, "Accepted"],
      [203, "Non-Authoritative Information"],
      [204, "No Content"],
      [205, "Reset Content"],
      [206, "Partial Content"],
      [207, "Multi-Status"],
      [300, "Multiple Choices"],
      [301, "Moved Permanently"],
      [302, "Moved Temporarily"],
      [303, "See Other"],
      [304, "Not Modified"],
      [305, "Use Proxy"],
      [307, "Temporary Redirect"],
      [400, "Bad Request"],
      [401, "Unauthorized"],
      [402, "Payment Required"],
      [403, "Forbidden"],
      [404, "Not Found"],
      [405, "Method Not Allowed"],
      [406, "Not Acceptable"],
      [407, "Proxy Authentication Required"],
      [408, "Request Time-out"],
      [409, "Conflict"],
      [410, "Gone"],
      [411, "Length Required"],
      [412, "Precondition Failed"],
      [413, "Request Entity Too Large"],
      [414, "Request-URI Too Large"],
      [415, "Unsupported Media Type"],
      [416, "Requested Range Not Satisfiable"],
      [417, "Expectation Failed"],
      [418, "I\'m a teapot"],
      [422, "Unprocessable Entity"],
      [423, "Locked"],
      [424, "Failed Dependency"],
      [425, "Too Early"],
      [426, "Upgrade Required"],
      [428, "Precondition Required"],
      [429, "Too Many Requests"],
      [431, "Request Header Fields Too Large"],
      [451, "Unavailable For Legal Reasons"],
      [500, "Internal Server Error"],
      [501, "Not Implemented"],
      [502, "Bad Gateway"],
      [503, "Service Unavailable"],
      [504, "Gateway Time-out"],
      [505, "HTTP Version Not Supported"],
      [506, "Variant Also Negotiates"],
      [507, "Insufficient Storage"],
      [509, "Bandwidth Limit Exceeded"],
      [510, "Not Extended"],
      [511, "Network Authentication Required"]
    ])
  };
  exports.Boom = class extends Error {
    constructor(messageOrError, options = {}) {
      if (messageOrError instanceof Error) {
        return exports.boomify(Hoek.clone(messageOrError), options);
      }
      const { statusCode = 500, data = null, ctor = exports.Boom } = options;
      const error = new Error(messageOrError ? messageOrError : undefined);
      Error.captureStackTrace(error, ctor);
      error.data = data;
      const boom = internals.initialize(error, statusCode);
      Object.defineProperty(boom, "typeof", { value: ctor });
      if (options.decorate) {
        Object.assign(boom, options.decorate);
      }
      return boom;
    }
    static [Symbol.hasInstance](instance) {
      if (this === exports.Boom) {
        return exports.isBoom(instance);
      }
      return this.prototype.isPrototypeOf(instance);
    }
  };
  exports.isBoom = function(err, statusCode) {
    return err instanceof Error && !!err.isBoom && (!statusCode || err.output.statusCode === statusCode);
  };
  exports.boomify = function(err, options) {
    Hoek.assert(err instanceof Error, "Cannot wrap non-Error object");
    options = options || {};
    if (options.data !== undefined) {
      err.data = options.data;
    }
    if (options.decorate) {
      Object.assign(err, options.decorate);
    }
    if (!err.isBoom) {
      return internals.initialize(err, options.statusCode ?? 500, options.message);
    }
    if (options.override === false || !options.statusCode && !options.message) {
      return err;
    }
    return internals.initialize(err, options.statusCode ?? err.output.statusCode, options.message);
  };
  exports.badRequest = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 400, data, ctor: exports.badRequest });
  };
  exports.unauthorized = function(message, scheme, attributes) {
    const err = new exports.Boom(message, { statusCode: 401, ctor: exports.unauthorized });
    if (!scheme) {
      return err;
    }
    if (typeof scheme !== "string") {
      err.output.headers["WWW-Authenticate"] = scheme.join(", ");
      return err;
    }
    let wwwAuthenticate = `${scheme}`;
    if (attributes || message) {
      err.output.payload.attributes = {};
    }
    if (attributes) {
      if (typeof attributes === "string") {
        wwwAuthenticate += " " + Hoek.escapeHeaderAttribute(attributes);
        err.output.payload.attributes = attributes;
      } else {
        wwwAuthenticate += " " + Object.keys(attributes).map((name) => {
          const value = attributes[name] ?? "";
          err.output.payload.attributes[name] = value;
          return `${name}="${Hoek.escapeHeaderAttribute(value.toString())}"`;
        }).join(", ");
      }
    }
    if (message) {
      if (attributes) {
        wwwAuthenticate += ",";
      }
      wwwAuthenticate += ` error="${Hoek.escapeHeaderAttribute(message)}"`;
      err.output.payload.attributes.error = message;
    } else {
      err.isMissing = true;
    }
    err.output.headers["WWW-Authenticate"] = wwwAuthenticate;
    return err;
  };
  exports.paymentRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 402, data, ctor: exports.paymentRequired });
  };
  exports.forbidden = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 403, data, ctor: exports.forbidden });
  };
  exports.notFound = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 404, data, ctor: exports.notFound });
  };
  exports.methodNotAllowed = function(messageOrError, data, allow) {
    const err = new exports.Boom(messageOrError, { statusCode: 405, data, ctor: exports.methodNotAllowed });
    if (typeof allow === "string") {
      allow = [allow];
    }
    if (Array.isArray(allow)) {
      err.output.headers.Allow = allow.join(", ");
    }
    return err;
  };
  exports.notAcceptable = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 406, data, ctor: exports.notAcceptable });
  };
  exports.proxyAuthRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 407, data, ctor: exports.proxyAuthRequired });
  };
  exports.clientTimeout = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 408, data, ctor: exports.clientTimeout });
  };
  exports.conflict = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 409, data, ctor: exports.conflict });
  };
  exports.resourceGone = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 410, data, ctor: exports.resourceGone });
  };
  exports.lengthRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 411, data, ctor: exports.lengthRequired });
  };
  exports.preconditionFailed = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 412, data, ctor: exports.preconditionFailed });
  };
  exports.entityTooLarge = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 413, data, ctor: exports.entityTooLarge });
  };
  exports.uriTooLong = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 414, data, ctor: exports.uriTooLong });
  };
  exports.unsupportedMediaType = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 415, data, ctor: exports.unsupportedMediaType });
  };
  exports.rangeNotSatisfiable = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 416, data, ctor: exports.rangeNotSatisfiable });
  };
  exports.expectationFailed = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 417, data, ctor: exports.expectationFailed });
  };
  exports.teapot = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 418, data, ctor: exports.teapot });
  };
  exports.badData = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 422, data, ctor: exports.badData });
  };
  exports.locked = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 423, data, ctor: exports.locked });
  };
  exports.failedDependency = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 424, data, ctor: exports.failedDependency });
  };
  exports.tooEarly = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 425, data, ctor: exports.tooEarly });
  };
  exports.preconditionRequired = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 428, data, ctor: exports.preconditionRequired });
  };
  exports.tooManyRequests = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 429, data, ctor: exports.tooManyRequests });
  };
  exports.illegal = function(messageOrError, data) {
    return new exports.Boom(messageOrError, { statusCode: 451, data, ctor: exports.illegal });
  };
  exports.internal = function(message, data, statusCode = 500) {
    return internals.serverError(message, data, statusCode, exports.internal);
  };
  exports.notImplemented = function(message, data) {
    return internals.serverError(message, data, 501, exports.notImplemented);
  };
  exports.badGateway = function(message, data) {
    return internals.serverError(message, data, 502, exports.badGateway);
  };
  exports.serverUnavailable = function(message, data) {
    return internals.serverError(message, data, 503, exports.serverUnavailable);
  };
  exports.gatewayTimeout = function(message, data) {
    return internals.serverError(message, data, 504, exports.gatewayTimeout);
  };
  exports.badImplementation = function(message, data) {
    const err = internals.serverError(message, data, 500, exports.badImplementation);
    err.isDeveloperError = true;
    return err;
  };
  internals.initialize = function(err, statusCode, message) {
    const numberCode = parseInt(statusCode, 10);
    Hoek.assert(!isNaN(numberCode) && numberCode >= 400, "First argument must be a number (400+):", statusCode);
    err.isBoom = true;
    err.isServer = numberCode >= 500;
    if (!err.hasOwnProperty("data")) {
      err.data = null;
    }
    err.output = {
      statusCode: numberCode,
      payload: {},
      headers: {}
    };
    Object.defineProperty(err, "reformat", { value: internals.reformat, configurable: true });
    if (!message && !err.message) {
      err.reformat();
      message = err.output.payload.error;
    }
    if (message) {
      const props = Object.getOwnPropertyDescriptor(err, "message") || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(err), "message");
      Hoek.assert(!props || props.configurable && !props.get, "The error is not compatible with boom");
      err.message = message + (err.message ? ": " + err.message : "");
      err.output.payload.message = err.message;
    }
    err.reformat();
    return err;
  };
  internals.reformat = function(debug = false) {
    this.output.payload.statusCode = this.output.statusCode;
    this.output.payload.error = internals.codes.get(this.output.statusCode) || "Unknown";
    if (this.output.statusCode === 500 && debug !== true) {
      this.output.payload.message = "An internal server error occurred";
    } else if (this.message) {
      this.output.payload.message = this.message;
    }
  };
  internals.serverError = function(messageOrError, data, statusCode, ctor) {
    if (data instanceof Error && !data.isBoom) {
      return exports.boomify(data, { statusCode, message: messageOrError });
    }
    return new exports.Boom(messageOrError, { statusCode, data, ctor });
  };
});

// node_modules/@hapi/bounce/lib/index.js
var require_lib7 = __commonJS((exports) => {
  var Assert = __require("assert");
  var Boom = require_lib6();
  var Hoek = require_lib();
  var internals = {
    system: [
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      Assert.AssertionError,
      Hoek.AssertError
    ]
  };
  exports.rethrow = function(err, types, options = {}) {
    return internals.catch(err, types, options, true);
  };
  exports.ignore = function(err, types, options = {}) {
    return internals.catch(err, types, options, false);
  };
  internals.catch = function(err, types, options, match) {
    if (internals.match(err, types) !== match) {
      return;
    }
    if (options.override) {
      err = options.override;
    }
    if (options.decorate) {
      Object.assign(err, options.decorate);
    }
    if (options.return) {
      return err;
    }
    throw err;
  };
  exports.background = async function(operation, action = "rethrow", types = "system", options = {}) {
    try {
      if (typeof operation === "function") {
        await operation();
      } else {
        await operation;
      }
    } catch (err) {
      return exports[action](err, types, options);
    }
  };
  exports.isBoom = function(err) {
    return Boom.isBoom(err);
  };
  exports.isError = function(err) {
    return err instanceof Error;
  };
  exports.isSystem = function(err) {
    if (!err) {
      return false;
    }
    if (err.isBoom) {
      return false;
    }
    for (const system of internals.system) {
      if (err instanceof system) {
        return true;
      }
    }
    return false;
  };
  internals.rules = {
    system: exports.isSystem,
    boom: exports.isBoom
  };
  internals.match = function(err, types) {
    if (!types) {
      return true;
    }
    types = Array.isArray(types) ? types : [types];
    for (const type of types) {
      if (typeof type === "string") {
        if (internals.rules[type](err)) {
          return true;
        }
      } else if (typeof type === "object") {
        if (Hoek.contain(err, type, { deep: true, part: true })) {
          return true;
        }
      } else if (err instanceof type) {
        return true;
      }
    }
    return false;
  };
});

// node_modules/@hapi/somever/lib/index.js
var require_lib8 = __commonJS((exports) => {
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var internals = {
    maxLength: 256,
    wildcards: ["x", "X", "*"],
    any: Symbol("any")
  };
  internals.versionRx = /^\s*[vV]?(\d+|[xX*])(?:\.(\d+|[xX*])(?:\.(\d+|[xX*])(?:\-?([^+]+))?(?:\+(.+))?)?)?\s*$/;
  internals.strict = {
    tokenRx: /^[-\dA-Za-z]+(?:\.[-\dA-Za-z]+)*$/,
    numberRx: /^((?:0)|(?:[1-9]\d*))$/
  };
  exports.version = function(version, options) {
    return new internals.Version(version, options);
  };
  exports.range = function(range) {
    return new internals.Range(range);
  };
  exports.match = function(version, range, options) {
    try {
      return exports.range(range).match(version, options);
    } catch (err) {
      Bounce.rethrow(err, "system");
      return false;
    }
  };
  exports.compare = function(a, b, options = {}) {
    let aFirst = -1;
    let bFirst = 1;
    a = exports.version(a, options);
    b = exports.version(b, options);
    if (options.range && !options.includePrerelease && a.prerelease.length && (a.major !== b.major || a.minor !== b.minor || a.patch !== b.patch || !b.prerelease.length)) {
      aFirst = -2;
      bFirst = 2;
    }
    for (let i = 0;i < 3; ++i) {
      const av = a.dots[i];
      const bv = b.dots[i];
      if (av === bv || av === internals.any || bv === internals.any) {
        continue;
      }
      return av - bv < 0 ? aFirst : bFirst;
    }
    if (!a.prerelease.length && !b.prerelease.length) {
      return 0;
    } else if (!b.prerelease.length) {
      return options.includePrerelease && b.patch === internals.any ? 0 : aFirst;
    } else if (!a.prerelease.length) {
      return options.includePrerelease && a.patch === internals.any ? 0 : bFirst;
    }
    for (let i = 0;; ++i) {
      const ai = a.prerelease[i];
      const bi = b.prerelease[i];
      if (ai === undefined && bi === undefined) {
        return 0;
      }
      if (ai === bi) {
        continue;
      }
      if (ai === undefined) {
        return aFirst;
      }
      if (bi === undefined) {
        return bFirst;
      }
      const an = Number.isFinite(ai);
      const bn = Number.isFinite(bi);
      if (an !== bn) {
        return an ? aFirst : bFirst;
      }
      return ai < bi ? aFirst : bFirst;
    }
  };
  internals.Version = class {
    constructor(version, options = {}) {
      Hoek.assert(version, "Missing version argument");
      if (version instanceof internals.Version) {
        return version;
      }
      if (typeof version === "object") {
        this._copy(version);
      } else {
        this._parse(version, options);
      }
      this.format();
    }
    _copy(version) {
      this.major = version.major === undefined ? internals.any : version.major;
      this.minor = version.minor === undefined ? internals.any : version.minor;
      this.patch = version.patch === undefined ? internals.any : version.patch;
      this.prerelease = version.prerelease ?? [];
      this.build = version.build ?? [];
    }
    _parse(version, options) {
      Hoek.assert(typeof version === "string", "Version argument must be a string");
      Hoek.assert(version.length <= internals.maxLength, "Version string too long");
      const match = version.match(internals.versionRx);
      if (!match) {
        throw new Error(`Invalid version string format: ${version}`);
      }
      this.major = internals.Version._number(match[1], "major", options);
      this.minor = internals.Version._number(match[2] || "x", "minor", options);
      this.patch = internals.Version._number(match[3] || "x", "patch", options);
      this.prerelease = internals.Version._sub(match[4], "prerelease", options);
      this.build = internals.Version._sub(match[5], "build", options);
    }
    static _number(string, source, options) {
      if (internals.wildcards.includes(string)) {
        return internals.any;
      }
      if (options.strict) {
        Hoek.assert(string.match(internals.strict.numberRx), "Value must be 0 or a number without a leading zero:", source);
      }
      const value = parseInt(string, 10);
      Hoek.assert(value <= Number.MAX_SAFE_INTEGER, "Value must be positive and less than max safe integer:", source);
      return value;
    }
    static _sub(string, source, options) {
      if (!string) {
        return [];
      }
      if (options.strict) {
        Hoek.assert(string.match(internals.strict.tokenRx), "Value can only contain dot-separated hyphens, digits, a-z or A-Z:", source);
      }
      const subs = [];
      const parts = string.split(".");
      for (const part of parts) {
        if (!part) {
          throw new Error(`Invalid empty ${source} segment`);
        }
        subs.push(part.match(/^\d+$/) ? internals.Version._number(part, source, { strict: options.strict }) : part);
      }
      return subs;
    }
    format() {
      this.version = `${internals.dot(this.major)}.${internals.dot(this.minor)}.${internals.dot(this.patch)}${internals.token(this.prerelease, "-")}${internals.token(this.build, "+")}`;
      this.dots = [this.major, this.minor, this.patch];
      this.wildcard = this.major === internals.any && this.minor === internals.any && this.patch === internals.any && !this.prerelease.length;
    }
    toString() {
      return this.version;
    }
    compare(to, options) {
      return internals.Version.compare(this, to, options);
    }
    static compare(a, b, options = {}) {
      return exports.compare(a, b, options);
    }
  };
  internals.dot = (v) => {
    return v === internals.any ? "x" : v;
  };
  internals.token = (v, prefix) => {
    if (!v.length) {
      return "";
    }
    return `${prefix}${v.join(".")}`;
  };
  internals.Range = class {
    constructor(range, options) {
      this._settings = Object.assign({}, options);
      this._anything = false;
      this._or = [];
      this._active = null;
      if (range !== undefined) {
        this.pattern(range);
      }
      this._another();
    }
    _another() {
      if (!this._active || this._active.rules.length) {
        this._active = { rules: [] };
        this._or.push(this._active);
      }
      return this;
    }
    _rule(operator, version) {
      version = exports.version(version, this._settings);
      const compare = internals.operator(operator);
      this._active.rules.push({ compare, version, operator });
      return this;
    }
    get or() {
      return this._another();
    }
    equal(version) {
      return this._rule("=", version);
    }
    above(version) {
      return this._rule(">", version);
    }
    below(version) {
      return this._rule("<", version);
    }
    between(from, to) {
      this._rule(">=", from);
      this._rule("<=", to);
      return this;
    }
    minor(version) {
      version = exports.version(version, this._settings);
      if (version.major === internals.any) {
        this._rule("=", version);
        return this;
      }
      this._rule(">=", version);
      if (version.minor === internals.any) {
        this._rule("<", { major: version.major + 1, minor: 0, patch: 0, prerelease: [0] });
      } else {
        this._rule("<", { major: version.major, minor: version.minor + 1, patch: 0, prerelease: [0] });
      }
      return this;
    }
    compatible(version) {
      version = exports.version(version, this._settings);
      if (version.major === internals.any) {
        this._rule("=", version);
        return this;
      }
      this._rule(">=", version);
      if (version.major === 0 && version.minor !== internals.any) {
        if (version.minor === 0) {
          this._rule("<", { major: 0, minor: 0, patch: version.patch + 1, prerelease: [0] });
        } else {
          this._rule("<", { major: 0, minor: version.minor + 1, patch: 0, prerelease: [0] });
        }
      } else {
        this._rule("<", { major: version.major + 1, minor: 0, patch: 0, prerelease: [0] });
      }
      return this;
    }
    pattern(range) {
      try {
        this._pattern(range);
        return this;
      } catch (err) {
        throw new Error(`Invalid range: "${range}" because: ${err.message}`);
      }
    }
    _pattern(range) {
      if (range === "") {
        this._anything = true;
        return;
      }
      const normalized = internals.normalize(range);
      const ors = normalized.split(/\s*\|\|\s*/);
      for (const condition of ors) {
        if (!condition) {
          this._anything = true;
          return;
        }
        this._another();
        const ands = condition.split(/\s+/);
        for (const and of ands) {
          const hyphen = and.indexOf("@");
          if (hyphen !== -1) {
            const from = and.slice(0, hyphen);
            const to = and.slice(hyphen + 1);
            this.between(from, to);
            continue;
          }
          const parts = and.match(/^(\^|~|<\=|>\=|<|>|\=)?(.+)$/);
          const operator = parts[1];
          const version = exports.version(parts[2], this._settings);
          if (version.wildcard) {
            this._anything = true;
            return;
          }
          if (operator === "~") {
            this.minor(version);
            continue;
          }
          if (operator === "^") {
            this.compatible(version);
            continue;
          }
          if (operator) {
            this._rule(operator, version);
            continue;
          }
          this.equal(version);
        }
      }
    }
    match(version, options = {}) {
      version = exports.version(version, this._settings);
      if (this._anything) {
        return !!options.includePrerelease || !version.prerelease.length;
      }
      for (const { rules } of this._or) {
        if (!rules.length) {
          continue;
        }
        let matches = 0;
        let excludes = 0;
        for (const rule of rules) {
          const compare = version.compare(rule.version, Object.assign(this._settings, options, { range: true }));
          const exclude = Math.abs(compare) === 2;
          if (rule.compare.includes(compare / (exclude ? 2 : 1))) {
            ++matches;
            if (exclude) {
              ++excludes;
            }
          } else {
            break;
          }
        }
        if (matches === rules.length && excludes < matches) {
          return true;
        }
      }
      return false;
    }
    toString() {
      if (this._anything) {
        return "*";
      }
      let string = "";
      for (const { rules } of this._or) {
        if (!rules.length) {
          continue;
        }
        const conditions = [];
        for (const rule of rules) {
          conditions.push(`${rule.operator !== "=" ? rule.operator : ""}${rule.version.version}`);
        }
        string += (string ? "||" : "") + conditions.join(" ");
      }
      return string;
    }
  };
  internals.operator = function(compare) {
    switch (compare) {
      case "=":
        return [0];
      case ">":
        return [1];
      case ">=":
        return [0, 1];
      case "<":
        return [-1];
      case "<=":
        return [0, -1];
    }
  };
  internals.normalize = function(range) {
    return range.replace(/ \- /g, "@").replace(/~>/g, "~").replace(/(\^|~|<\=|>\=|<|>|\=)\s*([^\s]+)/g, ($0, $1, $2) => `${$1}${$2}`);
  };
});

// node_modules/@hapi/hapi/lib/config.js
var require_config = __commonJS((exports) => {
  var Os = __require("os");
  var Somever = require_lib8();
  var Validate = require_lib3();
  var internals = {};
  exports.symbol = Symbol("hapi-response");
  exports.apply = function(type, options, ...message) {
    const result = internals[type].validate(options);
    if (result.error) {
      throw new Error(`Invalid ${type} options ${message.length ? "(" + message.join(" ") + ")" : ""} ${result.error.annotate()}`);
    }
    return result.value;
  };
  exports.enable = function(options) {
    const settings = options ? Object.assign({}, options) : {};
    if (settings.security === true) {
      settings.security = {};
    }
    if (settings.cors === true) {
      settings.cors = {};
    }
    return settings;
  };
  exports.versionMatch = (version, range) => Somever.match(version, range, { includePrerelease: true });
  internals.access = Validate.object({
    entity: Validate.valid("user", "app", "any"),
    scope: [false, Validate.array().items(Validate.string()).single().min(1)]
  });
  internals.auth = Validate.alternatives([
    Validate.string(),
    internals.access.keys({
      mode: Validate.valid("required", "optional", "try"),
      strategy: Validate.string(),
      strategies: Validate.array().items(Validate.string()).min(1),
      access: Validate.array().items(internals.access.min(1)).single().min(1),
      payload: [
        Validate.valid("required", "optional"),
        Validate.boolean()
      ]
    }).without("strategy", "strategies").without("access", ["scope", "entity"])
  ]);
  internals.event = Validate.object({
    method: Validate.array().items(Validate.function()).single(),
    options: Validate.object({
      before: Validate.array().items(Validate.string()).single(),
      after: Validate.array().items(Validate.string()).single(),
      bind: Validate.any(),
      sandbox: Validate.valid("server", "plugin"),
      timeout: Validate.number().integer().min(1)
    }).default({})
  });
  internals.exts = Validate.array().items(internals.event.keys({ type: Validate.string().required() })).single();
  internals.failAction = Validate.alternatives([
    Validate.valid("error", "log", "ignore"),
    Validate.function()
  ]).default("error");
  internals.routeBase = Validate.object({
    app: Validate.object().allow(null),
    auth: internals.auth.allow(false),
    bind: Validate.object().allow(null),
    cache: Validate.object({
      expiresIn: Validate.number(),
      expiresAt: Validate.string(),
      privacy: Validate.valid("default", "public", "private"),
      statuses: Validate.array().items(Validate.number().integer().min(200)).min(1).single().default([200, 204]),
      otherwise: Validate.string().default("no-cache")
    }).allow(false).default(),
    compression: Validate.object().pattern(/.+/, Validate.object()).default(),
    cors: Validate.object({
      origin: Validate.array().min(1).allow("ignore").default(["*"]),
      maxAge: Validate.number().default(86400),
      headers: Validate.array().items(Validate.string()).default(["Accept", "Authorization", "Content-Type", "If-None-Match"]),
      additionalHeaders: Validate.array().items(Validate.string()).default([]),
      exposedHeaders: Validate.array().items(Validate.string()).default(["WWW-Authenticate", "Server-Authorization"]),
      additionalExposedHeaders: Validate.array().items(Validate.string()).default([]),
      credentials: Validate.boolean().when("origin", { is: "ignore", then: false }).default(false),
      preflightStatusCode: Validate.valid(200, 204).default(200)
    }).allow(false, true).default(false),
    ext: Validate.object({
      onPreAuth: Validate.array().items(internals.event).single(),
      onCredentials: Validate.array().items(internals.event).single(),
      onPostAuth: Validate.array().items(internals.event).single(),
      onPreHandler: Validate.array().items(internals.event).single(),
      onPostHandler: Validate.array().items(internals.event).single(),
      onPreResponse: Validate.array().items(internals.event).single(),
      onPostResponse: Validate.array().items(internals.event).single()
    }).default({}),
    files: Validate.object({
      relativeTo: Validate.string().pattern(/^([\/\.])|([A-Za-z]:\\)|(\\\\)/).default(".")
    }).default(),
    json: Validate.object({
      replacer: Validate.alternatives(Validate.function(), Validate.array()).allow(null).default(null),
      space: Validate.number().allow(null).default(null),
      suffix: Validate.string().allow(null).default(null),
      escape: Validate.boolean().default(false)
    }).default(),
    log: Validate.object({
      collect: Validate.boolean().default(false)
    }).default(),
    payload: Validate.object({
      output: Validate.valid("data", "stream", "file").default("data"),
      parse: Validate.boolean().allow("gunzip").default(true),
      multipart: Validate.object({
        output: Validate.valid("data", "stream", "file", "annotated").required()
      }).default(false).allow(true, false),
      allow: Validate.array().items(Validate.string()).single(),
      override: Validate.string(),
      protoAction: Validate.valid("error", "remove", "ignore").default("error"),
      maxBytes: Validate.number().integer().positive().default(1024 * 1024),
      maxParts: Validate.number().integer().positive().default(1000),
      uploads: Validate.string().default(Os.tmpdir()),
      failAction: internals.failAction,
      timeout: Validate.number().integer().positive().allow(false).default(10 * 1000),
      defaultContentType: Validate.string().default("application/json"),
      compression: Validate.object().pattern(/.+/, Validate.object()).default()
    }).default(),
    plugins: Validate.object(),
    response: Validate.object({
      disconnectStatusCode: Validate.number().integer().min(400).default(499),
      emptyStatusCode: Validate.valid(200, 204).default(204),
      failAction: internals.failAction,
      modify: Validate.boolean(),
      options: Validate.object(),
      ranges: Validate.boolean().default(true),
      sample: Validate.number().min(0).max(100).when("modify", { then: Validate.forbidden() }),
      schema: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(true, false),
      status: Validate.object().pattern(/\d\d\d/, Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(true, false))
    }).default(),
    security: Validate.object({
      hsts: Validate.alternatives([
        Validate.object({
          maxAge: Validate.number(),
          includeSubdomains: Validate.boolean(),
          includeSubDomains: Validate.boolean(),
          preload: Validate.boolean()
        }),
        Validate.boolean(),
        Validate.number()
      ]).default(15768000),
      xframe: Validate.alternatives([
        Validate.boolean(),
        Validate.valid("sameorigin", "deny"),
        Validate.object({
          rule: Validate.valid("sameorigin", "deny", "allow-from"),
          source: Validate.string()
        })
      ]).default("deny"),
      xss: Validate.valid("enabled", "disabled", false).default("disabled"),
      noOpen: Validate.boolean().default(true),
      noSniff: Validate.boolean().default(true),
      referrer: Validate.alternatives([
        Validate.boolean().valid(false),
        Validate.valid("", "no-referrer", "no-referrer-when-downgrade", "unsafe-url", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin")
      ]).default(false)
    }).allow(null, false, true).default(false),
    state: Validate.object({
      parse: Validate.boolean().default(true),
      failAction: internals.failAction
    }).default(),
    timeout: Validate.object({
      socket: Validate.number().integer().positive().allow(false),
      server: Validate.number().integer().positive().allow(false).default(false)
    }).default(),
    validate: Validate.object({
      headers: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(null, true),
      params: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(null, true),
      query: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(null, false, true),
      payload: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(null, false, true),
      state: Validate.alternatives(Validate.object(), Validate.array(), Validate.function()).allow(null, false, true),
      failAction: internals.failAction,
      errorFields: Validate.object(),
      options: Validate.object().default(),
      validator: Validate.object()
    }).default()
  });
  internals.server = Validate.object({
    address: Validate.string().hostname(),
    app: Validate.object().allow(null),
    autoListen: Validate.boolean(),
    cache: Validate.allow(null),
    compression: Validate.object({
      minBytes: Validate.number().min(1).integer().default(1024)
    }).allow(false).default(),
    debug: Validate.object({
      request: Validate.array().items(Validate.string()).single().allow(false).default(["implementation"]),
      log: Validate.array().items(Validate.string()).single().allow(false)
    }).allow(false).default(),
    host: Validate.string().hostname().allow(null),
    info: Validate.object({
      remote: Validate.boolean().default(false)
    }).default({}),
    listener: Validate.any(),
    load: Validate.object({
      sampleInterval: Validate.number().integer().min(0).default(0)
    }).unknown().default(),
    mime: Validate.object().empty(null).default(),
    operations: Validate.object({
      cleanStop: Validate.boolean().default(true)
    }).default(),
    plugins: Validate.object(),
    port: Validate.alternatives([
      Validate.number().integer().min(0),
      Validate.string().pattern(/\//),
      Validate.string().pattern(/^\\\\\.\\pipe\\/)
    ]).allow(null),
    query: Validate.object({
      parser: Validate.function()
    }).default(),
    router: Validate.object({
      isCaseSensitive: Validate.boolean().default(true),
      stripTrailingSlash: Validate.boolean().default(false)
    }).default(),
    routes: internals.routeBase.default(),
    state: Validate.object(),
    tls: Validate.alternatives([
      Validate.object().allow(null),
      Validate.boolean()
    ]),
    uri: Validate.string().pattern(/[^/]$/)
  });
  internals.vhost = Validate.alternatives([
    Validate.string().hostname(),
    Validate.array().items(Validate.string().hostname()).min(1)
  ]);
  internals.handler = Validate.alternatives([
    Validate.function(),
    Validate.object().length(1)
  ]);
  internals.route = Validate.object({
    method: Validate.string().pattern(/^[a-zA-Z0-9!#\$%&'\*\+\-\.^_`\|~]+$/).required(),
    path: Validate.string().required(),
    rules: Validate.object(),
    vhost: internals.vhost,
    handler: Validate.any(),
    options: Validate.any(),
    config: Validate.any()
  }).without("config", "options");
  internals.pre = [
    Validate.function(),
    Validate.object({
      method: Validate.alternatives(Validate.string(), Validate.function()).required(),
      assign: Validate.string(),
      mode: Validate.valid("serial", "parallel"),
      failAction: internals.failAction
    })
  ];
  internals.routeConfig = internals.routeBase.keys({
    description: Validate.string(),
    id: Validate.string(),
    isInternal: Validate.boolean(),
    notes: [
      Validate.string(),
      Validate.array().items(Validate.string())
    ],
    pre: Validate.array().items(...internals.pre.concat(Validate.array().items(...internals.pre).min(1))),
    tags: [
      Validate.string(),
      Validate.array().items(Validate.string())
    ]
  });
  internals.cacheConfig = Validate.alternatives([
    Validate.function(),
    Validate.object({
      name: Validate.string().invalid("_default"),
      shared: Validate.boolean(),
      provider: [
        Validate.function(),
        {
          constructor: Validate.function().required(),
          options: Validate.object({
            partition: Validate.string().default("hapi-cache")
          }).unknown().default({})
        }
      ],
      engine: Validate.object()
    }).xor("provider", "engine")
  ]);
  internals.cache = Validate.array().items(internals.cacheConfig).min(1).single();
  internals.cachePolicy = Validate.object({
    cache: Validate.string().allow(null).allow(""),
    segment: Validate.string(),
    shared: Validate.boolean()
  }).unknown();
  internals.method = Validate.object({
    bind: Validate.object().allow(null),
    generateKey: Validate.function(),
    cache: internals.cachePolicy
  });
  internals.methodObject = Validate.object({
    name: Validate.string().required(),
    method: Validate.function().required(),
    options: Validate.object()
  });
  internals.register = Validate.object({
    once: true,
    routes: Validate.object({
      prefix: Validate.string().pattern(/^\/.+/),
      vhost: internals.vhost
    }).default({})
  });
  internals.semver = Validate.string();
  internals.plugin = internals.register.keys({
    options: Validate.any(),
    plugin: Validate.object({
      register: Validate.function().required(),
      name: Validate.string().when("pkg.name", { is: Validate.exist(), otherwise: Validate.required() }),
      version: Validate.string(),
      multiple: Validate.boolean().default(false),
      dependencies: [
        Validate.array().items(Validate.string()).single(),
        Validate.object().pattern(/.+/, internals.semver)
      ],
      once: true,
      requirements: Validate.object({
        hapi: Validate.string(),
        node: Validate.string()
      }).default(),
      pkg: Validate.object({
        name: Validate.string(),
        version: Validate.string().default("0.0.0")
      }).unknown().default({})
    }).unknown()
  }).without("once", "options").unknown();
  internals.rules = Validate.object({
    validate: Validate.object({
      schema: Validate.alternatives(Validate.object(), Validate.array()).required(),
      options: Validate.object().default({ allowUnknown: true })
    })
  });
});

// node_modules/@hapi/call/lib/decode.js
var require_decode = __commonJS((exports) => {
  var internals = {};
  exports.decode = function(string) {
    let percentPos = string.indexOf("%");
    if (percentPos === -1) {
      return string;
    }
    let decoded = "";
    let last = 0;
    let codepoint = 0;
    let startOfOctets = percentPos;
    let state = internals.utf8.accept;
    while (percentPos > -1 && percentPos < string.length) {
      const high = internals.resolveHex(string[percentPos + 1], 4);
      const low = internals.resolveHex(string[percentPos + 2], 0);
      const byte = high | low;
      const type = internals.utf8.data[byte];
      state = internals.utf8.data[256 + state + type];
      codepoint = codepoint << 6 | byte & internals.utf8.data[364 + type];
      if (state === internals.utf8.accept) {
        decoded += string.slice(last, startOfOctets);
        decoded += codepoint <= 65535 ? String.fromCharCode(codepoint) : String.fromCharCode(55232 + (codepoint >> 10), 56320 + (codepoint & 1023));
        codepoint = 0;
        last = percentPos + 3;
        percentPos = string.indexOf("%", last);
        startOfOctets = percentPos;
        continue;
      }
      if (state === internals.utf8.reject) {
        return null;
      }
      percentPos += 3;
      if (percentPos >= string.length || string[percentPos] !== "%") {
        return null;
      }
    }
    return decoded + string.slice(last);
  };
  internals.resolveHex = function(char, shift) {
    const i = internals.hex[char];
    return i === undefined ? 255 : i << shift;
  };
  internals.hex = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    a: 10,
    A: 10,
    b: 11,
    B: 11,
    c: 12,
    C: 12,
    d: 13,
    D: 13,
    e: 14,
    E: 14,
    f: 15,
    F: 15
  };
  internals.utf8 = {
    accept: 12,
    reject: 0,
    data: [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      4,
      4,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      6,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      8,
      7,
      7,
      10,
      9,
      9,
      9,
      11,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      12,
      0,
      0,
      0,
      0,
      24,
      36,
      48,
      60,
      72,
      84,
      96,
      0,
      12,
      12,
      12,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      63,
      63,
      63,
      0,
      31,
      15,
      15,
      15,
      7,
      7,
      7
    ]
  };
});

// node_modules/@hapi/call/lib/regex.js
var require_regex = __commonJS((exports) => {
  exports.generate = function() {
    const empty = "(?:^\\/$)";
    const legalChars = "[\\w\\!\\$&\'\\(\\)\\*\\+\\,;\\=\\:@\\-\\.~]";
    const encoded = "%[A-F0-9]{2}";
    const literalChar = "(?:" + legalChars + "|" + encoded + ")";
    const literal = literalChar + "+";
    const literalOptional = literalChar + "*";
    const midParam = "(?:\\{\\w+(?:\\*[1-9]\\d*)?\\})";
    const endParam = "(?:\\/(?:\\{\\w+(?:(?:\\*(?:[1-9]\\d*)?)|(?:\\?))?\\})?)?";
    const partialParam = "(?:\\{\\w+\\??\\})";
    const mixedParam = "(?:(?:" + literal + partialParam + ")+" + literalOptional + ")|(?:" + partialParam + "(?:" + literal + partialParam + ")+" + literalOptional + ")|(?:" + partialParam + literal + ")";
    const segmentContent = "(?:" + literal + "|" + midParam + "|" + mixedParam + ")";
    const segment = "\\/" + segmentContent;
    const segments = "(?:" + segment + ")*";
    const path = "(?:^" + segments + endParam + "$)";
    const parseParam = "(" + literal + ")|(?:\\{(\\w+)(?:(\\*)(\\d+)?)?(\\?)?\\})";
    const expressions = {
      parseParam: new RegExp(parseParam, "g"),
      validatePath: new RegExp(empty + "|" + path),
      validatePathEncoded: /%(?:2[146-9A-E]|3[\dABD]|4[\dA-F]|5[\dAF]|6[1-9A-F]|7[\dAE])/g
    };
    return expressions;
  };
});

// node_modules/@hapi/call/lib/segment.js
var require_segment = __commonJS((exports, module) => {
  var Hoek = require_lib();
  var internals = {};
  exports = module.exports = internals.Segment = function() {
    this._edge = null;
    this._fulls = null;
    this._literals = null;
    this._param = null;
    this._mixed = null;
    this._wildcard = null;
  };
  internals.Segment.prototype.add = function(segments, record) {
    const current = segments[0];
    const remaining = segments.slice(1);
    const isEdge = !remaining.length;
    const literals = [];
    let isLiteral = true;
    for (let i = 0;i < segments.length && isLiteral; ++i) {
      isLiteral = segments[i].literal !== undefined;
      literals.push(segments[i].literal);
    }
    if (isLiteral) {
      this._fulls = this._fulls ?? new Map;
      let literal = "/" + literals.join("/");
      if (!record.settings.isCaseSensitive) {
        literal = literal.toLowerCase();
      }
      Hoek.assert(!this._fulls.has(literal), "New route", record.path, "conflicts with existing", this._fulls.get(literal)?.record.path);
      this._fulls.set(literal, { segment: current, record });
    } else if (current.literal !== undefined) {
      this._literals = this._literals ?? new Map;
      const currentLiteral = record.settings.isCaseSensitive ? current.literal : current.literal.toLowerCase();
      if (!this._literals.has(currentLiteral)) {
        this._literals.set(currentLiteral, new internals.Segment);
      }
      this._literals.get(currentLiteral).add(remaining, record);
    } else if (current.wildcard) {
      Hoek.assert(!this._wildcard, "New route", record.path, "conflicts with existing", this._wildcard?.record.path);
      Hoek.assert(!this._param || !this._param._wildcard, "New route", record.path, "conflicts with existing", this._param?._wildcard?.record.path);
      this._wildcard = { segment: current, record };
    } else if (current.mixed) {
      this._mixed = this._mixed ?? [];
      let mixed = this._mixedLookup(current);
      if (!mixed) {
        mixed = { segment: current, node: new internals.Segment };
        this._mixed.push(mixed);
        this._mixed.sort(internals.mixed);
      }
      if (isEdge) {
        Hoek.assert(!mixed.node._edge, "New route", record.path, "conflicts with existing", mixed.node._edge?.record.path);
        mixed.node._edge = { segment: current, record };
      } else {
        mixed.node.add(remaining, record);
      }
    } else {
      this._param = this._param ?? new internals.Segment;
      if (isEdge) {
        Hoek.assert(!this._param._edge, "New route", record.path, "conflicts with existing", this._param._edge?.record.path);
        this._param._edge = { segment: current, record };
      } else {
        Hoek.assert(!this._wildcard || !remaining[0].wildcard, "New route", record.path, "conflicts with existing", this._wildcard?.record.path);
        this._param.add(remaining, record);
      }
    }
  };
  internals.Segment.prototype._mixedLookup = function(segment) {
    for (let i = 0;i < this._mixed.length; ++i) {
      if (internals.mixed({ segment }, this._mixed[i]) === 0) {
        return this._mixed[i];
      }
    }
    return null;
  };
  internals.mixed = function(a, b) {
    const aFirst = -1;
    const bFirst = 1;
    const as = a.segment;
    const bs = b.segment;
    if (as.length !== bs.length) {
      return as.length > bs.length ? aFirst : bFirst;
    }
    if (as.first !== bs.first) {
      return as.first ? bFirst : aFirst;
    }
    for (let i = 0;i < as.segments.length; ++i) {
      const am = as.segments[i];
      const bm = bs.segments[i];
      if (am === bm) {
        continue;
      }
      if (am.length === bm.length) {
        return am > bm ? bFirst : aFirst;
      }
      return am.length < bm.length ? bFirst : aFirst;
    }
    return 0;
  };
  internals.Segment.prototype.lookup = function(path, segments, options) {
    let match = null;
    if (this._fulls) {
      match = this._fulls.get(options.isCaseSensitive ? path : path.toLowerCase());
      if (match) {
        return { record: match.record, array: [] };
      }
    }
    const current = segments[0];
    const nextPath = path.slice(current.length + 1);
    const remainder = segments.length > 1 ? segments.slice(1) : null;
    if (this._literals) {
      const literal = options.isCaseSensitive ? current : current.toLowerCase();
      match = this._literals.get(literal);
      if (match) {
        const record = internals.deeper(match, nextPath, remainder, [], options);
        if (record) {
          return record;
        }
      }
    }
    if (this._mixed) {
      for (let i = 0;i < this._mixed.length; ++i) {
        match = this._mixed[i];
        const params = current.match(match.segment.mixed);
        if (params) {
          const array = [];
          for (let j = 1;j < params.length; ++j) {
            array.push(params[j]);
          }
          const record = internals.deeper(match.node, nextPath, remainder, array, options);
          if (record) {
            return record;
          }
        }
      }
    }
    if (this._param) {
      if (current || this._param._edge?.segment.empty) {
        const record = internals.deeper(this._param, nextPath, remainder, [current], options);
        if (record) {
          return record;
        }
      }
    }
    if (this._wildcard) {
      return { record: this._wildcard.record, array: [path.slice(1)] };
    }
    return null;
  };
  internals.deeper = function(match, path, segments, array, options) {
    if (!segments) {
      if (match._edge) {
        return { record: match._edge.record, array };
      }
      if (match._wildcard) {
        return { record: match._wildcard.record, array };
      }
    } else {
      const result = match.lookup(path, segments, options);
      if (result) {
        return { record: result.record, array: array.concat(result.array) };
      }
    }
    return null;
  };
});

// node_modules/@hapi/call/lib/index.js
var require_lib9 = __commonJS((exports) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Decode = require_decode();
  var Regex = require_regex();
  var Segment = require_segment();
  var internals = {
    pathRegex: Regex.generate(),
    defaults: {
      isCaseSensitive: true
    }
  };
  exports.Router = internals.Router = function(options) {
    this.settings = Hoek.applyToDefaults(internals.defaults, options || {});
    this.routes = new Map;
    this.ids = new Map;
    this.vhosts = null;
    this.specials = {
      badRequest: null,
      notFound: null,
      options: null
    };
  };
  internals.Router.prototype.add = function(config, route) {
    const method = config.method.toLowerCase();
    const vhost = config.vhost || "*";
    if (vhost !== "*") {
      this.vhosts = this.vhosts ?? new Map;
      if (!this.vhosts.has(vhost)) {
        this.vhosts.set(vhost, new Map);
      }
    }
    const table = vhost === "*" ? this.routes : this.vhosts.get(vhost);
    if (!table.has(method)) {
      table.set(method, { routes: [], router: new Segment });
    }
    const analysis = config.analysis ?? this.analyze(config.path);
    const record = {
      path: config.path,
      route: route || config.path,
      segments: analysis.segments,
      params: analysis.params,
      fingerprint: analysis.fingerprint,
      settings: this.settings
    };
    const map = table.get(method);
    map.router.add(analysis.segments, record);
    map.routes.push(record);
    map.routes.sort(internals.sort);
    const last = record.segments[record.segments.length - 1];
    if (last.empty) {
      map.router.add(analysis.segments.slice(0, -1), record);
    }
    if (config.id) {
      Hoek.assert(!this.ids.has(config.id), "Route id", config.id, "for path", config.path, "conflicts with existing path", this.ids.has(config.id) && this.ids.get(config.id).path);
      this.ids.set(config.id, record);
    }
    return record;
  };
  internals.Router.prototype.special = function(type, route) {
    Hoek.assert(Object.keys(this.specials).indexOf(type) !== -1, "Unknown special route type:", type);
    this.specials[type] = { route };
  };
  internals.Router.prototype.route = function(method, path, hostname) {
    const segments = path.length === 1 ? [""] : path.split("/").slice(1);
    const vhost = this.vhosts && hostname && this.vhosts.get(hostname);
    const route = vhost && this._lookup(path, segments, vhost, method) || this._lookup(path, segments, this.routes, method) || method === "head" && vhost && this._lookup(path, segments, vhost, "get") || method === "head" && this._lookup(path, segments, this.routes, "get") || method === "options" && this.specials.options || vhost && this._lookup(path, segments, vhost, "*") || this._lookup(path, segments, this.routes, "*") || this.specials.notFound || Boom.notFound();
    return route;
  };
  internals.Router.prototype._lookup = function(path, segments, table, method) {
    const set = table.get(method);
    if (!set) {
      return null;
    }
    const match = set.router.lookup(path, segments, this.settings);
    if (!match) {
      return null;
    }
    const assignments = {};
    const array = [];
    for (let i = 0;i < match.array.length; ++i) {
      const name = match.record.params[i];
      const value = Decode.decode(match.array[i]);
      if (value === null) {
        return this.specials.badRequest ?? Boom.badRequest("Invalid request path");
      }
      if (assignments[name] !== undefined) {
        assignments[name] = assignments[name] + "/" + value;
      } else {
        assignments[name] = value;
      }
      if (i + 1 === match.array.length || name !== match.record.params[i + 1]) {
        array.push(assignments[name]);
      }
    }
    return { params: assignments, paramsArray: array, route: match.record.route };
  };
  internals.Router.prototype.normalize = function(path) {
    if (path && path.indexOf("%") !== -1) {
      const uppercase = path.replace(/%[0-9a-fA-F][0-9a-fA-F]/g, (encoded) => encoded.toUpperCase());
      const decoded = uppercase.replace(/%(?:2[146-9A-E]|3[\dABD]|4[\dA-F]|5[\dAF]|6[1-9A-F]|7[\dAE])/g, (encoded) => String.fromCharCode(parseInt(encoded.substring(1), 16)));
      path = decoded;
    }
    if (path && (path.indexOf("/.") !== -1 || path[0] === ".")) {
      const hasLeadingSlash = path[0] === "/";
      const segments = path.split("/");
      const normalized = [];
      let segment;
      for (let i = 0;i < segments.length; ++i) {
        segment = segments[i];
        if (segment === "..") {
          normalized.pop();
        } else if (segment !== ".") {
          normalized.push(segment);
        }
      }
      if (segment === "." || segment === "..") {
        normalized.push("");
      }
      path = normalized.join("/");
      if (path[0] !== "/" && hasLeadingSlash) {
        path = "/" + path;
      }
    }
    return path;
  };
  internals.Router.prototype.analyze = function(path) {
    Hoek.assert(internals.pathRegex.validatePath.test(path), "Invalid path:", path);
    Hoek.assert(!internals.pathRegex.validatePathEncoded.test(path), "Path cannot contain encoded non-reserved path characters:", path);
    const pathParts = path.split("/");
    const segments = [];
    const params = [];
    const fingers = [];
    for (let i = 1;i < pathParts.length; ++i) {
      let segment = pathParts[i];
      if (segment.indexOf("{") === -1) {
        segment = this.settings.isCaseSensitive ? segment : segment.toLowerCase();
        fingers.push(segment);
        segments.push({ literal: segment });
        continue;
      }
      const parts = internals.parseParams(segment);
      if (parts.length === 1) {
        const item = parts[0];
        Hoek.assert(params.indexOf(item.name) === -1, "Cannot repeat the same parameter name:", item.name, "in:", path);
        params.push(item.name);
        if (item.wildcard) {
          if (item.count) {
            for (let j = 0;j < item.count; ++j) {
              fingers.push("?");
              segments.push({});
              if (j) {
                params.push(item.name);
              }
            }
          } else {
            fingers.push("#");
            segments.push({ wildcard: true });
          }
        } else {
          fingers.push("?");
          segments.push({ empty: item.empty });
        }
      } else {
        const seg = {
          length: parts.length,
          first: typeof parts[0] !== "string",
          segments: []
        };
        let finger = "";
        let regex = "^";
        for (let j = 0;j < parts.length; ++j) {
          const part = parts[j];
          if (typeof part === "string") {
            finger = finger + part;
            regex = regex + Hoek.escapeRegex(part);
            seg.segments.push(part);
          } else {
            Hoek.assert(params.indexOf(part.name) === -1, "Cannot repeat the same parameter name:", part.name, "in:", path);
            params.push(part.name);
            finger = finger + "?";
            regex = regex + "(." + (part.empty ? "*" : "+") + ")";
          }
        }
        seg.mixed = new RegExp(regex + "$", !this.settings.isCaseSensitive ? "i" : "");
        fingers.push(finger);
        segments.push(seg);
      }
    }
    return {
      segments,
      fingerprint: "/" + fingers.join("/"),
      params
    };
  };
  internals.parseParams = function(segment) {
    const parts = [];
    segment.replace(internals.pathRegex.parseParam, ($0, literal, name, wildcard, count, empty) => {
      if (literal) {
        parts.push(literal);
      } else {
        parts.push({
          name,
          wildcard: !!wildcard,
          count: count && parseInt(count, 10),
          empty: !!empty
        });
      }
      return "";
    });
    return parts;
  };
  internals.Router.prototype.table = function(host) {
    const result = [];
    const collect = (table) => {
      if (!table) {
        return;
      }
      for (const map of table.values()) {
        for (const record of map.routes) {
          result.push(record.route);
        }
      }
    };
    if (this.vhosts) {
      const vhosts = host ? [].concat(host) : [...this.vhosts.keys()];
      for (const vhost of vhosts) {
        collect(this.vhosts.get(vhost));
      }
    }
    collect(this.routes);
    return result;
  };
  internals.sort = function(a, b) {
    const aFirst = -1;
    const bFirst = 1;
    const as = a.segments;
    const bs = b.segments;
    if (as.length !== bs.length) {
      return as.length > bs.length ? bFirst : aFirst;
    }
    for (let i = 0;; ++i) {
      if (as[i].literal) {
        if (bs[i].literal) {
          if (as[i].literal === bs[i].literal) {
            continue;
          }
          return as[i].literal > bs[i].literal ? bFirst : aFirst;
        }
        return aFirst;
      }
      if (bs[i].literal) {
        return bFirst;
      }
      return as[i].wildcard ? bFirst : aFirst;
    }
  };
});

// node_modules/@hapi/catbox/lib/client.js
var require_client = __commonJS((exports, module) => {
  var Hoek = require_lib();
  var Boom = require_lib6();
  var internals = {
    validate: Symbol("validate")
  };
  internals.defaults = {
    partition: "catbox"
  };
  module.exports = class {
    constructor(engine, options) {
      Hoek.assert(engine, "Missing catbox client engine");
      Hoek.assert(typeof engine === "object" && typeof engine.start === "function" || typeof engine === "function", "engine must be an engine object or engine prototype (function)");
      Hoek.assert(typeof engine === "function" || !options, "Can only specify options with function engine config");
      const settings = Object.assign({}, internals.defaults, options);
      Hoek.assert(settings.partition.match(/^[\w\-]+$/), "Invalid partition name:" + settings.partition);
      this.connection = typeof engine === "object" ? engine : new engine(settings);
    }
    async start() {
      await this.connection.start();
    }
    async stop() {
      await this.connection.stop();
    }
    isReady() {
      return this.connection.isReady();
    }
    validateSegmentName(name) {
      return this.connection.validateSegmentName(name);
    }
    async get(key) {
      this[internals.validate](key, null);
      if (key === null) {
        return null;
      }
      const result = await this.connection.get(key);
      if (!result || result.item === undefined || result.item === null) {
        return null;
      }
      const now = Date.now();
      const expires = result.stored + result.ttl;
      const ttl = expires - now;
      if (ttl <= 0) {
        return null;
      }
      const cached = {
        item: result.item,
        stored: result.stored,
        ttl
      };
      return cached;
    }
    async set(key, value, ttl) {
      this[internals.validate](key);
      if (ttl <= 0) {
        return;
      }
      await this.connection.set(key, value, ttl);
    }
    async drop(key) {
      this[internals.validate](key);
      await this.connection.drop(key);
    }
    [internals.validate](key, allow = {}) {
      if (!this.isReady()) {
        throw Boom.internal("Disconnected");
      }
      const isValidKey = key && typeof key.id === "string" && key.segment && typeof key.segment === "string";
      if (!isValidKey && key !== allow) {
        throw Boom.internal("Invalid key");
      }
    }
  };
});

// node_modules/@hapi/podium/lib/index.js
var require_lib10 = __commonJS((exports) => {
  var Hoek = require_lib();
  var Teamwork = require_lib5();
  var Validate = require_lib3();
  var internals = {
    schema: {
      base: Validate.object({
        name: Validate.string().required(),
        clone: Validate.boolean(),
        tags: Validate.boolean(),
        spread: Validate.boolean(),
        channels: Validate.array().items(Validate.string()).single().unique().min(1).cast("set")
      })
    }
  };
  internals.schema.event = internals.schema.base.keys({
    shared: Validate.boolean()
  });
  internals.schema.listener = internals.schema.base.keys({
    listener: Validate.func().required(),
    context: Validate.object(),
    count: Validate.number().integer().min(1),
    filter: {
      tags: Validate.array().items(Validate.string()).single().unique().min(1).required(),
      all: Validate.boolean()
    }
  });
  exports.validate = function(events) {
    const normalized = [];
    events = [].concat(events);
    for (let event of events) {
      if (typeof event === "string") {
        event = { name: event };
      }
      normalized.push(Validate.attempt(event, internals.schema.event, "Invalid event options"));
    }
    return normalized;
  };
  exports.Podium = class {
    #listeners = new Map;
    constructor(events, options) {
      if (events) {
        this.registerEvent(events, options);
      }
    }
    registerEvent(events, options) {
      events = [].concat(events);
      for (let event of events) {
        if (typeof event === "string") {
          event = { name: event };
        }
        if (options?.validate !== false) {
          event = Validate.attempt(event, internals.schema.event, "Invalid event options");
        }
        const name = event.name;
        if (this.#listeners.has(name)) {
          Hoek.assert(event.shared, `Event ${name} exists`);
          continue;
        }
        this.#listeners.set(name, new internals.EventListener(event));
      }
    }
    emit(criteria, data) {
      let thrownErr;
      this.#emitToEachListener(criteria, data, ([err]) => {
        thrownErr = thrownErr ?? err;
      });
      if (thrownErr) {
        throw thrownErr;
      }
    }
    async gauge(criteria, data) {
      const promises = [];
      this.#emitToEachListener(criteria, data, ([err, result]) => {
        promises.push(err ? Promise.reject(err) : result);
      });
      return await Promise.allSettled(promises);
    }
    #emitToEachListener(criteria, data, fn) {
      criteria = internals.criteria(criteria);
      const name = criteria.name;
      Hoek.assert(name, "Criteria missing event name");
      const event = this.#listeners.get(name);
      Hoek.assert(event, `Unknown event ${name}`);
      if (!event.handlers) {
        return;
      }
      Hoek.assert(!criteria.channel || typeof criteria.channel === "string", "Invalid channel name");
      Hoek.assert(!criteria.channel || !event.flags.channels || event.flags.channels.has(criteria.channel), `Unknown ${criteria.channel} channel`);
      Hoek.assert(!event.flags.spread || Array.isArray(data) || typeof data === "function", "Data must be an array for spread event");
      if (typeof criteria.tags === "string") {
        criteria = { ...criteria };
        criteria.tags = { [criteria.tags]: true };
      }
      if (criteria.tags && Array.isArray(criteria.tags)) {
        const tags = {};
        for (const tag of criteria.tags) {
          tags[tag] = true;
        }
        criteria = { ...criteria };
        criteria.tags = tags;
      }
      let generated = false;
      for (const handler of event.handlers) {
        if (handler.channels && !(criteria.channel && handler.channels.has(criteria.channel))) {
          continue;
        }
        if (handler.filter) {
          if (!criteria.tags) {
            continue;
          }
          const match = Hoek.intersect(criteria.tags, handler.filter.tags, { first: !handler.filter.all });
          if (!match || handler.filter.all && match.length !== handler.filter.tags.length) {
            continue;
          }
        }
        if (handler.count) {
          --handler.count;
          if (handler.count < 1) {
            event.removeListener(handler.listener);
          }
        }
        if (!generated && typeof data === "function") {
          data = data();
          generated = true;
        }
        const update = event.flagged("clone", handler) ? Hoek.clone(data) : data;
        const args = event.flagged("spread", handler) && Array.isArray(update) ? update.slice(0) : [update];
        if (event.flagged("tags", handler) && criteria.tags) {
          args.push(criteria.tags);
        }
        try {
          if (handler.context) {
            fn([null, handler.listener.apply(handler.context, args)]);
          } else {
            fn([null, handler.listener(...args)]);
          }
        } catch (err) {
          fn([err, null]);
        }
      }
    }
    addListener(criteria, listener, context) {
      criteria = internals.criteria(criteria);
      criteria.listener = listener;
      criteria.context = context;
      if (criteria.filter && (typeof criteria.filter === "string" || Array.isArray(criteria.filter))) {
        criteria = { ...criteria };
        criteria.filter = { tags: criteria.filter };
      }
      criteria = Validate.attempt(criteria, internals.schema.listener, "Invalid event listener options");
      const name = criteria.name;
      const event = this.#listeners.get(name);
      Hoek.assert(event, `Unknown event ${name}`);
      event.addHandler(criteria);
      return this;
    }
    on(criteria, listener, context) {
      return this.addListener(criteria, listener, context);
    }
    once(criteria, listener, context) {
      criteria = { ...internals.criteria(criteria), count: 1 };
      if (listener) {
        return this.addListener(criteria, listener, context);
      }
      return new Promise((resolve) => {
        this.addListener(criteria, (...args) => resolve(args));
      });
    }
    few(criteria) {
      Hoek.assert(typeof criteria === "object", "Criteria must be an object");
      Hoek.assert(criteria.count, "Criteria must include a count limit");
      const team = new Teamwork.Team({ meetings: criteria.count });
      this.addListener(criteria, (...args) => team.attend(args));
      return team.work;
    }
    removeListener(name, listener) {
      Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
      Hoek.assert(typeof listener === "function", "Listener must be a function");
      this.#listeners.get(name).removeListener(listener);
      return this;
    }
    off(name, listener) {
      return this.removeListener(name, listener);
    }
    removeAllListeners(name) {
      Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
      this.#listeners.get(name).handlers = null;
      return this;
    }
    hasListeners(name) {
      Hoek.assert(this.#listeners.has(name), `Unknown event ${name}`);
      return !!this.#listeners.get(name).handlers;
    }
  };
  internals.EventListener = class {
    constructor(flags) {
      this.flags = flags;
      this.handlers = null;
    }
    addHandler(handler) {
      Hoek.assert(!handler.channels || !this.flags.channels || Hoek.intersect(this.flags.channels, handler.channels).length === handler.channels.size, `Unknown event channels ${handler.channels && [...handler.channels].join(", ")}`);
      this.handlers = this.handlers ? [...this.handlers, handler] : [handler];
    }
    removeListener(listener) {
      const filtered = this.handlers?.filter((item) => item.listener !== listener);
      this.handlers = filtered?.length ? filtered : null;
    }
    flagged(name, handler) {
      return handler[name] ?? this.flags[name] ?? false;
    }
  };
  internals.criteria = function(criteria) {
    if (typeof criteria === "string") {
      return { name: criteria };
    }
    return criteria;
  };
});

// node_modules/@hapi/catbox/lib/pending.js
var require_pending = __commonJS((exports, module) => {
  exports = module.exports = class {
    id = null;
    timeout = null;
    count = 1;
    rule = null;
    resolve = null;
    reject = null;
    constructor(id, rule) {
      this.id = id;
      this.rule = rule;
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    join() {
      ++this.count;
      return this.promise;
    }
    send(err, value, cached, report) {
      clearTimeout(this.timeout);
      if (err && !cached) {
        this.reject(err);
        return;
      }
      if (!this.rule.getDecoratedValue) {
        this.resolve(value);
        return;
      }
      if (err) {
        report.error = err;
      }
      this.resolve({ value, cached, report });
    }
    setTimeout(fn, timeoutMs) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(fn, timeoutMs);
    }
  };
});

// node_modules/@hapi/catbox/lib/policy.js
var require_policy = __commonJS((exports, module) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Podium = require_lib10();
  var Validate = require_lib3();
  var Pending = require_pending();
  var internals = {
    day: 24 * 60 * 60 * 1000,
    events: Podium.validate([
      { name: "error", channels: ["generate", "persist"] }
    ])
  };
  internals.schema = Validate.object({
    expiresIn: Validate.number().integer().min(1),
    expiresAt: Validate.string().regex(/^\d\d?\:\d\d$/),
    staleIn: [
      Validate.number().integer().min(1).when("expiresAt", { is: Validate.required(), then: Validate.number().max(86400000 - 1) }),
      Validate.func()
    ],
    staleTimeout: Validate.number().integer().min(1),
    generateFunc: Validate.func(),
    generateTimeout: Validate.number().integer().min(1).allow(false),
    generateOnReadError: Validate.boolean(),
    generateIgnoreWriteError: Validate.boolean(),
    dropOnError: Validate.boolean(),
    pendingGenerateTimeout: Validate.number().integer().min(1),
    getDecoratedValue: Validate.boolean().default(false),
    privacy: Validate.any(),
    cache: Validate.any(),
    segment: Validate.any(),
    shared: Validate.any()
  }).without("expiresIn", "expiresAt").with("staleIn", "generateFunc").with("generateOnReadError", "generateFunc").with("generateIgnoreWriteError", "generateFunc").with("dropOnError", "generateFunc").and("generateFunc", "generateTimeout").and("staleIn", "staleTimeout");
  exports = module.exports = internals.Policy = class {
    rule = null;
    stats = {
      sets: 0,
      gets: 0,
      hits: 0,
      stales: 0,
      generates: 0,
      errors: 0
    };
    _events = null;
    _cache = null;
    _segment = null;
    _pendings = new Map;
    _pendingGenerateCall = new Map;
    constructor(options, cache, segment) {
      this._cache = cache;
      this.rules(options);
      if (cache) {
        const nameErr = cache.validateSegmentName(segment);
        Hoek.assert(nameErr === null, "Invalid segment name: " + segment + (nameErr ? " (" + nameErr.message + ")" : ""));
        this._segment = segment;
      }
    }
    get client() {
      return this._cache;
    }
    get events() {
      if (!this._events) {
        this._events = new Podium.Podium(internals.events, { validate: false });
      }
      return this._events;
    }
    _error(source, error) {
      if (!this._events) {
        return;
      }
      this._events.emit({ name: "error", channel: source }, { source, error });
    }
    rules(options) {
      this.rule = internals.Policy.compile(options, !!this._cache);
    }
    async get(key) {
      ++this.stats.gets;
      if (!key || typeof key === "string") {
        key = { id: key, string: true };
      }
      let pending = this._pendings.get(key.id);
      if (pending !== undefined) {
        return pending.join();
      }
      pending = new Pending(key.id, this.rule);
      this._pendings.set(key.id, pending);
      try {
        await this._get(pending, key);
      } catch (err) {
        this._send(key, err);
      }
      return pending.promise;
    }
    async _get(pending, key) {
      const report = {};
      const timer = new Hoek.Bench;
      if (this._cache) {
        try {
          var cached = await this._cache.get({ segment: this._segment, id: key.id });
        } catch (err) {
          report.error = err;
          ++this.stats.errors;
          this._error("persist", err);
        }
      }
      report.msec = timer.elapsed();
      if (cached) {
        report.stored = cached.stored;
        report.ttl = cached.ttl;
        const staleIn = typeof this.rule.staleIn === "function" ? this.rule.staleIn(cached.stored, cached.ttl) : this.rule.staleIn;
        cached.isStale = staleIn ? Date.now() - cached.stored >= staleIn : false;
        report.isStale = cached.isStale;
        if (cached.isStale) {
          ++this.stats.stales;
        }
      }
      if (!this.rule.generateFunc || report.error && !this.rule.generateOnReadError) {
        this._send(key, report.error, cached ? cached.item : null, cached, report);
        return;
      }
      if (cached && !cached.isStale) {
        this._send(key, null, cached.item, cached, report);
        return;
      }
      return Promise.race([
        pending.promise,
        this._generate(pending, key, cached, report)
      ]);
    }
    _generate(pending, key, cached, report) {
      if (cached) {
        cached.ttl = cached.ttl - this.rule.staleTimeout;
      }
      if (cached && cached.ttl > 0) {
        pending.setTimeout(() => this._send(key, null, cached.item, cached, report), this.rule.staleTimeout);
      } else if (this.rule.generateTimeout) {
        pending.setTimeout(() => this._send(key, Boom.serverUnavailable(), null, null, report), this.rule.generateTimeout);
      }
      if (this._pendingGenerateCall.has(key.id)) {
        return;
      }
      ++this.stats.generates;
      if (this.rule.pendingGenerateTimeout) {
        const timeout = setTimeout(() => this._pendingGenerateCall.delete(key.id), this.rule.pendingGenerateTimeout);
        this._pendingGenerateCall.set(key.id, timeout);
      }
      return this._callGenerateFunc(key, cached, report);
    }
    async _callGenerateFunc(key, cached, report) {
      const flags = {};
      try {
        var value = await this.rule.generateFunc(key.string ? key.id : key, flags);
      } catch (err) {
        var generateError = err;
        this._error("generate", err);
      }
      const pendingTimeout = this._pendingGenerateCall.get(key.id);
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        this._pendingGenerateCall.delete(key.id);
      }
      try {
        if (flags.ttl === 0 || generateError && this.rule.dropOnError) {
          await this.drop(key.id);
        } else if (!generateError) {
          await this.set(key.id, value, flags.ttl);
        }
      } catch (err) {
        var persistError = err;
        this._error("persist", err);
      }
      const error = generateError || (this.rule.generateIgnoreWriteError ? null : persistError);
      if (cached && error && !this.rule.dropOnError) {
        this._send(key, error, cached.item, cached, report);
        return;
      }
      this._send(key, error, value, null, report);
    }
    _send(key, err, value, cached, report) {
      const pending = this._pendings.get(key.id);
      if (!pending) {
        return;
      }
      this._pendings.delete(key.id);
      pending.send(err, value, cached, report);
      if (report?.isStale !== undefined) {
        this.stats.hits = this.stats.hits + pending.count;
      }
    }
    async set(key, value, ttl) {
      ++this.stats.sets;
      if (!this._cache) {
        return;
      }
      try {
        await this._cache.set({ segment: this._segment, id: internals.id(key) }, value, ttl || internals.Policy.ttl(this.rule));
      } catch (err) {
        ++this.stats.errors;
        throw err;
      }
    }
    async drop(key) {
      if (!this._cache) {
        return;
      }
      try {
        await this._cache.drop({ segment: this._segment, id: internals.id(key) });
        return;
      } catch (err) {
        ++this.stats.errors;
        throw err;
      }
    }
    ttl(created) {
      return internals.Policy.ttl(this.rule, created);
    }
    isReady() {
      if (!this._cache) {
        return false;
      }
      return this._cache.connection.isReady();
    }
    static compile(options, serverSide) {
      const rule = {};
      if (!options || !Object.keys(options).length) {
        return rule;
      }
      options = Validate.attempt(options, internals.schema, "Invalid cache policy configuration");
      const hasExpiresIn = options.expiresIn !== undefined && options.expiresIn !== null;
      const hasExpiresAt = options.expiresAt !== undefined && options.expiresAt !== null;
      Hoek.assert(!hasExpiresIn || !options.staleIn || typeof options.staleIn === "function" || options.staleIn < options.expiresIn, "staleIn must be less than expiresIn");
      Hoek.assert(!options.staleIn || serverSide, "Cannot use stale options without server-side caching");
      Hoek.assert(!options.staleTimeout || !hasExpiresIn || options.staleTimeout < options.expiresIn, "staleTimeout must be less than expiresIn");
      Hoek.assert(!options.staleTimeout || !hasExpiresIn || typeof options.staleIn === "function" || options.staleTimeout < options.expiresIn - options.staleIn, "staleTimeout must be less than the delta between expiresIn and staleIn");
      Hoek.assert(!options.staleTimeout || !options.pendingGenerateTimeout || options.staleTimeout < options.pendingGenerateTimeout, "pendingGenerateTimeout must be greater than staleTimeout if specified");
      if (hasExpiresAt) {
        const time = /^(\d\d?):(\d\d)$/.exec(options.expiresAt);
        rule.expiresAt = {
          hours: parseInt(time[1], 10),
          minutes: parseInt(time[2], 10)
        };
      } else {
        rule.expiresIn = options.expiresIn ?? 0;
      }
      if (options.generateFunc) {
        rule.generateFunc = options.generateFunc;
        rule.generateTimeout = options.generateTimeout;
        if (options.staleIn) {
          rule.staleIn = options.staleIn;
          rule.staleTimeout = options.staleTimeout;
        }
        rule.dropOnError = options.dropOnError !== undefined ? options.dropOnError : true;
        rule.pendingGenerateTimeout = options.pendingGenerateTimeout !== undefined ? options.pendingGenerateTimeout : 0;
      }
      rule.generateOnReadError = options.generateOnReadError !== undefined ? options.generateOnReadError : true;
      rule.generateIgnoreWriteError = options.generateIgnoreWriteError !== undefined ? options.generateIgnoreWriteError : true;
      rule.getDecoratedValue = options.getDecoratedValue;
      return rule;
    }
    static ttl(rule, created, now) {
      now = now ?? Date.now();
      created = created ?? now;
      const age = now - created;
      if (age < 0) {
        return 0;
      }
      if (rule.expiresIn) {
        return Math.max(rule.expiresIn - age, 0);
      }
      if (rule.expiresAt) {
        if (age > internals.day) {
          return 0;
        }
        const expiresAt = new Date(created);
        expiresAt.setHours(rule.expiresAt.hours);
        expiresAt.setMinutes(rule.expiresAt.minutes);
        expiresAt.setSeconds(0);
        expiresAt.setMilliseconds(0);
        let expires = expiresAt.getTime();
        if (expires <= created) {
          expires = expires + internals.day;
        }
        if (now >= expires) {
          return 0;
        }
        return expires - now;
      }
      return 0;
    }
  };
  internals.id = function(key) {
    return key && typeof key === "object" ? key.id : key;
  };
});

// node_modules/@hapi/catbox/lib/index.js
var require_lib11 = __commonJS((exports) => {
  var Client = require_client();
  var Policy = require_policy();
  exports.Client = Client;
  exports.Policy = exports.policy = Policy;
});

// node_modules/@hapi/catbox-memory/lib/index.js
var require_lib12 = __commonJS((exports) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var internals = {
    maxTimer: 2147483647,
    entrySize: 144
  };
  internals.defaults = {
    maxByteSize: 100 * 1024 * 1024,
    minCleanupIntervalMsec: 1000,
    cloneBuffersOnGet: false
  };
  exports.Engine = class CatboxMemoryEngine {
    constructor(options = {}) {
      Hoek.assert(options.maxByteSize === undefined || options.maxByteSize >= 0, "Invalid cache maxByteSize value");
      Hoek.assert(options.allowMixedContent === undefined, "allowMixedContent no longer supported");
      Hoek.assert(options.minCleanupIntervalMsec === undefined || options.minCleanupIntervalMsec < internals.maxTimer, "Invalid cache minCleanupIntervalMsec value");
      Hoek.assert(options.cloneBuffersOnGet === undefined || typeof options.cloneBuffersOnGet === "boolean", "Invalid cloneBuffersOnGet value");
      this.settings = Hoek.applyToDefaults(internals.defaults, options);
      this.cache = null;
      this._timer = null;
      this._timerDue = null;
    }
    start() {
      if (!this.cache) {
        this.cache = new Map;
        this.byteSize = 0;
      }
    }
    _scheduleCleanup(msec) {
      const cleanup = () => {
        this._timer = null;
        this._timerDue = null;
        const now2 = Date.now();
        let next = Infinity;
        for (const [, segment] of this.cache) {
          for (const [id, envelope] of segment) {
            const ttl = envelope.stored + envelope.ttl - now2;
            if (ttl <= 0) {
              segment.delete(id);
              this.byteSize -= envelope.byteSize;
            } else {
              next = Math.min(next, ttl);
            }
          }
        }
        if (next !== Infinity) {
          this._scheduleCleanup(next);
        }
      };
      const now = Date.now();
      const timeout = Math.min(Math.max(this.settings.minCleanupIntervalMsec, msec), internals.maxTimer);
      if (this._timer) {
        if (this._timerDue - now < msec) {
          return;
        }
        clearTimeout(this._timer);
      }
      this._timerDue = now + timeout;
      this._timer = setTimeout(cleanup, timeout);
    }
    stop() {
      clearTimeout(this._timer);
      this._timer = null;
      this._timerDue = null;
      this.cache = null;
      this.byteSize = 0;
    }
    isReady() {
      return !!this.cache;
    }
    validateSegmentName(name) {
      if (!name) {
        throw new Boom.Boom("Empty string");
      }
      if (name.indexOf("\0") !== -1) {
        throw new Boom.Boom("Includes null character");
      }
      return null;
    }
    get(key) {
      if (!this.cache) {
        throw new Boom.Boom("Connection not started");
      }
      const segment = this.cache.get(key.segment);
      if (!segment) {
        return null;
      }
      const envelope = segment.get(key.id);
      if (!envelope) {
        return null;
      }
      if (envelope.stored + envelope.ttl < Date.now()) {
        this.drop(key);
        return null;
      }
      let item = null;
      if (Buffer.isBuffer(envelope.item)) {
        item = envelope.item;
        if (this.settings.cloneBuffersOnGet) {
          const copy = Buffer.alloc(item.length);
          item.copy(copy);
          item = copy;
        }
      } else {
        try {
          item = JSON.parse(envelope.item);
        } catch (err) {
          throw new Boom.Boom("Bad value content");
        }
      }
      const result = {
        item,
        stored: envelope.stored,
        ttl: envelope.ttl
      };
      return result;
    }
    set(key, value, ttl) {
      if (!this.cache) {
        throw new Boom.Boom("Connection not started");
      }
      const envelope = new internals.MemoryCacheEntry(key, value, ttl);
      let segment = this.cache.get(key.segment);
      if (!segment) {
        segment = new Map;
        this.cache.set(key.segment, segment);
      }
      const cachedItem = segment.get(key.id);
      if (cachedItem) {
        this.byteSize -= cachedItem.byteSize;
      }
      if (this.settings.maxByteSize && this.byteSize + envelope.byteSize > this.settings.maxByteSize) {
        throw new Boom.Boom("Cache size limit reached");
      }
      this._scheduleCleanup(ttl);
      segment.set(key.id, envelope);
      this.byteSize += envelope.byteSize;
    }
    drop(key) {
      if (!this.cache) {
        throw new Boom.Boom("Connection not started");
      }
      const segment = this.cache.get(key.segment);
      if (segment) {
        const item = segment.get(key.id);
        if (item) {
          this.byteSize -= item.byteSize;
          segment.delete(key.id);
        }
      }
    }
  };
  internals.MemoryCacheEntry = class {
    constructor(key, value, ttl) {
      let valueByteSize = 0;
      if (Buffer.isBuffer(value)) {
        this.item = Buffer.alloc(value.length);
        value.copy(this.item);
        valueByteSize = this.item.length;
      } else {
        this.item = JSON.stringify(value);
        valueByteSize = Buffer.byteLength(this.item);
      }
      this.stored = Date.now();
      this.ttl = ttl;
      this.byteSize = internals.entrySize + valueByteSize + Buffer.byteLength(key.segment) + Buffer.byteLength(key.id);
      this.timeoutId = null;
    }
  };
});

// node_modules/@hapi/heavy/lib/index.js
var require_lib13 = __commonJS((exports) => {
  var PerfHooks = __require("perf_hooks");
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Validate = require_lib3();
  var internals = {};
  internals.schema = Validate.object({
    sampleInterval: Validate.number().min(0),
    maxHeapUsedBytes: Validate.number().min(0),
    maxEventLoopDelay: Validate.number().min(0),
    maxEventLoopUtilization: Validate.number().min(0),
    maxRssBytes: Validate.number().min(0)
  }).unknown();
  internals.defaults = {
    sampleInterval: 0,
    maxHeapUsedBytes: 0,
    maxRssBytes: 0,
    maxEventLoopDelay: 0,
    maxEventLoopUtilization: 0
  };
  exports.Heavy = class Heavy {
    constructor(options) {
      options = options || {};
      Validate.assert(options, internals.schema, "Invalid load monitoring options");
      this.settings = Hoek.applyToDefaults(internals.defaults, options);
      Hoek.assert(this.settings.sampleInterval || !this.settings.maxEventLoopDelay && !this.settings.maxHeapUsedBytes && !this.settings.maxRssBytes && !this.settings.maxEventLoopUtilization, "Load sample interval must be set to enable load limits");
      this._eventLoopTimer = null;
      this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization();
      this._loadBench = new Hoek.Bench;
      this.load = {
        eventLoopDelay: 0,
        eventLoopUtilization: 0,
        heapUsed: 0,
        rss: 0
      };
    }
    start() {
      if (!this.settings.sampleInterval) {
        return;
      }
      const loopSample = () => {
        this._loadBench.reset();
        const measure = () => {
          const mem = process.memoryUsage();
          this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization(this._eventLoopUtilization);
          this.load.eventLoopDelay = this._loadBench.elapsed() - this.settings.sampleInterval;
          this.load.eventLoopUtilization = this._eventLoopUtilization.utilization;
          this.load.heapUsed = mem.heapUsed;
          this.load.rss = mem.rss;
          loopSample();
        };
        this._eventLoopTimer = setTimeout(measure, this.settings.sampleInterval);
      };
      loopSample();
    }
    stop() {
      clearTimeout(this._eventLoopTimer);
      this._eventLoopTimer = null;
    }
    check() {
      if (!this.settings.sampleInterval) {
        return;
      }
      Hoek.assert(this._eventLoopTimer, "Cannot check load when sampler is not started");
      const elapsed = this._loadBench.elapsed();
      const load = this.load;
      if (elapsed > this.settings.sampleInterval) {
        this._eventLoopUtilization = PerfHooks.performance.eventLoopUtilization(this._eventLoopUtilization);
        load.eventLoopDelay = Math.max(load.eventLoopDelay, elapsed - this.settings.sampleInterval);
        load.eventLoopUtilization = this._eventLoopUtilization.utilization;
      }
      if (this.settings.maxEventLoopDelay && load.eventLoopDelay > this.settings.maxEventLoopDelay) {
        throw Boom.serverUnavailable("Server under heavy load (event loop)", load);
      }
      if (this.settings.maxEventLoopUtilization && load.eventLoopUtilization > this.settings.maxEventLoopUtilization) {
        throw Boom.serverUnavailable("Server under heavy load (event loop utilization)", load);
      }
      if (this.settings.maxHeapUsedBytes && load.heapUsed > this.settings.maxHeapUsedBytes) {
        throw Boom.serverUnavailable("Server under heavy load (heap)", load);
      }
      if (this.settings.maxRssBytes && load.rss > this.settings.maxRssBytes) {
        throw Boom.serverUnavailable("Server under heavy load (rss)", load);
      }
    }
  };
});

// node_modules/mime-db/db.json
var require_db = __commonJS((exports, module) => {
  module.exports = {
    "application/1d-interleaved-parityfec": {
      source: "iana"
    },
    "application/3gpdash-qoe-report+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/3gpp-ims+xml": {
      source: "iana",
      compressible: true
    },
    "application/3gpphal+json": {
      source: "iana",
      compressible: true
    },
    "application/3gpphalforms+json": {
      source: "iana",
      compressible: true
    },
    "application/a2l": {
      source: "iana"
    },
    "application/ace+cbor": {
      source: "iana"
    },
    "application/ace+json": {
      source: "iana",
      compressible: true
    },
    "application/ace-groupcomm+cbor": {
      source: "iana"
    },
    "application/activemessage": {
      source: "iana"
    },
    "application/activity+json": {
      source: "iana",
      compressible: true
    },
    "application/aif+cbor": {
      source: "iana"
    },
    "application/aif+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-cdni+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-cdnifilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-directory+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcost+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcostparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointprop+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointpropparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-error+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-propmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-propmapparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-tips+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-tipsparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamcontrol+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamparams+json": {
      source: "iana",
      compressible: true
    },
    "application/aml": {
      source: "iana"
    },
    "application/andrew-inset": {
      source: "iana",
      extensions: ["ez"]
    },
    "application/appinstaller": {
      compressible: false,
      extensions: ["appinstaller"]
    },
    "application/applefile": {
      source: "iana"
    },
    "application/applixware": {
      source: "apache",
      extensions: ["aw"]
    },
    "application/appx": {
      compressible: false,
      extensions: ["appx"]
    },
    "application/appxbundle": {
      compressible: false,
      extensions: ["appxbundle"]
    },
    "application/at+jwt": {
      source: "iana"
    },
    "application/atf": {
      source: "iana"
    },
    "application/atfx": {
      source: "iana"
    },
    "application/atom+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atom"]
    },
    "application/atomcat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomcat"]
    },
    "application/atomdeleted+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomdeleted"]
    },
    "application/atomicmail": {
      source: "iana"
    },
    "application/atomsvc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomsvc"]
    },
    "application/atsc-dwd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dwd"]
    },
    "application/atsc-dynamic-event-message": {
      source: "iana"
    },
    "application/atsc-held+xml": {
      source: "iana",
      compressible: true,
      extensions: ["held"]
    },
    "application/atsc-rdt+json": {
      source: "iana",
      compressible: true
    },
    "application/atsc-rsat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsat"]
    },
    "application/atxml": {
      source: "iana"
    },
    "application/auth-policy+xml": {
      source: "iana",
      compressible: true
    },
    "application/automationml-aml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["aml"]
    },
    "application/automationml-amlx+zip": {
      source: "iana",
      compressible: false,
      extensions: ["amlx"]
    },
    "application/bacnet-xdd+zip": {
      source: "iana",
      compressible: false
    },
    "application/batch-smtp": {
      source: "iana"
    },
    "application/bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/beep+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/bufr": {
      source: "iana"
    },
    "application/c2pa": {
      source: "iana"
    },
    "application/calendar+json": {
      source: "iana",
      compressible: true
    },
    "application/calendar+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xcs"]
    },
    "application/call-completion": {
      source: "iana"
    },
    "application/cals-1840": {
      source: "iana"
    },
    "application/captive+json": {
      source: "iana",
      compressible: true
    },
    "application/cbor": {
      source: "iana"
    },
    "application/cbor-seq": {
      source: "iana"
    },
    "application/cccex": {
      source: "iana"
    },
    "application/ccmp+xml": {
      source: "iana",
      compressible: true
    },
    "application/ccxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ccxml"]
    },
    "application/cda+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/cdfx+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdfx"]
    },
    "application/cdmi-capability": {
      source: "iana",
      extensions: ["cdmia"]
    },
    "application/cdmi-container": {
      source: "iana",
      extensions: ["cdmic"]
    },
    "application/cdmi-domain": {
      source: "iana",
      extensions: ["cdmid"]
    },
    "application/cdmi-object": {
      source: "iana",
      extensions: ["cdmio"]
    },
    "application/cdmi-queue": {
      source: "iana",
      extensions: ["cdmiq"]
    },
    "application/cdni": {
      source: "iana"
    },
    "application/cea": {
      source: "iana"
    },
    "application/cea-2018+xml": {
      source: "iana",
      compressible: true
    },
    "application/cellml+xml": {
      source: "iana",
      compressible: true
    },
    "application/cfw": {
      source: "iana"
    },
    "application/cid-edhoc+cbor-seq": {
      source: "iana"
    },
    "application/city+json": {
      source: "iana",
      compressible: true
    },
    "application/clr": {
      source: "iana"
    },
    "application/clue+xml": {
      source: "iana",
      compressible: true
    },
    "application/clue_info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cms": {
      source: "iana"
    },
    "application/cnrp+xml": {
      source: "iana",
      compressible: true
    },
    "application/coap-group+json": {
      source: "iana",
      compressible: true
    },
    "application/coap-payload": {
      source: "iana"
    },
    "application/commonground": {
      source: "iana"
    },
    "application/concise-problem-details+cbor": {
      source: "iana"
    },
    "application/conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cose": {
      source: "iana"
    },
    "application/cose-key": {
      source: "iana"
    },
    "application/cose-key-set": {
      source: "iana"
    },
    "application/cose-x509": {
      source: "iana"
    },
    "application/cpl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cpl"]
    },
    "application/csrattrs": {
      source: "iana"
    },
    "application/csta+xml": {
      source: "iana",
      compressible: true
    },
    "application/cstadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/csvm+json": {
      source: "iana",
      compressible: true
    },
    "application/cu-seeme": {
      source: "apache",
      extensions: ["cu"]
    },
    "application/cwl": {
      source: "iana",
      extensions: ["cwl"]
    },
    "application/cwl+json": {
      source: "iana",
      compressible: true
    },
    "application/cwl+yaml": {
      source: "iana"
    },
    "application/cwt": {
      source: "iana"
    },
    "application/cybercash": {
      source: "iana"
    },
    "application/dart": {
      compressible: true
    },
    "application/dash+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpd"]
    },
    "application/dash-patch+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpp"]
    },
    "application/dashdelta": {
      source: "iana"
    },
    "application/davmount+xml": {
      source: "iana",
      compressible: true,
      extensions: ["davmount"]
    },
    "application/dca-rft": {
      source: "iana"
    },
    "application/dcd": {
      source: "iana"
    },
    "application/dec-dx": {
      source: "iana"
    },
    "application/dialog-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/dicom": {
      source: "iana"
    },
    "application/dicom+json": {
      source: "iana",
      compressible: true
    },
    "application/dicom+xml": {
      source: "iana",
      compressible: true
    },
    "application/dii": {
      source: "iana"
    },
    "application/dit": {
      source: "iana"
    },
    "application/dns": {
      source: "iana"
    },
    "application/dns+json": {
      source: "iana",
      compressible: true
    },
    "application/dns-message": {
      source: "iana"
    },
    "application/docbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dbk"]
    },
    "application/dots+cbor": {
      source: "iana"
    },
    "application/dpop+jwt": {
      source: "iana"
    },
    "application/dskpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/dssc+der": {
      source: "iana",
      extensions: ["dssc"]
    },
    "application/dssc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdssc"]
    },
    "application/dvcs": {
      source: "iana"
    },
    "application/ecmascript": {
      source: "apache",
      compressible: true,
      extensions: ["ecma"]
    },
    "application/edhoc+cbor-seq": {
      source: "iana"
    },
    "application/edi-consent": {
      source: "iana"
    },
    "application/edi-x12": {
      source: "iana",
      compressible: false
    },
    "application/edifact": {
      source: "iana",
      compressible: false
    },
    "application/efi": {
      source: "iana"
    },
    "application/elm+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/elm+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.cap+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/emergencycalldata.comment+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.control+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.deviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.ecall.msd": {
      source: "iana"
    },
    "application/emergencycalldata.legacyesn+json": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.providerinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.serviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.subscriberinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.veds+xml": {
      source: "iana",
      compressible: true
    },
    "application/emma+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emma"]
    },
    "application/emotionml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emotionml"]
    },
    "application/encaprtp": {
      source: "iana"
    },
    "application/epp+xml": {
      source: "iana",
      compressible: true
    },
    "application/epub+zip": {
      source: "iana",
      compressible: false,
      extensions: ["epub"]
    },
    "application/eshop": {
      source: "iana"
    },
    "application/exi": {
      source: "iana",
      extensions: ["exi"]
    },
    "application/expect-ct-report+json": {
      source: "iana",
      compressible: true
    },
    "application/express": {
      source: "iana",
      extensions: ["exp"]
    },
    "application/fastinfoset": {
      source: "iana"
    },
    "application/fastsoap": {
      source: "iana"
    },
    "application/fdf": {
      source: "iana",
      extensions: ["fdf"]
    },
    "application/fdt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fdt"]
    },
    "application/fhir+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fhir+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fido.trusted-apps+json": {
      compressible: true
    },
    "application/fits": {
      source: "iana"
    },
    "application/flexfec": {
      source: "iana"
    },
    "application/font-sfnt": {
      source: "iana"
    },
    "application/font-tdpfr": {
      source: "iana",
      extensions: ["pfr"]
    },
    "application/font-woff": {
      source: "iana",
      compressible: false
    },
    "application/framework-attributes+xml": {
      source: "iana",
      compressible: true
    },
    "application/geo+json": {
      source: "iana",
      compressible: true,
      extensions: ["geojson"]
    },
    "application/geo+json-seq": {
      source: "iana"
    },
    "application/geopackage+sqlite3": {
      source: "iana"
    },
    "application/geoxacml+json": {
      source: "iana",
      compressible: true
    },
    "application/geoxacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/gltf-buffer": {
      source: "iana"
    },
    "application/gml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["gml"]
    },
    "application/gnap-binding-jws": {
      source: "iana"
    },
    "application/gnap-binding-jwsd": {
      source: "iana"
    },
    "application/gnap-binding-rotation-jws": {
      source: "iana"
    },
    "application/gnap-binding-rotation-jwsd": {
      source: "iana"
    },
    "application/gpx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["gpx"]
    },
    "application/grib": {
      source: "iana"
    },
    "application/gxf": {
      source: "apache",
      extensions: ["gxf"]
    },
    "application/gzip": {
      source: "iana",
      compressible: false,
      extensions: ["gz"]
    },
    "application/h224": {
      source: "iana"
    },
    "application/held+xml": {
      source: "iana",
      compressible: true
    },
    "application/hjson": {
      extensions: ["hjson"]
    },
    "application/hl7v2+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/http": {
      source: "iana"
    },
    "application/hyperstudio": {
      source: "iana",
      extensions: ["stk"]
    },
    "application/ibe-key-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pkg-reply+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pp-data": {
      source: "iana"
    },
    "application/iges": {
      source: "iana"
    },
    "application/im-iscomposing+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/index": {
      source: "iana"
    },
    "application/index.cmd": {
      source: "iana"
    },
    "application/index.obj": {
      source: "iana"
    },
    "application/index.response": {
      source: "iana"
    },
    "application/index.vnd": {
      source: "iana"
    },
    "application/inkml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ink", "inkml"]
    },
    "application/iotp": {
      source: "iana"
    },
    "application/ipfix": {
      source: "iana",
      extensions: ["ipfix"]
    },
    "application/ipp": {
      source: "iana"
    },
    "application/isup": {
      source: "iana"
    },
    "application/its+xml": {
      source: "iana",
      compressible: true,
      extensions: ["its"]
    },
    "application/java-archive": {
      source: "iana",
      compressible: false,
      extensions: ["jar", "war", "ear"]
    },
    "application/java-serialized-object": {
      source: "apache",
      compressible: false,
      extensions: ["ser"]
    },
    "application/java-vm": {
      source: "apache",
      compressible: false,
      extensions: ["class"]
    },
    "application/javascript": {
      source: "apache",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js"]
    },
    "application/jf2feed+json": {
      source: "iana",
      compressible: true
    },
    "application/jose": {
      source: "iana"
    },
    "application/jose+json": {
      source: "iana",
      compressible: true
    },
    "application/jrd+json": {
      source: "iana",
      compressible: true
    },
    "application/jscalendar+json": {
      source: "iana",
      compressible: true
    },
    "application/jscontact+json": {
      source: "iana",
      compressible: true
    },
    "application/json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["json", "map"]
    },
    "application/json-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/json-seq": {
      source: "iana"
    },
    "application/json5": {
      extensions: ["json5"]
    },
    "application/jsonml+json": {
      source: "apache",
      compressible: true,
      extensions: ["jsonml"]
    },
    "application/jsonpath": {
      source: "iana"
    },
    "application/jwk+json": {
      source: "iana",
      compressible: true
    },
    "application/jwk-set+json": {
      source: "iana",
      compressible: true
    },
    "application/jwt": {
      source: "iana"
    },
    "application/kpml-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/kpml-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/ld+json": {
      source: "iana",
      compressible: true,
      extensions: ["jsonld"]
    },
    "application/lgr+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lgr"]
    },
    "application/link-format": {
      source: "iana"
    },
    "application/linkset": {
      source: "iana"
    },
    "application/linkset+json": {
      source: "iana",
      compressible: true
    },
    "application/load-control+xml": {
      source: "iana",
      compressible: true
    },
    "application/logout+jwt": {
      source: "iana"
    },
    "application/lost+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lostxml"]
    },
    "application/lostsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/lpf+zip": {
      source: "iana",
      compressible: false
    },
    "application/lxf": {
      source: "iana"
    },
    "application/mac-binhex40": {
      source: "iana",
      extensions: ["hqx"]
    },
    "application/mac-compactpro": {
      source: "apache",
      extensions: ["cpt"]
    },
    "application/macwriteii": {
      source: "iana"
    },
    "application/mads+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mads"]
    },
    "application/manifest+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["webmanifest"]
    },
    "application/marc": {
      source: "iana",
      extensions: ["mrc"]
    },
    "application/marcxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mrcx"]
    },
    "application/mathematica": {
      source: "iana",
      extensions: ["ma", "nb", "mb"]
    },
    "application/mathml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mathml"]
    },
    "application/mathml-content+xml": {
      source: "iana",
      compressible: true
    },
    "application/mathml-presentation+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-associated-procedure-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-deregister+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-envelope+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-protection-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-reception-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-user-service-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbox": {
      source: "iana",
      extensions: ["mbox"]
    },
    "application/media-policy-dataset+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpf"]
    },
    "application/media_control+xml": {
      source: "iana",
      compressible: true
    },
    "application/mediaservercontrol+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mscml"]
    },
    "application/merge-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/metalink+xml": {
      source: "apache",
      compressible: true,
      extensions: ["metalink"]
    },
    "application/metalink4+xml": {
      source: "iana",
      compressible: true,
      extensions: ["meta4"]
    },
    "application/mets+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mets"]
    },
    "application/mf4": {
      source: "iana"
    },
    "application/mikey": {
      source: "iana"
    },
    "application/mipc": {
      source: "iana"
    },
    "application/missing-blocks+cbor-seq": {
      source: "iana"
    },
    "application/mmt-aei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["maei"]
    },
    "application/mmt-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musd"]
    },
    "application/mods+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mods"]
    },
    "application/moss-keys": {
      source: "iana"
    },
    "application/moss-signature": {
      source: "iana"
    },
    "application/mosskey-data": {
      source: "iana"
    },
    "application/mosskey-request": {
      source: "iana"
    },
    "application/mp21": {
      source: "iana",
      extensions: ["m21", "mp21"]
    },
    "application/mp4": {
      source: "iana",
      extensions: ["mp4", "mpg4", "mp4s", "m4p"]
    },
    "application/mpeg4-generic": {
      source: "iana"
    },
    "application/mpeg4-iod": {
      source: "iana"
    },
    "application/mpeg4-iod-xmt": {
      source: "iana"
    },
    "application/mrb-consumer+xml": {
      source: "iana",
      compressible: true
    },
    "application/mrb-publish+xml": {
      source: "iana",
      compressible: true
    },
    "application/msc-ivr+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msc-mixer+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msix": {
      compressible: false,
      extensions: ["msix"]
    },
    "application/msixbundle": {
      compressible: false,
      extensions: ["msixbundle"]
    },
    "application/msword": {
      source: "iana",
      compressible: false,
      extensions: ["doc", "dot"]
    },
    "application/mud+json": {
      source: "iana",
      compressible: true
    },
    "application/multipart-core": {
      source: "iana"
    },
    "application/mxf": {
      source: "iana",
      extensions: ["mxf"]
    },
    "application/n-quads": {
      source: "iana",
      extensions: ["nq"]
    },
    "application/n-triples": {
      source: "iana",
      extensions: ["nt"]
    },
    "application/nasdata": {
      source: "iana"
    },
    "application/news-checkgroups": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-groupinfo": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-transmission": {
      source: "iana"
    },
    "application/nlsml+xml": {
      source: "iana",
      compressible: true
    },
    "application/node": {
      source: "iana",
      extensions: ["cjs"]
    },
    "application/nss": {
      source: "iana"
    },
    "application/oauth-authz-req+jwt": {
      source: "iana"
    },
    "application/oblivious-dns-message": {
      source: "iana"
    },
    "application/ocsp-request": {
      source: "iana"
    },
    "application/ocsp-response": {
      source: "iana"
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/oda": {
      source: "iana",
      extensions: ["oda"]
    },
    "application/odm+xml": {
      source: "iana",
      compressible: true
    },
    "application/odx": {
      source: "iana"
    },
    "application/oebps-package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["opf"]
    },
    "application/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogx"]
    },
    "application/ohttp-keys": {
      source: "iana"
    },
    "application/omdoc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["omdoc"]
    },
    "application/onenote": {
      source: "apache",
      extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
    },
    "application/opc-nodeset+xml": {
      source: "iana",
      compressible: true
    },
    "application/oscore": {
      source: "iana"
    },
    "application/oxps": {
      source: "iana",
      extensions: ["oxps"]
    },
    "application/p21": {
      source: "iana"
    },
    "application/p21+zip": {
      source: "iana",
      compressible: false
    },
    "application/p2p-overlay+xml": {
      source: "iana",
      compressible: true,
      extensions: ["relo"]
    },
    "application/parityfec": {
      source: "iana"
    },
    "application/passport": {
      source: "iana"
    },
    "application/patch-ops-error+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xer"]
    },
    "application/pdf": {
      source: "iana",
      compressible: false,
      extensions: ["pdf"]
    },
    "application/pdx": {
      source: "iana"
    },
    "application/pem-certificate-chain": {
      source: "iana"
    },
    "application/pgp-encrypted": {
      source: "iana",
      compressible: false,
      extensions: ["pgp"]
    },
    "application/pgp-keys": {
      source: "iana",
      extensions: ["asc"]
    },
    "application/pgp-signature": {
      source: "iana",
      extensions: ["sig", "asc"]
    },
    "application/pics-rules": {
      source: "apache",
      extensions: ["prf"]
    },
    "application/pidf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pidf-diff+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pkcs10": {
      source: "iana",
      extensions: ["p10"]
    },
    "application/pkcs12": {
      source: "iana"
    },
    "application/pkcs7-mime": {
      source: "iana",
      extensions: ["p7m", "p7c"]
    },
    "application/pkcs7-signature": {
      source: "iana",
      extensions: ["p7s"]
    },
    "application/pkcs8": {
      source: "iana",
      extensions: ["p8"]
    },
    "application/pkcs8-encrypted": {
      source: "iana"
    },
    "application/pkix-attr-cert": {
      source: "iana",
      extensions: ["ac"]
    },
    "application/pkix-cert": {
      source: "iana",
      extensions: ["cer"]
    },
    "application/pkix-crl": {
      source: "iana",
      extensions: ["crl"]
    },
    "application/pkix-pkipath": {
      source: "iana",
      extensions: ["pkipath"]
    },
    "application/pkixcmp": {
      source: "iana",
      extensions: ["pki"]
    },
    "application/pls+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pls"]
    },
    "application/poc-settings+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/postscript": {
      source: "iana",
      compressible: true,
      extensions: ["ai", "eps", "ps"]
    },
    "application/ppsp-tracker+json": {
      source: "iana",
      compressible: true
    },
    "application/private-token-issuer-directory": {
      source: "iana"
    },
    "application/private-token-request": {
      source: "iana"
    },
    "application/private-token-response": {
      source: "iana"
    },
    "application/problem+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+xml": {
      source: "iana",
      compressible: true
    },
    "application/provenance+xml": {
      source: "iana",
      compressible: true,
      extensions: ["provx"]
    },
    "application/prs.alvestrand.titrax-sheet": {
      source: "iana"
    },
    "application/prs.cww": {
      source: "iana",
      extensions: ["cww"]
    },
    "application/prs.cyn": {
      source: "iana",
      charset: "7-BIT"
    },
    "application/prs.hpub+zip": {
      source: "iana",
      compressible: false
    },
    "application/prs.implied-document+xml": {
      source: "iana",
      compressible: true
    },
    "application/prs.implied-executable": {
      source: "iana"
    },
    "application/prs.implied-object+json": {
      source: "iana",
      compressible: true
    },
    "application/prs.implied-object+json-seq": {
      source: "iana"
    },
    "application/prs.implied-object+yaml": {
      source: "iana"
    },
    "application/prs.implied-structure": {
      source: "iana"
    },
    "application/prs.nprend": {
      source: "iana"
    },
    "application/prs.plucker": {
      source: "iana"
    },
    "application/prs.rdf-xml-crypt": {
      source: "iana"
    },
    "application/prs.vcfbzip2": {
      source: "iana"
    },
    "application/prs.xsf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsf"]
    },
    "application/pskc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pskcxml"]
    },
    "application/pvd+json": {
      source: "iana",
      compressible: true
    },
    "application/qsig": {
      source: "iana"
    },
    "application/raml+yaml": {
      compressible: true,
      extensions: ["raml"]
    },
    "application/raptorfec": {
      source: "iana"
    },
    "application/rdap+json": {
      source: "iana",
      compressible: true
    },
    "application/rdf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rdf", "owl"]
    },
    "application/reginfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rif"]
    },
    "application/relax-ng-compact-syntax": {
      source: "iana",
      extensions: ["rnc"]
    },
    "application/remote-printing": {
      source: "apache"
    },
    "application/reputon+json": {
      source: "iana",
      compressible: true
    },
    "application/resource-lists+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rl"]
    },
    "application/resource-lists-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rld"]
    },
    "application/rfc+xml": {
      source: "iana",
      compressible: true
    },
    "application/riscos": {
      source: "iana"
    },
    "application/rlmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/rls-services+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rs"]
    },
    "application/route-apd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rapd"]
    },
    "application/route-s-tsid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sls"]
    },
    "application/route-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rusd"]
    },
    "application/rpki-checklist": {
      source: "iana"
    },
    "application/rpki-ghostbusters": {
      source: "iana",
      extensions: ["gbr"]
    },
    "application/rpki-manifest": {
      source: "iana",
      extensions: ["mft"]
    },
    "application/rpki-publication": {
      source: "iana"
    },
    "application/rpki-roa": {
      source: "iana",
      extensions: ["roa"]
    },
    "application/rpki-signed-tal": {
      source: "iana"
    },
    "application/rpki-updown": {
      source: "iana"
    },
    "application/rsd+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rsd"]
    },
    "application/rss+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rss"]
    },
    "application/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "application/rtploopback": {
      source: "iana"
    },
    "application/rtx": {
      source: "iana"
    },
    "application/samlassertion+xml": {
      source: "iana",
      compressible: true
    },
    "application/samlmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/sarif+json": {
      source: "iana",
      compressible: true
    },
    "application/sarif-external-properties+json": {
      source: "iana",
      compressible: true
    },
    "application/sbe": {
      source: "iana"
    },
    "application/sbml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sbml"]
    },
    "application/scaip+xml": {
      source: "iana",
      compressible: true
    },
    "application/scim+json": {
      source: "iana",
      compressible: true
    },
    "application/scvp-cv-request": {
      source: "iana",
      extensions: ["scq"]
    },
    "application/scvp-cv-response": {
      source: "iana",
      extensions: ["scs"]
    },
    "application/scvp-vp-request": {
      source: "iana",
      extensions: ["spq"]
    },
    "application/scvp-vp-response": {
      source: "iana",
      extensions: ["spp"]
    },
    "application/sdp": {
      source: "iana",
      extensions: ["sdp"]
    },
    "application/secevent+jwt": {
      source: "iana"
    },
    "application/senml+cbor": {
      source: "iana"
    },
    "application/senml+json": {
      source: "iana",
      compressible: true
    },
    "application/senml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["senmlx"]
    },
    "application/senml-etch+cbor": {
      source: "iana"
    },
    "application/senml-etch+json": {
      source: "iana",
      compressible: true
    },
    "application/senml-exi": {
      source: "iana"
    },
    "application/sensml+cbor": {
      source: "iana"
    },
    "application/sensml+json": {
      source: "iana",
      compressible: true
    },
    "application/sensml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sensmlx"]
    },
    "application/sensml-exi": {
      source: "iana"
    },
    "application/sep+xml": {
      source: "iana",
      compressible: true
    },
    "application/sep-exi": {
      source: "iana"
    },
    "application/session-info": {
      source: "iana"
    },
    "application/set-payment": {
      source: "iana"
    },
    "application/set-payment-initiation": {
      source: "iana",
      extensions: ["setpay"]
    },
    "application/set-registration": {
      source: "iana"
    },
    "application/set-registration-initiation": {
      source: "iana",
      extensions: ["setreg"]
    },
    "application/sgml": {
      source: "iana"
    },
    "application/sgml-open-catalog": {
      source: "iana"
    },
    "application/shf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["shf"]
    },
    "application/sieve": {
      source: "iana",
      extensions: ["siv", "sieve"]
    },
    "application/simple-filter+xml": {
      source: "iana",
      compressible: true
    },
    "application/simple-message-summary": {
      source: "iana"
    },
    "application/simplesymbolcontainer": {
      source: "iana"
    },
    "application/sipc": {
      source: "iana"
    },
    "application/slate": {
      source: "iana"
    },
    "application/smil": {
      source: "apache"
    },
    "application/smil+xml": {
      source: "iana",
      compressible: true,
      extensions: ["smi", "smil"]
    },
    "application/smpte336m": {
      source: "iana"
    },
    "application/soap+fastinfoset": {
      source: "iana"
    },
    "application/soap+xml": {
      source: "iana",
      compressible: true
    },
    "application/sparql-query": {
      source: "iana",
      extensions: ["rq"]
    },
    "application/sparql-results+xml": {
      source: "iana",
      compressible: true,
      extensions: ["srx"]
    },
    "application/spdx+json": {
      source: "iana",
      compressible: true
    },
    "application/spirits-event+xml": {
      source: "iana",
      compressible: true
    },
    "application/sql": {
      source: "iana",
      extensions: ["sql"]
    },
    "application/srgs": {
      source: "iana",
      extensions: ["gram"]
    },
    "application/srgs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["grxml"]
    },
    "application/sru+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sru"]
    },
    "application/ssdl+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ssdl"]
    },
    "application/ssml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ssml"]
    },
    "application/st2110-41": {
      source: "iana"
    },
    "application/stix+json": {
      source: "iana",
      compressible: true
    },
    "application/stratum": {
      source: "iana"
    },
    "application/swid+cbor": {
      source: "iana"
    },
    "application/swid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["swidtag"]
    },
    "application/tamp-apex-update": {
      source: "iana"
    },
    "application/tamp-apex-update-confirm": {
      source: "iana"
    },
    "application/tamp-community-update": {
      source: "iana"
    },
    "application/tamp-community-update-confirm": {
      source: "iana"
    },
    "application/tamp-error": {
      source: "iana"
    },
    "application/tamp-sequence-adjust": {
      source: "iana"
    },
    "application/tamp-sequence-adjust-confirm": {
      source: "iana"
    },
    "application/tamp-status-query": {
      source: "iana"
    },
    "application/tamp-status-response": {
      source: "iana"
    },
    "application/tamp-update": {
      source: "iana"
    },
    "application/tamp-update-confirm": {
      source: "iana"
    },
    "application/tar": {
      compressible: true
    },
    "application/taxii+json": {
      source: "iana",
      compressible: true
    },
    "application/td+json": {
      source: "iana",
      compressible: true
    },
    "application/tei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tei", "teicorpus"]
    },
    "application/tetra_isi": {
      source: "iana"
    },
    "application/thraud+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tfi"]
    },
    "application/timestamp-query": {
      source: "iana"
    },
    "application/timestamp-reply": {
      source: "iana"
    },
    "application/timestamped-data": {
      source: "iana",
      extensions: ["tsd"]
    },
    "application/tlsrpt+gzip": {
      source: "iana"
    },
    "application/tlsrpt+json": {
      source: "iana",
      compressible: true
    },
    "application/tm+json": {
      source: "iana",
      compressible: true
    },
    "application/tnauthlist": {
      source: "iana"
    },
    "application/token-introspection+jwt": {
      source: "iana"
    },
    "application/toml": {
      compressible: true,
      extensions: ["toml"]
    },
    "application/trickle-ice-sdpfrag": {
      source: "iana"
    },
    "application/trig": {
      source: "iana",
      extensions: ["trig"]
    },
    "application/ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ttml"]
    },
    "application/tve-trigger": {
      source: "iana"
    },
    "application/tzif": {
      source: "iana"
    },
    "application/tzif-leap": {
      source: "iana"
    },
    "application/ubjson": {
      compressible: false,
      extensions: ["ubj"]
    },
    "application/ulpfec": {
      source: "iana"
    },
    "application/urc-grpsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/urc-ressheet+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsheet"]
    },
    "application/urc-targetdesc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["td"]
    },
    "application/urc-uisocketdesc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vc": {
      source: "iana"
    },
    "application/vcard+json": {
      source: "iana",
      compressible: true
    },
    "application/vcard+xml": {
      source: "iana",
      compressible: true
    },
    "application/vemmi": {
      source: "iana"
    },
    "application/vividence.scriptfile": {
      source: "apache"
    },
    "application/vnd.1000minds.decision-model+xml": {
      source: "iana",
      compressible: true,
      extensions: ["1km"]
    },
    "application/vnd.1ob": {
      source: "iana"
    },
    "application/vnd.3gpp-prose+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3a+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ach+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ch+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc8+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-v2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.5gnas": {
      source: "iana"
    },
    "application/vnd.3gpp.5gsa2x": {
      source: "iana"
    },
    "application/vnd.3gpp.5gsa2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.access-transfer-events+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.bsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.crs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.current-location-discovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gmop+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gtpc": {
      source: "iana"
    },
    "application/vnd.3gpp.interworking-data": {
      source: "iana"
    },
    "application/vnd.3gpp.lpp": {
      source: "iana"
    },
    "application/vnd.3gpp.mc-signalling-ear": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-payload": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-regroup+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-signalling": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-floor-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-regroup+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-signed+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-init-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-regroup+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-transmission-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mid-call+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ngap": {
      source: "iana"
    },
    "application/vnd.3gpp.pfcp": {
      source: "iana"
    },
    "application/vnd.3gpp.pic-bw-large": {
      source: "iana",
      extensions: ["plb"]
    },
    "application/vnd.3gpp.pic-bw-small": {
      source: "iana",
      extensions: ["psb"]
    },
    "application/vnd.3gpp.pic-bw-var": {
      source: "iana",
      extensions: ["pvb"]
    },
    "application/vnd.3gpp.pinapp-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.s1ap": {
      source: "iana"
    },
    "application/vnd.3gpp.seal-group-doc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-network-qos-management-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-ue-config-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-unicast-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.seal-user-profile-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.sms": {
      source: "iana"
    },
    "application/vnd.3gpp.sms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-ext+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.state-and-event-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ussd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.v2x": {
      source: "iana"
    },
    "application/vnd.3gpp.vae-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.bcmcsinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.sms": {
      source: "iana"
    },
    "application/vnd.3gpp2.tcap": {
      source: "iana",
      extensions: ["tcap"]
    },
    "application/vnd.3lightssoftware.imagescal": {
      source: "iana"
    },
    "application/vnd.3m.post-it-notes": {
      source: "iana",
      extensions: ["pwn"]
    },
    "application/vnd.accpac.simply.aso": {
      source: "iana",
      extensions: ["aso"]
    },
    "application/vnd.accpac.simply.imp": {
      source: "iana",
      extensions: ["imp"]
    },
    "application/vnd.acm.addressxfer+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.acm.chatbot+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.acucobol": {
      source: "iana",
      extensions: ["acu"]
    },
    "application/vnd.acucorp": {
      source: "iana",
      extensions: ["atc", "acutc"]
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
      source: "apache",
      compressible: false,
      extensions: ["air"]
    },
    "application/vnd.adobe.flash.movie": {
      source: "iana"
    },
    "application/vnd.adobe.formscentral.fcdt": {
      source: "iana",
      extensions: ["fcdt"]
    },
    "application/vnd.adobe.fxp": {
      source: "iana",
      extensions: ["fxp", "fxpl"]
    },
    "application/vnd.adobe.partial-upload": {
      source: "iana"
    },
    "application/vnd.adobe.xdp+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdp"]
    },
    "application/vnd.adobe.xfdf": {
      source: "apache",
      extensions: ["xfdf"]
    },
    "application/vnd.aether.imp": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata-pagedef": {
      source: "iana"
    },
    "application/vnd.afpc.cmoca-cmresource": {
      source: "iana"
    },
    "application/vnd.afpc.foca-charset": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codedfont": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codepage": {
      source: "iana"
    },
    "application/vnd.afpc.modca": {
      source: "iana"
    },
    "application/vnd.afpc.modca-cmtable": {
      source: "iana"
    },
    "application/vnd.afpc.modca-formdef": {
      source: "iana"
    },
    "application/vnd.afpc.modca-mediummap": {
      source: "iana"
    },
    "application/vnd.afpc.modca-objectcontainer": {
      source: "iana"
    },
    "application/vnd.afpc.modca-overlay": {
      source: "iana"
    },
    "application/vnd.afpc.modca-pagesegment": {
      source: "iana"
    },
    "application/vnd.age": {
      source: "iana",
      extensions: ["age"]
    },
    "application/vnd.ah-barcode": {
      source: "apache"
    },
    "application/vnd.ahead.space": {
      source: "iana",
      extensions: ["ahead"]
    },
    "application/vnd.airzip.filesecure.azf": {
      source: "iana",
      extensions: ["azf"]
    },
    "application/vnd.airzip.filesecure.azs": {
      source: "iana",
      extensions: ["azs"]
    },
    "application/vnd.amadeus+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.amazon.ebook": {
      source: "apache",
      extensions: ["azw"]
    },
    "application/vnd.amazon.mobi8-ebook": {
      source: "iana"
    },
    "application/vnd.americandynamics.acc": {
      source: "iana",
      extensions: ["acc"]
    },
    "application/vnd.amiga.ami": {
      source: "iana",
      extensions: ["ami"]
    },
    "application/vnd.amundsen.maze+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.android.ota": {
      source: "iana"
    },
    "application/vnd.android.package-archive": {
      source: "apache",
      compressible: false,
      extensions: ["apk"]
    },
    "application/vnd.anki": {
      source: "iana"
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
      source: "iana",
      extensions: ["cii"]
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
      source: "apache",
      extensions: ["fti"]
    },
    "application/vnd.antix.game-component": {
      source: "iana",
      extensions: ["atx"]
    },
    "application/vnd.apache.arrow.file": {
      source: "iana"
    },
    "application/vnd.apache.arrow.stream": {
      source: "iana"
    },
    "application/vnd.apache.parquet": {
      source: "iana"
    },
    "application/vnd.apache.thrift.binary": {
      source: "iana"
    },
    "application/vnd.apache.thrift.compact": {
      source: "iana"
    },
    "application/vnd.apache.thrift.json": {
      source: "iana"
    },
    "application/vnd.apexlang": {
      source: "iana"
    },
    "application/vnd.api+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.aplextor.warrp+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apothekende.reservation+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apple.installer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpkg"]
    },
    "application/vnd.apple.keynote": {
      source: "iana",
      extensions: ["key"]
    },
    "application/vnd.apple.mpegurl": {
      source: "iana",
      extensions: ["m3u8"]
    },
    "application/vnd.apple.numbers": {
      source: "iana",
      extensions: ["numbers"]
    },
    "application/vnd.apple.pages": {
      source: "iana",
      extensions: ["pages"]
    },
    "application/vnd.apple.pkpass": {
      compressible: false,
      extensions: ["pkpass"]
    },
    "application/vnd.arastra.swi": {
      source: "apache"
    },
    "application/vnd.aristanetworks.swi": {
      source: "iana",
      extensions: ["swi"]
    },
    "application/vnd.artisan+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.artsquare": {
      source: "iana"
    },
    "application/vnd.astraea-software.iota": {
      source: "iana",
      extensions: ["iota"]
    },
    "application/vnd.audiograph": {
      source: "iana",
      extensions: ["aep"]
    },
    "application/vnd.autopackage": {
      source: "iana"
    },
    "application/vnd.avalon+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.avistar+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.balsamiq.bmml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bmml"]
    },
    "application/vnd.balsamiq.bmpr": {
      source: "iana"
    },
    "application/vnd.banana-accounting": {
      source: "iana"
    },
    "application/vnd.bbf.usp.error": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bekitzur-stech+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.belightsoft.lhzd+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.belightsoft.lhzl+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.bint.med-content": {
      source: "iana"
    },
    "application/vnd.biopax.rdf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.blink-idb-value-wrapper": {
      source: "iana"
    },
    "application/vnd.blueice.multipass": {
      source: "iana",
      extensions: ["mpm"]
    },
    "application/vnd.bluetooth.ep.oob": {
      source: "iana"
    },
    "application/vnd.bluetooth.le.oob": {
      source: "iana"
    },
    "application/vnd.bmi": {
      source: "iana",
      extensions: ["bmi"]
    },
    "application/vnd.bpf": {
      source: "iana"
    },
    "application/vnd.bpf3": {
      source: "iana"
    },
    "application/vnd.businessobjects": {
      source: "iana",
      extensions: ["rep"]
    },
    "application/vnd.byu.uapi+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bzip3": {
      source: "iana"
    },
    "application/vnd.c3voc.schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cab-jscript": {
      source: "iana"
    },
    "application/vnd.canon-cpdl": {
      source: "iana"
    },
    "application/vnd.canon-lips": {
      source: "iana"
    },
    "application/vnd.capasystems-pg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cendio.thinlinc.clientconf": {
      source: "iana"
    },
    "application/vnd.century-systems.tcp_stream": {
      source: "iana"
    },
    "application/vnd.chemdraw+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdxml"]
    },
    "application/vnd.chess-pgn": {
      source: "iana"
    },
    "application/vnd.chipnuts.karaoke-mmd": {
      source: "iana",
      extensions: ["mmd"]
    },
    "application/vnd.ciedi": {
      source: "iana"
    },
    "application/vnd.cinderella": {
      source: "iana",
      extensions: ["cdy"]
    },
    "application/vnd.cirpack.isdn-ext": {
      source: "iana"
    },
    "application/vnd.citationstyles.style+xml": {
      source: "iana",
      compressible: true,
      extensions: ["csl"]
    },
    "application/vnd.claymore": {
      source: "iana",
      extensions: ["cla"]
    },
    "application/vnd.cloanto.rp9": {
      source: "iana",
      extensions: ["rp9"]
    },
    "application/vnd.clonk.c4group": {
      source: "iana",
      extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
    },
    "application/vnd.cluetrust.cartomobile-config": {
      source: "iana",
      extensions: ["c11amc"]
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
      source: "iana",
      extensions: ["c11amz"]
    },
    "application/vnd.cncf.helm.chart.content.v1.tar+gzip": {
      source: "iana"
    },
    "application/vnd.cncf.helm.chart.provenance.v1.prov": {
      source: "iana"
    },
    "application/vnd.cncf.helm.config.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.coffeescript": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet-template": {
      source: "iana"
    },
    "application/vnd.collection+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.doc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.next+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.comicbook+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.comicbook-rar": {
      source: "iana"
    },
    "application/vnd.commerce-battelle": {
      source: "iana"
    },
    "application/vnd.commonspace": {
      source: "iana",
      extensions: ["csp"]
    },
    "application/vnd.contact.cmsg": {
      source: "iana",
      extensions: ["cdbcmsg"]
    },
    "application/vnd.coreos.ignition+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cosmocaller": {
      source: "iana",
      extensions: ["cmc"]
    },
    "application/vnd.crick.clicker": {
      source: "iana",
      extensions: ["clkx"]
    },
    "application/vnd.crick.clicker.keyboard": {
      source: "iana",
      extensions: ["clkk"]
    },
    "application/vnd.crick.clicker.palette": {
      source: "iana",
      extensions: ["clkp"]
    },
    "application/vnd.crick.clicker.template": {
      source: "iana",
      extensions: ["clkt"]
    },
    "application/vnd.crick.clicker.wordbank": {
      source: "iana",
      extensions: ["clkw"]
    },
    "application/vnd.criticaltools.wbs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wbs"]
    },
    "application/vnd.cryptii.pipe+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.crypto-shade-file": {
      source: "iana"
    },
    "application/vnd.cryptomator.encrypted": {
      source: "iana"
    },
    "application/vnd.cryptomator.vault": {
      source: "iana"
    },
    "application/vnd.ctc-posml": {
      source: "iana",
      extensions: ["pml"]
    },
    "application/vnd.ctct.ws+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cups-pdf": {
      source: "iana"
    },
    "application/vnd.cups-postscript": {
      source: "iana"
    },
    "application/vnd.cups-ppd": {
      source: "iana",
      extensions: ["ppd"]
    },
    "application/vnd.cups-raster": {
      source: "iana"
    },
    "application/vnd.cups-raw": {
      source: "iana"
    },
    "application/vnd.curl": {
      source: "iana"
    },
    "application/vnd.curl.car": {
      source: "apache",
      extensions: ["car"]
    },
    "application/vnd.curl.pcurl": {
      source: "apache",
      extensions: ["pcurl"]
    },
    "application/vnd.cyan.dean.root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cybank": {
      source: "iana"
    },
    "application/vnd.cyclonedx+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cyclonedx+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.d2l.coursepackage1p0+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.d3m-dataset": {
      source: "iana"
    },
    "application/vnd.d3m-problem": {
      source: "iana"
    },
    "application/vnd.dart": {
      source: "iana",
      compressible: true,
      extensions: ["dart"]
    },
    "application/vnd.data-vision.rdz": {
      source: "iana",
      extensions: ["rdz"]
    },
    "application/vnd.datalog": {
      source: "iana"
    },
    "application/vnd.datapackage+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dataresource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dbf": {
      source: "iana",
      extensions: ["dbf"]
    },
    "application/vnd.debian.binary-package": {
      source: "iana"
    },
    "application/vnd.dece.data": {
      source: "iana",
      extensions: ["uvf", "uvvf", "uvd", "uvvd"]
    },
    "application/vnd.dece.ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uvt", "uvvt"]
    },
    "application/vnd.dece.unspecified": {
      source: "iana",
      extensions: ["uvx", "uvvx"]
    },
    "application/vnd.dece.zip": {
      source: "iana",
      extensions: ["uvz", "uvvz"]
    },
    "application/vnd.denovo.fcselayout-link": {
      source: "iana",
      extensions: ["fe_launch"]
    },
    "application/vnd.desmume.movie": {
      source: "iana"
    },
    "application/vnd.dir-bi.plate-dl-nosuffix": {
      source: "iana"
    },
    "application/vnd.dm.delegation+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dna": {
      source: "iana",
      extensions: ["dna"]
    },
    "application/vnd.document+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dolby.mlp": {
      source: "apache",
      extensions: ["mlp"]
    },
    "application/vnd.dolby.mobile.1": {
      source: "iana"
    },
    "application/vnd.dolby.mobile.2": {
      source: "iana"
    },
    "application/vnd.doremir.scorecloud-binary-document": {
      source: "iana"
    },
    "application/vnd.dpgraph": {
      source: "iana",
      extensions: ["dpg"]
    },
    "application/vnd.dreamfactory": {
      source: "iana",
      extensions: ["dfac"]
    },
    "application/vnd.drive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ds-keypoint": {
      source: "apache",
      extensions: ["kpxx"]
    },
    "application/vnd.dtg.local": {
      source: "iana"
    },
    "application/vnd.dtg.local.flash": {
      source: "iana"
    },
    "application/vnd.dtg.local.html": {
      source: "iana"
    },
    "application/vnd.dvb.ait": {
      source: "iana",
      extensions: ["ait"]
    },
    "application/vnd.dvb.dvbisl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.dvbj": {
      source: "iana"
    },
    "application/vnd.dvb.esgcontainer": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcdftnotifaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess2": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgpdd": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcroaming": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-base": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-enhancement": {
      source: "iana"
    },
    "application/vnd.dvb.notif-aggregate-root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-container+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-generic+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-msglist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-init+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.pfr": {
      source: "iana"
    },
    "application/vnd.dvb.service": {
      source: "iana",
      extensions: ["svc"]
    },
    "application/vnd.dxr": {
      source: "iana"
    },
    "application/vnd.dynageo": {
      source: "iana",
      extensions: ["geo"]
    },
    "application/vnd.dzr": {
      source: "iana"
    },
    "application/vnd.easykaraoke.cdgdownload": {
      source: "iana"
    },
    "application/vnd.ecdis-update": {
      source: "iana"
    },
    "application/vnd.ecip.rlp": {
      source: "iana"
    },
    "application/vnd.eclipse.ditto+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ecowin.chart": {
      source: "iana",
      extensions: ["mag"]
    },
    "application/vnd.ecowin.filerequest": {
      source: "iana"
    },
    "application/vnd.ecowin.fileupdate": {
      source: "iana"
    },
    "application/vnd.ecowin.series": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesrequest": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesupdate": {
      source: "iana"
    },
    "application/vnd.efi.img": {
      source: "iana"
    },
    "application/vnd.efi.iso": {
      source: "iana"
    },
    "application/vnd.eln+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.emclient.accessrequest+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.enliven": {
      source: "iana",
      extensions: ["nml"]
    },
    "application/vnd.enphase.envoy": {
      source: "iana"
    },
    "application/vnd.eprints.data+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.epson.esf": {
      source: "iana",
      extensions: ["esf"]
    },
    "application/vnd.epson.msf": {
      source: "iana",
      extensions: ["msf"]
    },
    "application/vnd.epson.quickanime": {
      source: "iana",
      extensions: ["qam"]
    },
    "application/vnd.epson.salt": {
      source: "iana",
      extensions: ["slt"]
    },
    "application/vnd.epson.ssf": {
      source: "iana",
      extensions: ["ssf"]
    },
    "application/vnd.ericsson.quickcall": {
      source: "iana"
    },
    "application/vnd.erofs": {
      source: "iana"
    },
    "application/vnd.espass-espass+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.eszigno3+xml": {
      source: "iana",
      compressible: true,
      extensions: ["es3", "et3"]
    },
    "application/vnd.etsi.aoc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.asic-e+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.asic-s+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.cug+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvcommand+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-bc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-cod+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-npvr+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvservice+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mcid+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mheg5": {
      source: "iana"
    },
    "application/vnd.etsi.overload-control-policy-dataset+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.pstn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.sci+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.simservs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.timestamp-token": {
      source: "iana"
    },
    "application/vnd.etsi.tsl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.tsl.der": {
      source: "iana"
    },
    "application/vnd.eu.kasparian.car+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.eudora.data": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.profile": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.settings": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.theme": {
      source: "iana"
    },
    "application/vnd.exstream-empower+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.exstream-package": {
      source: "iana"
    },
    "application/vnd.ezpix-album": {
      source: "iana",
      extensions: ["ez2"]
    },
    "application/vnd.ezpix-package": {
      source: "iana",
      extensions: ["ez3"]
    },
    "application/vnd.f-secure.mobile": {
      source: "iana"
    },
    "application/vnd.familysearch.gedcom+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.fastcopy-disk-image": {
      source: "iana"
    },
    "application/vnd.fdf": {
      source: "apache",
      extensions: ["fdf"]
    },
    "application/vnd.fdsn.mseed": {
      source: "iana",
      extensions: ["mseed"]
    },
    "application/vnd.fdsn.seed": {
      source: "iana",
      extensions: ["seed", "dataless"]
    },
    "application/vnd.ffsns": {
      source: "iana"
    },
    "application/vnd.ficlab.flb+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.filmit.zfc": {
      source: "iana"
    },
    "application/vnd.fints": {
      source: "iana"
    },
    "application/vnd.firemonkeys.cloudcell": {
      source: "iana"
    },
    "application/vnd.flographit": {
      source: "iana",
      extensions: ["gph"]
    },
    "application/vnd.fluxtime.clip": {
      source: "iana",
      extensions: ["ftc"]
    },
    "application/vnd.font-fontforge-sfd": {
      source: "iana"
    },
    "application/vnd.framemaker": {
      source: "iana",
      extensions: ["fm", "frame", "maker", "book"]
    },
    "application/vnd.freelog.comic": {
      source: "iana"
    },
    "application/vnd.frogans.fnc": {
      source: "apache",
      extensions: ["fnc"]
    },
    "application/vnd.frogans.ltf": {
      source: "apache",
      extensions: ["ltf"]
    },
    "application/vnd.fsc.weblaunch": {
      source: "iana",
      extensions: ["fsc"]
    },
    "application/vnd.fujifilm.fb.docuworks": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.binder": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.jfi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fujitsu.oasys": {
      source: "iana",
      extensions: ["oas"]
    },
    "application/vnd.fujitsu.oasys2": {
      source: "iana",
      extensions: ["oa2"]
    },
    "application/vnd.fujitsu.oasys3": {
      source: "iana",
      extensions: ["oa3"]
    },
    "application/vnd.fujitsu.oasysgp": {
      source: "iana",
      extensions: ["fg5"]
    },
    "application/vnd.fujitsu.oasysprs": {
      source: "iana",
      extensions: ["bh2"]
    },
    "application/vnd.fujixerox.art-ex": {
      source: "iana"
    },
    "application/vnd.fujixerox.art4": {
      source: "iana"
    },
    "application/vnd.fujixerox.ddd": {
      source: "iana",
      extensions: ["ddd"]
    },
    "application/vnd.fujixerox.docuworks": {
      source: "iana",
      extensions: ["xdw"]
    },
    "application/vnd.fujixerox.docuworks.binder": {
      source: "iana",
      extensions: ["xbd"]
    },
    "application/vnd.fujixerox.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujixerox.hbpl": {
      source: "iana"
    },
    "application/vnd.fut-misnet": {
      source: "iana"
    },
    "application/vnd.futoin+cbor": {
      source: "iana"
    },
    "application/vnd.futoin+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fuzzysheet": {
      source: "iana",
      extensions: ["fzs"]
    },
    "application/vnd.ga4gh.passport+jwt": {
      source: "iana"
    },
    "application/vnd.genomatix.tuxedo": {
      source: "iana",
      extensions: ["txd"]
    },
    "application/vnd.genozip": {
      source: "iana"
    },
    "application/vnd.gentics.grd+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gentoo.catmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gentoo.ebuild": {
      source: "iana"
    },
    "application/vnd.gentoo.eclass": {
      source: "iana"
    },
    "application/vnd.gentoo.gpkg": {
      source: "iana"
    },
    "application/vnd.gentoo.manifest": {
      source: "iana"
    },
    "application/vnd.gentoo.pkgmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gentoo.xpak": {
      source: "iana"
    },
    "application/vnd.geo+json": {
      source: "apache",
      compressible: true
    },
    "application/vnd.geocube+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.geogebra.file": {
      source: "iana",
      extensions: ["ggb"]
    },
    "application/vnd.geogebra.slides": {
      source: "iana",
      extensions: ["ggs"]
    },
    "application/vnd.geogebra.tool": {
      source: "iana",
      extensions: ["ggt"]
    },
    "application/vnd.geometry-explorer": {
      source: "iana",
      extensions: ["gex", "gre"]
    },
    "application/vnd.geonext": {
      source: "iana",
      extensions: ["gxt"]
    },
    "application/vnd.geoplan": {
      source: "iana",
      extensions: ["g2w"]
    },
    "application/vnd.geospace": {
      source: "iana",
      extensions: ["g3w"]
    },
    "application/vnd.gerber": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt-response": {
      source: "iana"
    },
    "application/vnd.gmx": {
      source: "iana",
      extensions: ["gmx"]
    },
    "application/vnd.gnu.taler.exchange+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gnu.taler.merchant+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.google-apps.document": {
      compressible: false,
      extensions: ["gdoc"]
    },
    "application/vnd.google-apps.presentation": {
      compressible: false,
      extensions: ["gslides"]
    },
    "application/vnd.google-apps.spreadsheet": {
      compressible: false,
      extensions: ["gsheet"]
    },
    "application/vnd.google-earth.kml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["kml"]
    },
    "application/vnd.google-earth.kmz": {
      source: "iana",
      compressible: false,
      extensions: ["kmz"]
    },
    "application/vnd.gov.sk.e-form+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.gov.sk.e-form+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.gov.sk.xmldatacontainer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdcf"]
    },
    "application/vnd.gpxsee.map+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.grafeq": {
      source: "iana",
      extensions: ["gqf", "gqs"]
    },
    "application/vnd.gridmp": {
      source: "iana"
    },
    "application/vnd.groove-account": {
      source: "iana",
      extensions: ["gac"]
    },
    "application/vnd.groove-help": {
      source: "iana",
      extensions: ["ghf"]
    },
    "application/vnd.groove-identity-message": {
      source: "iana",
      extensions: ["gim"]
    },
    "application/vnd.groove-injector": {
      source: "iana",
      extensions: ["grv"]
    },
    "application/vnd.groove-tool-message": {
      source: "iana",
      extensions: ["gtm"]
    },
    "application/vnd.groove-tool-template": {
      source: "iana",
      extensions: ["tpl"]
    },
    "application/vnd.groove-vcard": {
      source: "iana",
      extensions: ["vcg"]
    },
    "application/vnd.hal+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hal+xml": {
      source: "iana",
      compressible: true,
      extensions: ["hal"]
    },
    "application/vnd.handheld-entertainment+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zmm"]
    },
    "application/vnd.hbci": {
      source: "iana",
      extensions: ["hbci"]
    },
    "application/vnd.hc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hcl-bireports": {
      source: "iana"
    },
    "application/vnd.hdt": {
      source: "iana"
    },
    "application/vnd.heroku+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hhe.lesson-player": {
      source: "iana",
      extensions: ["les"]
    },
    "application/vnd.hp-hpgl": {
      source: "iana",
      extensions: ["hpgl"]
    },
    "application/vnd.hp-hpid": {
      source: "iana",
      extensions: ["hpid"]
    },
    "application/vnd.hp-hps": {
      source: "iana",
      extensions: ["hps"]
    },
    "application/vnd.hp-jlyt": {
      source: "iana",
      extensions: ["jlt"]
    },
    "application/vnd.hp-pcl": {
      source: "iana",
      extensions: ["pcl"]
    },
    "application/vnd.hp-pclxl": {
      source: "iana",
      extensions: ["pclxl"]
    },
    "application/vnd.hsl": {
      source: "iana"
    },
    "application/vnd.httphone": {
      source: "iana"
    },
    "application/vnd.hydrostatix.sof-data": {
      source: "iana",
      extensions: ["sfd-hdstx"]
    },
    "application/vnd.hyper+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyper-item+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyperdrive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hzn-3d-crossword": {
      source: "iana"
    },
    "application/vnd.ibm.afplinedata": {
      source: "apache"
    },
    "application/vnd.ibm.electronic-media": {
      source: "iana"
    },
    "application/vnd.ibm.minipay": {
      source: "iana",
      extensions: ["mpy"]
    },
    "application/vnd.ibm.modcap": {
      source: "apache",
      extensions: ["afp", "listafp", "list3820"]
    },
    "application/vnd.ibm.rights-management": {
      source: "iana",
      extensions: ["irm"]
    },
    "application/vnd.ibm.secure-container": {
      source: "iana",
      extensions: ["sc"]
    },
    "application/vnd.iccprofile": {
      source: "iana",
      extensions: ["icc", "icm"]
    },
    "application/vnd.ieee.1905": {
      source: "iana"
    },
    "application/vnd.igloader": {
      source: "iana",
      extensions: ["igl"]
    },
    "application/vnd.imagemeter.folder+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.imagemeter.image+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.immervision-ivp": {
      source: "iana",
      extensions: ["ivp"]
    },
    "application/vnd.immervision-ivu": {
      source: "iana",
      extensions: ["ivu"]
    },
    "application/vnd.ims.imsccv1p1": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p2": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p3": {
      source: "iana"
    },
    "application/vnd.ims.lis.v2.result+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy.id+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings.simple+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informedcontrol.rms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informix-visionary": {
      source: "apache"
    },
    "application/vnd.infotech.project": {
      source: "iana"
    },
    "application/vnd.infotech.project+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.innopath.wamp.notification": {
      source: "iana"
    },
    "application/vnd.insors.igm": {
      source: "iana",
      extensions: ["igm"]
    },
    "application/vnd.intercon.formnet": {
      source: "iana",
      extensions: ["xpw", "xpx"]
    },
    "application/vnd.intergeo": {
      source: "iana",
      extensions: ["i2g"]
    },
    "application/vnd.intertrust.digibox": {
      source: "iana"
    },
    "application/vnd.intertrust.nncp": {
      source: "iana"
    },
    "application/vnd.intu.qbo": {
      source: "iana",
      extensions: ["qbo"]
    },
    "application/vnd.intu.qfx": {
      source: "iana",
      extensions: ["qfx"]
    },
    "application/vnd.ipfs.ipns-record": {
      source: "iana"
    },
    "application/vnd.ipld.car": {
      source: "iana"
    },
    "application/vnd.ipld.dag-cbor": {
      source: "iana"
    },
    "application/vnd.ipld.dag-json": {
      source: "iana"
    },
    "application/vnd.ipld.raw": {
      source: "iana"
    },
    "application/vnd.iptc.g2.catalogitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.conceptitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.knowledgeitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.packageitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.planningitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ipunplugged.rcprofile": {
      source: "iana",
      extensions: ["rcprofile"]
    },
    "application/vnd.irepository.package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["irp"]
    },
    "application/vnd.is-xpr": {
      source: "iana",
      extensions: ["xpr"]
    },
    "application/vnd.isac.fcs": {
      source: "iana",
      extensions: ["fcs"]
    },
    "application/vnd.iso11783-10+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.jam": {
      source: "iana",
      extensions: ["jam"]
    },
    "application/vnd.japannet-directory-service": {
      source: "iana"
    },
    "application/vnd.japannet-jpnstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-payment-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-registration": {
      source: "iana"
    },
    "application/vnd.japannet-registration-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-setstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-verification": {
      source: "iana"
    },
    "application/vnd.japannet-verification-wakeup": {
      source: "iana"
    },
    "application/vnd.jcp.javame.midlet-rms": {
      source: "iana",
      extensions: ["rms"]
    },
    "application/vnd.jisp": {
      source: "iana",
      extensions: ["jisp"]
    },
    "application/vnd.joost.joda-archive": {
      source: "iana",
      extensions: ["joda"]
    },
    "application/vnd.jsk.isdn-ngn": {
      source: "iana"
    },
    "application/vnd.kahootz": {
      source: "iana",
      extensions: ["ktz", "ktr"]
    },
    "application/vnd.kde.karbon": {
      source: "iana",
      extensions: ["karbon"]
    },
    "application/vnd.kde.kchart": {
      source: "iana",
      extensions: ["chrt"]
    },
    "application/vnd.kde.kformula": {
      source: "iana",
      extensions: ["kfo"]
    },
    "application/vnd.kde.kivio": {
      source: "iana",
      extensions: ["flw"]
    },
    "application/vnd.kde.kontour": {
      source: "iana",
      extensions: ["kon"]
    },
    "application/vnd.kde.kpresenter": {
      source: "iana",
      extensions: ["kpr", "kpt"]
    },
    "application/vnd.kde.kspread": {
      source: "iana",
      extensions: ["ksp"]
    },
    "application/vnd.kde.kword": {
      source: "iana",
      extensions: ["kwd", "kwt"]
    },
    "application/vnd.kenameaapp": {
      source: "iana",
      extensions: ["htke"]
    },
    "application/vnd.kidspiration": {
      source: "iana",
      extensions: ["kia"]
    },
    "application/vnd.kinar": {
      source: "iana",
      extensions: ["kne", "knp"]
    },
    "application/vnd.koan": {
      source: "iana",
      extensions: ["skp", "skd", "skt", "skm"]
    },
    "application/vnd.kodak-descriptor": {
      source: "iana",
      extensions: ["sse"]
    },
    "application/vnd.las": {
      source: "iana"
    },
    "application/vnd.las.las+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.las.las+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lasxml"]
    },
    "application/vnd.laszip": {
      source: "iana"
    },
    "application/vnd.ldev.productlicensing": {
      source: "iana"
    },
    "application/vnd.leap+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.liberty-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
      source: "iana",
      extensions: ["lbd"]
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lbe"]
    },
    "application/vnd.logipipe.circuit+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.loom": {
      source: "iana"
    },
    "application/vnd.lotus-1-2-3": {
      source: "iana",
      extensions: ["123"]
    },
    "application/vnd.lotus-approach": {
      source: "iana",
      extensions: ["apr"]
    },
    "application/vnd.lotus-freelance": {
      source: "iana",
      extensions: ["pre"]
    },
    "application/vnd.lotus-notes": {
      source: "iana",
      extensions: ["nsf"]
    },
    "application/vnd.lotus-organizer": {
      source: "iana",
      extensions: ["org"]
    },
    "application/vnd.lotus-screencam": {
      source: "iana",
      extensions: ["scm"]
    },
    "application/vnd.lotus-wordpro": {
      source: "iana",
      extensions: ["lwp"]
    },
    "application/vnd.macports.portpkg": {
      source: "iana",
      extensions: ["portpkg"]
    },
    "application/vnd.mapbox-vector-tile": {
      source: "iana",
      extensions: ["mvt"]
    },
    "application/vnd.marlin.drm.actiontoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.conftoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.license+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.mdcf": {
      source: "iana"
    },
    "application/vnd.mason+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.maxar.archive.3tz+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.maxmind.maxmind-db": {
      source: "iana"
    },
    "application/vnd.mcd": {
      source: "iana",
      extensions: ["mcd"]
    },
    "application/vnd.mdl": {
      source: "iana"
    },
    "application/vnd.mdl-mbsdf": {
      source: "iana"
    },
    "application/vnd.medcalcdata": {
      source: "iana",
      extensions: ["mc1"]
    },
    "application/vnd.mediastation.cdkey": {
      source: "iana",
      extensions: ["cdkey"]
    },
    "application/vnd.medicalholodeck.recordxr": {
      source: "iana"
    },
    "application/vnd.meridian-slingshot": {
      source: "iana"
    },
    "application/vnd.mermaid": {
      source: "iana"
    },
    "application/vnd.mfer": {
      source: "iana",
      extensions: ["mwf"]
    },
    "application/vnd.mfmp": {
      source: "iana",
      extensions: ["mfm"]
    },
    "application/vnd.micro+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.micrografx.flo": {
      source: "iana",
      extensions: ["flo"]
    },
    "application/vnd.micrografx.igx": {
      source: "iana",
      extensions: ["igx"]
    },
    "application/vnd.microsoft.portable-executable": {
      source: "iana"
    },
    "application/vnd.microsoft.windows.thumbnail-cache": {
      source: "iana"
    },
    "application/vnd.miele+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.mif": {
      source: "iana",
      extensions: ["mif"]
    },
    "application/vnd.minisoft-hp3000-save": {
      source: "iana"
    },
    "application/vnd.mitsubishi.misty-guard.trustweb": {
      source: "iana"
    },
    "application/vnd.mobius.daf": {
      source: "iana",
      extensions: ["daf"]
    },
    "application/vnd.mobius.dis": {
      source: "iana",
      extensions: ["dis"]
    },
    "application/vnd.mobius.mbk": {
      source: "iana",
      extensions: ["mbk"]
    },
    "application/vnd.mobius.mqy": {
      source: "iana",
      extensions: ["mqy"]
    },
    "application/vnd.mobius.msl": {
      source: "iana",
      extensions: ["msl"]
    },
    "application/vnd.mobius.plc": {
      source: "iana",
      extensions: ["plc"]
    },
    "application/vnd.mobius.txf": {
      source: "iana",
      extensions: ["txf"]
    },
    "application/vnd.modl": {
      source: "iana"
    },
    "application/vnd.mophun.application": {
      source: "iana",
      extensions: ["mpn"]
    },
    "application/vnd.mophun.certificate": {
      source: "iana",
      extensions: ["mpc"]
    },
    "application/vnd.motorola.flexsuite": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.adsi": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.fis": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.gotap": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.kmr": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.ttc": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.wem": {
      source: "iana"
    },
    "application/vnd.motorola.iprm": {
      source: "iana"
    },
    "application/vnd.mozilla.xul+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xul"]
    },
    "application/vnd.ms-3mfdocument": {
      source: "iana"
    },
    "application/vnd.ms-artgalry": {
      source: "iana",
      extensions: ["cil"]
    },
    "application/vnd.ms-asf": {
      source: "iana"
    },
    "application/vnd.ms-cab-compressed": {
      source: "iana",
      extensions: ["cab"]
    },
    "application/vnd.ms-color.iccprofile": {
      source: "apache"
    },
    "application/vnd.ms-excel": {
      source: "iana",
      compressible: false,
      extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
      source: "iana",
      extensions: ["xlam"]
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
      source: "iana",
      extensions: ["xlsb"]
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
      source: "iana",
      extensions: ["xlsm"]
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
      source: "iana",
      extensions: ["xltm"]
    },
    "application/vnd.ms-fontobject": {
      source: "iana",
      compressible: true,
      extensions: ["eot"]
    },
    "application/vnd.ms-htmlhelp": {
      source: "iana",
      extensions: ["chm"]
    },
    "application/vnd.ms-ims": {
      source: "iana",
      extensions: ["ims"]
    },
    "application/vnd.ms-lrm": {
      source: "iana",
      extensions: ["lrm"]
    },
    "application/vnd.ms-office.activex+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-officetheme": {
      source: "iana",
      extensions: ["thmx"]
    },
    "application/vnd.ms-opentype": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-outlook": {
      compressible: false,
      extensions: ["msg"]
    },
    "application/vnd.ms-package.obfuscated-opentype": {
      source: "apache"
    },
    "application/vnd.ms-pki.seccat": {
      source: "apache",
      extensions: ["cat"]
    },
    "application/vnd.ms-pki.stl": {
      source: "apache",
      extensions: ["stl"]
    },
    "application/vnd.ms-playready.initiator+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-powerpoint": {
      source: "iana",
      compressible: false,
      extensions: ["ppt", "pps", "pot"]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
      source: "iana",
      extensions: ["ppam"]
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      source: "iana",
      extensions: ["pptm"]
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
      source: "iana",
      extensions: ["sldm"]
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
      source: "iana",
      extensions: ["ppsm"]
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
      source: "iana",
      extensions: ["potm"]
    },
    "application/vnd.ms-printdevicecapabilities+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-printing.printticket+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-printschematicket+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-project": {
      source: "iana",
      extensions: ["mpp", "mpt"]
    },
    "application/vnd.ms-tnef": {
      source: "iana"
    },
    "application/vnd.ms-windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.nwprinting.oob": {
      source: "iana"
    },
    "application/vnd.ms-windows.printerpairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.wsd.oob": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-resp": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-resp": {
      source: "iana"
    },
    "application/vnd.ms-word.document.macroenabled.12": {
      source: "iana",
      extensions: ["docm"]
    },
    "application/vnd.ms-word.template.macroenabled.12": {
      source: "iana",
      extensions: ["dotm"]
    },
    "application/vnd.ms-works": {
      source: "iana",
      extensions: ["wps", "wks", "wcm", "wdb"]
    },
    "application/vnd.ms-wpl": {
      source: "iana",
      extensions: ["wpl"]
    },
    "application/vnd.ms-xpsdocument": {
      source: "iana",
      compressible: false,
      extensions: ["xps"]
    },
    "application/vnd.msa-disk-image": {
      source: "iana"
    },
    "application/vnd.mseq": {
      source: "iana",
      extensions: ["mseq"]
    },
    "application/vnd.msgpack": {
      source: "iana"
    },
    "application/vnd.msign": {
      source: "iana"
    },
    "application/vnd.multiad.creator": {
      source: "iana"
    },
    "application/vnd.multiad.creator.cif": {
      source: "iana"
    },
    "application/vnd.music-niff": {
      source: "iana"
    },
    "application/vnd.musician": {
      source: "iana",
      extensions: ["mus"]
    },
    "application/vnd.muvee.style": {
      source: "iana",
      extensions: ["msty"]
    },
    "application/vnd.mynfc": {
      source: "iana",
      extensions: ["taglet"]
    },
    "application/vnd.nacamar.ybrid+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nato.bindingdataobject+cbor": {
      source: "iana"
    },
    "application/vnd.nato.bindingdataobject+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nato.bindingdataobject+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bdo"]
    },
    "application/vnd.nato.openxmlformats-package.iepd+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.ncd.control": {
      source: "iana"
    },
    "application/vnd.ncd.reference": {
      source: "iana"
    },
    "application/vnd.nearst.inv+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nebumind.line": {
      source: "iana"
    },
    "application/vnd.nervana": {
      source: "iana"
    },
    "application/vnd.netfpx": {
      source: "iana"
    },
    "application/vnd.neurolanguage.nlu": {
      source: "iana",
      extensions: ["nlu"]
    },
    "application/vnd.nimn": {
      source: "iana"
    },
    "application/vnd.nintendo.nitro.rom": {
      source: "iana"
    },
    "application/vnd.nintendo.snes.rom": {
      source: "iana"
    },
    "application/vnd.nitf": {
      source: "iana",
      extensions: ["ntf", "nitf"]
    },
    "application/vnd.noblenet-directory": {
      source: "iana",
      extensions: ["nnd"]
    },
    "application/vnd.noblenet-sealer": {
      source: "iana",
      extensions: ["nns"]
    },
    "application/vnd.noblenet-web": {
      source: "iana",
      extensions: ["nnw"]
    },
    "application/vnd.nokia.catalogs": {
      source: "iana"
    },
    "application/vnd.nokia.conml+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.conml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.iptv.config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.isds-radio-presets": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.landmarkcollection+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.n-gage.ac+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ac"]
    },
    "application/vnd.nokia.n-gage.data": {
      source: "iana",
      extensions: ["ngdat"]
    },
    "application/vnd.nokia.n-gage.symbian.install": {
      source: "apache",
      extensions: ["n-gage"]
    },
    "application/vnd.nokia.ncd": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.radio-preset": {
      source: "iana",
      extensions: ["rpst"]
    },
    "application/vnd.nokia.radio-presets": {
      source: "iana",
      extensions: ["rpss"]
    },
    "application/vnd.novadigm.edm": {
      source: "iana",
      extensions: ["edm"]
    },
    "application/vnd.novadigm.edx": {
      source: "iana",
      extensions: ["edx"]
    },
    "application/vnd.novadigm.ext": {
      source: "iana",
      extensions: ["ext"]
    },
    "application/vnd.ntt-local.content-share": {
      source: "iana"
    },
    "application/vnd.ntt-local.file-transfer": {
      source: "iana"
    },
    "application/vnd.ntt-local.ogw_remote-access": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_remote": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_tcp_stream": {
      source: "iana"
    },
    "application/vnd.oai.workflows": {
      source: "iana"
    },
    "application/vnd.oai.workflows+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oai.workflows+yaml": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.base": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.chart": {
      source: "iana",
      extensions: ["odc"]
    },
    "application/vnd.oasis.opendocument.chart-template": {
      source: "iana",
      extensions: ["otc"]
    },
    "application/vnd.oasis.opendocument.database": {
      source: "apache",
      extensions: ["odb"]
    },
    "application/vnd.oasis.opendocument.formula": {
      source: "iana",
      extensions: ["odf"]
    },
    "application/vnd.oasis.opendocument.formula-template": {
      source: "iana",
      extensions: ["odft"]
    },
    "application/vnd.oasis.opendocument.graphics": {
      source: "iana",
      compressible: false,
      extensions: ["odg"]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
      source: "iana",
      extensions: ["otg"]
    },
    "application/vnd.oasis.opendocument.image": {
      source: "iana",
      extensions: ["odi"]
    },
    "application/vnd.oasis.opendocument.image-template": {
      source: "iana",
      extensions: ["oti"]
    },
    "application/vnd.oasis.opendocument.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["odp"]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
      source: "iana",
      extensions: ["otp"]
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      source: "iana",
      compressible: false,
      extensions: ["ods"]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
      source: "iana",
      extensions: ["ots"]
    },
    "application/vnd.oasis.opendocument.text": {
      source: "iana",
      compressible: false,
      extensions: ["odt"]
    },
    "application/vnd.oasis.opendocument.text-master": {
      source: "iana",
      extensions: ["odm"]
    },
    "application/vnd.oasis.opendocument.text-master-template": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.text-template": {
      source: "iana",
      extensions: ["ott"]
    },
    "application/vnd.oasis.opendocument.text-web": {
      source: "iana",
      extensions: ["oth"]
    },
    "application/vnd.obn": {
      source: "iana"
    },
    "application/vnd.ocf+cbor": {
      source: "iana"
    },
    "application/vnd.oci.image.manifest.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oftn.l10n+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessdownload+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessstreaming+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.cspg-hexbinary": {
      source: "iana"
    },
    "application/vnd.oipf.dae.svg+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.dae.xhtml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.mippvcontrolmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.pae.gem": {
      source: "iana"
    },
    "application/vnd.oipf.spdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.spdlist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.ueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.userprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.olpc-sugar": {
      source: "iana",
      extensions: ["xo"]
    },
    "application/vnd.oma-scws-config": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-request": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-response": {
      source: "iana"
    },
    "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.drm-trigger+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.oma.bcast.imd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.ltkm": {
      source: "iana"
    },
    "application/vnd.oma.bcast.notification+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.provisioningtrigger": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgboot": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgdd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sgdu": {
      source: "iana"
    },
    "application/vnd.oma.bcast.simple-symbol-container": {
      source: "iana"
    },
    "application/vnd.oma.bcast.smartcard-trigger+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.oma.bcast.sprov+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.stkm": {
      source: "iana"
    },
    "application/vnd.oma.cab-address-book+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-feature-handler+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-pcc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-subs-invite+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-user-prefs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.dcd": {
      source: "iana"
    },
    "application/vnd.oma.dcdc": {
      source: "iana"
    },
    "application/vnd.oma.dd2+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dd2"]
    },
    "application/vnd.oma.drm.risd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.group-usage-list+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+cbor": {
      source: "iana"
    },
    "application/vnd.oma.lwm2m+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+tlv": {
      source: "iana"
    },
    "application/vnd.oma.pal+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.detailed-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.final-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.groups+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.invocation-descriptor+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.optimized-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.push": {
      source: "iana"
    },
    "application/vnd.oma.scidm.messages+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.xcap-directory+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.omads-email+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-file+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-folder+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omaloc-supl-init": {
      source: "iana"
    },
    "application/vnd.onepager": {
      source: "iana"
    },
    "application/vnd.onepagertamp": {
      source: "iana"
    },
    "application/vnd.onepagertamx": {
      source: "iana"
    },
    "application/vnd.onepagertat": {
      source: "iana"
    },
    "application/vnd.onepagertatp": {
      source: "iana"
    },
    "application/vnd.onepagertatx": {
      source: "iana"
    },
    "application/vnd.onvif.metadata": {
      source: "iana"
    },
    "application/vnd.openblox.game+xml": {
      source: "iana",
      compressible: true,
      extensions: ["obgx"]
    },
    "application/vnd.openblox.game-binary": {
      source: "iana"
    },
    "application/vnd.openeye.oeb": {
      source: "iana"
    },
    "application/vnd.openofficeorg.extension": {
      source: "apache",
      extensions: ["oxt"]
    },
    "application/vnd.openstreetmap.data+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osm"]
    },
    "application/vnd.opentimestamps.ots": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawing+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["pptx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      source: "iana",
      extensions: ["sldx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      source: "iana",
      extensions: ["ppsx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
      source: "iana",
      extensions: ["potx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      source: "iana",
      compressible: false,
      extensions: ["xlsx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
      source: "iana",
      extensions: ["xltx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.theme+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.vmldrawing": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      source: "iana",
      compressible: false,
      extensions: ["docx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
      source: "iana",
      extensions: ["dotx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.core-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.relationships+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oracle.resource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.orange.indata": {
      source: "iana"
    },
    "application/vnd.osa.netdeploy": {
      source: "iana"
    },
    "application/vnd.osgeo.mapguide.package": {
      source: "iana",
      extensions: ["mgp"]
    },
    "application/vnd.osgi.bundle": {
      source: "iana"
    },
    "application/vnd.osgi.dp": {
      source: "iana",
      extensions: ["dp"]
    },
    "application/vnd.osgi.subsystem": {
      source: "iana",
      extensions: ["esa"]
    },
    "application/vnd.otps.ct-kip+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oxli.countgraph": {
      source: "iana"
    },
    "application/vnd.pagerduty+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.palm": {
      source: "iana",
      extensions: ["pdb", "pqa", "oprc"]
    },
    "application/vnd.panoply": {
      source: "iana"
    },
    "application/vnd.paos.xml": {
      source: "iana"
    },
    "application/vnd.patentdive": {
      source: "iana"
    },
    "application/vnd.patientecommsdoc": {
      source: "iana"
    },
    "application/vnd.pawaafile": {
      source: "iana",
      extensions: ["paw"]
    },
    "application/vnd.pcos": {
      source: "iana"
    },
    "application/vnd.pg.format": {
      source: "iana",
      extensions: ["str"]
    },
    "application/vnd.pg.osasli": {
      source: "iana",
      extensions: ["ei6"]
    },
    "application/vnd.piaccess.application-licence": {
      source: "iana"
    },
    "application/vnd.picsel": {
      source: "iana",
      extensions: ["efif"]
    },
    "application/vnd.pmi.widget": {
      source: "iana",
      extensions: ["wg"]
    },
    "application/vnd.poc.group-advertisement+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.pocketlearn": {
      source: "iana",
      extensions: ["plf"]
    },
    "application/vnd.powerbuilder6": {
      source: "iana",
      extensions: ["pbd"]
    },
    "application/vnd.powerbuilder6-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder7": {
      source: "iana"
    },
    "application/vnd.powerbuilder7-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder75": {
      source: "iana"
    },
    "application/vnd.powerbuilder75-s": {
      source: "iana"
    },
    "application/vnd.preminet": {
      source: "iana"
    },
    "application/vnd.previewsystems.box": {
      source: "iana",
      extensions: ["box"]
    },
    "application/vnd.proteus.magazine": {
      source: "iana",
      extensions: ["mgz"]
    },
    "application/vnd.psfs": {
      source: "iana"
    },
    "application/vnd.pt.mundusmundi": {
      source: "iana"
    },
    "application/vnd.publishare-delta-tree": {
      source: "iana",
      extensions: ["qps"]
    },
    "application/vnd.pvi.ptid1": {
      source: "iana",
      extensions: ["ptid"]
    },
    "application/vnd.pwg-multiplexed": {
      source: "iana"
    },
    "application/vnd.pwg-xhtml-print+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtm"]
    },
    "application/vnd.qualcomm.brew-app-res": {
      source: "iana"
    },
    "application/vnd.quarantainenet": {
      source: "iana"
    },
    "application/vnd.quark.quarkxpress": {
      source: "iana",
      extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
    },
    "application/vnd.quobject-quoxdocument": {
      source: "iana"
    },
    "application/vnd.radisys.moml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-stream+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-base+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-detect+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-group+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-speech+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-transform+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rainstor.data": {
      source: "iana"
    },
    "application/vnd.rapid": {
      source: "iana"
    },
    "application/vnd.rar": {
      source: "iana",
      extensions: ["rar"]
    },
    "application/vnd.realvnc.bed": {
      source: "iana",
      extensions: ["bed"]
    },
    "application/vnd.recordare.musicxml": {
      source: "iana",
      extensions: ["mxl"]
    },
    "application/vnd.recordare.musicxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musicxml"]
    },
    "application/vnd.relpipe": {
      source: "iana"
    },
    "application/vnd.renlearn.rlprint": {
      source: "iana"
    },
    "application/vnd.resilient.logic": {
      source: "iana"
    },
    "application/vnd.restful+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rig.cryptonote": {
      source: "iana",
      extensions: ["cryptonote"]
    },
    "application/vnd.rim.cod": {
      source: "apache",
      extensions: ["cod"]
    },
    "application/vnd.rn-realmedia": {
      source: "apache",
      extensions: ["rm"]
    },
    "application/vnd.rn-realmedia-vbr": {
      source: "apache",
      extensions: ["rmvb"]
    },
    "application/vnd.route66.link66+xml": {
      source: "iana",
      compressible: true,
      extensions: ["link66"]
    },
    "application/vnd.rs-274x": {
      source: "iana"
    },
    "application/vnd.ruckus.download": {
      source: "iana"
    },
    "application/vnd.s3sms": {
      source: "iana"
    },
    "application/vnd.sailingtracker.track": {
      source: "iana",
      extensions: ["st"]
    },
    "application/vnd.sar": {
      source: "iana"
    },
    "application/vnd.sbm.cid": {
      source: "iana"
    },
    "application/vnd.sbm.mid2": {
      source: "iana"
    },
    "application/vnd.scribus": {
      source: "iana"
    },
    "application/vnd.sealed.3df": {
      source: "iana"
    },
    "application/vnd.sealed.csf": {
      source: "iana"
    },
    "application/vnd.sealed.doc": {
      source: "iana"
    },
    "application/vnd.sealed.eml": {
      source: "iana"
    },
    "application/vnd.sealed.mht": {
      source: "iana"
    },
    "application/vnd.sealed.net": {
      source: "iana"
    },
    "application/vnd.sealed.ppt": {
      source: "iana"
    },
    "application/vnd.sealed.tiff": {
      source: "iana"
    },
    "application/vnd.sealed.xls": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.html": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.pdf": {
      source: "iana"
    },
    "application/vnd.seemail": {
      source: "iana",
      extensions: ["see"]
    },
    "application/vnd.seis+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.sema": {
      source: "iana",
      extensions: ["sema"]
    },
    "application/vnd.semd": {
      source: "iana",
      extensions: ["semd"]
    },
    "application/vnd.semf": {
      source: "iana",
      extensions: ["semf"]
    },
    "application/vnd.shade-save-file": {
      source: "iana"
    },
    "application/vnd.shana.informed.formdata": {
      source: "iana",
      extensions: ["ifm"]
    },
    "application/vnd.shana.informed.formtemplate": {
      source: "iana",
      extensions: ["itp"]
    },
    "application/vnd.shana.informed.interchange": {
      source: "iana",
      extensions: ["iif"]
    },
    "application/vnd.shana.informed.package": {
      source: "iana",
      extensions: ["ipk"]
    },
    "application/vnd.shootproof+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shopkick+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shp": {
      source: "iana"
    },
    "application/vnd.shx": {
      source: "iana"
    },
    "application/vnd.sigrok.session": {
      source: "iana"
    },
    "application/vnd.simtech-mindmapper": {
      source: "iana",
      extensions: ["twd", "twds"]
    },
    "application/vnd.siren+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.smaf": {
      source: "iana",
      extensions: ["mmf"]
    },
    "application/vnd.smart.notebook": {
      source: "iana"
    },
    "application/vnd.smart.teacher": {
      source: "iana",
      extensions: ["teacher"]
    },
    "application/vnd.smintio.portals.archive": {
      source: "iana"
    },
    "application/vnd.snesdev-page-table": {
      source: "iana"
    },
    "application/vnd.software602.filler.form+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fo"]
    },
    "application/vnd.software602.filler.form-xml-zip": {
      source: "iana"
    },
    "application/vnd.solent.sdkm+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sdkm", "sdkd"]
    },
    "application/vnd.spotfire.dxp": {
      source: "iana",
      extensions: ["dxp"]
    },
    "application/vnd.spotfire.sfs": {
      source: "iana",
      extensions: ["sfs"]
    },
    "application/vnd.sqlite3": {
      source: "iana"
    },
    "application/vnd.sss-cod": {
      source: "iana"
    },
    "application/vnd.sss-dtf": {
      source: "iana"
    },
    "application/vnd.sss-ntf": {
      source: "iana"
    },
    "application/vnd.stardivision.calc": {
      source: "apache",
      extensions: ["sdc"]
    },
    "application/vnd.stardivision.draw": {
      source: "apache",
      extensions: ["sda"]
    },
    "application/vnd.stardivision.impress": {
      source: "apache",
      extensions: ["sdd"]
    },
    "application/vnd.stardivision.math": {
      source: "apache",
      extensions: ["smf"]
    },
    "application/vnd.stardivision.writer": {
      source: "apache",
      extensions: ["sdw", "vor"]
    },
    "application/vnd.stardivision.writer-global": {
      source: "apache",
      extensions: ["sgl"]
    },
    "application/vnd.stepmania.package": {
      source: "iana",
      extensions: ["smzip"]
    },
    "application/vnd.stepmania.stepchart": {
      source: "iana",
      extensions: ["sm"]
    },
    "application/vnd.street-stream": {
      source: "iana"
    },
    "application/vnd.sun.wadl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wadl"]
    },
    "application/vnd.sun.xml.calc": {
      source: "apache",
      extensions: ["sxc"]
    },
    "application/vnd.sun.xml.calc.template": {
      source: "apache",
      extensions: ["stc"]
    },
    "application/vnd.sun.xml.draw": {
      source: "apache",
      extensions: ["sxd"]
    },
    "application/vnd.sun.xml.draw.template": {
      source: "apache",
      extensions: ["std"]
    },
    "application/vnd.sun.xml.impress": {
      source: "apache",
      extensions: ["sxi"]
    },
    "application/vnd.sun.xml.impress.template": {
      source: "apache",
      extensions: ["sti"]
    },
    "application/vnd.sun.xml.math": {
      source: "apache",
      extensions: ["sxm"]
    },
    "application/vnd.sun.xml.writer": {
      source: "apache",
      extensions: ["sxw"]
    },
    "application/vnd.sun.xml.writer.global": {
      source: "apache",
      extensions: ["sxg"]
    },
    "application/vnd.sun.xml.writer.template": {
      source: "apache",
      extensions: ["stw"]
    },
    "application/vnd.sus-calendar": {
      source: "iana",
      extensions: ["sus", "susp"]
    },
    "application/vnd.svd": {
      source: "iana",
      extensions: ["svd"]
    },
    "application/vnd.swiftview-ics": {
      source: "iana"
    },
    "application/vnd.sybyl.mol2": {
      source: "iana"
    },
    "application/vnd.sycle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.syft+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.symbian.install": {
      source: "apache",
      extensions: ["sis", "sisx"]
    },
    "application/vnd.syncml+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xsm"]
    },
    "application/vnd.syncml.dm+wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["bdm"]
    },
    "application/vnd.syncml.dm+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xdm"]
    },
    "application/vnd.syncml.dm.notification": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["ddf"]
    },
    "application/vnd.syncml.dmtnds+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmtnds+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.syncml.ds.notification": {
      source: "iana"
    },
    "application/vnd.tableschema+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tao.intent-module-archive": {
      source: "iana",
      extensions: ["tao"]
    },
    "application/vnd.tcpdump.pcap": {
      source: "iana",
      extensions: ["pcap", "cap", "dmp"]
    },
    "application/vnd.think-cell.ppttc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tmd.mediaflex.api+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tml": {
      source: "iana"
    },
    "application/vnd.tmobile-livetv": {
      source: "iana",
      extensions: ["tmo"]
    },
    "application/vnd.tri.onesource": {
      source: "iana"
    },
    "application/vnd.trid.tpt": {
      source: "iana",
      extensions: ["tpt"]
    },
    "application/vnd.triscape.mxs": {
      source: "iana",
      extensions: ["mxs"]
    },
    "application/vnd.trueapp": {
      source: "iana",
      extensions: ["tra"]
    },
    "application/vnd.truedoc": {
      source: "iana"
    },
    "application/vnd.ubisoft.webplayer": {
      source: "iana"
    },
    "application/vnd.ufdl": {
      source: "iana",
      extensions: ["ufd", "ufdl"]
    },
    "application/vnd.uiq.theme": {
      source: "iana",
      extensions: ["utz"]
    },
    "application/vnd.umajin": {
      source: "iana",
      extensions: ["umj"]
    },
    "application/vnd.unity": {
      source: "iana",
      extensions: ["unityweb"]
    },
    "application/vnd.uoml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uoml", "uo"]
    },
    "application/vnd.uplanet.alert": {
      source: "iana"
    },
    "application/vnd.uplanet.alert-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.channel": {
      source: "iana"
    },
    "application/vnd.uplanet.channel-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.list": {
      source: "iana"
    },
    "application/vnd.uplanet.list-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.signal": {
      source: "iana"
    },
    "application/vnd.uri-map": {
      source: "iana"
    },
    "application/vnd.valve.source.material": {
      source: "iana"
    },
    "application/vnd.vcx": {
      source: "iana",
      extensions: ["vcx"]
    },
    "application/vnd.vd-study": {
      source: "iana"
    },
    "application/vnd.vectorworks": {
      source: "iana"
    },
    "application/vnd.vel+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.verimatrix.vcas": {
      source: "iana"
    },
    "application/vnd.veritone.aion+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.veryant.thin": {
      source: "iana"
    },
    "application/vnd.ves.encrypted": {
      source: "iana"
    },
    "application/vnd.vidsoft.vidconference": {
      source: "iana"
    },
    "application/vnd.visio": {
      source: "iana",
      extensions: ["vsd", "vst", "vss", "vsw"]
    },
    "application/vnd.visionary": {
      source: "iana",
      extensions: ["vis"]
    },
    "application/vnd.vividence.scriptfile": {
      source: "iana"
    },
    "application/vnd.vsf": {
      source: "iana",
      extensions: ["vsf"]
    },
    "application/vnd.wap.sic": {
      source: "iana"
    },
    "application/vnd.wap.slc": {
      source: "iana"
    },
    "application/vnd.wap.wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["wbxml"]
    },
    "application/vnd.wap.wmlc": {
      source: "iana",
      extensions: ["wmlc"]
    },
    "application/vnd.wap.wmlscriptc": {
      source: "iana",
      extensions: ["wmlsc"]
    },
    "application/vnd.wasmflow.wafl": {
      source: "iana"
    },
    "application/vnd.webturbo": {
      source: "iana",
      extensions: ["wtb"]
    },
    "application/vnd.wfa.dpp": {
      source: "iana"
    },
    "application/vnd.wfa.p2p": {
      source: "iana"
    },
    "application/vnd.wfa.wsc": {
      source: "iana"
    },
    "application/vnd.windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.wmc": {
      source: "iana"
    },
    "application/vnd.wmf.bootstrap": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica.package": {
      source: "iana"
    },
    "application/vnd.wolfram.player": {
      source: "iana",
      extensions: ["nbp"]
    },
    "application/vnd.wordlift": {
      source: "iana"
    },
    "application/vnd.wordperfect": {
      source: "iana",
      extensions: ["wpd"]
    },
    "application/vnd.wqd": {
      source: "iana",
      extensions: ["wqd"]
    },
    "application/vnd.wrq-hp3000-labelled": {
      source: "iana"
    },
    "application/vnd.wt.stf": {
      source: "iana",
      extensions: ["stf"]
    },
    "application/vnd.wv.csp+wbxml": {
      source: "iana"
    },
    "application/vnd.wv.csp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.wv.ssp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xacml+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xara": {
      source: "iana",
      extensions: ["xar"]
    },
    "application/vnd.xecrets-encrypted": {
      source: "iana"
    },
    "application/vnd.xfdl": {
      source: "iana",
      extensions: ["xfdl"]
    },
    "application/vnd.xfdl.webform": {
      source: "iana"
    },
    "application/vnd.xmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xmpie.cpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.dpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.plan": {
      source: "iana"
    },
    "application/vnd.xmpie.ppkg": {
      source: "iana"
    },
    "application/vnd.xmpie.xlim": {
      source: "iana"
    },
    "application/vnd.yamaha.hv-dic": {
      source: "iana",
      extensions: ["hvd"]
    },
    "application/vnd.yamaha.hv-script": {
      source: "iana",
      extensions: ["hvs"]
    },
    "application/vnd.yamaha.hv-voice": {
      source: "iana",
      extensions: ["hvp"]
    },
    "application/vnd.yamaha.openscoreformat": {
      source: "iana",
      extensions: ["osf"]
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osfpvg"]
    },
    "application/vnd.yamaha.remote-setup": {
      source: "iana"
    },
    "application/vnd.yamaha.smaf-audio": {
      source: "iana",
      extensions: ["saf"]
    },
    "application/vnd.yamaha.smaf-phrase": {
      source: "iana",
      extensions: ["spf"]
    },
    "application/vnd.yamaha.through-ngn": {
      source: "iana"
    },
    "application/vnd.yamaha.tunnel-udpencap": {
      source: "iana"
    },
    "application/vnd.yaoweme": {
      source: "iana"
    },
    "application/vnd.yellowriver-custom-menu": {
      source: "iana",
      extensions: ["cmp"]
    },
    "application/vnd.zul": {
      source: "iana",
      extensions: ["zir", "zirz"]
    },
    "application/vnd.zzazz.deck+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zaz"]
    },
    "application/voicexml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["vxml"]
    },
    "application/voucher-cms+json": {
      source: "iana",
      compressible: true
    },
    "application/vp": {
      source: "iana"
    },
    "application/vq-rtcpxr": {
      source: "iana"
    },
    "application/wasm": {
      source: "iana",
      compressible: true,
      extensions: ["wasm"]
    },
    "application/watcherinfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wif"]
    },
    "application/webpush-options+json": {
      source: "iana",
      compressible: true
    },
    "application/whoispp-query": {
      source: "iana"
    },
    "application/whoispp-response": {
      source: "iana"
    },
    "application/widget": {
      source: "iana",
      extensions: ["wgt"]
    },
    "application/winhlp": {
      source: "apache",
      extensions: ["hlp"]
    },
    "application/wita": {
      source: "iana"
    },
    "application/wordperfect5.1": {
      source: "iana"
    },
    "application/wsdl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wsdl"]
    },
    "application/wspolicy+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wspolicy"]
    },
    "application/x-7z-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["7z"]
    },
    "application/x-abiword": {
      source: "apache",
      extensions: ["abw"]
    },
    "application/x-ace-compressed": {
      source: "apache",
      extensions: ["ace"]
    },
    "application/x-amf": {
      source: "apache"
    },
    "application/x-apple-diskimage": {
      source: "apache",
      extensions: ["dmg"]
    },
    "application/x-arj": {
      compressible: false,
      extensions: ["arj"]
    },
    "application/x-authorware-bin": {
      source: "apache",
      extensions: ["aab", "x32", "u32", "vox"]
    },
    "application/x-authorware-map": {
      source: "apache",
      extensions: ["aam"]
    },
    "application/x-authorware-seg": {
      source: "apache",
      extensions: ["aas"]
    },
    "application/x-bcpio": {
      source: "apache",
      extensions: ["bcpio"]
    },
    "application/x-bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/x-bittorrent": {
      source: "apache",
      extensions: ["torrent"]
    },
    "application/x-blorb": {
      source: "apache",
      extensions: ["blb", "blorb"]
    },
    "application/x-bzip": {
      source: "apache",
      compressible: false,
      extensions: ["bz"]
    },
    "application/x-bzip2": {
      source: "apache",
      compressible: false,
      extensions: ["bz2", "boz"]
    },
    "application/x-cbr": {
      source: "apache",
      extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
    },
    "application/x-cdlink": {
      source: "apache",
      extensions: ["vcd"]
    },
    "application/x-cfs-compressed": {
      source: "apache",
      extensions: ["cfs"]
    },
    "application/x-chat": {
      source: "apache",
      extensions: ["chat"]
    },
    "application/x-chess-pgn": {
      source: "apache",
      extensions: ["pgn"]
    },
    "application/x-chrome-extension": {
      extensions: ["crx"]
    },
    "application/x-cocoa": {
      source: "nginx",
      extensions: ["cco"]
    },
    "application/x-compress": {
      source: "apache"
    },
    "application/x-conference": {
      source: "apache",
      extensions: ["nsc"]
    },
    "application/x-cpio": {
      source: "apache",
      extensions: ["cpio"]
    },
    "application/x-csh": {
      source: "apache",
      extensions: ["csh"]
    },
    "application/x-deb": {
      compressible: false
    },
    "application/x-debian-package": {
      source: "apache",
      extensions: ["deb", "udeb"]
    },
    "application/x-dgc-compressed": {
      source: "apache",
      extensions: ["dgc"]
    },
    "application/x-director": {
      source: "apache",
      extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
    },
    "application/x-doom": {
      source: "apache",
      extensions: ["wad"]
    },
    "application/x-dtbncx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ncx"]
    },
    "application/x-dtbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dtb"]
    },
    "application/x-dtbresource+xml": {
      source: "apache",
      compressible: true,
      extensions: ["res"]
    },
    "application/x-dvi": {
      source: "apache",
      compressible: false,
      extensions: ["dvi"]
    },
    "application/x-envoy": {
      source: "apache",
      extensions: ["evy"]
    },
    "application/x-eva": {
      source: "apache",
      extensions: ["eva"]
    },
    "application/x-font-bdf": {
      source: "apache",
      extensions: ["bdf"]
    },
    "application/x-font-dos": {
      source: "apache"
    },
    "application/x-font-framemaker": {
      source: "apache"
    },
    "application/x-font-ghostscript": {
      source: "apache",
      extensions: ["gsf"]
    },
    "application/x-font-libgrx": {
      source: "apache"
    },
    "application/x-font-linux-psf": {
      source: "apache",
      extensions: ["psf"]
    },
    "application/x-font-pcf": {
      source: "apache",
      extensions: ["pcf"]
    },
    "application/x-font-snf": {
      source: "apache",
      extensions: ["snf"]
    },
    "application/x-font-speedo": {
      source: "apache"
    },
    "application/x-font-sunos-news": {
      source: "apache"
    },
    "application/x-font-type1": {
      source: "apache",
      extensions: ["pfa", "pfb", "pfm", "afm"]
    },
    "application/x-font-vfont": {
      source: "apache"
    },
    "application/x-freearc": {
      source: "apache",
      extensions: ["arc"]
    },
    "application/x-futuresplash": {
      source: "apache",
      extensions: ["spl"]
    },
    "application/x-gca-compressed": {
      source: "apache",
      extensions: ["gca"]
    },
    "application/x-glulx": {
      source: "apache",
      extensions: ["ulx"]
    },
    "application/x-gnumeric": {
      source: "apache",
      extensions: ["gnumeric"]
    },
    "application/x-gramps-xml": {
      source: "apache",
      extensions: ["gramps"]
    },
    "application/x-gtar": {
      source: "apache",
      extensions: ["gtar"]
    },
    "application/x-gzip": {
      source: "apache"
    },
    "application/x-hdf": {
      source: "apache",
      extensions: ["hdf"]
    },
    "application/x-httpd-php": {
      compressible: true,
      extensions: ["php"]
    },
    "application/x-install-instructions": {
      source: "apache",
      extensions: ["install"]
    },
    "application/x-iso9660-image": {
      source: "apache",
      extensions: ["iso"]
    },
    "application/x-iwork-keynote-sffkey": {
      extensions: ["key"]
    },
    "application/x-iwork-numbers-sffnumbers": {
      extensions: ["numbers"]
    },
    "application/x-iwork-pages-sffpages": {
      extensions: ["pages"]
    },
    "application/x-java-archive-diff": {
      source: "nginx",
      extensions: ["jardiff"]
    },
    "application/x-java-jnlp-file": {
      source: "apache",
      compressible: false,
      extensions: ["jnlp"]
    },
    "application/x-javascript": {
      compressible: true
    },
    "application/x-keepass2": {
      extensions: ["kdbx"]
    },
    "application/x-latex": {
      source: "apache",
      compressible: false,
      extensions: ["latex"]
    },
    "application/x-lua-bytecode": {
      extensions: ["luac"]
    },
    "application/x-lzh-compressed": {
      source: "apache",
      extensions: ["lzh", "lha"]
    },
    "application/x-makeself": {
      source: "nginx",
      extensions: ["run"]
    },
    "application/x-mie": {
      source: "apache",
      extensions: ["mie"]
    },
    "application/x-mobipocket-ebook": {
      source: "apache",
      extensions: ["prc", "mobi"]
    },
    "application/x-mpegurl": {
      compressible: false
    },
    "application/x-ms-application": {
      source: "apache",
      extensions: ["application"]
    },
    "application/x-ms-shortcut": {
      source: "apache",
      extensions: ["lnk"]
    },
    "application/x-ms-wmd": {
      source: "apache",
      extensions: ["wmd"]
    },
    "application/x-ms-wmz": {
      source: "apache",
      extensions: ["wmz"]
    },
    "application/x-ms-xbap": {
      source: "apache",
      extensions: ["xbap"]
    },
    "application/x-msaccess": {
      source: "apache",
      extensions: ["mdb"]
    },
    "application/x-msbinder": {
      source: "apache",
      extensions: ["obd"]
    },
    "application/x-mscardfile": {
      source: "apache",
      extensions: ["crd"]
    },
    "application/x-msclip": {
      source: "apache",
      extensions: ["clp"]
    },
    "application/x-msdos-program": {
      extensions: ["exe"]
    },
    "application/x-msdownload": {
      source: "apache",
      extensions: ["exe", "dll", "com", "bat", "msi"]
    },
    "application/x-msmediaview": {
      source: "apache",
      extensions: ["mvb", "m13", "m14"]
    },
    "application/x-msmetafile": {
      source: "apache",
      extensions: ["wmf", "wmz", "emf", "emz"]
    },
    "application/x-msmoney": {
      source: "apache",
      extensions: ["mny"]
    },
    "application/x-mspublisher": {
      source: "apache",
      extensions: ["pub"]
    },
    "application/x-msschedule": {
      source: "apache",
      extensions: ["scd"]
    },
    "application/x-msterminal": {
      source: "apache",
      extensions: ["trm"]
    },
    "application/x-mswrite": {
      source: "apache",
      extensions: ["wri"]
    },
    "application/x-netcdf": {
      source: "apache",
      extensions: ["nc", "cdf"]
    },
    "application/x-ns-proxy-autoconfig": {
      compressible: true,
      extensions: ["pac"]
    },
    "application/x-nzb": {
      source: "apache",
      extensions: ["nzb"]
    },
    "application/x-perl": {
      source: "nginx",
      extensions: ["pl", "pm"]
    },
    "application/x-pilot": {
      source: "nginx",
      extensions: ["prc", "pdb"]
    },
    "application/x-pkcs12": {
      source: "apache",
      compressible: false,
      extensions: ["p12", "pfx"]
    },
    "application/x-pkcs7-certificates": {
      source: "apache",
      extensions: ["p7b", "spc"]
    },
    "application/x-pkcs7-certreqresp": {
      source: "apache",
      extensions: ["p7r"]
    },
    "application/x-pki-message": {
      source: "iana"
    },
    "application/x-rar-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["rar"]
    },
    "application/x-redhat-package-manager": {
      source: "nginx",
      extensions: ["rpm"]
    },
    "application/x-research-info-systems": {
      source: "apache",
      extensions: ["ris"]
    },
    "application/x-sea": {
      source: "nginx",
      extensions: ["sea"]
    },
    "application/x-sh": {
      source: "apache",
      compressible: true,
      extensions: ["sh"]
    },
    "application/x-shar": {
      source: "apache",
      extensions: ["shar"]
    },
    "application/x-shockwave-flash": {
      source: "apache",
      compressible: false,
      extensions: ["swf"]
    },
    "application/x-silverlight-app": {
      source: "apache",
      extensions: ["xap"]
    },
    "application/x-sql": {
      source: "apache",
      extensions: ["sql"]
    },
    "application/x-stuffit": {
      source: "apache",
      compressible: false,
      extensions: ["sit"]
    },
    "application/x-stuffitx": {
      source: "apache",
      extensions: ["sitx"]
    },
    "application/x-subrip": {
      source: "apache",
      extensions: ["srt"]
    },
    "application/x-sv4cpio": {
      source: "apache",
      extensions: ["sv4cpio"]
    },
    "application/x-sv4crc": {
      source: "apache",
      extensions: ["sv4crc"]
    },
    "application/x-t3vm-image": {
      source: "apache",
      extensions: ["t3"]
    },
    "application/x-tads": {
      source: "apache",
      extensions: ["gam"]
    },
    "application/x-tar": {
      source: "apache",
      compressible: true,
      extensions: ["tar"]
    },
    "application/x-tcl": {
      source: "apache",
      extensions: ["tcl", "tk"]
    },
    "application/x-tex": {
      source: "apache",
      extensions: ["tex"]
    },
    "application/x-tex-tfm": {
      source: "apache",
      extensions: ["tfm"]
    },
    "application/x-texinfo": {
      source: "apache",
      extensions: ["texinfo", "texi"]
    },
    "application/x-tgif": {
      source: "apache",
      extensions: ["obj"]
    },
    "application/x-ustar": {
      source: "apache",
      extensions: ["ustar"]
    },
    "application/x-virtualbox-hdd": {
      compressible: true,
      extensions: ["hdd"]
    },
    "application/x-virtualbox-ova": {
      compressible: true,
      extensions: ["ova"]
    },
    "application/x-virtualbox-ovf": {
      compressible: true,
      extensions: ["ovf"]
    },
    "application/x-virtualbox-vbox": {
      compressible: true,
      extensions: ["vbox"]
    },
    "application/x-virtualbox-vbox-extpack": {
      compressible: false,
      extensions: ["vbox-extpack"]
    },
    "application/x-virtualbox-vdi": {
      compressible: true,
      extensions: ["vdi"]
    },
    "application/x-virtualbox-vhd": {
      compressible: true,
      extensions: ["vhd"]
    },
    "application/x-virtualbox-vmdk": {
      compressible: true,
      extensions: ["vmdk"]
    },
    "application/x-wais-source": {
      source: "apache",
      extensions: ["src"]
    },
    "application/x-web-app-manifest+json": {
      compressible: true,
      extensions: ["webapp"]
    },
    "application/x-www-form-urlencoded": {
      source: "iana",
      compressible: true
    },
    "application/x-x509-ca-cert": {
      source: "iana",
      extensions: ["der", "crt", "pem"]
    },
    "application/x-x509-ca-ra-cert": {
      source: "iana"
    },
    "application/x-x509-next-ca-cert": {
      source: "iana"
    },
    "application/x-xfig": {
      source: "apache",
      extensions: ["fig"]
    },
    "application/x-xliff+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/x-xpinstall": {
      source: "apache",
      compressible: false,
      extensions: ["xpi"]
    },
    "application/x-xz": {
      source: "apache",
      extensions: ["xz"]
    },
    "application/x-zmachine": {
      source: "apache",
      extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
    },
    "application/x400-bp": {
      source: "iana"
    },
    "application/xacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/xaml+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xaml"]
    },
    "application/xcap-att+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xav"]
    },
    "application/xcap-caps+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xca"]
    },
    "application/xcap-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdf"]
    },
    "application/xcap-el+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xel"]
    },
    "application/xcap-error+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcap-ns+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xns"]
    },
    "application/xcon-conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcon-conference-info-diff+xml": {
      source: "iana",
      compressible: true
    },
    "application/xenc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xenc"]
    },
    "application/xfdf": {
      source: "iana",
      extensions: ["xfdf"]
    },
    "application/xhtml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtml", "xht"]
    },
    "application/xhtml-voice+xml": {
      source: "apache",
      compressible: true
    },
    "application/xliff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml", "xsl", "xsd", "rng"]
    },
    "application/xml-dtd": {
      source: "iana",
      compressible: true,
      extensions: ["dtd"]
    },
    "application/xml-external-parsed-entity": {
      source: "iana"
    },
    "application/xml-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/xmpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/xop+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xop"]
    },
    "application/xproc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xpl"]
    },
    "application/xslt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsl", "xslt"]
    },
    "application/xspf+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xspf"]
    },
    "application/xv+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mxml", "xhvml", "xvml", "xvm"]
    },
    "application/yaml": {
      source: "iana"
    },
    "application/yang": {
      source: "iana",
      extensions: ["yang"]
    },
    "application/yang-data+cbor": {
      source: "iana"
    },
    "application/yang-data+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-data+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-sid+json": {
      source: "iana",
      compressible: true
    },
    "application/yin+xml": {
      source: "iana",
      compressible: true,
      extensions: ["yin"]
    },
    "application/zip": {
      source: "iana",
      compressible: false,
      extensions: ["zip"]
    },
    "application/zlib": {
      source: "iana"
    },
    "application/zstd": {
      source: "iana"
    },
    "audio/1d-interleaved-parityfec": {
      source: "iana"
    },
    "audio/32kadpcm": {
      source: "iana"
    },
    "audio/3gpp": {
      source: "iana",
      compressible: false,
      extensions: ["3gpp"]
    },
    "audio/3gpp2": {
      source: "iana"
    },
    "audio/aac": {
      source: "iana",
      extensions: ["adts", "aac"]
    },
    "audio/ac3": {
      source: "iana"
    },
    "audio/adpcm": {
      source: "apache",
      extensions: ["adp"]
    },
    "audio/amr": {
      source: "iana",
      extensions: ["amr"]
    },
    "audio/amr-wb": {
      source: "iana"
    },
    "audio/amr-wb+": {
      source: "iana"
    },
    "audio/aptx": {
      source: "iana"
    },
    "audio/asc": {
      source: "iana"
    },
    "audio/atrac-advanced-lossless": {
      source: "iana"
    },
    "audio/atrac-x": {
      source: "iana"
    },
    "audio/atrac3": {
      source: "iana"
    },
    "audio/basic": {
      source: "iana",
      compressible: false,
      extensions: ["au", "snd"]
    },
    "audio/bv16": {
      source: "iana"
    },
    "audio/bv32": {
      source: "iana"
    },
    "audio/clearmode": {
      source: "iana"
    },
    "audio/cn": {
      source: "iana"
    },
    "audio/dat12": {
      source: "iana"
    },
    "audio/dls": {
      source: "iana"
    },
    "audio/dsr-es201108": {
      source: "iana"
    },
    "audio/dsr-es202050": {
      source: "iana"
    },
    "audio/dsr-es202211": {
      source: "iana"
    },
    "audio/dsr-es202212": {
      source: "iana"
    },
    "audio/dv": {
      source: "iana"
    },
    "audio/dvi4": {
      source: "iana"
    },
    "audio/eac3": {
      source: "iana"
    },
    "audio/encaprtp": {
      source: "iana"
    },
    "audio/evrc": {
      source: "iana"
    },
    "audio/evrc-qcp": {
      source: "iana"
    },
    "audio/evrc0": {
      source: "iana"
    },
    "audio/evrc1": {
      source: "iana"
    },
    "audio/evrcb": {
      source: "iana"
    },
    "audio/evrcb0": {
      source: "iana"
    },
    "audio/evrcb1": {
      source: "iana"
    },
    "audio/evrcnw": {
      source: "iana"
    },
    "audio/evrcnw0": {
      source: "iana"
    },
    "audio/evrcnw1": {
      source: "iana"
    },
    "audio/evrcwb": {
      source: "iana"
    },
    "audio/evrcwb0": {
      source: "iana"
    },
    "audio/evrcwb1": {
      source: "iana"
    },
    "audio/evs": {
      source: "iana"
    },
    "audio/flac": {
      source: "iana"
    },
    "audio/flexfec": {
      source: "iana"
    },
    "audio/fwdred": {
      source: "iana"
    },
    "audio/g711-0": {
      source: "iana"
    },
    "audio/g719": {
      source: "iana"
    },
    "audio/g722": {
      source: "iana"
    },
    "audio/g7221": {
      source: "iana"
    },
    "audio/g723": {
      source: "iana"
    },
    "audio/g726-16": {
      source: "iana"
    },
    "audio/g726-24": {
      source: "iana"
    },
    "audio/g726-32": {
      source: "iana"
    },
    "audio/g726-40": {
      source: "iana"
    },
    "audio/g728": {
      source: "iana"
    },
    "audio/g729": {
      source: "iana"
    },
    "audio/g7291": {
      source: "iana"
    },
    "audio/g729d": {
      source: "iana"
    },
    "audio/g729e": {
      source: "iana"
    },
    "audio/gsm": {
      source: "iana"
    },
    "audio/gsm-efr": {
      source: "iana"
    },
    "audio/gsm-hr-08": {
      source: "iana"
    },
    "audio/ilbc": {
      source: "iana"
    },
    "audio/ip-mr_v2.5": {
      source: "iana"
    },
    "audio/isac": {
      source: "apache"
    },
    "audio/l16": {
      source: "iana"
    },
    "audio/l20": {
      source: "iana"
    },
    "audio/l24": {
      source: "iana",
      compressible: false
    },
    "audio/l8": {
      source: "iana"
    },
    "audio/lpc": {
      source: "iana"
    },
    "audio/matroska": {
      source: "iana"
    },
    "audio/melp": {
      source: "iana"
    },
    "audio/melp1200": {
      source: "iana"
    },
    "audio/melp2400": {
      source: "iana"
    },
    "audio/melp600": {
      source: "iana"
    },
    "audio/mhas": {
      source: "iana"
    },
    "audio/midi": {
      source: "apache",
      extensions: ["mid", "midi", "kar", "rmi"]
    },
    "audio/midi-clip": {
      source: "iana"
    },
    "audio/mobile-xmf": {
      source: "iana",
      extensions: ["mxmf"]
    },
    "audio/mp3": {
      compressible: false,
      extensions: ["mp3"]
    },
    "audio/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["m4a", "mp4a"]
    },
    "audio/mp4a-latm": {
      source: "iana"
    },
    "audio/mpa": {
      source: "iana"
    },
    "audio/mpa-robust": {
      source: "iana"
    },
    "audio/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/mpeg4-generic": {
      source: "iana"
    },
    "audio/musepack": {
      source: "apache"
    },
    "audio/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["oga", "ogg", "spx", "opus"]
    },
    "audio/opus": {
      source: "iana"
    },
    "audio/parityfec": {
      source: "iana"
    },
    "audio/pcma": {
      source: "iana"
    },
    "audio/pcma-wb": {
      source: "iana"
    },
    "audio/pcmu": {
      source: "iana"
    },
    "audio/pcmu-wb": {
      source: "iana"
    },
    "audio/prs.sid": {
      source: "iana"
    },
    "audio/qcelp": {
      source: "iana"
    },
    "audio/raptorfec": {
      source: "iana"
    },
    "audio/red": {
      source: "iana"
    },
    "audio/rtp-enc-aescm128": {
      source: "iana"
    },
    "audio/rtp-midi": {
      source: "iana"
    },
    "audio/rtploopback": {
      source: "iana"
    },
    "audio/rtx": {
      source: "iana"
    },
    "audio/s3m": {
      source: "apache",
      extensions: ["s3m"]
    },
    "audio/scip": {
      source: "iana"
    },
    "audio/silk": {
      source: "apache",
      extensions: ["sil"]
    },
    "audio/smv": {
      source: "iana"
    },
    "audio/smv-qcp": {
      source: "iana"
    },
    "audio/smv0": {
      source: "iana"
    },
    "audio/sofa": {
      source: "iana"
    },
    "audio/sp-midi": {
      source: "iana"
    },
    "audio/speex": {
      source: "iana"
    },
    "audio/t140c": {
      source: "iana"
    },
    "audio/t38": {
      source: "iana"
    },
    "audio/telephone-event": {
      source: "iana"
    },
    "audio/tetra_acelp": {
      source: "iana"
    },
    "audio/tetra_acelp_bb": {
      source: "iana"
    },
    "audio/tone": {
      source: "iana"
    },
    "audio/tsvcis": {
      source: "iana"
    },
    "audio/uemclip": {
      source: "iana"
    },
    "audio/ulpfec": {
      source: "iana"
    },
    "audio/usac": {
      source: "iana"
    },
    "audio/vdvi": {
      source: "iana"
    },
    "audio/vmr-wb": {
      source: "iana"
    },
    "audio/vnd.3gpp.iufp": {
      source: "iana"
    },
    "audio/vnd.4sb": {
      source: "iana"
    },
    "audio/vnd.audiokoz": {
      source: "iana"
    },
    "audio/vnd.celp": {
      source: "iana"
    },
    "audio/vnd.cisco.nse": {
      source: "iana"
    },
    "audio/vnd.cmles.radio-events": {
      source: "iana"
    },
    "audio/vnd.cns.anp1": {
      source: "iana"
    },
    "audio/vnd.cns.inf1": {
      source: "iana"
    },
    "audio/vnd.dece.audio": {
      source: "iana",
      extensions: ["uva", "uvva"]
    },
    "audio/vnd.digital-winds": {
      source: "iana",
      extensions: ["eol"]
    },
    "audio/vnd.dlna.adts": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.1": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.2": {
      source: "iana"
    },
    "audio/vnd.dolby.mlp": {
      source: "iana"
    },
    "audio/vnd.dolby.mps": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2x": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2z": {
      source: "iana"
    },
    "audio/vnd.dolby.pulse.1": {
      source: "iana"
    },
    "audio/vnd.dra": {
      source: "iana",
      extensions: ["dra"]
    },
    "audio/vnd.dts": {
      source: "iana",
      extensions: ["dts"]
    },
    "audio/vnd.dts.hd": {
      source: "iana",
      extensions: ["dtshd"]
    },
    "audio/vnd.dts.uhd": {
      source: "iana"
    },
    "audio/vnd.dvb.file": {
      source: "iana"
    },
    "audio/vnd.everad.plj": {
      source: "iana"
    },
    "audio/vnd.hns.audio": {
      source: "iana"
    },
    "audio/vnd.lucent.voice": {
      source: "iana",
      extensions: ["lvp"]
    },
    "audio/vnd.ms-playready.media.pya": {
      source: "iana",
      extensions: ["pya"]
    },
    "audio/vnd.nokia.mobile-xmf": {
      source: "iana"
    },
    "audio/vnd.nortel.vbk": {
      source: "iana"
    },
    "audio/vnd.nuera.ecelp4800": {
      source: "iana",
      extensions: ["ecelp4800"]
    },
    "audio/vnd.nuera.ecelp7470": {
      source: "iana",
      extensions: ["ecelp7470"]
    },
    "audio/vnd.nuera.ecelp9600": {
      source: "iana",
      extensions: ["ecelp9600"]
    },
    "audio/vnd.octel.sbc": {
      source: "iana"
    },
    "audio/vnd.presonus.multitrack": {
      source: "iana"
    },
    "audio/vnd.qcelp": {
      source: "apache"
    },
    "audio/vnd.rhetorex.32kadpcm": {
      source: "iana"
    },
    "audio/vnd.rip": {
      source: "iana",
      extensions: ["rip"]
    },
    "audio/vnd.rn-realaudio": {
      compressible: false
    },
    "audio/vnd.sealedmedia.softseal.mpeg": {
      source: "iana"
    },
    "audio/vnd.vmx.cvsd": {
      source: "iana"
    },
    "audio/vnd.wave": {
      compressible: false
    },
    "audio/vorbis": {
      source: "iana",
      compressible: false
    },
    "audio/vorbis-config": {
      source: "iana"
    },
    "audio/wav": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/wave": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/webm": {
      source: "apache",
      compressible: false,
      extensions: ["weba"]
    },
    "audio/x-aac": {
      source: "apache",
      compressible: false,
      extensions: ["aac"]
    },
    "audio/x-aiff": {
      source: "apache",
      extensions: ["aif", "aiff", "aifc"]
    },
    "audio/x-caf": {
      source: "apache",
      compressible: false,
      extensions: ["caf"]
    },
    "audio/x-flac": {
      source: "apache",
      extensions: ["flac"]
    },
    "audio/x-m4a": {
      source: "nginx",
      extensions: ["m4a"]
    },
    "audio/x-matroska": {
      source: "apache",
      extensions: ["mka"]
    },
    "audio/x-mpegurl": {
      source: "apache",
      extensions: ["m3u"]
    },
    "audio/x-ms-wax": {
      source: "apache",
      extensions: ["wax"]
    },
    "audio/x-ms-wma": {
      source: "apache",
      extensions: ["wma"]
    },
    "audio/x-pn-realaudio": {
      source: "apache",
      extensions: ["ram", "ra"]
    },
    "audio/x-pn-realaudio-plugin": {
      source: "apache",
      extensions: ["rmp"]
    },
    "audio/x-realaudio": {
      source: "nginx",
      extensions: ["ra"]
    },
    "audio/x-tta": {
      source: "apache"
    },
    "audio/x-wav": {
      source: "apache",
      extensions: ["wav"]
    },
    "audio/xm": {
      source: "apache",
      extensions: ["xm"]
    },
    "chemical/x-cdx": {
      source: "apache",
      extensions: ["cdx"]
    },
    "chemical/x-cif": {
      source: "apache",
      extensions: ["cif"]
    },
    "chemical/x-cmdf": {
      source: "apache",
      extensions: ["cmdf"]
    },
    "chemical/x-cml": {
      source: "apache",
      extensions: ["cml"]
    },
    "chemical/x-csml": {
      source: "apache",
      extensions: ["csml"]
    },
    "chemical/x-pdb": {
      source: "apache"
    },
    "chemical/x-xyz": {
      source: "apache",
      extensions: ["xyz"]
    },
    "font/collection": {
      source: "iana",
      extensions: ["ttc"]
    },
    "font/otf": {
      source: "iana",
      compressible: true,
      extensions: ["otf"]
    },
    "font/sfnt": {
      source: "iana"
    },
    "font/ttf": {
      source: "iana",
      compressible: true,
      extensions: ["ttf"]
    },
    "font/woff": {
      source: "iana",
      extensions: ["woff"]
    },
    "font/woff2": {
      source: "iana",
      extensions: ["woff2"]
    },
    "image/aces": {
      source: "iana",
      extensions: ["exr"]
    },
    "image/apng": {
      source: "iana",
      compressible: false,
      extensions: ["apng"]
    },
    "image/avci": {
      source: "iana",
      extensions: ["avci"]
    },
    "image/avcs": {
      source: "iana",
      extensions: ["avcs"]
    },
    "image/avif": {
      source: "iana",
      compressible: false,
      extensions: ["avif"]
    },
    "image/bmp": {
      source: "iana",
      compressible: true,
      extensions: ["bmp", "dib"]
    },
    "image/cgm": {
      source: "iana",
      extensions: ["cgm"]
    },
    "image/dicom-rle": {
      source: "iana",
      extensions: ["drle"]
    },
    "image/dpx": {
      source: "iana",
      extensions: ["dpx"]
    },
    "image/emf": {
      source: "iana",
      extensions: ["emf"]
    },
    "image/fits": {
      source: "iana",
      extensions: ["fits"]
    },
    "image/g3fax": {
      source: "iana",
      extensions: ["g3"]
    },
    "image/gif": {
      source: "iana",
      compressible: false,
      extensions: ["gif"]
    },
    "image/heic": {
      source: "iana",
      extensions: ["heic"]
    },
    "image/heic-sequence": {
      source: "iana",
      extensions: ["heics"]
    },
    "image/heif": {
      source: "iana",
      extensions: ["heif"]
    },
    "image/heif-sequence": {
      source: "iana",
      extensions: ["heifs"]
    },
    "image/hej2k": {
      source: "iana",
      extensions: ["hej2"]
    },
    "image/hsj2": {
      source: "iana",
      extensions: ["hsj2"]
    },
    "image/ief": {
      source: "iana",
      extensions: ["ief"]
    },
    "image/j2c": {
      source: "iana"
    },
    "image/jls": {
      source: "iana",
      extensions: ["jls"]
    },
    "image/jp2": {
      source: "iana",
      compressible: false,
      extensions: ["jp2", "jpg2"]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: ["jpeg", "jpg", "jpe"]
    },
    "image/jph": {
      source: "iana",
      extensions: ["jph"]
    },
    "image/jphc": {
      source: "iana",
      extensions: ["jhc"]
    },
    "image/jpm": {
      source: "iana",
      compressible: false,
      extensions: ["jpm", "jpgm"]
    },
    "image/jpx": {
      source: "iana",
      compressible: false,
      extensions: ["jpx", "jpf"]
    },
    "image/jxl": {
      source: "iana",
      extensions: ["jxl"]
    },
    "image/jxr": {
      source: "iana",
      extensions: ["jxr"]
    },
    "image/jxra": {
      source: "iana",
      extensions: ["jxra"]
    },
    "image/jxrs": {
      source: "iana",
      extensions: ["jxrs"]
    },
    "image/jxs": {
      source: "iana",
      extensions: ["jxs"]
    },
    "image/jxsc": {
      source: "iana",
      extensions: ["jxsc"]
    },
    "image/jxsi": {
      source: "iana",
      extensions: ["jxsi"]
    },
    "image/jxss": {
      source: "iana",
      extensions: ["jxss"]
    },
    "image/ktx": {
      source: "iana",
      extensions: ["ktx"]
    },
    "image/ktx2": {
      source: "iana",
      extensions: ["ktx2"]
    },
    "image/naplps": {
      source: "iana"
    },
    "image/pjpeg": {
      compressible: false
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: ["png"]
    },
    "image/prs.btif": {
      source: "iana",
      extensions: ["btif", "btf"]
    },
    "image/prs.pti": {
      source: "iana",
      extensions: ["pti"]
    },
    "image/pwg-raster": {
      source: "iana"
    },
    "image/sgi": {
      source: "apache",
      extensions: ["sgi"]
    },
    "image/svg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["svg", "svgz"]
    },
    "image/t38": {
      source: "iana",
      extensions: ["t38"]
    },
    "image/tiff": {
      source: "iana",
      compressible: false,
      extensions: ["tif", "tiff"]
    },
    "image/tiff-fx": {
      source: "iana",
      extensions: ["tfx"]
    },
    "image/vnd.adobe.photoshop": {
      source: "iana",
      compressible: true,
      extensions: ["psd"]
    },
    "image/vnd.airzip.accelerator.azv": {
      source: "iana",
      extensions: ["azv"]
    },
    "image/vnd.cns.inf2": {
      source: "iana"
    },
    "image/vnd.dece.graphic": {
      source: "iana",
      extensions: ["uvi", "uvvi", "uvg", "uvvg"]
    },
    "image/vnd.djvu": {
      source: "iana",
      extensions: ["djvu", "djv"]
    },
    "image/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "image/vnd.dwg": {
      source: "iana",
      extensions: ["dwg"]
    },
    "image/vnd.dxf": {
      source: "iana",
      extensions: ["dxf"]
    },
    "image/vnd.fastbidsheet": {
      source: "iana",
      extensions: ["fbs"]
    },
    "image/vnd.fpx": {
      source: "iana",
      extensions: ["fpx"]
    },
    "image/vnd.fst": {
      source: "iana",
      extensions: ["fst"]
    },
    "image/vnd.fujixerox.edmics-mmr": {
      source: "iana",
      extensions: ["mmr"]
    },
    "image/vnd.fujixerox.edmics-rlc": {
      source: "iana",
      extensions: ["rlc"]
    },
    "image/vnd.globalgraphics.pgb": {
      source: "iana"
    },
    "image/vnd.microsoft.icon": {
      source: "iana",
      compressible: true,
      extensions: ["ico"]
    },
    "image/vnd.mix": {
      source: "iana"
    },
    "image/vnd.mozilla.apng": {
      source: "iana"
    },
    "image/vnd.ms-dds": {
      compressible: true,
      extensions: ["dds"]
    },
    "image/vnd.ms-modi": {
      source: "iana",
      extensions: ["mdi"]
    },
    "image/vnd.ms-photo": {
      source: "apache",
      extensions: ["wdp"]
    },
    "image/vnd.net-fpx": {
      source: "iana",
      extensions: ["npx"]
    },
    "image/vnd.pco.b16": {
      source: "iana",
      extensions: ["b16"]
    },
    "image/vnd.radiance": {
      source: "iana"
    },
    "image/vnd.sealed.png": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.gif": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.jpg": {
      source: "iana"
    },
    "image/vnd.svf": {
      source: "iana"
    },
    "image/vnd.tencent.tap": {
      source: "iana",
      extensions: ["tap"]
    },
    "image/vnd.valve.source.texture": {
      source: "iana",
      extensions: ["vtf"]
    },
    "image/vnd.wap.wbmp": {
      source: "iana",
      extensions: ["wbmp"]
    },
    "image/vnd.xiff": {
      source: "iana",
      extensions: ["xif"]
    },
    "image/vnd.zbrush.pcx": {
      source: "iana",
      extensions: ["pcx"]
    },
    "image/webp": {
      source: "iana",
      extensions: ["webp"]
    },
    "image/wmf": {
      source: "iana",
      extensions: ["wmf"]
    },
    "image/x-3ds": {
      source: "apache",
      extensions: ["3ds"]
    },
    "image/x-cmu-raster": {
      source: "apache",
      extensions: ["ras"]
    },
    "image/x-cmx": {
      source: "apache",
      extensions: ["cmx"]
    },
    "image/x-freehand": {
      source: "apache",
      extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
    },
    "image/x-icon": {
      source: "apache",
      compressible: true,
      extensions: ["ico"]
    },
    "image/x-jng": {
      source: "nginx",
      extensions: ["jng"]
    },
    "image/x-mrsid-image": {
      source: "apache",
      extensions: ["sid"]
    },
    "image/x-ms-bmp": {
      source: "nginx",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/x-pcx": {
      source: "apache",
      extensions: ["pcx"]
    },
    "image/x-pict": {
      source: "apache",
      extensions: ["pic", "pct"]
    },
    "image/x-portable-anymap": {
      source: "apache",
      extensions: ["pnm"]
    },
    "image/x-portable-bitmap": {
      source: "apache",
      extensions: ["pbm"]
    },
    "image/x-portable-graymap": {
      source: "apache",
      extensions: ["pgm"]
    },
    "image/x-portable-pixmap": {
      source: "apache",
      extensions: ["ppm"]
    },
    "image/x-rgb": {
      source: "apache",
      extensions: ["rgb"]
    },
    "image/x-tga": {
      source: "apache",
      extensions: ["tga"]
    },
    "image/x-xbitmap": {
      source: "apache",
      extensions: ["xbm"]
    },
    "image/x-xcf": {
      compressible: false
    },
    "image/x-xpixmap": {
      source: "apache",
      extensions: ["xpm"]
    },
    "image/x-xwindowdump": {
      source: "apache",
      extensions: ["xwd"]
    },
    "message/bhttp": {
      source: "iana"
    },
    "message/cpim": {
      source: "iana"
    },
    "message/delivery-status": {
      source: "iana"
    },
    "message/disposition-notification": {
      source: "iana",
      extensions: [
        "disposition-notification"
      ]
    },
    "message/external-body": {
      source: "iana"
    },
    "message/feedback-report": {
      source: "iana"
    },
    "message/global": {
      source: "iana",
      extensions: ["u8msg"]
    },
    "message/global-delivery-status": {
      source: "iana",
      extensions: ["u8dsn"]
    },
    "message/global-disposition-notification": {
      source: "iana",
      extensions: ["u8mdn"]
    },
    "message/global-headers": {
      source: "iana",
      extensions: ["u8hdr"]
    },
    "message/http": {
      source: "iana",
      compressible: false
    },
    "message/imdn+xml": {
      source: "iana",
      compressible: true
    },
    "message/mls": {
      source: "iana"
    },
    "message/news": {
      source: "apache"
    },
    "message/ohttp-req": {
      source: "iana"
    },
    "message/ohttp-res": {
      source: "iana"
    },
    "message/partial": {
      source: "iana",
      compressible: false
    },
    "message/rfc822": {
      source: "iana",
      compressible: true,
      extensions: ["eml", "mime"]
    },
    "message/s-http": {
      source: "apache"
    },
    "message/sip": {
      source: "iana"
    },
    "message/sipfrag": {
      source: "iana"
    },
    "message/tracking-status": {
      source: "iana"
    },
    "message/vnd.si.simp": {
      source: "apache"
    },
    "message/vnd.wfa.wsc": {
      source: "iana",
      extensions: ["wsc"]
    },
    "model/3mf": {
      source: "iana",
      extensions: ["3mf"]
    },
    "model/e57": {
      source: "iana"
    },
    "model/gltf+json": {
      source: "iana",
      compressible: true,
      extensions: ["gltf"]
    },
    "model/gltf-binary": {
      source: "iana",
      compressible: true,
      extensions: ["glb"]
    },
    "model/iges": {
      source: "iana",
      compressible: false,
      extensions: ["igs", "iges"]
    },
    "model/jt": {
      source: "iana",
      extensions: ["jt"]
    },
    "model/mesh": {
      source: "iana",
      compressible: false,
      extensions: ["msh", "mesh", "silo"]
    },
    "model/mtl": {
      source: "iana",
      extensions: ["mtl"]
    },
    "model/obj": {
      source: "iana",
      extensions: ["obj"]
    },
    "model/prc": {
      source: "iana",
      extensions: ["prc"]
    },
    "model/step": {
      source: "iana"
    },
    "model/step+xml": {
      source: "iana",
      compressible: true,
      extensions: ["stpx"]
    },
    "model/step+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpz"]
    },
    "model/step-xml+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpxz"]
    },
    "model/stl": {
      source: "iana",
      extensions: ["stl"]
    },
    "model/u3d": {
      source: "iana",
      extensions: ["u3d"]
    },
    "model/vnd.bary": {
      source: "iana",
      extensions: ["bary"]
    },
    "model/vnd.cld": {
      source: "iana",
      extensions: ["cld"]
    },
    "model/vnd.collada+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dae"]
    },
    "model/vnd.dwf": {
      source: "iana",
      extensions: ["dwf"]
    },
    "model/vnd.flatland.3dml": {
      source: "iana"
    },
    "model/vnd.gdl": {
      source: "iana",
      extensions: ["gdl"]
    },
    "model/vnd.gs-gdl": {
      source: "apache"
    },
    "model/vnd.gs.gdl": {
      source: "iana"
    },
    "model/vnd.gtw": {
      source: "iana",
      extensions: ["gtw"]
    },
    "model/vnd.moml+xml": {
      source: "iana",
      compressible: true
    },
    "model/vnd.mts": {
      source: "iana",
      extensions: ["mts"]
    },
    "model/vnd.opengex": {
      source: "iana",
      extensions: ["ogex"]
    },
    "model/vnd.parasolid.transmit.binary": {
      source: "iana",
      extensions: ["x_b"]
    },
    "model/vnd.parasolid.transmit.text": {
      source: "iana",
      extensions: ["x_t"]
    },
    "model/vnd.pytha.pyox": {
      source: "iana",
      extensions: ["pyo", "pyox"]
    },
    "model/vnd.rosette.annotated-data-model": {
      source: "iana"
    },
    "model/vnd.sap.vds": {
      source: "iana",
      extensions: ["vds"]
    },
    "model/vnd.usda": {
      source: "iana",
      extensions: ["usda"]
    },
    "model/vnd.usdz+zip": {
      source: "iana",
      compressible: false,
      extensions: ["usdz"]
    },
    "model/vnd.valve.source.compiled-map": {
      source: "iana",
      extensions: ["bsp"]
    },
    "model/vnd.vtu": {
      source: "iana",
      extensions: ["vtu"]
    },
    "model/vrml": {
      source: "iana",
      compressible: false,
      extensions: ["wrl", "vrml"]
    },
    "model/x3d+binary": {
      source: "apache",
      compressible: false,
      extensions: ["x3db", "x3dbz"]
    },
    "model/x3d+fastinfoset": {
      source: "iana",
      extensions: ["x3db"]
    },
    "model/x3d+vrml": {
      source: "apache",
      compressible: false,
      extensions: ["x3dv", "x3dvz"]
    },
    "model/x3d+xml": {
      source: "iana",
      compressible: true,
      extensions: ["x3d", "x3dz"]
    },
    "model/x3d-vrml": {
      source: "iana",
      extensions: ["x3dv"]
    },
    "multipart/alternative": {
      source: "iana",
      compressible: false
    },
    "multipart/appledouble": {
      source: "iana"
    },
    "multipart/byteranges": {
      source: "iana"
    },
    "multipart/digest": {
      source: "iana"
    },
    "multipart/encrypted": {
      source: "iana",
      compressible: false
    },
    "multipart/form-data": {
      source: "iana",
      compressible: false
    },
    "multipart/header-set": {
      source: "iana"
    },
    "multipart/mixed": {
      source: "iana"
    },
    "multipart/multilingual": {
      source: "iana"
    },
    "multipart/parallel": {
      source: "iana"
    },
    "multipart/related": {
      source: "iana",
      compressible: false
    },
    "multipart/report": {
      source: "iana"
    },
    "multipart/signed": {
      source: "iana",
      compressible: false
    },
    "multipart/vnd.bint.med-plus": {
      source: "iana"
    },
    "multipart/voice-message": {
      source: "iana"
    },
    "multipart/x-mixed-replace": {
      source: "iana"
    },
    "text/1d-interleaved-parityfec": {
      source: "iana"
    },
    "text/cache-manifest": {
      source: "iana",
      compressible: true,
      extensions: ["appcache", "manifest"]
    },
    "text/calendar": {
      source: "iana",
      extensions: ["ics", "ifb"]
    },
    "text/calender": {
      compressible: true
    },
    "text/cmd": {
      compressible: true
    },
    "text/coffeescript": {
      extensions: ["coffee", "litcoffee"]
    },
    "text/cql": {
      source: "iana"
    },
    "text/cql-expression": {
      source: "iana"
    },
    "text/cql-identifier": {
      source: "iana"
    },
    "text/css": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["css"]
    },
    "text/csv": {
      source: "iana",
      compressible: true,
      extensions: ["csv"]
    },
    "text/csv-schema": {
      source: "iana"
    },
    "text/directory": {
      source: "iana"
    },
    "text/dns": {
      source: "iana"
    },
    "text/ecmascript": {
      source: "apache"
    },
    "text/encaprtp": {
      source: "iana"
    },
    "text/enriched": {
      source: "iana"
    },
    "text/fhirpath": {
      source: "iana"
    },
    "text/flexfec": {
      source: "iana"
    },
    "text/fwdred": {
      source: "iana"
    },
    "text/gff3": {
      source: "iana"
    },
    "text/grammar-ref-list": {
      source: "iana"
    },
    "text/hl7v2": {
      source: "iana"
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: ["html", "htm", "shtml"]
    },
    "text/jade": {
      extensions: ["jade"]
    },
    "text/javascript": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js", "mjs"]
    },
    "text/jcr-cnd": {
      source: "iana"
    },
    "text/jsx": {
      compressible: true,
      extensions: ["jsx"]
    },
    "text/less": {
      compressible: true,
      extensions: ["less"]
    },
    "text/markdown": {
      source: "iana",
      compressible: true,
      extensions: ["md", "markdown"]
    },
    "text/mathml": {
      source: "nginx",
      extensions: ["mml"]
    },
    "text/mdx": {
      compressible: true,
      extensions: ["mdx"]
    },
    "text/mizar": {
      source: "iana"
    },
    "text/n3": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["n3"]
    },
    "text/parameters": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/parityfec": {
      source: "iana"
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/provenance-notation": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/prs.fallenstein.rst": {
      source: "iana"
    },
    "text/prs.lines.tag": {
      source: "iana",
      extensions: ["dsc"]
    },
    "text/prs.prop.logic": {
      source: "iana"
    },
    "text/prs.texi": {
      source: "iana"
    },
    "text/raptorfec": {
      source: "iana"
    },
    "text/red": {
      source: "iana"
    },
    "text/rfc822-headers": {
      source: "iana"
    },
    "text/richtext": {
      source: "iana",
      compressible: true,
      extensions: ["rtx"]
    },
    "text/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "text/rtp-enc-aescm128": {
      source: "iana"
    },
    "text/rtploopback": {
      source: "iana"
    },
    "text/rtx": {
      source: "iana"
    },
    "text/sgml": {
      source: "iana",
      extensions: ["sgml", "sgm"]
    },
    "text/shaclc": {
      source: "iana"
    },
    "text/shex": {
      source: "iana",
      extensions: ["shex"]
    },
    "text/slim": {
      extensions: ["slim", "slm"]
    },
    "text/spdx": {
      source: "iana",
      extensions: ["spdx"]
    },
    "text/strings": {
      source: "iana"
    },
    "text/stylus": {
      extensions: ["stylus", "styl"]
    },
    "text/t140": {
      source: "iana"
    },
    "text/tab-separated-values": {
      source: "iana",
      compressible: true,
      extensions: ["tsv"]
    },
    "text/troff": {
      source: "iana",
      extensions: ["t", "tr", "roff", "man", "me", "ms"]
    },
    "text/turtle": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["ttl"]
    },
    "text/ulpfec": {
      source: "iana"
    },
    "text/uri-list": {
      source: "iana",
      compressible: true,
      extensions: ["uri", "uris", "urls"]
    },
    "text/vcard": {
      source: "iana",
      compressible: true,
      extensions: ["vcard"]
    },
    "text/vnd.a": {
      source: "iana"
    },
    "text/vnd.abc": {
      source: "iana"
    },
    "text/vnd.ascii-art": {
      source: "iana"
    },
    "text/vnd.curl": {
      source: "iana",
      extensions: ["curl"]
    },
    "text/vnd.curl.dcurl": {
      source: "apache",
      extensions: ["dcurl"]
    },
    "text/vnd.curl.mcurl": {
      source: "apache",
      extensions: ["mcurl"]
    },
    "text/vnd.curl.scurl": {
      source: "apache",
      extensions: ["scurl"]
    },
    "text/vnd.debian.copyright": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.dmclientscript": {
      source: "iana"
    },
    "text/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "text/vnd.esmertec.theme-descriptor": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.exchangeable": {
      source: "iana"
    },
    "text/vnd.familysearch.gedcom": {
      source: "iana",
      extensions: ["ged"]
    },
    "text/vnd.ficlab.flt": {
      source: "iana"
    },
    "text/vnd.fly": {
      source: "iana",
      extensions: ["fly"]
    },
    "text/vnd.fmi.flexstor": {
      source: "iana",
      extensions: ["flx"]
    },
    "text/vnd.gml": {
      source: "iana"
    },
    "text/vnd.graphviz": {
      source: "iana",
      extensions: ["gv"]
    },
    "text/vnd.hans": {
      source: "iana"
    },
    "text/vnd.hgl": {
      source: "iana"
    },
    "text/vnd.in3d.3dml": {
      source: "iana",
      extensions: ["3dml"]
    },
    "text/vnd.in3d.spot": {
      source: "iana",
      extensions: ["spot"]
    },
    "text/vnd.iptc.newsml": {
      source: "iana"
    },
    "text/vnd.iptc.nitf": {
      source: "iana"
    },
    "text/vnd.latex-z": {
      source: "iana"
    },
    "text/vnd.motorola.reflex": {
      source: "iana"
    },
    "text/vnd.ms-mediapackage": {
      source: "iana"
    },
    "text/vnd.net2phone.commcenter.command": {
      source: "iana"
    },
    "text/vnd.radisys.msml-basic-layout": {
      source: "iana"
    },
    "text/vnd.senx.warpscript": {
      source: "iana"
    },
    "text/vnd.si.uricatalogue": {
      source: "apache"
    },
    "text/vnd.sosi": {
      source: "iana"
    },
    "text/vnd.sun.j2me.app-descriptor": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["jad"]
    },
    "text/vnd.trolltech.linguist": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.vcf": {
      source: "iana"
    },
    "text/vnd.wap.si": {
      source: "iana"
    },
    "text/vnd.wap.sl": {
      source: "iana"
    },
    "text/vnd.wap.wml": {
      source: "iana",
      extensions: ["wml"]
    },
    "text/vnd.wap.wmlscript": {
      source: "iana",
      extensions: ["wmls"]
    },
    "text/vnd.zoo.kcl": {
      source: "iana"
    },
    "text/vtt": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["vtt"]
    },
    "text/wgsl": {
      source: "iana",
      extensions: ["wgsl"]
    },
    "text/x-asm": {
      source: "apache",
      extensions: ["s", "asm"]
    },
    "text/x-c": {
      source: "apache",
      extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
    },
    "text/x-component": {
      source: "nginx",
      extensions: ["htc"]
    },
    "text/x-fortran": {
      source: "apache",
      extensions: ["f", "for", "f77", "f90"]
    },
    "text/x-gwt-rpc": {
      compressible: true
    },
    "text/x-handlebars-template": {
      extensions: ["hbs"]
    },
    "text/x-java-source": {
      source: "apache",
      extensions: ["java"]
    },
    "text/x-jquery-tmpl": {
      compressible: true
    },
    "text/x-lua": {
      extensions: ["lua"]
    },
    "text/x-markdown": {
      compressible: true,
      extensions: ["mkd"]
    },
    "text/x-nfo": {
      source: "apache",
      extensions: ["nfo"]
    },
    "text/x-opml": {
      source: "apache",
      extensions: ["opml"]
    },
    "text/x-org": {
      compressible: true,
      extensions: ["org"]
    },
    "text/x-pascal": {
      source: "apache",
      extensions: ["p", "pas"]
    },
    "text/x-processing": {
      compressible: true,
      extensions: ["pde"]
    },
    "text/x-sass": {
      extensions: ["sass"]
    },
    "text/x-scss": {
      extensions: ["scss"]
    },
    "text/x-setext": {
      source: "apache",
      extensions: ["etx"]
    },
    "text/x-sfv": {
      source: "apache",
      extensions: ["sfv"]
    },
    "text/x-suse-ymp": {
      compressible: true,
      extensions: ["ymp"]
    },
    "text/x-uuencode": {
      source: "apache",
      extensions: ["uu"]
    },
    "text/x-vcalendar": {
      source: "apache",
      extensions: ["vcs"]
    },
    "text/x-vcard": {
      source: "apache",
      extensions: ["vcf"]
    },
    "text/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml"]
    },
    "text/xml-external-parsed-entity": {
      source: "iana"
    },
    "text/yaml": {
      compressible: true,
      extensions: ["yaml", "yml"]
    },
    "video/1d-interleaved-parityfec": {
      source: "iana"
    },
    "video/3gpp": {
      source: "iana",
      extensions: ["3gp", "3gpp"]
    },
    "video/3gpp-tt": {
      source: "iana"
    },
    "video/3gpp2": {
      source: "iana",
      extensions: ["3g2"]
    },
    "video/av1": {
      source: "iana"
    },
    "video/bmpeg": {
      source: "iana"
    },
    "video/bt656": {
      source: "iana"
    },
    "video/celb": {
      source: "iana"
    },
    "video/dv": {
      source: "iana"
    },
    "video/encaprtp": {
      source: "iana"
    },
    "video/evc": {
      source: "iana"
    },
    "video/ffv1": {
      source: "iana"
    },
    "video/flexfec": {
      source: "iana"
    },
    "video/h261": {
      source: "iana",
      extensions: ["h261"]
    },
    "video/h263": {
      source: "iana",
      extensions: ["h263"]
    },
    "video/h263-1998": {
      source: "iana"
    },
    "video/h263-2000": {
      source: "iana"
    },
    "video/h264": {
      source: "iana",
      extensions: ["h264"]
    },
    "video/h264-rcdo": {
      source: "iana"
    },
    "video/h264-svc": {
      source: "iana"
    },
    "video/h265": {
      source: "iana"
    },
    "video/h266": {
      source: "iana"
    },
    "video/iso.segment": {
      source: "iana",
      extensions: ["m4s"]
    },
    "video/jpeg": {
      source: "iana",
      extensions: ["jpgv"]
    },
    "video/jpeg2000": {
      source: "iana"
    },
    "video/jpm": {
      source: "apache",
      extensions: ["jpm", "jpgm"]
    },
    "video/jxsv": {
      source: "iana"
    },
    "video/matroska": {
      source: "iana"
    },
    "video/matroska-3d": {
      source: "iana"
    },
    "video/mj2": {
      source: "iana",
      extensions: ["mj2", "mjp2"]
    },
    "video/mp1s": {
      source: "iana"
    },
    "video/mp2p": {
      source: "iana"
    },
    "video/mp2t": {
      source: "iana",
      extensions: ["ts", "m2t", "m2ts", "mts"]
    },
    "video/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["mp4", "mp4v", "mpg4"]
    },
    "video/mp4v-es": {
      source: "iana"
    },
    "video/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/mpeg4-generic": {
      source: "iana"
    },
    "video/mpv": {
      source: "iana"
    },
    "video/nv": {
      source: "iana"
    },
    "video/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogv"]
    },
    "video/parityfec": {
      source: "iana"
    },
    "video/pointer": {
      source: "iana"
    },
    "video/quicktime": {
      source: "iana",
      compressible: false,
      extensions: ["qt", "mov"]
    },
    "video/raptorfec": {
      source: "iana"
    },
    "video/raw": {
      source: "iana"
    },
    "video/rtp-enc-aescm128": {
      source: "iana"
    },
    "video/rtploopback": {
      source: "iana"
    },
    "video/rtx": {
      source: "iana"
    },
    "video/scip": {
      source: "iana"
    },
    "video/smpte291": {
      source: "iana"
    },
    "video/smpte292m": {
      source: "iana"
    },
    "video/ulpfec": {
      source: "iana"
    },
    "video/vc1": {
      source: "iana"
    },
    "video/vc2": {
      source: "iana"
    },
    "video/vnd.cctv": {
      source: "iana"
    },
    "video/vnd.dece.hd": {
      source: "iana",
      extensions: ["uvh", "uvvh"]
    },
    "video/vnd.dece.mobile": {
      source: "iana",
      extensions: ["uvm", "uvvm"]
    },
    "video/vnd.dece.mp4": {
      source: "iana"
    },
    "video/vnd.dece.pd": {
      source: "iana",
      extensions: ["uvp", "uvvp"]
    },
    "video/vnd.dece.sd": {
      source: "iana",
      extensions: ["uvs", "uvvs"]
    },
    "video/vnd.dece.video": {
      source: "iana",
      extensions: ["uvv", "uvvv"]
    },
    "video/vnd.directv.mpeg": {
      source: "iana"
    },
    "video/vnd.directv.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dlna.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dvb.file": {
      source: "iana",
      extensions: ["dvb"]
    },
    "video/vnd.fvt": {
      source: "iana",
      extensions: ["fvt"]
    },
    "video/vnd.hns.video": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsavc": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsmpeg2": {
      source: "iana"
    },
    "video/vnd.motorola.video": {
      source: "iana"
    },
    "video/vnd.motorola.videop": {
      source: "iana"
    },
    "video/vnd.mpegurl": {
      source: "iana",
      extensions: ["mxu", "m4u"]
    },
    "video/vnd.ms-playready.media.pyv": {
      source: "iana",
      extensions: ["pyv"]
    },
    "video/vnd.nokia.interleaved-multimedia": {
      source: "iana"
    },
    "video/vnd.nokia.mp4vr": {
      source: "iana"
    },
    "video/vnd.nokia.videovoip": {
      source: "iana"
    },
    "video/vnd.objectvideo": {
      source: "iana"
    },
    "video/vnd.radgamettools.bink": {
      source: "iana"
    },
    "video/vnd.radgamettools.smacker": {
      source: "apache"
    },
    "video/vnd.sealed.mpeg1": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg4": {
      source: "iana"
    },
    "video/vnd.sealed.swf": {
      source: "iana"
    },
    "video/vnd.sealedmedia.softseal.mov": {
      source: "iana"
    },
    "video/vnd.uvvu.mp4": {
      source: "iana",
      extensions: ["uvu", "uvvu"]
    },
    "video/vnd.vivo": {
      source: "iana",
      extensions: ["viv"]
    },
    "video/vnd.youtube.yt": {
      source: "iana"
    },
    "video/vp8": {
      source: "iana"
    },
    "video/vp9": {
      source: "iana"
    },
    "video/webm": {
      source: "apache",
      compressible: false,
      extensions: ["webm"]
    },
    "video/x-f4v": {
      source: "apache",
      extensions: ["f4v"]
    },
    "video/x-fli": {
      source: "apache",
      extensions: ["fli"]
    },
    "video/x-flv": {
      source: "apache",
      compressible: false,
      extensions: ["flv"]
    },
    "video/x-m4v": {
      source: "apache",
      extensions: ["m4v"]
    },
    "video/x-matroska": {
      source: "apache",
      compressible: false,
      extensions: ["mkv", "mk3d", "mks"]
    },
    "video/x-mng": {
      source: "apache",
      extensions: ["mng"]
    },
    "video/x-ms-asf": {
      source: "apache",
      extensions: ["asf", "asx"]
    },
    "video/x-ms-vob": {
      source: "apache",
      extensions: ["vob"]
    },
    "video/x-ms-wm": {
      source: "apache",
      extensions: ["wm"]
    },
    "video/x-ms-wmv": {
      source: "apache",
      compressible: false,
      extensions: ["wmv"]
    },
    "video/x-ms-wmx": {
      source: "apache",
      extensions: ["wmx"]
    },
    "video/x-ms-wvx": {
      source: "apache",
      extensions: ["wvx"]
    },
    "video/x-msvideo": {
      source: "apache",
      extensions: ["avi"]
    },
    "video/x-sgi-movie": {
      source: "apache",
      extensions: ["movie"]
    },
    "video/x-smv": {
      source: "apache",
      extensions: ["smv"]
    },
    "x-conference/x-cooltalk": {
      source: "apache",
      extensions: ["ice"]
    },
    "x-shader/x-fragment": {
      compressible: true
    },
    "x-shader/x-vertex": {
      compressible: true
    }
  };
});

// node_modules/@hapi/mimos/lib/index.js
var require_lib14 = __commonJS((exports) => {
  var Path = __require("path");
  var Hoek = require_lib();
  var MimeDb = require_db();
  var internals = {
    compressibleRx: /^text\/|\+json$|\+text$|\+xml$/
  };
  exports.MimosEntry = class {
    constructor(type, mime) {
      this.type = type;
      this.source = "mime-db";
      this.extensions = [];
      this.compressible = undefined;
      Object.assign(this, mime);
      if (this.compressible === undefined) {
        this.compressible = internals.compressibleRx.test(type);
      }
    }
  };
  internals.insertEntry = function(type, entry, db) {
    db.byType.set(type, entry);
    for (const ext of entry.extensions) {
      db.byExtension.set(ext, entry);
      if (ext.length > db.maxExtLength) {
        db.maxExtLength = ext.length;
      }
    }
  };
  internals.compile = function(mimedb) {
    const db = {
      byType: new Map,
      byExtension: new Map,
      maxExtLength: 0
    };
    for (const type in mimedb) {
      const entry = new exports.MimosEntry(type, mimedb[type]);
      internals.insertEntry(type, entry, db);
    }
    return db;
  };
  internals.getTypePart = function(fulltype) {
    const splitAt = fulltype.indexOf(";");
    return splitAt === -1 ? fulltype : fulltype.slice(0, splitAt);
  };
  internals.applyPredicate = function(mime) {
    if (mime.predicate) {
      return mime.predicate(Hoek.clone(mime));
    }
    return mime;
  };
  exports.Mimos = class Mimos {
    #db = internals.base;
    constructor(options = {}) {
      if (options.override) {
        Hoek.assert(typeof options.override === "object", "overrides option must be an object");
        this.#db = {
          ...this.#db,
          byType: new Map(this.#db.byType),
          byExtension: new Map(this.#db.byExtension)
        };
        for (const type in options.override) {
          const override = options.override[type];
          Hoek.assert(!override.predicate || typeof override.predicate === "function", "predicate option must be a function");
          const from = this.#db.byType.get(type);
          const baseEntry = from ? Hoek.applyToDefaults(from, override) : override;
          const entry = new exports.MimosEntry(type, baseEntry);
          internals.insertEntry(type, entry, this.#db);
        }
      }
    }
    path(path) {
      const extension = Path.extname(path).slice(1).toLowerCase();
      const mime = this.#db.byExtension.get(extension) ?? {};
      return internals.applyPredicate(mime);
    }
    type(type) {
      type = internals.getTypePart(type);
      let mime = this.#db.byType.get(type);
      if (!mime) {
        type = type.trim().toLowerCase();
        mime = this.#db.byType.get(type);
      }
      if (!mime) {
        mime = new exports.MimosEntry(type, {
          source: "mimos"
        });
        internals.insertEntry(type, mime, this.#db);
        return mime;
      }
      return internals.applyPredicate(mime);
    }
  };
  internals.base = internals.compile(MimeDb);
});

// node_modules/@hapi/bourne/lib/index.js
var require_lib15 = __commonJS((exports) => {
  var internals = {
    suspectRx: /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*\:/
  };
  exports.parse = function(text, ...args) {
    const firstOptions = typeof args[0] === "object" && args[0];
    const reviver = args.length > 1 || !firstOptions ? args[0] : undefined;
    const options = args.length > 1 && args[1] || firstOptions || {};
    const obj = JSON.parse(text, reviver);
    if (options.protoAction === "ignore") {
      return obj;
    }
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    if (!text.match(internals.suspectRx)) {
      return obj;
    }
    exports.scan(obj, options);
    return obj;
  };
  exports.scan = function(obj, options = {}) {
    let next = [obj];
    while (next.length) {
      const nodes = next;
      next = [];
      for (const node of nodes) {
        if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
          if (options.protoAction !== "remove") {
            throw new SyntaxError("Object contains forbidden prototype property");
          }
          delete node.__proto__;
        }
        for (const key in node) {
          const value = node[key];
          if (value && typeof value === "object") {
            next.push(node[key]);
          }
        }
      }
    }
  };
  exports.safeParse = function(text, reviver) {
    try {
      return exports.parse(text, reviver);
    } catch (ignoreError) {
      return null;
    }
  };
});

// node_modules/@hapi/cryptiles/lib/index.js
var require_lib16 = __commonJS((exports) => {
  var Crypto = __require("crypto");
  var Boom = require_lib6();
  var internals = {};
  exports.randomString = function(size) {
    const buffer = exports.randomBits((size + 1) * 6);
    const string = buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
    return string.slice(0, size);
  };
  exports.randomAlphanumString = function(size) {
    let result = "";
    while (result.length < size) {
      const buffer = exports.randomBits((size + 1) * 6);
      result += buffer.toString("base64").replace(/[^a-zA-Z0-9]/g, "");
    }
    return result.slice(0, size);
  };
  exports.randomDigits = function(size) {
    const digits = [];
    let buffer = internals.random(size * 2);
    let pos = 0;
    while (digits.length < size) {
      if (pos >= buffer.length) {
        buffer = internals.random(size * 2);
        pos = 0;
      }
      if (buffer[pos] < 250) {
        digits.push(buffer[pos] % 10);
      }
      ++pos;
    }
    return digits.join("");
  };
  exports.randomBits = function(bits) {
    if (!bits || bits < 0) {
      throw Boom.internal("Invalid random bits count");
    }
    const bytes = Math.ceil(bits / 8);
    return internals.random(bytes);
  };
  exports.fixedTimeComparison = function(a, b) {
    try {
      return Crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch (err) {
      return false;
    }
  };
  internals.random = function(bytes) {
    try {
      return Crypto.randomBytes(bytes);
    } catch (err) {
      throw Boom.internal("Failed generating random bits: " + err.message);
    }
  };
});

// node_modules/@hapi/b64/lib/decoder.js
var require_decoder = __commonJS((exports) => {
  var Stream = __require("stream");
  var internals = {
    decodeChars: [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      62,
      -1,
      -1,
      -1,
      63,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      -1,
      -1,
      -1,
      -1,
      -1
    ]
  };
  exports.decode = function(buffer) {
    const decodeChars = internals.decodeChars;
    const len = buffer.length;
    const allocated = Math.ceil(len / 4) * 3;
    const result = Buffer.alloc(allocated);
    let c1;
    let c2;
    let c3;
    let c4;
    let j = 0;
    for (let i = 0;i < len; ) {
      do {
        c1 = decodeChars[buffer[i++] & 255];
      } while (i < len && c1 === -1);
      if (c1 === -1) {
        break;
      }
      do {
        c2 = decodeChars[buffer[i++] & 255];
      } while (i < len && c2 === -1);
      if (c2 === -1) {
        break;
      }
      result[j++] = c1 << 2 | (c2 & 48) >> 4;
      do {
        c3 = buffer[i++] & 255;
        if (c3 === 61) {
          return result.slice(0, j);
        }
        c3 = decodeChars[c3];
      } while (i < len && c3 === -1);
      if (c3 === -1) {
        break;
      }
      result[j++] = (c2 & 15) << 4 | (c3 & 60) >> 2;
      do {
        c4 = buffer[i++] & 255;
        if (c4 === 61) {
          return result.slice(0, j);
        }
        c4 = decodeChars[c4];
      } while (i < len && c4 === -1);
      if (c4 !== -1) {
        result[j++] = (c3 & 3) << 6 | c4;
      }
    }
    return j === allocated ? result : result.slice(0, j);
  };
  exports.Decoder = class Decoder extends Stream.Transform {
    constructor() {
      super();
      this._reminder = null;
    }
    _transform(chunk, encoding, callback) {
      let part = this._reminder ? Buffer.concat([this._reminder, chunk]) : chunk;
      const remaining = part.length % 4;
      if (remaining) {
        this._reminder = part.slice(part.length - remaining);
        part = part.slice(0, part.length - remaining);
      } else {
        this._reminder = null;
      }
      this.push(exports.decode(part));
      return callback();
    }
    _flush(callback) {
      if (this._reminder) {
        this.push(exports.decode(this._reminder));
      }
      return callback();
    }
  };
});

// node_modules/@hapi/b64/lib/encoder.js
var require_encoder = __commonJS((exports) => {
  var Stream = __require("stream");
  exports.encode = function(buffer) {
    return Buffer.from(buffer.toString("base64"));
  };
  exports.Encoder = class Encoder extends Stream.Transform {
    constructor() {
      super();
      this._reminder = null;
    }
    _transform(chunk, encoding, callback) {
      let part = this._reminder ? Buffer.concat([this._reminder, chunk]) : chunk;
      const remaining = part.length % 3;
      if (remaining) {
        this._reminder = part.slice(part.length - remaining);
        part = part.slice(0, part.length - remaining);
      } else {
        this._reminder = null;
      }
      this.push(exports.encode(part));
      return callback();
    }
    _flush(callback) {
      if (this._reminder) {
        this.push(exports.encode(this._reminder));
      }
      return callback();
    }
  };
});

// node_modules/@hapi/b64/lib/index.js
var require_lib17 = __commonJS((exports) => {
  var Hoek = require_lib();
  var Decoder = require_decoder();
  var Encoder = require_encoder();
  exports.decode = Decoder.decode;
  exports.encode = Encoder.encode;
  exports.Decoder = Decoder.Decoder;
  exports.Encoder = Encoder.Encoder;
  exports.base64urlEncode = function(value, encoding) {
    Hoek.assert(typeof value === "string" || Buffer.isBuffer(value), "value must be string or buffer");
    const buf = Buffer.isBuffer(value) ? value : Buffer.from(value, encoding || "binary");
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
  };
  exports.base64urlDecode = function(value, encoding) {
    if (typeof value !== "string") {
      throw new Error("Value not a string");
    }
    if (!/^[\w\-]*$/.test(value)) {
      throw new Error("Invalid character");
    }
    const buf = Buffer.from(value, "base64");
    return encoding === "buffer" ? buf : buf.toString(encoding || "binary");
  };
});

// node_modules/@hapi/iron/lib/index.js
var require_lib18 = __commonJS((exports) => {
  var Crypto = __require("crypto");
  var B64 = require_lib17();
  var Boom = require_lib6();
  var Bourne = require_lib15();
  var Cryptiles = require_lib16();
  var Hoek = require_lib();
  var internals = {};
  exports.defaults = {
    encryption: {
      saltBits: 256,
      algorithm: "aes-256-cbc",
      iterations: 1,
      minPasswordlength: 32
    },
    integrity: {
      saltBits: 256,
      algorithm: "sha256",
      iterations: 1,
      minPasswordlength: 32
    },
    ttl: 0,
    timestampSkewSec: 60,
    localtimeOffsetMsec: 0
  };
  exports.algorithms = {
    "aes-128-ctr": { keyBits: 128, ivBits: 128 },
    "aes-256-cbc": { keyBits: 256, ivBits: 128 },
    sha256: { keyBits: 256 }
  };
  exports.macFormatVersion = "2";
  exports.macPrefix = "Fe26." + exports.macFormatVersion;
  exports.generateKey = async function(password, options) {
    if (!password) {
      throw new Boom.Boom("Empty password");
    }
    if (!options || typeof options !== "object") {
      throw new Boom.Boom("Bad options");
    }
    const algorithm = exports.algorithms[options.algorithm];
    if (!algorithm) {
      throw new Boom.Boom("Unknown algorithm: " + options.algorithm);
    }
    const result = {};
    if (Buffer.isBuffer(password)) {
      if (password.length < algorithm.keyBits / 8) {
        throw new Boom.Boom("Key buffer (password) too small");
      }
      result.key = password;
      result.salt = "";
    } else {
      if (password.length < options.minPasswordlength) {
        throw new Boom.Boom("Password string too short (min " + options.minPasswordlength + " characters required)");
      }
      let salt = options.salt;
      if (!salt) {
        if (!options.saltBits) {
          throw new Boom.Boom("Missing salt and saltBits options");
        }
        const randomSalt = Cryptiles.randomBits(options.saltBits);
        salt = randomSalt.toString("hex");
      }
      const derivedKey = await internals.pbkdf2(password, salt, options.iterations, algorithm.keyBits / 8, "sha1");
      result.key = derivedKey;
      result.salt = salt;
    }
    if (options.iv) {
      result.iv = options.iv;
    } else if (algorithm.ivBits) {
      result.iv = Cryptiles.randomBits(algorithm.ivBits);
    }
    return result;
  };
  exports.encrypt = async function(password, options, data) {
    const key = await exports.generateKey(password, options);
    const cipher = Crypto.createCipheriv(options.algorithm, key.key, key.iv);
    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
    return { encrypted, key };
  };
  exports.decrypt = async function(password, options, data) {
    const key = await exports.generateKey(password, options);
    const decipher = Crypto.createDecipheriv(options.algorithm, key.key, key.iv);
    let dec = decipher.update(data, null, "utf8");
    dec = dec + decipher.final("utf8");
    return dec;
  };
  exports.hmacWithPassword = async function(password, options, data) {
    const key = await exports.generateKey(password, options);
    const hmac = Crypto.createHmac(options.algorithm, key.key).update(data);
    const digest = hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
    return {
      digest,
      salt: key.salt
    };
  };
  internals.normalizePassword = function(password) {
    if (password && typeof password === "object" && !Buffer.isBuffer(password)) {
      return {
        id: password.id,
        encryption: password.secret ?? password.encryption,
        integrity: password.secret ?? password.integrity
      };
    }
    return {
      encryption: password,
      integrity: password
    };
  };
  exports.seal = async function(object, password, options) {
    options = Object.assign({}, options);
    const now = Date.now() + (options.localtimeOffsetMsec ?? 0);
    const objectString = internals.stringify(object);
    let passwordId = "";
    password = internals.normalizePassword(password);
    if (password.id) {
      if (!/^\w+$/.test(password.id)) {
        throw new Boom.Boom("Invalid password id");
      }
      passwordId = password.id;
    }
    const { encrypted, key } = await exports.encrypt(password.encryption, options.encryption, objectString);
    const encryptedB64 = B64.base64urlEncode(encrypted);
    const iv = B64.base64urlEncode(key.iv);
    const expiration = options.ttl ? now + options.ttl : "";
    const macBaseString = exports.macPrefix + "*" + passwordId + "*" + key.salt + "*" + iv + "*" + encryptedB64 + "*" + expiration;
    const mac = await exports.hmacWithPassword(password.integrity, options.integrity, macBaseString);
    const sealed = macBaseString + "*" + mac.salt + "*" + mac.digest;
    return sealed;
  };
  exports.unseal = async function(sealed, password, options) {
    options = Object.assign({}, options);
    const now = Date.now() + (options.localtimeOffsetMsec ?? 0);
    const parts = sealed.split("*");
    if (parts.length !== 8) {
      throw new Boom.Boom("Incorrect number of sealed components");
    }
    const macPrefix = parts[0];
    const passwordId = parts[1];
    const encryptionSalt = parts[2];
    const encryptionIv = parts[3];
    const encryptedB64 = parts[4];
    const expiration = parts[5];
    const hmacSalt = parts[6];
    const hmac = parts[7];
    const macBaseString = macPrefix + "*" + passwordId + "*" + encryptionSalt + "*" + encryptionIv + "*" + encryptedB64 + "*" + expiration;
    if (macPrefix !== exports.macPrefix) {
      throw new Boom.Boom("Wrong mac prefix");
    }
    if (expiration) {
      if (!expiration.match(/^\d+$/)) {
        throw new Boom.Boom("Invalid expiration");
      }
      const exp = parseInt(expiration, 10);
      if (exp <= now - options.timestampSkewSec * 1000) {
        throw new Boom.Boom("Expired seal");
      }
    }
    if (!password) {
      throw new Boom.Boom("Empty password");
    }
    if (typeof password === "object" && !Buffer.isBuffer(password)) {
      password = password[passwordId || "default"];
      if (!password) {
        throw new Boom.Boom("Cannot find password: " + passwordId);
      }
    }
    password = internals.normalizePassword(password);
    const macOptions = Hoek.clone(options.integrity);
    macOptions.salt = hmacSalt;
    const mac = await exports.hmacWithPassword(password.integrity, macOptions, macBaseString);
    if (!Cryptiles.fixedTimeComparison(mac.digest, hmac)) {
      throw new Boom.Boom("Bad hmac value");
    }
    try {
      var encrypted = B64.base64urlDecode(encryptedB64, "buffer");
    } catch (err) {
      throw Boom.boomify(err);
    }
    const decryptOptions = Hoek.clone(options.encryption);
    decryptOptions.salt = encryptionSalt;
    try {
      decryptOptions.iv = B64.base64urlDecode(encryptionIv, "buffer");
    } catch (err) {
      throw Boom.boomify(err);
    }
    const decrypted = await exports.decrypt(password.encryption, decryptOptions, encrypted);
    try {
      return Bourne.parse(decrypted);
    } catch (err) {
      throw new Boom.Boom("Failed parsing sealed object JSON: " + err.message);
    }
  };
  internals.stringify = function(object) {
    try {
      return JSON.stringify(object);
    } catch (err) {
      throw new Boom.Boom("Failed to stringify object: " + err.message);
    }
  };
  internals.pbkdf2 = function(...args) {
    return new Promise((resolve, reject) => {
      const next = (err, result) => {
        if (err) {
          return reject(Boom.boomify(err));
        }
        resolve(result);
      };
      args.push(next);
      Crypto.pbkdf2(...args);
    });
  };
});

// node_modules/@hapi/statehood/lib/index.js
var require_lib19 = __commonJS((exports) => {
  var Querystring = __require("querystring");
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Bourne = require_lib15();
  var Cryptiles = require_lib16();
  var Hoek = require_lib();
  var Iron = require_lib18();
  var Validate = require_lib3();
  var internals = {
    macPrefix: "hapi.signed.cookie.1"
  };
  internals.schema = Validate.object({
    strictHeader: Validate.boolean(),
    ignoreErrors: Validate.boolean(),
    isSecure: Validate.boolean(),
    isHttpOnly: Validate.boolean(),
    isSameSite: Validate.valid("Strict", "Lax", "None", false),
    path: Validate.string().allow(null),
    domain: Validate.string().allow(null),
    ttl: Validate.number().allow(null),
    encoding: Validate.string().valid("base64json", "base64", "form", "iron", "none"),
    sign: Validate.object({
      password: [Validate.string(), Validate.binary(), Validate.object()],
      integrity: Validate.object()
    }),
    iron: Validate.object(),
    password: [Validate.string(), Validate.binary(), Validate.object()],
    contextualize: Validate.function(),
    clearInvalid: Validate.boolean(),
    autoValue: Validate.any(),
    passThrough: Validate.boolean()
  });
  internals.defaults = {
    strictHeader: true,
    ignoreErrors: false,
    isSecure: true,
    isHttpOnly: true,
    isSameSite: "Strict",
    path: null,
    domain: null,
    ttl: null,
    encoding: "none"
  };
  internals.validateRx = {
    nameRx: {
      strict: /^[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+$/,
      loose: /^[^=\s]*$/
    },
    valueRx: {
      strict: /^[^\x00-\x20\"\,\;\\\x7F]*$/,
      loose: /^(?:"([^\"]*)")|(?:[^\;]*)$/
    },
    domainRx: /^\.?[a-z\d]+(?:(?:[a-z\d]*)|(?:[a-z\d\-]*[a-z\d]))(?:\.[a-z\d]+(?:(?:[a-z\d]*)|(?:[a-z\d\-]*[a-z\d])))*$/,
    domainLabelLenRx: /^\.?[a-z\d\-]{1,63}(?:\.[a-z\d\-]{1,63})*$/,
    pathRx: /^\/[^\x00-\x1F\;]*$/
  };
  internals.pairsRx = /\s*([^=\s]*)\s*=\s*([^\;]*)(?:(?:;\s*)|$)/g;
  exports.Definitions = class {
    constructor(options) {
      this.settings = Hoek.applyToDefaults(internals.defaults, options ?? {});
      Validate.assert(this.settings, internals.schema, "Invalid state definition defaults");
      this.cookies = {};
      this.names = [];
    }
    add(name, options) {
      Hoek.assert(name && typeof name === "string", "Invalid name");
      Hoek.assert(!this.cookies[name], "State already defined:", name);
      const settings = Hoek.applyToDefaults(this.settings, options ?? {}, { nullOverride: true });
      Validate.assert(settings, internals.schema, "Invalid state definition: " + name);
      this.cookies[name] = settings;
      this.names.push(name);
    }
    async parse(cookies) {
      const state = {};
      const names = [];
      const verify = internals.parsePairs(cookies, (name, value) => {
        if (name === "__proto__") {
          throw Boom.badRequest("Invalid cookie header");
        }
        if (state[name]) {
          if (!Array.isArray(state[name])) {
            state[name] = [state[name]];
          }
          state[name].push(value);
        } else {
          state[name] = value;
          names.push(name);
        }
      });
      const failed = [];
      if (verify !== null) {
        if (!this.settings.ignoreErrors) {
          throw Boom.badRequest("Invalid cookie header");
        }
        failed.push({ settings: this.settings, reason: `Header contains unexpected syntax: ${verify}` });
      }
      const errored = [];
      const record = (reason, name, value, definition) => {
        const details = {
          name,
          value,
          settings: definition,
          reason: typeof reason === "string" ? reason : reason.message
        };
        failed.push(details);
        if (!definition.ignoreErrors) {
          errored.push(details);
        }
      };
      const parsed = {};
      for (const name of names) {
        const value = state[name];
        const definition = this.cookies[name] ?? this.settings;
        if (definition.strictHeader) {
          const reason = internals.validate(name, state);
          if (reason) {
            record(reason, name, value, definition);
            continue;
          }
        }
        if (definition.encoding === "none") {
          parsed[name] = value;
          continue;
        }
        if (!Array.isArray(value)) {
          try {
            const unsigned = await internals.unsign(name, value, definition);
            const result = await internals.decode(unsigned, definition);
            parsed[name] = result;
          } catch (err) {
            Bounce.rethrow(err, "system");
            record(err, name, value, definition);
          }
          continue;
        }
        const arrayResult = [];
        for (const arrayValue of value) {
          try {
            const unsigned = await internals.unsign(name, arrayValue, definition);
            const result = await internals.decode(unsigned, definition);
            arrayResult.push(result);
          } catch (err) {
            Bounce.rethrow(err, "system");
            record(err, name, value, definition);
          }
        }
        parsed[name] = arrayResult;
      }
      if (errored.length) {
        const error = Boom.badRequest("Invalid cookie value", errored);
        error.states = parsed;
        error.failed = failed;
        throw error;
      }
      return { states: parsed, failed };
    }
    async format(cookies, context) {
      if (!cookies || Array.isArray(cookies) && !cookies.length) {
        return [];
      }
      if (!Array.isArray(cookies)) {
        cookies = [cookies];
      }
      const header = [];
      for (let i = 0;i < cookies.length; ++i) {
        const cookie = cookies[i];
        const base = this.cookies[cookie.name] ?? this.settings;
        let definition = cookie.options ? Hoek.applyToDefaults(base, cookie.options, { nullOverride: true }) : base;
        if (definition.contextualize) {
          if (definition === base) {
            definition = Hoek.clone(definition);
          }
          await definition.contextualize(definition, context);
        }
        const nameRx = definition.strictHeader ? internals.validateRx.nameRx.strict : internals.validateRx.nameRx.loose;
        if (!nameRx.test(cookie.name)) {
          throw Boom.badImplementation("Invalid cookie name: " + cookie.name);
        }
        const value = await exports.prepareValue(cookie.name, cookie.value, definition);
        const valueRx = definition.strictHeader ? internals.validateRx.valueRx.strict : internals.validateRx.valueRx.loose;
        if (value && (typeof value !== "string" || !value.match(valueRx))) {
          throw Boom.badImplementation("Invalid cookie value: " + cookie.value);
        }
        let segment = cookie.name + "=" + (value || "");
        if (definition.ttl !== null && definition.ttl !== undefined) {
          const expires = new Date(definition.ttl ? Date.now() + definition.ttl : 0);
          segment = segment + "; Max-Age=" + Math.floor(definition.ttl / 1000) + "; Expires=" + expires.toUTCString();
        }
        if (definition.isSecure) {
          segment = segment + "; Secure";
        }
        if (definition.isHttpOnly) {
          segment = segment + "; HttpOnly";
        }
        if (definition.isSameSite) {
          segment = `${segment}; SameSite=${definition.isSameSite}`;
        }
        if (definition.domain) {
          const domain = definition.domain.toLowerCase();
          if (!domain.match(internals.validateRx.domainLabelLenRx)) {
            throw Boom.badImplementation("Cookie domain too long: " + definition.domain);
          }
          if (!domain.match(internals.validateRx.domainRx)) {
            throw Boom.badImplementation("Invalid cookie domain: " + definition.domain);
          }
          segment = segment + "; Domain=" + domain;
        }
        if (definition.path) {
          if (!definition.path.match(internals.validateRx.pathRx)) {
            throw Boom.badImplementation("Invalid cookie path: " + definition.path);
          }
          segment = segment + "; Path=" + definition.path;
        }
        header.push(segment);
      }
      return header;
    }
    passThrough(header, fallback) {
      if (!this.names.length) {
        return header;
      }
      const exclude = [];
      for (let i = 0;i < this.names.length; ++i) {
        const name = this.names[i];
        const definition = this.cookies[name];
        const passCookie = definition.passThrough !== undefined ? definition.passThrough : fallback;
        if (!passCookie) {
          exclude.push(name);
        }
      }
      return exports.exclude(header, exclude);
    }
  };
  internals.parsePairs = function(cookies, eachPairFn) {
    let index = 0;
    while (index < cookies.length) {
      const eqIndex = cookies.indexOf("=", index);
      if (eqIndex === -1) {
        return cookies.slice(index);
      }
      const semiIndex = cookies.indexOf(";", eqIndex);
      const endOfValueIndex = semiIndex !== -1 ? semiIndex : cookies.length;
      const name = cookies.slice(index, eqIndex).trim();
      const value = cookies.slice(eqIndex + 1, endOfValueIndex).trim();
      const unquotedValue = value.startsWith('"') && value.endsWith('"') && value !== '"' ? value.slice(1, -1) : value;
      eachPairFn(name, unquotedValue);
      index = endOfValueIndex + 1;
    }
    return null;
  };
  internals.validate = function(name, state) {
    if (!name.match(internals.validateRx.nameRx.strict)) {
      return "Invalid cookie name";
    }
    const values = [].concat(state[name]);
    for (let i = 0;i < values.length; ++i) {
      if (!values[i].match(internals.validateRx.valueRx.strict)) {
        return "Invalid cookie value";
      }
    }
    return null;
  };
  internals.unsign = async function(name, value, definition) {
    if (!definition.sign) {
      return value;
    }
    const pos = value.lastIndexOf(".");
    if (pos === -1) {
      throw Boom.badRequest("Missing signature separator");
    }
    const unsigned = value.slice(0, pos);
    const sig = value.slice(pos + 1);
    if (!sig) {
      throw Boom.badRequest("Missing signature");
    }
    const sigParts = sig.split("*");
    if (sigParts.length !== 2) {
      throw Boom.badRequest("Invalid signature format");
    }
    const hmacSalt = sigParts[0];
    const hmac = sigParts[1];
    const macOptions = Hoek.clone(definition.sign.integrity ?? Iron.defaults.integrity);
    macOptions.salt = hmacSalt;
    const mac = await Iron.hmacWithPassword(definition.sign.password, macOptions, [internals.macPrefix, name, unsigned].join("\n"));
    if (!Cryptiles.fixedTimeComparison(mac.digest, hmac)) {
      throw Boom.badRequest("Invalid hmac value");
    }
    return unsigned;
  };
  internals.decode = async function(value, definition) {
    if (!value && definition.encoding === "form") {
      return {};
    }
    Hoek.assert(typeof value === "string", "Invalid string");
    if (definition.encoding === "iron") {
      return await Iron.unseal(value, definition.password, definition.iron ?? Iron.defaults);
    }
    if (definition.encoding === "base64json") {
      const decoded = Buffer.from(value, "base64").toString("binary");
      try {
        return Bourne.parse(decoded);
      } catch (err) {
        throw Boom.badRequest("Invalid JSON payload");
      }
    }
    if (definition.encoding === "base64") {
      return Buffer.from(value, "base64").toString("binary");
    }
    return Querystring.parse(value);
  };
  exports.prepareValue = async function(name, value, options) {
    Hoek.assert(options && typeof options === "object", "Missing or invalid options");
    try {
      const encoded = await internals.encode(value, options);
      const signed = await internals.sign(name, encoded, options.sign);
      return signed;
    } catch (err) {
      throw Boom.badImplementation("Failed to encode cookie (" + name + ") value: " + err.message);
    }
  };
  internals.encode = function(value, options) {
    if (value === undefined || options.encoding === "none") {
      return value;
    }
    if (options.encoding === "iron") {
      return Iron.seal(value, options.password, options.iron ?? Iron.defaults);
    }
    if (options.encoding === "base64") {
      return Buffer.from(value, "binary").toString("base64");
    }
    if (options.encoding === "base64json") {
      const stringified = JSON.stringify(value);
      return Buffer.from(stringified, "binary").toString("base64");
    }
    return Querystring.stringify(value);
  };
  internals.sign = async function(name, value, options) {
    if (value === undefined || !options) {
      return value;
    }
    const mac = await Iron.hmacWithPassword(options.password, options.integrity ?? Iron.defaults.integrity, [internals.macPrefix, name, value].join("\n"));
    const signed = value + "." + mac.salt + "*" + mac.digest;
    return signed;
  };
  exports.exclude = function(cookies, excludes) {
    let result = "";
    const verify = cookies.replace(internals.pairsRx, ($0, $1, $2) => {
      if (excludes.indexOf($1) === -1) {
        result = result + (result ? ";" : "") + $1 + "=" + $2;
      }
      return "";
    });
    return verify === "" ? result : Boom.badRequest("Invalid cookie header");
  };
});

// node_modules/@hapi/content/lib/index.js
var require_lib20 = __commonJS((exports) => {
  var Boom = require_lib6();
  var internals = {};
  internals.contentTypeRegex = /^([^\/\s]+\/[^\s;]+)(.*)?$/;
  internals.charsetParamRegex = /;\s*charset=(?:"([^"]+)"|([^;"\s]+))/i;
  internals.boundaryParamRegex = /;\s*boundary=(?:"([^"]+)"|([^;"\s]+))/i;
  exports.type = function(header) {
    if (!header) {
      throw Boom.badRequest("Invalid content-type header");
    }
    const match = header.match(internals.contentTypeRegex);
    if (!match) {
      throw Boom.badRequest("Invalid content-type header");
    }
    const result = {
      mime: match[1].toLowerCase()
    };
    const params = match[2];
    if (params) {
      const param = params.match(internals.charsetParamRegex);
      if (param) {
        result.charset = (param[1] || param[2]).toLowerCase();
      }
    }
    if (result.mime.indexOf("multipart/") === 0) {
      if (params) {
        const param = params.match(internals.boundaryParamRegex);
        if (param) {
          result.boundary = param[1] || param[2];
        }
      }
      if (!result.boundary) {
        throw Boom.badRequest("Invalid content-type header: multipart missing boundary");
      }
    }
    return result;
  };
  internals.contentDispositionRegex = /^\s*form-data\s*(?:;\s*(.+))?$/i;
  internals.contentDispositionParamRegex = /([^\=\*\s]+)(\*)?\s*\=\s*(?:([^;'"\s]+\'[\w-]*\'[^;\s]+)|(?:\"([^"]*)\")|([^;\s]*))(?:\s*(?:;\s*)|$)/g;
  exports.disposition = function(header) {
    if (!header) {
      throw Boom.badRequest("Missing content-disposition header");
    }
    const match = header.match(internals.contentDispositionRegex);
    if (!match) {
      throw Boom.badRequest("Invalid content-disposition header format");
    }
    const parameters = match[1];
    if (!parameters) {
      throw Boom.badRequest("Invalid content-disposition header missing parameters");
    }
    const result = {};
    parameters.replace(internals.contentDispositionParamRegex, ($0, $1, $2, $3, $4, $5) => {
      if ($1 === "__proto__") {
        throw Boom.badRequest("Invalid content-disposition header format includes invalid parameters");
      }
      let value;
      if ($2) {
        if (!$3) {
          throw Boom.badRequest("Invalid content-disposition header format includes invalid parameters");
        }
        try {
          value = decodeURIComponent($3.split("\'")[2]);
        } catch (err) {
          throw Boom.badRequest("Invalid content-disposition header format includes invalid parameters");
        }
      } else {
        value = $4 || $5 || "";
      }
      if ($1 === "name" && value === "__proto__") {
        throw Boom.badRequest("Invalid content-disposition header format includes invalid parameters");
      }
      result[$1] = value;
    });
    if (!result.name) {
      throw Boom.badRequest("Invalid content-disposition header missing name parameter");
    }
    return result;
  };
});

// node_modules/@hapi/file/lib/index.js
var require_lib21 = __commonJS((exports) => {
  var Crypto = __require("crypto");
  var Path = __require("path");
  exports.uniqueFilename = function(path, extension) {
    if (extension) {
      extension = extension[0] !== "." ? "." + extension : extension;
    } else {
      extension = "";
    }
    path = Path.resolve(path);
    const name = [Date.now(), process.pid, Crypto.randomBytes(8).toString("hex")].join("-") + extension;
    return Path.join(path, name);
  };
});

// node_modules/@hapi/vise/lib/index.js
var require_lib22 = __commonJS((exports) => {
  var Hoek = require_lib();
  exports.Vise = class Vise {
    constructor(chunks) {
      this.length = 0;
      this._chunks = [];
      this._offset = 0;
      if (chunks) {
        chunks = [].concat(chunks);
        for (let i = 0;i < chunks.length; ++i) {
          this.push(chunks[i]);
        }
      }
    }
    push(chunk) {
      Hoek.assert(Buffer.isBuffer(chunk), "Chunk must be a buffer");
      const item = {
        data: chunk,
        length: chunk.length,
        offset: this.length + this._offset,
        index: this._chunks.length
      };
      this._chunks.push(item);
      this.length += chunk.length;
    }
    shift(length) {
      if (!length) {
        return [];
      }
      const prevOffset = this._offset;
      const item = this.#chunkAt(length);
      let dropTo = this._chunks.length;
      this._offset = 0;
      if (item) {
        dropTo = item.chunk.index;
        this._offset = item.offset;
      }
      const chunks = [];
      for (let i = 0;i < dropTo; ++i) {
        const chunk = this._chunks.shift();
        if (i === 0 && prevOffset) {
          chunks.push(chunk.data.slice(prevOffset));
        } else {
          chunks.push(chunk.data);
        }
      }
      if (this._offset) {
        chunks.push(item.chunk.data.slice(dropTo ? 0 : prevOffset, this._offset));
      }
      this.length = 0;
      for (let i = 0;i < this._chunks.length; ++i) {
        const chunk = this._chunks[i];
        chunk.offset = this.length, chunk.index = i;
        this.length += chunk.length;
      }
      this.length -= this._offset;
      return chunks;
    }
    readUInt8(pos) {
      const item = this.#chunkAt(pos);
      return item ? item.chunk.data[item.offset] : undefined;
    }
    at(pos) {
      return this.readUInt8(pos);
    }
    #chunkAt(pos) {
      if (pos < 0) {
        return null;
      }
      pos = pos + this._offset;
      for (let i = 0;i < this._chunks.length; ++i) {
        const chunk = this._chunks[i];
        const offset = pos - chunk.offset;
        if (offset < chunk.length) {
          return { chunk, offset };
        }
      }
      return null;
    }
    chunks() {
      const chunks = [];
      for (let i = 0;i < this._chunks.length; ++i) {
        const chunk = this._chunks[i];
        if (i === 0 && this._offset) {
          chunks.push(chunk.data.slice(this._offset));
        } else {
          chunks.push(chunk.data);
        }
      }
      return chunks;
    }
    startsWith(value, pos, length) {
      pos = pos ?? 0;
      length = length ? Math.min(value.length, length) : value.length;
      if (pos + length > this.length) {
        return false;
      }
      const start = this.#chunkAt(pos);
      if (!start) {
        return false;
      }
      let j = start.chunk.index;
      for (let i = 0;j < this._chunks.length && i < length; ++j) {
        const chunk = this._chunks[j];
        let k = j === start.chunk.index ? start.offset : 0;
        for (;k < chunk.length && i < length; ++k, ++i) {
          if (chunk.data[k] !== value[i]) {
            return false;
          }
        }
      }
      return true;
    }
  };
});

// node_modules/@hapi/nigel/lib/index.js
var require_lib23 = __commonJS((exports) => {
  var Stream = __require("stream");
  var Hoek = require_lib();
  var { Vise } = require_lib22();
  var internals = {};
  exports.compile = function(needle) {
    Hoek.assert(needle?.length, "Missing needle");
    Hoek.assert(Buffer.isBuffer(needle), "Needle must be a buffer");
    const profile = {
      value: needle,
      lastPos: needle.length - 1,
      last: needle[needle.length - 1],
      length: needle.length,
      badCharShift: Buffer.alloc(256)
    };
    for (let i = 0;i < 256; ++i) {
      profile.badCharShift[i] = profile.length;
    }
    const last = profile.length - 1;
    for (let i = 0;i < last; ++i) {
      profile.badCharShift[profile.value[i]] = last - i;
    }
    return profile;
  };
  exports.horspool = function(haystack, needle, start) {
    Hoek.assert(haystack, "Missing haystack");
    needle = needle.badCharShift ? needle : exports.compile(needle);
    start = start ?? 0;
    for (let i = start;i <= haystack.length - needle.length; ) {
      const lastChar = haystack.readUInt8(i + needle.lastPos);
      if (lastChar === needle.last && internals.startsWith(haystack, needle, i)) {
        return i;
      }
      i += needle.badCharShift[lastChar];
    }
    return -1;
  };
  internals.startsWith = function(haystack, needle, pos) {
    if (haystack.startsWith) {
      return haystack.startsWith(needle.value, pos, needle.lastPos);
    }
    for (let i = 0;i < needle.lastPos; ++i) {
      if (needle.value[i] !== haystack.readUInt8(pos + i)) {
        return false;
      }
    }
    return true;
  };
  exports.all = function(haystack, needle, start) {
    needle = exports.compile(needle);
    start = start ?? 0;
    const matches = [];
    for (let i = start;i !== -1 && i < haystack.length; ) {
      i = exports.horspool(haystack, needle, i);
      if (i !== -1) {
        matches.push(i);
        i += needle.length;
      }
    }
    return matches;
  };
  internals._indexOf = function(haystack, needle) {
    Hoek.assert(haystack, "Missing haystack");
    for (let i = 0;i <= haystack.length - needle.length; ++i) {
      if (haystack.startsWith(needle.value, i)) {
        return i;
      }
    }
    return -1;
  };
  exports.Stream = class extends Stream.Writable {
    constructor(needle) {
      super();
      this.needle(needle);
      this._haystack = new Vise;
      this._indexOf = this._needle.length > 2 ? exports.horspool : internals._indexOf;
      this.on("finish", () => {
        const chunks = this._haystack.chunks();
        for (let i = 0;i < chunks.length; ++i) {
          this.emit("haystack", chunks[i]);
        }
      });
    }
    needle(needle) {
      this._needle = exports.compile(needle);
    }
    _write(chunk, encoding, next) {
      this._haystack.push(chunk);
      let match = this._indexOf(this._haystack, this._needle);
      if (match === -1 && chunk.length >= this._needle.length) {
        this._flush(this._haystack.length - chunk.length);
      }
      while (match !== -1) {
        this._flush(match);
        this._haystack.shift(this._needle.length);
        this.emit("needle");
        match = this._indexOf(this._haystack, this._needle);
      }
      if (this._haystack.length) {
        const notChecked = this._haystack.length - this._needle.length + 1;
        let i = notChecked;
        for (;i < this._haystack.length; ++i) {
          if (this._haystack.startsWith(this._needle.value, i, this._haystack.length - i)) {
            break;
          }
        }
        this._flush(i);
      }
      return next();
    }
    _flush(pos) {
      const chunks = this._haystack.shift(pos);
      for (let i = 0;i < chunks.length; ++i) {
        this.emit("haystack", chunks[i]);
      }
    }
    flush() {
      const chunks = this._haystack.shift(this._haystack.length);
      for (let i = 0;i < chunks.length; ++i) {
        this.emit("haystack", chunks[i]);
      }
    }
  };
});

// node_modules/@hapi/pez/lib/index.js
var require_lib24 = __commonJS((exports) => {
  var Stream = __require("stream");
  var B64 = require_lib17();
  var Boom = require_lib6();
  var Content = require_lib20();
  var Hoek = require_lib();
  var Nigel = require_lib23();
  var internals = {};
  internals.state = {
    preamble: 0,
    boundary: 1,
    header: 2,
    payload: 3,
    epilogue: 4
  };
  internals.defaults = {
    maxBytes: Infinity,
    maxParts: Infinity
  };
  exports.Dispenser = class extends Stream.Writable {
    constructor(options) {
      super({ autoDestroy: false });
      Hoek.assert(options !== null && typeof options === "object", "options must be an object");
      const settings = Hoek.applyToDefaults(internals.defaults, options);
      this._boundary = settings.boundary;
      this._state = internals.state.preamble;
      this._held = "";
      this._stream = null;
      this._headers = {};
      this._name = "";
      this._pendingHeader = "";
      this._error = null;
      this._bytesCount = 0;
      this._partsCount = 0;
      this._maxBytes = settings.maxBytes;
      this._maxParts = settings.maxParts;
      this._parts = new Nigel.Stream(Buffer.from("--" + settings.boundary));
      this._lines = new Nigel.Stream(Buffer.from("\r\n"));
      this._parts.on("needle", () => this.#onPartEnd());
      this._parts.on("haystack", (chunk) => this.#onPart(chunk));
      this._lines.on("needle", () => this.#onLineEnd());
      this._lines.on("haystack", (chunk) => this.#onLine(chunk));
      this.once("finish", () => this._parts.end());
      this._parts.once("close", () => this._lines.end());
      let piper = null;
      let finish = (err) => {
        if (piper) {
          piper.removeListener("data", onReqData);
          piper.removeListener("error", finish);
          piper.removeListener("aborted", onReqAborted);
        }
        if (err) {
          return this.#abort(err);
        }
        this.#emit("close");
      };
      finish = Hoek.once(finish);
      this._lines.once("close", () => {
        if (this._state === internals.state.epilogue) {
          if (this._held) {
            this.#emit("epilogue", this._held);
            this._held = "";
          }
        } else if (this._state === internals.state.boundary) {
          if (!this._held) {
            this.#abort(Boom.badRequest("Missing end boundary"));
          } else if (this._held !== "--") {
            this.#abort(Boom.badRequest("Only white space allowed after boundary at end"));
          }
        } else {
          this.#abort(Boom.badRequest("Incomplete multipart payload"));
        }
        setImmediate(finish);
      });
      const onReqAborted = () => {
        finish(Boom.badRequest("Client request aborted"));
      };
      const onReqData = (data) => {
        this._bytesCount += Buffer.byteLength(data);
        if (this._bytesCount > this._maxBytes) {
          finish(Boom.entityTooLarge("Maximum size exceeded"));
        }
      };
      this.once("pipe", (req) => {
        piper = req;
        req.on("data", onReqData);
        req.once("error", finish);
        req.once("aborted", onReqAborted);
      });
    }
    _write(buffer, encoding, next) {
      if (this._error) {
        return next();
      }
      this._parts.write(buffer);
      return next();
    }
    #emit(...args) {
      if (this._error) {
        return;
      }
      this.emit(...args);
    }
    #abort(err) {
      this.#emit("error", err);
      this._error = err;
    }
    #onPartEnd() {
      this._lines.flush();
      if (this._state === internals.state.preamble) {
        if (this._held) {
          const last = this._held.length - 1;
          if (this._held[last] !== "\n" || this._held[last - 1] !== "\r") {
            return this.#abort(Boom.badRequest("Preamble missing CRLF terminator"));
          }
          this.#emit("preamble", this._held.slice(0, -2));
          this._held = "";
        }
        this._parts.needle(Buffer.from("\r\n--" + this._boundary));
      } else {
        this._partsCount++;
        if (this._partsCount > this._maxParts) {
          return this.#abort(Boom.badRequest("Maximum parts exceeded"));
        }
      }
      this._state = internals.state.boundary;
      if (this._stream) {
        this._stream.end();
        this._stream = null;
      } else if (this._name) {
        this.#emit("field", this._name, this._held);
        this._name = "";
        this._held = "";
      }
    }
    #onPart(chunk) {
      if (this._state === internals.state.preamble) {
        this._held = this._held + chunk.toString();
      } else if (this._state === internals.state.payload) {
        if (this._stream) {
          this._stream.write(chunk);
        } else {
          this._held = this._held + chunk.toString();
        }
      } else {
        this._lines.write(chunk);
      }
    }
    #onLineEnd() {
      if (this._state === internals.state.boundary) {
        if (this._held) {
          this._held = this._held.replace(/[\t ]/g, "");
          if (this._held) {
            if (this._held === "--") {
              this._state = internals.state.epilogue;
              this._held = "";
              return;
            }
            return this.#abort(Boom.badRequest("Only white space allowed after boundary"));
          }
        }
        this._state = internals.state.header;
        return;
      }
      if (this._state === internals.state.header) {
        if (this._held) {
          if (this._held[0] === " " || this._held[0] === "\t") {
            if (!this._pendingHeader) {
              return this.#abort(Boom.badRequest("Invalid header continuation without valid declaration on previous line"));
            }
            this._pendingHeader = this._pendingHeader + " " + this._held.slice(1);
            this._held = "";
            return;
          }
          this.#flushHeader();
          this._pendingHeader = this._held;
          this._held = "";
          return;
        }
        this.#flushHeader();
        this._state = internals.state.payload;
        let disposition;
        try {
          disposition = Content.disposition(this._headers["content-disposition"]);
        } catch (err) {
          return this.#abort(err);
        }
        if (disposition.filename !== undefined) {
          const stream = new Stream.PassThrough;
          const transferEncoding = this._headers["content-transfer-encoding"];
          if (transferEncoding && transferEncoding.toLowerCase() === "base64") {
            this._stream = new B64.Decoder;
            this._stream.pipe(stream);
          } else {
            this._stream = stream;
          }
          stream.name = disposition.name;
          stream.filename = disposition.filename;
          stream.headers = this._headers;
          this._headers = {};
          this.#emit("part", stream);
        } else {
          this._name = disposition.name;
        }
        this._lines.flush();
        return;
      }
      this._held = this._held + "\r\n";
    }
    #onLine(chunk) {
      if (this._stream) {
        this._stream.write(chunk);
      } else {
        this._held = this._held + chunk.toString();
      }
    }
    #flushHeader() {
      if (!this._pendingHeader) {
        return;
      }
      const sep = this._pendingHeader.indexOf(":");
      if (sep === -1) {
        return this.#abort(Boom.badRequest("Invalid header missing colon separator"));
      }
      if (!sep) {
        return this.#abort(Boom.badRequest("Invalid header missing field name"));
      }
      const name = this._pendingHeader.slice(0, sep).toLowerCase();
      if (name === "__proto__") {
        return this.#abort(Boom.badRequest("Invalid header"));
      }
      this._headers[name] = this._pendingHeader.slice(sep + 1).trim();
      this._pendingHeader = "";
    }
  };
});

// node_modules/@hapi/wreck/lib/payload.js
var require_payload = __commonJS((exports, module) => {
  var Stream = __require("stream");
  var internals = {};
  module.exports = internals.Payload = class extends Stream.Readable {
    constructor(payload, encoding) {
      super();
      const data = [].concat(payload || "");
      let size = 0;
      for (let i = 0;i < data.length; ++i) {
        const chunk = data[i];
        size = size + chunk.length;
        data[i] = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      }
      this._data = Buffer.concat(data, size);
      this._position = 0;
      this._encoding = encoding || "utf8";
    }
    _read(size) {
      const chunk = this._data.slice(this._position, this._position + size);
      this.push(chunk, this._encoding);
      this._position = this._position + chunk.length;
      if (this._position >= this._data.length) {
        this.push(null);
      }
    }
  };
});

// node_modules/@hapi/wreck/lib/recorder.js
var require_recorder = __commonJS((exports, module) => {
  var Stream = __require("stream");
  var Boom = require_lib6();
  var internals = {};
  module.exports = internals.Recorder = class extends Stream.Writable {
    constructor(options) {
      super();
      this.settings = options;
      this.buffers = [];
      this.length = 0;
    }
    _write(chunk, encoding, next) {
      if (this.settings.maxBytes && this.length + chunk.length > this.settings.maxBytes) {
        return this.emit("error", Boom.entityTooLarge("Payload content length greater than maximum allowed: " + this.settings.maxBytes));
      }
      this.length = this.length + chunk.length;
      this.buffers.push(chunk);
      next();
    }
    collect() {
      const buffer = this.buffers.length === 0 ? Buffer.alloc(0) : this.buffers.length === 1 ? this.buffers[0] : Buffer.concat(this.buffers, this.length);
      return buffer;
    }
  };
});

// node_modules/@hapi/wreck/lib/tap.js
var require_tap = __commonJS((exports, module) => {
  var Stream = __require("stream");
  var Payload = require_payload();
  var internals = {};
  module.exports = internals.Tap = class extends Stream.Transform {
    constructor() {
      super();
      this.buffers = [];
    }
    _transform(chunk, encoding, next) {
      this.buffers.push(chunk);
      next(null, chunk);
    }
    collect() {
      return new Payload(this.buffers);
    }
  };
});

// node_modules/@hapi/wreck/lib/index.js
var require_lib25 = __commonJS((exports, module) => {
  var Events = __require("events");
  var Http = __require("http");
  var Https = __require("https");
  var Stream = __require("stream");
  var Url = __require("url");
  var Zlib = __require("zlib");
  var Boom = require_lib6();
  var Bourne = require_lib15();
  var Hoek = require_lib();
  var Payload = require_payload();
  var Recorder = require_recorder();
  var Tap = require_tap();
  var internals = {
    jsonRegex: /^application\/([a-z0-9.]*[+-]json|json)$/,
    shallowOptions: ["agent", "agents", "beforeRedirect", "payload", "redirected"],
    httpOptions: ["secureProtocol", "ciphers", "lookup", "family", "hints"]
  };
  internals.Client = class {
    constructor(options = {}) {
      Hoek.assert(!options.agents || options.agents.https && options.agents.http && options.agents.httpsAllowUnauthorized, 'Option agents must include "http", "https", and "httpsAllowUnauthorized"');
      this._defaults = Hoek.clone(options, { shallow: internals.shallowOptions });
      this.agents = this._defaults.agents || {
        https: new Https.Agent({ maxSockets: Infinity }),
        http: new Http.Agent({ maxSockets: Infinity }),
        httpsAllowUnauthorized: new Https.Agent({ maxSockets: Infinity, rejectUnauthorized: false })
      };
      if (this._defaults.events) {
        this.events = new Events.EventEmitter;
      }
    }
    defaults(options) {
      Hoek.assert(options && typeof options === "object", "options must be provided to defaults");
      options = Hoek.applyToDefaults(this._defaults, options, { shallow: internals.shallowOptions });
      return new internals.Client(options);
    }
    request(method, url, options = {}) {
      try {
        options = Hoek.applyToDefaults(this._defaults, options, { shallow: internals.shallowOptions });
        Hoek.assert(options.payload === undefined || typeof options.payload === "string" || typeof options.payload === "object", "options.payload must be a string, a Buffer, a Stream, or an Object");
        Hoek.assert(internals.isNullOrUndefined(options.agent) || typeof options.rejectUnauthorized !== "boolean", "options.agent cannot be set to an Agent at the same time as options.rejectUnauthorized is set");
        Hoek.assert(internals.isNullOrUndefined(options.beforeRedirect) || typeof options.beforeRedirect === "function", "options.beforeRedirect must be a function");
        Hoek.assert(internals.isNullOrUndefined(options.redirected) || typeof options.redirected === "function", "options.redirected must be a function");
        Hoek.assert(options.gunzip === undefined || typeof options.gunzip === "boolean" || options.gunzip === "force", 'options.gunzip must be a boolean or "force"');
      } catch (err) {
        return Promise.reject(err);
      }
      if (options.baseUrl) {
        url = internals.resolveUrl(options.baseUrl, url);
        delete options.baseUrl;
      }
      const relay = {};
      const req = this._request(method, url, options, relay);
      const promise = new Promise((resolve, reject) => {
        relay.callback = (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
          return;
        };
      });
      promise.req = req;
      return promise;
    }
    _request(method, url, options, relay, _trace) {
      const uri = {};
      if (options.socketPath) {
        uri.socketPath = options.socketPath;
        const parsedUri = new Url.URL(url, `unix://${options.socketPath}`);
        internals.applyUrlToOptions(uri, {
          host: "",
          protocol: "http:",
          hash: parsedUri.hash,
          search: parsedUri.search,
          searchParams: parsedUri.searchParams,
          pathname: parsedUri.pathname,
          href: parsedUri.href
        });
      } else {
        uri.setHost = false;
        const parsedUri = new Url.URL(url);
        internals.applyUrlToOptions(uri, parsedUri);
      }
      uri.method = method.toUpperCase();
      uri.headers = Object.create(null);
      const usedHeaders = new Set;
      if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
          if (value !== undefined) {
            uri.headers[key] = value;
            usedHeaders.add(key.toLowerCase());
          }
        }
      }
      if (!usedHeaders.has("host")) {
        uri.headers.host = uri.host;
      }
      if (options.payload && typeof options.payload === "object" && !(options.payload instanceof Stream) && !Buffer.isBuffer(options.payload)) {
        options.payload = JSON.stringify(options.payload);
        if (!usedHeaders.has("content-type")) {
          uri.headers["content-type"] = "application/json";
        }
      }
      if (options.gunzip && !usedHeaders.has("accept-encoding")) {
        uri.headers["accept-encoding"] = "gzip";
      }
      const payloadSupported = uri.method !== "GET" && uri.method !== "HEAD" && !internals.isNullOrUndefined(options.payload);
      if (payloadSupported && (typeof options.payload === "string" || Buffer.isBuffer(options.payload)) && !usedHeaders.has("content-length")) {
        uri.headers["content-length"] = Buffer.isBuffer(options.payload) ? options.payload.length : Buffer.byteLength(options.payload);
      }
      let redirects = options.hasOwnProperty("redirects") ? options.redirects : false;
      _trace = _trace ?? [];
      _trace.push({ method: uri.method, url });
      const client = uri.protocol === "https:" ? Https : Http;
      for (const option of internals.httpOptions) {
        if (options[option] !== undefined) {
          uri[option] = options[option];
        }
      }
      if (options.rejectUnauthorized !== undefined && uri.protocol === "https:") {
        uri.agent = options.rejectUnauthorized ? this.agents.https : this.agents.httpsAllowUnauthorized;
      } else if (options.agent || options.agent === false) {
        uri.agent = options.agent;
      } else {
        uri.agent = uri.protocol === "https:" ? this.agents.https : this.agents.http;
      }
      this._emit("preRequest", uri, options);
      const start = Date.now();
      const req = client.request(uri);
      this._emit("request", req);
      let shadow = null;
      let timeoutId;
      const onError = (err) => {
        err.trace = _trace;
        return finishOnce(Boom.badGateway("Client request error", err));
      };
      const onAbort = () => {
        if (!req.socket) {
          const error = new Error("socket hang up");
          error.code = "ECONNRESET";
          finishOnce(error);
        }
      };
      req.once("error", onError);
      const onResponse = (res) => {
        const statusCode = res.statusCode;
        const redirectMethod = internals.redirectMethod(statusCode, uri.method, options);
        if (redirects === false || !redirectMethod) {
          return finishOnce(null, res);
        }
        res.destroy();
        if (redirects === 0) {
          return finishOnce(Boom.badGateway("Maximum redirections reached", _trace));
        }
        let location = res.headers.location;
        if (!location) {
          return finishOnce(Boom.badGateway("Received redirection without location", _trace));
        }
        if (!/^https?:/i.test(location)) {
          location = Url.resolve(uri.href, location);
        }
        const redirectOptions = Hoek.clone(options, { shallow: internals.shallowOptions });
        redirectOptions.payload = shadow ?? options.payload;
        redirectOptions.redirects = --redirects;
        if (timeoutId) {
          clearTimeout(timeoutId);
          const elapsed = Date.now() - start;
          redirectOptions.timeout = (redirectOptions.timeout - elapsed).toString();
        }
        if (redirectOptions.headers) {
          const parsedLocation = new URL(location);
          if (uri.hostname !== parsedLocation.hostname) {
            for (const header of Object.keys(redirectOptions.headers)) {
              const lowerHeader = header.toLowerCase();
              if (lowerHeader === "authorization" || lowerHeader === "cookie") {
                delete redirectOptions.headers[header];
              }
            }
          }
        }
        const followRedirect = (err) => {
          if (err) {
            err.trace = _trace;
            return finishOnce(Boom.badGateway("Invalid redirect", err));
          }
          const redirectReq = this._request(redirectMethod, location, redirectOptions, { callback: finishOnce }, _trace);
          if (options.redirected) {
            options.redirected(statusCode, location, redirectReq);
          }
        };
        if (!options.beforeRedirect) {
          return followRedirect();
        }
        return options.beforeRedirect(redirectMethod, statusCode, location, res.headers, redirectOptions, followRedirect);
      };
      const finish = (err, res) => {
        if (err) {
          req.abort();
        }
        req.removeListener("response", onResponse);
        req.removeListener("error", onError);
        req.removeListener("abort", onAbort);
        req.on("error", Hoek.ignore);
        clearTimeout(timeoutId);
        this._emit("response", err, { req, res, start, uri });
        return relay.callback(err, res);
      };
      const finishOnce = Hoek.once(finish);
      req.once("response", onResponse);
      if (options.timeout) {
        timeoutId = setTimeout(() => finishOnce(Boom.gatewayTimeout("Client request timeout")), options.timeout);
      }
      req.on("abort", onAbort);
      if (payloadSupported) {
        if (options.payload instanceof Stream) {
          let stream = options.payload;
          if (redirects) {
            const collector = new Tap;
            collector.once("finish", () => {
              shadow = collector.collect();
            });
            stream = options.payload.pipe(collector);
          }
          internals.deferPipeUntilSocketConnects(req, stream);
          return req;
        }
        req.write(options.payload);
      }
      req.end();
      return req;
    }
    _emit(...args) {
      if (this.events) {
        this.events.emit(...args);
      }
    }
    read(res, options = {}) {
      return new Promise((resolve, reject) => {
        this._read(res, options, (err, payload) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(payload);
          return;
        });
      });
    }
    _read(res, options, callback) {
      options = Hoek.applyToDefaults(this._defaults, options, { shallow: internals.shallowOptions });
      let clientTimeoutId = null;
      const finish = (err, buffer) => {
        clearTimeout(clientTimeoutId);
        reader.removeListener("error", onReaderError);
        reader.removeListener("finish", onReaderFinish);
        res.removeListener("error", onResError);
        res.removeListener("close", onResAborted);
        res.removeListener("aborted", onResAborted);
        res.on("error", Hoek.ignore);
        if (err) {
          return callback(err);
        }
        if (!options.json) {
          return callback(null, buffer);
        }
        if (options.json === "force") {
          return internals.tryParseBuffer(buffer, callback);
        }
        const contentType = res.headers?.["content-type"] ?? "";
        const mime = contentType.split(";")[0].trim().toLowerCase();
        if (!internals.jsonRegex.test(mime)) {
          if (options.json === "strict") {
            return callback(Boom.notAcceptable("The content-type is not JSON compatible"));
          }
          return callback(null, buffer);
        }
        return internals.tryParseBuffer(buffer, callback);
      };
      const finishOnce = Hoek.once(finish);
      const clientTimeout = options.timeout;
      if (clientTimeout && clientTimeout > 0) {
        clientTimeoutId = setTimeout(() => finishOnce(Boom.clientTimeout()), clientTimeout);
      }
      const onResError = (err) => {
        return finishOnce(err.isBoom ? err : Boom.internal("Payload stream error", err));
      };
      const onResAborted = () => {
        if (!res.complete) {
          finishOnce(Boom.internal("Payload stream closed prematurely"));
        }
      };
      res.once("error", onResError);
      res.once("close", onResAborted);
      res.once("aborted", onResAborted);
      const reader = new Recorder({ maxBytes: options.maxBytes });
      const onReaderError = (err) => {
        if (res.destroy) {
          res.destroy();
        }
        return finishOnce(err);
      };
      reader.once("error", onReaderError);
      const onReaderFinish = () => {
        return finishOnce(null, reader.collect());
      };
      reader.once("finish", onReaderFinish);
      if (options.gunzip) {
        const contentEncoding = options.gunzip === "force" ? "gzip" : res.headers?.["content-encoding"] ?? "";
        if (/^(x-)?gzip(\s*,\s*identity)?$/.test(contentEncoding)) {
          const gunzip = Zlib.createGunzip();
          gunzip.once("error", onReaderError);
          res.pipe(gunzip).pipe(reader);
          return;
        }
      }
      res.pipe(reader);
    }
    toReadableStream(payload, encoding) {
      return new Payload(payload, encoding);
    }
    parseCacheControl(field) {
      const regex = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;
      const header = {};
      const error = field.replace(regex, ($0, $1, $2, $3) => {
        const value = $2 || $3;
        header[$1] = value ? value.toLowerCase() : true;
        return "";
      });
      if (header["max-age"]) {
        try {
          const maxAge = parseInt(header["max-age"], 10);
          if (isNaN(maxAge)) {
            return null;
          }
          header["max-age"] = maxAge;
        } catch (err) {
        }
      }
      return error ? null : header;
    }
    get(uri, options) {
      return this._shortcut("GET", uri, options);
    }
    post(uri, options) {
      return this._shortcut("POST", uri, options);
    }
    patch(uri, options) {
      return this._shortcut("PATCH", uri, options);
    }
    put(uri, options) {
      return this._shortcut("PUT", uri, options);
    }
    delete(uri, options) {
      return this._shortcut("DELETE", uri, options);
    }
    async _shortcut(method, uri, options = {}) {
      const res = await this.request(method, uri, options);
      let payload;
      try {
        payload = await this.read(res, options);
      } catch (err) {
        err.data = err.data ?? {};
        err.data.res = res;
        throw err;
      }
      if (res.statusCode < 400) {
        return { res, payload };
      }
      const data = {
        isResponseError: true,
        headers: res.headers,
        res,
        payload
      };
      throw new Boom.Boom(`Response Error: ${res.statusCode} ${res.statusMessage}`, { statusCode: res.statusCode, data });
    }
  };
  internals.resolveUrl = function(baseUrl, path) {
    if (!path) {
      return baseUrl;
    }
    const url = new Url.URL(path, baseUrl);
    return Url.format(url);
  };
  internals.deferPipeUntilSocketConnects = function(req, stream) {
    const onSocket = (socket) => {
      if (!socket.connecting) {
        return onSocketConnect();
      }
      socket.once("connect", onSocketConnect);
    };
    const onSocketConnect = () => {
      stream.pipe(req);
      stream.removeListener("error", onStreamError);
    };
    const onStreamError = (err) => {
      req.emit("error", err);
    };
    req.once("socket", onSocket);
    stream.on("error", onStreamError);
  };
  internals.redirectMethod = function(code, method, options) {
    switch (code) {
      case 301:
      case 302:
        return options.redirectMethod || method;
      case 303:
        if (options.redirect303) {
          return "GET";
        }
        break;
      case 307:
      case 308:
        return method;
    }
    return null;
  };
  internals.tryParseBuffer = function(buffer, next) {
    if (buffer.length === 0) {
      return next(null, null);
    }
    let payload;
    try {
      payload = Bourne.parse(buffer.toString());
    } catch (err) {
      return next(Boom.badGateway(err.message, { payload: buffer }));
    }
    return next(null, payload);
  };
  internals.applyUrlToOptions = (options, url) => {
    options.host = url.host;
    options.origin = url.origin;
    options.searchParams = url.searchParams;
    options.protocol = url.protocol;
    options.hostname = typeof url.hostname === "string" && url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname;
    options.hash = url.hash;
    options.search = url.search;
    options.pathname = url.pathname;
    options.path = `${url.pathname}${url.search}`;
    options.href = url.href;
    if (url.port !== "") {
      options.port = Number(url.port);
    }
    if (url.username || url.password) {
      options.auth = `${url.username}:${url.password}`;
      options.username = url.username;
      options.password = url.password;
    }
    return options;
  };
  internals.isNullOrUndefined = (val) => [null, undefined].includes(val);
  module.exports = new internals.Client;
});

// node_modules/@hapi/subtext/lib/index.js
var require_lib26 = __commonJS((exports) => {
  var Fs = __require("fs");
  var Fsp = __require("fs/promises");
  var Os = __require("os");
  var Querystring = __require("querystring");
  var Stream = __require("stream");
  var Zlib = __require("zlib");
  var Boom = require_lib6();
  var Bourne = require_lib15();
  var Content = require_lib20();
  var File = require_lib21();
  var Hoek = require_lib();
  var Pez = require_lib24();
  var Wreck = require_lib25();
  var internals = {
    kSubtext: Symbol("subtext"),
    decoders: {
      gzip: (options) => Zlib.createGunzip(options),
      deflate: (options) => Zlib.createInflate(options)
    }
  };
  exports.parse = async function(req, tap, options) {
    Hoek.assert(options, "Missing options");
    Hoek.assert(options.parse !== undefined, "Missing parse option setting");
    Hoek.assert(options.output !== undefined, "Missing output option setting");
    const contentLength = req.headers["content-length"];
    if (options.maxBytes !== undefined && contentLength && parseInt(contentLength, 10) > options.maxBytes) {
      throw Boom.entityTooLarge("Payload content length greater than maximum allowed: " + options.maxBytes);
    }
    const contentType = Content.type(options.override || req.headers["content-type"] || options.defaultContentType || "application/octet-stream");
    try {
      if (options.allow && options.allow.indexOf(contentType.mime) === -1) {
        throw Boom.unsupportedMediaType();
      }
      const parsed = { mime: contentType.mime };
      if (options.parse === true) {
        parsed.payload = await internals.parse(req, tap, options, contentType);
        return parsed;
      }
      parsed.payload = await internals.raw(req, tap, options);
      return parsed;
    } catch (err) {
      err.mime = contentType.mime;
      throw err;
    }
  };
  internals.parse = async function(req, tap, options, contentType) {
    const output = options.output;
    let source = internals.decoder(req, options);
    if (tap) {
      [source] = internals.pipe(source, tap);
    }
    if (contentType.mime === "multipart/form-data") {
      if (options.multipart === false) {
        throw Boom.unsupportedMediaType();
      }
      return await internals.multipart(req, options, source, contentType);
    }
    if (output === "stream") {
      return source;
    }
    if (output === "file") {
      const file = await internals.writeFile(req, options, source);
      return file.item;
    }
    const payload = await Wreck.read(source, { timeout: options.timeout, maxBytes: options.maxBytes });
    return internals.object(options, payload, contentType.mime);
  };
  internals.decoder = function(source, options) {
    const contentEncoding = source.headers["content-encoding"];
    const decoders = options.decoders ?? internals.decoders;
    if (!decoders.hasOwnProperty(contentEncoding)) {
      return source;
    }
    const decoderOptions = options.compression?.[contentEncoding] ?? null;
    const stream = decoders[contentEncoding](decoderOptions);
    const orig = stream.emit;
    stream.emit = (event, ...args) => {
      if (event === "error") {
        args = [Boom.badRequest("Invalid compressed payload", args[0])];
      }
      return orig.call(stream, event, ...args);
    };
    [source] = internals.pipe(source, stream);
    return source;
  };
  internals.raw = async function(req, tap, options) {
    const output = options.output;
    let source = req;
    if (options.parse === "gunzip") {
      source = internals.decoder(source, options);
    }
    if (tap) {
      [source] = internals.pipe(source, tap);
    }
    if (output === "stream") {
      return source;
    }
    if (output === "file") {
      const file = await internals.writeFile(req, options, source);
      return file.item;
    }
    return await Wreck.read(source, { timeout: options.timeout, maxBytes: options.maxBytes });
  };
  internals.object = function(options, payload, mime) {
    if (mime === "application/octet-stream") {
      return payload.length ? payload : null;
    }
    if (mime.match(/^text\/.+$/)) {
      return payload.toString("utf8");
    }
    if (/^application\/(?:.+\+)?json$/.test(mime)) {
      if (!payload.length) {
        return null;
      }
      try {
        return Bourne.parse(payload.toString("utf8"), { protoAction: options.protoAction });
      } catch (err) {
        const error2 = Boom.badRequest("Invalid request payload JSON format", err);
        error2.raw = payload;
        throw error2;
      }
    }
    if (mime === "application/x-www-form-urlencoded") {
      const parse = options.querystring ?? Querystring.parse;
      return payload.length ? parse(payload.toString("utf8")) : {};
    }
    const error = Boom.unsupportedMediaType();
    error.raw = payload;
    throw error;
  };
  internals.multipart = function(req, options, source, contentType) {
    return new Promise((resolve, reject) => {
      const clientTimeout = options.timeout;
      const clientTimeoutId = clientTimeout ? setTimeout(() => reject(Boom.clientTimeout()), clientTimeout) : null;
      const dispenserOptions = Hoek.applyToDefaults(contentType, {
        maxBytes: options.maxBytes,
        maxParts: options.maxParts
      });
      const dispenser = new Pez.Dispenser(dispenserOptions);
      const data = {};
      const pendingFiles = [];
      const onError = (err) => {
        const cleanup = internals.cleanupFiles(pendingFiles);
        cleanup.catch(Hoek.ignore);
        reject(Boom.badRequest("Invalid multipart payload format", err));
      };
      dispenser.once("error", onError);
      const set = (name, value) => {
        if (!data.hasOwnProperty(name)) {
          data[name] = value;
        } else if (Array.isArray(data[name])) {
          data[name].push(value);
        } else {
          data[name] = [data[name], value];
        }
      };
      const finalize = async () => {
        clearTimeout(clientTimeoutId);
        dispenser.removeListener("error", onError);
        dispenser.removeListener("part", onPart);
        dispenser.removeListener("field", onField);
        dispenser.removeListener("close", onClose);
        try {
          const files = await Promise.all(pendingFiles);
          for (const { item, name } of files) {
            set(name, item);
          }
        } catch (err) {
          reject(err);
          return;
        }
        resolve(data);
      };
      const output = typeof options.multipart === "object" ? options.multipart.output : options.output;
      const onPart = (part) => {
        if (output === "file") {
          pendingFiles.push(internals.writeFile(req, options, part));
        } else {
          internals.part(part, output, set, options);
        }
      };
      dispenser.on("part", onPart);
      const onField = (name, value) => set(name, value);
      dispenser.on("field", onField);
      const onClose = () => finalize();
      dispenser.once("close", onClose);
      source.pipe(dispenser);
    });
  };
  internals.writeFile = function(req, options, stream) {
    const promise = new Promise((resolve, reject) => {
      const path = File.uniqueFilename(options.uploads ?? Os.tmpdir());
      const file = Fs.createWriteStream(path, { flags: "wx" });
      const counter = new internals.Counter(options);
      const finalize = (err) => {
        req.removeListener("aborted", onAbort);
        file.removeListener("close", finalize);
        file.removeListener("error", finalize);
        if (err) {
          unpipeStreamToCounter();
          unpipeCounterToFile();
          file.destroy();
          Fs.unlink(path, () => reject(err));
          return;
        }
        const result = {
          item: {
            path,
            bytes: counter.bytes
          }
        };
        if (stream.name) {
          result.name = stream.name;
          result.item.filename = stream.filename;
          result.item.headers = stream.headers;
        }
        resolve(result);
      };
      file.once("close", finalize);
      file.once("error", finalize);
      const onAbort = () => finalize(Boom.badRequest("Client connection aborted"));
      req.once("aborted", onAbort);
      const [, unpipeStreamToCounter] = internals.pipe(stream, counter);
      const [, unpipeCounterToFile] = internals.pipe(counter, file);
    });
    promise.catch(Hoek.ignore);
    return promise;
  };
  internals.cleanupFiles = async (pendingFiles) => {
    const results = await Promise.allSettled(pendingFiles);
    await Promise.all(results.map(async (result) => {
      if (result.value) {
        await Fsp.unlink(result.value.item.path);
      }
    }));
  };
  internals.part = async function(part, output, set, options) {
    const payload = await Wreck.read(part);
    if (output === "stream") {
      const item = Wreck.toReadableStream(payload);
      item.hapi = {
        filename: part.filename,
        headers: part.headers
      };
      return set(part.name, item);
    }
    const ct = part.headers["content-type"] || "";
    const mime = ct.split(";")[0].trim().toLowerCase();
    const annotate = (value) => set(part.name, output === "annotated" ? { filename: part.filename, headers: part.headers, payload: value } : value);
    if (!mime) {
      return annotate(payload);
    }
    if (!payload.length) {
      return annotate({});
    }
    try {
      const object = internals.object(options, payload, mime);
      annotate(object);
    } catch (err) {
      annotate(payload);
    }
  };
  internals.pipe = function(from, to) {
    const forwardError = (err) => {
      unpipe();
      to.emit("error", err);
    };
    const unpipe = () => {
      from.removeListener("error", forwardError);
      return from.unpipe(to);
    };
    from.once("error", forwardError);
    return [from.pipe(to), unpipe];
  };
  internals.Counter = class extends Stream.Transform {
    constructor(options) {
      super();
      this.bytes = 0;
      this._maxBytes = options.maxBytes;
    }
    _transform(chunk, encoding, next) {
      this.bytes = this.bytes + chunk.length;
      if (this._maxBytes !== undefined && this.bytes > this._maxBytes) {
        return next(Boom.entityTooLarge("Payload content length greater than maximum allowed: " + this._maxBytes));
      }
      return next(null, chunk);
    }
  };
});

// node_modules/@hapi/hapi/lib/ext.js
var require_ext = __commonJS((exports, module) => {
  var Hoek = require_lib();
  var Topo = require_lib2();
  var internals = {};
  exports = module.exports = internals.Ext = class {
    type = null;
    nodes = null;
    #core = null;
    #routes = [];
    #topo = new Topo.Sorter;
    constructor(type, core) {
      this.#core = core;
      this.type = type;
    }
    add(event) {
      const methods = [].concat(event.method);
      for (const method of methods) {
        const settings = {
          before: event.options.before,
          after: event.options.after,
          group: event.realm.plugin,
          sort: this.#core.extensionsSeq++
        };
        const node = {
          func: method,
          bind: event.options.bind,
          server: event.server,
          realm: event.realm,
          timeout: event.options.timeout
        };
        this.#topo.add(node, settings);
      }
      this.nodes = this.#topo.nodes;
      for (const route of this.#routes) {
        route.rebuild(event);
      }
    }
    merge(others) {
      const merge = [];
      for (const other of others) {
        merge.push(other.#topo);
      }
      this.#topo.merge(merge);
      this.nodes = this.#topo.nodes.length ? this.#topo.nodes : null;
    }
    subscribe(route) {
      this.#routes.push(route);
    }
    static combine(route, type) {
      const ext = new internals.Ext(type, route._core);
      const events = route.settings.ext[type];
      if (events) {
        for (let event of events) {
          event = Object.assign({}, event);
          Hoek.assert(!event.options.sandbox, "Cannot specify sandbox option for route extension");
          event.realm = route.realm;
          ext.add(event);
        }
      }
      const server = route._core.extensions.route[type];
      const realm = route.realm._extensions[type];
      ext.merge([server, realm]);
      server.subscribe(route);
      realm.subscribe(route);
      return ext;
    }
  };
});

// node_modules/@hapi/hapi/lib/handler.js
var require_handler = __commonJS((exports) => {
  var Hoek = require_lib();
  var internals = {};
  exports.execute = async function(request) {
    if (request._route._prerequisites) {
      for (const set of request._route._prerequisites) {
        const pres = [];
        for (const item of set) {
          pres.push(internals.handler(request, item.method, item));
        }
        const responses = await Promise.all(pres);
        for (const response of responses) {
          if (response !== undefined) {
            return response;
          }
        }
      }
    }
    const result = await internals.handler(request, request.route.settings.handler);
    if (result._takeover || typeof result === "symbol") {
      return result;
    }
    request._setResponse(result);
  };
  internals.handler = async function(request, method, pre) {
    const bind = request.route.settings.bind;
    const realm = request.route.realm;
    let response = await request._core.toolkit.execute(method, request, { bind, realm, continue: "null" });
    if (!pre) {
      if (response.isBoom) {
        request._log(["handler", "error"], response);
        throw response;
      }
      return response;
    }
    if (response.isBoom) {
      response.assign = pre.assign;
      response = await request._core.toolkit.failAction(request, pre.failAction, response, { tags: ["pre", "error"], retain: true });
    }
    if (typeof response === "symbol") {
      return response;
    }
    if (pre.assign) {
      request.pre[pre.assign] = response.isBoom ? response : response.source;
      request.preResponses[pre.assign] = response;
    }
    if (response._takeover) {
      return response;
    }
  };
  exports.defaults = function(method, handler, core) {
    let defaults = null;
    if (typeof handler === "object") {
      const type = Object.keys(handler)[0];
      const serverHandler = core.decorations.handler.get(type);
      Hoek.assert(serverHandler, "Unknown handler:", type);
      if (serverHandler.defaults) {
        defaults = typeof serverHandler.defaults === "function" ? serverHandler.defaults(method) : serverHandler.defaults;
      }
    }
    return defaults ?? {};
  };
  exports.configure = function(handler, route) {
    if (typeof handler === "object") {
      const type = Object.keys(handler)[0];
      const serverHandler = route._core.decorations.handler.get(type);
      Hoek.assert(serverHandler, "Unknown handler:", type);
      return serverHandler(route.public, handler[type]);
    }
    return handler;
  };
  exports.prerequisitesConfig = function(config) {
    if (!config) {
      return null;
    }
    const prerequisites = [];
    for (let pres of config) {
      pres = [].concat(pres);
      const set = [];
      for (let pre of pres) {
        if (typeof pre !== "object") {
          pre = { method: pre };
        }
        const item = {
          method: pre.method,
          assign: pre.assign,
          failAction: pre.failAction ?? "error"
        };
        set.push(item);
      }
      prerequisites.push(set);
    }
    return prerequisites.length ? prerequisites : null;
  };
});

// node_modules/@hapi/hapi/lib/headers.js
var require_headers = __commonJS((exports) => {
  var Stream = __require("stream");
  var Boom = require_lib6();
  var internals = {};
  exports.cache = function(response) {
    const request = response.request;
    if (response.headers["cache-control"]) {
      return;
    }
    const settings = request.route.settings.cache;
    const policy = settings && request._route._cache && (settings._statuses.has(response.statusCode) || response.statusCode === 304 && settings._statuses.has(200));
    if (policy || response.settings.ttl) {
      const ttl = response.settings.ttl !== null ? response.settings.ttl : request._route._cache.ttl();
      const privacy = request.auth.isAuthenticated || response.headers["set-cookie"] ? "private" : settings.privacy ?? "default";
      response._header("cache-control", "max-age=" + Math.floor(ttl / 1000) + ", must-revalidate" + (privacy !== "default" ? ", " + privacy : ""));
    } else if (settings) {
      response._header("cache-control", settings.otherwise);
    }
  };
  exports.content = async function(response) {
    const request = response.request;
    if (response._isPayloadSupported() || request.method === "head") {
      await response._marshal();
      if (typeof response._payload.size === "function") {
        response._header("content-length", response._payload.size(), { override: false });
      }
      if (!response._isPayloadSupported()) {
        response._close();
        response._payload = new internals.Empty;
      }
      exports.type(response);
    } else {
      response._close();
      response._payload = new internals.Empty;
      delete response.headers["content-length"];
    }
  };
  exports.state = async function(response) {
    const request = response.request;
    const states = [];
    for (const stateName in request._states) {
      states.push(request._states[stateName]);
    }
    try {
      for (const name in request._core.states.cookies) {
        const autoValue = request._core.states.cookies[name].autoValue;
        if (!autoValue || name in request._states || name in request.state) {
          continue;
        }
        if (typeof autoValue !== "function") {
          states.push({ name, value: autoValue });
          continue;
        }
        const value = await autoValue(request);
        states.push({ name, value });
      }
      if (!states.length) {
        return;
      }
      let header = await request._core.states.format(states, request);
      const existing = response.headers["set-cookie"];
      if (existing) {
        header = (Array.isArray(existing) ? existing : [existing]).concat(header);
      }
      response._header("set-cookie", header);
    } catch (err) {
      const error = Boom.boomify(err);
      request._log(["state", "response", "error"], error);
      request._states = {};
      throw error;
    }
  };
  exports.type = function(response) {
    const type = response.contentType;
    if (type !== null && type !== response.headers["content-type"]) {
      response.type(type);
    }
  };
  exports.entity = function(response) {
    const request = response.request;
    if (!request._entity) {
      return;
    }
    if (request._entity.etag && !response.headers.etag) {
      response.etag(request._entity.etag, { vary: request._entity.vary });
    }
    if (request._entity.modified && !response.headers["last-modified"]) {
      response.header("last-modified", request._entity.modified);
    }
  };
  exports.unmodified = function(response) {
    const request = response.request;
    if (response.statusCode === 304) {
      return;
    }
    const entity = {
      etag: response.headers.etag,
      vary: response.settings.varyEtag,
      modified: response.headers["last-modified"]
    };
    const etag = request._core.Response.unmodified(request, entity);
    if (etag) {
      response.code(304);
      if (etag !== true) {
        response.headers.etag = etag;
      }
    }
  };
  internals.Empty = class extends Stream.Readable {
    _read() {
      this.push(null);
    }
    writeToStream(stream) {
      stream.end();
    }
  };
});

// node_modules/@hapi/hapi/lib/security.js
var require_security = __commonJS((exports) => {
  exports.route = function(settings) {
    if (!settings) {
      return null;
    }
    const security = settings;
    if (security.hsts) {
      if (security.hsts === true) {
        security._hsts = "max-age=15768000";
      } else if (typeof security.hsts === "number") {
        security._hsts = "max-age=" + security.hsts;
      } else {
        security._hsts = "max-age=" + (security.hsts.maxAge ?? 15768000);
        if (security.hsts.includeSubdomains || security.hsts.includeSubDomains) {
          security._hsts = security._hsts + "; includeSubDomains";
        }
        if (security.hsts.preload) {
          security._hsts = security._hsts + "; preload";
        }
      }
    }
    if (security.xframe) {
      if (security.xframe === true) {
        security._xframe = "DENY";
      } else if (typeof security.xframe === "string") {
        security._xframe = security.xframe.toUpperCase();
      } else if (security.xframe.rule === "allow-from") {
        if (!security.xframe.source) {
          security._xframe = "SAMEORIGIN";
        } else {
          security._xframe = "ALLOW-FROM " + security.xframe.source;
        }
      } else {
        security._xframe = security.xframe.rule.toUpperCase();
      }
    }
    return security;
  };
  exports.headers = function(response) {
    const security = response.request.route.settings.security;
    if (security._hsts) {
      response._header("strict-transport-security", security._hsts, { override: false });
    }
    if (security._xframe) {
      response._header("x-frame-options", security._xframe, { override: false });
    }
    if (security.xss === "enabled") {
      response._header("x-xss-protection", "1; mode=block", { override: false });
    } else if (security.xss === "disabled") {
      response._header("x-xss-protection", "0", { override: false });
    }
    if (security.noOpen) {
      response._header("x-download-options", "noopen", { override: false });
    }
    if (security.noSniff) {
      response._header("x-content-type-options", "nosniff", { override: false });
    }
    if (security.referrer !== false) {
      response._header("referrer-policy", security.referrer, { override: false });
    }
  };
});

// node_modules/@hapi/hapi/lib/streams.js
var require_streams = __commonJS((exports) => {
  var Stream = __require("stream");
  var Boom = require_lib6();
  var Teamwork = require_lib5();
  var internals = {
    team: Symbol("team")
  };
  exports.isStream = function(stream) {
    const isReadableStream = stream instanceof Stream.Readable;
    if (!isReadableStream && typeof stream?.pipe === "function") {
      throw Boom.badImplementation("Cannot reply with a stream-like object that is not an instance of Stream.Readable");
    }
    if (!isReadableStream) {
      return false;
    }
    if (stream.readableObjectMode) {
      throw Boom.badImplementation("Cannot reply with stream in object mode");
    }
    return true;
  };
  exports.drain = function(stream) {
    const team = new Teamwork.Team;
    stream[internals.team] = team;
    stream.on("readable", internals.read);
    stream.on("error", internals.end);
    stream.on("end", internals.end);
    stream.on("close", internals.end);
    return team.work;
  };
  internals.read = function() {
    while (this.read()) {
    }
  };
  internals.end = function() {
    this.removeListener("readable", internals.read);
    this.removeListener("error", internals.end);
    this.removeListener("end", internals.end);
    this.removeListener("close", internals.end);
    this[internals.team].attend();
  };
});

// node_modules/@hapi/hapi/lib/validation.js
var require_validation = __commonJS((exports) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Validate = require_lib3();
  var internals = {};
  exports.validator = function(validator) {
    Hoek.assert(validator, "Missing validator");
    Hoek.assert(typeof validator.compile === "function", "Invalid validator compile method");
    return validator;
  };
  exports.compile = function(rule, validator, realm, core) {
    validator = validator ?? internals.validator(realm, core);
    if (rule === false) {
      return Validate.object({}).allow(null);
    }
    if (typeof rule === "function") {
      return rule;
    }
    if (!rule || rule === true) {
      return null;
    }
    if (typeof rule.validate === "function") {
      return rule;
    }
    Hoek.assert(validator, "Cannot set uncompiled validation rules without configuring a validator");
    return validator.compile(rule);
  };
  internals.validator = function(realm, core) {
    while (realm) {
      if (realm.validator) {
        return realm.validator;
      }
      realm = realm.parent;
    }
    return core.validator;
  };
  exports.headers = function(request) {
    return internals.input("headers", request);
  };
  exports.params = function(request) {
    return internals.input("params", request);
  };
  exports.payload = function(request) {
    if (request.method === "get" || request.method === "head") {
      return;
    }
    return internals.input("payload", request);
  };
  exports.query = function(request) {
    return internals.input("query", request);
  };
  exports.state = function(request) {
    return internals.input("state", request);
  };
  internals.input = async function(source, request) {
    const localOptions = {
      context: {
        headers: request.headers,
        params: request.params,
        query: request.query,
        payload: request.payload,
        state: request.state,
        auth: request.auth,
        app: {
          route: request.route.settings.app,
          request: request.app
        }
      }
    };
    delete localOptions.context[source];
    Hoek.merge(localOptions, request.route.settings.validate.options);
    try {
      const schema = request.route.settings.validate[source];
      const bind = request.route.settings.bind;
      var value = await (typeof schema !== "function" ? internals.validate(request[source], schema, localOptions) : schema.call(bind, request[source], localOptions));
      return;
    } catch (err) {
      var validationError = err;
    } finally {
      request.orig[source] = request[source];
      if (value !== undefined) {
        request[source] = value;
      }
    }
    if (request.route.settings.validate.failAction === "ignore") {
      return;
    }
    const defaultError = validationError.isBoom ? validationError : Boom.badRequest(`Invalid request ${source} input`);
    const detailedError = Boom.boomify(validationError, { statusCode: 400, override: false, data: { defaultError } });
    detailedError.output.payload.validation = { source, keys: [] };
    if (validationError.details) {
      for (const details of validationError.details) {
        const path = details.path;
        detailedError.output.payload.validation.keys.push(Hoek.escapeHtml(path.join(".")));
      }
    }
    if (request.route.settings.validate.errorFields) {
      for (const field in request.route.settings.validate.errorFields) {
        detailedError.output.payload[field] = request.route.settings.validate.errorFields[field];
      }
    }
    return request._core.toolkit.failAction(request, request.route.settings.validate.failAction, defaultError, { details: detailedError, tags: ["validation", "error", source] });
  };
  exports.response = async function(request) {
    if (request.route.settings.response.sample) {
      const currentSample = Math.ceil(Math.random() * 100);
      if (currentSample > request.route.settings.response.sample) {
        return;
      }
    }
    const response = request.response;
    const statusCode = response.isBoom ? response.output.statusCode : response.statusCode;
    const statusSchema = request.route.settings.response.status[statusCode];
    if (statusCode >= 400 && !statusSchema) {
      return;
    }
    const schema = statusSchema !== undefined ? statusSchema : request.route.settings.response.schema;
    if (schema === null) {
      return;
    }
    if (!response.isBoom && request.response.variety !== "plain") {
      throw Boom.badImplementation("Cannot validate non-object response");
    }
    const localOptions = {
      context: {
        headers: request.headers,
        params: request.params,
        query: request.query,
        payload: request.payload,
        state: request.state,
        auth: request.auth,
        app: {
          route: request.route.settings.app,
          request: request.app
        }
      }
    };
    const source = response.isBoom ? response.output.payload : response.source;
    Hoek.merge(localOptions, request.route.settings.response.options);
    try {
      let value;
      if (typeof schema !== "function") {
        value = await internals.validate(source, schema, localOptions);
      } else {
        value = await schema(source, localOptions);
      }
      if (value !== undefined && request.route.settings.response.modify) {
        if (response.isBoom) {
          response.output.payload = value;
        } else {
          response.source = value;
        }
      }
    } catch (err) {
      return request._core.toolkit.failAction(request, request.route.settings.response.failAction, err, { tags: ["validation", "response", "error"] });
    }
  };
  internals.validate = function(value, schema, options) {
    if (typeof schema.validateAsync === "function") {
      return schema.validateAsync(value, options);
    }
    return schema.validate(value, options);
  };
});

// node_modules/@hapi/hapi/lib/route.js
var require_route = __commonJS((exports, module) => {
  var Assert = __require("assert");
  var Bounce = require_lib7();
  var Catbox = require_lib11();
  var Hoek = require_lib();
  var Subtext = require_lib26();
  var Validate = require_lib3();
  var Auth = require_auth();
  var Config = require_config();
  var Cors = require_cors();
  var Ext = require_ext();
  var Handler = require_handler();
  var Headers = require_headers();
  var Security = require_security();
  var Streams = require_streams();
  var Validation = require_validation();
  var internals = {};
  exports = module.exports = internals.Route = class {
    constructor(route, server, options = {}) {
      const core = server._core;
      const realm = server.realm;
      Config.apply("route", route, route.method, route.path);
      const method = route.method.toLowerCase();
      Hoek.assert(method !== "head", "Cannot set HEAD route:", route.path);
      const path = realm.modifiers.route.prefix ? realm.modifiers.route.prefix + (route.path !== "/" ? route.path : "") : route.path;
      Hoek.assert(path === "/" || path[path.length - 1] !== "/" || !core.settings.router.stripTrailingSlash, "Path cannot end with a trailing slash when configured to strip:", route.method, route.path);
      const vhost = realm.modifiers.route.vhost ?? route.vhost;
      this.method = method;
      this.path = path;
      let config = route.options ?? route.config ?? {};
      if (typeof config === "function") {
        config = config.call(realm.settings.bind, server);
      }
      config = Config.enable(config);
      this._assert(method !== "get" || !config.payload, "Cannot set payload settings on HEAD or GET request");
      this._assert(method !== "get" || !config.validate?.payload, "Cannot validate HEAD or GET request payload");
      this._assert(!route.rules || !config.rules, "Route rules can only appear once");
      const rules = route.rules ?? config.rules;
      const rulesConfig = internals.rules(rules, { method, path, vhost }, server);
      delete config.rules;
      this._assert(route.handler || config.handler, "Missing or undefined handler");
      this._assert(!!route.handler ^ !!config.handler, "Handler must only appear once");
      const handler = Config.apply("handler", route.handler ?? config.handler);
      delete config.handler;
      const handlerDefaults = Handler.defaults(method, handler, core);
      const settings = internals.config([core.settings.routes, handlerDefaults, realm.settings, rulesConfig, config]);
      this.settings = Config.apply("routeConfig", settings, method, path);
      this._core = core;
      this.realm = realm;
      this.settings.vhost = vhost;
      this.settings.plugins = this.settings.plugins ?? {};
      this.settings.app = this.settings.app ?? {};
      this._special = !!options.special;
      this._analysis = this._core.router.analyze(this.path);
      this.params = this._analysis.params;
      this.fingerprint = this._analysis.fingerprint;
      this.public = {
        method: this.method,
        path: this.path,
        vhost,
        realm,
        settings: this.settings,
        fingerprint: this.fingerprint,
        auth: {
          access: (request) => Auth.testAccess(request, this.public)
        }
      };
      this._setupValidation();
      if (this.method === "get") {
        this.settings.payload = null;
      } else {
        this.settings.payload.decoders = this._core.compression.decoders;
      }
      this._assert(!this.settings.validate.payload || this.settings.payload.parse, "Route payload must be set to \'parse\' when payload validation enabled");
      this._assert(!this.settings.validate.state || this.settings.state.parse, "Route state must be set to \'parse\' when state validation enabled");
      this.settings.auth = this._special ? false : this._core.auth._setupRoute(this.settings.auth, path);
      if (this.method === "get" && typeof this.settings.cache === "object" && (this.settings.cache.expiresIn || this.settings.cache.expiresAt)) {
        this.settings.cache._statuses = new Set(this.settings.cache.statuses);
        this._cache = new Catbox.Policy({ expiresIn: this.settings.cache.expiresIn, expiresAt: this.settings.cache.expiresAt });
      }
      this.settings.cors = Cors.route(this.settings.cors);
      this.settings.security = Security.route(this.settings.security);
      this.settings.handler = Handler.configure(handler, this);
      this._prerequisites = Handler.prerequisitesConfig(this.settings.pre);
      this._extensions = {
        onPreResponse: Ext.combine(this, "onPreResponse"),
        onPostResponse: Ext.combine(this, "onPostResponse")
      };
      if (this._special) {
        this._cycle = [internals.drain, Handler.execute];
        this.rebuild();
        return;
      }
      this._extensions.onPreAuth = Ext.combine(this, "onPreAuth");
      this._extensions.onCredentials = Ext.combine(this, "onCredentials");
      this._extensions.onPostAuth = Ext.combine(this, "onPostAuth");
      this._extensions.onPreHandler = Ext.combine(this, "onPreHandler");
      this._extensions.onPostHandler = Ext.combine(this, "onPostHandler");
      this.rebuild();
    }
    _setupValidation() {
      const validation = this.settings.validate;
      if (this.method === "get") {
        validation.payload = null;
      }
      this._assert(!validation.params || this.params.length, "Cannot set path parameters validations without path parameters");
      for (const type of ["headers", "params", "query", "payload", "state"]) {
        validation[type] = Validation.compile(validation[type], this.settings.validate.validator, this.realm, this._core);
      }
      if (this.settings.response.schema !== undefined || this.settings.response.status) {
        this.settings.response._validate = true;
        const rule = this.settings.response.schema;
        this.settings.response.status = this.settings.response.status ?? {};
        const statuses = Object.keys(this.settings.response.status);
        if (rule === true && !statuses.length) {
          this.settings.response._validate = false;
        } else {
          this.settings.response.schema = Validation.compile(rule, this.settings.validate.validator, this.realm, this._core);
          for (const code of statuses) {
            this.settings.response.status[code] = Validation.compile(this.settings.response.status[code], this.settings.validate.validator, this.realm, this._core);
          }
        }
      }
    }
    rebuild(event) {
      if (event) {
        this._extensions[event.type].add(event);
      }
      if (this._special) {
        this._postCycle = this._extensions.onPreResponse.nodes ? [this._extensions.onPreResponse] : [];
        this._buildMarshalCycle();
        return;
      }
      this._cycle = [];
      if (this.settings.state.parse) {
        this._cycle.push(internals.state);
      }
      if (this._extensions.onPreAuth.nodes) {
        this._cycle.push(this._extensions.onPreAuth);
      }
      if (this._core.auth._enabled(this, "authenticate")) {
        this._cycle.push(Auth.authenticate);
      }
      if (this.method !== "get") {
        this._cycle.push(internals.payload);
        if (this._core.auth._enabled(this, "payload")) {
          this._cycle.push(Auth.payload);
        }
      }
      if (this._core.auth._enabled(this, "authenticate") && this._extensions.onCredentials.nodes) {
        this._cycle.push(this._extensions.onCredentials);
      }
      if (this._core.auth._enabled(this, "access")) {
        this._cycle.push(Auth.access);
      }
      if (this._extensions.onPostAuth.nodes) {
        this._cycle.push(this._extensions.onPostAuth);
      }
      if (this.settings.validate.headers) {
        this._cycle.push(Validation.headers);
      }
      if (this.settings.validate.params) {
        this._cycle.push(Validation.params);
      }
      if (this.settings.validate.query) {
        this._cycle.push(Validation.query);
      }
      if (this.settings.validate.payload) {
        this._cycle.push(Validation.payload);
      }
      if (this.settings.validate.state) {
        this._cycle.push(Validation.state);
      }
      if (this._extensions.onPreHandler.nodes) {
        this._cycle.push(this._extensions.onPreHandler);
      }
      this._cycle.push(Handler.execute);
      if (this._extensions.onPostHandler.nodes) {
        this._cycle.push(this._extensions.onPostHandler);
      }
      this._postCycle = [];
      if (this.settings.response._validate && this.settings.response.sample !== 0) {
        this._postCycle.push(Validation.response);
      }
      if (this._extensions.onPreResponse.nodes) {
        this._postCycle.push(this._extensions.onPreResponse);
      }
      this._buildMarshalCycle();
    }
    _buildMarshalCycle() {
      this._marshalCycle = [Headers.type];
      if (this.settings.cors) {
        this._marshalCycle.push(Cors.headers);
      }
      if (this.settings.security) {
        this._marshalCycle.push(Security.headers);
      }
      this._marshalCycle.push(Headers.entity);
      if (this.method === "get" || this.method === "*") {
        this._marshalCycle.push(Headers.unmodified);
      }
      this._marshalCycle.push(Headers.cache);
      this._marshalCycle.push(Headers.state);
      this._marshalCycle.push(Headers.content);
      if (this._core.auth._enabled(this, "response")) {
        this._marshalCycle.push(Auth.response);
      }
    }
    _assert(condition, message) {
      if (condition) {
        return;
      }
      if (this.method[0] !== "_") {
        message = `${message}: ${this.method.toUpperCase()} ${this.path}`;
      }
      throw new Assert.AssertionError({
        message,
        actual: false,
        expected: true,
        operator: "==",
        stackStartFunction: this._assert
      });
    }
  };
  internals.state = async function(request) {
    request.state = {};
    const req = request.raw.req;
    const cookies = req.headers.cookie;
    if (!cookies) {
      return;
    }
    try {
      var result = await request._core.states.parse(cookies);
    } catch (err) {
      Bounce.rethrow(err, "system");
      var parseError = err;
    }
    const { states, failed = [] } = result ?? parseError;
    request.state = states ?? {};
    for (const item of failed) {
      if (item.settings.clearInvalid) {
        request._clearState(item.name);
      }
    }
    if (!parseError) {
      return;
    }
    parseError.header = cookies;
    return request._core.toolkit.failAction(request, request.route.settings.state.failAction, parseError, { tags: ["state", "error"] });
  };
  internals.payload = async function(request) {
    if (request.method === "get" || request.method === "head") {
      return;
    }
    if (request.payload !== undefined) {
      return internals.drain(request);
    }
    if (request._expectContinue) {
      request._expectContinue = false;
      request.raw.res.writeContinue();
    }
    try {
      const { payload, mime } = await Subtext.parse(request.raw.req, request._tap(), request.route.settings.payload);
      request._isPayloadPending = !!payload?._readableState;
      request.mime = mime;
      request.payload = payload;
    } catch (err) {
      Bounce.rethrow(err, "system");
      await internals.drain(request);
      request.mime = err.mime;
      request.payload = null;
      return request._core.toolkit.failAction(request, request.route.settings.payload.failAction, err, { tags: ["payload", "error"] });
    }
  };
  internals.drain = async function(request) {
    if (request._expectContinue) {
      request._isPayloadPending = false;
      request._expectContinue = false;
    }
    if (request._isPayloadPending) {
      await Streams.drain(request.raw.req);
      request._isPayloadPending = false;
    }
  };
  internals.config = function(chain) {
    if (!chain.length) {
      return {};
    }
    let config = chain[0];
    for (const item of chain) {
      config = Hoek.applyToDefaults(config, item, { shallow: ["bind", "validate.headers", "validate.payload", "validate.params", "validate.query", "validate.state"] });
    }
    return config;
  };
  internals.rules = function(rules, info, server) {
    const configs = [];
    let realm = server.realm;
    while (realm) {
      if (realm._rules) {
        const source = !realm._rules.settings.validate ? rules : Validate.attempt(rules, realm._rules.settings.validate.schema, realm._rules.settings.validate.options);
        const config = realm._rules.processor(source, info);
        if (config) {
          configs.unshift(config);
        }
      }
      realm = realm.parent;
    }
    return internals.config(configs);
  };
});

// node_modules/@hapi/hapi/lib/cors.js
var require_cors = __commonJS((exports) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Route = null;
  var internals = {};
  exports.route = function(options) {
    if (!options) {
      return false;
    }
    const settings = Hoek.clone(options);
    settings._headers = settings.headers.concat(settings.additionalHeaders);
    settings._headersString = settings._headers.join(",");
    for (let i = 0;i < settings._headers.length; ++i) {
      settings._headers[i] = settings._headers[i].toLowerCase();
    }
    if (settings._headers.indexOf("origin") === -1) {
      settings._headers.push("origin");
    }
    settings._exposedHeaders = settings.exposedHeaders.concat(settings.additionalExposedHeaders).join(",");
    if (settings.origin === "ignore") {
      settings._origin = false;
    } else if (settings.origin.indexOf("*") !== -1) {
      Hoek.assert(settings.origin.length === 1, "Cannot specify cors.origin * together with other values");
      settings._origin = true;
    } else {
      settings._origin = {
        qualified: [],
        wildcards: []
      };
      for (const origin of settings.origin) {
        if (origin.indexOf("*") !== -1) {
          settings._origin.wildcards.push(new RegExp("^" + Hoek.escapeRegex(origin).replace(/\\\*/g, ".*").replace(/\\\?/g, ".") + "$"));
        } else {
          settings._origin.qualified.push(origin);
        }
      }
    }
    return settings;
  };
  exports.options = function(route, server) {
    if (route.method === "options" || !route.settings.cors) {
      return;
    }
    exports.handler(server);
  };
  exports.handler = function(server) {
    Route = Route || require_route();
    if (server._core.router.specials.options) {
      return;
    }
    const definition = {
      method: "_special",
      path: "/{p*}",
      handler: internals.handler,
      options: {
        cors: false
      }
    };
    const route = new Route(definition, server, { special: true });
    server._core.router.special("options", route);
  };
  internals.handler = function(request, h) {
    const method = request.headers["access-control-request-method"];
    if (!method) {
      throw Boom.notFound("CORS error: Missing Access-Control-Request-Method header");
    }
    const route = request.server.match(method, request.path, request.info.hostname);
    if (!route) {
      throw Boom.notFound();
    }
    const settings = route.settings.cors;
    if (!settings) {
      return { message: "CORS is disabled for this route" };
    }
    const origin = request.headers.origin;
    if (!origin && settings._origin !== false) {
      throw Boom.notFound("CORS error: Missing Origin header");
    }
    if (!exports.matchOrigin(origin, settings)) {
      return { message: "CORS error: Origin not allowed" };
    }
    let headers = request.headers["access-control-request-headers"];
    if (headers) {
      headers = headers.toLowerCase().split(/\s*,\s*/);
      if (Hoek.intersect(headers, settings._headers).length !== headers.length) {
        return { message: "CORS error: Some headers are not allowed" };
      }
    }
    const response = h.response();
    response.code(settings.preflightStatusCode);
    response._header("access-control-allow-origin", settings._origin ? origin : "*");
    response._header("access-control-allow-methods", method);
    response._header("access-control-allow-headers", settings._headersString);
    response._header("access-control-max-age", settings.maxAge);
    if (settings.credentials) {
      response._header("access-control-allow-credentials", "true");
    }
    if (settings._exposedHeaders) {
      response._header("access-control-expose-headers", settings._exposedHeaders);
    }
    return response;
  };
  exports.headers = function(response) {
    const request = response.request;
    const settings = request.route.settings.cors;
    if (settings._origin !== false) {
      response.vary("origin");
    }
    if (request.info.cors && !request.info.cors.isOriginMatch || !exports.matchOrigin(request.headers.origin, request.route.settings.cors)) {
      return;
    }
    response._header("access-control-allow-origin", settings._origin ? request.headers.origin : "*");
    if (settings.credentials) {
      response._header("access-control-allow-credentials", "true");
    }
    if (settings._exposedHeaders) {
      response._header("access-control-expose-headers", settings._exposedHeaders, { append: true });
    }
  };
  exports.matchOrigin = function(origin, settings) {
    if (settings._origin === true || settings._origin === false) {
      return true;
    }
    if (!origin) {
      return false;
    }
    if (settings._origin.qualified.indexOf(origin) !== -1) {
      return true;
    }
    for (const wildcard of settings._origin.wildcards) {
      if (origin.match(wildcard)) {
        return true;
      }
    }
    return false;
  };
});

// node_modules/@hapi/hapi/lib/toolkit.js
var require_toolkit = __commonJS((exports) => {
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var internals = {};
  exports.reserved = [
    "abandon",
    "authenticated",
    "close",
    "context",
    "continue",
    "entity",
    "redirect",
    "realm",
    "request",
    "response",
    "state",
    "unauthenticated",
    "unstate"
  ];
  exports.symbols = {
    abandon: Symbol("abandon"),
    close: Symbol("close"),
    continue: Symbol("continue")
  };
  exports.Manager = class {
    constructor() {
      this._toolkit = internals.toolkit();
    }
    async execute(method, request, options) {
      const h = new this._toolkit(request, options);
      const bind = options.bind ?? null;
      try {
        let operation;
        if (bind) {
          operation = method.call(bind, request, h);
        } else if (options.args) {
          operation = method(request, h, ...options.args);
        } else {
          operation = method(request, h);
        }
        var response = await exports.timed(operation, options);
      } catch (err) {
        if (Bounce.isSystem(err)) {
          response = Boom.badImplementation(err);
        } else if (!Bounce.isError(err)) {
          response = Boom.badImplementation("Cannot throw non-error object", err);
        } else {
          response = Boom.boomify(err);
        }
      }
      if (options.ignoreResponse) {
        return response;
      }
      if (response === undefined) {
        response = Boom.badImplementation(`${method.name} method did not return a value, a promise, or throw an error`);
      }
      if (options.continue && response === exports.symbols.continue) {
        if (options.continue === "undefined") {
          return;
        }
        response = null;
      }
      if (options.auth && response instanceof internals.Auth) {
        return response;
      }
      if (typeof response !== "symbol") {
        response = request._core.Response.wrap(response, request);
        if (!response.isBoom && response._state === "init") {
          await response._prepare();
        }
      }
      return response;
    }
    decorate(name, method) {
      this._toolkit.prototype[name] = method;
    }
    async failAction(request, failAction, err, options) {
      const retain = options.retain ? err : undefined;
      if (failAction === "ignore") {
        return retain;
      }
      if (failAction === "log") {
        request._log(options.tags, err);
        return retain;
      }
      if (failAction === "error") {
        throw err;
      }
      return await this.execute(failAction, request, { realm: request.route.realm, args: [options.details ?? err] });
    }
  };
  exports.timed = async function(method, options) {
    if (!options.timeout) {
      return method;
    }
    const timer = new Promise((resolve, reject) => {
      const handler = () => {
        reject(Boom.internal(`${options.name} timed out`));
      };
      setTimeout(handler, options.timeout);
    });
    return await Promise.race([timer, method]);
  };
  internals.toolkit = function() {
    const Toolkit = class {
      constructor(request, options) {
        this.context = options.bind;
        this.realm = options.realm;
        this.request = request;
        this._auth = options.auth;
      }
      response(result) {
        Hoek.assert(!result || typeof result !== "object" || typeof result.then !== "function", "Cannot wrap a promise");
        Hoek.assert(result instanceof Error === false, "Cannot wrap an error");
        Hoek.assert(typeof result !== "symbol", "Cannot wrap a symbol");
        return this.request._core.Response.wrap(result, this.request);
      }
      redirect(location) {
        return this.response("").redirect(location);
      }
      entity(options) {
        Hoek.assert(options, "Entity method missing required options");
        Hoek.assert(options.etag || options.modified, "Entity methods missing required options key");
        this.request._entity = options;
        const entity = this.request._core.Response.entity(options.etag, options);
        if (this.request._core.Response.unmodified(this.request, entity)) {
          return this.response().code(304).takeover();
        }
      }
      state(name, value, options) {
        this.request._setState(name, value, options);
      }
      unstate(name, options) {
        this.request._clearState(name, options);
      }
      authenticated(data) {
        Hoek.assert(this._auth, "Method not supported outside of authentication");
        Hoek.assert(data?.credentials, "Authentication data missing credentials information");
        return new internals.Auth(null, data);
      }
      unauthenticated(error, data) {
        Hoek.assert(this._auth, "Method not supported outside of authentication");
        Hoek.assert(!data || data.credentials, "Authentication data missing credentials information");
        return new internals.Auth(error, data);
      }
    };
    Toolkit.prototype.abandon = exports.symbols.abandon;
    Toolkit.prototype.close = exports.symbols.close;
    Toolkit.prototype.continue = exports.symbols.continue;
    return Toolkit;
  };
  internals.Auth = class {
    constructor(error, data) {
      this.isAuth = true;
      this.error = error;
      this.data = data;
    }
  };
});

// node_modules/@hapi/ammo/lib/index.js
var require_lib27 = __commonJS((exports) => {
  var Stream = __require("stream");
  var Hoek = require_lib();
  var internals = {};
  internals.headerRx = /^bytes=[\s,]*((?:(?:\d+\-\d*)|(?:\-\d+))(?:\s*,\s*(?:(?:\d+\-\d*)|(?:\-\d+)))*)$/i;
  exports.header = function(header, length) {
    const parts = internals.headerRx.exec(header);
    if (!parts) {
      return null;
    }
    const lastPos = length - 1;
    const result = [];
    const ranges = parts[1].match(/\d*\-\d*/g);
    for (let range of ranges) {
      let from;
      let to;
      range = range.split("-");
      if (range[0]) {
        from = parseInt(range[0], 10);
      }
      if (range[1]) {
        to = parseInt(range[1], 10);
        if (from !== undefined) {
          if (to > lastPos) {
            to = lastPos;
          }
        } else {
          from = length - to;
          to = lastPos;
        }
      } else {
        to = lastPos;
      }
      if (from > to) {
        return null;
      }
      result.push(new internals.Range(from, to));
    }
    if (result.length === 1) {
      return result;
    }
    result.sort((a, b) => a.from - b.from);
    const consolidated = [];
    for (let i = result.length - 1;i > 0; --i) {
      const current = result[i];
      const before = result[i - 1];
      if (current.from <= before.to + 1) {
        before.to = current.to;
      } else {
        consolidated.unshift(current);
      }
    }
    consolidated.unshift(result[0]);
    return consolidated;
  };
  internals.Range = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  };
  exports.Clip = class extends Stream.Transform {
    constructor(range) {
      if (!(range instanceof internals.Range)) {
        Hoek.assert(typeof range === "object", 'Expected "range" object');
        const from = range.from ?? 0;
        Hoek.assert(typeof from === "number", '"range.from" must be a number');
        Hoek.assert(from === parseInt(from, 10) && from >= 0, '"range.from" must be a positive integer');
        const to = range.to ?? 0;
        Hoek.assert(typeof to === "number", '"range.to" must be a number');
        Hoek.assert(to === parseInt(to, 10) && to >= 0, '"range.to" must be a positive integer');
        Hoek.assert(to >= from, '"range.to" must be greater than or equal to "range.from"');
        range = new internals.Range(from, to);
      }
      super();
      this._range = range;
      this._next = 0;
      this._pipes = new Set;
      this.on("pipe", (pipe) => this._pipes.add(pipe));
      this.on("unpipe", (pipe) => this._pipes.delete(pipe));
    }
    _transform(chunk, encoding, done) {
      try {
        internals.processChunk(this, chunk);
      } catch (err) {
        return done(err);
      }
      return done();
    }
    _flush(done) {
      this._pipes.clear();
      done();
    }
  };
  internals.processChunk = function(stream, chunk) {
    const pos = stream._next;
    stream._next = stream._next + chunk.length;
    if (stream._next <= stream._range.from) {
      return;
    }
    if (pos > stream._range.to) {
      for (const pipe of stream._pipes) {
        pipe.unpipe(stream);
      }
      stream._pipes.clear();
      stream.end();
      return;
    }
    const from = Math.max(0, stream._range.from - pos);
    const to = Math.min(chunk.length, stream._range.to - pos + 1);
    stream.push(chunk.slice(from, to));
  };
});

// node_modules/@hapi/hapi/lib/transmit.js
var require_transmit = __commonJS((exports) => {
  var Http = __require("http");
  var Ammo = require_lib27();
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var Teamwork = require_lib5();
  var Config = require_config();
  var internals = {};
  exports.send = async function(request) {
    const response = request.response;
    try {
      if (response.isBoom) {
        await internals.fail(request, response);
        return;
      }
      await internals.marshal(response);
      await internals.transmit(response);
    } catch (err) {
      Bounce.rethrow(err, "system");
      request._setResponse(err);
      return internals.fail(request, err);
    }
  };
  internals.marshal = async function(response) {
    for (const func of response.request._route._marshalCycle) {
      await func(response);
    }
  };
  internals.fail = async function(request, boom) {
    const response = internals.error(request, boom);
    request.response = response;
    try {
      await internals.marshal(response);
    } catch (err) {
      Bounce.rethrow(err, "system");
      const minimal = {
        statusCode: response.statusCode,
        error: Http.STATUS_CODES[response.statusCode],
        message: boom.message
      };
      response._payload = new request._core.Response.Payload(JSON.stringify(minimal), {});
    }
    return internals.transmit(response);
  };
  internals.error = function(request, boom) {
    const error = boom.output;
    const response = new request._core.Response(error.payload, request, { error: boom });
    response.code(error.statusCode);
    response.headers = Hoek.clone(error.headers);
    return response;
  };
  internals.transmit = function(response) {
    const request = response.request;
    const length = internals.length(response);
    const encoding = request._core.compression.encoding(response, length);
    const ranger = encoding ? null : internals.range(response, length);
    const compressor = internals.encoding(response, encoding);
    const isInjection = request.isInjected;
    if (!(isInjection || request._core.started) || request._isPayloadPending && !request.raw.req._readableState.ended) {
      response._header("connection", "close");
    }
    internals.writeHead(response);
    if (isInjection) {
      request.raw.res[Config.symbol] = { request };
      if (response.variety === "plain") {
        request.raw.res[Config.symbol].result = response._isPayloadSupported() ? response.source : null;
      }
    }
    const stream = internals.chain([response._payload, response._tap(), compressor, ranger]);
    return internals.pipe(request, stream);
  };
  internals.length = function(response) {
    const request = response.request;
    const header = response.headers["content-length"];
    if (header === undefined) {
      return null;
    }
    let length = header;
    if (typeof length === "string") {
      length = parseInt(header, 10);
      if (!isFinite(length)) {
        delete response.headers["content-length"];
        return null;
      }
    }
    if (length === 0 && !response._statusCode && response.statusCode === 200 && request.route.settings.response.emptyStatusCode !== 200) {
      response.code(204);
      delete response.headers["content-length"];
    }
    return length;
  };
  internals.range = function(response, length) {
    const request = response.request;
    if (!length || !request.route.settings.response.ranges || request.method !== "get" || response.statusCode !== 200) {
      return null;
    }
    response._header("accept-ranges", "bytes");
    if (!request.headers.range) {
      return null;
    }
    if (request.headers["if-range"] && request.headers["if-range"] !== response.headers.etag) {
      return null;
    }
    const ranges = Ammo.header(request.headers.range, length);
    if (!ranges) {
      const error = Boom.rangeNotSatisfiable();
      error.output.headers["content-range"] = "bytes */" + length;
      throw error;
    }
    if (ranges.length !== 1) {
      return null;
    }
    const range = ranges[0];
    response.code(206);
    response.bytes(range.to - range.from + 1);
    response._header("content-range", "bytes " + range.from + "-" + range.to + "/" + length);
    return new Ammo.Clip(range);
  };
  internals.encoding = function(response, encoding) {
    const request = response.request;
    const header = response.headers["content-encoding"] || encoding;
    if (header && response.headers.etag && response.settings.varyEtag) {
      response.headers.etag = response.headers.etag.slice(0, -1) + "-" + header + '"';
    }
    if (!encoding || response.statusCode === 206 || !response._isPayloadSupported()) {
      return null;
    }
    delete response.headers["content-length"];
    response._header("content-encoding", encoding);
    const compressor = request._core.compression.encoder(request, encoding);
    if (response.variety === "stream" && typeof response._payload.setCompressor === "function") {
      response._payload.setCompressor(compressor);
    }
    return compressor;
  };
  internals.pipe = function(request, stream) {
    const team = new Teamwork.Team;
    const env = { stream, request, team };
    if (request._closed) {
      internals.end(env, "aborted");
      return team.work;
    }
    const aborted = internals.end.bind(null, env, "aborted");
    const close = internals.end.bind(null, env, "close");
    const end = internals.end.bind(null, env, null);
    request.raw.req.on("aborted", aborted);
    request.raw.res.on("close", close);
    request.raw.res.on("error", end);
    request.raw.res.on("finish", end);
    if (stream.writeToStream) {
      stream.writeToStream(request.raw.res);
    } else {
      stream.on("error", end);
      stream.pipe(request.raw.res);
    }
    return team.work;
  };
  internals.end = function(env, event, err) {
    const { request, stream, team } = env;
    if (!team) {
      return;
    }
    env.team = null;
    if (request.raw.res.writableEnded) {
      request.info.responded = Date.now();
      team.attend();
      return;
    }
    if (err) {
      request.raw.res.destroy();
      request._core.Response.drain(stream);
    }
    const origResponse = request.response;
    const error = err ? Boom.boomify(err) : new Boom.Boom(`Request ${event}`, { statusCode: request.route.settings.response.disconnectStatusCode, data: origResponse });
    request._setResponse(error);
    if (request.raw.res[Config.symbol]) {
      request.raw.res[Config.symbol].error = event ? error : new Boom.Boom(`Response error`, { statusCode: request.route.settings.response.disconnectStatusCode, data: origResponse });
    }
    if (event) {
      request._log(["response", "error", event]);
    } else {
      request._log(["response", "error"], err);
    }
    request.raw.res.end();
    team.attend();
  };
  internals.writeHead = function(response) {
    const res = response.request.raw.res;
    const headers = Object.keys(response.headers);
    let i = 0;
    try {
      for (;i < headers.length; ++i) {
        const header = headers[i];
        const value = response.headers[header];
        if (value !== undefined) {
          res.setHeader(header, value);
        }
      }
    } catch (err) {
      for (--i;i >= 0; --i) {
        res.removeHeader(headers[i]);
      }
      throw Boom.boomify(err);
    }
    if (response.settings.message) {
      res.statusMessage = response.settings.message;
    }
    try {
      res.writeHead(response.statusCode);
    } catch (err) {
      throw Boom.boomify(err);
    }
  };
  internals.chain = function(sources) {
    let from = sources[0];
    for (let i = 1;i < sources.length; ++i) {
      const to = sources[i];
      if (to) {
        from.on("error", internals.errorPipe.bind(from, to));
        from = from.pipe(to);
      }
    }
    return from;
  };
  internals.errorPipe = function(to, err) {
    to.emit("error", err);
  };
});

// node_modules/@hapi/hapi/lib/request.js
var require_request2 = __commonJS((exports, module) => {
  var Querystring = __require("querystring");
  var Url = __require("url");
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var Podium = require_lib10();
  var Cors = require_cors();
  var Toolkit = require_toolkit();
  var Transmit = require_transmit();
  var internals = {
    events: Podium.validate(["finish", { name: "peek", spread: true }, "disconnect"]),
    reserved: ["server", "url", "query", "path", "method", "mime", "setUrl", "setMethod", "headers", "id", "app", "plugins", "route", "auth", "pre", "preResponses", "info", "isInjected", "orig", "params", "paramsArray", "payload", "state", "response", "raw", "domain", "log", "logs", "generateResponse"]
  };
  exports = module.exports = internals.Request = class {
    constructor(server, req, res, options) {
      this._allowInternals = !!options.allowInternals;
      this._closed = false;
      this._core = server._core;
      this._entity = null;
      this._eventContext = { request: this };
      this._events = null;
      this._expectContinue = !!options.expectContinue;
      this._isInjected = !!options.isInjected;
      this._isPayloadPending = !!(req.headers["content-length"] || req.headers["transfer-encoding"]);
      this._isReplied = false;
      this._route = this._core.router.specials.notFound.route;
      this._serverTimeoutId = null;
      this._states = {};
      this._url = null;
      this._urlError = null;
      this.app = options.app ? Object.assign({}, options.app) : {};
      this.headers = req.headers;
      this.logs = [];
      this.method = req.method.toLowerCase();
      this.mime = null;
      this.orig = {};
      this.params = null;
      this.paramsArray = null;
      this.path = null;
      this.payload = undefined;
      this.plugins = options.plugins ? Object.assign({}, options.plugins) : {};
      this.pre = {};
      this.preResponses = {};
      this.raw = { req, res };
      this.response = null;
      this.route = this._route.public;
      this.query = null;
      this.server = server;
      this.state = null;
      this.info = new internals.Info(this);
      this.auth = {
        isAuthenticated: false,
        isAuthorized: false,
        isInjected: options.auth ? true : false,
        [internals.Request.symbols.authPayload]: options.auth?.payload ?? true,
        credentials: options.auth?.credentials ?? null,
        artifacts: options.auth?.artifacts ?? null,
        strategy: options.auth?.strategy ?? null,
        mode: null,
        error: null
      };
      this._initializeUrl();
    }
    static generate(server, req, res, options) {
      const request = new server._core.Request(server, req, res, options);
      if (server._core.decorations.requestApply) {
        for (const [property, assignment] of server._core.decorations.requestApply.entries()) {
          request[property] = assignment(request);
        }
      }
      request._listen();
      return request;
    }
    get events() {
      if (!this._events) {
        this._events = new Podium.Podium(internals.events);
      }
      return this._events;
    }
    get isInjected() {
      return this._isInjected;
    }
    get url() {
      if (this._urlError) {
        return null;
      }
      if (this._url) {
        return this._url;
      }
      return this._parseUrl(this.raw.req.url, this._core.settings.router);
    }
    _initializeUrl() {
      try {
        this._setUrl(this.raw.req.url, this._core.settings.router.stripTrailingSlash, { fast: true });
      } catch (err) {
        this.path = this.raw.req.url;
        this.query = {};
        this._urlError = Boom.boomify(err, { statusCode: 400, override: false });
      }
    }
    setUrl(url, stripTrailingSlash) {
      Hoek.assert(this.params === null, "Cannot change request URL after routing");
      if (url instanceof Url.URL) {
        url = url.href;
      }
      Hoek.assert(typeof url === "string", "Url must be a string or URL object");
      this._setUrl(url, stripTrailingSlash, { fast: false });
    }
    _setUrl(source, stripTrailingSlash, { fast }) {
      const url = this._parseUrl(source, { stripTrailingSlash, _fast: fast });
      this.query = this._parseQuery(url.searchParams);
      this.path = url.pathname;
    }
    _parseUrl(source, options) {
      if (source[0] === "/") {
        if (options._fast) {
          const url = {
            pathname: source,
            searchParams: ""
          };
          const q = source.indexOf("?");
          const h = source.indexOf("#");
          if (q !== -1 && (h === -1 || q < h)) {
            url.pathname = source.slice(0, q);
            const query = h === -1 ? source.slice(q + 1) : source.slice(q + 1, h);
            url.searchParams = Querystring.parse(query);
          } else {
            url.pathname = h === -1 ? source : source.slice(0, h);
          }
          this._normalizePath(url, options);
          return url;
        }
        this._url = new Url.URL(`${this._core.info.protocol}://${this.info.host || `${this._core.info.host}:${this._core.info.port}`}${source}`);
      } else {
        this._url = new Url.URL(source);
        this.info.hostname = this._url.hostname;
        this.info.host = this._url.host;
      }
      this._normalizePath(this._url, options);
      this._urlError = null;
      return this._url;
    }
    _normalizePath(url, options) {
      let path = this._core.router.normalize(url.pathname);
      if (options.stripTrailingSlash && path.length > 1 && path[path.length - 1] === "/") {
        path = path.slice(0, -1);
      }
      url.pathname = path;
    }
    _parseQuery(searchParams) {
      let query = Object.create(null);
      if (searchParams instanceof Url.URLSearchParams) {
        for (let [key, value] of searchParams) {
          const entry = query[key];
          if (entry !== undefined) {
            value = [].concat(entry, value);
          }
          query[key] = value;
        }
      } else {
        query = Object.assign(query, searchParams);
      }
      const parser = this._core.settings.query.parser;
      if (parser) {
        query = parser(query);
        if (!query || typeof query !== "object") {
          throw Boom.badImplementation("Parsed query must be an object");
        }
      }
      return query;
    }
    setMethod(method) {
      Hoek.assert(this.params === null, "Cannot change request method after routing");
      Hoek.assert(method && typeof method === "string", "Missing method");
      this.method = method.toLowerCase();
    }
    active() {
      return !!this._eventContext.request;
    }
    async _execute() {
      this.info.acceptEncoding = this._core.compression.accept(this);
      try {
        await this._onRequest();
      } catch (err) {
        Bounce.rethrow(err, "system");
        return this._reply(err);
      }
      this._lookup();
      this._setTimeouts();
      await this._lifecycle();
      this._reply();
    }
    async _onRequest() {
      if (this._core.extensions.route.onRequest.nodes) {
        const response = await this._invoke(this._core.extensions.route.onRequest);
        if (response) {
          if (!internals.skip(response)) {
            throw Boom.badImplementation("onRequest extension methods must return an error, a takeover response, or a continue signal");
          }
          throw response;
        }
      }
      if (this._urlError) {
        throw this._urlError;
      }
    }
    _listen() {
      if (this._isPayloadPending) {
        this.raw.req.on("end", internals.event.bind(this.raw.req, this._eventContext, "end"));
      }
      this.raw.res.on("close", internals.event.bind(this.raw.res, this._eventContext, "close"));
      this.raw.req.on("error", internals.event.bind(this.raw.req, this._eventContext, "error"));
      this.raw.req.on("aborted", internals.event.bind(this.raw.req, this._eventContext, "abort"));
      this.raw.res.once("close", internals.closed.bind(this.raw.res, this));
    }
    _lookup() {
      const match = this._core.router.route(this.method, this.path, this.info.hostname);
      if (!match.route.settings.isInternal || this._allowInternals) {
        this._route = match.route;
        this.route = this._route.public;
      }
      this.params = match.params ?? {};
      this.paramsArray = match.paramsArray ?? [];
      if (this.route.settings.cors) {
        this.info.cors = {
          isOriginMatch: Cors.matchOrigin(this.headers.origin, this.route.settings.cors)
        };
      }
    }
    _setTimeouts() {
      if (this.raw.req.socket && this.route.settings.timeout.socket !== undefined) {
        this.raw.req.socket.setTimeout(this.route.settings.timeout.socket || 0);
      }
      let serverTimeout = this.route.settings.timeout.server;
      if (!serverTimeout) {
        return;
      }
      const elapsed = Date.now() - this.info.received;
      serverTimeout = Math.floor(serverTimeout - elapsed);
      if (serverTimeout <= 0) {
        internals.timeoutReply(this, serverTimeout);
        return;
      }
      this._serverTimeoutId = setTimeout(internals.timeoutReply, serverTimeout, this, serverTimeout);
    }
    async _lifecycle() {
      for (const func of this._route._cycle) {
        if (this._isReplied) {
          return;
        }
        try {
          var response = await (typeof func === "function" ? func(this) : this._invoke(func));
        } catch (err) {
          Bounce.rethrow(err, "system");
          response = this._core.Response.wrap(err, this);
        }
        if (!response || response === Toolkit.symbols.continue) {
          continue;
        }
        if (!internals.skip(response)) {
          response = Boom.badImplementation("Lifecycle methods called before the handler can only return an error, a takeover response, or a continue signal");
        }
        this._setResponse(response);
        return;
      }
    }
    async _invoke(event, options = {}) {
      for (const ext of event.nodes) {
        const realm = ext.realm;
        const bind = ext.bind ?? realm.settings.bind;
        const response = await this._core.toolkit.execute(ext.func, this, { bind, realm, timeout: ext.timeout, name: event.type, ignoreResponse: options.ignoreResponse });
        if (options.ignoreResponse) {
          if (Boom.isBoom(response)) {
            this._log(["ext", "error"], response);
          }
          continue;
        }
        if (response === Toolkit.symbols.continue) {
          continue;
        }
        if (internals.skip(response) || this.response === null) {
          return response;
        }
        this._setResponse(response);
      }
    }
    async _reply(exit) {
      if (this._isReplied) {
        return;
      }
      this._isReplied = true;
      if (this._serverTimeoutId) {
        clearTimeout(this._serverTimeoutId);
      }
      if (exit) {
        this._setResponse(this._core.Response.wrap(exit, this));
      }
      if (!this._eventContext.request) {
        this._finalize();
        return;
      }
      if (typeof this.response === "symbol") {
        this._abort();
        return;
      }
      await this._postCycle();
      if (!this._eventContext.request || typeof this.response === "symbol") {
        this._abort();
        return;
      }
      await Transmit.send(this);
      this._finalize();
    }
    async _postCycle() {
      for (const func of this._route._postCycle) {
        if (!this._eventContext.request) {
          return;
        }
        try {
          var response = await (typeof func === "function" ? func(this) : this._invoke(func));
        } catch (err) {
          Bounce.rethrow(err, "system");
          response = this._core.Response.wrap(err, this);
        }
        if (response && response !== Toolkit.symbols.continue) {
          this._setResponse(response);
        }
      }
    }
    _abort() {
      if (this.response === Toolkit.symbols.close) {
        this.raw.res.end();
      }
      this._finalize();
    }
    _finalize() {
      this._eventContext.request = null;
      if (this.response._close) {
        if (this.response.statusCode === 500 && this.response._error) {
          const tags = this.response._error.isDeveloperError ? ["internal", "implementation", "error"] : ["internal", "error"];
          this._log(tags, this.response._error, "error");
        }
        this.response._close();
      }
      this.info.completed = Date.now();
      this._core.events.emit("response", this);
      if (this._route._extensions.onPostResponse.nodes) {
        this._invoke(this._route._extensions.onPostResponse, { ignoreResponse: true });
      }
    }
    _setResponse(response) {
      if (this.response && !this.response.isBoom && this.response !== response && this.response.source !== response.source) {
        this.response._close?.();
      }
      if (this.info.completed) {
        response._close?.();
        return;
      }
      this.response = response;
    }
    _setState(name, value, options) {
      const state = { name, value };
      if (options) {
        Hoek.assert(!options.autoValue, "Cannot set autoValue directly in a response");
        state.options = Hoek.clone(options);
      }
      this._states[name] = state;
    }
    _clearState(name, options = {}) {
      const state = { name };
      state.options = Hoek.clone(options);
      state.options.ttl = 0;
      this._states[name] = state;
    }
    _tap() {
      if (!this._events) {
        return null;
      }
      if (this._events.hasListeners("peek") || this._events.hasListeners("finish")) {
        return new this._core.Response.Peek(this._events);
      }
      return null;
    }
    log(tags, data) {
      return this._log(tags, data, "app");
    }
    _log(tags, data, channel = "internal") {
      if (!this._core.events.hasListeners("request") && !this.route.settings.log.collect) {
        return;
      }
      if (!Array.isArray(tags)) {
        tags = [tags];
      }
      const timestamp = Date.now();
      const field = data instanceof Error ? "error" : "data";
      let event = [this, { request: this.info.id, timestamp, tags, [field]: data, channel }];
      if (typeof data === "function") {
        event = () => [this, { request: this.info.id, timestamp, tags, data: data(), channel }];
      }
      if (this.route.settings.log.collect) {
        if (typeof data === "function") {
          event = event();
        }
        this.logs.push(event[1]);
      }
      this._core.events.emit({ name: "request", channel, tags }, event);
    }
    generateResponse(source, options) {
      return new this._core.Response(source, this, options);
    }
  };
  internals.Request.reserved = internals.reserved;
  internals.Request.symbols = {
    authPayload: Symbol("auth.payload")
  };
  internals.Info = class {
    constructor(request) {
      this._request = request;
      const req = request.raw.req;
      const host = req.headers.host ? req.headers.host.trim() : "";
      const received = Date.now();
      this.received = received;
      this.referrer = req.headers.referrer || req.headers.referer || "";
      this.host = host;
      this.hostname = host.split(":")[0];
      this.id = `${received}:${request._core.info.id}:${request._core._counter()}`;
      this._remoteAddress = null;
      this._remotePort = null;
      this.acceptEncoding = null;
      this.cors = null;
      this.responded = 0;
      this.completed = 0;
      if (request._core.settings.info.remote) {
        this.remoteAddress;
        this.remotePort;
      }
    }
    get remoteAddress() {
      if (!this._remoteAddress) {
        const ipv6Prefix = "::ffff:";
        const socketAddress = this._request.raw.req.socket.remoteAddress;
        if (socketAddress && socketAddress.startsWith(ipv6Prefix) && socketAddress.includes(".", ipv6Prefix.length)) {
          this._remoteAddress = socketAddress.slice(ipv6Prefix.length);
        } else {
          this._remoteAddress = socketAddress;
        }
      }
      return this._remoteAddress;
    }
    get remotePort() {
      if (this._remotePort === null) {
        this._remotePort = this._request.raw.req.socket.remotePort || "";
      }
      return this._remotePort;
    }
    toJSON() {
      return {
        acceptEncoding: this.acceptEncoding,
        completed: this.completed,
        cors: this.cors,
        host: this.host,
        hostname: this.hostname,
        id: this.id,
        received: this.received,
        referrer: this.referrer,
        remoteAddress: this.remoteAddress,
        remotePort: this.remotePort,
        responded: this.responded
      };
    }
  };
  internals.closed = function(request) {
    request._closed = true;
  };
  internals.event = function({ request }, event, err) {
    if (!request) {
      return;
    }
    request._isPayloadPending = false;
    if (event === "close" && request.raw.res.writableEnded) {
      return;
    }
    if (event === "end") {
      return;
    }
    request._log(err ? ["request", "error"] : ["request", "error", event], err);
    if (event === "error") {
      return;
    }
    request._eventContext.request = null;
    if (event === "abort") {
      request._reply(new Boom.Boom("Request aborted", { statusCode: request.route.settings.response.disconnectStatusCode, data: request.response }));
      if (request._events) {
        request._events.emit("disconnect");
      }
    }
  };
  internals.timeoutReply = function(request, timeout) {
    const elapsed = Date.now() - request.info.received;
    request._log(["request", "server", "timeout", "error"], { timeout, elapsed });
    request._reply(Boom.serverUnavailable());
  };
  internals.skip = function(response) {
    return response.isBoom || response._takeover || typeof response === "symbol";
  };
});

// node_modules/@hapi/hapi/lib/auth.js
var require_auth = __commonJS((exports, module) => {
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var Config = require_config();
  var Request = require_request2();
  var internals = {
    missing: Symbol("missing")
  };
  exports = module.exports = internals.Auth = class {
    #core = null;
    #schemes = {};
    #strategies = {};
    api = {};
    settings = {
      default: null
    };
    constructor(core) {
      this.#core = core;
    }
    public(server) {
      return {
        api: this.api,
        settings: this.settings,
        scheme: this.scheme.bind(this),
        strategy: this._strategy.bind(this, server),
        default: this.default.bind(this),
        test: this.test.bind(this),
        verify: this.verify.bind(this),
        lookup: this.lookup.bind(this)
      };
    }
    scheme(name, scheme) {
      Hoek.assert(name, "Authentication scheme must have a name");
      Hoek.assert(!this.#schemes[name], "Authentication scheme name already exists:", name);
      Hoek.assert(typeof scheme === "function", "scheme must be a function:", name);
      this.#schemes[name] = scheme;
    }
    _strategy(server, name, scheme, options = {}) {
      Hoek.assert(name, "Authentication strategy must have a name");
      Hoek.assert(typeof options === "object", "options must be an object");
      Hoek.assert(!this.#strategies[name], "Authentication strategy name already exists");
      Hoek.assert(scheme, "Authentication strategy", name, "missing scheme");
      Hoek.assert(this.#schemes[scheme], "Authentication strategy", name, "uses unknown scheme:", scheme);
      server = server._clone();
      const strategy = this.#schemes[scheme](server, options);
      Hoek.assert(strategy.authenticate, "Invalid scheme:", name, "missing authenticate() method");
      Hoek.assert(typeof strategy.authenticate === "function", "Invalid scheme:", name, "invalid authenticate() method");
      Hoek.assert(!strategy.payload || typeof strategy.payload === "function", "Invalid scheme:", name, "invalid payload() method");
      Hoek.assert(!strategy.response || typeof strategy.response === "function", "Invalid scheme:", name, "invalid response() method");
      strategy.options = strategy.options ?? {};
      Hoek.assert(strategy.payload || !strategy.options.payload, "Cannot require payload validation without a payload method");
      this.#strategies[name] = {
        methods: strategy,
        realm: server.realm
      };
      if (strategy.api) {
        this.api[name] = strategy.api;
      }
    }
    default(options) {
      Hoek.assert(!this.settings.default, "Cannot set default strategy more than once");
      options = Config.apply("auth", options, "default strategy");
      this.settings.default = this._setupRoute(Hoek.clone(options));
      const routes = this.#core.router.table();
      for (const route of routes) {
        route.rebuild();
      }
    }
    async test(name, request) {
      Hoek.assert(name, "Missing authentication strategy name");
      const strategy = this.#strategies[name];
      Hoek.assert(strategy, "Unknown authentication strategy:", name);
      const bind = strategy.methods;
      const realm = strategy.realm;
      const response = await request._core.toolkit.execute(strategy.methods.authenticate, request, { bind, realm, auth: true });
      if (!response.isAuth) {
        throw response;
      }
      if (response.error) {
        throw response.error;
      }
      return response.data;
    }
    async verify(request) {
      const auth = request.auth;
      if (auth.error) {
        throw auth.error;
      }
      if (!auth.isAuthenticated) {
        return;
      }
      const strategy = this.#strategies[auth.strategy];
      Hoek.assert(strategy, "Unknown authentication strategy:", auth.strategy);
      if (!strategy.methods.verify) {
        return;
      }
      const bind = strategy.methods;
      await strategy.methods.verify.call(bind, auth);
    }
    static testAccess(request, route) {
      const auth = request._core.auth;
      try {
        return auth._access(request, route);
      } catch (err) {
        Bounce.rethrow(err, "system");
        return false;
      }
    }
    _setupRoute(options, path) {
      if (!options) {
        return options;
      }
      if (typeof options === "string") {
        options = { strategies: [options] };
      } else if (options.strategy) {
        options.strategies = [options.strategy];
        delete options.strategy;
      }
      if (path && !options.strategies) {
        Hoek.assert(this.settings.default, "Route missing authentication strategy and no default defined:", path);
        options = Hoek.applyToDefaults(this.settings.default, options);
      }
      path = path ?? "default strategy";
      Hoek.assert(options.strategies?.length, "Missing authentication strategy:", path);
      options.mode = options.mode ?? "required";
      if (options.entity !== undefined || options.scope !== undefined) {
        options.access = [{ entity: options.entity, scope: options.scope }];
        delete options.entity;
        delete options.scope;
      }
      if (options.access) {
        for (const access of options.access) {
          access.scope = internals.setupScope(access);
        }
      }
      if (options.payload === true) {
        options.payload = "required";
      }
      let hasAuthenticatePayload = false;
      for (const name of options.strategies) {
        const strategy = this.#strategies[name];
        Hoek.assert(strategy, "Unknown authentication strategy", name, "in", path);
        Hoek.assert(strategy.methods.payload || options.payload !== "required", "Payload validation can only be required when all strategies support it in", path);
        hasAuthenticatePayload = hasAuthenticatePayload || strategy.methods.payload;
        Hoek.assert(!strategy.methods.options.payload || options.payload === undefined || options.payload === "required", "Cannot set authentication payload to", options.payload, "when a strategy requires payload validation in", path);
      }
      Hoek.assert(!options.payload || hasAuthenticatePayload, "Payload authentication requires at least one strategy with payload support in", path);
      return options;
    }
    lookup(route) {
      if (route.settings.auth === false) {
        return false;
      }
      return route.settings.auth || this.settings.default;
    }
    _enabled(route, type) {
      const config = this.lookup(route);
      if (!config) {
        return false;
      }
      if (type === "authenticate") {
        return true;
      }
      if (type === "access") {
        return !!config.access;
      }
      for (const name of config.strategies) {
        const strategy = this.#strategies[name];
        if (strategy.methods[type]) {
          return true;
        }
      }
      return false;
    }
    static authenticate(request) {
      const auth = request._core.auth;
      return auth._authenticate(request);
    }
    async _authenticate(request) {
      const config = this.lookup(request.route);
      const errors = [];
      request.auth.mode = config.mode;
      if (request.auth.credentials) {
        internals.validate(null, { credentials: request.auth.credentials, artifacts: request.auth.artifacts }, request.auth.strategy, config, request, errors);
        return;
      }
      for (const name of config.strategies) {
        const strategy = this.#strategies[name];
        const bind = strategy.methods;
        const realm = strategy.realm;
        const response = await request._core.toolkit.execute(strategy.methods.authenticate, request, { bind, realm, auth: true });
        const message = response.isAuth ? internals.validate(response.error, response.data, name, config, request, errors) : internals.validate(response, null, name, config, request, errors);
        if (!message) {
          return;
        }
        if (message !== internals.missing) {
          return message;
        }
      }
      const err = Boom.unauthorized("Missing authentication", errors);
      if (config.mode === "required") {
        throw err;
      }
      request.auth.isAuthenticated = false;
      request.auth.credentials = null;
      request.auth.error = err;
      request._log(["auth", "unauthenticated"]);
    }
    static access(request) {
      const auth = request._core.auth;
      request.auth.isAuthorized = auth._access(request);
    }
    _access(request, route) {
      const config = this.lookup(route || request.route);
      if (!config?.access) {
        return true;
      }
      const credentials = request.auth.credentials;
      if (!credentials) {
        if (config.mode !== "required") {
          return false;
        }
        throw Boom.forbidden("Request is unauthenticated");
      }
      const requestEntity = credentials.user ? "user" : "app";
      const scopeErrors = [];
      for (const access of config.access) {
        const entity = access.entity;
        if (entity && entity !== "any" && entity !== requestEntity) {
          continue;
        }
        let scope = access.scope;
        if (scope) {
          if (!credentials.scope) {
            scopeErrors.push(scope);
            continue;
          }
          scope = internals.expandScope(request, scope);
          if (!internals.validateScope(credentials, scope, "required") || !internals.validateScope(credentials, scope, "selection") || !internals.validateScope(credentials, scope, "forbidden")) {
            scopeErrors.push(scope);
            continue;
          }
        }
        return true;
      }
      if (scopeErrors.length) {
        request._log(["auth", "scope", "error"]);
        throw Boom.forbidden("Insufficient scope", { got: credentials.scope, need: scopeErrors });
      }
      if (requestEntity === "app") {
        request._log(["auth", "entity", "user", "error"]);
        throw Boom.forbidden("Application credentials cannot be used on a user endpoint");
      }
      request._log(["auth", "entity", "app", "error"]);
      throw Boom.forbidden("User credentials cannot be used on an application endpoint");
    }
    static async payload(request) {
      if (!request.auth.isAuthenticated || !request.auth[Request.symbols.authPayload]) {
        return;
      }
      const auth = request._core.auth;
      const strategy = auth.#strategies[request.auth.strategy];
      Hoek.assert(strategy, "Unknown authentication strategy:", request.auth.strategy);
      if (!strategy.methods.payload) {
        return;
      }
      const config = auth.lookup(request.route);
      const setting = config.payload ?? (strategy.methods.options.payload ? "required" : false);
      if (!setting) {
        return;
      }
      const bind = strategy.methods;
      const realm = strategy.realm;
      const response = await request._core.toolkit.execute(strategy.methods.payload, request, { bind, realm });
      if (response.isBoom && response.isMissing) {
        return setting === "optional" ? undefined : Boom.unauthorized("Missing payload authentication");
      }
      return response;
    }
    static async response(response) {
      const request = response.request;
      const auth = request._core.auth;
      if (!request.auth.isAuthenticated) {
        return;
      }
      const strategy = auth.#strategies[request.auth.strategy];
      Hoek.assert(strategy, "Unknown authentication strategy:", request.auth.strategy);
      if (!strategy.methods.response) {
        return;
      }
      const bind = strategy.methods;
      const realm = strategy.realm;
      const error = await request._core.toolkit.execute(strategy.methods.response, request, { bind, realm, continue: "undefined" });
      if (error) {
        throw error;
      }
    }
  };
  internals.setupScope = function(access) {
    if (!access.scope) {
      return false;
    }
    if (!Array.isArray(access.scope)) {
      return access.scope;
    }
    const scope = {};
    for (const value of access.scope) {
      const prefix = value[0];
      const type = prefix === "+" ? "required" : prefix === "!" ? "forbidden" : "selection";
      const clean = type === "selection" ? value : value.slice(1);
      scope[type] = scope[type] ?? [];
      scope[type].push(clean);
      if (!scope._hasParameters?.[type] && /{([^}]+)}/.test(clean)) {
        scope._hasParameters = scope._hasParameters ?? {};
        scope._hasParameters[type] = true;
      }
    }
    return scope;
  };
  internals.validate = function(err, result, name, config, request, errors) {
    result = result ?? {};
    request.auth.isAuthenticated = !err;
    if (err) {
      if (err instanceof Error === false) {
        request._log(["auth", "unauthenticated", "response", name], { statusCode: err.statusCode });
        return err;
      }
      if (err.isMissing) {
        request._log(["auth", "unauthenticated", "missing", name], err);
        errors.push(err.output.headers["WWW-Authenticate"]);
        return internals.missing;
      }
    }
    request.auth.strategy = name;
    request.auth.credentials = result.credentials;
    request.auth.artifacts = result.artifacts;
    if (!err) {
      return;
    }
    request.auth.error = err;
    if (config.mode === "try") {
      request._log(["auth", "unauthenticated", "try", name], err);
      return;
    }
    request._log(["auth", "unauthenticated", "error", name], err);
    throw err;
  };
  internals.expandScope = function(request, scope) {
    if (!scope._hasParameters) {
      return scope;
    }
    const expanded = {
      required: internals.expandScopeType(request, scope, "required"),
      selection: internals.expandScopeType(request, scope, "selection"),
      forbidden: internals.expandScopeType(request, scope, "forbidden")
    };
    return expanded;
  };
  internals.expandScopeType = function(request, scope, type) {
    if (!scope._hasParameters[type]) {
      return scope[type];
    }
    const expanded = [];
    const context = {
      params: request.params,
      query: request.query,
      payload: request.payload,
      credentials: request.auth.credentials
    };
    for (const template of scope[type]) {
      expanded.push(Hoek.reachTemplate(context, template));
    }
    return expanded;
  };
  internals.validateScope = function(credentials, scope, type) {
    if (!scope[type]) {
      return true;
    }
    const count = typeof credentials.scope === "string" ? scope[type].indexOf(credentials.scope) !== -1 ? 1 : 0 : Hoek.intersect(scope[type], credentials.scope).length;
    if (type === "forbidden") {
      return count === 0;
    }
    if (type === "required") {
      return count === scope.required.length;
    }
    return !!count;
  };
});

// node_modules/@hapi/accept/lib/header.js
var require_header = __commonJS((exports) => {
  var Hoek = require_lib();
  var Boom = require_lib6();
  var internals = {};
  exports.selection = function(header, preferences, options) {
    const selections = exports.selections(header, preferences, options);
    return selections.length ? selections[0] : "";
  };
  exports.selections = function(header, preferences, options) {
    Hoek.assert(!preferences || Array.isArray(preferences), "Preferences must be an array");
    return internals.parse(header || "", preferences, options);
  };
  internals.parse = function(raw, preferences, options) {
    const header = raw.replace(/[ \t]/g, "");
    const lowers = new Map;
    if (preferences) {
      let pos = 0;
      for (const preference of preferences) {
        const lower = preference.toLowerCase();
        lowers.set(lower, { orig: preference, pos: pos++ });
        if (options.prefixMatch) {
          const parts2 = lower.split("-");
          while (parts2.pop(), parts2.length > 0) {
            const joined = parts2.join("-");
            if (!lowers.has(joined)) {
              lowers.set(joined, { orig: preference, pos: pos++ });
            }
          }
        }
      }
    }
    const parts = header.split(",");
    const selections = [];
    const map = new Set;
    for (let i = 0;i < parts.length; ++i) {
      const part = parts[i];
      if (!part) {
        continue;
      }
      const params = part.split(";");
      if (params.length > 2) {
        throw Boom.badRequest(`Invalid ${options.type} header`);
      }
      let token = params[0].toLowerCase();
      if (!token) {
        throw Boom.badRequest(`Invalid ${options.type} header`);
      }
      if (options.equivalents?.has(token)) {
        token = options.equivalents.get(token);
      }
      const selection = {
        token,
        pos: i,
        q: 1
      };
      if (preferences && lowers.has(token)) {
        selection.pref = lowers.get(token).pos;
      }
      map.add(selection.token);
      if (params.length === 2) {
        const q = params[1];
        const [key, value] = q.split("=");
        if (!value || key !== "q" && key !== "Q") {
          throw Boom.badRequest(`Invalid ${options.type} header`);
        }
        const score = parseFloat(value);
        if (score === 0) {
          continue;
        }
        if (Number.isFinite(score) && score <= 1 && score >= 0.001) {
          selection.q = score;
        }
      }
      selections.push(selection);
    }
    selections.sort(internals.sort);
    const values = selections.map((selection) => selection.token);
    if (options.default && !map.has(options.default)) {
      values.push(options.default);
    }
    if (!preferences?.length) {
      return values;
    }
    const preferred = [];
    for (const selection of values) {
      if (selection === "*") {
        for (const [preference, value] of lowers) {
          if (!map.has(preference)) {
            preferred.push(value.orig);
          }
        }
      } else {
        const lower = selection.toLowerCase();
        if (lowers.has(lower)) {
          preferred.push(lowers.get(lower).orig);
        }
      }
    }
    return preferred;
  };
  internals.sort = function(a, b) {
    const aFirst = -1;
    const bFirst = 1;
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === undefined) {
        return bFirst;
      }
      if (b.pref === undefined) {
        return aFirst;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  };
});

// node_modules/@hapi/accept/lib/media.js
var require_media = __commonJS((exports) => {
  var Hoek = require_lib();
  var Boom = require_lib6();
  var internals = {};
  exports.selection = function(header, preferences) {
    const selections = exports.selections(header, preferences);
    return selections.length ? selections[0] : "";
  };
  exports.selections = function(header, preferences) {
    Hoek.assert(!preferences || Array.isArray(preferences), "Preferences must be an array");
    return internals.parse(header, preferences);
  };
  internals.validMediaRx = /^(?:\*\/\*)|(?:[\w\!#\$%&'\*\+\-\.\^`\|~]+\/\*)|(?:[\w\!#\$%&'\*\+\-\.\^`\|~]+\/[\w\!#\$%&'\*\+\-\.\^`\|~]+)$/;
  internals.parse = function(raw, preferences) {
    const { header, quoted } = internals.normalize(raw);
    const parts = header.split(",");
    const selections = [];
    const map = {};
    for (let i = 0;i < parts.length; ++i) {
      const part = parts[i];
      if (!part) {
        continue;
      }
      const pairs = part.split(";");
      const token = pairs.shift().toLowerCase();
      if (!internals.validMediaRx.test(token)) {
        continue;
      }
      const selection = {
        token,
        params: {},
        exts: {},
        pos: i
      };
      let target = "params";
      for (const pair of pairs) {
        const kv = pair.split("=");
        if (kv.length !== 2 || !kv[1]) {
          throw Boom.badRequest(`Invalid accept header`);
        }
        const key = kv[0];
        let value = kv[1];
        if (key === "q" || key === "Q") {
          target = "exts";
          value = parseFloat(value);
          if (!Number.isFinite(value) || value > 1 || value < 0.001 && value !== 0) {
            value = 1;
          }
          selection.q = value;
        } else {
          if (value[0] === '"') {
            value = `"${quoted[value]}"`;
          }
          selection[target][kv[0]] = value;
        }
      }
      const params = Object.keys(selection.params);
      selection.original = [""].concat(params.map((key) => `${key}=${selection.params[key]}`)).join(";");
      selection.specificity = params.length;
      if (selection.q === undefined) {
        selection.q = 1;
      }
      const tparts = selection.token.split("/");
      selection.type = tparts[0];
      selection.subtype = tparts[1];
      map[selection.token] = selection;
      if (selection.q) {
        selections.push(selection);
      }
    }
    selections.sort(internals.sort);
    return internals.preferences(map, selections, preferences);
  };
  internals.normalize = function(raw) {
    raw = raw || "*/*";
    const normalized = {
      header: raw,
      quoted: {}
    };
    if (raw.includes('"')) {
      let i = 0;
      normalized.header = raw.replace(/="([^"]*)"/g, ($0, $1) => {
        const key = '"' + ++i;
        normalized.quoted[key] = $1;
        return "=" + key;
      });
    }
    normalized.header = normalized.header.replace(/[ \t]/g, "");
    return normalized;
  };
  internals.sort = function(a, b) {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (a.type !== b.type) {
      return internals.innerSort(a, b, "type");
    }
    if (a.subtype !== b.subtype) {
      return internals.innerSort(a, b, "subtype");
    }
    if (a.specificity !== b.specificity) {
      return b.specificity - a.specificity;
    }
    return a.pos - b.pos;
  };
  internals.innerSort = function(a, b, key) {
    const aFirst = -1;
    const bFirst = 1;
    if (a[key] === "*") {
      return bFirst;
    }
    if (b[key] === "*") {
      return aFirst;
    }
    return a[key] < b[key] ? aFirst : bFirst;
  };
  internals.preferences = function(map, selections, preferences) {
    if (!preferences?.length) {
      return selections.map((selection) => selection.token + selection.original);
    }
    const lowers = Object.create(null);
    const flat = Object.create(null);
    let any = false;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      flat[lower] = preference;
      const parts = lower.split("/");
      const type = parts[0];
      const subtype = parts[1];
      if (type === "*") {
        Hoek.assert(subtype === "*", "Invalid media type preference contains wildcard type with a subtype");
        any = true;
        continue;
      }
      lowers[type] = lowers[type] ?? Object.create(null);
      lowers[type][subtype] = preference;
    }
    const preferred = [];
    for (const selection of selections) {
      const token = selection.token;
      const { type, subtype } = map[token];
      const subtypes = lowers[type];
      if (type === "*") {
        for (const preference of Object.keys(flat)) {
          if (!map[preference]) {
            preferred.push(flat[preference]);
          }
        }
        if (any) {
          preferred.push("*/*");
        }
        continue;
      }
      if (any) {
        preferred.push((flat[token] || token) + selection.original);
        continue;
      }
      if (subtype !== "*") {
        const pref = flat[token];
        if (pref || subtypes && subtypes["*"]) {
          preferred.push((pref || token) + selection.original);
        }
        continue;
      }
      if (subtypes) {
        for (const psub of Object.keys(subtypes)) {
          if (!map[`${type}/${psub}`]) {
            preferred.push(subtypes[psub]);
          }
        }
      }
    }
    return preferred;
  };
});

// node_modules/@hapi/accept/lib/index.js
var require_lib28 = __commonJS((exports) => {
  var Header = require_header();
  var Media = require_media();
  var internals = {
    options: {
      charset: {
        type: "accept-charset"
      },
      encoding: {
        type: "accept-encoding",
        default: "identity",
        equivalents: new Map([
          ["x-compress", "compress"],
          ["x-gzip", "gzip"]
        ])
      },
      language: {
        type: "accept-language",
        prefixMatch: true
      }
    }
  };
  for (const type in internals.options) {
    exports[type] = (header, preferences) => Header.selection(header, preferences, internals.options[type]);
    exports[`${type}s`] = (header, preferences) => Header.selections(header, preferences, internals.options[type]);
  }
  exports.mediaType = (header, preferences) => Media.selection(header, preferences);
  exports.mediaTypes = (header, preferences) => Media.selections(header, preferences);
  exports.parseAll = function(requestHeaders) {
    return {
      charsets: exports.charsets(requestHeaders["accept-charset"]),
      encodings: exports.encodings(requestHeaders["accept-encoding"]),
      languages: exports.languages(requestHeaders["accept-language"]),
      mediaTypes: exports.mediaTypes(requestHeaders.accept)
    };
  };
});

// node_modules/@hapi/hapi/lib/compression.js
var require_compression = __commonJS((exports, module) => {
  var Zlib = __require("zlib");
  var Accept = require_lib28();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var internals = {
    common: ["gzip, deflate", "deflate, gzip", "gzip", "deflate", "gzip, deflate, br"]
  };
  exports = module.exports = internals.Compression = class {
    decoders = {
      gzip: (options) => Zlib.createGunzip(options),
      deflate: (options) => Zlib.createInflate(options)
    };
    encodings = ["identity", "gzip", "deflate"];
    encoders = {
      identity: null,
      gzip: (options) => Zlib.createGzip(options),
      deflate: (options) => Zlib.createDeflate(options)
    };
    #common = null;
    constructor() {
      this._updateCommons();
    }
    _updateCommons() {
      this.#common = new Map;
      for (const header of internals.common) {
        this.#common.set(header, Accept.encoding(header, this.encodings));
      }
    }
    addEncoder(encoding, encoder) {
      Hoek.assert(this.encoders[encoding] === undefined, `Cannot override existing encoder for ${encoding}`);
      Hoek.assert(typeof encoder === "function", `Invalid encoder function for ${encoding}`);
      this.encoders[encoding] = encoder;
      this.encodings.unshift(encoding);
      this._updateCommons();
    }
    addDecoder(encoding, decoder) {
      Hoek.assert(this.decoders[encoding] === undefined, `Cannot override existing decoder for ${encoding}`);
      Hoek.assert(typeof decoder === "function", `Invalid decoder function for ${encoding}`);
      this.decoders[encoding] = decoder;
    }
    accept(request) {
      const header = request.headers["accept-encoding"];
      if (!header) {
        return "identity";
      }
      const common = this.#common.get(header);
      if (common) {
        return common;
      }
      try {
        return Accept.encoding(header, this.encodings);
      } catch (err) {
        Bounce.rethrow(err, "system");
        err.header = header;
        request._log(["accept-encoding", "error"], err);
        return "identity";
      }
    }
    encoding(response, length) {
      if (response.settings.compressed) {
        response.headers["content-encoding"] = response.settings.compressed;
        return null;
      }
      const request = response.request;
      if (!request._core.settings.compression || length !== null && length < request._core.settings.compression.minBytes) {
        return null;
      }
      const mime = request._core.mime.type(response.headers["content-type"] || "application/octet-stream");
      if (!mime.compressible) {
        return null;
      }
      response.vary("accept-encoding");
      if (response.headers["content-encoding"]) {
        return null;
      }
      return request.info.acceptEncoding === "identity" ? null : request.info.acceptEncoding;
    }
    encoder(request, encoding) {
      const encoder = this.encoders[encoding];
      Hoek.assert(encoder !== undefined, `Unknown encoding ${encoding}`);
      return encoder(request.route.settings.compression[encoding]);
    }
  };
});

// node_modules/@hapi/hapi/lib/methods.js
var require_methods = __commonJS((exports, module) => {
  var Boom = require_lib6();
  var Hoek = require_lib();
  var Config = require_config();
  var internals = {
    methodNameRx: /^[_$a-zA-Z][$\w]*(?:\.[_$a-zA-Z][$\w]*)*$/
  };
  exports = module.exports = internals.Methods = class {
    methods = {};
    #core = null;
    constructor(core) {
      this.#core = core;
    }
    add(name, method, options, realm) {
      if (typeof name !== "object") {
        return this._add(name, method, options, realm);
      }
      const items = [].concat(name);
      for (let item of items) {
        item = Config.apply("methodObject", item);
        this._add(item.name, item.method, item.options ?? {}, realm);
      }
    }
    _add(name, method, options, realm) {
      Hoek.assert(typeof method === "function", "method must be a function");
      Hoek.assert(typeof name === "string", "name must be a string");
      Hoek.assert(name.match(internals.methodNameRx), "Invalid name:", name);
      Hoek.assert(!Hoek.reach(this.methods, name, { functions: false }), "Server method function name already exists:", name);
      options = Config.apply("method", options, name);
      const settings = Hoek.clone(options, { shallow: ["bind"] });
      settings.generateKey = settings.generateKey ?? internals.generateKey;
      const bind = settings.bind ?? realm.settings.bind ?? null;
      const bound = !bind ? method : (...args) => method.apply(bind, args);
      if (!settings.cache) {
        return this._assign(name, bound);
      }
      Hoek.assert(!settings.cache.generateFunc, "Cannot set generateFunc with method caching:", name);
      Hoek.assert(settings.cache.generateTimeout !== undefined, "Method caching requires a timeout value in generateTimeout:", name);
      settings.cache.generateFunc = (id, flags) => bound(...id.args, flags);
      const cache = this.#core._cachePolicy(settings.cache, "#" + name);
      const func = function(...args) {
        const key = settings.generateKey.apply(bind, args);
        if (typeof key !== "string") {
          return Promise.reject(Boom.badImplementation("Invalid method key when invoking: " + name, { name, args }));
        }
        return cache.get({ id: key, args });
      };
      func.cache = {
        drop: function(...args) {
          const key = settings.generateKey.apply(bind, args);
          if (typeof key !== "string") {
            return Promise.reject(Boom.badImplementation("Invalid method key when invoking: " + name, { name, args }));
          }
          return cache.drop(key);
        },
        stats: cache.stats
      };
      this._assign(name, func, func);
    }
    _assign(name, method) {
      const path = name.split(".");
      let ref = this.methods;
      for (let i = 0;i < path.length; ++i) {
        if (!ref[path[i]]) {
          ref[path[i]] = i + 1 === path.length ? method : {};
        }
        ref = ref[path[i]];
      }
    }
  };
  internals.supportedArgs = ["string", "number", "boolean"];
  internals.generateKey = function(...args) {
    let key = "";
    for (let i = 0;i < args.length; ++i) {
      const arg = args[i];
      if (!internals.supportedArgs.includes(typeof arg)) {
        return null;
      }
      key = key + (i ? ":" : "") + encodeURIComponent(arg.toString());
    }
    return key;
  };
});

// node_modules/@hapi/hapi/lib/response.js
var require_response2 = __commonJS((exports, module) => {
  var Stream = __require("stream");
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Hoek = require_lib();
  var Podium = require_lib10();
  var Streams = require_streams();
  var internals = {
    events: Podium.validate(["finish", { name: "peek", spread: true }]),
    hopByHop: {
      connection: true,
      "keep-alive": true,
      "proxy-authenticate": true,
      "proxy-authorization": true,
      te: true,
      trailer: true,
      "transfer-encoding": true,
      upgrade: true
    },
    reserved: [
      "app",
      "headers",
      "plugins",
      "request",
      "source",
      "statusCode",
      "variety",
      "settings",
      "events",
      "code",
      "message",
      "header",
      "vary",
      "etag",
      "type",
      "contentType",
      "bytes",
      "location",
      "created",
      "compressed",
      "replacer",
      "space",
      "suffix",
      "escape",
      "passThrough",
      "redirect",
      "temporary",
      "permanent",
      "rewritable",
      "encoding",
      "charset",
      "ttl",
      "state",
      "unstate",
      "takeover"
    ]
  };
  exports = module.exports = internals.Response = class {
    constructor(source, request, options = {}) {
      this.app = {};
      this.headers = {};
      this.plugins = {};
      this.request = request;
      this.source = null;
      this.statusCode = null;
      this.variety = null;
      this.settings = {
        charset: "utf-8",
        compressed: null,
        encoding: "utf8",
        message: null,
        passThrough: true,
        stringify: null,
        ttl: null,
        varyEtag: false
      };
      this._events = null;
      this._payload = null;
      this._error = options.error ?? null;
      this._contentType = null;
      this._takeover = false;
      this._statusCode = false;
      this._state = this._error ? "prepare" : "init";
      this._processors = {
        marshal: options.marshal,
        prepare: options.prepare,
        close: options.close
      };
      this._setSource(source, options.variety);
    }
    static wrap(result, request) {
      if (result instanceof request._core.Response || typeof result === "symbol") {
        return result;
      }
      if (result instanceof Error) {
        return Boom.boomify(result);
      }
      return new request._core.Response(result, request);
    }
    _setSource(source, variety) {
      this.variety = variety ?? "plain";
      if (source === null || source === undefined) {
        source = null;
      } else if (Buffer.isBuffer(source)) {
        this.variety = "buffer";
        this._contentType = "application/octet-stream";
      } else if (Streams.isStream(source)) {
        this.variety = "stream";
        this._contentType = "application/octet-stream";
      }
      this.source = source;
      if (this.variety === "plain" && this.source !== null) {
        this._contentType = typeof this.source === "string" ? "text/html" : "application/json";
      }
    }
    get events() {
      if (!this._events) {
        this._events = new Podium.Podium(internals.events);
      }
      return this._events;
    }
    code(statusCode) {
      Hoek.assert(Number.isSafeInteger(statusCode), "Status code must be an integer");
      this.statusCode = statusCode;
      this._statusCode = true;
      return this;
    }
    message(httpMessage) {
      this.settings.message = httpMessage;
      return this;
    }
    header(key, value, options) {
      key = key.toLowerCase();
      if (key === "vary") {
        return this.vary(value);
      }
      return this._header(key, value, options);
    }
    _header(key, value, options = {}) {
      const append = options.append ?? false;
      const separator = options.separator || ",";
      const override = options.override !== false;
      const duplicate = options.duplicate !== false;
      if (!append && override || !this.headers[key]) {
        this.headers[key] = value;
      } else if (override) {
        if (key === "set-cookie") {
          this.headers[key] = [].concat(this.headers[key], value);
        } else {
          const existing = this.headers[key];
          if (!duplicate) {
            const values = existing.split(separator);
            for (const v of values) {
              if (v === value) {
                return this;
              }
            }
          }
          this.headers[key] = existing + separator + value;
        }
      }
      return this;
    }
    vary(value) {
      if (value === "*") {
        this.headers.vary = "*";
      } else if (!this.headers.vary) {
        this.headers.vary = value;
      } else if (this.headers.vary !== "*") {
        this._header("vary", value, { append: true, duplicate: false });
      }
      return this;
    }
    etag(tag, options) {
      const entity = this.request._core.Response.entity(tag, options);
      this._header("etag", entity.etag);
      this.settings.varyEtag = entity.vary;
      return this;
    }
    static entity(tag, options = {}) {
      Hoek.assert(tag !== "*", "ETag cannot be *");
      return {
        etag: (options.weak ? "W/" : "") + '"' + tag + '"',
        vary: options.vary !== false && !options.weak,
        modified: options.modified
      };
    }
    static unmodified(request, entity) {
      if (request.method !== "get" && request.method !== "head") {
        return false;
      }
      if (entity.etag && request.headers["if-none-match"]) {
        const ifNoneMatch = request.headers["if-none-match"].split(/\s*,\s*/);
        for (const etag of ifNoneMatch) {
          if (etag === entity.etag) {
            return true;
          }
          if (!entity.vary) {
            continue;
          }
          if (etag === `W/${entity.etag}`) {
            return etag;
          }
          const etagBase = entity.etag.slice(0, -1);
          const encoders = request._core.compression.encodings;
          for (const encoder of encoders) {
            if (etag === etagBase + `-${encoder}"`) {
              return true;
            }
          }
        }
        return false;
      }
      if (!entity.modified) {
        return false;
      }
      const ifModifiedSinceHeader = request.headers["if-modified-since"];
      if (!ifModifiedSinceHeader) {
        return false;
      }
      const ifModifiedSince = internals.parseDate(ifModifiedSinceHeader);
      if (!ifModifiedSince) {
        return false;
      }
      const lastModified = internals.parseDate(entity.modified);
      if (!lastModified) {
        return false;
      }
      return ifModifiedSince >= lastModified;
    }
    type(type) {
      this._header("content-type", type);
      return this;
    }
    get contentType() {
      let type = this.headers["content-type"];
      if (type) {
        type = type.trim();
        if (this.settings.charset && type.match(/^(?:text\/)|(?:application\/(?:json)|(?:javascript))/) && !type.match(/; *charset=/)) {
          const semi = type[type.length - 1] === ";";
          return type + (semi ? " " : "; ") + "charset=" + this.settings.charset;
        }
        return type;
      }
      if (this._contentType) {
        const charset = this.settings.charset && this._contentType !== "application/octet-stream" ? "; charset=" + this.settings.charset : "";
        return this._contentType + charset;
      }
      return null;
    }
    bytes(bytes) {
      this._header("content-length", bytes);
      return this;
    }
    location(uri) {
      this._header("location", uri);
      return this;
    }
    created(location) {
      Hoek.assert(this.request.method === "post" || this.request.method === "put" || this.request.method === "patch", "Cannot return 201 status codes for " + this.request.method.toUpperCase());
      this.statusCode = 201;
      this.location(location);
      return this;
    }
    compressed(encoding) {
      Hoek.assert(encoding && typeof encoding === "string", "Invalid content-encoding");
      this.settings.compressed = encoding;
      return this;
    }
    replacer(method) {
      this.settings.stringify = this.settings.stringify ?? {};
      this.settings.stringify.replacer = method;
      return this;
    }
    spaces(count) {
      this.settings.stringify = this.settings.stringify ?? {};
      this.settings.stringify.space = count;
      return this;
    }
    suffix(suffix) {
      this.settings.stringify = this.settings.stringify ?? {};
      this.settings.stringify.suffix = suffix;
      return this;
    }
    escape(escape) {
      this.settings.stringify = this.settings.stringify ?? {};
      this.settings.stringify.escape = escape;
      return this;
    }
    passThrough(enabled) {
      this.settings.passThrough = enabled !== false;
      return this;
    }
    redirect(location) {
      this.statusCode = 302;
      this.location(location);
      return this;
    }
    temporary(isTemporary) {
      Hoek.assert(this.headers.location, "Cannot set redirection mode without first setting a location");
      this._setTemporary(isTemporary !== false);
      return this;
    }
    permanent(isPermanent) {
      Hoek.assert(this.headers.location, "Cannot set redirection mode without first setting a location");
      this._setTemporary(isPermanent === false);
      return this;
    }
    rewritable(isRewritable) {
      Hoek.assert(this.headers.location, "Cannot set redirection mode without first setting a location");
      this._setRewritable(isRewritable !== false);
      return this;
    }
    _isTemporary() {
      return this.statusCode === 302 || this.statusCode === 307;
    }
    _isRewritable() {
      return this.statusCode === 301 || this.statusCode === 302;
    }
    _setTemporary(isTemporary) {
      if (isTemporary) {
        if (this._isRewritable()) {
          this.statusCode = 302;
        } else {
          this.statusCode = 307;
        }
      } else {
        if (this._isRewritable()) {
          this.statusCode = 301;
        } else {
          this.statusCode = 308;
        }
      }
    }
    _setRewritable(isRewritable) {
      if (isRewritable) {
        if (this._isTemporary()) {
          this.statusCode = 302;
        } else {
          this.statusCode = 301;
        }
      } else {
        if (this._isTemporary()) {
          this.statusCode = 307;
        } else {
          this.statusCode = 308;
        }
      }
    }
    encoding(encoding) {
      this.settings.encoding = encoding;
      return this;
    }
    charset(charset) {
      this.settings.charset = charset ?? null;
      return this;
    }
    ttl(ttl) {
      this.settings.ttl = ttl;
      return this;
    }
    state(name, value, options) {
      this.request._setState(name, value, options);
      return this;
    }
    unstate(name, options) {
      this.request._clearState(name, options);
      return this;
    }
    takeover() {
      this._takeover = true;
      return this;
    }
    _prepare() {
      Hoek.assert(this._state === "init");
      this._state = "prepare";
      this._passThrough();
      if (!this._processors.prepare) {
        return this;
      }
      try {
        return this._processors.prepare(this);
      } catch (err) {
        throw Boom.boomify(err);
      }
    }
    _passThrough() {
      if (this.variety === "stream" && this.settings.passThrough) {
        if (this.source.statusCode && !this.statusCode) {
          this.statusCode = this.source.statusCode;
        }
        if (this.source.headers) {
          let headerKeys = Object.keys(this.source.headers);
          if (headerKeys.length) {
            const localHeaders = this.headers;
            this.headers = {};
            const connection = this.source.headers.connection;
            const byHop = {};
            if (connection) {
              connection.split(/\s*,\s*/).forEach((header) => {
                byHop[header] = true;
              });
            }
            for (const key of headerKeys) {
              const lower = key.toLowerCase();
              if (!internals.hopByHop[lower] && !byHop[lower]) {
                this.header(lower, Hoek.clone(this.source.headers[key]));
              }
            }
            headerKeys = Object.keys(localHeaders);
            for (const key of headerKeys) {
              this.header(key, localHeaders[key], { append: key === "set-cookie" });
            }
          }
        }
      }
      this.statusCode = this.statusCode ?? 200;
    }
    async _marshal() {
      Hoek.assert(this._state === "prepare");
      this._state = "marshall";
      let source = this.source;
      if (this._processors.marshal) {
        try {
          source = await this._processors.marshal(this);
        } catch (err) {
          throw Boom.boomify(err);
        }
      }
      if (Streams.isStream(source)) {
        this._payload = source;
        return;
      }
      const jsonify = this.variety === "plain" && source !== null && typeof source !== "string";
      if (!jsonify && this.settings.stringify) {
        throw Boom.badImplementation("Cannot set formatting options on non object response");
      }
      let payload = source;
      if (jsonify) {
        const options = this.settings.stringify ?? {};
        const space = options.space ?? this.request.route.settings.json.space;
        const replacer = options.replacer ?? this.request.route.settings.json.replacer;
        const suffix = options.suffix ?? this.request.route.settings.json.suffix ?? "";
        const escape = this.request.route.settings.json.escape;
        try {
          if (replacer || space) {
            payload = JSON.stringify(payload, replacer, space);
          } else {
            payload = JSON.stringify(payload);
          }
        } catch (err) {
          throw Boom.boomify(err);
        }
        if (suffix) {
          payload = payload + suffix;
        }
        if (escape) {
          payload = Hoek.escapeJson(payload);
        }
      }
      this._payload = new internals.Response.Payload(payload, this.settings);
    }
    _tap() {
      if (!this._events) {
        return null;
      }
      if (this._events.hasListeners("peek") || this._events.hasListeners("finish")) {
        return new internals.Response.Peek(this._events);
      }
      return null;
    }
    _close() {
      if (this._state === "close") {
        return;
      }
      this._state = "close";
      if (this._processors.close) {
        try {
          this._processors.close(this);
        } catch (err) {
          Bounce.rethrow(err, "system");
          this.request._log(["response", "cleanup", "error"], err);
        }
      }
      const stream = this._payload || this.source;
      if (Streams.isStream(stream)) {
        internals.Response.drain(stream);
      }
    }
    _isPayloadSupported() {
      return this.request.method !== "head" && this.statusCode !== 304 && this.statusCode !== 204;
    }
    static drain(stream) {
      stream.destroy();
    }
  };
  internals.Response.reserved = internals.reserved;
  internals.parseDate = function(string) {
    try {
      return Date.parse(string);
    } catch (errIgnore) {
    }
  };
  internals.Response.Payload = class extends Stream.Readable {
    constructor(payload, options) {
      super();
      this._data = payload;
      this._encoding = options.encoding;
    }
    _read(size) {
      if (this._data) {
        this.push(this._data, this._encoding);
      }
      this.push(null);
    }
    size() {
      if (!this._data) {
        return 0;
      }
      return Buffer.isBuffer(this._data) ? this._data.length : Buffer.byteLength(this._data, this._encoding);
    }
    writeToStream(stream) {
      if (this._data) {
        stream.write(this._data, this._encoding);
      }
      stream.end();
    }
  };
  internals.Response.Peek = class extends Stream.Transform {
    constructor(podium) {
      super();
      this._podium = podium;
      this.on("finish", () => podium.emit("finish"));
    }
    _transform(chunk, encoding, callback) {
      this._podium.emit("peek", [chunk, encoding]);
      this.push(chunk, encoding);
      callback();
    }
  };
});

// node_modules/@hapi/hapi/lib/core.js
var require_core = __commonJS((exports, module) => {
  var Http = __require("http");
  var Https = __require("https");
  var Os = __require("os");
  var Path = __require("path");
  var Boom = require_lib6();
  var Bounce = require_lib7();
  var Call = require_lib9();
  var Catbox = require_lib11();
  var { Engine: CatboxMemory } = require_lib12();
  var { Heavy } = require_lib13();
  var Hoek = require_lib();
  var { Mimos } = require_lib14();
  var Podium = require_lib10();
  var Statehood = require_lib19();
  var Auth = require_auth();
  var Compression = require_compression();
  var Config = require_config();
  var Cors = require_cors();
  var Ext = require_ext();
  var Methods = require_methods();
  var Request = require_request2();
  var Response = require_response2();
  var Route = require_route();
  var Toolkit = require_toolkit();
  var Validation = require_validation();
  var internals = {
    counter: {
      min: 1e4,
      max: 99999
    },
    events: [
      { name: "cachePolicy", spread: true },
      { name: "log", channels: ["app", "internal"], tags: true },
      { name: "request", channels: ["app", "internal", "error"], tags: true, spread: true },
      "response",
      "route",
      "start",
      "closing",
      "stop"
    ],
    badRequestResponse: Buffer.from("HTTP/1.1 400 Bad Request\r\n\r\n", "ascii")
  };
  exports = module.exports = internals.Core = class {
    actives = new WeakMap;
    app = {};
    auth = new Auth(this);
    caches = new Map;
    compression = new Compression;
    controlled = null;
    dependencies = [];
    events = new Podium.Podium(internals.events);
    heavy = null;
    info = null;
    instances = new Set;
    listener = null;
    methods = new Methods(this);
    mime = null;
    onConnection = null;
    phase = "stopped";
    plugins = {};
    registrations = {};
    registring = 0;
    Request = class extends Request {
    };
    Response = class extends Response {
    };
    requestCounter = { value: internals.counter.min, min: internals.counter.min, max: internals.counter.max };
    root = null;
    router = null;
    settings = null;
    sockets = null;
    started = false;
    states = null;
    toolkit = new Toolkit.Manager;
    type = null;
    validator = null;
    extensionsSeq = 0;
    extensions = {
      server: {
        onPreStart: new Ext("onPreStart", this),
        onPostStart: new Ext("onPostStart", this),
        onPreStop: new Ext("onPreStop", this),
        onPostStop: new Ext("onPostStop", this)
      },
      route: {
        onRequest: new Ext("onRequest", this),
        onPreAuth: new Ext("onPreAuth", this),
        onCredentials: new Ext("onCredentials", this),
        onPostAuth: new Ext("onPostAuth", this),
        onPreHandler: new Ext("onPreHandler", this),
        onPostHandler: new Ext("onPostHandler", this),
        onPreResponse: new Ext("onPreResponse", this),
        onPostResponse: new Ext("onPostResponse", this)
      }
    };
    decorations = {
      handler: new Map,
      request: new Map,
      response: new Map,
      server: new Map,
      toolkit: new Map,
      requestApply: null,
      public: { handler: [], request: [], response: [], server: [], toolkit: [] }
    };
    constructor(options) {
      const { settings, type } = internals.setup(options);
      this.settings = settings;
      this.type = type;
      this.heavy = new Heavy(this.settings.load);
      this.mime = new Mimos(this.settings.mime);
      this.router = new Call.Router(this.settings.router);
      this.states = new Statehood.Definitions(this.settings.state);
      this._debug();
      this._initializeCache();
      if (this.settings.routes.validate.validator) {
        this.validator = Validation.validator(this.settings.routes.validate.validator);
      }
      this.listener = this._createListener();
      this._initializeListener();
      this.info = this._info();
    }
    _debug() {
      const debug = this.settings.debug;
      if (!debug) {
        return;
      }
      const method = (event) => {
        const data = event.error ?? event.data;
        console.error("Debug:", event.tags.join(", "), data ? "\n    " + (data.stack ?? (typeof data === "object" ? Hoek.stringify(data) : data)) : "");
      };
      if (debug.log) {
        const filter = debug.log.some((tag) => tag === "*") ? undefined : debug.log;
        this.events.on({ name: "log", filter }, method);
      }
      if (debug.request) {
        const filter = debug.request.some((tag) => tag === "*") ? undefined : debug.request;
        this.events.on({ name: "request", filter }, (request, event) => method(event));
      }
    }
    _initializeCache() {
      if (this.settings.cache) {
        this._createCache(this.settings.cache);
      }
      if (!this.caches.has("_default")) {
        this._createCache([{ provider: CatboxMemory }]);
      }
    }
    _info() {
      const now = Date.now();
      const protocol = this.type === "tcp" ? this.settings.tls ? "https" : "http" : this.type;
      const host = this.settings.host || Os.hostname() || "localhost";
      const port = this.settings.port;
      const info = {
        created: now,
        started: 0,
        host,
        port,
        protocol,
        id: Os.hostname() + ":" + process.pid + ":" + now.toString(36),
        uri: this.settings.uri ?? protocol + ":" + (this.type === "tcp" ? "//" + host + (port ? ":" + port : "") : port)
      };
      return info;
    }
    _counter() {
      const next = ++this.requestCounter.value;
      if (this.requestCounter.value > this.requestCounter.max) {
        this.requestCounter.value = this.requestCounter.min;
      }
      return next - 1;
    }
    _createCache(configs) {
      Hoek.assert(this.phase !== "initializing", "Cannot provision server cache while server is initializing");
      configs = Config.apply("cache", configs);
      const added = [];
      for (let config of configs) {
        if (typeof config === "function") {
          config = { provider: { constructor: config } };
        }
        const name = config.name ?? "_default";
        Hoek.assert(!this.caches.has(name), "Cannot configure the same cache more than once: ", name === "_default" ? "default cache" : name);
        let client = null;
        if (config.provider) {
          let provider = config.provider;
          if (typeof provider === "function") {
            provider = { constructor: provider };
          }
          client = new Catbox.Client(provider.constructor, provider.options ?? { partition: "hapi-cache" });
        } else {
          client = new Catbox.Client(config.engine);
        }
        this.caches.set(name, { client, segments: {}, shared: config.shared ?? false });
        added.push(client);
      }
      return added;
    }
    registerServer(server) {
      if (!this.root) {
        this.root = server;
        this._defaultRoutes();
      }
      this.instances.add(server);
    }
    async _start() {
      if (this.phase === "initialized" || this.phase === "started") {
        this._validateDeps();
      }
      if (this.phase === "started") {
        return;
      }
      if (this.phase !== "stopped" && this.phase !== "initialized") {
        throw new Error("Cannot start server while it is in " + this.phase + " phase");
      }
      if (this.phase !== "initialized") {
        await this._initialize();
      }
      this.phase = "starting";
      this.started = true;
      this.info.started = Date.now();
      try {
        await this._listen();
      } catch (err) {
        this.started = false;
        this.phase = "invalid";
        throw err;
      }
      this.phase = "started";
      this.events.emit("start");
      try {
        if (this.controlled) {
          await Promise.all(this.controlled.map((control) => control.start()));
        }
        await this._invoke("onPostStart");
      } catch (err) {
        this.phase = "invalid";
        throw err;
      }
    }
    _listen() {
      return new Promise((resolve, reject) => {
        if (!this.settings.autoListen) {
          resolve();
          return;
        }
        const onError = (err) => {
          reject(err);
          return;
        };
        this.listener.once("error", onError);
        const finalize = () => {
          this.listener.removeListener("error", onError);
          resolve();
          return;
        };
        if (this.type !== "tcp") {
          this.listener.listen(this.settings.port, finalize);
        } else {
          const address = this.settings.address || this.settings.host || null;
          this.listener.listen(this.settings.port, address, finalize);
        }
      });
    }
    async _initialize() {
      if (this.registring) {
        throw new Error("Cannot start server before plugins finished registration");
      }
      if (this.phase === "initialized") {
        return;
      }
      if (this.phase !== "stopped") {
        throw new Error("Cannot initialize server while it is in " + this.phase + " phase");
      }
      this._validateDeps();
      this.phase = "initializing";
      try {
        const caches = [];
        this.caches.forEach((cache) => caches.push(cache.client.start()));
        await Promise.all(caches);
        await this._invoke("onPreStart");
        this.heavy.start();
        this.phase = "initialized";
        if (this.controlled) {
          await Promise.all(this.controlled.map((control) => control.initialize()));
        }
      } catch (err) {
        this.phase = "invalid";
        throw err;
      }
    }
    _validateDeps() {
      for (const { deps, plugin } of this.dependencies) {
        for (const dep in deps) {
          const version = deps[dep];
          Hoek.assert(this.registrations[dep], "Plugin", plugin, "missing dependency", dep);
          Hoek.assert(version === "*" || Config.versionMatch(this.registrations[dep].version, version), "Plugin", plugin, "requires", dep, "version", version, "but found", this.registrations[dep].version);
        }
      }
    }
    async _stop(options = {}) {
      options.timeout = options.timeout ?? 5000;
      if (["stopped", "initialized", "started", "invalid"].indexOf(this.phase) === -1) {
        throw new Error("Cannot stop server while in " + this.phase + " phase");
      }
      this.phase = "stopping";
      try {
        await this._invoke("onPreStop");
        if (this.started) {
          this.started = false;
          this.info.started = 0;
          await this._unlisten(options.timeout);
        }
        const caches = [];
        this.caches.forEach((cache) => caches.push(cache.client.stop()));
        await Promise.all(caches);
        this.events.emit("stop");
        this.heavy.stop();
        if (this.controlled) {
          await Promise.all(this.controlled.map((control) => control.stop(options)));
        }
        await this._invoke("onPostStop");
        this.phase = "stopped";
      } catch (err) {
        this.phase = "invalid";
        throw err;
      }
    }
    _unlisten(timeout) {
      let timeoutId = null;
      if (this.settings.operations.cleanStop) {
        const destroy = () => {
          for (const connection of this.sockets) {
            connection.destroy();
          }
          this.sockets.clear();
        };
        timeoutId = setTimeout(destroy, timeout);
        for (const connection of this.sockets) {
          if (!this.actives.has(connection)) {
            connection.end();
          }
        }
      }
      return new Promise((resolve) => {
        this.listener.close(() => {
          if (this.settings.operations.cleanStop) {
            this.listener.removeListener(this.settings.tls ? "secureConnection" : "connection", this.onConnection);
            clearTimeout(timeoutId);
          }
          this._initializeListener();
          resolve();
        });
        this.events.emit("closing");
      });
    }
    async _invoke(type) {
      const exts = this.extensions.server[type];
      if (!exts.nodes) {
        return;
      }
      for (const ext of exts.nodes) {
        const bind = ext.bind ?? ext.realm.settings.bind;
        const operation = ext.func.call(bind, ext.server, bind);
        await Toolkit.timed(operation, { timeout: ext.timeout, name: type });
      }
    }
    _defaultRoutes() {
      this.router.special("notFound", new Route({ method: "_special", path: "/{p*}", handler: internals.notFound }, this.root, { special: true }));
      this.router.special("badRequest", new Route({ method: "_special", path: "/{p*}", handler: internals.badRequest }, this.root, { special: true }));
      if (this.settings.routes.cors) {
        Cors.handler(this.root);
      }
    }
    _dispatch(options = {}) {
      return (req, res) => {
        const request = Request.generate(this.root, req, res, options);
        if (this.settings.operations.cleanStop && req.socket) {
          this.actives.set(req.socket, request);
          const env = { core: this, req };
          res.on("finish", internals.onFinish.bind(res, env));
        }
        if (this.settings.load.sampleInterval) {
          try {
            this.heavy.check();
          } catch (err) {
            Bounce.rethrow(err, "system");
            this._log(["load"], this.heavy.load);
            request._reply(err);
            return;
          }
        }
        request._execute();
      };
    }
    _createListener() {
      const listener = this.settings.listener ?? (this.settings.tls ? Https.createServer(this.settings.tls) : Http.createServer());
      listener.on("request", this._dispatch());
      listener.on("checkContinue", this._dispatch({ expectContinue: true }));
      listener.on("clientError", (err, socket) => {
        this._log(["connection", "client", "error"], err);
        if (socket.readable) {
          const request = this.settings.operations.cleanStop && this.actives.get(socket);
          if (request) {
            if (err.code === "HPE_INVALID_METHOD") {
              request.raw.res.once("close", () => {
                if (socket.readable) {
                  socket.end(internals.badRequestResponse);
                } else {
                  socket.destroy(err);
                }
              });
              return;
            }
            const error = Boom.badRequest();
            error.output.headers = { connection: "close" };
            request._reply(error);
          } else {
            socket.end(internals.badRequestResponse);
          }
        } else {
          socket.destroy(err);
        }
      });
      return listener;
    }
    _initializeListener() {
      this.listener.once("listening", () => {
        if (this.type === "tcp") {
          const address = this.listener.address();
          this.info.address = address.address;
          this.info.port = address.port;
          this.info.uri = this.settings.uri ?? this.info.protocol + "://" + this.info.host + ":" + this.info.port;
        }
        if (this.settings.operations.cleanStop) {
          this.sockets = new Set;
          const self = this;
          const onClose = function() {
            self.sockets.delete(this);
          };
          this.onConnection = (connection) => {
            this.sockets.add(connection);
            connection.on("close", onClose);
          };
          this.listener.on(this.settings.tls ? "secureConnection" : "connection", this.onConnection);
        }
      });
    }
    _cachePolicy(options, _segment, realm) {
      options = Config.apply("cachePolicy", options);
      const plugin = realm?.plugin;
      const segment = options.segment ?? _segment ?? (plugin ? `!${plugin}` : "");
      Hoek.assert(segment, "Missing cache segment name");
      const cacheName = options.cache ?? "_default";
      const cache = this.caches.get(cacheName);
      Hoek.assert(cache, "Unknown cache", cacheName);
      Hoek.assert(!cache.segments[segment] || cache.shared || options.shared, "Cannot provision the same cache segment more than once");
      cache.segments[segment] = true;
      const policy = new Catbox.Policy(options, cache.client, segment);
      this.events.emit("cachePolicy", [policy, options.cache, segment]);
      return policy;
    }
    log(tags, data) {
      return this._log(tags, data, "app");
    }
    _log(tags, data, channel = "internal") {
      if (!this.events.hasListeners("log")) {
        return;
      }
      if (!Array.isArray(tags)) {
        tags = [tags];
      }
      const timestamp = Date.now();
      const field = data instanceof Error ? "error" : "data";
      let event = { timestamp, tags, [field]: data, channel };
      if (typeof data === "function") {
        event = () => ({ timestamp, tags, data: data(), channel });
      }
      this.events.emit({ name: "log", tags, channel }, event);
    }
  };
  internals.setup = function(options = {}) {
    let settings = Hoek.clone(options, { shallow: ["cache", "listener", "routes.bind"] });
    settings.app = settings.app ?? {};
    settings.routes = Config.enable(settings.routes);
    settings = Config.apply("server", settings);
    if (settings.port === undefined) {
      settings.port = 0;
    }
    const type = typeof settings.port === "string" ? "socket" : "tcp";
    if (type === "socket") {
      settings.port = settings.port.indexOf("/") !== -1 ? Path.resolve(settings.port) : settings.port.toLowerCase();
    }
    if (settings.autoListen === undefined) {
      settings.autoListen = true;
    }
    Hoek.assert(settings.autoListen || !settings.port, "Cannot specify port when autoListen is false");
    Hoek.assert(settings.autoListen || !settings.address, "Cannot specify address when autoListen is false");
    return { settings, type };
  };
  internals.notFound = function() {
    throw Boom.notFound();
  };
  internals.badRequest = function() {
    throw Boom.badRequest();
  };
  internals.onFinish = function(env) {
    const { core, req } = env;
    core.actives.delete(req.socket);
    if (!core.started) {
      req.socket.end();
    }
  };
});

// node_modules/@hapi/hapi/package.json
var require_package2 = __commonJS((exports, module) => {
  module.exports = {
    name: "@hapi/hapi",
    description: "HTTP Server framework",
    homepage: "https://hapi.dev",
    version: "21.3.12",
    repository: "git://github.com/hapijs/hapi",
    main: "lib/index.js",
    types: "lib/index.d.ts",
    engines: {
      node: ">=14.15.0"
    },
    files: [
      "lib"
    ],
    keywords: [
      "framework",
      "http",
      "api",
      "web"
    ],
    eslintConfig: {
      extends: [
        "plugin:@hapi/module"
      ]
    },
    dependencies: {
      "@hapi/accept": "^6.0.3",
      "@hapi/ammo": "^6.0.1",
      "@hapi/boom": "^10.0.1",
      "@hapi/bounce": "^3.0.2",
      "@hapi/call": "^9.0.1",
      "@hapi/catbox": "^12.1.1",
      "@hapi/catbox-memory": "^6.0.2",
      "@hapi/heavy": "^8.0.1",
      "@hapi/hoek": "^11.0.6",
      "@hapi/mimos": "^7.0.1",
      "@hapi/podium": "^5.0.1",
      "@hapi/shot": "^6.0.1",
      "@hapi/somever": "^4.1.1",
      "@hapi/statehood": "^8.1.1",
      "@hapi/subtext": "^8.1.0",
      "@hapi/teamwork": "^6.0.0",
      "@hapi/topo": "^6.0.2",
      "@hapi/validate": "^2.0.1"
    },
    devDependencies: {
      "@hapi/code": "^9.0.3",
      "@hapi/eslint-plugin": "^6.0.0",
      "@hapi/inert": "^7.1.0",
      "@hapi/joi-legacy-test": "npm:@hapi/joi@^15.0.0",
      "@hapi/lab": "^25.3.2",
      "@hapi/vision": "^7.0.3",
      "@hapi/wreck": "^18.1.0",
      "@types/node": "^18.19.59",
      handlebars: "^4.7.8",
      joi: "^17.13.3",
      "legacy-readable-stream": "npm:readable-stream@^1.0.34",
      typescript: "^4.9.4"
    },
    scripts: {
      test: "lab -a @hapi/code -t 100 -L -m 5000 -Y",
      "test-tap": "lab -a @hapi/code -r tap -o tests.tap -m 5000",
      "test-cov-html": "lab -a @hapi/code -r html -o coverage.html -m 5000"
    },
    license: "BSD-3-Clause"
  };
});

// node_modules/@hapi/hapi/lib/server.js
var require_server = __commonJS((exports, module) => {
  var Hoek = require_lib();
  var Shot = require_lib4();
  var Teamwork = require_lib5();
  var Config = require_config();
  var Core = require_core();
  var Cors = require_cors();
  var Ext = require_ext();
  var Package = require_package2();
  var Route = require_route();
  var Toolkit = require_toolkit();
  var Validation = require_validation();
  var internals = {};
  exports = module.exports = function(options) {
    const core = new Core(options);
    return new internals.Server(core);
  };
  internals.Server = class {
    constructor(core, name, parent) {
      this._core = core;
      this.app = core.app;
      this.auth = core.auth.public(this);
      this.decorations = core.decorations.public;
      this.cache = internals.cache(this);
      this.events = core.events;
      this.info = core.info;
      this.listener = core.listener;
      this.load = core.heavy.load;
      this.methods = core.methods.methods;
      this.mime = core.mime;
      this.plugins = core.plugins;
      this.registrations = core.registrations;
      this.settings = core.settings;
      this.states = core.states;
      this.type = core.type;
      this.version = Package.version;
      this.realm = {
        _extensions: {
          onPreAuth: new Ext("onPreAuth", core),
          onCredentials: new Ext("onCredentials", core),
          onPostAuth: new Ext("onPostAuth", core),
          onPreHandler: new Ext("onPreHandler", core),
          onPostHandler: new Ext("onPostHandler", core),
          onPreResponse: new Ext("onPreResponse", core),
          onPostResponse: new Ext("onPostResponse", core)
        },
        modifiers: {
          route: {}
        },
        parent: parent ? parent.realm : null,
        plugin: name,
        pluginOptions: {},
        plugins: {},
        _rules: null,
        settings: {
          bind: undefined,
          files: {
            relativeTo: undefined
          }
        },
        validator: null
      };
      for (const [property, method] of core.decorations.server.entries()) {
        this[property] = method;
      }
      core.registerServer(this);
    }
    _clone(name) {
      return new internals.Server(this._core, name, this);
    }
    bind(context) {
      Hoek.assert(typeof context === "object", "bind must be an object");
      this.realm.settings.bind = context;
    }
    control(server) {
      Hoek.assert(server instanceof internals.Server, "Can only control Server objects");
      this._core.controlled = this._core.controlled ?? [];
      this._core.controlled.push(server);
    }
    decoder(encoding, decoder) {
      return this._core.compression.addDecoder(encoding, decoder);
    }
    decorate(type, property, method, options = {}) {
      Hoek.assert(this._core.decorations.public[type], "Unknown decoration type:", type);
      Hoek.assert(property, "Missing decoration property name");
      Hoek.assert(typeof property === "string" || typeof property === "symbol", "Decoration property must be a string or a symbol");
      const propertyName = property.toString();
      Hoek.assert(propertyName[0] !== "_", "Property name cannot begin with an underscore:", propertyName);
      const existing = this._core.decorations[type].get(property);
      if (options.extend) {
        Hoek.assert(type !== "handler", "Cannot extent handler decoration:", propertyName);
        Hoek.assert(existing, `Cannot extend missing ${type} decoration: ${propertyName}`);
        Hoek.assert(typeof method === "function", `Extended ${type} decoration method must be a function: ${propertyName}`);
        method = method(existing);
      } else {
        Hoek.assert(existing === undefined, `${type[0].toUpperCase() + type.slice(1)} decoration already defined: ${propertyName}`);
      }
      if (type === "handler") {
        Hoek.assert(typeof method === "function", "Handler must be a function:", propertyName);
        Hoek.assert(!method.defaults || typeof method.defaults === "object" || typeof method.defaults === "function", "Handler defaults property must be an object or function");
        Hoek.assert(!options.extend, "Cannot extend handler decoration:", propertyName);
      } else if (type === "request") {
        Hoek.assert(!this._core.Request.reserved.includes(property), "Cannot override built-in request interface decoration:", propertyName);
        if (options.apply) {
          this._core.decorations.requestApply = this._core.decorations.requestApply ?? new Map;
          this._core.decorations.requestApply.set(property, method);
        } else {
          this._core.Request.prototype[property] = method;
        }
      } else if (type === "response") {
        Hoek.assert(!this._core.Response.reserved.includes(property), "Cannot override built-in response interface decoration:", propertyName);
        this._core.Response.prototype[property] = method;
      } else if (type === "toolkit") {
        Hoek.assert(!Toolkit.reserved.includes(property), "Cannot override built-in toolkit decoration:", propertyName);
        this._core.toolkit.decorate(property, method);
      } else {
        if (typeof property === "string") {
          Hoek.assert(!Object.getOwnPropertyNames(internals.Server.prototype).includes(property), "Cannot override the built-in server interface method:", propertyName);
        } else {
          Hoek.assert(!Object.getOwnPropertySymbols(internals.Server.prototype).includes(property), "Cannot override the built-in server interface method:", propertyName);
        }
        this._core.instances.forEach((server) => {
          server[property] = method;
        });
      }
      this._core.decorations[type].set(property, method);
      this._core.decorations.public[type].push(property);
    }
    dependency(dependencies, after) {
      Hoek.assert(this.realm.plugin, "Cannot call dependency() outside of a plugin");
      Hoek.assert(!after || typeof after === "function", "Invalid after method");
      if (typeof dependencies === "string") {
        dependencies = { [dependencies]: "*" };
      } else if (Array.isArray(dependencies)) {
        const map = {};
        for (const dependency of dependencies) {
          map[dependency] = "*";
        }
        dependencies = map;
      }
      this._core.dependencies.push({ plugin: this.realm.plugin, deps: dependencies });
      if (after) {
        this.ext("onPreStart", after, { after: Object.keys(dependencies) });
      }
    }
    encoder(encoding, encoder) {
      return this._core.compression.addEncoder(encoding, encoder);
    }
    event(event) {
      this._core.events.registerEvent(event);
    }
    expose(key, value, options = {}) {
      Hoek.assert(this.realm.plugin, "Cannot call expose() outside of a plugin");
      let plugin = this.realm.plugin;
      if (plugin[0] === "@" && options.scope !== true) {
        plugin = plugin.replace(/^@([^/]+)\//, ($0, $1) => {
          return !options.scope ? "" : `${$1}__`;
        });
      }
      this._core.plugins[plugin] = this._core.plugins[plugin] ?? {};
      if (typeof key === "string") {
        this._core.plugins[plugin][key] = value;
      } else {
        Hoek.merge(this._core.plugins[plugin], key);
      }
    }
    ext(events, method, options) {
      let promise;
      if (typeof events === "string") {
        if (!method) {
          const team = new Teamwork.Team;
          method = (request, h) => {
            team.attend(request);
            return h.continue;
          };
          promise = team.work;
        }
        events = { type: events, method, options };
      }
      events = Config.apply("exts", events);
      for (const event of events) {
        this._ext(event);
      }
      return promise;
    }
    _ext(event) {
      event = Object.assign({}, event);
      event.realm = this.realm;
      const type = event.type;
      if (!this._core.extensions.server[type]) {
        if (event.options.sandbox === "plugin") {
          Hoek.assert(this.realm._extensions[type], "Unknown event type", type);
          return this.realm._extensions[type].add(event);
        }
        Hoek.assert(this._core.extensions.route[type], "Unknown event type", type);
        return this._core.extensions.route[type].add(event);
      }
      Hoek.assert(!event.options.sandbox, "Cannot specify sandbox option for server extension");
      Hoek.assert(type !== "onPreStart" || this._core.phase === "stopped", "Cannot add onPreStart (after) extension after the server was initialized");
      event.server = this;
      this._core.extensions.server[type].add(event);
    }
    async inject(options) {
      let settings = options;
      if (typeof settings === "string") {
        settings = { url: settings };
      }
      if (!settings.authority || settings.auth || settings.app || settings.plugins || settings.allowInternals !== undefined) {
        settings = Object.assign({}, settings);
        delete settings.auth;
        delete settings.app;
        delete settings.plugins;
        delete settings.allowInternals;
        settings.authority = settings.authority ?? this._core.info.host + ":" + this._core.info.port;
      }
      Hoek.assert(!options.credentials, "options.credentials no longer supported (use options.auth)");
      if (options.auth) {
        Hoek.assert(typeof options.auth === "object", "options.auth must be an object");
        Hoek.assert(options.auth.credentials, "options.auth.credentials is missing");
        Hoek.assert(options.auth.strategy, "options.auth.strategy is missing");
      }
      const needle = this._core._dispatch({
        auth: options.auth,
        allowInternals: options.allowInternals,
        app: options.app,
        plugins: options.plugins,
        isInjected: true
      });
      const res = await Shot.inject(needle, settings);
      const custom = res.raw.res[Config.symbol];
      if (custom) {
        delete res.raw.res[Config.symbol];
        res.request = custom.request;
        if (custom.error) {
          throw custom.error;
        }
        if (custom.result !== undefined) {
          res.result = custom.result;
        }
      }
      if (res.result === undefined) {
        res.result = res.payload;
      }
      return res;
    }
    log(tags, data) {
      return this._core.log(tags, data);
    }
    lookup(id) {
      Hoek.assert(id && typeof id === "string", "Invalid route id:", id);
      const record = this._core.router.ids.get(id);
      if (!record) {
        return null;
      }
      return record.route.public;
    }
    match(method, path, host) {
      Hoek.assert(method && typeof method === "string", "Invalid method:", method);
      Hoek.assert(path && typeof path === "string" && path[0] === "/", "Invalid path:", path);
      Hoek.assert(!host || typeof host === "string", "Invalid host:", host);
      const match = this._core.router.route(method.toLowerCase(), path, host);
      Hoek.assert(match !== this._core.router.specials.badRequest, "Invalid path:", path);
      if (match === this._core.router.specials.notFound) {
        return null;
      }
      return match.route.public;
    }
    method(name, method, options = {}) {
      return this._core.methods.add(name, method, options, this.realm);
    }
    path(relativeTo) {
      Hoek.assert(relativeTo && typeof relativeTo === "string", "relativeTo must be a non-empty string");
      this.realm.settings.files.relativeTo = relativeTo;
    }
    async register(plugins, options = {}) {
      if (this.realm.modifiers.route.prefix || this.realm.modifiers.route.vhost) {
        options = Hoek.clone(options);
        options.routes = options.routes ?? {};
        options.routes.prefix = (this.realm.modifiers.route.prefix ?? "") + (options.routes.prefix ?? "") || undefined;
        options.routes.vhost = this.realm.modifiers.route.vhost ?? options.routes.vhost;
      }
      options = Config.apply("register", options);
      ++this._core.registring;
      try {
        const items = [].concat(plugins);
        for (let item of items) {
          if (!item.plugin) {
            item = {
              plugin: item
            };
          } else if (!item.plugin.register) {
            item = {
              options: item.options,
              once: item.once,
              routes: item.routes,
              plugin: item.plugin.plugin
            };
          } else if (typeof item === "function") {
            item = Object.assign({}, item);
          }
          item = Config.apply("plugin", item);
          const name = item.plugin.name ?? item.plugin.pkg.name;
          const clone = this._clone(name);
          clone.realm.modifiers.route.prefix = item.routes.prefix ?? options.routes.prefix;
          clone.realm.modifiers.route.vhost = item.routes.vhost ?? options.routes.vhost;
          clone.realm.pluginOptions = item.options ?? {};
          const requirements = item.plugin.requirements;
          Hoek.assert(!requirements.node || Config.versionMatch(process.version, requirements.node), "Plugin", name, "requires node version", requirements.node, "but found", process.version);
          Hoek.assert(!requirements.hapi || Config.versionMatch(this.version, requirements.hapi), "Plugin", name, "requires hapi version", requirements.hapi, "but found", this.version);
          if (this._core.registrations[name]) {
            if (item.plugin.once || item.once || options.once) {
              continue;
            }
            Hoek.assert(item.plugin.multiple, "Plugin", name, "already registered");
          } else {
            this._core.registrations[name] = {
              version: item.plugin.version ?? item.plugin.pkg.version,
              name,
              options: item.options
            };
          }
          if (item.plugin.dependencies) {
            clone.dependency(item.plugin.dependencies);
          }
          await item.plugin.register(clone, item.options ?? {});
        }
      } finally {
        --this._core.registring;
      }
      return this;
    }
    route(options) {
      Hoek.assert(typeof options === "object", "Invalid route options");
      options = [].concat(options);
      for (const config of options) {
        if (Array.isArray(config.method)) {
          for (const method of config.method) {
            const settings = Object.assign({}, config);
            settings.method = method;
            this._addRoute(settings, this);
          }
        } else {
          this._addRoute(config, this);
        }
      }
    }
    _addRoute(config, server) {
      const route = new Route(config, server);
      const vhosts = [].concat(route.settings.vhost ?? "*");
      for (const vhost of vhosts) {
        const record = this._core.router.add({ method: route.method, path: route.path, vhost, analysis: route._analysis, id: route.settings.id }, route);
        route.fingerprint = record.fingerprint;
        route.params = record.params;
      }
      this.events.emit("route", route.public);
      Cors.options(route.public, server);
    }
    rules(processor, options = {}) {
      Hoek.assert(!this.realm._rules, "Server realm rules already defined");
      const settings = Config.apply("rules", options);
      if (settings.validate) {
        const schema = settings.validate.schema;
        settings.validate.schema = Validation.compile(schema, null, this.realm, this._core);
      }
      this.realm._rules = { processor, settings };
    }
    state(name, options) {
      this.states.add(name, options);
    }
    table(host) {
      return this._core.router.table(host);
    }
    validator(validator) {
      Hoek.assert(!this.realm.validator, "Validator already set");
      this.realm.validator = Validation.validator(validator);
    }
    start() {
      return this._core._start();
    }
    initialize() {
      return this._core._initialize();
    }
    stop(options) {
      return this._core._stop(options);
    }
  };
  internals.cache = (plugin) => {
    const policy = function(options, _segment) {
      return this._core._cachePolicy(options, _segment, plugin.realm);
    };
    policy.provision = async (opts) => {
      const clients = plugin._core._createCache(opts);
      if (["initialized", "starting", "started"].includes(plugin._core.phase)) {
        await Promise.all(clients.map((client) => client.start()));
      }
    };
    return policy;
  };
});

// node_modules/@hapi/hapi/lib/index.js
var require_lib29 = __commonJS((exports) => {
  var Server = require_server();
  exports.Server = Server;
  exports.server = Server;
});

// src/index.ts
var import_hapi = __toESM(require_lib29(), 1);

// node_modules/nanoid/index.js
import { webcrypto as crypto } from "node:crypto";

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.js
function fillPool(bytes) {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.getRandomValues(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.getRandomValues(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
}
function nanoid(size = 21) {
  fillPool(size -= 0);
  let id = "";
  for (let i = poolOffset - size;i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id;
}
var POOL_SIZE_MULTIPLIER = 128;
var pool;
var poolOffset;

// src/repositories/impl/book-repository-impl.ts
class BookRepositoryImpl {
  #database;
  constructor(database) {
    this.#database = database;
  }
  create(data) {
    const id = nanoid();
    const now = new Date;
    const newBook = {
      ...data,
      id,
      bookId: id,
      insertedAt: now,
      updatedAt: now
    };
    this.#database.push(newBook);
    return newBook;
  }
  getAll(params) {
    let books = [...this.#database];
    if (params.reading !== undefined) {
      books = books.filter((book) => book.reading === params.reading);
    }
    if (params.finished !== undefined) {
      books = books.filter((book) => book.finished === params.finished);
    }
    if (params.name !== undefined) {
      books = books.filter((book) => book.name.toLowerCase().includes(params.name?.toLowerCase() ?? ""));
    }
    return books.map((book) => ({ id: book.id, name: book.name, publisher: book.publisher }));
  }
  getByID(id) {
    return this.#database.find((book) => book.id === id);
  }
  updateByID(id, data) {
    if (!this.#database.some((book) => book.id === id)) {
      return false;
    }
    const now = new Date;
    this.#database = this.#database.map((book) => {
      if (book.id === id) {
        return {
          ...book,
          ...data,
          updatedAt: now
        };
      }
      return book;
    });
    return true;
  }
  deleteByID(id) {
    if (!this.#database.some((book) => book.id === id)) {
      return false;
    }
    this.#database = this.#database.filter((book) => book.id !== id);
    return true;
  }
}

// node_modules/zod/lib/index.mjs
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === errorMap ? undefined : errorMap
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap)
    return { errorMap, description };
  const customMap = (iss, ctx) => {
    var _a, _b;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== undefined ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a = message !== null && message !== undefined ? message : required_error) !== null && _a !== undefined ? _a : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message !== null && message !== undefined ? message : invalid_type_error) !== null && _b !== undefined ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}\$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}\$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function custom(check, params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      if (!check(data)) {
        const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b = (_a = p.fatal) !== null && _a !== undefined ? _a : fatal) !== null && _b !== undefined ? _b : true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error;
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

class ZodError extends Error {
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  get errors() {
    return this.issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var overrideErrorMap = errorMap;
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === undefined ? undefined : message.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache;
var _ZodNativeEnum_cache;

class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};

class ZodType {
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus,
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === undefined ? undefined : params.async) !== null && _a !== undefined ? _a : false,
        contextualErrorMap: params === null || params === undefined ? undefined : params.errorMap
      },
      path: (params === null || params === undefined ? undefined : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === undefined ? undefined : params.errorMap,
        async: true
      },
      path: (params === null || params === undefined ? undefined : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this, this._def);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+\$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}\$`);

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a, _b;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === undefined ? undefined : options.precision) === "undefined" ? null : options === null || options === undefined ? undefined : options.precision,
      offset: (_a = options === null || options === undefined ? undefined : options.offset) !== null && _a !== undefined ? _a : false,
      local: (_b = options === null || options === undefined ? undefined : options.local) !== null && _b !== undefined ? _b : false,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === undefined ? undefined : options.precision) === "undefined" ? null : options === null || options === undefined ? undefined : options.precision,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === undefined ? undefined : options.position,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === undefined ? undefined : params.coerce) !== null && _a !== undefined ? _a : false,
    ...processCreateParams(params)
  });
};

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = BigInt(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === undefined ? undefined : params.coerce) !== null && _a !== undefined ? _a : false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip")
        ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== undefined ? {
        errorMap: (issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === undefined ? undefined : _b.call(_a, issue, ctx).message) !== null && _c !== undefined ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== undefined ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map;
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map;
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map;
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = new Set;
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};

class ZodEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, undefined);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodEnum_cache, new Set(this._def.values), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
_ZodEnum_cache = new WeakMap;
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, undefined);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
_ZodNativeEnum_cache = new WeakMap;
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};

class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  enum: enumType,
  function: functionType,
  instanceof: instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  null: nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  undefined: undefinedType,
  union: unionType,
  unknown: unknownType,
  void: voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// src/types/book.ts
var createBookSchema = z.object({
  name: z.string({ message: "Gagal menambahkan buku. Mohon isi nama buku" }),
  readPage: z.number().nonnegative(),
  pageCount: z.number(),
  year: z.number(),
  author: z.string(),
  summary: z.string(),
  publisher: z.string(),
  reading: z.boolean().default(false),
  finished: z.boolean().default(false)
}).refine((data) => {
  return data.readPage <= data.pageCount;
}, {
  message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
}).transform((data, ctx) => {
  if (data.readPage === data.pageCount) {
    data.finished = true;
  }
  return data;
});
var updateBookSchema = z.object({
  name: z.string({ message: "Gagal memperbarui buku. Mohon isi nama buku" }),
  readPage: z.number().nonnegative(),
  pageCount: z.number(),
  year: z.number(),
  author: z.string(),
  summary: z.string(),
  publisher: z.string(),
  reading: z.boolean().default(false),
  finished: z.boolean().default(false)
}).refine((data) => data.readPage <= data.pageCount, {
  message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
}).transform((data, ctx) => {
  if (data.readPage === data.pageCount) {
    data.finished = true;
  }
  return data;
});
var getAllBookParamsSchema = z.object({
  reading: z.boolean().optional(),
  finished: z.boolean().optional(),
  name: z.string().optional()
});

// src/routes/book-route.ts
class BookRoute {
  services;
  constructor(services, server) {
    this.services = services;
    server.route({
      method: "post",
      path: "/books",
      handler: async (req, res) => {
        const body = req.payload;
        const result = await this.create(body);
        return res.response({ status: "success", message: "Buku berhasil ditambahkan", data: result }).code(201);
      },
      options: {
        validate: {
          payload: createBookSchema,
          failAction: (req, res, error) => {
            const err = JSON.parse(error?.message || "");
            return res.response({
              status: "fail",
              message: err?.[0]?.message
            }).code(400).takeover();
          }
        }
      }
    });
    server.route({
      method: "get",
      path: "/books",
      handler: async (req, res) => {
        let { reading, finished, name } = req.query;
        if (reading !== undefined) {
          if (reading === "1")
            reading = true;
          if (reading === "0")
            reading = false;
        }
        if (finished !== undefined) {
          if (finished === "1")
            finished = true;
          if (finished === "0")
            finished = false;
        }
        const result = await this.getAll({ reading, finished, name });
        return res.response({ status: "success", message: "Buku berhasil ditemukan", data: { books: result } }).code(200);
      }
    });
    server.route({
      method: "get",
      path: "/books/{id}",
      handler: async (req, res) => {
        const id = req.params.id;
        const result = await this.getByID(id);
        if (!result) {
          return res.response({ status: "fail", message: "Buku tidak ditemukan", data: { book: result } }).code(404);
        }
        return res.response({ status: "success", message: "Buku berhasil ditemukan", data: { book: result } }).code(200);
      }
    });
    server.route({
      method: "put",
      path: "/books/{id}",
      handler: async (req, res) => {
        const id = req.params.id;
        const body = req.payload;
        const result = await this.updateByID(id, body);
        if (!result) {
          return res.response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
            data: result
          }).code(404);
        }
        return res.response({ status: "success", message: "Buku berhasil diperbarui", data: result }).code(200);
      },
      options: {
        validate: {
          payload: updateBookSchema,
          failAction: (req, res, error) => {
            const err = JSON.parse(error?.message || "");
            return res.response({
              status: "fail",
              message: err?.[0]?.message
            }).code(400).takeover();
          }
        }
      }
    });
    server.route({
      method: "delete",
      path: "/books/{id}",
      handler: async (req, res) => {
        const id = req.params.id;
        const result = await this.deleteByID(id);
        if (!result) {
          return res.response({ status: "fail", message: "Buku gagal dihapus. Id tidak ditemukan", data: result }).code(404);
        }
        return res.response({ status: "success", message: "Buku berhasil dihapus" }).code(200);
      }
    });
  }
  create(data) {
    return this.services.bookService.create(data);
  }
  getAll(params) {
    return this.services.bookService.getAll(params);
  }
  getByID(id) {
    return this.services.bookService.getByID(id);
  }
  updateByID(id, data) {
    return this.services.bookService.updateByID(id, data);
  }
  deleteByID(id) {
    return this.services.bookService.deleteByID(id);
  }
}

// src/routes/health-route.ts
class HealthRoute {
  constructor(server) {
    server.route({
      method: "get",
      path: "/health",
      handler: () => this.getHealth()
    });
  }
  getHealth() {
    return { message: "OK" };
  }
}

// src/services/impl/book-service-impl.ts
class BookServiceImpl {
  repositories;
  constructor(repositories) {
    this.repositories = repositories;
  }
  create(data) {
    return this.repositories.bookRepository.create(data);
  }
  getByID(id) {
    return this.repositories.bookRepository.getByID(id);
  }
  getAll(params) {
    return this.repositories.bookRepository.getAll(params);
  }
  updateByID(id, data) {
    return this.repositories.bookRepository.updateByID(id, data);
  }
  deleteByID(id) {
    return this.repositories.bookRepository.deleteByID(id);
  }
}

// src/index.ts
async function main() {
  const server = import_hapi.default.server({
    port: 9000,
    host: "localhost"
  });
  server.validator(zodValidator);
  const database = [];
  const repositories = {
    bookRepository: new BookRepositoryImpl(database)
  };
  const services = {
    bookService: new BookServiceImpl(repositories)
  };
  new HealthRoute(server);
  new BookRoute(services, server);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}
var zodValidator = {
  compile: (schema) => ({
    validate: (val) => schema.parse(val)
  })
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
main();
