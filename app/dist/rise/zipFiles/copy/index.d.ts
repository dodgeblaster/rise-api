export const makenote: ({
    type: string;
    structure: {
        title: string;
        content: string;
        id?: undefined;
    };
    id?: undefined;
    action?: undefined;
} | {
    type: string;
    id: string;
    structure?: undefined;
    action?: undefined;
} | {
    type: string;
    action: string;
    structure?: undefined;
    id?: undefined;
} | {
    type: string;
    structure: {
        id: string;
        title: string;
        content: string;
    };
    id?: undefined;
    action?: undefined;
})[];
