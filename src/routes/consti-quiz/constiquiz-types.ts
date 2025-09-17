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
    title: string;
    point_value: number;
    section: ISection;
    type: 'long_text' | 'short_text';
    options?: never;
}

export interface IOptionQuestion {
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
    is_checked: bool;
    points: int;
}

export type Question = ITextQuestion | IOptionQuestion;
