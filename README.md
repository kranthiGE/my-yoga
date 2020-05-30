# my-yoga
An app for users to book yoga classes
Author: Kranthi Kiran  
Created On: 22-May-2020  
 
Register for your favourite Yoga class
***
## Features
- App has to 2 roles, student and teacher 
- App provides an option to register using their email id as a student/teacher 
- student users can view list of upcoming yoga sessions, their location and option to book for a class 
- teachers can add a new yoga class, number of participants allowed, location 
- students can opt out from a class registered 

## Design points:
- app to read username, email id, unique user id post registration and store in dynamodb 
- when a student signs in, app to show the list of yoga classes registered first and the available upcoming classes for booking 
- when a teacher signs in, there should be an option to  
    - add new yoga classes for booking 
    - also view the previously added classes, in an order of future date first and then past date 
#### API end points
- /createYogaClass
- /updateYogaClass
- /deleteYogaClass
- /updateYogaClassImageUrl
- /getYogaClasses - By teacher's user id
- /updateOutdatedClasses - A scheduled API to run everyday to update past dated yoga classes to complete (attribute done = false)
- /getYogaClassesForStudents - displays the upcoming classes list to all student users based on future date
- /bookAClass - allows students to book a class from a full list
- /getBookedClasses - shows the list of upcoming and past booking yoga classes for the log-in student user
#### Technical features
- Uses API gateway to publish all APIs and lambda functions as backend 
- Uses dynamodb single table design data model to store and retrieve all the data for teachers and students 
- Uses GSI and LSI of dynamodb 
- Validates any input request to a POST/PUT/DELETE API against a JSON schema at API gateway level 
- verifies input oauth2 authorization token using Asymmetric JWT token validation approach using Auth0, 3rd party service 
- Uses Serverless.yaml framework to create/update entire stack including function-wise IAM roles 
- Uses KMS keys and SecretsManager to store Auth0 and other app related secrets
- AWS Xray has been configured for distributed tracing 
***
## Getting Setup
***
### Installing project dependencies
```bash
npm install -g serverless
```
>_tip_: **npm i** is shorthand for **npm install**  
Set up a new user in IAM named "serverless" and save the access key and secret key.  
Configure serverless to use the AWS credentials you just set up:  
```bash
sls config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile serverless  
sls create --template  
sls create --template aws-nodejs-typescript --path serverless-udagram-app  
sls deploy -v --aws-profile serverless  
```
#### Install serverless plugins
```bash
sls plugin install --name serverless-aws-documentation
sls plugin install --name serverless-reqvalidator-plugin
sls plugin install --name serverless-iam-roles-per-function
sls plugin install --name serverless-dynamodb-local
sls plugin install --name serverless-offline
npm install --save-dev serverless-plugin-tracing
```
***
### References
https://www.alexdebrie.com/posts/dynamodb-single-table/ 
https://www.alexdebrie.com/posts/dynamodb-filter-expressions/ 