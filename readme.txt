Serverless feedback form using Bootstrap, JQuery, S3, Lambda, DynamoDB, SES, and API Gateway.


The links below provide the front end code for a serverless contact or feedback form
as well as the necessary steps in AWS to setup an API Gateway, IAM roles, Lambda function, and a DynamoDB Table.


The code in this repo is split into two folders, [S3] and [lambda].
[S3]:
All files and folders within the S3 folder will need to go within an S3 bucket configured for web hosting.
This serves the front end HTML as well as the clientside javascript files required for collecting the form
information and submitting the data to the API Gateway.
[Lambda]:
The lambda folder contains a single lambdafunc.js file. The contents of this file will be copied into
your lambda function from within the AWS console.


A brief walkthrough can be found at the following:
http://feedback.kylemunz.com/how-its-done/


Credits::
By no means did I come up with all of this by myself. I simply integrated the ideas from the three links found below.

Bootstrap Jquery form source:
http://myprogrammingblog.com/2013/08/27/how-to-make-a-contact-form-with-bootstrap-3-jqueryphphtml5jqbootstrapvalidation/

S3 Static Website Hosting:
http://docs.aws.amazon.com/gettingstarted/latest/swh/website-hosting-intro.html

Lambda/DynamoDB/API Gateway walk through:
http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html
