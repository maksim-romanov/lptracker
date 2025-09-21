import { IsString } from "class-validator";

export class ClipboardContentDto {
  @IsString({ message: "Clipboard content must be a string" })
  content!: string;
}