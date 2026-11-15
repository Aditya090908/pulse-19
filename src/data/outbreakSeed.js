// Seed table for the simulated dataset: country code -> "disease:scale:phase, ...".
//   scale: 1 (small) to 10 (very large)
//   phase: rising | peak | falling | stable
// These are invented demonstration scenarios. They do not describe real outbreaks.

const SEED = {
  840: 'measles:6:rising, h5n1:3:rising, mpox:3:falling',
  124: 'measles:4:rising',
  484: 'dengue:7:peak, measles:4:falling, h5n1:2:stable',
  76: 'dengue:10:falling, chikungunya:7:stable, measles:3:falling',
  32: 'dengue:6:falling',
  170: 'dengue:7:rising, measles:3:stable',
  604: 'dengue:6:peak, diphtheria:2:rising',
  826: 'measles:4:rising',
  250: 'measles:4:falling',
  276: 'measles:3:stable, h5n1:1:rising',
  724: 'dengue:2:rising, measles:3:falling',
  380: 'chikungunya:3:falling, measles:3:stable',
  643: 'measles:5:rising, diphtheria:3:stable',
  792: 'measles:4:stable, cholera:2:rising',
  682: 'dengue:3:stable',
  364: 'cholera:4:rising, measles:4:falling',
  887: 'cholera:9:peak, diphtheria:6:rising, measles:6:rising',
  818: 'h5n1:2:rising, measles:3:stable',
  566: 'cholera:8:rising, diphtheria:7:peak, measles:6:stable, mpox:4:falling',
  180: 'mpox:8:peak, cholera:7:rising, measles:7:rising, marburg:3:rising',
  231: 'cholera:6:rising, measles:7:stable, dengue:3:rising',
  404: 'cholera:6:falling, mpox:4:rising, dengue:4:stable',
  710: 'measles:4:falling, cholera:2:falling',
  800: 'marburg:4:peak, mpox:5:stable, cholera:3:falling',
  834: 'marburg:3:falling, cholera:5:rising, dengue:3:rising',
  729: 'cholera:9:rising, dengue:6:rising, measles:5:peak',
  288: 'mpox:3:rising, cholera:3:falling',
  508: 'cholera:7:peak, chikungunya:3:rising',
  450: 'chikungunya:5:falling, measles:4:rising',
  356: 'dengue:9:rising, measles:6:falling, cholera:5:stable, h5n1:2:stable',
  586: 'dengue:8:rising, measles:6:peak, diphtheria:4:rising',
  50: 'dengue:9:peak, cholera:5:rising, chikungunya:4:falling',
  156: 'chikungunya:6:falling, h5n1:3:stable, measles:3:falling',
  360: 'dengue:8:stable, h5n1:2:rising, measles:5:falling',
  608: 'dengue:8:rising, measles:4:peak, mpox:2:rising',
  704: 'dengue:7:falling, h5n1:2:rising',
  764: 'dengue:7:falling, chikungunya:3:rising',
  392: 'measles:2:falling, h5n1:1:stable',
  410: 'measles:2:stable',
  36: 'dengue:3:falling, h5n1:1:rising, measles:2:falling',
};

/** @returns {{diseaseId: string, scale: number, phase: string}[]} */
export function getSeedFor(countryCode) {
  const raw = SEED[countryCode];
  if (!raw) return [];
  return raw.split(',').map((part) => {
    const [diseaseId, scale, phase] = part.trim().split(':');
    return { diseaseId, scale: Number(scale), phase };
  });
}
