/**
 * Escape array of strings and create string that may be executed on the shell. 
 * Reimplement utils taken from package shell-escape 
 * See more: https://github.com/xxorax/node-shell-escape
 * 
 * @author Agnieszka Warchoł, Martin Panel
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
      const quote = new RegExp(quoteToChange, 'g');
      str = quoteToChange +
        str.replace(quote, `${quoteToChange}\\${quoteToChange}${quoteToChange}`) +
        quoteToChange;
      const quoteAtBeginning = new RegExp(`^(?:${quoteToChange}${quoteToChange})+`, 'g');
      const nonEscapedQuote = new RegExp(
        `\\\\${quoteToChange}${quoteToChange}${quoteToChange}`, 'g'
      );
      str = str.replace(quoteAtBeginning, '') // unduplicate quote at the beginning
        .replace(nonEscapedQuote,
          `\\${quoteToChange}`); // remove non-escaped quote if there are enclosed between 2 escaped
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
