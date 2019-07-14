// Check empty or udefined
function ensure(input) {
  try {
    return (input === void(0) || !input || v.length === 0 || Object.keys(input).length === 0 && input.constructor === Object) ? false : input;
  } catch (e) {
    return false
  }
}
var v={'k':null}; r = ensure(v);
console.log('r: ',r);
