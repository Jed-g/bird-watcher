# Bird Watcher™ - Intelligent Web Assignment
**Note: Application was developed (and tested) with Node.js v16.18 and NPM v8.19.2**

## Getting Started
1. Navigate to this directory
```
cd <path_to_directory>
```
2. Install all necessary packages
```
npm i
```
3. Set MongoDB connection URI as an environment variable in the **.env** file (or leave as is if you want to test with an example DB set up for demo purposes)
```
MONGODB_CONNECTION_URI=<MongoDB connection URI>
```

## Running the production server (you can use this one for testing)
4. In a terminal window, run:
```
npm start
```

## Running the development server
4. Open two terminal windows, in one run:
```
npm run dev
```
5. And in the other run:
```
npm run dev:css
```
The first command runs the server with **nodemon** (reloads the server upon any file changes) and the second runs a **TailwindCSS** compiler/tree-shaker (for style.css generation purposes and unused CSS code removal)

## Additional online deployment for testing & demo purposes
An additional demo deployment (hosted on render.com) has been provided for testing and is available here:  
[https://bird-watcher-7loo.onrender.com/](https://bird-watcher-7loo.onrender.com/)  
The app available under the above link could be slow at times due to a low-performance free tier being used.

## About the project
The project created is a bird sightseeing application which allows users to add sightings of bird and make comments on other posts.
- When first accessing the website, the user is prompted with a screen that asks them to pick a nickname (which is then stored in indexedDB for persistence). This acts a bit like a login, but without the password. This makes it so that when a user that has that same nickname accesses the website, they are able to edit their own posts. Posts made by a user are also highlighted on the two main pages: **Recent** and **Nearby**.
- When adding a bird sighting you can pick an identification for the bird or select "UNKNOWN" and add it later. You can also pick a date and time, description, picture and location for the sighting.
- On the home page, you can see all the sightings added, sorted by the date they were set to.
- You can also sort the sightings by distance, by pressing the "Nearby" button and selecting a location.
- When you click on the **DETAILS** button of a sighting, it takes you on a page where you can see further information on the particular sighting. On this page you can also chat to other users about it. Furthermore, if it is your post, you can edit the identification of the post.
- App is PWA-enabled and as such is multi-platform and can be installed on devices for native-like usability.
- All online features are available offline with a few exceptions mentioned in **Mobile usage** and **Desktop usage**.

## Submission and Assessment relevant information
- Code documentation has been provided through a combination of Swagger API documentation and inline comments. When running the server locally on **port 3000**, the API documentation is available under this url: [http://localhost:3000/api-docs/#/](http://localhost:3000/api-docs/#/). If running on a different port, first change **line 20** in **app.js** to reflect the different post number.
- Screenshots of the application in most use-cases/scenarios have been provided and are available in the **/screenshots** directory.
- This directory is a Git repository. GitHub was used as the online version control environment. The GitHub repository is available under this link: [https://github.com/Jed-g/intelligent-web-project](https://github.com/Jed-g/intelligent-web-project). For obvious reasons, the repository is private, for access please email: jgolebiewski1@sheffield.ac.uk

## Additional technical information
### Simulating new users during testing
Once set, a users nickname cannot be changed through normal application usage. Functionality for editing user nicknames was deemed unnecessary by one of the module leaders after consultation. To simulate new users, either:
- Open the app in a new incognito/private window to clear all site data (the simplest solution).
or:
- Clear all site data through browser settings or DevTools and reload the page.
or:
- Open browser DevTools and manually clear the **birdWatcher** indexedDB database, delete the **cache-1** cache in Cache Storage and unregister the service worker. Reload the page after these steps.

### Caching
The app caches all of the relevant files and resources/assets after initial service worker installation. Although all of the required assets for offline usability are cached during this process, if the service worker encounters new uncached files during fetch request interception, the server response is served to the user and additionally, the new uncached response is also cached.

The caching strategy is cache-only for resources/assets that will never change during app usage, while server API responses with all app data that can change are cached using a network-first strategy.

### Mobile usage
All features are available in a fully online setting.  
In an offline setting, some features are limited. There are two variants of an offline setting: no internet access and no server access (they usually occur simultaniously but are NOT equivalent from a technical point of view). Depending on the offline setting, the following features mentioned below will be limited, whilst all others will be equivalent to an online setting:

#### No access to the server (server connection from the front-end cannot be established)
- No real-time chat messages (but messages can still be sent and synchronised when online, whilst preserving chronological order with other messages)
- New bird sightings made by other users since last online app usage will not be visible until a server connection is established (at which point synchronisation will take place and new sightings will be cached with indexedDB for sighting details and cache API for image caching)

#### No internet access (access to the greater internet is completely disabled)
- Bird identification can only be marked as UNKNOWN, both when adding new bird sightings or editing existing ones (access to DBpedia requires internet access)
- Location can only be established by using the Geolocation API (choosing from map requires internet access)

### Desktop usage
Desktop usage is equivalent to mobile usage with the following exceptions:
- Using Geolocation API on desktops without an internet connection is quite difficult (due to location being usually established not through GPS, but based on the IP address and nearby Wi-Fi nodes, both of which are unavailable when fully offline). In this case, adding new posts or viewing the **nearby** page (both of which require setting user location either through the Geolocation API or by choosing from a map) could be unavailable. This feature limitation is fundamentally caused by external environment factors and could not be circumvented through clever code design.

### Other technical details
#### Synchronisation after coming back online
Whilst using the app, after being offline and coming back online, the app might not initially synchronise due to the unreliable nature of the **online** event of the Window brower interface. The event sometimes fires, but sometimes does not even when it should, and without a more advanced solution like polling the server at regular intervals for server availability information, this event remains one of the only sources for knowing when a user has come online.

Therefore, if after coming online the app doesn't synchronise/refresh, please refresh the webpage and the app will then automatically synchronise if it detects any offline changes made that are pending sending to the server. During the synchronisation process, the app will send all of the pending changes asynchronously for performance optimisation reasons.

#### Image/Photo storage solution
The urls to the relevant images for each bird sighting post are stored in the DB, however the images themselves are stored in the file system under the static **/public** directory. More advanced solutions like storing the images in the DB as BSONs or using a GridFS storage solution where considered. In particular, using GridFS would have been the best solution as it chunks the image data to circumvent MongoDB's 16MB max size limit and to improve performance (horizontal vs vertical scaling etc...).

However, the simpler image/photo storage and serving solution present in this app was deemed satisfactory and sufficient for the assignment by one of the module leaders. A limit of 100MB has been set on file size for individual images to support more high-resolution images.