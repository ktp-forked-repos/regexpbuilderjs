#import('../../../Andrew/Documents/dart/dart-sdk/lib/unittest/unittest.dart');
#source('RegExpBuilder.dart');

main() {
  test("start", () {
    var regex = new RegExpBuilder()
      .start()
      .exactly(1).of("p")
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(!regex.hasMatch("qp"));
  });
  
  test("end", () {
    var regex = new RegExpBuilder()
      .exactly(1).of("p")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(!regex.hasMatch("pq"));
  });
  
  test("eitherLike orLike", () {
    var regex = new RegExpBuilder()
      .start()
      .eitherLike((r) => r.exactly(1).of("p"))
      .orLike((r) => r.exactly(2).of("q"))
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(regex.hasMatch("qq"));
    expect(!regex.hasMatch("pqq"));
    expect(!regex.hasMatch("qqp"));
  });
  
  test("orLike chain", () {
    var regex = new RegExpBuilder()
      .eitherLike((r) => r.exactly(1).of("p"))
      .orLike((r) => r.exactly(1).of("q"))
      .orLike((r) => r.exactly(1).of("r"))
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(regex.hasMatch("q"));
    expect(regex.hasMatch("r"));
    expect(!regex.hasMatch("s"));
  });
  
  test("or", () {
    var regex = new RegExpBuilder()
      .either("p")
      .or("q")
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(regex.hasMatch("q"));
    expect(!regex.hasMatch("r"));
  });
  
  test("exactly", () {
    var regex = new RegExpBuilder()
      .start()
      .exactly(3).of("p")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("ppp"));
    expect(!regex.hasMatch("pp"));
    expect(!regex.hasMatch("pppp"));
  });
  
  test("min", () {
    var regex = new RegExpBuilder()
      .start()
      .min(2).of("p")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("pp"));
    expect(regex.hasMatch("ppp"));
    expect(regex.hasMatch("ppppppp"));
    expect(!regex.hasMatch("p"));
  });
  
  test("max", () {
    var regex = new RegExpBuilder()
      .start()
      .max(3).of("p")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("p"));
    expect(regex.hasMatch("pp"));
    expect(regex.hasMatch("ppp"));
    expect(!regex.hasMatch("pppp"));
    expect(!regex.hasMatch("pppppppp"));
  });
  
  test("min max", () {
    var regex = new RegExpBuilder()
      .start()
      .min(3).max(7).of("p")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("ppp"));
    expect(regex.hasMatch("ppppp"));
    expect(regex.hasMatch("ppppppp"));
    expect(!regex.hasMatch("pp"));
    expect(!regex.hasMatch("p"));
    expect(!regex.hasMatch("pppppppp"));
    expect(!regex.hasMatch("pppppppppppp"));
  });
  
  test("of", () {
    var regex = new RegExpBuilder()
      .start()
      .exactly(2).of("p p p ")
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("p p p p p p "));
    expect(!regex.hasMatch("p p p p pp"));
  });
  
  test("ofAny", () {
    var regex = new RegExpBuilder()
      .start()
      .exactly(3).ofAny()
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("pqr"));
  });
  
  test("ofGroup", () {
    var regex = new RegExpBuilder()
      .start()
      .exactly(3).of("p").asGroup()
      .exactly(1).of("q")
      .exactly(1).ofGroup(1)
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("pppqppp"));
  });
  
  test("from", () {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
      .start()
      .exactly(3).from(someLetters)
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("ppp"));
    expect(regex.hasMatch("qqq"));
    expect(regex.hasMatch("ppq"));
    expect(regex.hasMatch("rqp"));
    expect(!regex.hasMatch("pyy"));
  });
  
  test("notFrom", () {
    var someLetters = ["p", "q", "r"];
    var regex = new RegExpBuilder()
      .start()
      .exactly(3).notFrom(someLetters)
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("lmn"));
    expect(!regex.hasMatch("mnq"));
  });
  
  test("like", () {
    var pattern = (r) => r
      .min(1).of("p")
      .min(2).of("q");
    
    var regex = new RegExpBuilder()
      .start()
      .exactly(2).like(pattern)
      .end()
      .getRegExp();
    
    expect(regex.hasMatch("pqqpqq"));
    expect(!regex.hasMatch("qppqpp"));
  });
  
  test("reluctantly", () {
    var regex = new RegExpBuilder()
      .exactly(2).of("p")
      .min(2).ofAny().reluctantly()
      .exactly(2).of("p")
      .getRegExp();
    
    expect(regex.stringMatch("pprrrrpprrpp") == "pprrrrpp");
  });
  
  test("behindPattern", () {
    var regex = new RegExpBuilder()
      .exactly(1).of("dart")
      .behindPattern((r) => r.exactly(1).of("lang"))
      .getRegExp();
    
    expect(regex.stringMatch("dartlang") == "dart");
    expect(!regex.hasMatch("dartpqr"));
  });
  
  test("notBehindPattern", () {
    var regex = new RegExpBuilder()
      .exactly(1).of("dart")
      .notBehindPattern((r) => r.exactly(1).of("pqr"))
      .getRegExp();
    
    expect(regex.hasMatch("dartlang"));
    expect(!regex.hasMatch("dartpqr"));
  });
  
  test("asGroup", () {
    var regex = new RegExpBuilder()
      .min(1).max(3).of("p")
      .exactly(1).of("dart").asGroup()
      .exactly(1).from(["p", "q", "r"])
      .getRegExp();
    
    expect(regex.firstMatch("pdartq").group(1) == "dart");
  });
}
