# ish
> When you need to find a string that's close..ish

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
  echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --json
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

## About

  It's pretty much a glorified wrapper around FuseJs, but why not make things a bit
  easier?
