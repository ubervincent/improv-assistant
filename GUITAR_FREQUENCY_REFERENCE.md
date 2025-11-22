# Guitar Frequency Reference Chart

## Standard Tuning (E A D G B E)

Use this to verify if the detected frequencies match what you're playing.

### Open Strings
| String | Note | Frequency (Hz) |
|--------|------|----------------|
| 6 (Low E) | E2 | 82.41 |
| 5 | A2 | 110.00 |
| 4 | D3 | 146.83 |
| 3 | G3 | 196.00 |
| 2 | B3 | 246.94 |
| 1 (High E) | E4 | 329.63 |

### Common Fret Positions (Low E String)
| Fret | Note | Frequency (Hz) |
|------|------|----------------|
| 0 | E2 | 82.41 |
| 1 | F2 | 87.31 |
| 2 | F#2 | 92.50 |
| 3 | G2 | 98.00 |
| 5 | A2 | 110.00 |
| 7 | B2 | 123.47 |
| 12 | E3 | 164.81 |

### Common Fret Positions (High E String)
| Fret | Note | Frequency (Hz) |
|------|------|----------------|
| 0 | E4 | 329.63 |
| 1 | F4 | 349.23 |
| 2 | F#4 | 369.99 |
| 3 | G4 | 392.00 |
| 5 | A4 | 440.00 |
| 7 | B4 | 493.88 |
| 12 | E5 | 659.25 |

## How to Use This Chart

1. Play a note on your guitar
2. Look at the browser console
3. Check the **detected frequency** against this chart
4. If the frequency is correct but the note name is wrong → octave calculation bug
5. If the frequency is way off → ml5.js model accuracy issue or tuning issue

## Troubleshooting

- **Detected frequency is close but not exact** (within 5-10 Hz) → Normal, guitar might be slightly out of tune
- **Detected frequency is completely wrong** (off by >20 Hz) → Try:
  - Plucking the string harder (increase volume)
  - Moving sensitivity slider to the left (more sensitive)
  - Checking your guitar tuning
  - Using a different microphone input
