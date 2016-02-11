Serverless feedback form using Bootstrap, JQuery, S3, Lambda, DynamoDB, and API Gateway.
The walkthroughs below provide the front end code for a serverless contact or feedback form
as well as the necessary steps in AWS to setup an API Gateway, IAM roles, Lambda function, and a DynamoDB Table.

The code in this repo is split into two folders, S3 and lambda.
S3:
All files and folders within the S3 folder will need to go within an S3 bucket configured for web hosting.
http://docs.aws.amazon.com/gettingstarted/latest/swh/website-hosting-intro.html
This serves the front end HTML as well as the clientside javascript files required for collecting the form
information and submitting the data to the API Gateway.
Lambda:
The lambda folder contains a single lambdafunc.js file. The contents of this file will be copied into
your lambda function from within the AWS console.

Credits given below::
Bootstrap Jquery form source:
http://myprogrammingblog.com/2013/08/27/how-to-make-a-contact-form-with-bootstrap-3-jqueryphphtml5jqbootstrapvalidation/

Lambda/DynamoDB/API Gateway walk through:
http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html
