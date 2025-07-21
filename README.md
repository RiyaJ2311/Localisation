# Localisation file

A simple React app to help you localize your English JSON files into multiple languages (German, Spanish, Hindi).

## Features
- Import an .json file containing English strings
- View all keys and values in a table
- Select target languages (de, es, hi) with checkboxes
- Translate with a single click (calls `/api/translate` endpoint)
- Download translated JSON files for each selected language

## Getting Started

### 1. Install dependencies
```
npm install
```

### 2. Start the development server
```
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 3. Usage
1. Click **Import en.json** and select your English JSON file.
2. Review the keys and values in the table.
3. Select one or more target languages (German, Spanish, Hindi).
4. Click **Translate**. The app will send a POST request to `/api/translate` with your data.
5. Download the translated files using the provided buttons.

### 4. API Requirement
You must have a backend endpoint at `/api/translate` that accepts:
```json
{
  "lang": ["de", "es", "hi"],
  "data": { ...your en.json content... }
}
```
and returns an object with translated JSONs, e.g.:
```json
{
  "de": { ... },
  "es": { ... },
  "hi": { ... }
}
```

---

**Local development URL:**
- http://localhost:3000

If you need a sample backend or have questions, feel free to ask! 
