$(function() {
  AWS.config.region = REGION;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID
  });

  AWSCognito.config.region = REGION
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID
  });

  $('[name="guest"]').on('click', guest);
  $('[name="signup"]').on('click', signup);
  $('[name="confirm"]').on('click', confirm);
  $('[name="resendConfirm"]').on('click', resendConfirm);
  $('[name="signin"]').on('click', signin);
  $('[name="signout"]').on('click', signout);
  $('[name="showSync"]').on('click', showSync);
  $('[name="setSync"]').on('click', setSync);

});


function guest() {
  AWS.config.credentials.get(function(){
    var accessKeyId = AWS.config.credentials.accessKeyId;
    var secretAccessKey = AWS.config.credentials.secretAccessKey;
    var sessionToken = AWS.config.credentials.sessionToken;
    var identityId = AWS.config.credentials.identityId;
    console.log('accessKeyId', accessKeyId);
    console.log('secretAccessKey', secretAccessKey);
    console.log('sessionToken', sessionToken);
    console.log('identityId', identityId);
  });
}

function signup() {
  var email = $('#signup [name="email"]').val().trim();
  var username = $('#signup [name="username"]').val().trim();
  var password = $('#signup [name="password"]').val().trim();

  var poolData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var attributeList = [];

  var dataEmail = {
    Name : 'email',
    Value : email
  };
  var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  userPool.signUp(username, password, attributeList, null, function(err, result) {
    if (err) {
      alert(err);
      return;
    }
    cognitoUser = result.user;
    console.log('[SIGNUP]', cognitoUser);
  });
}

function confirm() {
  var code = $('#confirm [name="code"]').val().trim();
  var username = $('#confirm [name="username"]').val().trim();

  var poolData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var userData = {
    Username : username,
    Pool : userPool
  };
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  cognitoUser.confirmRegistration(code, true, function(err, result) {
    if (err) {
      alert(err);
      return;
    }
    console.log('[CONFIRM]', result);
  });
}

function resendConfirm() {
  var code = $('#confirm [name="code"]').val().trim();
  var username = $('#confirm [name="username"]').val().trim();

  var poolData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var userData = {
    Username : username,
    Pool : userPool
  };
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  cognitoUser.resendConfirmationCode(function(err, result) {
    if (err) {
      alert(err);
      return;
    }
    console.log('[RESEND CONFIRM CODE]', result);
  });
}

function signin() {
  var username = $('#signin [name="username"]').val().trim();
  var password = $('#signin [name="password"]').val().trim();

  var poolData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var userData = {
    Username : username,
    Pool : userPool
  };
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  var authenticationData = {
    Username : username,
    Password : password
  };
  var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log('[SIGNIN]', result);
      // ユーザー登録・確認・ログイン後に取得した token をセット
      var logins = {};
      logins[PROVIDER] = result.getIdToken().getJwtToken();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        Logins : logins
      });
      // refresh 後にマネジメントコンソールで確認すると Identity が Linked になっている
      AWS.config.credentials.refresh(function(){
        console.log('[SIGNIN][REFRESH]', arguments);
      });
    },
    onFailure: function (err) {
      console.log(err);
    }
  });
}

function signout() {
  var poolData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
  };
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();

  cognitoUser.signOut();
  console.log('[SIGNOUT]');
}

function showSync() {
  //AWS.config.credentials.get(function() {
  //});
  client = new AWS.CognitoSyncManager();
  client.openOrCreateDataset('myDatasetName', function(err, dataset) {
    dataset.synchronize({
      onSuccess: function(dataset, newRecords) {
        console.log(arguments);
      },
      onFailure: function(err) {
        console.log(err);
      },
      onConflict: function(dataset, conflicts, callback) {
        console.log(arguments);

        var resolved = [];
        for (var i=0; i<conflicts.length; i++) {
          // Take remote version.
          resolved.push(conflicts[i].resolveWithRemoteRecord());
          // Or... take local version.
          // resolved.push(conflicts[i].resolveWithLocalRecord());
          // Or... use custom logic.
          // var newValue = conflicts[i].getRemoteRecord().getValue() + conflicts[i].getLocalRecord().getValue();
          // resolved.push(conflicts[i].resolveWithValue(newValue);
        }
        dataset.resolve(resolved, function() {
          return callback(true);
        });
      },
      onDatabaseDelete: function(dataset, datasetName, callback) {
        console.log(arguments);
        callback(true);
      },
      onDatasetMerged: function(dataset, datasetNames, callback) {
        console.log(arguments);
        callback(true);
      }
    });
    dataset.getAll(function(err, records) {
      if (err) {
        console.log(err);
      }
      console.log('[SHOW_SYNC]', records);
    });
  });
}

function setSync() {
  var key = $('#setSync [name="key"]').val();
  var val = $('#setSync [name="value"]').val();
  client = new AWS.CognitoSyncManager();
  client.openOrCreateDataset('myDatasetName', function(err, dataset) {
    dataset.put(key, val, function(err, record) {
      if (err) {
        console.log(err);
      }
      console.log('[PUT_SYNC]', record);
    });
  });
}

