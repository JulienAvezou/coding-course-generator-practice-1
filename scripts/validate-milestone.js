import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const configPath = path.join(rootDir, 'course', 'milestone-validation.json');

const branchName = readBranchName(process.argv.slice(2));

if (!branchName) {
  console.error(
    'Milestone validation needs a branch name. Pass --branch <name> or set GITHUB_HEAD_REF.'
  );
  process.exit(1);
}

const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const milestone = Array.isArray(config.milestones)
  ? config.milestones.find(
      (entry) => typeof entry.branchPrefix === 'string' && branchName.startsWith(entry.branchPrefix)
    )
  : null;

if (!milestone) {
  const expectedPrefixes = Array.isArray(config.milestones)
    ? config.milestones.map((entry) => entry.branchPrefix).filter(Boolean)
    : [];
  console.error(
    [
      `No milestone validation rule matched branch "${branchName}".`,
      expectedPrefixes.length > 0
        ? `Use a milestone branch such as: ${expectedPrefixes.join(', ')}`
        : 'No milestone validation rules were configured.'
    ].join(' ')
  );
  process.exit(1);
}

console.log(
  `Running ${config.checkName ?? 'Milestone Validation'} for ${milestone.milestoneId} (${branchName}).`
);
await runValidator(milestone.validatorId);
console.log(`Milestone validation passed for ${milestone.milestoneId}.`);

function readBranchName(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--branch' && typeof argv[index + 1] === 'string') {
      return argv[index + 1];
    }
  }

  return (
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || null
  );
}

async function runValidator(validatorId) {
  switch (validatorId) {
    case 'starter-change':
      await validateStarterChange();
      return;
    case 'one-book-object':
      await validateOneBookObject();
      return;
    case 'one-book-summary':
      await validateOneBookSummary();
      return;
    case 'reading-status-conditionals':
      await validateReadingStatusConditionals();
      return;
    case 'sample-library-collection':
      await validateSampleLibraryCollection();
      return;
    case 'parse-book-input':
      await validateParseBookInput();
      return;
    case 'save-search-library':
      await validateSaveSearchLibrary();
      return;
    case 'books-api-routes':
      await validateBooksApiRoutes();
      return;
    case 'html-css-library-page':
      await validateHtmlCssLibraryPage();
      return;
    case 'dom-events-fetch-ui':
      await validateDomEventsFetchUi();
      return;
    case 'sqlite-final-polish':
      await validateSqliteFinalPolish();
      return;
    case 'browser-ui-finish':
      await validateBrowserUiFinish();
      return;
    default:
      throw new Error(`Unknown milestone validator "${validatorId}".`);
  }
}

async function loadLibraryModule() {
  const libraryUrl = pathToFileURL(path.join(rootDir, 'src', 'library.js')).href;
  return import(libraryUrl);
}

async function readText(relativePath) {
  return fs.readFile(path.join(rootDir, relativePath), 'utf8');
}

async function pathExists(relativePath) {
  try {
    await fs.access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

function unwrapParsedBook(result) {
  if (!result || typeof result !== 'object') {
    return null;
  }

  if (
    typeof result.title === 'string' &&
    typeof result.author === 'string' &&
    typeof result.status === 'string'
  ) {
    return result;
  }

  if (
    result.ok === true &&
    result.value &&
    typeof result.value === 'object' &&
    typeof result.value.title === 'string' &&
    typeof result.value.author === 'string' &&
    typeof result.value.status === 'string'
  ) {
    return result.value;
  }

  return null;
}

function isRejectedParseResult(result) {
  if (result === null || result === undefined) {
    return true;
  }

  if (result === false) {
    return true;
  }

  if (typeof result === 'object') {
    if (result.ok === false) {
      return true;
    }

    if (typeof result.error === 'string' && result.error.length > 0) {
      return true;
    }
  }

  return false;
}

async function validateStarterChange() {
  const clientScript = await readText(path.join('public', 'app.js'));
  assert.doesNotMatch(
    clientScript,
    /(['"`])Starter ready\. Begin with the first milestone and make this project your own\.\1/,
    'Change the visible starter message in public/app.js before completing milestone 01.'
  );
}

async function validateOneBookSummary() {
  const library = await loadLibraryModule();
  assert.equal(
    typeof library.createBookSummary,
    'function',
    'Export createBookSummary(book) from src/library.js.'
  );
  const summary = library.createBookSummary({
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    status: 'unread'
  });
  assert.equal(typeof summary, 'string', 'createBookSummary(book) should return a string.');
  assert.match(summary, /Dune/i, 'The summary should mention the book title.');
  assert.match(summary, /Frank Herbert/i, 'The summary should mention the author.');
  assert.match(summary, /unread/i, 'The summary should mention the reading status.');
}

async function validateOneBookObject() {
  const library = await loadLibraryModule();
  assert.ok('sampleBook' in library, 'Export sampleBook from src/library.js.');
  assert.ok(
    library.sampleBook && typeof library.sampleBook === 'object',
    'sampleBook should be an object.'
  );
  assert.equal(typeof library.sampleBook.title, 'string', 'sampleBook.title should be a string.');
  assert.equal(typeof library.sampleBook.author, 'string', 'sampleBook.author should be a string.');
  assert.equal(typeof library.sampleBook.year, 'number', 'sampleBook.year should be a number.');
  assert.equal(typeof library.sampleBook.status, 'string', 'sampleBook.status should be a string.');
}

async function validateReadingStatusConditionals() {
  const library = await loadLibraryModule();
  assert.equal(
    typeof library.describeReadingStatus,
    'function',
    'Export describeReadingStatus(status) from src/library.js.'
  );
  const unread = library.describeReadingStatus('unread');
  const finished = library.describeReadingStatus('finished');
  const invalid = library.describeReadingStatus('mystery-status');

  assert.equal(typeof unread, 'string');
  assert.equal(typeof finished, 'string');
  assert.equal(typeof invalid, 'string');
  assert.notEqual(
    unread,
    finished,
    'Unread and finished statuses should not return the same message.'
  );
  assert.notEqual(invalid, unread, 'Invalid input should not look like a valid status.');
}

async function validateSampleLibraryCollection() {
  const library = await loadLibraryModule();
  assert.equal(
    typeof library.createSampleLibrary,
    'function',
    'Export createSampleLibrary() from src/library.js.'
  );
  const sampleLibrary = library.createSampleLibrary();
  assert.ok(Array.isArray(sampleLibrary), 'createSampleLibrary() should return an array.');
  assert.ok(sampleLibrary.length >= 3, 'Return at least three books in the sample library.');

  for (const book of sampleLibrary) {
    assert.ok(book && typeof book === 'object', 'Each sample book should be an object.');
    assert.equal(typeof book.title, 'string', 'Each book should have a title.');
    assert.equal(typeof book.author, 'string', 'Each book should have an author.');
    assert.equal(typeof book.status, 'string', 'Each book should have a reading status.');
  }
}

async function validateParseBookInput() {
  const library = await loadLibraryModule();
  assert.equal(
    typeof library.parseBookInput,
    'function',
    'Export parseBookInput(rawInput) from src/library.js.'
  );

  const validResult = library.parseBookInput('Dune | Frank Herbert | unread');
  const parsedBook = unwrapParsedBook(validResult);

  assert.ok(parsedBook, 'Valid input should produce structured book data.');
  assert.equal(parsedBook.title, 'Dune');
  assert.equal(parsedBook.author, 'Frank Herbert');
  assert.equal(parsedBook.status, 'unread');

  let invalidHandled = false;

  try {
    const invalidResult = library.parseBookInput('Only title');
    invalidHandled = isRejectedParseResult(invalidResult);
  } catch {
    invalidHandled = true;
  }

  assert.equal(
    invalidHandled,
    true,
    'Invalid input should throw an error or return a clear invalid result.'
  );
  assert.equal(
    await pathExists(path.join('tests', 'parsing.test.js')),
    true,
    'Create tests/parsing.test.js for your parser milestone.'
  );
}

async function validateSaveSearchLibrary() {
  const library = await loadLibraryModule();
  assert.equal(
    typeof library.filterBooksByStatus,
    'function',
    'Export filterBooksByStatus(books, status) from src/library.js.'
  );
  assert.equal(
    typeof library.sortBooksByTitle,
    'function',
    'Export sortBooksByTitle(books) from src/library.js.'
  );

  const sampleBooks = [
    { title: 'C', author: 'Author C', status: 'finished' },
    { title: 'A', author: 'Author A', status: 'unread' },
    { title: 'B', author: 'Author B', status: 'unread' }
  ];

  const unreadBooks = library.filterBooksByStatus(sampleBooks, 'unread');
  assert.ok(Array.isArray(unreadBooks), 'filterBooksByStatus should return an array.');
  assert.equal(unreadBooks.length, 2, 'Filtering unread books should return the matching books.');

  const sortedBooks = library.sortBooksByTitle(sampleBooks);
  assert.ok(Array.isArray(sortedBooks), 'sortBooksByTitle should return an array.');
  assert.deepEqual(
    sortedBooks.map((book) => book.title),
    ['A', 'B', 'C'],
    'sortBooksByTitle should order books alphabetically by title.'
  );

  assert.equal(
    await pathExists(path.join('data', 'library.json')),
    true,
    'Create data/library.json to persist your library for this milestone.'
  );
  const savedLibrary = JSON.parse(await readText(path.join('data', 'library.json')));
  assert.ok(Array.isArray(savedLibrary), 'data/library.json should contain a JSON array.');
}

async function validateBooksApiRoutes() {
  const serverSource = await readText(path.join('server', 'index.js'));
  assert.match(serverSource, /app\.get\((['"`])\/api\/books\1/, 'Add a GET /api/books route.');
  assert.match(serverSource, /app\.post\((['"`])\/api\/books\1/, 'Add a POST /api/books route.');
  assert.match(serverSource, /response\.json\(/, 'Return JSON responses from your API routes.');
}

async function validateHtmlCssLibraryPage() {
  const html = await readText(path.join('public', 'index.html'));
  const styles = await readText(path.join('public', 'styles.css'));

  assert.match(html, /<form\b/i, 'Add a form to public/index.html.');
  assert.match(html, /<label\b/i, 'Use label elements so the form is easier to understand.');
  assert.match(styles, /@media\b/i, 'Add at least one responsive CSS rule in public/styles.css.');
}

async function validateDomEventsFetchUi() {
  const clientScript = await readText(path.join('public', 'app.js'));

  assert.match(clientScript, /addEventListener\(/, 'Add a DOM event listener in public/app.js.');
  assert.match(
    clientScript,
    /preventDefault\(/,
    'Handle the form event before sending the request.'
  );
  assert.match(clientScript, /fetch\(/, 'Use fetch in public/app.js to talk to the API.');
}

async function validateSqliteFinalPolish() {
  const schema = await readText(path.join('db', 'schema.sql'));
  const readme = await readText('README.md');

  assert.match(schema, /create\s+table\s+books/i, 'Define a books table in db/schema.sql.');
  assert.doesNotMatch(
    readme,
    /Starter project for the Coding Course Generator beginner demo course\./,
    'Update the README so it describes the finished project instead of the starter.'
  );
}

async function validateBrowserUiFinish() {
  const html = await readText(path.join('public', 'index.html'));
  const clientScript = await readText(path.join('public', 'app.js'));
  const schema = await readText(path.join('db', 'schema.sql'));
  const readme = await readText('README.md');

  assert.match(html, /<form\b/i, 'Add a form to public/index.html.');
  assert.match(clientScript, /fetch\(/, 'Use fetch in public/app.js to talk to the API.');
  assert.match(clientScript, /\/api\/books/, 'Connect the browser UI to /api/books.');
  assert.match(schema, /create\s+table\s+books/i, 'Define a books table in db/schema.sql.');
  assert.doesNotMatch(
    readme,
    /Starter project for the Coding Course Generator beginner demo course\./,
    'Update the README so it describes the finished project instead of the starter.'
  );
}
