// 1.Definicion de los tipos de cajas
export type WidgetType = 'video' | 'text' | 'link' | 'pdf' | 'stat'; 

// 2.Interfaz base de cualquier widget (posición en la cuadricula)
export interface BaseWidget{
    id: string;
    type: WidgetType;
    x: number;
    y: number;
    w: number;
    h: number;
}


// TODO tengo que taer archivos de la BD de Supabase
// 3.Tipos especificos para los datos que se guardan en cada widget
export interface VideoWidgetData extends BaseWidget{
    type: 'video';
    data: {
        url: string;
        title?: string
    };
}

export interface TextWidgetData extends BaseWidget{
    type: 'text';
    data: {
        content: string;
    };
}

// TODO Añadir mas componete pdf, enlace stats... 

// 4. Tipo principal que lo engloba a todos
export type CampaignWidget = VideoWidgetData | TextWidgetData;

// 5.Objeto completo que gardaremos en la base de datos JSON
export interface CampaignLayout{
    widgets: CampaignWidget[];
}