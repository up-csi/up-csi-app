export interface ISection {
    section_id: number;
    title: string;
    points: string;
}

export interface IQuestion {
    title: string;
    point_value: number;
    section: Section;
}

export interface IOption {
    option_id: number;
    title: string;
}

export interface IOptionQuestion extends IQuestion {
    type: 'radio' | 'checkbox';
    options: IOption[];
}
