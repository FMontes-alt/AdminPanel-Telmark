/**
 * factories.ts — Funciones que generan datos de seed para cada tabla.
 *
 * ¿Por qué factories?
 * Una factory es una función que devuelve un objeto con el formato exacto
 * de una fila de la base de datos. Así separamos la "forma" de los datos
 * de la lógica de insertarlos. Si mañana cambia el schema, solo tocas
 * este archivo.
 */

// ─── Tipos (basados en el schema de Drizzle) ───────────────────────────

type SectionSeed = {
    name: string;
    slug: string;
    config: Record<string, unknown>;
};

type CategorySeed = {
    name: string;
    slug: string;
};

type SubcategorySeed = {
    name: string;
    slug: string;
};

type ItemSeed = {
    title: string;
    slug: string;
    body: string | null;
    filePath: string | null;
    externalLink: string | null;
    contentType: "info" | "document" | "file" | "link";
    attributes: Record<string, unknown>;
};

// ─── SECTIONS ───────────────────────────────────────────────────────────

export function createSections(): SectionSeed[] {
    return [
        {
            name: "ADESLAS",
            slug: "adeslas",
            config: {
                color: "#7B2D8E",
                icon: "shield",
                description: "Gestión de seguros y pólizas Adeslas",
            },
        },
        {
            name: "ENERGÍA",
            slug: "energia",
            config: {
                color: "#F5A623",
                icon: "zap",
                description: "Gestión de tarifas y contratos de energía",
            },
        },
        {
            name: "ALARMA",
            slug: "alarma",
            config: {
                color: "#2D6BCB",
                icon: "bell",
                description: "Gestión de sistemas de alarma y seguridad",
            },
        },
    ];
}

// ─── CATEGORIES (por sección) ───────────────────────────────────────────

export function createCategories(): Record<string, CategorySeed[]> {
    return {
        adeslas: [
            { name: "Pólizas", slug: "polizas" },
            { name: "Gestión de Clientes", slug: "gestion-clientes" },
            { name: "Contacto y Soporte", slug: "contacto-soporte" },
        ],
        energia: [
            { name: "Tarifas", slug: "tarifas" },
            { name: "Gestión de Contratos", slug: "gestion-contratos" },
            { name: "Averías y Reclamaciones", slug: "averias-reclamaciones" },
        ],
        alarma: [
            { name: "Sistemas de Alarma", slug: "sistemas-alarma" },
            { name: "Mantenimiento", slug: "mantenimiento" },
            { name: "Emergencias", slug: "emergencias" },
        ],
    };
}

// ─── SUBCATEGORIES (por categoría) ──────────────────────────────────────

export function createSubcategories(): Record<string, SubcategorySeed[]> {
    return {
        // --- ADESLAS ---
        "polizas": [
            { name: "Póliza Dental", slug: "poliza-dental" },
            { name: "Póliza Completa", slug: "poliza-completa" },
            { name: "Póliza Básica", slug: "poliza-basica" },
        ],
        "gestion-clientes": [
            { name: "Alta de Cliente", slug: "alta-cliente" },
            { name: "Baja de Cliente", slug: "baja-cliente" },
            { name: "Modificación de Datos", slug: "modificacion-datos" },
        ],
        "contacto-soporte": [
            { name: "Teléfonos Útiles", slug: "telefonos-utiles" },
            { name: "Preguntas Frecuentes", slug: "preguntas-frecuentes" },
        ],

        // --- ENERGÍA ---
        "tarifas": [
            { name: "Tarifa Fija", slug: "tarifa-fija" },
            { name: "Tarifa Variable", slug: "tarifa-variable" },
            { name: "Tarifa Nocturna", slug: "tarifa-nocturna" },
        ],
        "gestion-contratos": [
            { name: "Alta de Suministro", slug: "alta-suministro" },
            { name: "Cambio de Titular", slug: "cambio-titular" },
        ],
        "averias-reclamaciones": [
            { name: "Protocolo de Averías", slug: "protocolo-averias" },
            { name: "Reclamaciones", slug: "reclamaciones" },
        ],

        // --- ALARMA ---
        "sistemas-alarma": [
            { name: "Alarma Perimetral", slug: "alarma-perimetral" },
            { name: "Alarma Interior", slug: "alarma-interior" },
            { name: "Videovigilancia", slug: "videovigilancia" },
        ],
        "mantenimiento": [
            { name: "Revisión Anual", slug: "revision-anual" },
            { name: "Batería y Sensores", slug: "bateria-sensores" },
        ],
        "emergencias": [
            { name: "Protocolo de Emergencias", slug: "protocolo-emergencias" },
            { name: "Contacto CRA", slug: "contacto-cra" },
        ],
    };
}

// ─── ITEMS (por subcategoría) ───────────────────────────────────────────

export function createItems(): Record<string, ItemSeed[]> {
    return {
        // ══════════ ADESLAS ══════════

        // Pólizas
        "poliza-dental": [
            {
                title: "Información General - Póliza Dental",
                slug: "info-poliza-dental",
                body: "La póliza dental Adeslas cubre tratamientos de ortodoncia, endodoncia, empastes y revisiones anuales. Incluye una red de más de 3.000 clínicas dentales en toda España. El período de carencia es de 3 meses para tratamientos complejos.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "high" },
            },
            {
                title: "Cuadro de Coberturas Dental 2026",
                slug: "coberturas-dental-2026",
                body: "Documento con el cuadro completo de coberturas de la póliza dental para el año 2026.",
                filePath: "documents/adeslas/coberturas-dental-2026.pdf",
                externalLink: null,
                contentType: "document",
                attributes: { year: 2026, fileSize: "2.4MB" },
            },
        ],
        "poliza-completa": [
            {
                title: "Información General - Póliza Completa",
                slug: "info-poliza-completa",
                body: "La póliza completa Adeslas incluye medicina general, especialistas, hospitalización, pruebas diagnósticas y urgencias. Cobertura nacional con más de 40.000 profesionales médicos.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "high" },
            },
            {
                title: "Comparador de Pólizas Adeslas",
                slug: "comparador-polizas",
                body: null,
                filePath: null,
                externalLink: "https://www.segurcaixaadeslas.es/es/seguros-salud",
                contentType: "link",
                attributes: { linkType: "external" },
            },
        ],
        "poliza-basica": [
            {
                title: "Información General - Póliza Básica",
                slug: "info-poliza-basica",
                body: "La póliza básica ofrece cobertura esencial: medicina general, urgencias y consultas de especialista con copago. Ideal para clientes que buscan una opción económica con acceso a la red Adeslas.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "medium" },
            },
        ],

        // Gestión de Clientes
        "alta-cliente": [
            {
                title: "Procedimiento de Alta de Cliente",
                slug: "procedimiento-alta",
                body: "Para dar de alta un nuevo cliente en Adeslas:\n1. Solicitar DNI/NIE del titular.\n2. Rellenar formulario de alta en el sistema CRM.\n3. Verificar datos bancarios para domiciliación.\n4. Enviar documentación al departamento de suscripción.\n5. Confirmar la póliza en un plazo máximo de 48 horas.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { department: "comercial" },
            },
            {
                title: "Formulario de Alta - Descargable",
                slug: "formulario-alta",
                body: "Formulario oficial para el alta de nuevos clientes en el sistema.",
                filePath: "documents/adeslas/formulario-alta-cliente.pdf",
                externalLink: null,
                contentType: "document",
                attributes: { fileSize: "540KB", version: "3.1" },
            },
        ],
        "baja-cliente": [
            {
                title: "Procedimiento de Baja",
                slug: "procedimiento-baja",
                body: "La baja de un cliente requiere:\n1. Solicitud escrita del titular (email o carta).\n2. Preaviso mínimo de 30 días antes de la renovación.\n3. Verificar que no hay recibos pendientes.\n4. Tramitar la baja en el sistema CRM.\n5. Enviar confirmación al cliente por email.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { department: "administración" },
            },
        ],
        "modificacion-datos": [
            {
                title: "Cambio de Datos del Asegurado",
                slug: "cambio-datos-asegurado",
                body: "Para modificar los datos de un asegurado (dirección, teléfono, cuenta bancaria), acceder al CRM → sección 'Datos del cliente' → 'Modificar'. Los cambios de cuenta bancaria requieren validación del departamento financiero.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: {},
            },
        ],

        // Contacto y Soporte
        "telefonos-utiles": [
            {
                title: "Directorio de Teléfonos",
                slug: "directorio-telefonos",
                body: "Teléfonos de contacto principales:\n- Atención al Cliente: 900 200 200\n- Urgencias Médicas: 900 111 222\n- Siniestros: 900 333 444\n- Departamento Comercial: 91 555 66 77\n- Soporte Técnico Web: 91 888 99 00",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { pinned: true },
            },
        ],
        "preguntas-frecuentes": [
            {
                title: "FAQ - Preguntas Frecuentes Adeslas",
                slug: "faq-adeslas",
                body: null,
                filePath: null,
                externalLink: "https://www.segurcaixaadeslas.es/es/atencion-al-cliente",
                contentType: "link",
                attributes: { linkType: "external" },
            },
        ],

        // ══════════ ENERGÍA ══════════

        // Tarifas
        "tarifa-fija": [
            {
                title: "Información - Tarifa Fija",
                slug: "info-tarifa-fija",
                body: "La tarifa fija garantiza un precio estable del kWh durante 12 meses, independientemente de las fluctuaciones del mercado. Ideal para clientes que prefieren previsibilidad en sus facturas. Incluye energía 100% renovable certificada.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "high" },
            },
        ],
        "tarifa-variable": [
            {
                title: "Información - Tarifa Variable",
                slug: "info-tarifa-variable",
                body: "La tarifa variable ajusta el precio del kWh según el mercado OMIE. Puede resultar más económica en horas valle (noches y fines de semana). Recomendada para clientes con flexibilidad horaria en su consumo energético.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "medium" },
            },
        ],

        // ══════════ ALARMA ══════════

        // Sistemas de Alarma
        "alarma-perimetral": [
            {
                title: "Información - Alarma Perimetral",
                slug: "info-alarma-perimetral",
                body: "El sistema de alarma perimetral protege el exterior de la propiedad mediante sensores de movimiento, barreras infrarrojas y detectores de vibración. Incluye conexión 24/7 con la Central Receptora de Alarmas (CRA).",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { priority: "high" },
            },
        ],
        // Mantenimiento
        "revision-anual": [
            {
                title: "Protocolo de Revisión Anual",
                slug: "protocolo-revision-anual",
                body: "La revisión anual obligatoria incluye comprobación de detectores y test de comunicación.",
                filePath: null,
                externalLink: null,
                contentType: "info",
                attributes: { frequency: "annual", mandatory: true },
            },
        ],
    };
}
