import { ILLEGAL_CHAR_REGEX, replaceIllegalChars, REPLACEMENT_CHAR } from "../util";
import * as fs from "fs";

const illegalCharacters = ILLEGAL_CHAR_REGEX.source.split("").filter((char) => {
  return ILLEGAL_CHAR_REGEX.test(char);
});

describe("Valid but disallowed characters are replaced", () => {
  test.each(illegalCharacters)(
    "Invalid character %s is replaced",
    (character) => {
      const input = `test${character}test.txt`;
      const expected = `test${character}test.txt`.replace(
        character,
        REPLACEMENT_CHAR
      );
      const actual = replaceIllegalChars(input);
      expect(actual).toBe(expected);
    }
  );
});

// ASCII sections
// The ASCII table is divided into three different sections.
//
// Non-printable, system codes between 0 and 31.
// Lower ASCII, between 32 and 127. This table originates from the older American systems, which worked on 7-bit character tables.
// Higher ASCII, between 128 and 255. This portion is programmable; characters are based on the language of your operating system or program you are using. Foreign letters are also placed in this section.
const lowerAsciiCharacters = () => {
  const characters = [];
  for (let i = 32; i < 127; i++) {
    characters.push(String.fromCharCode(i));
  }
  return characters;
};

const lowerAsciiCharactersWithoutIllegal = () =>
  lowerAsciiCharacters().filter((char) => {
    return !ILLEGAL_CHAR_REGEX.test(char);
  });

// generate and test a list of common non-alphanumeric characters that are not in the illegal list
describe("Verify the filesystem will allow filenames containing non-alphanumeric characters that are not in the illegal list", () => {
  test.each(lowerAsciiCharactersWithoutIllegal())(
    "Filesystem allows creation of file with character '%s'",
    (char) => {
      const input = `test${char}test.txt`;
      // verify file does not already exist
      expect(fs.existsSync(input)).toBe(false);
      fs.writeFileSync(input, "test");
      // verify the file exists
      expect(fs.existsSync(input)).toBe(true);
      //   remove the file
      fs.unlinkSync(input);
      // verify the file has been deleted
      expect(fs.existsSync(input)).toBe(false);
    }
  );
});
