import re

class RegExpBuilder:

    def __init__(self):
        self._literal = ""
        self._ignoreCase = False
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
        self._behind = ""
        self._notBehind = ""
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
        self._behind = ""
        self._notBehind = ""
        self._either = ""
        self._reluctant = False
        self._capture = False

    def _flushState(self):
        if self._of != "" or self._ofAny or self._ofGroup > 0 or self._from != "" or self._notFrom != "" or self._like != "":
            captureLiteral = "" if self._capture else "?:"
            quantityLiteral = self._getQuantityLiteral()
            characterLiteral = self._getCharacterLiteral()
            reluctantLiteral = "?" if self._reluctant else ""
            behindLiteral = "(?=" + self._behind + ")" if self._behind != "" else ""
            notBehindLiteral = "(?!" + self._notBehind + ")" if self._notBehind != "" else ""
            self._literal += "(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")" + behindLiteral + notBehindLiteral
            self._clear()
  
    def _getQuantityLiteral(self):
        if self._min != -1:
            if self._max != -1:
                return "{" + str(self._min) + "," + str(self._max) + "}"
            return "{" + str(self._min) + ",}"
        return "{0," + str(self._max) + "}"
  
    def _getCharacterLiteral(self):
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
  
    def getLiteral(self):
        self._flushState()
        return self._literal
  
    def getRegExp(self):
        self._flushState()
        flags = 0
        if self._ignoreCase:
            flags = flags | re.IGNORECASE
        if self._multiLine:
            flags = flags | re.MULTILINE
        return re.compile(self._literal, flags)
  
    def ignoreCase(self):
        self._ignoreCase = True
        return self
  
    def multiLine(self):
        self._multiLine = True
        return self
  
    def start(self):
        self._literal += "(?:^)"
        return self
  
    def end(self):
        self._flushState()
        self._literal += "(?:$)"
        return self
  
    def eitherLike(self, r):
        self._flushState()
        self._either = r(RegExpBuilder()).getLiteral()
        return self

    def eitherString(self, s):
        return self.eitherLike(lambda r: r.exactly(1).of(s))
  
    def orLike(self, r):
        eitherLike = self._either
        orLike = r(RegExpBuilder()).getLiteral()
        if eitherLike == "":
            self._literal = self._literal[:-1]
            self._literal += "|(?:" + orLike + "))"
        else:
            self._literal += "(?:(?:" + eitherLike + ")|(?:" + orLike + "))"
        self._clear()
        return self

    def orString(self, s):
        return self.orLike(lambda r: r.exactly(1).of(s))
  
    def exactly(self, n):
        self._flushState()
        self._min = n
        self._max = n
        return self
  
    def min(self, n):
        self._flushState()
        self._min = n
        return self
  
    def max(self, n):
        self._flushState()
        self._max = n
        return self
  
    def of(self, s):
        self._of = self._escapeOutsideCharacterClass(s)
        return self
  
    def ofAny(self):
        self._ofAny = True
        return self

    def ofGroup(self, n):
        self._ofGroup = n
        return self
  
    def fromClass(self, s):
        self._from = self._escapeInsideCharacterClass("".join(s))
        return self
  
    def notFromClass(self, s):
        self._notFrom = self._escapeInsideCharacterClass("".join(s))
        return self

  
    def like(self, r):
        self._like = r(RegExpBuilder()).getLiteral()
        return self
  
    def reluctantly(self):
        self._reluctant = True
        return self
  
    def behind(self, r):
        self._behind = r(RegExpBuilder()).getLiteral()
        return self
  
    def notBehind(self, r):
        self._notBehind = r(RegExpBuilder()).getLiteral()
        return self
  
    def asGroup(self):
        self._capture = True
        return self

    def then(self, s):
        return self.exactly(1).of(s)

    def some(self, s):
        return self.min(1).from(s)

    def maybe(self, s):
        return self.max(1).of(s)

    def anything(self):
        return self.min(1).ofAny()

    def lineBreak(self):
        return self.either("\r\n").or("\r").or("\n")

    def lineBreaks(self):
        return self.like(lambda r : r.lineBreak())

    def whitespace(self):
        return self.min(1).of("\s")

    def tab(self):
        return self.exactly(1).of("\t")

    def tabs(self):
        return self.like(lambda r : r.tab())
  
    def _escapeInsideCharacterClass(self, s):
        return self._escapeSpecialCharacters(s, self._specialCharactersInsideCharacterClass)


    def _escapeOutsideCharacterClass(self, s):
        return self._escapeSpecialCharacters(s, self._specialCharactersOutsideCharacterClass)
  
    def _escapeSpecialCharacters(self, s, specialCharacters):
        escapedString = ""
        for i in range(len(s)):
            character = s[i]
            if character in specialCharacters:
                escapedString += "\\" + character
            else:
                escapedString += character

        return escapedString
