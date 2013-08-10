RegExpBuilder v1.0
=============
RegExpBuilder integrates regular expressions into the programming language, thereby making them easy to read and maintain. Regular Expressions are created by using chained methods and variables such as arrays or strings.

<h2>How to start</h2>
There are implementations available for Dart, Javascript, Java, and Python.

<h2>Examples</h2>
Here are a couple of examples using Javascript:

<h3>Money</h3>

```
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var regex = new RegExpBuilder()
  .then("$")
  .some(digits)
  .then(".")
  .exactly(2).from(digits)
  .getRegExp();
  
regex.test("$10.00")); // true
```

<h3>Nested patterns</h3>

```
var pattern = new RegExpBuilder()
  .min(1)
  .of("p")
  .min(2)
  .of("q");

var regex = new RegExpBuilder()
  .exactly(2)
  .like(pattern)
  .getRegExp();

regex.test("pqqpqq"); // true
```

<h3>API documentation</h3>
RegExpBuilder can represent literally every possible regular expression using methods such as either(), or(), behind(), asGroup() and so on. You can find the API documentation for each language <a href="https://github.com/thebinarysearchtree/RegExpBuilder/wiki">here</a>.
