var App, getNextPage, getProfile, initializeProfiles, logConsole, visitCompanyPage, visitGroupPage;

App = {};

App.scrape_results = '';

App.members_length = 0;

App.counter = 0;

document.addEventListener("DOMContentLoaded", function() {
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
  var a, derp, new_next_page, new_url, next_page;
  next_page = $(response).find('.paginate').find('a').find('strong');
  new_next_page = next_page[1];
  if (!next_page[1]) {
    new_next_page = next_page[0];
  }
  console.log(new_next_page.innerText.charCodeAt(0) == '171')
  if (new_next_page === void 0 || new_next_page.innerText.charCodeAt(0) === parseInt('171')) {
    derp = new Blob([App.scrape_results], {
      type: "text/plain"
    });
    a = document.createElement("a");
    a.href = window.URL.createObjectURL(derp);
    a.download = "results.html";
    a.textContent = "Download file!";
    return document.body.appendChild(a);
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
  var company, company_profile, education, educations, end, family_name, given_name, member, position, positions, professional_title, profile_pic, school, skill, skills, start, title, _i, _j, _k, _len, _len1, _len2;
  member = $(response).find("#member-" + linkedin_id);
  given_name = $(member).find('span.given-name')[0].innerText;
  family_name = $(member).find('span.family-name')[0].innerText;
  professional_title = $(member).find('p.title')[0].innerText;
  profile_pic = $(response).find('#profile-picture').find('img').attr('src') || 'http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_100x100_v1.png';
  App.scrape_results = App.scrape_results + ("<h2 id='profile-" + given_name + "'> " + given_name + " " + family_name + " - " + professional_title + "</h2>  <a href='" + profile_pic + "'><img src='" + profile_pic + "'></a>  <div id='positions-" + linkedin_id + "'><h3>Positions:</h3>");
  positions = $(response).find('.position.experience');
  for (_i = 0, _len = positions.length; _i < _len; _i++) {
    position = positions[_i];
    title = $(position).find('strong.title').find('a')[0].innerText;
    company = ($(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0]).innerText;
    company_profile = $(position).find('company-profile');
    end = ($(position).find('.dtstamp')[0] || $(position).find('.dtend')[0] || 'undefined').innerText;
    App.scrape_results = App.scrape_results + ("<p><b>" + title + "</b> - <i>" + company + "</i></p>    <p><b>Start: </b> " + start + "</p>    <p><b>End: </b> " + end + "</p>");
  }
  App.scrape_results = App.scrape_results + "</div><h3>Skills:</h3><p>";
  skills = $(response).find('.endorse-item-name-text');
  for (_j = 0, _len1 = skills.length; _j < _len1; _j++) {
    skill = skills[_j];
    App.scrape_results = App.scrape_results + ("" + skill.innerText + ", ");
  }
  App.scrape_results = App.scrape_results + "</p><h3>Education:</h3>";
  educations = $(response).find('.position.education');
  for (_k = 0, _len2 = educations.length; _k < _len2; _k++) {
    education = educations[_k];
    title = $(education).find('h4.details-education');
    school = $(education).find('a.school-link')[0].innerText;
    start = ($(education).find('.dtstart')[0] || 'undefined').innerText;
    end = ($(education).find('.dtstamp')[0] || $(education).find('.dtend')[0] || 'undefined').innerText;
    App.scrape_results = App.scrape_results + ("<p><b>" + title[0].innerHTML + "</b> - <i>" + school + "</i></p>    <p><b>Start: </b> " + start + "</p>    <p><b>End: </b> " + end + "</p>");
  }
  App.scrape_results = App.scrape_results + "</div>";
  if (++App.counter === App.members_length) {
    return getNextPage(memberpage);
  }
};
