chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.access_token != undefined)      
      $.ajax({
        type: "POST",
        url: 'https://78.47.41.184:8082/api/profiles',
        data: JSON.stringify(request),
        headers: { 'Authorization':  'Bearer ' + request.access_token},
        success: function(response) {
          console.log('success!');
          console.log(response);
          sendResponse({farewell: response});
        },
        error: function(e) {
          console.log('error!');
          console.log(e);
        }
      });
    else if (request.client_id != undefined )
      $.ajax({
        type: "POST",
        url: 'https://78.47.41.184:8082/oauth2/access_token/',
        data: $.param(request),
        success: function(response) {
          sendResponse({ access_token: response.access_token });
        }
      });
    return true;
  });