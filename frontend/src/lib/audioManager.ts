class AudioManager {
  async playAudioBlob(blob: Blob): Promise<void> {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }
}

export const audioManager = new AudioManager();
