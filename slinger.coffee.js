
initializeProfiles = ->
  ['http://www.linkedin.com/profile/view?id=3451256', 'http://www.linkedin.com/profile/view?id=82430194']


scrape_profiles = ->
  initializeProfiles()


$(document).ready           scrape_profiles
$(document).on 'page:load', scrape_profiles