# ish
> When you need to find a string that's close... ish

</br>

## Getting Started

  ```bash
  npm install -g @kcpaulsen/ish
  ```

  ```bash
  echo -e "Food\nDrink\nSnacks" | ish 'fod'
    # Food
  ```

## Multi Matching

  You can also provide multiple potential strings to match against.
  It will match left-to-right, favoring first potential matches over later ones,
  but fallback if sufficently mismatched

  ```bash
  echo -e "Food\nDrink\nSnacks" | ish 'fodd' 'Drink'
    # Food

  echo -e "Food\nDrink\nSnacks" | ish 'fdd' 'Dink'
    # Drink
  ```

## JSON Output (simple and raw-string)

  ```bash
  echo -e "Food\nDrink\nSnacks" | ish 'fodd' --json
    # { "match": "Food" }

  echo "Food" | ish 'food' --json-string
    # "{\"match\":\"Food\"}"
  ```

## All matches Output

  Listing all possible matches, left to right, best to worst.

  ```bash
  echo -e "Food\nFodge\nFreak" | ish 'fo' --all --json
    # { "matches": [ "Food", "Fodge", "Freak" ] }

  echo -e "Food\nFodge\nFreak" | ish 'fo' --all
    # Food
    # Fodge
    # Freak
  ```

## Line matching mode

  You can also match each line, individually, from a stream of lines.
  Each line is matched individually against the possible matches, left to right,
  best to worse.

  ```
    echo -e "cat cat kat\nkat kat kat\ndog dog alligator | ish --line 'dog' 'cat'

    #cat
    #kat
    #dog
  ```


## Supported Options:

  ```
    --opts case-sensitive=true threshold=0.5 ...
  ```

  * caseSensitive
  * distance
  * threshold
  * location
  * maxPatternLength
  * minMatchCharLength

  ```bash

    echo "FOOD" | ish "food" --opts case-sensitive=true
      #

    echo "FOOD" | ish "FOOD" --opts case-sensitive=true
      # FOOD
  ```

  For more information on Fusejs options, see:

    https://fusejs.io

## About

  Heavily leveraging fuse.js (I mean heavy, like most-of-the-real-code), to make cli fuzzy matching,
  and outputing to other programs like jq, fx, eat, gron, easy and fun.
