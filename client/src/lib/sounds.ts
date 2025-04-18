// Sound effects utility

// Simple beep function using Web Audio API
export function playBeep(frequencyStart: number = 830, frequencyEnd: number = 700, duration: number = 500, volume: number = 0.3): void {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn("Web Audio API not supported in this browser");
      return;
    }
    
    const audioCtx = new AudioContext();
    
    // Create oscillator
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine"; // sine, square, sawtooth, triangle
    oscillator.frequency.setValueAtTime(frequencyStart, audioCtx.currentTime);
    
    // Frequency sweep for more pleasant sound
    oscillator.frequency.exponentialRampToValueAtTime(
      frequencyEnd, 
      audioCtx.currentTime + duration / 1000
    );
    
    // Create gain node for volume control
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration / 1000);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Start and stop
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
  } catch (err) {
    console.error("Error playing sound effect:", err);
  }
}

// Play a gentle "ding" notification
export function playTimerComplete(): void {
  // Play a gentle ding sound (high to low)
  playBeep(880, 440, 700, 0.2);
  
  // Add a second softer tone with slight delay 
  setTimeout(() => {
    playBeep(587, 440, 500, 0.1);
  }, 150);
}