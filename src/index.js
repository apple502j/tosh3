const nearley = require("nearley");
const grammar = require("./grammar.js");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed(`
@event_whenbroadcastreceived("hi")
if (
  sensing_mousedown ()
) {
  looks_say ( "DOWN" )
  // This should run 10 times
    repeat (10) {
      looks_say(
        sensing_mousedown ()
      )
    }
}
else {
  forever {
    looks_say ( "UP" )
  }
}
`.trim());

console.dir(parser.results[0].flat(), {depth: 10});