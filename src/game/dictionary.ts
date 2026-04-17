// @ts-expect-error — no types for this package
import frenchWords from 'an-array-of-french-words'

// Mots valides en 2 lettres ODS (non tous présents dans le package)
const TWO_LETTER_EXTRA = new Set([
  'AA','AH','AI','AL','AN','AS','AU','AV','AX','AY',
  'BI','BO','BU','BY',
  'CI',
  'DA','DE','DO','DU',
  'EN','ES','ET','EU','EX',
  'FA','FI','FU',
  'GA','GI','GO','GU',
  'HA','HE','HI','HO','HU','HY',
  'IF',
  'JE',
  'KA','KI',
  'LA','LE','LI','LO','LU',
  'MA','ME','MI','MU',
  'NA','NE','NI','NO','NU',
  'OC','OE','OH','OM','ON','OR','OS','OU','OX','OY',
  'PA','PE','PI','PU',
  'RA','RE','RI','RU',
  'SA','SI','SO','SU',
  'TA','TE','TI','TO','TU',
  'UN','UR','US','UT',
  'VA','VE','VI','VU',
  'XI',
  'YA','YO',
  'ZA',
])

// Set principal (chargé une fois au démarrage)
let dictionary: Set<string> | null = null

function buildDictionary(): Set<string> {
  if (dictionary) return dictionary

  const words = frenchWords as string[]
  // On garde les mots de 2 à 15 lettres, sans accents, en majuscules
  const normalized = words
    .filter((w) => w.length >= 2 && w.length <= 15 && /^[a-zA-ZÀ-ÿ]+$/.test(w))
    .map((w) =>
      w
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    )

  dictionary = new Set([...normalized, ...TWO_LETTER_EXTRA])
  return dictionary
}

export function isValidWord(word: string): boolean {
  const dict = buildDictionary()
  const normalized = word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return dict.has(normalized)
}

export function getDictionarySize(): number {
  return buildDictionary().size
}

// Liste filtrée pour l'IA (mots 2-8 lettres, sans accents, majuscules)
let aiWordList: string[] | null = null

export function getAIWordList(): string[] {
  if (aiWordList) return aiWordList
  const words = frenchWords as string[]
  aiWordList = words
    .filter((w) => w.length >= 2 && w.length <= 8 && /^[a-zA-ZÀ-ÿ]+$/.test(w))
    .map((w) =>
      w.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    )
  // Ajouter les 2-lettres ODS
  for (const w of TWO_LETTER_EXTRA) {
    if (!aiWordList.includes(w)) aiWordList.push(w)
  }
  return aiWordList
}
