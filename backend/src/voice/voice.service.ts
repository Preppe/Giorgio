import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as wav from 'wav';
import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai';

@Injectable()
export class VoiceService {
  // Model mappings per engine
  private readonly GOOGLE_MODELS = ['gemini-2.5-flash-preview-tts'];
  private readonly ELEVENLABS_MODELS = ['eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_multilingual_v2'];

  /**
   * Get engine from modelId
   * @param modelId modello da utilizzare
   * @returns engine corrispondente
   */
  private getEngineFromModelId(modelId: string): string {
    if (this.GOOGLE_MODELS.includes(modelId)) {
      return 'google';
    }
    if (this.ELEVENLABS_MODELS.includes(modelId)) {
      return 'elevenlabs';
    }
    throw new HttpException(`Model non supportato: ${modelId}`, HttpStatus.BAD_REQUEST);
  }

  /**
   * Text to speech routing method
   * @param text testo da convertire in audio
   * @param modelId modello da utilizzare
   * @param voiceId id/nome della voce
   * @param outputFormat formato audio
   * @param voiceSettings impostazioni opzionali della voce
   * @returns Buffer audio
   */
  async textToSpeech(
    text: string,
    modelId: string,
    voiceId?: string,
    outputFormat?: string,
    voiceSettings?: Record<string, any>
  ): Promise<Buffer> {
    const engine = this.getEngineFromModelId(modelId);
    
    switch (engine) {
      case 'google':
        return this.geminiTTS(text, voiceId, modelId);
      case 'elevenlabs':
        return this.elevenlabs(text, voiceId, modelId, outputFormat, voiceSettings);
      default:
        throw new HttpException(`Engine non supportato: ${engine}`, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Speech to text usando Google Gemini API.
   * @param file file audio ricevuto da Multer
   * @returns testo trascritto
   */
  async speechToText(file: Express.Multer.File): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY non impostata nelle variabili d'ambiente");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Upload del file audio usando buffer e mimetype forniti da Multer
    const blob = new Blob([file.buffer], { type: file.mimetype });
    const myfile = await ai.files.upload({
      file: blob,
      config: { mimeType: file.mimetype },
    });

    // Richiesta trascrizione
    if (!myfile.uri || !myfile.mimeType) {
      throw new Error('Upload fallito: uri o mimeType non disponibili');
    }

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([createPartFromUri(myfile.uri, myfile.mimeType), 'Generate a transcript of the speech.']),
    });

    return result.text ?? '';
  }

  /**
   * Text to speech usando Google Gemini API con lo stile di Giorgio.
   * @param text testo da convertire in audio
   * @param voiceName nome della voce (opzionale, default: 'Charon' per Giorgio)
   * @param model modello Gemini TTS (opzionale, default: 'gemini-2.5-flash-preview-tts')
   * @returns Buffer audio WAV
   */
  async geminiTTS(text: string, voiceName: string = 'Charon', model: string = 'gemini-2.5-flash-preview-tts'): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY non impostata nelle variabili d'ambiente");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Applica lo stile di Giorgio: eleganza raffinata con sofisticazione composta
    const giorgioStylePrompt = "Speak with refined elegance and composed sophistication - measured but reasonably paced delivery (not slow or monotonous), subtle wit, professional courtesy, and the intelligent poise of a digital advisor. Maintain dignified precision while being genuinely helpful.";
    const styledText = `${giorgioStylePrompt}\n\n${text}`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: styledText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
      throw new Error('Risposta TTS non valida');
    }
    // Decodifica base64 in buffer audio PCM
    const pcmBuffer = Buffer.from(data, 'base64');

    // Crea file WAV completo usando la libreria wav
    const wavBuffer = await this.createWavBuffer(pcmBuffer);

    return wavBuffer;
  }
  
  // Funzione per creare buffer WAV completo da dati PCM usando libreria wav
  private async createWavBuffer(pcmData: Buffer, sampleRate: number = 24000, channels: number = 1, bitDepth: number = 16): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const writer = new wav.Writer({
        channels,
        sampleRate,
        bitDepth,
      });

      writer.on('data', (chunk) => {
        chunks.push(chunk);
      });

      writer.on('end', () => {
        const wavBuffer = Buffer.concat(chunks);
        resolve(wavBuffer);
      });

      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
    });
  }

  /**
   * Text to speech usando ElevenLabs API.
   * @param text testo da convertire in audio
   * @param voiceId id della voce ElevenLabs (default: 'JBFqnCBsd6RMkjVDRZzb')
   * @param modelId modello ElevenLabs (default: 'eleven_multilingual_v2')
   * @param outputFormat formato audio (default: 'mp3_44100_128')
   * @param voiceSettings impostazioni opzionali della voce
   * @returns Buffer audio MP3
   */
  async elevenlabs(
    text: string,
    voiceId: string = '8KInRSd4DtD5L5gK7itu',
    modelId: string = 'eleven_flash_v2_5',
    outputFormat: string = 'mp3_44100_128',
    voiceSettings?: Record<string, any>
  ): Promise<Buffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY non impostata nelle variabili d\'ambiente');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const body: any = {
      text,
      model_id: modelId,
      output_format: outputFormat,
    };
    if (voiceSettings) {
      body.voice_settings = voiceSettings;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Errore ElevenLabs TTS: ${response.status} - ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
