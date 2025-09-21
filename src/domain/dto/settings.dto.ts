import { IsEnum, IsOptional } from "class-validator";

import type { ThemePreference } from "domain/entities/settings";

export class ThemeDto {
  @IsOptional()
  @IsEnum(["light", "dark", "system"], {
    message: "Theme must be 'light', 'dark', or 'system'",
  })
  theme?: ThemePreference;
}