import express from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5009;

// Register Middlewares / Plugins
app.use(express.json());
app.use(cors());
app.use(helmet());

let STRINGS = [];

// Ping endpoint
app.get("/", async (req, res) => {
  res.json(STRINGS);
});

// 1. Create/Analyze String
app.post("/strings", (req, res) => {
  // const strings = [...STRINGS] || [];

  const { value } = req.body;
  if (!value) return res.status(400).json(ERROR.errNoVal); // Bad Request

  // Creating an SHA256 Hash.
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  if (typeof value !== "string")
    return res.status(422).json(ERROR.errNonString); // Unprocessable Entity

  const exists = STRINGS.find((str) => str.value === value);
  if (exists) return res.status(409).json(ERROR.errExists); // Conflict

  // String length
  const length = value.length;

  // If the string is a palindrome.
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const is_palindrome = cleaned === cleaned.split("").reverse().join("");

  // Length of unique characters.
  const unique_characters = new Set(value).size;

  // Length of words.
  const word_count = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Frequency of each character.
  const character_frequency_map = {};
  for (let char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  const newStringObj = {
    id: sha256_hash,
    value: value,
    properties: {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    },
    created_at: new Date().toISOString(),
  };

  STRINGS.push(newStringObj);

  res.status(201).json(newStringObj);
  console.log(`"${value}" was newly added.`);
});

// 4. Natural Language Filtering
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Unable to parse natural language query",
    });
  }

  let filters = {};

  switch (query) {
    case "all single word palindromic strings":
      filters.word_count = 1;
      filters.is_palindrome = true;
      break;
    case "strings longer than 10 characters":
      filters.min_length = 11;
      break;
    case "palindromic strings that contain the first vowel":
      filters.is_palindrome = true;
      filters.contains_character = "a";
      break;
    case "strings containing the letter z":
      filters.contains_character = "z";
      break;
    default:
      return res.status(400).json({
        status: "error",
        message: "Unable to parse natural language query",
      });
  }

  let filteredStrings = STRINGS.filter((stringObj) => {
    if (filters.is_palindrome !== undefined) {
      if (stringObj.properties.is_palindrome !== filters.is_palindrome) {
        return false;
      }
    }

    if (filters.min_length !== undefined) {
      if (stringObj.properties.length < filters.min_length) {
        return false;
      }
    }

    if (filters.word_count !== undefined) {
      if (stringObj.properties.word_count !== filters.word_count) {
        return false;
      }
    }

    if (filters.contains_character !== undefined) {
      if (
        !stringObj.properties.character_frequency_map[
          filters.contains_character
        ]
      ) {
        return false;
      }
    }

    return true;
  });
  //

  res.status(200).json({
    data: filteredStrings,
    count: filteredStrings.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters,
    },
  });
});

// 2. Get Specific String
app.get("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;

  const exists = STRINGS.find((str) => string_value === str.value);
  if (!exists)
    return res.status(404).json({
      status: "error",
      message: "String does not exists in the system",
    }); // Not Found

  res.status(200).json(exists);
});

// 3. Get All Strings with Filtering
app.get("/strings", (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  // Parse query parameters
  let filters = {};

  if (is_palindrome !== undefined) {
    if (is_palindrome !== "true" && is_palindrome !== "false") {
      return res
        .status(400)
        .json({ error: "is_palindrome must be 'true' or 'false'" });
    }
    filters.is_palindrome = is_palindrome === "true";
  }

  if (min_length !== undefined) {
    const minLen = parseInt(min_length);
    if (isNaN(minLen) || minLen < 0) {
      return res
        .status(400)
        .json({ error: "min_length must be a positive integer" });
    }
    filters.min_length = minLen;
  }

  if (max_length !== undefined) {
    const maxLen = parseInt(max_length);
    if (isNaN(maxLen) || maxLen < 0) {
      return res
        .status(400)
        .json({ error: "max_length must be a positive integer" });
    }
    filters.max_length = maxLen;
  }

  if (word_count !== undefined) {
    const wc = parseInt(word_count);
    if (isNaN(wc) || wc < 0) {
      return res
        .status(400)
        .json({ error: "word_count must be a positive integer" });
    }
    filters.word_count = wc;
  }

  if (contains_character !== undefined) {
    if (
      typeof contains_character !== "string" ||
      contains_character.length !== 1
    ) {
      return res
        .status(400)
        .json({ error: "contains_character must be a single character" });
    }
    filters.contains_character = contains_character;
  }

  let filteredStrings = STRINGS.filter((stringObj) => {
    // Check is_palindrome filter
    if (filters.is_palindrome !== undefined) {
      if (stringObj.properties.is_palindrome !== filters.is_palindrome) {
        return false; // Doesn't match, exclude it
      }
    }

    // Check min_length filter
    if (filters.min_length !== undefined) {
      if (stringObj.properties.length < filters.min_length) {
        return false;
      }
    }

    // Check max_length filter
    if (filters.max_length !== undefined) {
      if (stringObj.properties.length > filters.max_length) {
        return false;
      }
    }

    // Check word_count filter
    if (filters.word_count !== undefined) {
      if (stringObj.properties.word_count !== filters.word_count) {
        return false;
      }
    }

    // Check contains_character filter
    if (filters.contains_character !== undefined) {
      if (
        !stringObj.properties.character_frequency_map[
          filters.contains_character
        ]
      ) {
        return false;
      }
    }

    // Passed all filters!
    return true;
  });

  res.status(200).json({
    data: filteredStrings,
    count: filteredStrings.length,
    filters_applied: filters,
  });
});

// 5. Delete String
app.delete("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;

  const exists = STRINGS.find((str) => string_value === str.value);
  if (!exists)
    return res.status(404).json({
      status: "error",
      message: "String does not exists in the system",
    });

  STRINGS = STRINGS.filter((str) => string_value !== str.value);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  console.log(`Server running locally on https://localhost:${PORT}`);
});

// RESPONSE JSON (ERRORS)
const ERROR = {
  errNoVal: {
    status: "error",
    message: `Invalid request body or missing "value" field`,
  },
  errNonString: {
    status: "error",
    message: `Invalid data type for "value" (must be string)`,
  },
  errExists: {
    status: "error",
    message: `String already exists in the system`,
  },
};
