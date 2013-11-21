App = {}
App.members_length = 0
App.counter = 0
document.addEventListener "DOMContentLoaded", ->
  data = new Object
  data.client_secret = "67cddae206859d9bf7c0fedec018cb6a04d794b8"
  data.username = "scraper"
  data.grant_type = "password"
  data.password = "e09#6gEeD$8r"
  data.client_id = "43c02fa55c34579e74fd"
  data.kind = "getAccessToken"
  chrome.runtime.sendMessage data, (response) ->
    chrome.tabs.query active: true, currentWindow: true, (tabs) ->      
      url = tabs[0].url
      type = "company"  if url.match(/\bcompany\b/)
      type = "group"  if url.match(/\groups\b/)
      initializeProfiles type, url
    
  

initializeProfiles = (type, url) ->  
  switch type
    when "group"
      new_url = 'http://www.linkedin.com/groups?viewMembers=&gid=' + url.split('gid=')[1].split('&')[0];
      visitGroupPage(new_url)
    when "company"
      new_url = 'http://www.linkedin.com/vsearch/p?trk=rr_connectedness&f_CC=' + url.split('company/')[1].split('?')[0]
      visitCompanyPage(new_url)

visitGroupPage = (url) ->
  $.ajax
    type: "GET"
    url: url
    success: (response) ->
      members = $(response).find('#content').find('.member')      
      App.members_length = members.length
      App.counter = 0
      linkedin_ids = members.map (x) ->
        members[x].getAttribute("id").split("-")[1]
      getProfile linkedin_id, response for linkedin_id in linkedin_ids

visitCompanyPage = (url) ->
  console.log url


getProfile = (linkedin_id, memberpage) ->
  chrome.runtime.sendMessage
    kind: "getProfile"
    linkedin_id: linkedin_id
    memberpage: memberpage
    member_number: App.counter
  , (response) ->
    console.log response

  if ++App.counter is App.members_length
    console.log "we zijn al hier!"
    setTimeout (->
      getNextPage memberpage
    ), 20000


getNextPage = (response) ->
  next_page = $(response).find('.paginate').find('a').find('strong')
  new_next_page = next_page[1]
  new_next_page = next_page[0] unless next_page[1]  
  if (new_next_page == undefined || new_next_page.innerText.charCodeAt(0) == parseInt('171'))
  else
    new_url = 'http://www.linkedin.com/' + $(new_next_page).parent()[0].getAttribute('href')
    visitGroupPage(new_url)