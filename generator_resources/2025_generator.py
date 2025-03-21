import shutil
import os

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

def generate_bullet_list():
    bullet_list = ""
    for movie in movies:
        if not movie['specific_resource']:
            resource = movie['name'].replace(" ", "-").lower()
        else:
            resource = movie['specific_resource'].lower()
        
        movie['specific_resource'] = resource
        bullet = "\t\t\t\t\t\t<li><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
        bullet_list += bullet

    return bullet_list

def generate_year_html(movies):
    bullet_list = generate_bullet_list()

    # Open template and replace bullet list
    with open('2025_template.html', 'r') as file:
        year_template_content = file.read()

    year_template_content = year_template_content.replace("%BULLET_LIST%", bullet_list)

    # Save file
    with open("2025.html", "w") as f:
        f.write(year_template_content)

    # Move to destination
    if os.path.exists("../2025.html"):
        os.remove("../2025.html")
    shutil.move("2025.html", "../")

def generate_movies_html(movies):
    bullet_list = generate_bullet_list()
    
    # Open template
    with open('2025_film_template.html', 'r') as file:
        film_template_content = file.read()

    for movie in movies:
        self_bullet = "<li><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
        self_bullet_selected = "<li class=\"on\"><a class=\"nav-"+movie['specific_resource']+"\" href=\"https://tipodan.github.io/2025/"+movie['specific_resource']+"\" title=\""+ movie['name']+"\"><h1>"+ movie['name']+"</h1></a></li>\n"
        bullet_list_with_selected = bullet_list.replace(self_bullet, self_bullet_selected)

        # Doing the substitution in the template
        film_content = film_template_content.replace("%TITLE%", movie['name'])
        film_content = film_content.replace("%RESOURCE%", movie['specific_resource'])
        film_content = film_content.replace("%BULLET_LIST%", bullet_list_with_selected)
        
        # File generation
        with open(movie['specific_resource'] + ".html", "w") as f:
            f.write(film_content)

        # Move to destination
        if os.path.exists("../2025/"+movie['specific_resource'] + ".html"):
            os.remove("../2025/"+movie['specific_resource'] + ".html")
        shutil.move(movie['specific_resource'] + ".html", "../2025/")

generate_year_html(movies)
generate_movies_html(movies)