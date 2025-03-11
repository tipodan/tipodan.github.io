with open('2025_template.html', 'r') as file:
    template_content = file.read()

movies=["The Holdovers", "Veneciafrenia", "Anora", "The Killing of a Sacred Deer", "Tangerine", "Taxi Driver", "The Substance", "Red Rocket", "How To Have Sex", "Dream Scenario", "The Card Counter", "The King of Staten Island"]

for movie in movies:
    resource = movie.replace(" ", "-")
    resource_lower = resource.lower()

    # Doing the substitution
    resultado1 = template_content.replace("%TITLE%", movie)
    resultado2 = resultado1.replace("%RESOURCE%", resource_lower)

    # File generation
    with open(resource_lower + ".html", "w") as f:
        f.write(resultado2)
