# Definimos el template y las palabras a sustituir
with open('2025_template.html', 'r') as file:
    template_content = file.read()

movies=["The Holdovers", "Veneciafrenia", "Anora", "The Killing of a Sacred Deer", "Tangerine", "Taxi Driver", "The Substance", "Red Rocket", "How To Have Sex", "Dream Scenario", "The Card Counter", "The King of Staten Island"]

for movie in movies:
    resource = movie.replace(" ", "-")
    resource_lower = resource.lower()
    sustituciones = {
        "%TITLE%": movie,
        "%RESOURCE%": resource_lower
    }

    # Realizamos la sustitución
    resultado1 = template_content.replace("%TITLE%", movie)
    resultado2 = resultado1.replace("%RESOURCE%", resource_lower)

    # Generamos el fichero
    with open(resource_lower + ".html", "w") as f:
        f.write(resultado2)
