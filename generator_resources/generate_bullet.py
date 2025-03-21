movies_old=["Rise of the Planet of the Apes", "Dawn of the Planet of the Apes", "Death on the Nile", "La sociedad de la Nieve", "War for the Planet of the Apes", "All quiet on the Western Front", 
        "Poor Things", "Dune: Part Two", "Marriage Story", "Into the Wild", "As Bestas", "Everything Everywhere All at Once", "Smoking Causes Coughing", "The Dead Don't Die", "Hannibal", "Anatomy of a Fall", "A Haunting in Venice",
          "The Gentlemen", "The Man from U.N.C.L.E.", "Que Dios nos Perdone", "Wrath of Man", "Spaceman"]
movies=["Sherlock Holmes"]

for movie in movies:
    resource = movie.replace(" ", "-")
    resource_lower = resource.lower()

    bullet = "<li><a class=\"nav-"+resource_lower+"\" href=\"https://tipodan.github.io/2025/"+resource_lower+"\" title=\""+movie+"\"><h1>"+movie+"</h1></a></li>"

    print(bullet)


