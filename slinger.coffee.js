App = {}
App.scrape_results = ''
App.members_length = 0
App.counter = 0
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
      App.members_length = members.length
      App.counter = 0
      linkedin_ids = members.map (x) ->
        members[x].getAttribute("id").split("-")[1]
      getProfile linkedin_id, response for linkedin_id in linkedin_ids

getNextPage = (response) ->
  next_page = $(response).find('.paginate').find('a').find('strong')
  new_next_page = next_page[1]
  new_next_page = next_page[0] unless next_page[1]  
  if (new_next_page == undefined || new_next_page.innerText.charCodeAt(0) == parseInt('171'))
    derp = new Blob([App.scrape_results],
      type: "text/plain"
    )
    a = document.createElement("a")
    a.href = window.URL.createObjectURL(derp)
    a.download = "results.html"
    a.textContent = "Download file!"
    document.body.appendChild a
  else
    new_url = 'http://www.linkedin.com/' + $(new_next_page).parent()[0].getAttribute('href')
    visitGroupPage(new_url)
        
      
      

visitCompanyPage = (url) ->
  console.log url


getProfile = (linkedin_id, memberpage) ->
  $.ajax
    type: "GET"
    url: "http://www.linkedin.com/profile/view?noScript=1&id=#{linkedin_id}"
    success: (response) ->
      logConsole(response, linkedin_id, memberpage)

logConsole = (response, linkedin_id, memberpage) ->
  member = $(response).find("#member-#{linkedin_id}")
  given_name = $(member).find('span.given-name')[0].innerText
  family_name = $(member).find('span.family-name')[0].innerText
  professional_title = $(member).find('p.title')[0].innerText
  profile_pic = ( $(response).find('#profile-picture').find('img').attr('src') || 'http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png')
  App.scrape_results = App.scrape_results + "<h2 id='profile-#{given_name}'> #{given_name} #{family_name} - #{professional_title}</h2>
  <a href='#{profile_pic}'><img src='#{profile_pic}'></a>
  <div id='positions-#{linkedin_id}'><h3>Positions:</h3>"
  positions = $(response).find('.position.experience')
  for position in positions
    title = $(position).find('strong.title').find('a')[0].innerText
    company = ( $(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0] ).innerText
    company_profile = $(position).find('company-profile')    
    // $(company_profile).hover ->
    //   mini_profile = $(this).find('.minipanel-content.company-miniprofile')[0]
    //   hq = $(mini_profile).find("abbr[title='Headquarters']").parent().parent().find('td').text()
    //   logo = $(mini_profile).find('#logo-large-img').attr('src')
    start =  ( $(position).find('.dtstart')[0] || 'undefined' ).innerText
    end = ( $(position).find('.dtstamp')[0] || $(position).find('.dtend')[0] || 'undefined').innerText
    App.scrape_results = App.scrape_results + "<p><b>#{title}</b> - <i>#{company}</i></p>
    <p><b>Start: </b> #{start}</p>
    <p><b>End: </b> #{end}</p>"
  App.scrape_results = App.scrape_results + "</div><h3>Skills:</h3><p>"
  skills = $(response).find('.endorse-item-name-text')
  for skill in skills
    App.scrape_results = App.scrape_results + "#{skill.innerText}, "
  App.scrape_results = App.scrape_results + "</p><h3>Education:</h3>"
  educations = $(response).find('.position.education')
  for education in educations
    title = $(education).find('h4.details-education')
    school = $(education).find('a.school-link')[0].innerText
    start = ( $(education).find('.dtstart')[0] || 'undefined').innerText
    end = ( $(education).find('.dtstamp')[0] || $(education).find('.dtend')[0] || 'undefined' ).innerText
    App.scrape_results = App.scrape_results + "<p><b>#{title[0].innerHTML}</b> - <i>#{school}</i></p>
    <p><b>Start: </b> #{start}</p>
    <p><b>End: </b> #{end}</p>"
  App.scrape_results = App.scrape_results + "</div>"
  getNextPage(memberpage) if ++App.counter is App.members_length