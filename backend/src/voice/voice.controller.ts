import { Controller, Post, UseInterceptors, UploadedFile, Body, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VoiceService } from "./voice.service";
import { Response } from "express";
import { TextToSpeechDto } from "./dto/text-to-speech.dto";

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('file'))
  async speechToText(@UploadedFile() file: Express.Multer.File): Promise<{ text: string }> {
    if (!file) {
      throw new Error('Nessun file audio fornito');
    }
    const text = await this.voiceService.speechToText(file);
    return { text };
  }

  @Post('text-to-speech')
  async textToSpeech(
    @Body() dto: TextToSpeechDto,
    @Res() res: Response
  ) {
    const audioBuffer = await this.voiceService.textToSpeech(
      dto.text,
      dto.modelId,
      dto.voiceId,
      dto.outputFormat,
      dto.voiceSettings
    );
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="tts.mp3"',
    });
    res.send(audioBuffer);
  }
}
