# How to run the project:
* run **"npm i"**
* create a .env file with your database connection url
* run **"npm run dev"** & **"npm run dev:css"** in separate terminals 
  * to run these commands you will need nodemon and postcss which you can either install globally with **"npm i -g <package_name>"** or as dev dependecies with **"npm i -D <package_name>"**
  
# About the project:
The project created is a bird sightseeing website which allows users to add sightings of bird and make comments on other posts.
* When first accessing the website, the user is prompted with a screen that asks them to pick a nickname. This acts a bit like a login, but without the password. This makes it so that when a user that has that same nickname accesses the website, they are able to edit their own posts.
* When adding a bird sighting you can pick an identification for the bird or select "UNKNOWN" and add it latest. You can also pick a date and time, description, picture and location for the sighting.
* On the home page, you can see all the sightings added, sorted by the date they were set to.
* You can also sort the sightings by distance, by pressing the "Nearby" button and selecting a location.
* When you click on the "Details" button of a sighting, it takes you on a page where you can see further information on the particular sighting as well as chat to other users about it. Furthermore, if it is  your post, you can edit the identification of the post.