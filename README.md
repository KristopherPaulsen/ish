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
  ```

  ```bash
  echo -e "Food\nDrink\nSnacks" | ish 'fdd' 'Dink'
    # Drink
  ```

  ```bash
  Example (JSON output types). Usefull for chaining with jq, fx, etc

    echo -e "Food\\nDrink\\nSnacks" | ish 'fodd' --json
      # { "text": "Food" }

    # Or, for a raw json string

    echo "Food" | ish 'food' --json-string
      # "{\\"text\\":\\"Food\\"}"
  ```

## About

  It's pretty much a glorified wrapper around FuseJs, but why not make things a bit
  easier?
