#import('RegExpBuilder.dart');

class RegExpBuilderFactory {
  
  RegExpBuilder ignoreCase() {
    return new RegExpBuilder().ignoreCase();
  }
  
  RegExpBuilder multiLine() {
    return new RegExpBuilder().multiLine();
  }
  
  RegExpBuilder startOfInput() {
    return new RegExpBuilder().startOfInput();
  }
  
  RegExpBuilder startOfLine() {
    return new RegExpBuilder().startOfLine();
  }
  
  RegExpBuilder endOfInput() {
    return new RegExpBuilder().endOfInput();
  }
  
  RegExpBuilder endOfLine() {
    return new RegExpBuilder().endOfLine();
  }
  
  RegExpBuilder either(Dynamic r) {
    return new RegExpBuilder().either(r);
  }
  
  RegExpBuilder exactly(int n) {
    return new RegExpBuilder().exactly(n);
  }
  
  RegExpBuilder min(int n) {
    return new RegExpBuilder().min(n);
  }
  
  RegExpBuilder max(int n) {
    return new RegExpBuilder().max(n);
  }
  
  RegExpBuilder ahead(RegExpBuilder r) {
    return new RegExpBuilder().ahead(r);
  }
  
  RegExpBuilder notAhead(RegExpBuilder r) {
    return new RegExpBuilder().notAhead(r);
  }
  
  RegExpBuilder then(String s) {
    return new RegExpBuilder().then(s);
  }
  
  RegExpBuilder find(String s) {
    return new RegExpBuilder().find(s);
  }
  
  RegExpBuilder some(List<String> s) {
    return new RegExpBuilder().some(s);
  }
  
  RegExpBuilder maybeSome(List<String> s) {
    return new RegExpBuilder().maybeSome(s);
  }
  
  RegExpBuilder maybe(String s) {
    return new RegExpBuilder().maybe(s);
  }
  
  RegExpBuilder something() {
    return new RegExpBuilder().something();
  }
  
  RegExpBuilder somethingBut(String s) {
    return new RegExpBuilder().somethingBut(s);
  }
  
  RegExpBuilder anything() {
    return new RegExpBuilder().anything();
  }
  
  RegExpBuilder anythingBut(String s) {
    return new RegExpBuilder().anythingBut(s);
  }
  
  RegExpBuilder any() {
    return new RegExpBuilder().any();
  }
  
  RegExpBuilder lineBreak() {
    return new RegExpBuilder().lineBreak();
  }
  
  RegExpBuilder whitespace() {
    return new RegExpBuilder().whitespace();
  }
  
  RegExpBuilder notWhitespace() {
    return new RegExpBuilder().notWhitespace();
  }
  
  RegExpBuilder tab() {
    return new RegExpBuilder().tab();
  }
  
  RegExpBuilder digit() {
    return new RegExpBuilder().digit();
  }
  
  RegExpBuilder notDigit() {
    return new RegExpBuilder().notDigit();
  }
  
  RegExpBuilder letter() {
    return new RegExpBuilder().letter();
  }
  
  RegExpBuilder notLetter() {
    return new RegExpBuilder().notLetter();
  }
  
  RegExpBuilder lowerCaseLetter() {
    return new RegExpBuilder().lowerCaseLetter();
  }
  
  RegExpBuilder upperCaseLetter() {
    return new RegExpBuilder().upperCaseLetter();
  }
  
  RegExpBuilder append(RegExpBuilder r) {
    return new RegExpBuilder().append(r);
  }
  
  RegExpBuilder optional(RegExpBuilder r) {
    return new RegExpBuilder().optional(r);
  }
}
