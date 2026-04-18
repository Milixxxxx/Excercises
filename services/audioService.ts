
class AudioService {
  private audioContext: AudioContext | null = null;
  private backgroundSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3;
    }
  }

  async playGong() {
    this.initContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 1.5);

    envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

    oscillator.connect(envelope);
    envelope.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 2.5);
  }

  speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  // Simple simulated ocean sound using noise
  startSoundscape() {
    this.initContext();
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);

    // LFO to simulate waves
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.audioContext.currentTime);

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(200, this.audioContext.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);

    whiteNoise.start();
    this.backgroundSource = whiteNoise;
    lfo.start();
  }

  stopSoundscape() {
    if (this.backgroundSource) {
      this.backgroundSource.stop();
      this.backgroundSource = null;
    }
  }
}

export const audioService = new AudioService();
