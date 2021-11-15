  let Neopixel = require("neopixel");

  let Display = new Uint8ClampedArray(16*16*3);

  let normalized = new Uint8ClampedArray(16*16);
    for (let i = 0; i < 256; i++) {
      normalized[i] = (
        i === 0
        ? 0
        : Math.round(1 + 256/4*(i/256)*(i/256))
      );
    }

  function showColor (Row, Hue, Sat) {
    let RGB           = E.HSBtoRGB(Hue, Sat, 1, true);
    let normalizedRGB = new Uint8ClampedArray(3);

    for (let i = 0; i < 16; i++) {
      normalizedRGB[0] = normalized[Math.round(RGB[0]*i/16)];
      normalizedRGB[1] = normalized[Math.round(RGB[1]*i/16)];
      normalizedRGB[2] = normalized[Math.round(RGB[2]*i/16)];
      if (Row % 2 === 0) {
        Display.set(normalizedRGB, Row*16*3 + i*3);
      } else {
        Display.set(normalizedRGB, Row*16*3 + 15*3 - i*3);
      }
    }
  }

  for (let i = 0, l = 16; i < l; i++) {
    showColor(i, i/16, 1);
  }

  Neopixel.write(D22,Display);
