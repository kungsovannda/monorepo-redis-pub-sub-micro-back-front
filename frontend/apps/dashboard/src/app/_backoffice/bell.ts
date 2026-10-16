let context: AudioContext | null = null;

/** Must first be called from a user gesture so the browser allows audio. */
export function primeBell() {
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
}

/** A short counter-bell: two decaying sine partials. */
export function ringBell() {
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  for (const [frequency, delay] of [
    [1318.5, 0],
    [1760, 0.12],
  ] as const) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.1);
    osc.connect(gain).connect(context.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 1.2);
  }
}
