<p align="center">
  <a href="https://www.unfantasmaenelsistema.com/" target="_blank" rel="noopener noreferrer">
    <img src="icono.png" alt="Un Fantasma en el Sistema" width="120" height="120" />
  </a>
</p>

<h1 align="center">Hardening Checklist</h1>

<p align="center">
  <strong>80 medidas de bastionado para Windows y Linux, cada una con su comando o configuración.</strong><br>
  Marca lo que ya has aplicado, filtra por criticidad y exporta el estado a TXT, HTML o PDF. ES/EN y tema claro/oscuro.
</p>

<p align="center">
  <a href="https://unfantasmaenelsistema.github.io/Hardening-Checklist/"><strong>▶ Abrir la checklist</strong></a>
  ·
  <a href="https://www.unfantasmaenelsistema.com/">Un Fantasma en el Sistema</a>
</p>

---

## 🧱 Qué cubre

| Bloque | Windows | Linux |
| :-- | :-: | :-: |
| Usuarios y autenticación | 7 | 8 |
| Red y firewall | 7 | 6 |
| Auditoría y logs | 5 | 5 |
| Cifrado y certificados | 4 | 4 |
| Servicios y aplicaciones | 6 | 7 |
| Actualizaciones y parches | 3 | 3 |
| Antivirus / EDR | 4 | 3 |
| Políticas de contraseñas | 4 | 4 |

Cada medida tiene criticidad (alta, media, baja), una explicación y el comando o la configuración para aplicarla, con un botón para copiarlo.

## ⚠️ Antes de aplicar nada

Prueba cada cambio en un equipo de pruebas y ten un acceso alternativo (consola física, KVM, consola del proveedor). Medidas como el firewall con política de denegar por defecto, el SSH solo con clave o el bloqueo de cuentas pueden dejarte sin acceso remoto si se aplican en mal orden. Los comandos de Windows usan SID y GUID en lugar de nombres traducidos para que funcionen también en Windows en español.

## ✨ Funciones

- **Progreso guardado** en el navegador por sistema operativo.
- **Filtros** por sistema y criticidad, y **búsqueda** en títulos, descripciones y comandos.
- **Exportación** del estado actual: TXT (con los comandos), HTML autónomo (abre igual en cualquier equipo) y PDF.
- Interfaz en **español e inglés** y **tema claro/oscuro**.

## 🚀 Uso local

Es una página estática: abre `index.html` o sírvela con cualquier servidor.

```bash
python -m http.server 8000
```

Pruebas de las medidas (Node 20+):

```bash
node --test tests/data.test.js
```

## 📁 Estructura

```text
├── index.html      # Estructura de la página
├── styles.css      # Estilos (tema oscuro y claro)
├── data.js         # Las 80 medidas en ES/EN, filtros y progreso (también para Node)
├── app.js          # Interfaz, exportaciones, idioma y tema
├── icono.png       # Logo de Un Fantasma en el Sistema
└── tests/          # Pruebas de las medidas
```

## 📄 Licencia

[MIT](LICENSE) · Creado por [Un Fantasma en el Sistema](https://www.unfantasmaenelsistema.com/).
