var RegExpBuilder = function () {
    this._literal = [];
    this._groupsUsed = 0;

    this._clear();
}

RegExpBuilder.prototype._clear = function () {
    this._ignoreCase = "";
    this._multiLine = "";
    this._min = -1;
    this._max = -1;
    this._of = "";
    this._ofAny = false;
    this._ofGroup = -1;
    this._from = "";
    this._notFrom = "";
    this._like = "";
    this._either = "";
    this._reluctant = false;
    this._capture = false;
}

RegExpBuilder.prototype._flushState = function () {
    if (this._of != "" || this._ofAny || this._ofGroup > 0 || this._from != "" || this._notFrom != "" || this._like != "") {
        var captureLiteral = this._capture ? "" : "?:";
        var quantityLiteral = this._getQuantityLiteral();
        var characterLiteral = this._getCharacterLiteral();
        var reluctantLiteral = this._reluctant ? "?" : "";
        this._literal.push("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")");
        this._clear();
    }
}

RegExpBuilder.prototype._getQuantityLiteral = function () {
    if (this._min != -1) {
        if (this._max != -1) {
            return "{" + this._min + "," + this._max + "}";
        }
        return "{" + this._min + ",}";
    }
    return "{0," + this._max + "}";
}

RegExpBuilder.prototype._getCharacterLiteral = function () {
    if (this._of != "") {
        return this._of;
    }
    if (this._ofAny) {
        return ".";
    }
    if (this._ofGroup > 0) {
        return "\\" + this._ofGroup;
    }
    if (this._from != "") {
        return "[" + this._from + "]";
    }
    if (this._notFrom != "") {
        return "[^" + this._notFrom + "]";
    }
    if (this._like != "") {
        return this._like;
    }
}

RegExpBuilder.prototype.getLiteral = function () {
    this._flushState();
    return this._literal.join("");
}

RegExpBuilder.prototype._combineGroupNumberingAndGetLiteral = function (r) {
    var literal = this._incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
    this._groupsUsed += r._groupsUsed;
    return literal;
}

RegExpBuilder.prototype._incrementGroupNumbering = function (literal, increment) {
    if (increment > 0) {
        literal = literal.replace(/[^\\]\\\d+/, function (groupReference) {
            var groupNumber = parseInt(groupReference.substring(2)) + increment;
            return groupReference.substring(0, 2) + groupNumber;
        });
    }
    return literal;
}

RegExpBuilder.prototype.getRegExp = function () {
    this._flushState();

    return new RegExp(this._literal.join(""), this._ignoreCase + this._multiLine);
}

RegExpBuilder.prototype.ignoreCase = function () {
    this._ignoreCase = "i";
    return this;
}

RegExpBuilder.prototype.multiLine = function () {
    this._multiLine = "m";
    return this;
}

RegExpBuilder.prototype.startOfInput = function () {
    this._literal.push("(?:^)");
    return this;
}

RegExpBuilder.prototype.startOfLine = function () {
    this.multiLine();
    return this.startOfInput();
}

RegExpBuilder.prototype.endOfInput = function () {
    this._flushState();
    this._literal.push("(?:$)");
    return this;
}

RegExpBuilder.prototype.endOfLine = function () {
    this.multiLine();
    return this.endOfInput();
}

RegExpBuilder.prototype.either = function (r) {
    if (r.split) {
        return this._eitherLike(new RegExpBuilder().exactly(1).of(r));
    }
    else {
        return this._eitherLike(r);
    }
}

RegExpBuilder.prototype._eitherLike = function (r) {
    this._flushState();
    this._either = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

RegExpBuilder.prototype.or = function (r) {
    if (r.split) {
        return this._orLike(new RegExpBuilder().exactly(1).of(r));
    }
    else {
        return this._orLike(r);
    }
}

RegExpBuilder.prototype._orLike = function (r) {
    var either = this._either;
    var or = this._combineGroupNumberingAndGetLiteral(r);
    if (either == "") {
        var lastOr = this._literal[this._literal.length - 1];
        lastOr = lastOr.substring(0, lastOr.length - 1);
        this._literal[this._literal.length - 1] = lastOr;
        this._literal.push("|(?:" + or + "))");
    }
    else {
        this._literal.push("(?:(?:" + either + ")|(?:" + or + "))");
    }
    this._clear();
    return this;
}

RegExpBuilder.prototype.exactly = function (n) {
    this._flushState();
    this._min = n;
    this._max = n;
    return this;
}

RegExpBuilder.prototype.min = function (n) {
    this._flushState();
    this._min = n;
    return this;
}

RegExpBuilder.prototype.max = function (n) {
    this._flushState();
    this._max = n;
    return this;
}

RegExpBuilder.prototype.of = function (s) {
    this._of = this._sanitize(s);
    return this;
}

RegExpBuilder.prototype.ofAny = function () {
    this._ofAny = true;
    return this;
}

RegExpBuilder.prototype.ofGroup = function (n) {
    this._ofGroup = n;
    return this;
}

RegExpBuilder.prototype.from = function (s) {
    this._from = this._sanitize(s.join(""));
    return this;
}

RegExpBuilder.prototype.notFrom = function (s) {
    this._notFrom = this._sanitize(s.join(""));
    return this;
}

RegExpBuilder.prototype.like = function (r) {
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

RegExpBuilder.prototype.reluctantly = function () {
    this._reluctant = true;
    return this;
}

RegExpBuilder.prototype.ahead = function (r) {
    this._flushState();
    this._literal.push("(?=" + this._combineGroupNumberingAndGetLiteral(r) + ")");
    return this;
}

RegExpBuilder.prototype.notAhead = function (r) {
    this._flushState();
    this._literal.push("(?!" + this._combineGroupNumberingAndGetLiteral(r) + ")");
    return this;
}

RegExpBuilder.prototype.asGroup = function () {
    this._capture = true;
    this._groupsUsed++;
    return this;
}

RegExpBuilder.prototype.then = function (s) {
    return this.exactly(1).of(s);
}

RegExpBuilder.prototype.find = function (s) {
    return this.then(s);
}

RegExpBuilder.prototype.some = function (s) {
    return this.min(1).from(s);
}

RegExpBuilder.prototype.maybeSome = function (s) {
    return this.min(0).from(s);
}

RegExpBuilder.prototype.maybe = function (s) {
    return this.max(1).of(s);
}

RegExpBuilder.prototype.something = function () {
    return this.min(1).ofAny();
}

RegExpBuilder.prototype.somethingBut = function (s) {
    if (s.length == 1) {
        return this.exactly(1).notFrom([s]);
    }
    this.notAhead(new RegExpBuilder().exactly(1).of(s));
    return this.min(1).ofAny();
}

RegExpBuilder.prototype.anything = function () {
    return this.min(0).ofAny();
}

RegExpBuilder.prototype.anythingBut = function (s) {
    if (s.length == 1) {
        return this.max(1).notFrom([s]);
    }
    this.notAhead(new RegExpBuilder().exactly(1).of(s));
    return this.min(0).ofAny();
}

RegExpBuilder.prototype.any = function () {
    return this.exactly(1).ofAny();
}

RegExpBuilder.prototype.lineBreak = function () {
    this._flushState();
    this._literal.push("(?:\\r\\n|\\r|\\n)");
    return this;
}

RegExpBuilder.prototype.lineBreaks = function () {
    return this.like(new RegExpBuilder().lineBreak());
}

RegExpBuilder.prototype.whitespace = function () {
    if (this._min == -1 && this._max == -1) {
        this._flushState();
        this._literal.push("(?:\\s)");
        return this;
    }
    this._like = "\s";
    return this;
}

RegExpBuilder.prototype.notWhitespace = function () {
    if (this._min == -1 && this._max == -1) {
        this._flushState();
        this._literal.push("(?:\\S)");
        return this;
    }
    this._like = "\S";
    return this;
}

RegExpBuilder.prototype.tab = function () {
    this._flushState();
    this._literal.push("(?:\\t)");
    return this;
}

RegExpBuilder.prototype.tabs = function () {
    return this.like(new RegExpBuilder().tab());
}

RegExpBuilder.prototype.digit = function () {
    this._flushState();
    this._literal.push("(?:\\d)");
    return this;
}

RegExpBuilder.prototype.notDigit = function () {
    this._flushState();
    this._literal.push("(?:\\D)");
    return this;
}

RegExpBuilder.prototype.digits = function () {
    return this.like(new RegExpBuilder().digit());
}

RegExpBuilder.prototype.notDigits = function () {
    return this.like(new RegExpBuilder().notDigit());
}

RegExpBuilder.prototype.letter = function () {
    this.exactly(1);
    this._from = "A-Za-z";
    return this;
}

RegExpBuilder.prototype.notLetter = function () {
    this.exactly(1);
    this._notFrom = "A-Za-z";
    return this;
}

RegExpBuilder.prototype.letters = function () {
    this._from = "A-Za-z";
    return this;
}

RegExpBuilder.prototype.notLetters = function () {
    this._notFrom = "A-Za-z";
    return this;
}

RegExpBuilder.prototype.lowerCaseLetter = function () {
    this.exactly(1);
    this._from = "a-z";
    return this;
}

RegExpBuilder.prototype.lowerCaseLetters = function () {
    this._from = "a-z";
    return this;
}

RegExpBuilder.prototype.upperCaseLetter = function () {
    this.exactly(1);
    this._from = "A-Z";
    return this;
}

RegExpBuilder.prototype.upperCaseLetters = function () {
    this._from = "A-Z";
    return this;
}

RegExpBuilder.prototype.append = function (r) {
    this.exactly(1);
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

RegExpBuilder.prototype.optional = function (r) {
    this.max(1);
    this._like = this._combineGroupNumberingAndGetLiteral(r);
    return this;
}

RegExpBuilder.prototype._sanitize = function (s) {
    return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
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