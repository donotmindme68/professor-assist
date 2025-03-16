export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private startCallback: () => void;
  private endCallback: (interrupted: boolean | Error | string) => void;
  private isInterrupted: boolean = false;

  constructor(startCallback: () => void, endCallback: (interrupted: boolean | Error | string) => void) {
    this.startCallback = startCallback;
    this.endCallback = endCallback;
  }

  // Setter to manually set the audio element
  setAudioElement(audio: HTMLAudioElement) {
    this.audio = audio;
    this.audio.onplay = () => this.startCallback();
    this.audio.onended = () => this.endCallback(this.isInterrupted);
  }

  play(base64: string, mimeType: string = 'audio/mp3') {
    this.interrupt(); // Ensure any existing audio stops before playing a new one

    // If no audio element is set, create one
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.onplay = () => this.startCallback();
      this.audio.onended = () => this.endCallback(this.isInterrupted);
    }

    this.isInterrupted = false;
    this.audio.src = `data:${mimeType};base64,${base64}`;
    this.audio.play().catch((error) => {
      console.error("Audio playback error:", error);
      this.endCallback(error);
    });
  }

  interrupt() {
    if (this.audio) {
      this.isInterrupted = true;
      this.audio.pause();
      this.audio.currentTime = 0;
      this.endCallback(true);
    }
  }
}

export default AudioPlayer;