import shutil
import os

with open('2025_template.html', 'r') as file:
    year_template_content = file.read()

with open('2025_film_template.html', 'r') as file:
    film_template_content = file.read()

movies = [
    {"name": "Coherence", "specific_resource": ""},
    {"name": "Annie Hall", "specific_resource": ""},
    {"name": "Fallen Leaves", "specific_resource": ""},
    {"name": "The Holdovers", "specific_resource": ""},
    {"name": "Veneciafrenia", "specific_resource": ""},
    {"name": "Anora", "specific_resource": ""},
    {"name": "The Killing of a Sacred Deer", "specific_resource": ""},
    {"name": "Tangerine", "specific_resource": ""},
    {"name": "Taxi Driver", "specific_resource": ""},
    {"name": "The Substance", "specific_resource": ""},
    {"name": "The Favourite", "specific_resource": ""},
    {"name": "Red Rocket", "specific_resource": ""},
    {"name": "The Lobster", "specific_resource": ""},
    {"name": "How To Have Sex", "specific_resource": ""},
    {"name": "Dream Scenario", "specific_resource": ""},
    {"name": "The Card Counter", "specific_resource": ""},
    {"name": "The King of Staten Island", "specific_resource": ""},
    {"name": "Dogtooth", "specific_resource": ""},
    {"name": "Kinds of Kindness", "specific_resource": ""},
    {"name": "Sherlock Holmes", "specific_resource": ""}
]

bullet_list = ""

for movie in movies:
    if(movie['specific_resource'] == ""):
        resource = movie['name'].replace(" ", "-") 
    else:
        resource = movie['specific_resource']

    movie['specific_resource'] = resource.lower()

    bullet = "\t\t\t\t\t\t<li><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
    bullet_list = bullet_list + bullet

year_template_content = year_template_content.replace("%BULLET_LIST%", bullet_list)
with open("2025.html", "w") as f:
    f.write(year_template_content)

# Remove destination file if it exists
if os.path.exists("../2025.html"):
   os.remove("../2025.html")
shutil.move("2025.html", "../")

for movie in movies:
    self_bullet = "<li><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
    self_bullet_selected = "<li class=\"on\"><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
    bullet_list_with_selected = bullet_list.replace(self_bullet, self_bullet_selected)

    # Doing the substitution
    film_content = film_template_content.replace("%TITLE%", movie['name'])
    film_content = film_content.replace("%RESOURCE%", movie['specific_resource'])
    film_content = film_content.replace("%BULLET_LIST%", bullet_list_with_selected)
    
    # File generation
    with open(movie['specific_resource'] + ".html", "w") as f:
        f.write(film_content)
        f.close

    if os.path.exists("../2025/"+movie['specific_resource'] + ".html"):
        os.remove("../2025/"+movie['specific_resource'] + ".html")
    shutil.move(movie['specific_resource'] + ".html", "../2025/")



    # Doing the substitution
    #resultado1 = year_template_content.replace("%TITLE%", movie)
    #resultado2 = resultado1.replace("%RESOURCE%", resource_lower)

# 2025 File generation
#with open("2025.html", "w") as f:
#    f.write(year_template_content)
