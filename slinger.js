var getProfile, initializeProfiles, logConsole, visitCompanyPage, visitGroupPage;

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
      var linkedin_id, linkedin_ids, members, new_next_page, new_url, next_page, _i, _len;
      members = $(response).find('#content').find('.member');
      linkedin_ids = members.map(function(x) {
        return members[x].getAttribute("id").split("-")[1];
      });
      for (_i = 0, _len = linkedin_ids.length; _i < _len; _i++) {
        linkedin_id = linkedin_ids[_i];
        getProfile(linkedin_id);
      }
      next_page = $(response).find('.paginate').find('a').find('strong');
      new_next_page = next_page[1];
      if (!next_page[1]) {
        new_next_page = next_page[0];
      }
      if (new_next_page.innerText.charCodeAt(0) !== '171') {
        new_url = 'http://www.linkedin.com/' + $(new_next_page).parent()[0].getAttribute('href');
        return visitGroupPage(new_url);
      }
    }
  });
};

visitCompanyPage = function(url) {
  return console.log(url);
};

getProfile = function(linkedin_id) {
  return $.ajax({
    type: "GET",
    url: "http://www.linkedin.com/profile/view?noScript=1&id=" + linkedin_id,
    success: function(response) {
      return logConsole(response, linkedin_id);
    }
  });
};

logConsole = function(response, linkedin_id) {
  var company, family_name, given_name, member, position, positions, professional_title, title, _i, _len, _results;
  member = $(response).find("#member-" + linkedin_id);
  given_name = $(member).find('span.given-name')[0].innerText;
  family_name = $(member).find('span.family-name')[0].innerText;
  professional_title = $(member).find('p.title')[0].innerText;
  $('#profiles').append("<h2 id='profile-" + given_name + "'> " + given_name + " " + family_name + " - " + professional_title + "</h2><div id='positions-" + linkedin_id + "'><h3>Positions:</h3></div>");
  positions = $(response).find('.position');
  _results = [];
  for (_i = 0, _len = positions.length; _i < _len; _i++) {
    position = positions[_i];
    title = $(position).find('strong.title').find('a')[0].innerText;
    company = ($(position).find('.org.summary')[0] || $(position).find('h4').find('a')[0]).innerText;
    $("#positions-" + linkedin_id).append("<p><b>" + title + "</b> - <i>" + company + "</i></p>");
    _results.push(document.body.match(/\bprofile\b,\bview?id=\b/));
  }
  return _results;
};
