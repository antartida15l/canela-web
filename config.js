/* EDITA TUS ENLACES AQUÍ. Mantén las comillas y las comas.
   Puedes usar una URL https://... o un archivo local: ./cartas/mi-carta.pdf
   No necesitas instalar nada ni compilar el proyecto. */
window.CANELA_CONFIG = {
  nombre: 'Canela River Rooftop',
  frase: 'Sabores para compartir y atardeceres inolvidables.',
  horario: 'Lunes a sábado · 3:00–9:00 p. m.',
  direccion: 'Calle García Calderón 408-A, esquina con Av. La Marina, Vallecito, Arequipa',

  // Número internacional, sin +, espacios ni guiones.
  whatsapp: '51941576020',
  mensajeReserva: 'Hola, Canela. Quisiera consultar disponibilidad para una reserva de mesa.',

  enlaces: {
    ubicacion: 'https://www.google.com/maps/search/?api=1&query=Canela+River+Rooftop+Garcia+Calderon+408+Arequipa',
    cartaBebidasSinAlcohol: './cartas/cocktails.pdf', // PDF original de cocktails.
    cartaComida: './cartas/comida.pdf', // PDF original de comida.
    instagram: 'https://www.instagram.com/canelarooftop_aqp/',
    tiktok: 'https://www.tiktok.com/@canelarooftop_aqp',
    comunidadWhatsApp: 'https://chat.whatsapp.com/JtdIFxBpw8TH2sWdvBwW9k?s=sw&p=a&iam=2'
  },

  introduccion: {
    activa: true,
    duracionMs: 4600,
    // Opcional: añade tu video del local/comida a assets y escribe su ruta.
    // Si está vacío, se muestra la introducción animada incluida.
    video: ''
  }
};
