// Ambiente generado con Web Audio: un dron grave + viento filtrado. Sin archivos de audio.
export function createAudio() {
  let ctx = null, master = null, wind = null, on = false;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);

    // dron
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340; lp.Q.value = 0.8;
    const dg = ctx.createGain(); dg.gain.value = 0.11;
    lp.connect(dg).connect(master);
    [[55, 'sawtooth', 0], [82.41, 'sawtooth', 4], [110.2, 'triangle', -3], [164.8, 'sine', 2]].forEach(([f, type, det]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
      const g = ctx.createGain(); g.gain.value = type === 'sine' ? 0.35 : 0.5;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.08;
      const lg = ctx.createGain(); lg.gain.value = 0.18;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(lp); o.start(); lfo.start();
    });
    const sweep = ctx.createOscillator(); sweep.frequency.value = 0.03;
    const sg = ctx.createGain(); sg.gain.value = 140;
    sweep.connect(sg).connect(lp.frequency); sweep.start();

    // viento
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    wind = ctx.createBiquadFilter(); wind.type = 'bandpass'; wind.frequency.value = 520; wind.Q.value = 0.7;
    const wg = ctx.createGain(); wg.gain.value = 0.5;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.07;
    const wlg = ctx.createGain(); wlg.gain.value = 260;
    wl.connect(wlg).connect(wind.frequency); wl.start();
    src.connect(wind).connect(wg).connect(master); src.start();
    return true;
  }

  return {
    async toggle() {
      if (!ctx && !build()) return false;
      on = !on;
      if (on) await ctx.resume();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? 0.55 : 0, t + (on ? 2 : 0.8));
      if (!on) setTimeout(() => { if (!on) ctx.suspend(); }, 900);
      return on;
    },
    // la velocidad del scroll abre un poco el viento
    setEnergy(v) {
      if (!ctx || !on) return;
      wind.Q.setTargetAtTime(0.7 + Math.min(v, 1) * 1.6, ctx.currentTime, 0.3);
    },
  };
}
