movies=["The Holdovers", "Veneciafrenia", "Anora", "The Killing of a Sacred Deer", "Tangerine", "Taxi Driver", "The Substance", "Red Rocket", "How To Have Sex", "Dream Scenario", "The Card Counter", "The King of Staten Island"]

for movie in movies:
    resource = movie.replace(" ", "-")
    resource_lower = resource.lower()

    bullet = "<li><a class=\"nav-"+resource_lower+"\" href=\"https://tipodan.github.io/2025/"+resource_lower+"\" title=\""+movie+"\"><h1>"+movie+"</h1></a></li>"

    print(bullet)
