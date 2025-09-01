export interface ISection {
    section_id: number;
    title: string;
    description?: string;
}

export interface IQuestion {
    title: string;
    point_value: number;
    section: Section;
}

export interface IOption {
    option_id: number;
    title: string;
    value: number;
}

export interface IOptionQuestion extends IQuestion {
    type: 'radio' | 'checkbox';
    options: IOption[];
}
