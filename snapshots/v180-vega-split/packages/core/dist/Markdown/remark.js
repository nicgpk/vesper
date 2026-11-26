// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file remark.ts
 * @input Synchronous transform-only Remark plugins over the supported MDAST subset
 * @output A Markdown transform that applies a validated round trip or fails closed
 * @position Optional tree-shakeable compatibility adapter; never imported by Markdown
 */

import { isMarkdownPluginData } from "./plugins/protocol.js";
import { isSafeMarkdownParserUrl } from "./url.js";

/* ------------------------------------------------------------------ *
 * Public mutable tree the adapted plugin observes
 * ------------------------------------------------------------------ */

/** Astryx-owned citation. Read-only inside the adapter. */

/** Astryx-owned plugin extension node. Read-only inside the adapter. */

/* ------------------------------------------------------------------ *
 * Public constrained file and plugin shapes
 * ------------------------------------------------------------------ */

/**
 * The isolated per-invocation file. It exposes readonly source text, finite
 * JSON-like data, and diagnostics — never processor registration, cross-run
 * state, a compiler, I/O, or asynchronous completion.
 */

/**
 * A Remark transformer either mutates the tree and returns nothing or returns
 * a replacement root, and an attacher may legitimately return nothing at all.
 * Both shapes have to stay assignable, so `void` belongs in these unions.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- see above

/**
 * The structural shape a conventional Unified/Remark plugin already has. Its
 * declared transformer may take Unified's callback parameter and may declare
 * an asynchronous return union, so an existing typed plugin type-checks at the
 * callsite without being rewritten. The adapter rejects an actual promise, and
 * a callback-style transformer, at run time instead.
 *
 * Authoring a new plugin against Astryx? Annotate it with
 * `MarkdownRemarkPlugin` to keep a typed tree and file.
 */

/* ------------------------------------------------------------------ *
 * Internal helpers
 * ------------------------------------------------------------------ */

/** Links a mutable copy back to the canonical node it was copied from. */
const REMARK_ORIGIN = Symbol('astryx.markdown.remarkOrigin');

/** hast escape channels; they are raw-markup sinks, not Markdown data. */
const RAW_MARKUP_DATA_KEYS = ['hName', 'hProperties', 'hChildren'];
const PHRASING_TYPES = new Set(['text', 'inlineCode', 'inlineMath', 'break', 'strong', 'emphasis', 'delete', 'link', 'image', 'citation']);
const BLOCK_TYPES = new Set(['heading', 'paragraph', 'code', 'math', 'blockquote', 'list', 'table', 'thematicBreak', 'image']);
const PHRASING_PARENTS = new Set(['heading', 'paragraph', 'strong', 'emphasis', 'delete', 'link', 'tableCell']);
const BLOCK_PARENTS = new Set(['root', 'blockquote', 'listItem']);
const FIELDS_BY_TYPE = {
  root: ['children'],
  paragraph: ['children'],
  heading: ['depth', 'children'],
  blockquote: ['children'],
  strong: ['children'],
  emphasis: ['children'],
  delete: ['children'],
  tableRow: ['children'],
  tableCell: ['children'],
  text: ['value'],
  inlineCode: ['value'],
  inlineMath: ['value'],
  math: ['value'],
  code: ['lang', 'meta', 'value'],
  link: ['url', 'title', 'children'],
  image: ['url', 'title', 'alt'],
  list: ['ordered', 'start', 'spread', 'delimiter', 'children'],
  listItem: ['checked', 'spread', 'children'],
  table: ['align', 'children'],
  thematicBreak: [],
  break: [],
  citation: ['sourceId'],
  extension: ['plugin', 'name', 'display', 'source']
};

/**
 * MDAST node kinds Astryx recognizes by name but deliberately does not
 * support. Naming them makes a rejection actionable while keeping every
 * diagnostic built from adapter-owned vocabulary only.
 */
const NAMED_UNSUPPORTED_TYPES = new Set(['html', 'yaml', 'toml', 'definition', 'footnote', 'footnoteDefinition', 'footnoteReference', 'imageReference', 'linkReference', 'containerDirective', 'leafDirective', 'textDirective', 'mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression', 'mdxJsxFlowElement', 'mdxJsxTextElement']);

/**
 * VFile keys the profile knows about and refuses. Naming them makes the
 * refusal actionable while keeping diagnostics free of plugin-chosen text.
 */
const NAMED_UNSUPPORTED_FILE_KEYS = new Set(['path', 'cwd', 'history', 'basename', 'dirname', 'extname', 'stem', 'stored', 'result', 'map', 'contents']);

/** The one reason reported when a plugin declares the document unsupported. */
const FAILED_BY_PLUGIN = 'the plugin reported the document as unsupported';

/**
 * A closed rejection.
 *
 * Its reason is assembled only from this module's own constants, so it can
 * never carry document source, plugin-authored text, or a plugin-chosen
 * identifier — see `knownType` and `knownField`.
 */
class RemarkAdapterRejection extends Error {}

/**
 * The reason for each rejection this module raised, keyed by the thrown
 * object.
 *
 * A plugin that catches one of our rejections can reach the class through
 * `error.constructor` and throw a forgery, and `message` is writable on any
 * Error — so neither the class nor the message is evidence. Only a throw this
 * registry recorded is trusted, and its reason is read from here.
 */
const adapterReasons = new WeakMap();

/**
 * Sticky failure state for the run currently on the stack.
 *
 * Every rejection this module raises is recorded here, not only on the throw:
 * a plugin can wrap any adapter call in `try`/`catch` — a prohibited file
 * read, a write, a `delete`, a processor access — and carry on as if it had
 * not happened. The run must still fail, so the verdict lives somewhere the
 * plugin cannot reach or rewrite.
 *
 * Runs never overlap: the adapter is synchronous and rejects anything
 * asynchronous, so a single module-level slot is the whole story.
 */
let activeRun = null;
function createRunState() {
  return {
    failed: false,
    reason: null
  };
}
function reject(reason) {
  if (activeRun != null && !activeRun.failed) {
    activeRun.failed = true;
    activeRun.reason = reason;
  }
  const rejection = new RemarkAdapterRejection(reason);
  adapterReasons.set(rejection, reason);
  throw rejection;
}

/**
 * Runs `work` with `state` as the sticky failure target, restoring whatever
 * was active before.
 */
function withRunState(state, work) {
  const previous = activeRun;
  activeRun = state;
  try {
    return work();
  } finally {
    activeRun = previous;
  }
}

/**
 * Reports whether a value is thenable and, if it is, attaches a handler.
 *
 * An already-rejected promise with no handler becomes an unhandled rejection:
 * it ends a Node SSR process by default, and its reason came from the plugin,
 * so it would print document text the diagnostics work hard to keep out. The
 * value is refused either way; attaching a handler only makes the refusal
 * quiet.
 *
 * `then` is read exactly once. It may be a hostile getter — reading it can
 * throw, or trip a guard of its own — so this never reads it a second time to
 * re-ask the same question.
 */
function defuseThenable(value) {
  if (typeof value !== 'object' && typeof value !== 'function' || value === null) {
    return false;
  }
  let then;
  try {
    then = value.then;
  } catch {
    // A `then` accessor that throws is a thenable-shaped hostile value.
    return true;
  }
  if (typeof then !== 'function') {
    return false;
  }
  try {
    then.call(value, () => {}, () => {});
  } catch {
    // A `then` that throws when called is refused all the same.
  }
  return true;
}

/** Echoes a node type only when it is adapter-owned vocabulary. */
function knownType(type) {
  return typeof type === 'string' && (Object.prototype.hasOwnProperty.call(FIELDS_BY_TYPE, type) || NAMED_UNSUPPORTED_TYPES.has(type)) ? type : 'unknown';
}

/**
 * Echoes a file key only when it is a name this module already documents —
 * the supported surface, or an unsupported VFile key the profile explicitly
 * names. A plugin-chosen key is never echoed.
 */
function knownFileKey(property) {
  const key = typeof property === 'symbol' ? 'unknown' : property;
  return FILE_SURFACE.has(key) || NAMED_UNSUPPORTED_FILE_KEYS.has(key) ? key : 'unknown';
}

/** Echoes a field name only when it is adapter-owned vocabulary. */
function knownField(type, field) {
  return field === 'position' || field === 'data' || field === 'type' || RAW_MARKUP_DATA_KEYS.includes(field) || (FIELDS_BY_TYPE[type]?.includes(field) ?? false) ? field : 'unknown';
}
function isPlainObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
const POINT_FIELDS = ['line', 'column', 'offset'];
const POSITION_FIELDS = ['start', 'end'];
function samePoint(left, right) {
  if (!isPlainObject(left) || !isPlainObject(right)) {
    return false;
  }
  for (const point of [left, right]) {
    for (const field of Object.keys(point)) {
      if (!POINT_FIELDS.includes(field)) {
        return false;
      }
    }
  }
  return POINT_FIELDS.every(field => left[field] === right[field]);
}

/**
 * Exact provenance equality: every line, column, and offset on both points.
 * Comparing offsets alone would let a shifted line or column through, and the
 * adapter must never quietly restore Core's position over a changed one.
 */
function samePosition(left, right) {
  if (left === undefined || right === undefined) {
    return left === right;
  }
  if (!isPlainObject(left) || !isPlainObject(right)) {
    return false;
  }
  for (const position of [left, right]) {
    for (const field of Object.keys(position)) {
      if (!POSITION_FIELDS.includes(field)) {
        return false;
      }
    }
  }
  return samePoint(left.start, right.start) && samePoint(left.end, right.end);
}
function copyPoint(point) {
  if (!isPlainObject(point)) {
    return undefined;
  }
  const copy = {};
  if (typeof point.line === 'number') {
    copy.line = point.line;
  }
  if (typeof point.column === 'number') {
    copy.column = point.column;
  }
  if (typeof point.offset === 'number') {
    copy.offset = point.offset;
  }
  return copy;
}
function copyPosition(position) {
  if (!isPlainObject(position)) {
    return undefined;
  }
  const start = copyPoint(position.start);
  const end = copyPoint(position.end);
  return start == null || end == null ? undefined : {
    start,
    end
  };
}
function copyData(value) {
  if (Array.isArray(value)) {
    const copy = [];
    for (const entry of value) {
      copy.push(copyData(entry));
    }
    return copy;
  }
  if (isPlainObject(value)) {
    const copy = {};
    for (const [key, nested] of Object.entries(value)) {
      copy[key] = copyData(nested);
    }
    return copy;
  }
  return value;
}
function sameJsonValue(left, right) {
  if (left === right) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => sameJsonValue(item, right[index]));
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length && leftKeys.every(key => key in right && sameJsonValue(left[key], right[key]));
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Canonical tree → fresh mutable Remark tree
 * ------------------------------------------------------------------ */

function createOriginIndex() {
  return {
    all: new Set()
  };
}
function indexOrigin(node, index) {
  index.all.add(node);
}
function toRemarkChildren(children, index) {
  return Array.isArray(children) ? children.map(child => toRemarkNode(child, index)) : [];
}
function toRemarkNode(node, index) {
  indexOrigin(node, index);
  const copy = {
    type: node.type
  };
  switch (node.type) {
    case 'root':
    case 'paragraph':
    case 'blockquote':
    case 'strong':
    case 'emphasis':
    case 'delete':
    case 'tableRow':
    case 'tableCell':
    case 'listItem':
      if (node.type === 'listItem' && typeof node.checked === 'boolean') {
        copy.checked = node.checked;
      }
      copy.children = toRemarkChildren(node.children, index);
      break;
    case 'heading':
      copy.depth = node.depth;
      copy.children = toRemarkChildren(node.children, index);
      break;
    case 'text':
    case 'inlineCode':
    case 'inlineMath':
    case 'math':
      copy.value = node.value;
      break;
    case 'code':
      copy.lang = node.lang ?? null;
      // Astryx stores an absent info string as no key; MDAST spells it
      // `null`. Both conversions translate, so authored fence metadata —
      // which the semantic-fence helper reads — survives the round trip.
      copy.meta = node.meta ?? null;
      copy.value = node.value;
      break;
    case 'link':
      copy.url = node.url;
      copy.title = null;
      copy.children = toRemarkChildren(node.children, index);
      break;
    case 'image':
      copy.url = node.url;
      copy.title = null;
      copy.alt = node.alt;
      break;
    case 'list':
      copy.ordered = node.ordered;
      if (node.start !== undefined) {
        copy.start = node.start;
      }
      if (node.spread !== undefined) {
        copy.spread = node.spread;
      }
      if (node.delimiter !== undefined) {
        copy.delimiter = node.delimiter;
      }
      copy.children = toRemarkChildren(node.children, index);
      break;
    case 'table':
      copy.align = Array.isArray(node.align) ? [...node.align] : [];
      copy.children = toRemarkChildren(node.children, index);
      break;
    case 'citation':
      copy.sourceId = node.sourceId;
      break;
    case 'extension':
      copy.plugin = node.plugin;
      copy.name = node.name;
      copy.display = node.display;
      if (node.source !== undefined) {
        copy.source = node.source;
      }
      break;
    default:
      break;
  }
  if (node.data !== undefined) {
    copy.data = copyData(node.data);
  }
  const position = copyPosition(node.position);
  if (position != null) {
    copy.position = position;
  }
  // Enumerable so an immutable-style plugin that spreads a node keeps its
  // provenance; symbol-keyed so it never reaches JSON, data, or rendering.
  Object.defineProperty(copy, REMARK_ORIGIN, {
    configurable: false,
    enumerable: true,
    value: node,
    writable: false
  });
  return copy;
}

/* ------------------------------------------------------------------ *
 * Mutated Remark tree → validated canonical tree
 * ------------------------------------------------------------------ */

/**
 * Resolves the canonical node a transformed node came from.
 *
 * Provenance travels on an enumerable symbol the adapter puts on every copy,
 * so a plugin that spreads a node (`{...node}`) keeps it. Nothing else counts:
 * a node that merely looks like a source node — same position, same
 * discriminants, rebuilt from scratch — is a forgery, not provenance, and is
 * rejected rather than matched.
 */
function resolveOrigin(node, type, context) {
  const linked = node[REMARK_ORIGIN];
  if (linked === undefined) {
    return null;
  }
  if (!isPlainObject(linked) || !context.index.all.has(linked)) {
    reject(`a "${knownType(type)}" node carries forged provenance`);
  }
  if (linked.type !== type) {
    reject(`a source "${knownType(linked.type)}" node cannot be retyped`);
  }
  if (context.used.has(linked)) {
    reject(`a source "${knownType(type)}" node cannot be duplicated`);
  }
  context.used.add(linked);
  return linked;
}
function assertKnownFields(type, node) {
  const allowed = FIELDS_BY_TYPE[type];
  for (const key of Object.keys(node)) {
    if (key !== 'type' && key !== 'position' && key !== 'data' && !allowed.includes(key)) {
      reject(`a "${knownType(type)}" node cannot carry the unsupported field "${knownField(type, key)}"`);
    }
  }
}
function convertData(type, value) {
  if (value === undefined) {
    return undefined;
  }
  if (isPlainObject(value)) {
    for (const key of RAW_MARKUP_DATA_KEYS) {
      if (key in value) {
        reject(`a "${knownType(type)}" node cannot carry the raw-markup data channel "${key}"`);
      }
    }
  }
  if (!isMarkdownPluginData(value)) {
    reject(`a "${knownType(type)}" node's data must be finite JSON-like values`);
  }
  return copyData(value);
}
function requireString(type, field, value) {
  if (typeof value !== 'string') {
    reject(`a "${knownType(type)}" node requires a string "${knownField(type, field)}"`);
  }
  return value;
}
function requireAbsentText(type, field, value) {
  if (value !== undefined && value !== null && value !== '') {
    reject(`a "${knownType(type)}" node's "${knownField(type, field)}" has no Astryx representation`);
  }
}
function assertPlacement(type, node, parentType, insideLink) {
  if (parentType == null) {
    return;
  }
  if (type === 'root') {
    reject('a document can only contain one root');
  }
  const display = type === 'extension' ? node.display : undefined;
  const phrasing = PHRASING_TYPES.has(type) || display === 'inline';
  const block = BLOCK_TYPES.has(type) || display === 'block';
  if (PHRASING_PARENTS.has(parentType) && !phrasing || BLOCK_PARENTS.has(parentType) && !block || parentType === 'list' && type !== 'listItem' || parentType === 'table' && type !== 'tableRow' || parentType === 'tableRow' && type !== 'tableCell') {
    reject(`a "${knownType(type)}" node cannot be a child of a "${knownType(parentType)}" node`);
  }
  if (insideLink && type === 'link') {
    reject('a link cannot be nested inside another link');
  }
}
function sameCanonicalFields(origin, fields) {
  // Canonical nodes may carry explicitly undefined optional keys; an absent
  // key and an undefined key mean the same thing.
  const originKeys = Object.keys(origin).filter(key => key !== 'type' && origin[key] !== undefined);
  const fieldKeys = Object.keys(fields).filter(key => fields[key] !== undefined);
  if (originKeys.length !== fieldKeys.length) {
    return false;
  }
  for (const key of fieldKeys) {
    const next = fields[key];
    const previous = origin[key];
    if (next === previous) {
      continue;
    }
    if (Array.isArray(next) && Array.isArray(previous)) {
      if (next.length !== previous.length || next.some((item, position) => item !== previous[position])) {
        return false;
      }
      continue;
    }
    if (!sameJsonValue(next, previous)) {
      return false;
    }
  }
  return true;
}
function buildCanonicalNode(type, fields, origin) {
  if (origin != null && sameCanonicalFields(origin, fields)) {
    return origin;
  }
  const built = {
    type,
    ...fields
  };
  if (origin != null) {
    // Carries Core's own enumerable symbol markers (source-heading identity)
    // onto the replacement so Core still recognizes the node it authored.
    for (const marker of Object.getOwnPropertySymbols(origin)) {
      if (Object.prototype.propertyIsEnumerable.call(origin, marker)) {
        Object.defineProperty(built, marker, {
          configurable: false,
          enumerable: true,
          value: origin[marker],
          writable: false
        });
      }
    }
  }
  return built;
}
function fromRemarkChildren(children, type, insideLink, context) {
  if (!Array.isArray(children)) {
    reject(`a "${knownType(type)}" node requires a children array`);
  }
  return children.map(child => fromRemarkNode(child, type, insideLink || type === 'link', context));
}
function fromRemarkNode(value, parentType, insideLink, context) {
  if (!isPlainObject(value)) {
    reject('every transformed node must be a plain object');
  }
  const type = value.type;
  if (typeof type !== 'string') {
    reject('every transformed node requires a string type');
  }
  if (type === 'html') {
    reject('raw HTML has no Astryx representation');
  }
  if (!(type in FIELDS_BY_TYPE)) {
    reject(`the node type "${knownType(type)}" is outside the supported MDAST subset`);
  }
  assertKnownFields(type, value);
  assertPlacement(type, value, parentType, insideLink);
  const origin = resolveOrigin(value, type, context);
  if (origin == null) {
    if (value.position !== undefined) {
      reject(`a new "${knownType(type)}" node cannot carry a source position`);
    }
  } else if (!samePosition(value.position, origin.position)) {
    // Covers a removed, rebuilt, offset-shifted, and line/column-shifted
    // position alike. Core's position is never restored over a changed one.
    reject(`a source "${knownType(type)}" node's position must stay exactly as Core authored it`);
  }
  const fields = {};
  switch (type) {
    case 'root':
    case 'paragraph':
    case 'blockquote':
    case 'strong':
    case 'emphasis':
    case 'delete':
    case 'tableRow':
    case 'tableCell':
      fields.children = fromRemarkChildren(value.children, type, insideLink, context);
      break;
    case 'heading':
      {
        const depth = value.depth;
        if (typeof depth !== 'number' || !Number.isInteger(depth) || depth < 1 || depth > 6) {
          reject('a heading requires a depth between 1 and 6');
        }
        if (origin != null && origin.depth !== depth) {
          reject("a source heading's depth cannot change");
        }
        fields.depth = depth;
        fields.children = fromRemarkChildren(value.children, type, insideLink, context);
        break;
      }
    case 'listItem':
      {
        const checked = value.checked;
        if (checked !== undefined && checked !== null) {
          if (typeof checked !== 'boolean') {
            reject('a list item requires a boolean "checked" value');
          }
          fields.checked = checked;
        }
        if (value.spread === true) {
          reject('a loose list item has no Astryx representation');
        }
        fields.children = fromRemarkChildren(value.children, type, insideLink, context);
        break;
      }
    case 'text':
    case 'inlineCode':
    case 'inlineMath':
    case 'math':
      fields.value = requireString(type, 'value', value.value);
      break;
    case 'code':
      {
        const lang = value.lang;
        if (lang !== undefined && lang !== null && typeof lang !== 'string') {
          reject('a code node requires a string or null "lang"');
        }
        const meta = value.meta;
        if (meta !== undefined && meta !== null && typeof meta !== 'string') {
          reject('a code node requires a string or null "meta"');
        }
        fields.lang = lang ?? null;
        if (meta != null && meta !== '') {
          fields.meta = meta;
        }
        fields.value = requireString(type, 'value', value.value);
        break;
      }
    case 'link':
      {
        const url = requireString(type, 'url', value.url);
        if (!isSafeMarkdownParserUrl(url)) {
          reject('a link destination was rejected by the navigation owner');
        }
        requireAbsentText(type, 'title', value.title);
        fields.url = url;
        fields.children = fromRemarkChildren(value.children, type, insideLink, context);
        break;
      }
    case 'image':
      {
        const url = requireString(type, 'url', value.url);
        if (!isSafeMarkdownParserUrl(url)) {
          reject('an image source was rejected by the resource owner');
        }
        requireAbsentText(type, 'title', value.title);
        if (typeof value.alt !== 'string') {
          reject('an image requires its text alternative');
        }
        fields.url = url;
        fields.alt = value.alt;
        break;
      }
    case 'list':
      {
        if (typeof value.ordered !== 'boolean') {
          reject('a list requires a boolean "ordered" value');
        }
        fields.ordered = value.ordered;
        const start = value.start;
        if (start !== undefined && start !== null) {
          if (typeof start !== 'number' || !Number.isFinite(start)) {
            reject('a list requires a finite "start" value');
          }
          fields.start = start;
        }
        if (typeof value.spread === 'boolean') {
          fields.spread = value.spread;
        }
        const delimiter = value.delimiter;
        if (delimiter !== undefined) {
          if (delimiter !== '.' && delimiter !== ')') {
            reject('a list requires a "." or ")" delimiter');
          }
          fields.delimiter = delimiter;
        }
        fields.children = fromRemarkChildren(value.children, type, insideLink, context);
        break;
      }
    case 'table':
      {
        const align = value.align;
        if (!Array.isArray(align) || !align.every(entry => entry === null || entry === 'left' || entry === 'center' || entry === 'right')) {
          reject('a table requires normalized alignment values');
        }
        fields.align = [...align];
        fields.children = fromRemarkChildren(value.children, type, insideLink, context);
        break;
      }
    case 'thematicBreak':
    case 'break':
      break;
    case 'citation':
    case 'extension':
      {
        // Astryx owns these outright: the adapter can show one to a plugin but
        // never lets one be authored or edited, so every field must come back
        // exactly as it went out.
        const unchanged = origin != null && sameJsonValue(value.data, origin.data) && (type === 'citation' ? value.sourceId === origin.sourceId : value.plugin === origin.plugin && value.name === origin.name && value.display === origin.display && value.source === origin.source);
        if (!unchanged) {
          reject(`an Astryx "${knownType(type)}" node cannot be authored or changed here`);
        }
        // Equality across every owned field proves the node round-tripped, so
        // the canonical node itself stays in place.
        return origin;
      }
    default:
      reject(`the node type "${knownType(type)}" is outside the supported MDAST subset`);
  }
  const data = convertData(type, value.data);
  if (data !== undefined) {
    fields.data = data;
  }
  if (origin != null && origin.position !== undefined) {
    fields.position = origin.position;
  }
  const node = buildCanonicalNode(type, fields, origin);
  if (type === 'table' && node !== origin) {
    const rows = fields.children;
    const width = rows[0]?.children?.length ?? 0;
    if (rows.some(row => row.children?.length !== width)) {
      reject('a transformed table cannot have ragged rows');
    }
  }
  return node;
}

/* ------------------------------------------------------------------ *
 * Constrained file and processor guard
 * ------------------------------------------------------------------ */

function createMessage(reason, place, ruleId) {
  const text = reason instanceof Error ? reason.message : reason;
  return {
    reason: text,
    fatal: false,
    place: place ?? null,
    ruleId: ruleId ?? null,
    toString() {
      return text;
    }
  };
}

/**
 * The documented surface of the constrained file. Everything else — `path`,
 * `cwd`, `history`, `basename`, `dirname`, `extname`, `stem`, `stored`, and
 * any other key — is unsupported: the adapter has no filesystem, no processor,
 * and no run history to answer with.
 */
const FILE_SURFACE = new Set(['value', 'data', 'messages', 'message', 'fail', 'toString']);

/**
 * Adapter-owned data for one invocation.
 *
 * It lives here rather than on the file the plugin holds, because everything
 * the plugin can reach it can also rewrite — a plugin must not be able to
 * fake a `fatal` message or hide one it caused. The failure verdict itself
 * belongs to the run (`RunState`), which every rejection records.
 */

function createConstrainedFile(source) {
  const messages = [];
  const state = {
    data: {}
  };
  const target = {
    get value() {
      return source;
    },
    get data() {
      return state.data;
    },
    get messages() {
      return messages;
    },
    message(reason, place, ruleId) {
      const message = createMessage(reason, place, ruleId);
      messages.push(message);
      return message;
    },
    fail(reason, place, ruleId) {
      const message = createMessage(reason, place, ruleId);
      message.fatal = true;
      messages.push(message);
      // `reject` records the verdict in run state, so a plugin that catches
      // this and carries on has still declared the document unsupported and
      // the run cannot succeed behind its back.
      reject(FAILED_BY_PLUGIN);
    },
    toString() {
      return source;
    }
  };

  // Fails closed on every unsupported read and on every write. Returning
  // `undefined` for `file.cwd` would let a plugin silently take a path that
  // depends on a capability this profile does not have.
  /* eslint-disable @typescript-eslint/promise-function-async -- these are
     Proxy traps, not async work; the adapter is synchronous throughout. */
  const file = new Proxy(target, {
    get(_target, property, receiver) {
      if (typeof property === 'symbol') {
        // JS protocol (inspection, iteration, `instanceof`), not VFile
        // surface. Answering `undefined` here cannot mislead a plugin.
        return Reflect.get(target, property, receiver);
      }
      if (!FILE_SURFACE.has(property)) {
        reject(`the file has no "${knownFileKey(property)}" in this profile`);
      }
      return Reflect.get(target, property, receiver);
    },
    set(_target, property) {
      reject(`the file's "${knownFileKey(property)}" cannot be assigned in this profile`);
    },
    defineProperty(_target, property) {
      reject(`the file's "${knownFileKey(property)}" cannot be assigned in this profile`);
    },
    deleteProperty(_target, property) {
      reject(`the file's "${knownFileKey(property)}" cannot be assigned in this profile`);
    },
    // Truthfully answers "no such capability" so a plugin that feature-detects
    // can take its own graceful path instead of being rejected.
    has(_target, property) {
      return typeof property === 'symbol' || FILE_SURFACE.has(property);
    },
    ownKeys() {
      return [...FILE_SURFACE];
    },
    getOwnPropertyDescriptor(_target, property) {
      return typeof property !== 'symbol' && !FILE_SURFACE.has(property) ? undefined : Reflect.getOwnPropertyDescriptor(target, property);
    }
  });
  /* eslint-enable @typescript-eslint/promise-function-async */

  return {
    file,
    state
  };
}

/**
 * Stands in for Unified's processor. Any access fails closed, so parser,
 * compiler, and cross-run `data()` registration cannot be mistaken for
 * supported behavior.
 */
const PROCESSOR_ACCESS = 'processor registration is outside the adapter';
const processorGuard = new Proxy(Object.freeze({}), {
  get() {
    reject(PROCESSOR_ACCESS);
  },
  set() {
    reject(PROCESSOR_ACCESS);
  },
  defineProperty() {
    reject(PROCESSOR_ACCESS);
  },
  deleteProperty() {
    reject(PROCESSOR_ACCESS);
  },
  apply() {
    reject(PROCESSOR_ACCESS);
  },
  has() {
    // Truthful: this stand-in offers no processor capability at all.
    return false;
  },
  ownKeys() {
    return [];
  }
});

/* ------------------------------------------------------------------ *
 * Public adapter
 * ------------------------------------------------------------------ */

/**
 * The one reason reported for a failed run.
 *
 * A rejection's reason is built from this module's own vocabulary, so it is
 * safe to report. Anything a plugin authored — a thrown error's message, a
 * `file.fail()` reason, a `file.message()` diagnostic — is not: the plugin
 * read the document, so its text may quote it. Those stay on the file, which
 * only the plugin sees.
 */
function describeFailure(error) {
  const reason = error instanceof RemarkAdapterRejection ? adapterReasons.get(error) : undefined;
  return reason ?? 'the plugin threw an error';
}

/**
 * Adapt one synchronous transform-only Remark plugin to a Markdown transform.
 *
 * The adapted plugin receives a fresh mutable copy of the canonical document
 * and an isolated constrained file. Every returned or mutated tree round-trips
 * through the supported MDAST subset before it becomes observable; anything
 * unsupported — a parser or compiler plugin, asynchronous work, processor
 * state, raw HTML, an unsupported node, a forged position, or unrepresentable
 * metadata — keeps the last valid document and reports one diagnostic.
 *
 * Compatibility is per plugin and proven by fixtures, never inferred from a
 * package name.
 *
 * @example
 * ```
 * import {createMarkdownPlugin} from '@astryxdesign/core/Markdown';
 * import {createMarkdownRemarkTransform} from '@astryxdesign/core/Markdown/remark';
 *
 * const shouting = createMarkdownPlugin({
 *   name: 'shouting-headings',
 *   apiVersion: 1,
 *   transform: createMarkdownRemarkTransform(remarkShoutingHeadings),
 * });
 * ```
 */

export function createMarkdownRemarkTransform(plugin, ...settings) {
  if (typeof plugin !== 'function') {
    throw new TypeError('Markdown Remark adapter: plugin must be a function');
  }
  let attached = false;
  let transformer = null;
  let attachFailure = null;
  const attach = () => {
    attached = true;
    // The attacher can touch the processor guard and catch the rejection, so
    // it gets its own sticky state; a swallowed capability access is still a
    // failed attach.
    const attachState = createRunState();
    withRunState(attachState, () => {
      try {
        const created = plugin.apply(processorGuard, settings);
        // Defuse before any verdict: an attacher that both tripped a guard
        // and returned a rejected promise must not leave that promise
        // unhandled just because the guard is reported instead.
        const attacherIsAsync = defuseThenable(created);
        if (attachState.failed) {
          reject(attachState.reason ?? FAILED_BY_PLUGIN);
        }
        if (attacherIsAsync) {
          reject('an asynchronous plugin is outside the adapter');
        }
        if (typeof created !== 'function') {
          attachFailure = 'only a transform-only plugin returning one synchronous transformer is supported';
          return;
        }
        if (created.length >= 3) {
          attachFailure = 'a callback-style (asynchronous) transformer is outside the adapter';
          return;
        }
        transformer = created;
      } catch (error) {
        attachFailure = describeFailure(error);
      }
    });
    if (attachState.failed && attachFailure == null) {
      attachFailure = attachState.reason;
      transformer = null;
    }
  };
  return (document, context) => {
    if (!attached) {
      attach();
    }
    const runner = transformer;
    if (runner == null) {
      context.report(`Remark adapter: ${attachFailure ?? 'the plugin failed'}`);
      return document;
    }
    const index = createOriginIndex();
    const {
      file,
      state
    } = createConstrainedFile(context.source);
    const run = createRunState();
    return withRunState(run, () => {
      try {
        const tree = toRemarkNode(document, index);
        const returned = runner(tree, file);
        // Defuse first, whatever else is wrong. A transformer that both
        // swallowed a guard refusal and returned a rejected promise still
        // gets that promise handled — the sticky verdict decides only what
        // is *reported*, never whether the promise is left dangling.
        const returnedIsAsync = defuseThenable(returned);
        if (run.failed) {
          // The plugin tripped a guard — a prohibited file key, a processor
          // access, its own fail() — and swallowed the rejection. The verdict
          // stands, and its original reason is the one reported.
          reject(run.reason ?? FAILED_BY_PLUGIN);
        }
        if (returnedIsAsync) {
          reject('an asynchronous transformer is outside the adapter');
        }
        const output = returned ?? tree;
        if (!isMarkdownPluginData(state.data)) {
          reject('file data must be finite JSON-like values');
        }
        const back = {
          index,
          used: new Set()
        };
        const root = fromRemarkNode(output, null, false, back);
        if (root.type !== 'root') {
          reject('a transformer must return the document root');
        }
        const children = root.children;
        if (context.display === 'inline' && (children.length !== 1 || children[0]?.type !== 'paragraph')) {
          reject('an inline document must stay one paragraph of phrasing content');
        }
        if (run.failed) {
          // Last word before the output becomes observable. A guard can fire
          // after the earlier check — a hostile `then` accessor, a getter on
          // a returned node — and a refusal the plugin caught must never end
          // with its output accepted.
          reject(run.reason ?? FAILED_BY_PLUGIN);
        }
        return root;
      } catch (error) {
        // Exactly one report per failed run, and never a second for the
        // plugin's own messages — see `describeFailure`. The first recorded
        // rejection outranks a later error, so swallowing one and throwing
        // something friendlier cannot change what is reported.
        context.report(`Remark adapter: ${run.reason ?? describeFailure(error)}`);
        return document;
      }
    });
  };
}