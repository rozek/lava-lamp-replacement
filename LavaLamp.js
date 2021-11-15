  let Neopixel = require("neopixel");

  let rounded = Math.round;
  let clamped = E.clip;
  let max     = Math.max;

  let DisplaySize = 16*16;
  let Display     = new Uint8ClampedArray(DisplaySize*3);

  let PixelOffset = new Int16Array(256);
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        let Index = i*16 + j;
        if (i % 2 === 0) {
          PixelOffset[Index] = Index*3;
        } else {
          PixelOffset[Index] = (i*16 + 15 - j)*3;
        }
      }
    }

  let normalized = new Uint8ClampedArray(16*16);
    for (let i = 0; i < 256; i++) {
      normalized[i] = (
        i === 0
        ? 0
        : rounded(1 + 256/4*(i/256)*(i/256))
      );
    }

  let TemperatureMap = new Uint8ClampedArray(DisplaySize);
    for (let i = 0; i < 256; i++) {
      TemperatureMap[i] = 0;
    }

  let ColorMap = new Array(16);
    for (let i = 0; i < 16; i++) {
      ColorMap[i] = E.HSBtoRGB(i/16, 1, 1, true);
    }

/**** computeDiffusion ****/

  function computeDiffusion () {
    let i = 0, j = 0, k = 0;
    for (i = 15; i > 0; i--) {             // intensity diffusion for upper rows
      k = i*16;
      TemperatureMap[k] = rounded((
        6*TemperatureMap[k] + 2*TemperatureMap[k-16] + TemperatureMap[k-15]
      )/9);

      for (j = 1; j < 15; j++) {
        k++;
        TemperatureMap[k] = rounded((
          6*TemperatureMap[k] +
          TemperatureMap[k-17] + 2*TemperatureMap[k-16] + TemperatureMap[k-15]
        )/10);
      }

      k++;
      TemperatureMap[k] = rounded((
        6*TemperatureMap[k] + TemperatureMap[k-17] + 2*TemperatureMap[k-16]
      )/9);
    }
  }

/**** computeHeating ****/

  let HeatX     = rounded(16*Math.random());         // where to insert new heat
  let HeatCount = rounded(12*Math.random());           // how long to heat there

  function computeHeating () {
    HeatCount -= 1;
    if (HeatCount < 0) {                    // heat around HeatX, cool elsewhere
      HeatX     = rounded(16*Math.random());
      HeatCount = rounded(12*Math.random());
    }

    let i, l = HeatX-4;
    for (i = 0/*, l = HeatX-4*/; i < l; i++) {
      TemperatureMap[i] = clamped(TemperatureMap[i] - 8, 0,255);
    }
      i = HeatX-4;
      i++; if (i >= 0) { TemperatureMap[i] = clamped(TemperatureMap[i] + 1, 0,255); }
      i++; if (i >= 0) { TemperatureMap[i] = clamped(TemperatureMap[i] + 3, 0,255); }
      i++; if (i >= 0) { TemperatureMap[i] = clamped(TemperatureMap[i] + 4, 0,255); }
      i++;               TemperatureMap[i] = clamped(TemperatureMap[i] + 5, 0,255);
      i++; if (i < 16) { TemperatureMap[i] = clamped(TemperatureMap[i] + 4, 0,255); }
      i++; if (i < 16) { TemperatureMap[i] = clamped(TemperatureMap[i] + 3, 0,255); }
      i++; if (i < 16) { TemperatureMap[i] = clamped(TemperatureMap[i] + 1, 0,255); }
      i++;
    for (i = i; i < 16; i++) {
      TemperatureMap[i] = clamped(TemperatureMap[i] - 8, 0,255);
    }
  }

/**** prepare display ****/

  let normalizedRGB = new Uint8ClampedArray(3);

  function prepareDisplay () { "compiled";
    for (let i = 0; i < 16; i++) {                                   // row-wise
      let RowStart = i*16; let RowEnd = RowStart + 15;
      let k = RowStart;
      for (let j = 0/*, k = RowStart*/; j < 16; j++/*, k++*/) {   // column-wise
        let RGB         = ColorMap[j];
        let Temperature = TemperatureMap[k];
          if (Temperature < 16) {
            Temperature = 0;
          } else {
            Temperature = max(48,Temperature)/256;
          }

        normalizedRGB[0] = normalized[rounded(RGB[1]*Temperature)];
        normalizedRGB[1] = normalized[rounded(RGB[0]*Temperature)];
        normalizedRGB[2] = normalized[rounded(RGB[2]*Temperature)];

        Display.set(normalizedRGB, PixelOffset[k]);

        k++;
      }
    }
  }

/**** handleNextFrame ****/

  function handleNextFrame () {
    computeDiffusion();
    computeHeating();
    prepareDisplay();

  /**** show display ****/

    Neopixel.write(B15,Display);

  /**** wait for next frame and proceed ****/

    setTimeout(handleNextFrame,10);
  }

/**** start automatically ****/

  setTimeout(handleNextFrame,1000);       // give Espruino some time to start up
