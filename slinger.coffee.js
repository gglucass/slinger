initializeProfiles = ->
  ["3451256", "82430194"]

scrapeProfiles = ->
  getProfile linkedin_id for linkedin_id in initializeProfiles()


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
    
document.addEventListener "DOMContentLoaded", ->
  scrapeProfiles()  