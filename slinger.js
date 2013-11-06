var App, getNextPage, getProfile, initializeProfiles, logConsole, visitCompanyPage, visitGroupPage;

App = {};

App.members_length = 0;

App.counter = 0;

App.access_token = '';

document.addEventListener("DOMContentLoaded", function() {
  var data;
  data = new Object;
  data.client_secret = '67cddae206859d9bf7c0fedec018cb6a04d794b8';
  data.username = 'scraper';
  data.grant_type = 'password';
  data.password = 'e09#6gEeD$8r';
  data.client_id = '43c02fa55c34579e74fd';
  return chrome.runtime.sendMessage(data, function(response) {
    App.access_token = response.access_token;
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      var type, url;
      type = void 0;
      url = void 0;
      url = tabs[0].url;
      if (url.match(/\bcompany\b/)) {
        type = "company";
      }
      if (url.match(/\groups\b/)) {
        type = "group";
      }
      return initializeProfiles(type, url);
    });
  });
});

initializeProfiles = function(type, url) {
  var new_url;
  switch (type) {
    case "group":
      new_url = 'http://www.linkedin.com/groups?viewMembers=&gid=' + url.split('gid=')[1].split('&')[0];
      return visitGroupPage(new_url);
    case "company":
      new_url = 'http://www.linkedin.com/vsearch/p?trk=rr_connectedness&f_CC=' + url.split('company/')[1].split('?')[0];
      return visitCompanyPage(new_url);
  }
};

visitGroupPage = function(url) {
  return $.ajax({
    type: "GET",
    url: url,
    success: function(response) {
      var linkedin_id, linkedin_ids, members, _i, _len, _results;
      members = $(response).find('#content').find('.member');
      App.members_length = members.length;
      App.counter = 0;
      linkedin_ids = members.map(function(x) {
        return members[x].getAttribute("id").split("-")[1];
      });
      _results = [];
      for (_i = 0, _len = linkedin_ids.length; _i < _len; _i++) {
        linkedin_id = linkedin_ids[_i];
        _results.push(getProfile(linkedin_id, response));
      }
      return _results;
    }
  });
};

getNextPage = function(response) {
  var new_next_page, new_url, next_page;
  next_page = $(response).find('.paginate').find('a').find('strong');
  new_next_page = next_page[1];
  if (!next_page[1]) {
    new_next_page = next_page[0];
  }
  if (new_next_page === void 0 || new_next_page.innerText.charCodeAt(0) === parseInt('171')) {

  } else {
    new_url = 'http://www.linkedin.com/' + $(new_next_page).parent()[0].getAttribute('href');
    return visitGroupPage(new_url);
  }
};

visitCompanyPage = function(url) {
  return console.log(url);
};

getProfile = function(linkedin_id, memberpage) {
  return $.ajax({
    type: "GET",
    url: "http://www.linkedin.com/profile/view?noScript=1&id=" + linkedin_id,
    success: function(response) {
      return logConsole(response, linkedin_id, memberpage);
    }
  });
};

logConsole = function(response, linkedin_id, memberpage) {
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
  linkedin_profile.connections = $(response).find('.member-connections').children().find('a').text().replace(/\+$/, '');
  linkedin_profile.linkedin_id = linkedin_id;
  positions = $(response).find('.position.experience');
  for (_i = 0, _len = positions.length; _i < _len; _i++) {
    position = positions[_i];
    experience_position = new Object;
    experience_position.title = ($(position).find('strong.title').find('a')[0] || 'undefined').innerText;
    experience_position.company = ($(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0] || 'undefined').innerText;
    experience_position.start = ($(position).find('.dtstart')[0] || 'undefined').innerText;
    experience_position.end = ($(position).find('.dtstamp')[0] || $(position).find('.dtend')[0] || 'undefined').innerText;
    linkedin_profile.experience.push(experience_position);
  }
  skills = $(response).find('.endorse-item-name-text');
  educations = $(response).find('.position.education');
  for (_j = 0, _len1 = educations.length; _j < _len1; _j++) {
    education = educations[_j];
    degree = new Object;
    degree.title = ($(education).find('h4.details-education').find('.degree') || 'undefined').innerText;
    degree.major = ($(education).find('h4.details-education').find('.major') || 'undefined').innerText;
    degree.institution = ($(education).find('a.school-link')[0] || 'undefined').innerText;
    start = ($(education).find('.dtstart')[0] || 'undefined').innerText;
    end = ($(education).find('.dtstamp')[0] || $(education).find('.dtend')[0] || 'undefined').innerText;
    linkedin_profile.education.push(degree);
  }
  linkedin_profile.access_token = App.access_token;
  chrome.runtime.sendMessage(linkedin_profile, function(response) {
    return alert(response.farewell);
  });
  if (++App.counter === App.members_length) {
    return getNextPage(memberpage);
  }
};
