document.addEventListener "DOMContentLoaded", ->
  chrome.tabs.query active: true, currentWindow: true, (tabs) ->
    type = undefined
    url = undefined
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
      linkedin_ids = members.map (x) ->
        members[x].getAttribute("id").split("-")[1]
      getProfile linkedin_id for linkedin_id in linkedin_ids
      next_page = $(response).find('.paginate').find('a').find('strong')
      new_next_page = next_page[1]
      new_next_page = next_page[0] unless next_page[1]
      if new_next_page.innerText.charCodeAt(0) != '171'
        new_url = 'http://www.linkedin.com/' + $(new_next_page).parent()[0].getAttribute('href')
        visitGroupPage(new_url)
      
      

visitCompanyPage = (url) ->
  console.log url


getProfile = (linkedin_id) ->
  $.ajax
    type: "GET"
    url: "http://www.linkedin.com/profile/view?noScript=1&id=#{linkedin_id}"
    success: (response) ->
      logConsole(response, linkedin_id)

logConsole = (response, linkedin_id) ->
  member = $(response).find("#member-#{linkedin_id}")
  given_name = $(member).find('span.given-name')[0].innerText;
  family_name = $(member).find('span.family-name')[0].innerText;
  professional_title = $(member).find('p.title')[0].innerText;
  $('#profiles').append "<h2 id='profile-#{given_name}'> #{given_name} #{family_name} - #{professional_title}</h2><div id='positions-#{linkedin_id}'><h3>Positions:</h3></div>"
  positions = $(response).find('.position')
  for position in positions
    title = $(position).find('strong.title').find('a')[0].innerText
    company = ( $(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0] ).innerText
    $("#positions-#{linkedin_id}").append "<p><b>#{title}</b> - <i>#{company}</i></p>"

    document.body.match(/\bprofile\b,\bview?id=\b/)