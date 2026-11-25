# CANELA · River Rooftop

Web completa en HTML, CSS y JavaScript. No requiere npm, React ni compilación.
Diseño adaptable, entrada animada, ubicación, cartas, redes y reservas por WhatsApp.
La versión está centrada en comida y bebidas sin alcohol.

## Abrir

1. Extrae el ZIP completo.
2. Abre `index.html` en Chrome, Edge, Safari o Firefox actualizado.
3. Conserva juntos todos los archivos y carpetas.

La introducción animada dura 4,6 segundos y luego se cierra sola. Puedes volver a verla con el botón del sol.
Si el navegador tiene activado «reducir movimiento», la página se abre directamente.
La función Compartir necesita que la web esté publicada; el resto funciona en local.

## Dónde pegar tus enlaces

Abre `config.js` con Visual Studio Code o Bloc de notas. Todos los cambios están allí.

| Campo | Qué debes poner |
| --- | --- |
| `enlaces.ubicacion` | Enlace de Google Maps. Ya está configurado como búsqueda de la dirección. |
| `enlaces.cartaBebidasSinAlcohol` | Enlace a tu carta digital (por ejemplo, Heyzine). Tiene un enlace temporal de muestra. |
| `enlaces.cartaComida` | Enlace de tu carta de comida. Por defecto abre `./cartas/comida.pdf`, copiada del repositorio de referencia. |
| `enlaces.instagram` | Enlace de tu Instagram. Ya incluido desde el repositorio. |
| `enlaces.tiktok` | Enlace de tu TikTok. Ya incluido desde el repositorio. |
| `enlaces.comunidadWhatsApp` | Enlace para unirse al grupo de WhatsApp de la comunidad. |
| `whatsapp` | Número con código de país. Incluido: `51941576020`. |
| `mensajeReserva` | Texto que aparece al abrir WhatsApp para reservar. |
| `introduccion.video` | Ruta opcional a un video propio del local o comida. |

Ejemplo para la carta de bebidas sin alcohol:

```js
cartaBebidasSinAlcohol: 'https://tu-web.com/carta-sin-alcohol.pdf',
```

También puedes colocar un PDF dentro de `cartas/` y usar una ruta relativa:

```js
cartaBebidasSinAlcohol: './cartas/bebidas-sin-alcohol.pdf',
```

No borres comas ni comillas. Guarda y recarga la página. Si un enlace de carta está vacío,
se muestra un aviso con un botón para consultar esa carta por WhatsApp.
Los enlaces de las cartas se abren en otra pestaña; Heyzine muestra el flipbook de forma normal y visual. Los enlaces temporales de ejemplo deben reemplazarse por los definitivos.

## Reservas

El botón «Reserva tu mesa» y el icono de WhatsApp abren una conversación al
+51 941 576 020 con el mensaje preparado. La persona debe enviarlo y el local confirmar
la disponibilidad; la web no crea ni confirma automáticamente una reserva.

## Comunidad WhatsApp

La tarjeta «Comunidad Canela» lleva al grupo de WhatsApp. Puedes cambiar el enlace en `config.js`, dentro de `enlaces.comunidadWhatsApp`.

## Introducción y video

La versión consultada de `antartida15l/canela-rooftop` no contiene MP4 ni WebM:
su introducción es una animación hecha con código. Esta web recrea ese recurso con
el logo, la aparición de CANELA, un sol y reflejos animados. No se incluye un video original inexistente.

Si luego tienes un video propio del local o comida:

1. Guárdalo en `assets/intro.mp4`.
2. Cambia `video: ''` por `video: './assets/intro.mp4'` en `config.js`.
3. Ajusta `duracionMs` en milisegundos si necesitas una entrada más larga.

El video se reproduce sin sonido para permitir el inicio automático. Si no carga,
queda visible la animación. Puedes desactivar toda la entrada con `activa: false`.

## Subir los archivos

Esta entrega es un ZIP; no modifica ni publica tu repositorio de GitHub.
Sube el contenido de la carpeta (con `index.html` en la raíz), no el ZIP cerrado.
El sitio puede alojarse en cualquier hosting estático.
Para un despliegue en Vercel usa el proyecto como sitio estático sin comando de compilación.
Si estás reemplazando el proyecto React anterior, no mezcles ambos proyectos:
usa una carpeta/repositorio nuevo o conserva primero una copia de la versión anterior.

## Archivos

- `index.html`: estructura y textos principales.
- `styles.css`: colores, diseño móvil, animaciones.
- `config.js`: enlaces, teléfono, horario, dirección e introducción.
- `app.js`: enlaces, aviso de carta pendiente, introducción y compartir.
- `assets/logo.png`: logo del repositorio de referencia.
- `assets/terraza.png`: imagen de ambiente creada para este diseño.
- `assets/favicon.svg`: icono de pestaña.
- `cartas/comida.pdf`: carta de comida del repositorio original.
- `vercel.json`: configuración opcional para Vercel.
- `CREDITOS.md`: procedencia de los recursos.

La imagen de la terraza es ilustrativa, no una fotografía documental del local.
No se incluyen rastreadores, cookies publicitarias, formularios con base de datos,
pagos ni dependencias externas necesarias para mostrar la página.

## Cartas en formato libro

Las cartas se abren a pantalla completa como un libro real: la hoja se curva y proyecta sombra al girar.
- Escritorio: libro abierto a dos páginas. Celular: una página.
- Arrastra una esquina o desliza con el dedo; también funcionan clic en la página y las flechas del teclado.
- El sonido de papel está siempre activo (se habilita con el toque que abre la carta).
- Solo quedan el botón **Descargar carta** y una × para volver a la web.
- Las páginas están en `cartas/comida/` y `cartas/cocktails/` (1400 px de ancho, renderizadas desde los PDF).
