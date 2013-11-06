chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  unless request.access_token is `undefined`
    $.ajax
      type: "POST"
      url: "https://78.47.41.184:8082/api/profiles"
      data: $.param(linkedin_profile)
      headers:
        Authorization: "Bearer ede0a5ee854a1c2a91d7f332b317288c32e88d21"

      success: (response) ->
        sendResponse farewell: response

  else unless request.client_id is `undefined`
    $.ajax
      type: "POST"
      url: "https://78.47.41.184:8082/oauth2/access_token/"
      data: $.param(request)
      success: (response) ->
        sendResponse access_token: response.access_token

