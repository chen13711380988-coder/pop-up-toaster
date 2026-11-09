"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ToasterModel = require("./model.js");

test("normal path: Idle → Ready → Toasting → Done → Idle", () => {
  const toaster = new ToasterModel();
  assert.equal(toaster.getState().currentState, "Idle");
  assert.equal(toaster.getState().browningLevel, 3);
  assert.equal(toaster.insertBread().currentState, "Ready");
  assert.equal(toaster.getState().timeRemaining, 12);
  assert.equal(toaster.pressLever().currentState, "Toasting");
  assert.equal(toaster.advance(12).currentState, "Done");
  assert.equal(toaster.getState().breadPresent, true);
  assert.equal(toaster.getState().timeRemaining, 0);
  assert.equal(toaster.getState().cycleProgress, 100);
  const removed = toaster.removeBread();
  assert.equal(removed.currentState, "Idle");
  assert.equal(removed.breadPresent, false);
  assert.equal(removed.browningProgress, 0);
  assert.equal(removed.timeRemaining, 0);
  assert.equal(removed.cycleDuration, 0);
});

test("Ready can return to Idle before heating; level persists", () => {
  const toaster = new ToasterModel();
  toaster.insertBread();
  toaster.setLevel(5);
  assert.equal(toaster.getState().timeRemaining, 18);
  const removed = toaster.removeBread();
  assert.equal(removed.currentState, "Idle");
  assert.equal(removed.browningLevel, 5);
  assert.equal(toaster.insertBread().timeRemaining, 18);
});

test("cancel preserves achieved color, remaining time, and bread", () => {
  const toaster = new ToasterModel();
  toaster.insertBread();
  toaster.pressLever();
  const halfway = toaster.advance(6);
  const cancelled = toaster.cancel();
  assert.equal(cancelled.currentState, "Cancelled");
  assert.equal(cancelled.breadPresent, true);
  assert.equal(cancelled.browningProgress, halfway.browningProgress);
  assert.equal(cancelled.cycleProgress, 50);
  assert.equal(cancelled.timeRemaining, 6);
  assert.deepEqual(toaster.advance(100), cancelled);
  assert.equal(toaster.pressLever().currentState, "Cancelled");
  const removed = toaster.removeBread();
  assert.equal(removed.currentState, "Idle");
  assert.equal(removed.browningProgress, 0);
});

test("empty lever, repeated lever, locked level setting, and locked removal", () => {
  const toaster = new ToasterModel();
  assert.equal(toaster.pressLever().message, "Insert bread");
  assert.equal(toaster.getState().currentState, "Idle");
  toaster.insertBread();
  toaster.pressLever();
  toaster.advance(3);
  assert.equal(toaster.pressLever().message, "Already toasting");
  assert.equal(toaster.getState().timeRemaining, 9);
  assert.equal(toaster.setLevel(5).browningLevel, 3);
  assert.equal(toaster.removeBread().currentState, "Toasting");
  assert.equal(toaster.getState().breadPresent, true);
  assert.equal(toaster.getState().timeRemaining, 9);
});

test("Cancel is a no-op outside Toasting except its explanatory message", () => {
  const toaster = new ToasterModel();
  function checkCancel() {
    const before = toaster.getState();
    const after = toaster.cancel();
    assert.deepEqual(after, { ...before, message: "Nothing is currently toasting." });
  }
  checkCancel(); // Idle
  toaster.insertBread();
  checkCancel(); // Ready
  toaster.pressLever();
  toaster.advance(12);
  checkCancel(); // Done
  toaster.removeBread();
  toaster.insertBread();
  toaster.pressLever();
  toaster.cancel();
  checkCancel(); // Cancelled
});

test("five durations produce distinct final colors, not five equally dark slices", () => {
  const durations = [6, 9, 12, 15, 18];
  const finalColors = [];
  for (let level = 1; level <= 5; level += 1) {
    const toaster = new ToasterModel();
    toaster.insertBread();
    toaster.setLevel(level);
    toaster.pressLever();
    const almost = toaster.advance(durations[level - 1] - 0.1);
    assert.equal(almost.currentState, "Toasting");
    const done = toaster.advance(1); // A late frame safely clamps at zero.
    assert.equal(done.currentState, "Done");
    assert.equal(done.timeRemaining, 0);
    assert.equal(done.cycleProgress, 100);
    assert.equal(done.browningProgress, durations[level - 1] / 18 * 100);
    finalColors.push(done.browningProgress);
    assert.deepEqual(toaster.advance(100), done);
    toaster.removeBread();
    assert.equal(toaster.getState().browningLevel, level);
  }
  for (let i = 1; i < finalColors.length; i += 1) {
    assert.ok(finalColors[i] > finalColors[i - 1]);
  }
});

test("same heating time means the same color, even across selected levels", () => {
  const light = new ToasterModel();
  const dark = new ToasterModel();
  light.insertBread();
  dark.insertBread();
  light.setLevel(1);
  dark.setLevel(5);
  light.pressLever();
  dark.pressLever();
  assert.equal(light.advance(6).browningProgress, dark.advance(6).browningProgress);
});

test("invalid input and external snapshots cannot corrupt the model", () => {
  const toaster = new ToasterModel();
  toaster.getState().currentState = "Toasting";
  assert.equal(toaster.getState().currentState, "Idle");
  for (const level of [0, 6, 2.5, NaN, "3"]) {
    assert.equal(toaster.setLevel(level).browningLevel, 3);
  }
  toaster.insertBread();
  toaster.pressLever();
  const before = toaster.getState();
  for (const elapsed of [-1, 0, Infinity, NaN, "1"]) {
    assert.deepEqual(toaster.advance(elapsed), before);
  }
});
