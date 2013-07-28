RegExpBuilder v1.0
=============
RegExpBuilder integrates regular expressions into the programming language, thereby making them easy to read and maintainable. Regular Expressions are created by using chained methods and variables such as arrays or strings.

<h2>How to start</h2>
There are implementations available for Dart, Javascript, Java, and Python.

<h2>Examples</h2>
Here are a couple of examples using Javascript:

<h3>Money</h3>

'''
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var regex = new RegExpBuilder()
  .exactly(1).of("$")
  .min(1).from(digits)
  .exactly(1).of(".")
  .exactly(2).from(digits)
  .getRegExp();
'''
