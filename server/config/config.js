process.env.PORT = process.env.PORT || 3000;


// vencimiento del token 60*60 es igual a una hora, se puede cambiar
process.env.CADUCIDAD_TOKEN = '48h';

// semilla de autenticacion

process.env.SEED = process.env.SEED || 'semilla';

// estas dos variables anteriores son variables globales que las tengo que definir en mi servidor cuando este la pagina en produccion


// client id para autenticacion con google

process.env.CLIENT_ID = process.env.CLIENT_ID || '378657558154-akllgo7g3i6h2uv6flgqkb73icjcapog.apps.googleusercontent.com';