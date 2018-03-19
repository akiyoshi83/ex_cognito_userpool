pushd ./scripts
# AWS SDK
curl -O https://raw.githubusercontent.com/aws/aws-sdk-js/v2.211.0/dist/aws-sdk.min.js
# Cognito Sync
curl -P https://raw.githubusercontent.com/aws/amazon-cognito-js/v1.0.0/dist/amazon-cognito.min.js
# Cognito Identity
curl -O https://raw.githubusercontent.com/aws/aws-amplify/aws-amplify%400.2.9/packages/amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js
# Cognito User Pool
curl -O https://raw.githubusercontent.com/aws/aws-amplify/aws-amplify%400.2.9/packages/amazon-cognito-identity-js/dist/aws-cognito-sdk.min.js
# Cognito User Pool Dependencies
curl -O http://www-cs-students.stanford.edu/%7Etjw/jsbn/jsbn.js
curl -O http://www-cs-students.stanford.edu/%7Etjw/jsbn/jsbn2.js
curl -O https://raw.githubusercontent.com/bitwiseshiftleft/sjcl/master/sjcl.js
popd
