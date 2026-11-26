// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuPressGesture.ts
 * @input A menu press gesture and one pointer event, both as plain data
 * @output Exports the pure `menuPressStep` state machine, its state, event and
 *   effect types, and the settle constant
 * @position Pure module under `useMenuPress`; no DOM, no React, so every
 *   transition is unit-testable without a browser
 *
 * The press model shared by every Astryx menu and picker: the row under the
 * pointer when it is RELEASED is the row that acts, and the highlight follows
 * the pointer while it is held. It is the model of macOS and iOS menus.
 *
 * States:
 * - `idle` — no gesture is live.
 * - `triggerPress` — a finger rests on the trigger; the menu is not open yet.
 *   A mouse skips this state: a mouse press on the trigger opens at once.
 * - `open` — the menu opened under a held pointer (a mouse press, or a finger
 *   held for the long-press delay) and the pointer has not entered it yet.
 * - `tracking` — the pointer is held and the highlight follows it.
 *
 * The settle rule: the release of the gesture that OPENED the menu acts only
 * once the pointer has entered the menu or the press has lasted
 * `MENU_PRESS_SETTLE_MS`; otherwise it acts on nothing and the menu stays
 * open. Without it a menu that opens under the pointer would pick a row
 * nobody chose.
 *
 * Rows are opaque (`T`): the machine never touches the DOM. The hook resolves
 * the enabled row under the pointer and feeds it in; `null` means the pointer
 * is over a divider, a heading, a disabled row, or outside the menu.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/menuPressGesture.test.ts
 * - /packages/core/src/hooks/useMenuPress.ts
 */

/** How long the opening press must last before its release may act. */
export const MENU_PRESS_SETTLE_MS = 300;
export const IDLE_MENU_PRESS = {
  phase: 'idle'
};
const NONE = {
  type: 'none'
};
function idle(effect) {
  return {
    gesture: {
      phase: 'idle'
    },
    effect
  };
}
function highlightEffect(row) {
  return row == null ? {
    type: 'clear'
  } : {
    type: 'highlight',
    row
  };
}

/**
 * Resolve a release while the highlight is tracking the pointer: over an
 * enabled row it acts, over the menu's chrome it acts on nothing, outside the
 * menu it acts on nothing and — under a mouse — dismisses the menu (a
 * finger leaves it open). A release back on the trigger never dismisses.
 */
function release(pointerType, event) {
  if (event.row != null) {
    return idle({
      type: 'act',
      row: event.row
    });
  }
  if (event.isInMenu || event.isOnTrigger) {
    return idle({
      type: 'settle',
      stray: true,
      dismiss: false
    });
  }
  return idle({
    type: 'settle',
    stray: true,
    dismiss: pointerType === 'mouse'
  });
}

/**
 * Advance the gesture by one event. Pure: same inputs, same output.
 */
export function menuPressStep(gesture, event) {
  switch (gesture.phase) {
    case 'idle':
      return stepIdle(gesture, event);
    case 'triggerPress':
      return stepTriggerPress(gesture, event);
    case 'open':
      return stepOpen(gesture, event);
    case 'tracking':
      return stepTracking(gesture, event);
  }
}
function stepIdle(gesture, event) {
  if (event.type !== 'down') {
    return {
      gesture,
      effect: NONE
    };
  }
  if (event.target === 'menu') {
    return {
      gesture: {
        phase: 'tracking',
        pointerType: event.pointerType,
        origin: 'menu',
        row: event.row
      },
      effect: highlightEffect(event.row)
    };
  }
  if (event.pointerType === 'mouse') {
    return {
      gesture: {
        phase: 'open',
        pointerType: 'mouse',
        openedAt: event.time
      },
      effect: {
        type: 'open'
      }
    };
  }
  return {
    gesture: {
      phase: 'triggerPress',
      pointerType: event.pointerType,
      startedAt: event.time
    },
    effect: NONE
  };
}
function stepTriggerPress(gesture, event) {
  switch (event.type) {
    case 'opened':
      return {
        gesture: {
          phase: 'open',
          pointerType: gesture.pointerType,
          openedAt: event.time
        },
        effect: NONE
      };
    case 'up':
      // A tap. The browser's click on the trigger is what opens the menu, so
      // it must pass, and no gesture is live afterwards.
      return idle({
        type: 'settle',
        stray: false,
        dismiss: false
      });
    case 'cancel':
      // The browser took the gesture (an incoming call, a system gesture).
      // Settle rather than going quiet: a held finger has already installed
      // the document's touchmove preventer, and only the end of a gesture
      // takes it back off. No click follows a cancelled pointer.
      return idle({
        type: 'settle',
        stray: false,
        dismiss: false
      });
    case 'down':
    case 'move':
      return {
        gesture,
        effect: NONE
      };
  }
}
function stepOpen(gesture, event) {
  switch (event.type) {
    case 'move':
      if (!event.isInMenu) {
        return {
          gesture,
          effect: NONE
        };
      }
      return {
        gesture: {
          phase: 'tracking',
          pointerType: gesture.pointerType,
          origin: 'trigger',
          row: event.row
        },
        effect: highlightEffect(event.row)
      };
    case 'up':
      {
        const hasSettled = event.time - gesture.openedAt >= MENU_PRESS_SETTLE_MS;
        if (!hasSettled) {
          // The pointer never entered the menu and the press was short: the
          // menu stays open and nothing acts. The trigger's own click for this
          // gesture must not toggle it shut either.
          return idle({
            type: 'settle',
            stray: true,
            dismiss: false
          });
        }
        return release(gesture.pointerType, event);
      }
    case 'cancel':
      // As above: the gesture ends, so its document listeners come off. The
      // menu stays open — a cancelled pointer did not ask to close it.
      return idle({
        type: 'settle',
        stray: false,
        dismiss: false
      });
    case 'down':
    case 'opened':
      return {
        gesture,
        effect: NONE
      };
  }
}
function stepTracking(gesture, event) {
  switch (event.type) {
    case 'move':
      {
        if (event.row === gesture.row) {
          return {
            gesture,
            effect: NONE
          };
        }
        return {
          gesture: {
            ...gesture,
            row: event.row
          },
          effect: highlightEffect(event.row)
        };
      }
    case 'up':
      return release(gesture.pointerType, event);
    case 'cancel':
      // The browser took the gesture (a scroll, a second finger): nothing
      // acts, the menu stays, and no click follows a cancelled pointer.
      return idle({
        type: 'settle',
        stray: false,
        dismiss: false
      });
    case 'down':
    case 'opened':
      return {
        gesture,
        effect: NONE
      };
  }
}