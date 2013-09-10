var RegExpBuilder = function () {
    var self = this;

    self._literal = [];
    self._groupsUsed = 0;
    self._specialCharactersInsideCharacterClass = { "\^": true, "\-": true, "\]": true };
    self._specialCharactersOutsideCharacterClass = { "\.": true, "\^": true, "\$": true, "\*": true, "\+": true, "\?": true, "\(": true, "\)": true, "\[": true, "\{": true };
    self._escapedString = [];

    self._clear = function () {
        self._ignoreCase = "";
        self._multiLine = "";
        self._min = -1;
        self._max = -1;
        self._of = "";
        self._ofAny = false;
        self._ofGroup = -1;
        self._from = "";
        self._notFrom = "";
        self._like = "";
        self._either = "";
        self._reluctant = false;
        self._capture = false;
    }

    self._clear();

    self._flushState = function () {
        if (self._of != "" || self._ofAny || self._ofGroup > 0 || self._from != "" || self._notFrom != "" || self._like != "") {
            var captureLiteral = self._capture ? "" : "?:";
            var quantityLiteral = self._getQuantityLiteral();
            var characterLiteral = self._getCharacterLiteral();
            var reluctantLiteral = self._reluctant ? "?" : "";
            self._literal.push("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")");
            self._clear();
        }
    }

    self._getQuantityLiteral = function () {
        if (self._min != -1) {
            if (self._max != -1) {
                return "{" + self._min + "," + self._max + "}";
            }
            return "{" + self._min + ",}";
        }
        return "{0," + self._max + "}";
    }

    self._getCharacterLiteral = function () {
        if (self._of != "") {
            return self._of;
        }
        if (self._ofAny) {
            return ".";
        }
        if (self._ofGroup > 0) {
            return "\\" + self._ofGroup;
        }
        if (self._from != "") {
            return "[" + self._from + "]";
        }
        if (self._notFrom != "") {
            return "[^" + self._notFrom + "]";
        }
        if (self._like != "") {
            return self._like;
        }
    }

    self.getLiteral = function () {
        self._flushState();
        return self._literal.join("");
    }

    self.adjustGroupNumbering = function (literal) {
        if (self._groupsUsed > 0) {
            literal = literal.replace(/[^\\]\\\d/, function (groupReference) {
                var groupNumber = parseInt(groupReference.substring(2)) + self._groupsUsed;
                return groupReference.substring(0, 2) + groupNumber;
            });
        }
        return literal;
    }

    self.getRegExp = function () {
        self._flushState();

        return new RegExp(self._literal.join(""), self._ignoreCase + self._multiLine);
    }

    self.ignoreCase = function () {
        self._ignoreCase = "i";
        return self;
    }

    self.multiLine = function () {
        self._multiLine = "m";
        return self;
    }

    self.startOfInput = function () {
        self._literal.push("(?:^)");
        return self;
    }

    self.startOfLine = function () {
        self.multiLine();
        return self.startOfInput();
    }

    self.endOfInput = function () {
        self._flushState();
        self._literal.push("(?:$)");
        return self;
    }

    self.endOfLine = function () {
        self.multiLine();
        return self.endOfInput();
    }

    self.either = function (r) {
        if (r.split) {
            return self._eitherLike(new RegExpBuilder().exactly(1).of(r));
        }
        else {
            return self._eitherLike(r);
        }
    }

    self._eitherLike = function (r) {
        self._flushState();
        self._either = self.adjustGroupNumbering(r.getLiteral());
        return self;
    }

    self.or = function (r) {
        if (r.split) {
            return self._orLike(new RegExpBuilder().exactly(1).of(r));
        }
        else {
            return self._orLike(r);
        }
    }

    self._orLike = function (r) {
        var either = self._either;
        var or = self.adjustGroupNumbering(r.getLiteral());
        if (either == "") {
            var lastOr = self._literal[self._literal.length - 1];
            lastOr = lastOr.substring(0, lastOr.length - 1);
            self._literal[self._literal.length - 1] = lastOr;
            self._literal.push("|(?:" + or + "))");
        }
        else {
            self._literal.push("(?:(?:" + either + ")|(?:" + or + "))");
        }
        self._clear();
        return self;
    }

    self.exactly = function (n) {
        self._flushState();
        self._min = n;
        self._max = n;
        return self;
    }

    self.min = function (n) {
        self._flushState();
        self._min = n;
        return self;
    }

    self.max = function (n) {
        self._flushState();
        self._max = n;
        return self;
    }

    self.of = function (s) {
        self._of = self._escapeOutsideCharacterClass(s);
        return self;
    }

    self.ofAny = function () {
        self._ofAny = true;
        return self;
    }

    self.ofGroup = function (n) {
        self._ofGroup = n;
        return self;
    }

    self.from = function (s) {
        self._from = self._escapeInsideCharacterClass(s.join(""));
        return self;
    }

    self.notFrom = function (s) {
        self._notFrom = self._escapeInsideCharacterClass(s.join(""));
        return self;
    }

    self.like = function (r) {
        self._like = self.adjustGroupNumbering(r.getLiteral());
        return self;
    }

    self.reluctantly = function () {
        self._reluctant = true;
        return self;
    }

    self.ahead = function (r) {
        self._flushState();
        self._literal.push("(?=" + self.adjustGroupNumbering(r.getLiteral()) + ")");
        return self;
    }

    self.notAhead = function (r) {
        self._flushState();
        self._literal.push("(?!" + self.adjustGroupNumbering(r.getLiteral()) + ")");
        return self;
    }

    self.asGroup = function () {
        self._capture = true;
        self._groupsUsed++;
        return self;
    }

    self.then = function (s) {
        return self.exactly(1).of(s);
    }

    self.find = function (s) {
        return self.then(s);
    }

    self.some = function (s) {
        return self.min(1).from(s);
    }

    self.maybeSome = function (s) {
        return self.min(0).from(s);
    }

    self.maybe = function (s) {
        return self.max(1).of(s);
    }

    self.something = function () {
        return self.min(1).ofAny();
    }

    self.somethingBut = function (s) {
        if (s.length == 1) {
            return self.min(1).notFrom([s]);
        }
        self.notAhead(new RegExpBuilder().exactly(1).of(s));
        return self.min(1).ofAny();
    }

    self.anything = function () {
        return self.min(0).ofAny();
    }

    self.anythingBut = function (s) {
        if (s.length == 1) {
            return self.min(0).notFrom([s]);
        }
        self.notAhead(new RegExpBuilder().exactly(1).of(s));
        return self.min(0).ofAny();
    }

    self.any = function () {
        return self.exactly(1).ofAny();
    }

    self.lineBreak = function () {
        return self
            .either("\r\n")
            .or("\r")
            .or("\n");
    }

    self.lineBreaks = function () {
        return self.like(new RegExpBuilder().lineBreak());
    }

    self.whitespace = function () {
        if (self._min == -1 && self._max == -1) {
            return self.exactly(1).of("\s");
        }
        self._like = "\s";
        return self;
    }

    self.notWhitespace = function () {
        if (self._min == -1 && self._max == -1) {
            return self.exactly(1).of("\S");
        }
        self._like = "\S";
        return self;
    }

    self.tab = function () {
        return self.exactly(1).of("\t");
    }

    self.tabs = function () {
        return self.like(new RegExpBuilder().tab());
    }

    self.digit = function () {
        return self.exactly(1).of("\d");
    }

    self.notDigit = function () {
        return self.exactly(1).of("\D");
    }

    self.digits = function () {
        return self.like(new RegExpBuilder().digit());
    }

    self.notDigits = function () {
        return self.like(new RegExpBuilder().notDigit());
    }

    self.letter = function () {
        self.exactly(1);
        self._from = "A-Za-z";
        return self;
    }

    self.notLetter = function () {
        self.exactly(1);
        self._notFrom = "A-Za-z";
        return self;
    }

    self.letters = function () {
        self._from = "A-Za-z";
        return self;
    }

    self.notLetters = function () {
        self._notFrom = "A-Za-z";
        return self;
    }

    self.lowerCaseLetter = function () {
        self.exactly(1);
        self._from = "a-z";
        return self;
    }

    self.lowerCaseLetters = function () {
        self._from = "a-z";
        return self;
    }

    self.upperCaseLetter = function () {
        self.exactly(1);
        self._from = "A-Z";
        return self;
    }

    self.upperCaseLetters = function () {
        self._from = "A-Z";
        return self;
    }

    self.append = function (r) {
        self.exactly(1);
        self._like = r.getAdjustedLiteral(self._groupsUsed);
        return self;
    }

    self.optional = function (r) {
        self.max(1);
        self._like = self.adjustGroupNumbering(r.getLiteral());
        return self;
    }

    self._escapeInsideCharacterClass = function (s) {
        return self._escapeSpecialCharacters(s, self._specialCharactersInsideCharacterClass);
    }

    self._escapeOutsideCharacterClass = function (s) {
        return self._escapeSpecialCharacters(s, self._specialCharactersOutsideCharacterClass);
    }

    self._escapeSpecialCharacters = function (s, specialCharacters) {
        self._escapedString.length = 0;
        for (var i = 0; i < s.length; i++) {
            var character = s[i];
            if (specialCharacters[character]) {
                self._escapedString.push("\\" + character);
            }
            else {
                self._escapedString.push(character);
            }
        }
        return self._escapedString.join("");
    }
}

var RegExpBuilderFactory = function () {
    var self = this;

    self.ignoreCase = function () {
        return new RegExpBuilder().ignoreCase();
    }

    self.multiLine = function () {
        return new RegExpBuilder().multiLine();
    }

    self.startOfInput = function () {
        return new RegExpBuilder().startOfInput();
    }

    self.startOfLine = function () {
        return new RegExpBuilder().startOfLine();
    }

    self.endOfInput = function () {
        return new RegExpBuilder().endOfInput();
    }

    self.endOfLine = function () {
        return new RegExpBuilder().endOfLine();
    }

    self.either = function (r) {
        return new RegExpBuilder().either(r);
    }

    self.exactly = function (n) {
        return new RegExpBuilder().exactly(n);
    }

    self.min = function (n) {
        return new RegExpBuilder().min(n);
    }

    self.max = function (n) {
        return new RegExpBuilder().max(n);
    }

    self.ahead = function (r) {
        return new RegExpBuilder().ahead(r);
    }

    self.notAhead = function (r) {
        return new RegExpBuilder().notAhead(r);
    }

    self.then = function (s) {
        return new RegExpBuilder().then(s);
    }

    self.find = function (s) {
        return new RegExpBuilder().find(s);
    }

    self.some = function (s) {
        return new RegExpBuilder().some(s);
    }

    self.maybeSome = function (s) {
        return new RegExpBuilder().maybeSome(s);
    }

    self.maybe = function (s) {
        return new RegExpBuilder().maybe(s);
    }

    self.something = function () {
        return new RegExpBuilder().something();
    }

    self.somethingBut = function (s) {
        return new RegExpBuilder().somethingBut(s);
    }

    self.anything = function () {
        return new RegExpBuilder().anything();
    }

    self.anythingBut = function (s) {
        return new RegExpBuilder().anythingBut(s);
    }

    self.any = function () {
        return new RegExpBuilder().any();
    }

    self.lineBreak = function () {
        return new RegExpBuilder().lineBreak();
    }

    self.whitespace = function () {
        return new RegExpBuilder().whitespace();
    }

    self.notWhitespace = function () {
        return new RegExpBuilder().notWhitespace();
    }

    self.tab = function () {
        return new RegExpBuilder().tab();
    }

    self.digit = function () {
        return new RegExpBuilder().digit();
    }

    self.notDigit = function () {
        return new RegExpBuilder().notDigit();
    }

    self.letter = function () {
        return new RegExpBuilder().letter();
    }

    self.notLetter = function () {
        return new RegExpBuilder().notLetter();
    }

    self.lowerCaseLetter = function () {
        return new RegExpBuilder().lowerCaseLetter();
    }

    self.upperCaseLetter = function () {
        return new RegExpBuilder().upperCaseLetter();
    }

    self.append = function (r) {
        return new RegExpBuilder().append(r);
    }

    self.optional = function (r) {
        return new RegExpBuilder().optional(r);
    }
}