# Plataforma de Gestión de Contenidos

## 1. Introducción

El presente proyecto tiene como objetivo el desarrollo de una aplicación web destinada a la organización y gestión de información estructurada en distintas áreas. El proyecto será realizado por alumnos en prácticas del departamento de programación, aplicando buenas prácticas de desarrollo, control de versiones y trabajo colaborativo.

La aplicación se desarrollará utilizando **React** para el frontend y **Nest.js** para el backend (con **Inertia.js**). La gestión del proyecto se realizará mediante **Jira**, el control de versiones con **GitHub**, y el desarrollo se llevará a cabo en **Visual Studio Code**.

## 2. Descripción General de la Aplicación

La aplicación contará con una pantalla principal que mostrará tres tarjetas principales, grandes y claramente visibles, correspondientes a las siguientes áreas:

* **ADESLAS**
* **ENERGÍA**
* **ALARMA**

Cada tarjeta representará un módulo independiente dentro de la aplicación. Al pulsar sobre una tarjeta, el usuario accederá al contenido específico de dicha área.

## 3. Estructura de Contenidos

Dentro de cada tarjeta principal existirán categorías, las cuales podrán contener:

* Información textual
* Documentación
* Archivos descargables
* Enlaces externos

Cada categoría podrá, a su vez, contener subcategorías, permitiendo una estructura jerárquica y escalable del contenido.

## 4. Panel de Administración

La aplicación dispondrá de un panel de administración (**Admin Panel**) accesible únicamente para usuarios autorizados.

Desde este panel se deberá permitir:

* Crear, editar y eliminar categorías dentro de cada tarjeta principal.
* Crear, editar y eliminar subcategorías.
* Añadir y gestionar:
  * Textos informativos.
  * Documentos.
  * Archivos.
  * Enlaces.

El sistema deberá estar diseñado para facilitar la futura ampliación de funcionalidades y mantener la posibilidad de ampliar la estructura sin necesidad de modificar el código base.

## 5. Objetivos Formativos

Durante el desarrollo del proyecto, los alumnos deberán:

1. **Aplicar conceptos de desarrollo frontend con React.**
2. **Trabajar en equipo utilizando GitHub.**
3. **Aprender a estructurar una aplicación escalable.**
4. **Gestionar componentes, estados y navegación.**
