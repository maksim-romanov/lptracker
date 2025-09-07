export type TypographyVariant = {
  fontFamily: string;
  fontSize: number; // px
  lineHeight: number; // px
  ascent: number;
  descent: number;
  capHeight: number;
  lineGap: number;
  unitsPerEm: number;
};

export const typography = {
  variants: {
    headline1: { fontFamily: "Inter24pt-Bold", fontSize: 48, lineHeight: 48 * 1.2 },
    headline2: { fontFamily: "Inter24pt-Bold", fontSize: 36, lineHeight: 36 * 1.2 },
    headline3: { fontFamily: "Inter24pt-Bold", fontSize: 28, lineHeight: 28 * 1.1 },
    headline4: { fontFamily: "Inter18pt-SemiBold", fontSize: 22, lineHeight: 22 * 1.2 },
    headline5: { fontFamily: "Inter18pt-SemiBold", fontSize: 18, lineHeight: 18 * 1.2 },
    headline6: { fontFamily: "Inter18pt-Medium", fontSize: 16, lineHeight: 16 * 1.1 },

    subtitle1: { fontFamily: "Inter18pt-Regular", fontSize: 16, lineHeight: 16 * 1.1 },
    subtitle2: { fontFamily: "Inter18pt-Medium", fontSize: 14, lineHeight: 14 * 1.1 },

    body1: { fontFamily: "Inter18pt-Regular", fontSize: 16, lineHeight: 16 * 1.4 },
    body2: { fontFamily: "Inter18pt-Light", fontSize: 14, lineHeight: 15 * 1.3 },

    button: { fontFamily: "Inter18pt-Medium", fontSize: 14, lineHeight: 14 * 1.2 },
    caption: { fontFamily: "Inter18pt-Medium", fontSize: 12, lineHeight: 12 * 1.2 },
    overline: { fontFamily: "Inter18pt-Light", fontSize: 10, lineHeight: 10 * 1.1 },
  } as const,
};
