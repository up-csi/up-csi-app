export interface ISection {
    section_id: number;
    title: string;
    points: number;
}

export interface IOption {
    option_id: number;
    title: string;
}

export interface ITextQuestion {
    question_id: number;
    title: string;
    point_value: number;
    section: ISection;
    type: 'long_text' | 'short_text';
    options?: never;
}

export interface IOptionQuestion {
    question_id: number;
    title: string;
    point_value: number;
    section: ISection;
    type: 'radio' | 'checkbox';
    options: IOption[];
}

export interface Answer {
    user_id: string;
    question_id: number;
    option_id?: number | null;
    answer_text?: string | null;
    is_checked: boolean;
    points: number;
}

export type Question = ITextQuestion | IOptionQuestion;
