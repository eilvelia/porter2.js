Object.defineProperty(exports, '__esModule', { value: true })

// EQ_BEGIN : (chars : string) -> <code (boolean)>
// EQ_END : (offset : number, chars : string) -> <code (boolean)>
// All one-character strings in this file are converted to char codes.

// This is mostly a rewrite of my ocaml implementation (though not published
// at the moment of writing this)

function is_v(char) {
  switch (char) {
    case 'a': case 'e': case 'i': case 'o': case 'u': case 'y': return true
    default: return false
  }
}

function is_wxy(char) {
  switch (char) {
    case 'a': case 'e': case 'i': case 'o': case 'u': case 'y':
    case 'w': case 'x': case 'Y':
      return true
    default: return false
  }
}

function is_valid_li(char) {
  switch (char) {
    case 'c': case 'd': case 'e': case 'g': case 'h': case 'k': case 'm':
    case 'n': case 'r': case 't':
      return true
    default: return false
  }
}

function is_double(char) {
  switch (char) {
    case 'b': case 'd': case 'f': case 'g': case 'm': case 'n': case 'p':
    case 'r': case 't':
      return true
    default: return false
  }
}

function is_shortv(w, len) {
  // backwardmode: ( non-v_WXY v non-v ) or ( non-v v atlimit )
  return len >= 2 && is_v(w[len - 2]) && (
    (len === 2 && !is_v(w[len - 1]))
    || (len >= 3 && !is_v(w[len - 3])
        && !is_wxy(w[len - 1]))
  )
}

exports.stem = function stem(word) {
  if (word.length < 3)
    return word
  // exception1
  if (word.length <= 6) {
    switch (word) {
      case 'ski': return 'ski'
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
  var w = new Array(l)
  var y_found = false
  for (var i = 0; i < l; ++i) {
    // var ch = word[i + initial_offset]
    var ch = word.charCodeAt(i + initial_offset)
    if (ch === 'y' && (i === 0 || is_v(w[i - 1]))) {
      y_found = true
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
  while (rv < l && !is_v(w[rv])) ++rv
  if (rv < l) ++rv
  var r1 = rv
  if (l >= 5 && ((EQ_BEGIN('gener')) || (EQ_BEGIN('arsen'))))
    r1 = 5
  else if (l >= 6 && EQ_BEGIN('commun'))
    r1 = 6
  else {
    // > R1 is the region after the first non-vowel following a vowel,
    // > or the end of the word if there is no such non-vowel.
    while (r1 < l && is_v(w[r1])) ++r1
    if (r1 < l) ++r1
  }
  // > R2 is the region after the first non-vowel following a vowel in R1,
  // > or the end of the word if there is no such non-vowel.
  var r2 = r1
  var found_v = false
  while (r2 < l && !is_v(w[r2])) ++r2
  while (r2 < l && is_v(w[r2])) ++r2
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
            w[l] = 'e'
            ++l
          } else if (w[l - 2] === w[l - 1] && is_double(w[l - 1])) {
            --l
          } else if (r1 >= l && is_shortv(w, l)) {
            // <shortv> -> e
            w[l] = 'e'
            ++l
          }
        }
      }
    }
  }
  // Step_1c
  if (l >= 3 && (w[l - 1] === 'Y' || w[l - 1] === 'y')
      && !is_v(w[l - 2]))
    w[l - 1] = 'i'
  // Step_2
  if (l >= r1 + 2) {
    switch (w[l - 1]) {
      case 'l':
        if (l >= r1 + 6 && EQ_END(1, 'tiona')) {
          if (l >= 7 && w[l - 7] === 'a') {
            if (l >= r1 + 7) {
              // ational -> ate
              l -= 4
              w[l - 1] = 'e'
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
              w[l - 1] = 'e'
            }
          } else {
            // ation -> ate
            l -= 2
            w[l - 1] = 'e'
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
              w[l - 1] = 'e'
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
            w[l - 1] = 'e' // enci -> ence   anci -> ance
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
                  w[l - 2] = 'l'
                  w[l - 1] = 'e'
                }
              } else if (EQ_END(3, 'al')) {
                l -= 3 // aliti -> al
              }
            } else if (EQ_END(3, 'iv')) {
              // iviti -> ive
              l -= 2
              w[l - 1] = 'e'
            }
          }
        } else if (w[l - 2] === 'l' && l >= 3) {
          if (w[l - 3] === 'b') {
            if (l >= 4 && w[l - 4] === 'a') {
              if (l >= r1 + 4)
                w[l - 1] = 'e' // abli -> able
            } else if (l >= r1 + 3) {
              w[l - 1] = 'e' // bli -> ble
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
            } else if (is_valid_li(w[l - 3])) {
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
                w[l - 1] = 'e'
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
  var out = ''
  if (y_found) {
    for (var i = 0; i < l; ++i) {
      out += String.fromCharCode(w[i] === 'Y' ? 'y' : w[i])
    }
  } else {
    for (var i = 0; i < l; ++i)
      // out += w[i]
      out += String.fromCharCode(w[i])
  }
  return out
}
