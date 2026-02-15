/**
 * Audio Manager for Mind Matrix
 * Handles audio decoding, queueing, and playback using HTML5 Audio
 */

export class AudioManager {
  constructor() {
    this.audioElement = null;
    this.audioChunks = [];
    this.isPlaying = false;
    this._volume = 1.0;
    this.onPlaybackEnd = null;
    
    this.initialize();
  }

  initialize() {
    try {
      // Use HTML5 Audio element for better MP3 support
      this.audioElement = new Audio();
      this.audioElement.volume = this._volume;
      
      console.log('AudioManager initialized');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      throw new Error('Audio is not supported in this browser');
    }
  }

  setPlaybackEndCallback(callback) {
    this.onPlaybackEnd = callback;
  }

  async addChunk(base64Audio) {
    try {
      // Decode base64 to Uint8Array
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      this.audioChunks.push(audioData);
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  async playAudio() {
    if (this.audioChunks.length === 0 || this.isPlaying) {
      return;
    }

    try {
      // Concatenate all chunks
      const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedArray = new Uint8Array(totalLength);
      
      let offset = 0;
      for (const chunk of this.audioChunks) {
        combinedArray.set(chunk, offset);
        offset += chunk.length;
      }

      // Create blob and object URL
      const blob = new Blob([combinedArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Clear chunks
      this.audioChunks = [];
      
      // Set up cleanup handlers
      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        this.onPlaybackEnd?.();
      };
      
      // Play audio
      this.audioElement.src = audioUrl;
      this.isPlaying = true;
      
      this.audioElement.onended = cleanup;
      this.audioElement.onerror = (e) => {
        console.error('Audio playback error:', e);
        cleanup();
      };
      
      await this.audioElement.play();
      console.log('Playing audio, duration:', this.audioElement.duration);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      this.audioChunks = [];
      this.onPlaybackEnd?.();
    }
  }

  stop() {
    // Stop current playback
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
      } catch (error) {
        // Ignore errors if already stopped
      }
    }

    // Clear chunks
    this.audioChunks = [];
    this.isPlaying = false;
  }

  setVolume(volume) {
    this._volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.audioElement) {
      this.audioElement.volume = this._volume;
    }
  }

  getVolume() {
    return this._volume;
  }

  isPlayingAudio() {
    return this.isPlaying || this.audioChunks.length > 0;
  }

  async resumeContext() {
    // Not needed for HTML5 Audio
  }

  cleanup() {
    this.stop();
    if (this.audioElement) {
      this.audioElement = null;
    }
  }
}
