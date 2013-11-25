var App, getNextPage, getProfile, initializeProfiles, visitCompanyPage, visitGroupPage;

App = {};

App.members_length = 0;

App.counter = 0;

document.addEventListener("DOMContentLoaded", function() {
  var data;
  data = new Object;
  data.client_secret = "67cddae206859d9bf7c0fedec018cb6a04d794b8";
  data.username = "scraper";
  data.grant_type = "password";
  data.password = "e09#6gEeD$8r";
  data.client_id = "43c02fa55c34579e74fd";
  data.kind = "getAccessToken";
  return chrome.runtime.sendMessage(data, function(response) {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      var type, url;
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

visitCompanyPage = function(url) {
  return console.log(url);
};

getProfile = function(linkedin_id, memberpage) {
  chrome.runtime.sendMessage({
    kind: "getProfile",
    linkedin_id: linkedin_id,
    memberpage: memberpage,
    member_number: App.counter
  }, function(response) {
    return console.log(response);
  });
  if (++App.counter === App.members_length) {
    return setTimeout((function() {
      return getNextPage(memberpage);
    }), 20000);
  }
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
