/*
 * THE TOASTER'S RULES
 * This file contains the model, not the page layout or a running timer.
 * A page event calls a method below. The method checks an if/else rule,
 * updates the variables, and returns a snapshot for the page to display.
 * Keeping these rules separate also lets us test them without a browser.
 */
(function (root) {
  "use strict";

  // Index 0 means level 1, index 1 means level 2, and so on.
  const DURATIONS = Object.freeze([6, 9, 12, 15, 18]);
  const DARKEST_DURATION = 18;

  class ToasterModel {
    constructor() {
      this.state = {
        currentState: "Idle",
        breadPresent: false,
        browningLevel: 3,
        timeRemaining: 0,
        cycleDuration: 0,
        browningProgress: 0,
        cycleProgress: 0,
        message: "Insert bread to begin."
      };
    }

    // All values are simple numbers, text, or booleans, so a shallow copy
    // keeps page code from accidentally modifying the model's variables.
    getState() {
      return { ...this.state };
    }

    insertBread() {
      if (this.state.breadPresent) {
        this.state.message = "There is already bread in the toaster.";
      } else {
        this.state.breadPresent = true;
        this.state.currentState = "Ready";
        this.state.cycleDuration = DURATIONS[this.state.browningLevel - 1];
        this.state.timeRemaining = this.state.cycleDuration;
        this.state.browningProgress = 0;
        this.state.cycleProgress = 0;
        this.state.message = "Ready. Choose a level or press the lever.";
      }
      return this.getState();
    }

    removeBread() {
      if (this.state.currentState === "Toasting") {
        this.state.message = "Cancel the cycle before removing bread.";
      } else if (!this.state.breadPresent) {
        this.state.message = "There is no bread to remove.";
      } else {
        this.state.breadPresent = false;
        this.state.currentState = "Idle";
        this.state.timeRemaining = 0;
        this.state.cycleDuration = 0;
        this.state.browningProgress = 0;
        this.state.cycleProgress = 0;
        // Deliberately keep browningLevel for the next slice.
        this.state.message = "Bread removed. Ready for another slice.";
      }
      return this.getState();
    }

    setLevel(level) {
      if (this.state.currentState === "Toasting") {
        this.state.message = "The browning level is locked while toasting.";
      } else if (!Number.isInteger(level) || level < 1 || level > 5) {
        this.state.message = "Choose a browning level from 1 to 5.";
      } else {
        this.state.browningLevel = level;
        // An unfinished slice in Ready uses the new duration immediately.
        // Done/Cancelled keep the last cycle's time and color until removal.
        if (this.state.currentState === "Ready") {
          this.state.cycleDuration = DURATIONS[level - 1];
          this.state.timeRemaining = this.state.cycleDuration;
        }
        this.state.message = "Browning level " + level + " selected.";
      }
      return this.getState();
    }

    pressLever() {
      if (this.state.currentState === "Toasting") {
        // This guard prevents a second click from restarting the countdown.
        this.state.message = "Already toasting";
      } else if (!this.state.breadPresent) {
        this.state.message = "Insert bread";
      } else if (this.state.currentState === "Ready") {
        this.state.currentState = "Toasting";
        this.state.cycleDuration = DURATIONS[this.state.browningLevel - 1];
        this.state.timeRemaining = this.state.cycleDuration;
        this.state.browningProgress = 0;
        this.state.cycleProgress = 0;
        this.state.message = "Toasting…";
      } else {
        this.state.message = "Remove this slice before starting another cycle.";
      }
      return this.getState();
    }

    cancel() {
      if (this.state.currentState === "Toasting") {
        this.state.currentState = "Cancelled";
        // Keep bread, timeRemaining, and both progress values unchanged.
        this.state.message = "Cancelled. Your bread has popped up.";
      } else {
        this.state.message = "Nothing is currently toasting.";
      }
      return this.getState();
    }

    advance(seconds) {
      // The browser supplies elapsed time. Only Toasting consumes it.
      if (this.state.currentState !== "Toasting" ||
          !Number.isFinite(seconds) || seconds <= 0) {
        return this.getState();
      }

      const heatedSoFar = this.state.cycleDuration - this.state.timeRemaining;
      const heatedNow = Math.min(this.state.cycleDuration, heatedSoFar + seconds);
      this.state.timeRemaining = Math.max(0, this.state.cycleDuration - heatedNow);

      // Cycle progress reaches 100% for EVERY completed level.
      // Browning uses the SAME 18-second scale for all levels. A short
      // completed cycle therefore stays lighter than a long completed cycle.
      this.state.cycleProgress = heatedNow / this.state.cycleDuration * 100;
      this.state.browningProgress = heatedNow / DARKEST_DURATION * 100;

      if (this.state.timeRemaining < 0.000001) {
        this.state.timeRemaining = 0;
        this.state.cycleProgress = 100;
        this.state.browningProgress = this.state.cycleDuration / DARKEST_DURATION * 100;
        this.state.currentState = "Done";
        this.state.message = "Your toast is ready!";
      }
      return this.getState();
    }
  }

  ToasterModel.DURATIONS = DURATIONS;
  // Classic scripts work even when index.html is opened directly from disk.
  root.ToasterModel = ToasterModel;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ToasterModel;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
