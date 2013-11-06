App = {}
App.members_length = 0
App.counter = 0
App.access_token = ''
document.addEventListener "DOMContentLoaded", ->
  console.log('hoi');
  data = new Object;
  data.client_secret = '67cddae206859d9bf7c0fedec018cb6a04d794b8';
  data.username = 'scraper';
  data.grant_type = 'password';
  data.password = 'e09#6gEeD$8r';
  data.client_id = '43c02fa55c34579e74fd';  
  chrome.runtime.sendMessage data, (response) ->
    App.access_token = response.access_token
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
  linkedin_profile = new Object
  linkedin_profile.experience = []
  linkedin_profile.education = []
  given_name = $(member).find('span.given-name')[0].innerText
  family_name = $(member).find('span.family-name')[0].innerText
  linkedin_profile.name = given_name + ' ' + family_name


  linkedin_profile.professional_title = $.trim($(member).find('p.title')[0].innerText)
  linkedin_profile.photo_url = ( $(response).find('#profile-picture').find('img').attr('src') || 'http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png')  
  linkedin_profile.connections = $(response).find('.member-connections').children().find('a').text().replace(/\+$/, '');
  linkedin_profile.linkedin_id = linkedin_id;
  positions = $(response).find('.position.experience')
  for position in positions
    experience_position = new Object
    experience_position.title = ($(position).find('strong.title').find('a')[0] || 'undefined').innerText
    experience_position.company = ( $(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0] || 'undefined' ).innerText
    // company_profile = $(position).find('.company-profile')    
    $(company_profile).hover ->
      mini_profile = $(this).find('.minipanel-content.company-miniprofile')[0]
      hq = $(mini_profile).find("abbr[title='Headquarters']").parent().parent().find('td').text()
      logo = $(mini_profile).find('#logo-large-img').attr('src')
    $(company_profile).hover()
    experience_position.start = ( $(position).find('.dtstart')[0] || 'undefined' ).innerText
    experience_position.end = ( $(position).find('.dtstamp')[0] || $(position).find('.dtend')[0] || 'undefined').innerText
    linkedin_profile.experience.push(experience_position)
  skills = $(response).find('.endorse-item-name-text')
  // for skill in skills
    // App.scrape_results = App.scrape_results + "#{skill.innerText}, "  
  educations = $(response).find('.position.education')
  for education in educations
    degree = new Object 
    degree.title = ($(education).find('h4.details-education').find('.degree') || 'undefined').innerText
    degree.major = ( $(education).find('h4.details-education').find('.major') || 'undefined').innerText
    degree.institution = ($(education).find('a.school-link')[0] || 'undefined' ).innerText
    start = ( $(education).find('.dtstart')[0] || 'undefined').innerText
    end = ( $(education).find('.dtstamp')[0] || $(education).find('.dtend')[0] || 'undefined' ).innerText    
    linkedin_profile.education.push(degree)
  linkedin_profile.access_token = App.access_token
  chrome.runtime.sendMessage linkedin_profile, (response) ->
    alert response.farewell

  getNextPage(memberpage) if ++App.counter is App.members_length