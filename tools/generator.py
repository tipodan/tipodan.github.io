"""
Film Page Generator - GUI (SPA version)
Adds movies to data/movies.json and copies poster images.

No HTML generation needed — the SPA reads JSON directly.

Usage:
    python3 generator.py
"""

import json
import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from unicodedata import normalize

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MOVIES_JSON = os.path.join(PROJECT_ROOT, "data", "movies.json")


def slugify(text):
    """Generate a URL slug from a movie name."""
    text = normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    text = text.strip("-")
    return text


def load_movies():
    """Load the movies data file."""
    if os.path.exists(MOVIES_JSON):
        with open(MOVIES_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_movies(movies):
    """Save the movies data file."""
    with open(MOVIES_JSON, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)


def get_available_years(movies):
    """Get sorted list of years from movie data."""
    years = sorted(set(str(m["year"]) for m in movies))
    return years if years else [str(os.path.basename(os.getcwd())[:4]) or "2025"]


class GeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Film Page Generator")
        self.root.resizable(False, False)

        self.poster_path = None
        self.movies = load_movies()
        self.years = get_available_years(self.movies)

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

        # Year
        ttk.Label(frame, text="Año:").grid(row=0, column=0, sticky="w", pady=5)
        self.year_var = tk.StringVar(value=self.years[-1] if self.years else "2025")
        year_combo = ttk.Combobox(
            frame, textvariable=self.year_var, values=self.years,
            width=10
        )
        year_combo.grid(row=0, column=1, sticky="w", pady=5)

        # Name
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

        # Separator
        ttk.Separator(frame, orient="horizontal").grid(
            row=4, column=0, columnspan=3, sticky="ew", pady=15
        )

        # Buttons
        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=5, column=0, columnspan=3, sticky="e")
        ttk.Button(btn_frame, text="Añadir", command=self._add_movie).pack(side="right", padx=(10, 0))
        ttk.Button(btn_frame, text="Cancelar", command=self.root.quit).pack(side="right")

    def _on_name_change(self, *args):
        name = self.name_var.get()
        self.slug_var.set(slugify(name))

    def _select_poster(self):
        filetypes = [
            ("Imágenes", "*.jpg *.jpeg *.png *.webp"),
            ("Todos los archivos", "*.*"),
        ]
        path = filedialog.askopenfilename(title="Seleccionar poster", filetypes=filetypes)
        if path:
            self.poster_path = path
            self.poster_label.config(text=os.path.basename(path), foreground="black")

    def _add_movie(self):
        name = self.name_var.get().strip()
        slug = self.slug_var.get().strip()
        year = self.year_var.get().strip()

        if not name:
            messagebox.showerror("Error", "El nombre de la película es obligatorio.")
            return
        if not slug:
            messagebox.showerror("Error", "El slug no puede estar vacío.")
            return
        if not year or not year.isdigit():
            messagebox.showerror("Error", "El año debe ser numérico.")
            return
        if not self.poster_path or not os.path.exists(self.poster_path):
            messagebox.showerror("Error", "Debes seleccionar una imagen de poster válida.")
            return

        year_int = int(year)

        # Check duplicates
        if any(m["slug"] == slug and m["year"] == year_int for m in self.movies):
            messagebox.showerror("Error", f"Ya existe una película con slug '{slug}' en {year}.")
            return

        # Copy poster
        images_dir = os.path.join(PROJECT_ROOT, "assets", "images", "movies", year)
        os.makedirs(images_dir, exist_ok=True)
        _, ext = os.path.splitext(self.poster_path)
        if not ext:
            ext = ".jpg"
        dest_path = os.path.join(images_dir, f"{slug}{ext}")
        shutil.copy2(self.poster_path, dest_path)

        # Update JSON
        self.movies.append({"year": year_int, "name": name, "slug": slug})
        save_movies(self.movies)

        messagebox.showinfo(
            "Éxito",
            f"'{name}' añadida a {year}.\n\n"
            f"Poster: assets/images/movies/{year}/{slug}{ext}\n"
            f"No se necesita regenerar HTML — el SPA lee el JSON directamente."
        )

        # Clear form
        self.name_var.set("")
        self.slug_var.set("")
        self.poster_path = None
        self.poster_label.config(text="Ningún archivo seleccionado", foreground="gray")

        # Update years combo if new year
        self.years = get_available_years(self.movies)


def main():
    root = tk.Tk()
    GeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
