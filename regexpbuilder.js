class RegExpBuilder {
    constructor() {
        this._flags = "";
        this._literal = [];
        this._groupsUsed = 0;

        this._clear();
    }

    _clear() {
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

    _flushState() {
        if (this._of != "" || this._ofAny || this._ofGroup > 0 || this._from != "" || this._notFrom != "" || this._like != "") {
            var captureLiteral = this._capture ? "" : "?:";
            var quantityLiteral = this._getQuantityLiteral();
            var characterLiteral = this._getCharacterLiteral();
            var reluctantLiteral = this._reluctant ? "?" : "";
            this._literal.push("(" + captureLiteral + "(?:" + characterLiteral + ")" + quantityLiteral + reluctantLiteral + ")");
            this._clear();
        }
    }

    _getQuantityLiteral() {
        if (this._min != -1) {
            if (this._max != -1) {
                return "{" + this._min + "," + this._max + "}";
            }
            return "{" + this._min + ",}";
        }
        return "{0," + this._max + "}";
    }

    _getCharacterLiteral() {
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

    getLiteral() {
        this._flushState();
        return this._literal.join("");
    }
    
    _combineGroupNumberingAndGetLiteral(r) {
        var literal = this._incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
        this._groupsUsed += r._groupsUsed;
        return literal;
    }

    _incrementGroupNumbering(literal, increment) {
        if (increment > 0) {
            literal = literal.replace(/[^\\]\\\d+/g, function (groupReference) {
                var groupNumber = parseInt(groupReference.substring(2)) + increment;
                return groupReference.substring(0, 2) + groupNumber;
            });
        }
        return literal;
    }

    getRegExp() {
        this._flushState();
    
        return new RegExp(this._literal.join(""), this._flags);
    }

    _addFlag(flag) {
        if (this._flags.indexOf(flag) == -1) {
            this._flags += flag;
        }
        return this;
    }

    ignoreCase() {
        return this._addFlag("i");
    }
    
    multiLine() {
        return this._addFlag("m");
    }
    
    globalMatch() {
        return this._addFlag("g");
    }
    
    startOfInput() {
        this._literal.push("(?:^)");
        return this;
    }
    
    startOfLine() {
        this.multiLine();
        return this.startOfInput();
    }
    
    endOfInput() {
        this._flushState();
        this._literal.push("(?:$)");
        return this;
    }
    
    endOfLine() {
        this.multiLine();
        return this.endOfInput();
    }

    either(r) {
        if (typeof r == "string") {
            return this._eitherLike(new RegExpBuilder().exactly(1).of(r));
        }
        else {
            return this._eitherLike(r);
        }
    }
    
    _eitherLike(r) {
        this._flushState();
        this._either = this._combineGroupNumberingAndGetLiteral(r);
        return this;
    }
    
    or(r) {
        if (typeof r == "string") {
            return this._orLike(new RegExpBuilder().exactly(1).of(r));
        }
        else {
            return this._orLike(r);
        }
    }
    
    _orLike(r) {
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
    
    neither(r) {
        if (typeof r == "string") {
            return this.notAhead(new RegExpBuilder().exactly(1).of(r));
        }
        return this.notAhead(r);
    }
    
    nor(r) {
        if (this._min == 0 && this._ofAny) {
            this._min = -1;
            this._ofAny = false;
        }
        this.neither(r);
        return this.min(0).ofAny();
    }
    
    exactly(n) {
        this._flushState();
        this._min = n;
        this._max = n;
        return this;
    }
    
    min(n) {
        this._flushState();
        this._min = n;
        return this;
    }
    
    max(n) {
        this._flushState();
        this._max = n;
        return this;
    }
    
    of(s) {
        this._of = this._sanitize(s);
        return this;
    }
    
    ofAny() {
        this._ofAny = true;
        return this;
    }
    
    ofGroup(n) {
        this._ofGroup = n;
        return this;
    }
    
    from(s) {
        this._from = this._sanitize(s.join(""));
        return this;
    }
    
    notFrom(s) {
        this._notFrom = this._sanitize(s.join(""));
        return this;
    }
    
    like(r) {
        this._like = this._combineGroupNumberingAndGetLiteral(r);
        return this;
    }
    
    reluctantly() {
        this._reluctant = true;
        return this;
    }
    
    ahead(r) {
        this._flushState();
        this._literal.push("(?=" + this._combineGroupNumberingAndGetLiteral(r) + ")");
        return this;
    }
    
    notAhead(r) {
        this._flushState();
        this._literal.push("(?!" + this._combineGroupNumberingAndGetLiteral(r) + ")");
        return this;
    }
    
    asGroup() {
        this._capture = true;
        this._groupsUsed++;
        return this;
    }
    
    then(s) {
        return this.exactly(1).of(s);
    }
    
    find(s) {
        return this.then(s);
    }
    
    some(s) {
        return this.min(1).from(s);
    }
    
    maybeSome(s) {
        return this.min(0).from(s);
    }
    
    maybe(s) {
        return this.max(1).of(s);
    }
    
    something() {
        return this.min(1).ofAny();
    }
    
    anything() {
        return this.min(0).ofAny();
    }
    
    anythingBut(s) {
        if (s.length == 1) {
            return this.min(0).notFrom([s]);
        }
        this.notAhead(new RegExpBuilder().exactly(1).of(s));
        return this.min(0).ofAny();
    }
    
    any() {
        return this.exactly(1).ofAny();
    }
    
    lineBreak() {
        this._flushState();
        this._literal.push("(?:\\r\\n|\\r|\\n)");
        return this;
    }
    
    lineBreaks() {
        return this.like(new RegExpBuilder().lineBreak());
    }
    
    whitespace() {
        if (this._min == -1 && this._max == -1) {
            this._flushState();
            this._literal.push("(?:\\s)");
            return this;
        }
        this._like = "\\s";
        return this;
    }
    
    notWhitespace() {
        if (this._min == -1 && this._max == -1) {
            this._flushState();
            this._literal.push("(?:\\S)");
            return this;
        }
        this._like = "\\S";
        return this;
    }
    
    tab() {
        this._flushState();
        this._literal.push("(?:\\t)");
        return this;
    }
    
    tabs() {
        return this.like(new RegExpBuilder().tab());
    }
    
    digit() {
        this._flushState();
        this._literal.push("(?:\\d)");
        return this;
    }
    
    notDigit() {
        this._flushState();
        this._literal.push("(?:\\D)");
        return this;
    }
    
    digits() {
        return this.like(new RegExpBuilder().digit());
    }
    
    notDigits() {
        return this.like(new RegExpBuilder().notDigit());
    }
    
    letter() {
        this.exactly(1);
        this._from = "A-Za-z";
        return this;
    }
    
    notLetter() {
        this.exactly(1);
        this._notFrom = "A-Za-z";
        return this;
    }
    
    letters() {
        this._from = "A-Za-z";
        return this;
    }
    
    notLetters() {
        this._notFrom = "A-Za-z";
        return this;
    }
    
    lowerCaseLetter() {
        this.exactly(1);
        this._from = "a-z";
        return this;
    }
    
    lowerCaseLetters() {
        this._from = "a-z";
        return this;
    }
    
    upperCaseLetter() {
        this.exactly(1);
        this._from = "A-Z";
        return this;
    }
    
    upperCaseLetters() {
        this._from = "A-Z";
        return this;
    }
    
    append(r) {
        this.exactly(1);
        this._like = this._combineGroupNumberingAndGetLiteral(r);
        return this;
    }
    
    optional(r) {
        this.max(1);
        this._like = this._combineGroupNumberingAndGetLiteral(r);
        return this;
    }
    
    _sanitize(s) {
        return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
}

module.exports = RegExpBuilder;