export function shellEscape(a) {
  const ret = [];

  a.forEach(function (s) {
    let isSafe = false;
    let str = s;
    if (str instanceof ShellSafeString) {
      isSafe = true;
      str = str.string;
    }
    const quoteToChange = isSafe ? '"' : '\'';
    if (/[^A-Za-z0-9_/:=-]/.test(str)) {
      str = quoteToChange +
        str.replace(/'/g, `${quoteToChange}\\${quoteToChange}${quoteToChange}`) +
        quoteToChange;
      const singleQuoteAtBeginning = new RegExp(`^(?:${quoteToChange}${quoteToChange})+`, 'g');
      const nonEscapedSingleQuote = new RegExp(
        `\\${quoteToChange}${quoteToChange}${quoteToChange}`, 'g'
      );
      str = str.replace(singleQuoteAtBeginning, '') // unduplicate single-quote at the beginning
        .replace(nonEscapedSingleQuote,
          `\\${quoteToChange}`); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(str);
  });
  return ret.join(' ');
}

export class ShellSafeString {
  constructor(str) {
    this.string = str;
  }
}
