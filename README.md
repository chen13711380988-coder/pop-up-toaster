# Pop-up Toaster

**Student:** Qilin Chen  
**Appliance:** A cream-colored pop-up toaster with a browning knob and a Cancel button.

This small HTML/CSS/JavaScript model explores a simple relationship: the chosen browning level controls heating time, heating time changes the toast's color, and either finishing or cancelling makes the bread pop up. It uses the five states we agreed on: `Idle`, `Ready`, `Toasting`, `Done`, and `Cancelled`.

## Open the project

[Open the interactive model and view its HTML, CSS, and JavaScript on CodePen](https://codepen.io/chen13711380988-coder/pen/jEBdQLX).

Open `index.html` in a modern browser. Keep the other files and the `assets` folder beside it. No installation, framework, account, or build step is required.

To serve it locally instead, open a terminal in this folder and run:

```sh
python3 -m http.server 4185 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4185/`. If that port is busy, choose another number.

## Try the model

1. Insert bread. The toaster becomes `Ready`.
2. Keep the default level 3, or choose another level by clicking the brown knob on the toaster.
3. Press the lever. The state changes to `Toasting`, the countdown starts, and the bread gradually darkens.
4. Let the timer finish, or press Cancel early.
5. Remove the popped-up bread to return to `Idle`. The last browning level stays selected for the next slice.

The knob and Remove Bread control cannot be used during `Toasting`. Cancel remains available in every state so you can also test what happens when nothing is toasting.

## How the files fit together

| File | What it does |
| --- | --- |
| `index.html` | Gives the page its headings, appliance area, buttons, knob, and status information. |
| `styles.css` | Controls the beige background, JMH Typewriter Mono font, cream toaster appearance, responsive layout, and visual transitions. |
| `model.js` | Stores the appliance's variables and applies its rules. It does not draw the page or run a timer itself. |
| `app.js` | Listens for browser events, advances time, calls the model, and updates the visible page. |
| `model.test.js` | Checks the model's state transitions and edge cases using Node's built-in test runner. |
| `assets/` | Contains the local font and toaster/toast image assets. |

The main sequence is **user action → event handler → rule check → state change → visual update**. For example, a click on the lever calls the model's `pressLever()` method. An `if / else` decision checks whether bread is present and whether the machine is already running. The page then displays the returned state.

## Variables and states

| Variable | Meaning |
| --- | --- |
| `currentState` | One of the five states listed below. |
| `breadPresent` | Whether bread is still in the appliance, including popped-up bread waiting to be removed. |
| `browningLevel` | The selected setting, from 1 to 5. Initially 3; retained after removal. |
| `cycleDuration` | Total length of the selected/current cycle in model seconds. |
| `timeRemaining` | Model seconds remaining; frozen when cancelled. |
| `browningProgress` | Overall darkening on a shared 0–100 scale, where 18 seconds of heating reaches the darkest modeled color. |
| `cycleProgress` | How much of this particular cycle has elapsed, from 0–100%. |

`browningProgress` and `cycleProgress` are different on purpose: finishing a short level-1 cycle should produce light toast, even though that cycle is 100% complete.

| State | What is happening | What changes it |
| --- | --- | --- |
| `Idle` | No bread; no heating. | Insert bread → `Ready`. |
| `Ready` | Bread is loaded; a level is selected. | Press lever → `Toasting`; remove bread → `Idle`. |
| `Toasting` | Heating, counting down, and darkening. | Timer reaches zero → `Done`; Cancel → `Cancelled`. |
| `Done` | Heating stopped; bread popped up. | Remove bread → `Idle`. |
| `Cancelled` | Heating stopped early; bread popped up with its current color. | Remove bread → `Idle`. |

Additional rules:

- Pressing the lever without bread shows “Insert bread.”
- Pressing the lever again during toasting shows “Already toasting” and does not restart the timer.
- Pressing Cancel outside `Toasting` leaves the state unchanged and shows “Nothing is currently toasting.”
- `Done` and `Cancelled` both wait for removal. The same slice cannot immediately start another cycle.
- Removing bread resets time and progress but keeps the selected browning level.

## Accelerated time and five shades

| Level | Model time | Illustrative real-time equivalent | Target shade |
| --- | --- | --- | --- |
| 1 | 6 seconds | 60 seconds | Very light |
| 2 | 9 seconds | 90 seconds | Light |
| 3 | 12 seconds | 120 seconds | Medium |
| 4 | 15 seconds | 150 seconds | Medium-dark |
| 5 | 18 seconds | 180 seconds | Dark |

The three supplied toast references guide levels 1, 3, and 5. Intermediate visual blends supply levels 2 and 4, and blending also makes the toast gradually change while heating. Cancel freezes that progression.

These durations and shades are educational simplifications, not measurements or cooking instructions for a particular toaster. The model leaves out bread thickness, moisture, frozen bread, leftover appliance heat, electrical power, and temperature sensing. The photos guide the appearance; the appliance's behavior follows the agreed model rules.

## Assignment requirements in this project

| Requirement | Where to look |
| --- | --- |
| Variables that track state | The `state` object in `model.js`. |
| At least one form element | Buttons and the browning-level knob button in `index.html`. |
| Event handling | Button clicks and knob clicks handled in `app.js`. |
| Visual feedback | State text, countdown, lever/bread position, toast color, and available controls. |
| Control flow | `if / else` checks in the model's methods, including starting, cancelling, removing, and finishing. |

## AI support and process

Codex helped translate the rules discussed in the conversation into a state model, browser event handlers, and a visual interface. The student chose the states, cancellation behavior, accelerated timings, default level, retention of the last level, background color, font, and appliance references. The built-in image-generation tool was used to prepare visual assets from those references. The code keeps the model separate from the interface so its decisions can be read and checked independently.

Useful decisions from the conversation include removing a separate `Popped` state, keeping cancelled bread in `Cancelled` until removal, preserving its partially browned color, and allowing the default setting to be used without changing the knob.

To run the automated model checks when Node.js is available:

```sh
node --test model.test.js
```

The tests cover normal completion, early cancellation, invalid actions, all five durations, level retention, and state snapshots. Browser interaction checks should also be recorded separately from the student's own testing and reflection.



## Interface revision

The machine knob cycles 1 → 2 → 3 → 4 → 5 → 1, with no separate slider. It is disabled while toasting. The user selected a paper texture and a shorter title and introduction; explanatory model details stay in this README. A duplicated, CSS-clipped front image places the bread between the slot’s back and front edges. This changes visual layering, not state rules.
