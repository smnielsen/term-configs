// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;
const { program } = require('commander');


program.version('0.0.1');
program
  .option('-t, --text <text>', 'the text to translate')
  .option('-sl, --source_lang <source_lang>', 'The source language', 'EN')
  .option('--target <target>', 'The source language')
  .option('--google_project_id <project_id>', 
    'Project ID for Google APIs. Defaults to env.GOOGLE_PROJECT_ID', 
    process.env.GOOGLE_PROJECT_ID);

program.parse(process.argv);

const options = program.opts();
console.log(options)

console.log('=== THE TRANSLATOR ===')
if (!options.google_project_id) {
  console.error(new Error('ERROR: Missing Google Project ID'))
  program.help()
}
console.log(` - Using Google Api for Project = ${options.google_project_id}`)
// Creates a Google translation client
const translate = new Translate({ key });

const ALL_LANGUAGES = [ 
  'nl', // Dutch
  'fr', // French
  'de', // German
  'it', // Italy
  'lt', // Lithuanian
  'pl', // Polish
  'pt', // Portuguese
  'ru', // Russia
  'es', // Spanish
]

const textToTranslate = options.text;
const targets = [options.target] || ALL_LANGUAGES
/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const text = 'The text to translate, e.g. Hello, world!';
// const target = 'The target language, e.g. ru';

async function translateText(targetLang) {
  let [translations] = await translate.translate(textToTranslate, targetLang);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log(`Translations in ${targetLang}:`);
  translations.forEach((translation, i) => {
    console.log(`   :${i} => ${translation}`);
  });
}

async function translateAllTargets() {
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  if (!textToTranslate) {
    console.log('No text to translate, set with "-t, --text"')
    return
  }
  console.log('Translating text')
  console.log(textToTranslate)
  console.log('-----')
  console.log(`Translating to: ${JSON.stringify(targets)}`)

  return Promise.all(
      targets.map(translateText)
    )
    .then((...all) => {
      console.log('Finished translating all', all)
    })
    .catch((err) => {
      console.log('Something errored', err.errors)
    })
}

translateAllTargets()
  .then(() => {
    process.exit()
  })