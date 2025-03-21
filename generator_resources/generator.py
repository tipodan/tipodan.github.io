with open('2025_template.html', 'r') as file:
    template_content = file.read()

movies_old=["Rise of the Planet of the Apes", "Dawn of the Planet of the Apes", "Death on the Nile", "La sociedad de la Nieve", "War for the Planet of the Apes", "All quiet on the Western Front", 
        "Poor Things", "Dune: Part Two", "Marriage Story", "Into the Wild", "As Bestas", "Everything Everywhere All at Once", "Smoking Causes Coughing", "The Dead Don't Die", "Hannibal", "Anatomy of a Fall", "A Haunting in Venice",
          "The Gentlemen", "The Man from U.N.C.L.E.", "Que Dios nos Perdone", "Wrath of Man", "Spaceman"]
movies=["Sherlock Holmes"]

for movie in movies:
    resource = movie.replace(" ", "-")
    resource_lower = resource.lower()

    # Doing the substitution
    resultado1 = template_content.replace("%TITLE%", movie)
    resultado2 = resultado1.replace("%RESOURCE%", resource_lower)

    # File generation
    with open(resource_lower + ".html", "w") as f:
        f.write(resultado2)
