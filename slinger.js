var getProfile, initializeProfiles, logConsole, scrapeProfiles;

initializeProfiles = function() {
  return ["3451256", "82430194"];
};

scrapeProfiles = function() {
  var linkedin_id, _i, _len, _ref, _results;
  _ref = initializeProfiles();
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    linkedin_id = _ref[_i];
    _results.push(getProfile(linkedin_id));
  }
  return _results;
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
    _results.push($("#positions-" + linkedin_id).append("<p><b>" + title + "</b> - <i>" + company + "</i></p>"));
  }
  return _results;
};

document.addEventListener("DOMContentLoaded", function() {
  return scrapeProfiles();
});
