let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function resume() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  return c
}

export function playTilePlaced() {
  try {
    const c = resume()
    const t = c.currentTime
    const buf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)

    const src = c.createBufferSource()
    src.buffer = buf

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    const gain = c.createGain()
    gain.gain.setValueAtTime(0.35, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    src.start(t)
  } catch { /* silencieux si AudioContext bloqué */ }
}

export function playMoveValidated() {
  try {
    const c = resume()
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.2)

    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)

    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.25)
  } catch { /* silencieux */ }
}

export function playInvalidWord() {
  try {
    const c = resume()
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, t)

    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.18)
  } catch { /* silencieux */ }
}
