

function interceptData() {
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.innerHTML = `
  (function() {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function(method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function() {
        this.addEventListener('load', function() {
            if (this.url.includes('friendship')) {
                var dataDOMElement = document.createElement('div');
                dataDOMElement.id = '__interceptedData';
                dataDOMElement.innerText = this.response;
                dataDOMElement.style.height = 0;
                dataDOMElement.style.overflow = 'hidden';
                document.body.appendChild(dataDOMElement);

                const { users } = JSON.parse(this.response)

                if (!users) return

                const processedUsers = users.map(user => {
                  const { pk, username, full_name, is_private, is_verified, profile_pic_id, profile_pic_url, latest_reel_media } = user
                  return {
                    id: pk, username, fullName: full_name, isPrivate: is_private, isVerified: is_verified, 
                    picId: profile_pic_id, picUrl: profile_pic_url, hasStory: latest_reel_media !== 0
                  }
                })
                
                saveUsersData(processedUsers)
            }               
        });
        return send.apply(this, arguments);
    };
  })()
  
  function saveUsersData(users) {
    console.log(users)
    
    let url = window.location.href
    let splitUrl = url.split("/")
    let username = splitUrl[3]

    users.forEach((user, i) => {

      // sets the account's owner username
      user.originUsername = username

      setTimeout(function(){ 
        var xmlhttp = new XMLHttpRequest();
  
        var url = "http://127.0.0.1:5000/save";
        var params = "";
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(user));
      }, i * 280);
    })
  };
  `

  document.head.prepend(xhrOverrideScript);
}

function checkForDOM() {
  if (document.body && document.head) {
    interceptData();
  } else {
    requestIdleCallback(checkForDOM);
  }
}
requestIdleCallback(checkForDOM);
