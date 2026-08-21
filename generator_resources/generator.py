"""
Film Page Generator - GUI
Genera páginas HTML para tipodan.github.io desde una interfaz gráfica.

Uso:
    python3 generator.py
"""

import json
import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from unicodedata import normalize

# Paths relativos al directorio del script (generator_resources/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)


def slugify(text):
    """Genera un slug a partir del nombre de la película."""
    text = normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    text = text.strip("-")
    return text


def get_available_years():
    """Detecta los años disponibles en el proyecto (carpetas numéricas)."""
    years = []
    for entry in os.listdir(PROJECT_ROOT):
        if re.match(r"^20\d{2}$", entry):
            path = os.path.join(PROJECT_ROOT, entry)
            if os.path.isdir(path):
                years.append(entry)
    return sorted(years)


def load_movies(year):
    """Carga la lista de películas de un año desde su JSON."""
    json_path = os.path.join(SCRIPT_DIR, f"{year}_movies.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_movies(year, movies):
    """Guarda la lista de películas de un año en su JSON."""
    json_path = os.path.join(SCRIPT_DIR, f"{year}_movies.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)


def generate_bullet_list(movies, year):
    """Genera la lista HTML de enlaces de navegación."""
    bullet_list = ""
    for movie in movies:
        slug = movie["slug"]
        name = movie["name"]
        bullet = (
            f'\t\t\t\t\t\t<li><a class="nav-{slug}" '
            f'href="https://tipodan.github.io/{year}/{slug}" '
            f'title="{name}"><h1>{name}</h1></a></li>\n'
        )
        bullet_list += bullet
    return bullet_list


def generate_year_html(movies, year):
    """Genera la página de listado del año."""
    template_path = os.path.join(SCRIPT_DIR, f"{year}_template.html")
    if not os.path.exists(template_path):
        return False

    bullet_list = generate_bullet_list(movies, year)

    with open(template_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("%BULLET_LIST%", bullet_list)

    output_path = os.path.join(PROJECT_ROOT, f"{year}.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    return True


def generate_movies_html(movies, year):
    """Genera las páginas individuales de cada película."""
    template_path = os.path.join(SCRIPT_DIR, f"{year}_film_template.html")
    if not os.path.exists(template_path):
        return False

    bullet_list = generate_bullet_list(movies, year)

    with open(template_path, "r", encoding="utf-8") as f:
        film_template = f.read()

    year_dir = os.path.join(PROJECT_ROOT, year)
    os.makedirs(year_dir, exist_ok=True)

    for movie in movies:
        slug = movie["slug"]
        name = movie["name"]

        self_bullet = (
            f'<li><a class="nav-{slug}" '
            f'href="https://tipodan.github.io/{year}/{slug}" '
            f'title="{name}"><h1>{name}</h1></a></li>\n'
        )
        self_bullet_selected = (
            f'<li class="on"><a class="nav-{slug}" '
            f'href="https://tipodan.github.io/{year}/{slug}" '
            f'title="{name}"><h1>{name}</h1></a></li>\n'
        )
        bullet_list_selected = bullet_list.replace(self_bullet, self_bullet_selected)

        content = film_template.replace("%TITLE%", name)
        content = content.replace("%RESOURCE%", slug)
        content = content.replace("%BULLET_LIST%", bullet_list_selected)

        output_path = os.path.join(year_dir, f"{slug}.html")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)

    return True


def rebuild(year):
    """Regenera todas las páginas de un año."""
    movies = load_movies(year)
    if not movies:
        return False
    generate_year_html(movies, year)
    generate_movies_html(movies, year)
    return True


class GeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Film Page Generator")
        self.root.resizable(False, False)

        self.poster_path = None
        self.years = get_available_years()

        self._build_ui()
        self._center_window()

    def _center_window(self):
        self.root.update_idletasks()
        w = self.root.winfo_width()
        h = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f"+{x}+{y}")

    def _build_ui(self):
        frame = ttk.Frame(self.root, padding=20)
        frame.grid(sticky="nsew")

        # Año
        ttk.Label(frame, text="Año:").grid(row=0, column=0, sticky="w", pady=5)
        self.year_var = tk.StringVar(value=self.years[-1] if self.years else "2025")
        year_combo = ttk.Combobox(
            frame, textvariable=self.year_var, values=self.years,
            state="readonly", width=10
        )
        year_combo.grid(row=0, column=1, sticky="w", pady=5)

        # Nombre
        ttk.Label(frame, text="Nombre:").grid(row=1, column=0, sticky="w", pady=5)
        self.name_var = tk.StringVar()
        self.name_var.trace_add("write", self._on_name_change)
        name_entry = ttk.Entry(frame, textvariable=self.name_var, width=40)
        name_entry.grid(row=1, column=1, columnspan=2, sticky="ew", pady=5)

        # Slug
        ttk.Label(frame, text="Slug:").grid(row=2, column=0, sticky="w", pady=5)
        self.slug_var = tk.StringVar()
        slug_entry = ttk.Entry(frame, textvariable=self.slug_var, width=40)
        slug_entry.grid(row=2, column=1, columnspan=2, sticky="ew", pady=5)

        # Poster
        ttk.Label(frame, text="Poster:").grid(row=3, column=0, sticky="w", pady=5)
        self.poster_label = ttk.Label(frame, text="Ningún archivo seleccionado", foreground="gray")
        self.poster_label.grid(row=3, column=1, sticky="w", pady=5)
        ttk.Button(frame, text="Seleccionar...", command=self._select_poster).grid(
            row=3, column=2, sticky="e", pady=5, padx=(10, 0)
        )

        # Separador
        ttk.Separator(frame, orient="horizontal").grid(
            row=4, column=0, columnspan=3, sticky="ew", pady=15
        )

        # Botones
        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=5, column=0, columnspan=3, sticky="e")

        ttk.Button(btn_frame, text="Añadir", command=self._add_movie).pack(side="right", padx=(10, 0))
        ttk.Button(btn_frame, text="Cancelar", command=self.root.quit).pack(side="right")

    def _on_name_change(self, *args):
        """Auto-genera el slug cuando cambia el nombre."""
        name = self.name_var.get()
        self.slug_var.set(slugify(name))

    def _select_poster(self):
        """Abre diálogo para seleccionar imagen del poster."""
        filetypes = [
            ("Imágenes", "*.jpg *.jpeg *.png *.webp"),
            ("Todos los archivos", "*.*"),
        ]
        path = filedialog.askopenfilename(
            title="Seleccionar poster",
            filetypes=filetypes
        )
        if path:
            self.poster_path = path
            filename = os.path.basename(path)
            self.poster_label.config(text=filename, foreground="black")

    def _add_movie(self):
        """Valida, copia poster, actualiza JSON y regenera páginas."""
        name = self.name_var.get().strip()
        slug = self.slug_var.get().strip()
        year = self.year_var.get()

        # Validaciones
        if not name:
            messagebox.showerror("Error", "El nombre de la película es obligatorio.")
            return

        if not slug:
            messagebox.showerror("Error", "El slug no puede estar vacío.")
            return

        if not self.poster_path:
            messagebox.showerror("Error", "Debes seleccionar una imagen de poster.")
            return

        if not os.path.exists(self.poster_path):
            messagebox.showerror("Error", f"El archivo seleccionado no existe:\n{self.poster_path}")
            return

        # Comprobar duplicados
        movies = load_movies(year)
        if any(m["slug"] == slug for m in movies):
            messagebox.showerror("Error", f"Ya existe una película con slug '{slug}' en {year}.")
            return

        # Copiar poster con el nombre del slug
        resources_dir = os.path.join(PROJECT_ROOT, year, "resources")
        os.makedirs(resources_dir, exist_ok=True)

        _, ext = os.path.splitext(self.poster_path)
        if not ext:
            ext = ".jpg"
        dest_path = os.path.join(resources_dir, f"{slug}{ext}")
        shutil.copy2(self.poster_path, dest_path)

        # Actualizar JSON
        movies.append({"name": name, "slug": slug})
        save_movies(year, movies)

        # Regenerar páginas
        generate_year_html(movies, year)
        generate_movies_html(movies, year)

        messagebox.showinfo(
            "Éxito",
            f"'{name}' añadida a {year}.\n\n"
            f"Poster: {year}/resources/{slug}{ext}\n"
            f"Página: {year}/{slug}.html"
        )

        # Limpiar formulario
        self.name_var.set("")
        self.slug_var.set("")
        self.poster_path = None
        self.poster_label.config(text="Ningún archivo seleccionado", foreground="gray")


def main():
    root = tk.Tk()
    GeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
