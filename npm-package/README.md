
# @rasterex-viewer

Static Rasterex 3D/CAD viewer packaged as an npm module with a built-in Node server.  
This viewer connects to our **test server** at [https://test.rasterex.com](https://test.rasterex.com).

---

## Installation

```bash
npm install rasterex-viewer-1.0.0.tgz

```

---

## Running the viewer

From the package folder:

```bash
npx rasterex-viewer
```

By default, the server runs on **port 3000**. Open your browser at:

[http://localhost:3000](http://localhost:3000)

---

### Optional CLI flags (future enhancements)

- `--port <port>` — Run the server on a custom port  
- `--file <path>` — Open a specific CAD/3D file automatically

---

### Supported file types

- DWG, DXF, and other CAD drawings  
- 3D models (e.g., glTF)  
- Plotter files, PDFs, and other supported formats

---

### Notes

- This is a static Angular front-end served via Node.js.  
- For production use, you may host your own server or configure a custom backend.


