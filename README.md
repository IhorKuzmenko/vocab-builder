# VocabBuilder

**VocabBuilder** is a responsive vocabulary learning application designed to help users expand their English vocabulary, manage a personal dictionary, and practice translations between English and Ukrainian.

Built with **Next.js, React, and TypeScript**, the application integrates with the GoIT VocabBuilder REST API for authentication, vocabulary management, and interactive training.

The application also features **automatic word category detection**, helping users classify new vocabulary by parts of speech.

## Live Demo

**Website:** https://vocab-builder-flax-seven.vercel.app/

**GitHub Repository:** https://github.com/IhorKuzmenko/vocab-builder

## Features

### Authentication

- User registration and login
- Authentication using access tokens
- Protected access to personal vocabulary
- Session management
- Logout functionality
- Responsive registration and login forms

### Dictionary Management

- View and manage a personal dictionary
- Add new English words with Ukrainian translations
- Edit existing vocabulary entries
- Delete words from the dictionary
- Search words by keyword
- Filter vocabulary by category
- Filter verbs by Regular / Irregular type
- Navigate through paginated results
- Track vocabulary statistics and learning progress

### Automatic Word Category Detection

VocabBuilder integrates with an external English dictionary API to identify possible parts of speech when users enter English words.

Features include:

- Automatic category detection when adding words
- Category suggestions when editing English words
- Automatic selection when a single category is identified
- Display of multiple possible categories for ambiguous words
- Manual category selection when necessary
- Fallback when the dictionary service is unavailable
- Prevention of accidental submission without a selected category when adding words

Supported categories:

| Category          | Example       |
| ----------------- | ------------- |
| Verb              | work          |
| Participle        | written       |
| Noun              | apple         |
| Adjective         | beautiful     |
| Pronoun           | she           |
| Numerals          | five          |
| Adverb            | quickly       |
| Preposition       | under         |
| Conjunction       | and           |
| Phrasal verb      | look after    |
| Functional phrase | in my opinion |

**Note:** Automatic detection depends on the external dictionary's coverage. Some categories may require manual selection, and words with multiple grammatical functions may need user confirmation.

### Regular and Irregular Verbs

- Select Regular or Irregular for verbs
- Automatically recognize selected irregular verbs from a local reference list
- Display the three forms of recognized irregular verbs
- Support the `I form-II form-III form` input format
- Edit verb classification
- Use verb type as a dictionary filter

Examples:

| Verb  | Type      | Forms               |
| ----- | --------- | ------------------- |
| work  | Regular   | work                |
| go    | Irregular | go-went-gone        |
| see   | Irregular | see-saw-seen        |
| write | Irregular | write-wrote-written |

The irregular verb reference list is not exhaustive.

### Vocabulary Training

- Practice English-to-Ukrainian and Ukrainian-to-English translations
- Load exercises from the backend API
- Navigate between training tasks
- Enter translations
- Monitor training progress
- Submit answers for validation
- View correct answers and mistakes
- Display training results in a modal window
- Handle empty training sessions

### User Interface

- Responsive desktop, tablet, and mobile layouts
- Reusable React components
- CSS Modules for isolated component styling
- Custom modal dialogs
- Styled category dropdowns and verb-type radio buttons
- Loading, error, and empty states
- Toast notifications
- SVG icons and illustrations

## Tech Stack

| Technology          | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| Next.js             | App Router, API routes, server-side functionality |
| React               | Component-based user interface                    |
| TypeScript          | Static typing                                     |
| CSS Modules         | Component-specific styling                        |
| REST API            | Authentication, vocabulary, and training          |
| Free Dictionary API | English word category detection                   |
| Sonner              | Toast notifications                               |
| ESLint              | Code quality                                      |

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/IhorKuzmenko/vocab-builder.git
```

Navigate to the project directory:

```bash
cd vocab-builder
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## API Integration

The application integrates with the GoIT VocabBuilder backend:

`https://vocab-builder-backend.p.goit.global/api`

Next.js API route handlers provide an interface between the frontend and the backend.

### Authentication

| Method | Endpoint           | Description     |
| ------ | ------------------ | --------------- |
| POST   | `/api/auth/signup` | Register a user |
| POST   | `/api/auth/signin` | Sign in         |

### Vocabulary

| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| GET    | `/api/words/categories`      | Retrieve available categories           |
| GET    | `/api/words/statistics`      | Retrieve vocabulary statistics          |
| GET    | `/api/words/own`             | Retrieve personal vocabulary            |
| POST   | `/api/words/create`          | Add a new word                          |
| PATCH  | `/api/words/edit/[id]`       | Edit an existing word                   |
| DELETE | `/api/words/delete/[id]`     | Delete a word                           |
| GET    | `/api/words/detect-category` | Detect possible English word categories |

### Training

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/words/tasks`   | Retrieve training exercises |
| POST   | `/api/words/answers` | Submit training answers     |

Protected requests use bearer-token authentication when communicating with the GoIT backend.

### External Dictionary Integration

Word category detection uses:

`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

The detection workflow:

1. The user enters an English word.
2. A debounced request is sent to the Next.js detection endpoint.
3. The server requests grammatical information from the external dictionary.
4. Returned parts of speech are mapped to VocabBuilder categories.
5. The interface automatically selects an unambiguous category or allows the user to choose.
6. The word is saved through the existing vocabulary API.

## Project Structure

The application follows the Next.js App Router architecture.

```text
vocab-builder/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   └── signin/
│   │   └── words/
│   │       ├── categories/
│   │       ├── statistics/
│   │       ├── own/
│   │       ├── create/
│   │       ├── edit/
│   │       ├── delete/
│   │       ├── detect-category/
│   │       ├── tasks/
│   │       └── answers/
│   └── ...
│
├── components/
│   ├── AddWordModal/
│   ├── AuthForm/
│   ├── AuthLayout/
│   ├── DashboardHeader/
│   ├── DictionaryClient/
│   ├── DictionaryTable/
│   ├── DictionaryToolbar/
│   ├── EditWordModal/
│   ├── Header/
│   ├── Icon/
│   ├── Logo/
│   ├── LogoutButton/
│   ├── Pagination/
│   ├── ProgressCircle/
│   ├── RecommendClient/
│   ├── RecommendTable/
│   ├── TrainingClient/
│   ├── TrainingEmpty/
│   ├── TrainingProgress/
│   └── TrainingResultModal/
│
├── lib/
│   ├── api.ts
│   ├── auth-cookie.ts
│   └── word-category.ts
│
├── types/
│   └── words.ts
│
├── public/
│   ├── icons/
│   └── images/
│
├── README.md
└── package.json
```

The project separates UI components, API communication, shared utilities, and TypeScript types to improve maintainability and reusability.

## Training Workflow

1. The user signs in and opens the Training page.
2. The application requests exercises from the backend.
3. The user translates words between English and Ukrainian.
4. The progress indicator tracks the current task.
5. After completing the exercises, the answers are submitted.
6. The backend validates the submitted translations.
7. A results modal displays correct answers and mistakes.
8. The user can return to the dictionary.

## Responsive Design

VocabBuilder supports desktop, tablet, and mobile screens.

The interface uses responsive CSS layouts and media queries to adapt navigation, dictionary tables, forms, and modal windows to different screen sizes.

## Author

**Ihor Kuzmenko**

GitHub: https://github.com/IhorKuzmenko

## License

This project was developed for educational and portfolio purposes.
