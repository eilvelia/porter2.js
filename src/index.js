Object.defineProperty(exports, '__esModule', { value: true })

// EQ_BEGIN : (chars : string) -> <code (boolean)>
// EQ_END : (offset : number, chars : string) -> <code (boolean)>
// BYTE_SET : (chars : string) -> <code (Uint8Array of length 128)>
// All one-character strings in this file are converted to numeric char codes.

// eilvelia: This is mostly a rewrite of my ocaml implementation (though not published
// at the moment of writing this). The implementation was partially based on
// https://github.com/vk-com/kphp-kdb/blob/ce6dead5b3345f4b38487cc9e45d55ced3dd7139/common/stemmer-new.c

var IS_V = BYTE_SET('aeiouy')
var IS_WXY = BYTE_SET('aeiouywxY')
var IS_VALID_LI = BYTE_SET('cdeghkmnrt')
var IS_DOUBLE = BYTE_SET('bdfgmnprt')

// Reusable buffer for small words
var WBUF = new Uint16Array(128)

function is_shortv(w, len) {
  // backwardmode: ( non-v_WXY v non-v ) or ( non-v v atlimit )
  return len >= 2 && IS_V[Math.min(w[len - 2], 127)] && (
    (len === 2 && !IS_V[Math.min(w[len - 1], 127)])
    || (len >= 3 && !IS_V[Math.min(w[len - 3], 127)]
        && !IS_WXY[Math.min(w[len - 1], 127)])
  )
}

exports.stem = function stem(word) {
  if (word.length < 3)
    return word
  // exception1
  if (word.length <= 6) {
    switch (word) {
      case 'skis': return 'ski'
      case 'skies': return 'sky'
      case 'dying': return 'die'
      case 'lying': return 'lie'
      case 'tying': return 'tie'
      // special -LY cases
      case 'idly': return 'idl'
      case 'gently': return 'gentl'
      case 'ugly': return 'ugli'
      case 'early': return 'earli'
      case 'only': return 'onli'
      case 'singly': return 'singl'
      // invariant forms
      case 'sky': case 'news': case 'howe':
      // not plural forms
      case 'atlas': case 'cosmos': case 'bias': case 'andes':
        return word
    }
  }
  var initial_offset = word.charCodeAt(0) === 39 /* ' */ ? 1 : 0
  var l = word.length - initial_offset
  var w = l < WBUF.length ? WBUF : new Uint16Array(l + 1)
  var mutated = false
  for (var i = 0; i < l; ++i) {
    // var ch = word[i + initial_offset]
    var ch = word.charCodeAt(i + initial_offset)
    if (ch === 'y' && (i === 0 || IS_V[Math.min(w[i - 1], 127)])) {
      // Y is a special mark so it isn't treated as a vowel
      w[i] = 'Y'
      continue
    }
    w[i] = ch
  }
  if (w[l - 1] === "'")
    --l
  if (l >= 2 && w[l - 2] === "'" && w[l - 1] === 's')
    l -= 2
  // mark_regions
  var rv = 0;
  // rv is the position after the first vowel
  while (rv < l && !IS_V[Math.min(w[rv], 127)]) ++rv
  if (rv < l) ++rv
  var r1 = rv
  if (l >= 5 && ((EQ_BEGIN('gener')) || (EQ_BEGIN('arsen'))))
    r1 = 5
  else if (l >= 6 && EQ_BEGIN('commun'))
    r1 = 6
  else {
    // > R1 is the region after the first non-vowel following a vowel,
    // > or the end of the word if there is no such non-vowel.
    while (r1 < l && IS_V[Math.min(w[r1], 127)]) ++r1
    if (r1 < l) ++r1
  }
  // > R2 is the region after the first non-vowel following a vowel in R1,
  // > or the end of the word if there is no such non-vowel.
  var r2 = r1
  while (r2 < l && !IS_V[Math.min(w[r2], 127)]) ++r2
  while (r2 < l && IS_V[Math.min(w[r2], 127)]) ++r2
  if (r2 < l) ++r2
  // Step_1a
  if (l >= 3) {
    if (w[l - 1] === 's') {
      if (l >= 4 && EQ_END(1, 'sse'))
        l -= 2 // sses -> ss
      else if (EQ_END(1, 'ie'))
        l -= (l >= 5 ? 2 : 1) // ies
      else if (w[l - 2] !== 'u' && w[l - 2] !== 's' && rv < l - 1)
        // us ss -> <nothing>; s -> "delete if the preceding word part
        // contains a vowel not immediately before the s"
        l -= 1
    } else if (EQ_END(0, 'ied'))
      l -= (l >= 5 ? 2 : 1) // ied
  }
  // exception2
  if (
    (l === 6 && (
      (EQ_BEGIN('inning')) || (EQ_BEGIN('outing')) || (EQ_BEGIN('exceed')))
    ) || (l === 7 && (
      (EQ_BEGIN('canning')) || (EQ_BEGIN('herring')) || (EQ_BEGIN('earring'))
      || (EQ_BEGIN('proceed')) || (EQ_BEGIN('succeed'))))
  ) {
    var exp2_out = ''
    for (var i = 0; i < l; ++i)
      // exp2_out += w[i]
      exp2_out += String.fromCharCode(w[i])
    return exp2_out
  }
  // Step_1b
  var ll =
    // l (length) without the -ly ending
    (l >= 2 && EQ_END(0, 'ly')) ? l - 2 : l
  if (ll >= 3) {
    if (w[ll - 3] === 'e' && w[ll - 2] === 'e' && w[ll - 1] === 'd') {
      if (ll >= r1 + 3)
        l = ll - 1 // eed eedly -> ee (if in R1)
    } else {
      // ll without: ed edly ing ingly (-1 if not found)
      if (w[ll - 2] === 'e' && w[ll - 1] === 'd')
        ll -= 2
      else if (w[ll - 3] === 'i' && w[ll - 2] === 'n' && w[ll - 1] === 'g')
        ll -= 3
      else ll = -1
      if (ll >= 0 && rv <= ll) {
        l = ll
        if (l >= 2) {
          if ((EQ_END(0, 'at')) || (EQ_END(0, 'bl')) || (EQ_END(0, 'iz'))) {
            // at -> ate   bl -> ble   iz -> ize
            w[l] = (mutated = true, 'e')
            ++l
          } else if (w[l - 2] === w[l - 1] && IS_DOUBLE[Math.min(w[l - 1], 127)]) {
            --l
          } else if (r1 >= l && is_shortv(w, l)) {
            // <shortv> -> e
            w[l] = (mutated = true, 'e')
            ++l
          }
        }
      }
    }
  }
  // Step_1c
  if (l >= 3 && (w[l - 1] === 'Y' || w[l - 1] === 'y')
      && !IS_V[Math.min(w[l - 2], 127)])
    w[l - 1] = (mutated = true, 'i')
  // Step_2
  if (l >= r1 + 2) {
    switch (w[l - 1]) {
      case 'l':
        if (l >= r1 + 6 && EQ_END(1, 'tiona')) {
          if (l >= 7 && w[l - 7] === 'a') {
            if (l >= r1 + 7) {
              // ational -> ate
              l -= 4
              w[l - 1] = (mutated = true, 'e')
            }
          } else {
            l -= 2 // tional -> tion
          }
        }
        break
      case 'n':
        if (l >= r1 + 5 && EQ_END(1, 'atio')) {
          if (l >= 7 && EQ_END(5, 'iz')) {
            if (l >= r1 + 7) {
              // ization -> ize
              l -= 4
              w[l - 1] = (mutated = true, 'e')
            }
          } else {
            // ation -> ate
            l -= 2
            w[l - 1] = (mutated = true, 'e')
          }
        }
        break
      case 'r':
        if (l >= r1 + 4) {
          if (w[l - 2] === 'e') {
            if (EQ_END(2, 'iz'))
              --l // izer -> ize
          } else if (w[l - 2] === 'o') {
            if (EQ_END(2, 'at')) {
              --l
              w[l - 1] = (mutated = true, 'e')
            }
          }
        }
        break
      case 's':
        if (l >= r1 + 7 && EQ_END(1, 'nes') && (
          (EQ_END(4, 'ful')) || (EQ_END(4, 'ous')) || (EQ_END(4, 'ive'))
        )) {
          l -= 4 // fulness -> ful   ousness -> ous   iveness -> ive
        }
        break
      case 'm':
        if (l >= r1 + 5 && EQ_END(1, 'alis'))
          l -= 3 // alism -> al
        break
      case 'i':
        if (w[l - 2] === 'c') {
          if (l >= r1 + 4 && (w[l - 4] === 'e' || w[l - 4] === 'a')
            && w[l - 3] === 'n') {
            w[l - 1] = (mutated = true, 'e') // enci -> ence   anci -> ance
          }
        } else if (w[l - 2] === 'g') {
          if (l >= r1 + 3 && l >= 4 && EQ_END(1, 'log'))
            --l // ogi -> og (if preceded by l)
        } else if (w[l - 2] === 't') {
          if (l >= r1 + 5 && w[l - 3] === 'i') {
            if (w[l - 4] === 'l') {
              if (l >= 6 && EQ_END(4, 'bi')) {
                if (l >= r1 + 6) {
                  // biliti -> ble
                  l -= 3
                  w[l - 2] = (mutated = true, 'l')
                  w[l - 1] = (mutated = true, 'e')
                }
              } else if (EQ_END(3, 'al')) {
                l -= 3 // aliti -> al
              }
            } else if (EQ_END(3, 'iv')) {
              // iviti -> ive
              l -= 2
              w[l - 1] = (mutated = true, 'e')
            }
          }
        } else if (w[l - 2] === 'l' && l >= 3) {
          if (w[l - 3] === 'b') {
            if (l >= 4 && w[l - 4] === 'a') {
              if (l >= r1 + 4)
                w[l - 1] = (mutated = true, 'e') // abli -> able
            } else if (l >= r1 + 3) {
              w[l - 1] = (mutated = true, 'e') // bli -> ble
            }
          } else {
            // Remove li
            if (w[l - 3] === 'l') {
              if (l >= 5 && EQ_END(3, 'fu')) {
                if (l >= r1 + 5) l -= 2 // fulli -> ful
              } else if (l >= r1 + 4 && w[l - 4] === 'a') {
                l -= 2 // alli -> al
              }
            } else if (w[l - 3] === 's') {
              if (l >= 6 && EQ_END(3, 'les')) {
                if (l >= r1 + 6)
                  l -= 2 // lessli -> less
              } else if (l >= r1 + 5 && EQ_END(3, 'ou')) {
                l -= 2 // ousli -> ous
              }
            } else if (l >= 5 && EQ_END(2, 'ent')) {
              if (l >= r1 + 5)
                l -= 2 // entli -> ent
            } else if (IS_VALID_LI[Math.min(w[l - 3], 127)]) {
              l -= 2
            }
          }
        }
    }
  }
  // Step_3
  if (l >= r1 + 3) {
    switch (w[l - 1]) {
      case 'l':
        if (w[l - 3] === 'c') {
          if (l >= r1 + 4 && w[l - 4] === 'i' && w[l - 2] === 'a')
            l -= 2 // ical -> ic
        } else if (w[l - 3] === 'f') {
          if (w[l - 2] === 'u')
            l -= 3 // ful -> <delete>
        } else if (w[l - 3] === 'n') {
          if (l >= r1 + 6 && w[l - 2] === 'a' && EQ_END(3, 'tio')) {
            if (l >= 7 && w[l - 7] === 'a') {
              if (l >= r1 + 7) {
                // ational -> ate
                l -= 4
                w[l - 1] = (mutated = true, 'e')
              }
            } else {
              l -= 2 // tional -> tion
            }
          }
        }
        break
      case 'e':
        if (w[l - 2] === 'z') {
          if (l >= r1 + 5 && EQ_END(2, 'ali'))
            l -= 3 // alize -> al
        } else if (w[l - 2] === 't') {
          if (l >= r1 + 5 && EQ_END(2, 'ica'))
            l -= 3 // icate -> ic
        } else if (w[l - 2] === 'v') {
          if (l >= r2 + 5 && EQ_END(2, 'ati'))
            l -= 5 // ative -> <delete> (if in R2)
        }
        break
      case 'i':
        if (l >= r1 + 5 && EQ_END(1, 'icit'))
          l -= 3 // iciti -> ic
        break
      case 's':
        if (l >= r1 + 4 && EQ_END(1, 'nes'))
          l -= 4 // ness -> <delete>
    }
  }
  // Step_4
  if (l >= r2 + 2) {
    switch (w[l - 1]) {
      case 'n':
        if (l >= r2 + 3 && EQ_END(1, 'io') && (w[l - 4] === 's' || w[l - 4] === 't'))
          l -= 3 // ion -> <delete> (if preceded by s or t)
        break
      case 'l':
        if (w[l - 2] === 'a')
          l -= 2 // al
        break
      case 'r':
        if (w[l - 2] === 'e')
          l -= 2 // er
        break
      case 'c':
        if (w[l - 2] === 'i')
          l -= 2 // ic
        break
      case 'm':
        if (l >= r2 + 3 && EQ_END(1, 'is'))
          l -= 3 // ism
        break
      case 'i':
        if (l >= r2 + 3 && EQ_END(1, 'it'))
          l -= 3 // iti
        break
      case 's':
        if (l >= r2 + 3 && EQ_END(1, 'ou'))
          l -= 3 // ous
        break
      case 't':
        if (l >= r2 + 3 && w[l - 2] === 'n') {
          if (w[l - 3] === 'a') {
            l -= 3 // ant
          } else if (w[l - 3] === 'e') {
            if (l >= 4 && w[l - 4] === 'm') {
              if (l >= 5 && w[l - 5] === 'e') {
                if (l >= r2 + 5)
                  l -= 5 // ement
              } else if (l >= r2 + 4) {
                l -= 4 // ment
              }
            } else {
              l -= 3 // ent
            }
          }
        }
        break
      case 'e':
        if (w[l - 2] === 'c') {
          if (l >= r2 + 4 && w[l - 3] === 'n'
              && (w[l - 4] === 'a' || w[l - 4] === 'e'))
            l -= 4 // ance  ence
        } else if (w[l - 2] === 'l') {
          if (l >= r2 + 4 && w[l - 3] === 'b'
              && (w[l - 4] === 'a' || w[l - 4] === 'i'))
            l -= 4 // able  ible
        } else if (w[l - 2] === 't') {
          if (l >= r2 + 3 && w[l - 3] === 'a')
            l -= 3 // ate
        } else if (l >= r2 + 3
                   && (w[l - 2] === 'v' || w[l - 2] === 'z') && w[l - 3] === 'i') {
          l -= 3 // ive  ize
        }
    }
  }
  // Step_5
  if (
    l >= r1 + 1 && // r1 is >= 1
    ((l >= r2 + 1 && EQ_END(0, 'll'))
    || EQ_END(0, 'e') && (l >= r2 + 1 || !is_shortv(w, l - 1)))
  )
    --l
  if (!mutated)
    return word.slice(initial_offset, initial_offset + l)
  var out = ''
  for (var i = 0; i < l; ++i)
    out += String.fromCharCode(w[i] === 'Y' ? 'y' : w[i])
  return out
}
