from RegExpBuilder import RegExpBuilder

class RegExpBuilderFactory:
  
    def ignore_case(self):
        return RegExpBuilder().ignore_case()
  
    def multi_line(self):
        return RegExpBuilder().multi_line()
  
    def start_of_input(self):
        return RegExpBuilder().start_of_input()

    def start_of_line(self):
        return RegExpBuilder().start_of_line()
  
    def end_of_input(self):
        return RegExpBuilder().end_of_input()

    def end_of_line(self):
        return RegExpBuilder().end_of_line()

    def either(self, s):
        return RegExpBuilder().either(s)
  
    def exactly(self, n):
        return RegExpBuilder().exactly(n)
  
    def min(self, n):
        return RegExpBuilder().min(n)
  
    def max(self, n):
        return RegExpBuilder().max(n)
  
    def ahead(self, r):
        return RegExpBuilder().ahead(r)
  
    def not_ahead(self, r):
        return RegExpBuilder().not_ahead(r)

    def then(self, s):
        return RegExpBuilder().then(s)

    def find(self, s):
        return RegExpBuilder().find(s)

    def some(self, s):
        return RegExpBuilder().some(s)

    def maybe_some(self, s):
        return RegExpBuilder().maybe_some(s)

    def maybe(self, s):
        return RegExpBuilder().maybe(s)

    def something(self):
        return RegExpBuilder().something()

    def something_but(self, s):
        return RegExpBuilder().something_but(s)

    def anything(self):
        return self.min(0).of_any()

    def anything_but(self, s):
        return RegExpBuilder().anything_but(s)

    def any(self):
        return RegExpBuilder().any()

    def line_break(self):
        return RegExpBuilder().line_break()

    def whitespace(self):
        return RegExpBuilder().whitespace()

    def not_whitespace(self):
        return RegExpBuilder().not_whitespace()

    def tab(self):
        return RegExpBuilder().tab()

    def digit(self):
        return RegExpBuilder().digit()

    def not_digit(self):
        return RegExpBuilder().not_digit()

    def letter(self):
        return RegExpBuilder().letter()

    def not_letter(self):
        return RegExpBuilder().not_letter()

    def lower_case_letter(self):
        return RegExpBuilder().lower_case_letter()

    def upper_case_letter(self):
        return RegExpBuilder().upper_case_letter()

    def append(self, r):
        return RegExpBuilder().append(r)

    def optional(self, r):
        return RegExpBuilder().optional(r)
