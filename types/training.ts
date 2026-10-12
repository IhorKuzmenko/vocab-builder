
export type TrainingDirection = "en" | "ua";

export type TrainingTask = {
  _id: string;
  task: TrainingDirection;
  en?: string;
  ua?: string;
};

export type TrainingTasksResponse = {
  words: TrainingTask[];
};

export type TrainingAnswer = {
  _id: string;
  en: string;
  ua: string;
  task: TrainingDirection;
};

export type TrainingAnswerResult = TrainingAnswer & {
  isDone: boolean;
};

export type TrainingAnswersResponse = TrainingAnswerResult[];
