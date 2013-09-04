import re

class RegExpBuilder:

    def __init__(self):
        self._literal = ""
        self._ignoreCase = False
        self._multiLine = False
        self._specialCharactersInsideCharacterClass = set(["^", "-", "]"])
        self._specialCharactersOutsideCharacterClass = set([".", "^", "$", "*", "+", "?", "(", ")", "[", "{"])
        self._min = -1
        self._max = -1
        self._of = ""
        self._ofAny = False
        self._ofGroup = -1
        self._from = ""
        self._notFrom = ""
        self._like = ""
        self._either = ""
        self._reluctant = False
        self._capture = False

    def _clear(self):
        self._ignoreCase = False
        self._multiLine = False
        self._min = -1
        self._max = -1
        self._of = ""
        self._ofAny = False
        self._ofGroup = -1
        self._from = ""
        self._notFrom = ""
        self._like = ""
        self._either = ""
        self._reluctant = False
        self._capture = False

    def _flush_state(self):
        if self._of != "" or self._ofAny or self._ofGroup > 0 or self._from != "" or self._notFrom != "" or self._like != "":
            captureLiteral = "" if self._capture else "?:"
            quantityLiteral = self._get_quantity_literal()
            characterLiteral = self._get_character_literal()
            reluctantLiteral = "?" if self._reluctant else ""
            self._literal += "(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")"
            self._clear()
  
    def _get_quantity_literal(self):
        if self._min != -1:
            if self._max != -1:
                return "{" + str(self._min) + "," + str(self._max) + "}"
            return "{" + str(self._min) + ",}"
        return "{0," + str(self._max) + "}"
  
    def _get_character_literal(self):
        if self._of != "":
            return self._of
        if self._ofAny:
            return "."
        if self._ofGroup > 0:
            return "\\" + str(self._ofGroup)
        if self._from != "":
            return "[" + self._from + "]"
        if self._notFrom != "":
            return "[^" + self._notFrom + "]"
        if self._like != "":
            return self._like
  
    def get_literal(self):
        self._flush_state()
        return self._literal
  
    def get_regexp(self):
        self._flush_state()
        flags = 0
        if self._ignoreCase:
            flags = flags | re.IGNORECASE
        if self._multiLine:
            flags = flags | re.MULTILINE
        return re.compile(self._literal, flags)
  
    def ignore_case(self):
        self._ignoreCase = True
        return self
  
    def multi_line(self):
        self._multiLine = True
        return self
  
    def start_of_input(self):
        self._literal += "(?:^)"
        return self

    def start_of_line(self):
        self.multi_line()
        return self.start_of_input()
  
    def end_of_input(self):
        self._flush_state()
        self._literal += "(?:$)"
        return self

    def end_of_line(self):
        self.multi_line()
        return self.end_of_input()

    def either(self, s):
        if len(s) > 0:
            self._flush_state()
            literal = "(?:"
            for element in s:
                literal += "(?:"
                if type(element) is str:
                    literal += RegExpBuilder().exactly(1).of(element).get_literal()
                else:
                    literal += element.get_literal()
                literal += ")|"
            literal = literal[:-1] + ")"
            self._literal += literal
        return self
  
    def exactly(self, n):
        self._flush_state()
        self._min = n
        self._max = n
        return self
  
    def min(self, n):
        self._flush_state()
        self._min = n
        return self
  
    def max(self, n):
        self._flush_state()
        self._max = n
        return self
  
    def of(self, s):
        self._of = self._escape_outside_character_class(s)
        return self
  
    def of_any(self):
        self._ofAny = True
        return self

    def of_group(self, n):
        self._ofGroup = n
        return self
  
    def from_class(self, s):
        self._from = self._escape_inside_character_class("".join(s))
        return self
  
    def not_from_class(self, s):
        self._notFrom = self._escape_inside_character_class("".join(s))
        return self
  
    def like(self, r):
        self._like = r.get_literal()
        return self
  
    def reluctantly(self):
        self._reluctant = True
        return self
  
    def ahead(self, r):
        self._flush_state()
        self._literal += "(?=" + r.get_literal() + ")"
        return self
  
    def not_ahead(self, r):
        self._flush_state()
        self._literal += "(?!" + r.get_literal() + ")"
        return self
  
    def as_group(self):
        self._capture = True
        return self

    def then(self, s):
        return self.exactly(1).of(s)

    def some(self, s):
        return self.min(1).from_class(s)

    def maybe_some(self, s):
        return self.min(0).from_class(s)

    def maybe(self, s):
        return self.max(1).of(s)

    def something(self):
        return self.min(1).of_any()

    def anything(self):
        return self.min(0).of_any()

    def any(self):
        return self.exactly(1).of_any()

    def line_break(self):
        return self.either(["\r\n", "\r", "\n"])

    def line_breaks(self):
        return self.like(RegExpBuilder().line_break())

    def whitespace(self):
        if self._min == -1 and self._max == -1:
            return self.exactly(1).of("\s")
        self._like = "\s"
        return self

    def not_whitespace(self):
        if self._min == -1 and self._max == -1:
            return self.exactly(1).of("\S")
        self._like = "\S"
        return self

    def tab(self):
        return self.exactly(1).of("\t")

    def tabs(self):
        return self.like(RegExpBuilder().tab())

    def digit(self):
        return self.exactly(1).of("\d")

    def not_digit(self):
        return self.exactly(1).of("\D")

    def digits(self):
        return self.like(RegExpBuilder().digit())

    def not_digits(self):
        return self.like(RegExpBuilder().not_digit())

    def letter(self):
        self.exactly(1)
        self._from = "A-Za-z"
        return self

    def not_letter(self):
        self.exactly(1)
        self._notFrom = "A-Za-z"
        return self

    def letters(self):
        self._from = "A-Za-z"
        return self

    def not_letters(self):
        self._not_from = "A-Za-z"
        return self

    def lower_case_letter(self):
        self.exactly(1)
        self._from = "a-z"
        return self

    def lower_case_letters(self):
        self._from = "a-z"
        return self

    def upper_case_letter(self):
        self.exactly(1)
        self._from = "A-Z"
        return self

    def upper_case_letters(self):
        self._from = "A-Z"
        return self

    def append(self, r):
        self.exactly(1)
        self._like = r.get_literal()
        return self

    def optional(self, r):
        self.max(1)
        self._like = r.get_literal()
        return self
  
    def _escape_inside_character_class(self, s):
        return self._escape_special_characters(s, self._specialCharactersInsideCharacterClass)

    def _escape_outside_character_class(self, s):
        return self._escape_special_characters(s, self._specialCharactersOutsideCharacterClass)
  
    def _escape_special_characters(self, s, specialCharacters):
        escapedString = ""
        for i in range(len(s)):
            character = s[i]
            if character in specialCharacters:
                escapedString += "\\" + character
            else:
                escapedString += character

        return escapedString
