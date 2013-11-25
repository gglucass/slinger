Slinger's LinkedIn Scraper
=======

### Installation
  * Install Chrome Browser
  * navigate to chrome://extensions
  * Enable 'Developer mode'
  * Load the extension with the 'load unpacked extension' dialog

### Usage
  * Naviage to a LinkedIn Group
  * Press the scraper icon (currently hello world)
  * Wait....
  * All profiles should be uploaded to the server


The Code
-------
If you're gonna work with Chrome Extensions, I recommend to at least get a basic understanding of how they work by taking a look at [getting started with Chrome extensions](http://developer.chrome.com/extensions/getstarted.html).


The current codebase is fairly tightly coupled and handles errors ungracefully. However, big gains can be made here quite easily. In a nutshell the code does the following:

  1. Whenever a user presses the scraper button, a popup is launched which loads the slinger.js file.
  2. When the popup and JS are loaded, the script sends a message to background.js requesting it to authenticate with the home server to ensure it is allowed to send profiles. 
  3. When authenticated, the script checks whether the current tab is a group or company page and sends this info to initializeProfiles().
  4. initializeProfiles() builds the link that should contain the first profiles to be scraped for either a group or company and sends that link to visitGroupPage or visitCompanyPage.
  5. visitCompanyPage is non-functional for now. visitGroupPage GETs the link it receives, grabs the IDs of all LinkedIn members on that page and subsequently launches a getProfile() for each ID.
  6. getProfile sends a message to background.js containing a linkedin_id and member_number indicating which member this is on the list from 1-20. Next it checks whether member counter+1 is equal to the total number of members of the page (i.e. is it the last on the page). If so, the script waits 20 seconds and then gets the following page.
  7. When background.js receives a getProfile message, after a random wait of 1-20 seconds* handleProfile() is called with the linkedin_id.
  8. handleProfile() visits the profile page of the linkedin member, builds a scraped profile by collecting all relevant fields with JQuery and submits this to the home server.

\* (member_number * random[0..1] * 1) second so you get short bursts of visits and longer waits. Could probably be randomized in a smarter way. 
