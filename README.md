# VocabBuilder

VocabBuilder is a vocabulary learning web application that helps users build and manage their personal dictionary and practice translations between English and Ukrainian.

The application is built with **Next.js, React, and TypeScript** and integrates with a REST API for authentication, vocabulary management, and training.

## Features

### Authentication

- User registration and login
- Authenticated access to personal vocabulary
- Session management using authentication tokens
- Logout functionality

### Dictionary

- View and manage vocabulary
- Add new words
- Edit existing words
- Delete words
- Search and filter vocabulary
- Navigate through dictionary pages

### Training

- Practice translations between English and Ukrainian
- Retrieve training exercises from the backend API
- Enter translations and navigate between tasks
- Track completed exercises with a progress indicator
- Submit answers for validation
- View correct answers and mistakes in a results modal
- Display an empty state when no training tasks are available

### User Interface

- Responsive layout for desktop, tablet, and mobile
- Reusable React components
- CSS Modules for component-specific styling
- Loading, error, and empty states
- Toast notifications for user feedback

## Tech Stack

| Technology  | Purpose                           |
| ----------- | --------------------------------- |
| Next.js     | Application framework and routing |
| React       | User interface                    |
| TypeScript  | Static typing                     |
| CSS Modules | Component styling                 |
| REST API    | Backend communication             |
| Sonner      | Toast notifications               |
| ESLint      | Code quality                      |

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Navigate to the project directory:

```bash
cd YOUR_REPOSITORY
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint to check code quality.

## API Integration

The application communicates with the GoIT VocabBuilder backend:

```text
https://vocab-builder-backend.p.goit.global/api
```

Backend requests are handled through API utilities and Next.js route handlers.

Training endpoints include:

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/words/tasks`   | Retrieve training exercises |
| POST   | `/api/words/answers` | Submit training answers     |

Protected backend requests use bearer-token authentication.

## Project Structure

The project follows the Next.js App Router architecture.

```text
app/
  api/
    words/
      tasks/
      answers/
  ...

components/
  TrainingClient/
  TrainingEmpty/
  TrainingProgress/
  TrainingResultModal/
  ...

lib/
  api
  auth-cookie

types/
  training

public/
  icons/
  images/
```

The application uses reusable components to separate interface logic, styling, and API communication.

## Training Workflow

1. The user opens the Training page.
2. The application requests available exercises from the backend.
3. The user enters translations for the assigned words.
4. The progress indicator tracks completed answers.
5. After completing all exercises, the user submits the answers.
6. The backend validates the translations.
7. A results modal displays correct answers and mistakes.

## Responsive Design

The interface is designed to support desktop, tablet, and mobile screens using responsive CSS layouts and media queries.

## Author

**Ihor Kuzmenko**

GitHub: [IhorKuzmenko](https://github.com/IhorKuzmenko)

## License

This project was created for educational and portfolio purposes.
