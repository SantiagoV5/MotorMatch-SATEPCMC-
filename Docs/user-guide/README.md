# Guia de usuario

[Volver al indice](../README.md)

Esta guia esta escrita para usuarios finales de MotorMatch.

## Registro

1. Entra a la aplicacion.
2. Abre la pantalla de registro.
3. Escribe nombre, correo y contrasena.
4. Revisa tu correo para verificar la cuenta.
5. Si no llega el correo, usa la opcion de reenviar verificacion.

Placeholder:

```text
docs/assets/screenshots/auth-register.png
```

## Login

1. Abre la pantalla de login.
2. Ingresa correo y contrasena.
3. Si olvidaste la contrasena, usa recuperacion de contrasena.
4. Si el sistema indica que falta verificar correo, completa la verificacion primero.

Placeholder:

```text
docs/assets/screenshots/auth-login.png
```

## Buscar motos

1. Entra al Home o catalogo.
2. Explora las motos disponibles.
3. Usa el buscador para encontrar por marca, modelo o descripcion.
4. Abre una moto para ver su detalle tecnico.

Placeholder:

```text
docs/assets/screenshots/home-catalog.png
```

## Filtros

Filtros disponibles desde la API y usados por el frontend:

- Marca.
- Precio minimo y maximo.
- Cilindraje minimo y maximo.
- Busqueda por texto.

Consejo:

- Para ciudad, revisa motos de bajo o mediano cilindraje.
- Para carretera, compara cilindrajes mayores y comodidad.

Placeholder:

```text
docs/assets/screenshots/filters.png
```

## Detalle de moto

En la vista de detalle puedes revisar:

- Marca y modelo.
- Ano.
- Cilindraje.
- Precio.
- Altura del asiento.
- Peso.
- Consumo.
- Imagenes.
- Ventajas y desventajas si existen en la base de datos.
- Resenas de usuarios.

Placeholder:

```text
docs/assets/screenshots/motorcycle-detail.png
```

## Cuestionario de recomendacion

1. Abre la seccion de cuestionario.
2. Ingresa tu presupuesto.
3. Indica si el presupuesto incluye SOAT o matricula.
4. Selecciona el tipo de uso: ciudad, carretera, mixto, offroad, trabajo o deporte.
5. Completa datos fisicos como estatura y peso.
6. Indica si te sientes comodo con motos pesadas.
7. Envia el cuestionario.

MotorMatch generara recomendaciones con puntaje de compatibilidad.

Placeholders:

```text
docs/assets/screenshots/questionnaire-step-1.png
docs/assets/screenshots/questionnaire-step-2.png
docs/assets/screenshots/questionnaire-step-3.png
```

## Recomendaciones

La pantalla de recomendaciones muestra:

- Moto recomendada.
- Puntaje de compatibilidad.
- Razones de recomendacion.
- Advertencias si aplica.

El puntaje se calcula con presupuesto, estatura, peso/comodidad, uso y marcas preferidas.

Placeholder:

```text
docs/assets/screenshots/recommendations.png
```

## Comparacion

1. Selecciona 2 o 3 motos.
2. Abre la vista de comparacion.
3. Revisa diferencias tecnicas y economicas.
4. Guarda la comparacion.
5. Consulta el historial desde la pagina de historial de comparaciones.

Placeholder:

```text
docs/assets/screenshots/comparison.png
```

## Favoritos

1. Desde el catalogo o detalle, marca una moto como favorita.
2. Entra a Favoritos para ver la lista.
3. Puedes quitar una moto de favoritos cuando ya no te interese.

Placeholder:

```text
docs/assets/screenshots/favorites.png
```

## Alertas de precio

1. Abre una moto o la seccion de alertas.
2. Define un precio objetivo.
3. Elige el tipo de notificacion: email, in-app o ambas.
4. Guarda la alerta.
5. Puedes pausar, reactivar o eliminar la alerta.

Reglas:

- Maximo 10 alertas activas por usuario.
- No puedes tener dos alertas activas o pausadas para la misma moto.
- El sistema evita reenviar la misma alerta antes de 48 horas.

Placeholder:

```text
docs/assets/screenshots/price-alerts.png
```

## Historial

MotorMatch tiene varios historiales:

- Historial de comparaciones.
- Historial de simulaciones de costos.
- Historial de notificaciones de alertas de precio.

Usa estos historiales para retomar decisiones previas y comparar oportunidades.

Placeholders:

```text
docs/assets/screenshots/comparison-history.png
docs/assets/screenshots/simulations-history.png
docs/assets/screenshots/notification-history.png
```

## Perfil

En Perfil puedes actualizar:

- Nombre completo.
- Telefono.
- Ciudad.
- Estatura.
- Marcas preferidas.
- Kilometraje mensual.

Estos datos ayudan a personalizar recomendaciones y simulaciones.

Placeholder:

```text
docs/assets/screenshots/profile.png
```

## Soporte

Si necesitas ayuda:

1. Abre la pagina de soporte.
2. Ingresa nombre, correo y mensaje.
3. Envia el formulario.

Placeholder:

```text
docs/assets/screenshots/support.png
```


