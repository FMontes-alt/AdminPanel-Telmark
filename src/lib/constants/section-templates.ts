export type SectionTemplateType = 'GENERICO' | 'DOCUMENTOS' | 'VIDEOS' | 'POLIZAS';

export interface SectionTemplate {
    id: SectionTemplateType;
    label: string;
    description: string;
    icon: string;
    allowedContentTypes: string[]; // info, document, file, link, video
    layout: 'list' | 'grid' | 'table';
    customFields?: {
        name: string;
        label: string;
        type: 'text' | 'date' | 'select' | 'number';
        options?: string[];
    }[];
}

export const SECTION_TEMPLATES: Record<SectionTemplateType, SectionTemplate> = {
    GENERICO: {
        id: 'GENERICO',
        label: 'Genérico',
        description: 'Uso libre con todos los campos disponibles.',
        icon: 'Layout',
        allowedContentTypes: ['info', 'document', 'file', 'link', 'video'],
        layout: 'list'
    },
    DOCUMENTOS: {
        id: 'DOCUMENTOS',
        label: 'Biblioteca de Documentos',
        description: 'Optimizado para archivos PDF y documentación oficial.',
        icon: 'FileText',
        allowedContentTypes: ['document'],
        layout: 'list'
    },
    VIDEOS: {
        id: 'VIDEOS',
        label: 'Galería de Vídeos',
        description: 'Especializado en contenido multimedia y tutoriales.',
        icon: 'Video',
        allowedContentTypes: ['video'],
        layout: 'grid'
    },
    POLIZAS: {
        id: 'POLIZAS',
        label: 'Gestión de Pólizas',
        description: 'Formulario estructurado para seguros y pólizas.',
        icon: 'ShieldCheck',
        allowedContentTypes: ['document', 'info'],
        layout: 'table',
        customFields: [
            { name: 'numPoliza', label: 'Nº de Póliza', type: 'text' },
            { name: 'vencimiento', label: 'Fecha Vencimiento', type: 'date' },
            { name: 'estado', label: 'Estado', type: 'select', options: ['Activa', 'Vencida', 'Pendiente'] },
        ]
    }
};

export const SECTION_TEMPLATE_OPTIONS = Object.values(SECTION_TEMPLATES);
