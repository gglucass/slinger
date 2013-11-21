var App, getAccessToken, handleProfile;

App = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.kind) {
    case "getAccessToken":
      $.ajax({
        type: "POST",
        url: "https://78.47.41.184:8082/oauth2/access_token/",
        data: $.param(request),
        success: function(response) {
          App.access_token = response.access_token;
          return sendResponse({
            access_token: response.access_token
          });
        }
      });
      break;
    case "getProfile":
      setTimeout((function() {
        handleProfile(request.linkedin_id, request.memberpage);
        return sendResponse({
          derp: "achja!"
        });
      }), Math.random() * request.member_number * 1000);
  }
  return true;
});

getAccessToken = function(request_details) {
  return $.ajax({
    type: "POST",
    url: "https://78.47.41.184:8082/oauth2/access_token/",
    data: $.param(request_details),
    success: function(response) {
      return sendResponse({
        access_token: response.access_token
      });
    }
  });
};

handleProfile = function(linkedin_id, memberpage) {
  return $.ajax({
    type: "GET",
    url: "http://www.linkedin.com/profile/view?noScript=1&id=" + linkedin_id,
    success: function(response) {
      var degree, education, educations, end, experience_position, family_name, given_name, linkedin_profile, member, position, positions, skills, start, _i, _j, _len, _len1;
      member = $(response).find("#member-" + linkedin_id);
      linkedin_profile = new Object;
      linkedin_profile.experience = [];
      linkedin_profile.education = [];
      given_name = $(member).find('span.given-name')[0].innerText;
      family_name = $(member).find('span.family-name')[0].innerText;
      linkedin_profile.name = given_name + ' ' + family_name;
      linkedin_profile.professional_title = $.trim($(member).find('p.title')[0].innerText);
      linkedin_profile.photo_url = $(response).find('#profile-picture').find('img').attr('src') || 'http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png';
      linkedin_profile.connections = $(response).find('.member-connections').children()[0].innerText.replace(/\+$/, '').trim();
      linkedin_profile.linkedin_id = linkedin_id;
      positions = $(response).find('.position.experience');
      for (_i = 0, _len = positions.length; _i < _len; _i++) {
        position = positions[_i];
        experience_position = new Object;
        experience_position.title = ($(position).find('strong.title').find('a')[0] || 'unavailable').innerText;
        experience_position.company = ($(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0] || 'unavailable').innerText;
        start = $(position).find('.dtstart').attr('title') || '1001-01-01';
        start = start + (start.length === 4 ? '-01-01' : '');
        end = $(position).find('.dtstamp').attr('title') || $(position).find('.dtend').attr('title') || start;
        end = end + (end.length === 4 ? '-01-01' : '');
        experience_position.end = end;
        experience_position.start = start;
        linkedin_profile.experience.push(experience_position);
      }
      skills = $(response).find('.endorse-item-name-text');
      educations = $(response).find('.position.education');
      for (_j = 0, _len1 = educations.length; _j < _len1; _j++) {
        education = educations[_j];
        degree = new Object;
        degree.title = $(education).find('h4.details-education').find('.degree').text() || 'unavailable';
        degree.major = ($(education).find('h4.details-education').find('.major').text() || 'unavailable').trim();
        degree.institution = $(education).find('a.school-link').text() || 'unavailable';
        degree.start = $(education).find('.dtstart').attr('title') || '1010-01-01';
        degree.end = $(education).find('.dtstamp').attr('title') || $(education).find('.dtend').attr('title') || degree.start;
        linkedin_profile.education.push(degree);
      }
      return $.ajax({
        type: "POST",
        dataType: 'json',
        url: "https://78.47.41.184:8082/api/profiles/",       
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(linkedin_profile),
        headers: {
          Authorization: "Bearer " + App.access_token
        },
        success: function(response) {
          return console.log(response);
        },
        error: function(e) {
          console.log("error!");
          return console.log(e);
        }
      });
    }
  });
};
